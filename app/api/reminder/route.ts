import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function createSupabaseServer() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServer()
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, leads(name, phone)')
    .eq('status', 'pending')
    .lt('created_at', cutoff)
    .lt('reminder_count', 3)

  if (!invoices || invoices.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No pending invoices' })
  }

  let sent = 0
  for (const invoice of invoices) {
    const lead = invoice.leads as any
    if (!lead?.phone) continue

    const message = `Halo ${lead.name}, invoice ${invoice.invoice_number} senilai Rp${Number(invoice.total_amount).toLocaleString('id-ID')} masih menunggu pembayaran. ${invoice.payment_url ? `Silakan bayar di: ${invoice.payment_url}` : 'Mohon segera lakukan pembayaran.'}`

    console.log(`[Reminder] Sending to ${lead.phone}: ${message}`)

    await supabase.from('invoices').update({
      reminder_count: (invoice.reminder_count || 0) + 1,
      last_reminder_at: new Date().toISOString(),
    }).eq('id', invoice.id)

    sent++
  }

  return NextResponse.json({ sent, total: invoices.length })
}
