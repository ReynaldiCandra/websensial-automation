import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createPaymentLink, checkPaymentStatus } from '@/lib/midtrans'
import crypto from 'crypto'

function createSupabaseServer() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') || 'create'

  if (action === 'webhook') {
    const body = await req.json()
    const { order_id, status_code, gross_amount, signature_key, transaction_status } = body
    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    const expectedSig = crypto.createHash('sha512').update(`${order_id}${status_code}${gross_amount}${serverKey}`).digest('hex')
    if (signature_key !== expectedSig) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

    const supabase = createSupabaseServer()
    const invoiceId = order_id.split('-')[1]
    if (['capture', 'settlement'].includes(transaction_status)) {
      await supabase.from('invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', invoiceId)
      await supabase.from('leads').update({ pipeline_stage: 'bukti_bayar' }).eq('id',
        (await supabase.from('invoices').select('lead_id').eq('id', invoiceId).single()).data?.lead_id
      )
    }
    return NextResponse.json({ ok: true })
  }

  if (action === 'proof') {
    const body = await req.json()
    const { invoiceId, imageBase64, leadId } = body
    const supabase = createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const fileName = `${user.id}/${invoiceId}-${Date.now()}.jpg`
    const buffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    await supabase.storage.from('payment-proofs').upload(fileName, buffer, { contentType: 'image/jpeg' })
    const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName)

    await supabase.from('payment_proofs').insert({
      invoice_id: invoiceId, lead_id: leadId, user_id: user.id,
      image_url: urlData.publicUrl, status: 'pending'
    })
    await supabase.from('invoices').update({ status: 'reviewing' }).eq('id', invoiceId)
    return NextResponse.json({ ok: true, imageUrl: urlData.publicUrl })
  }

  const body = await req.json()
  const { invoiceId } = body
  const supabase = createSupabaseServer()
  const { data: invoice } = await supabase.from('invoices').select('*').eq('id', invoiceId).single()
  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  const result = await createPaymentLink({
    id: invoice.id, amount: invoice.total_amount,
    customerName: invoice.customer_name || 'Customer',
    items: invoice.items || [{ name: 'Pembayaran', price: invoice.total_amount, quantity: 1 }],
  })

  await supabase.from('invoices').update({ payment_url: result.paymentUrl, midtrans_order_id: result.orderId }).eq('id', invoiceId)
  return NextResponse.json(result)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const invoiceId = searchParams.get('invoiceId')
  if (!invoiceId) return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 })

  const supabase = createSupabaseServer()
  const { data: invoice } = await supabase.from('invoices').select('midtrans_order_id,status').eq('id', invoiceId).single()
  if (!invoice?.midtrans_order_id) return NextResponse.json({ status: 'no_payment_link' })

  const status = await checkPaymentStatus(invoice.midtrans_order_id)
  return NextResponse.json(status)
}
