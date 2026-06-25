// app/invoice/[slug]/page.tsx
// Public Invoice Link — bisa diakses tanpa login
// URL: /invoice/INV-XXXXXXXX atau /invoice/<public_token>

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

interface InvoiceItem {
  name: string
  qty: number
  price: number
  note?: string
}

interface Invoice {
  id: string
  slug: string
  public_token: string
  status: string
  due_date: string | null
  paid_at: string | null
  created_at: string
  items: InvoiceItem[]
  subtotal: number
  discount: number
  total: number
  payment_method?: string
  payment_account?: string
  notes: string | null
  leads: { name: string; phone: string } | null
  workspace_id: string
}

function createSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
  )
}

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Menunggu Pembayaran', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  paid:     { label: 'Lunas',               color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30' },
  overdue:  { label: 'Jatuh Tempo',         color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30' },
  cancelled:{ label: 'Dibatalkan',          color: 'text-muted-foreground', bg: 'bg-muted/20 border-border' },
}

export default async function PublicInvoicePage({ params }: { params: { slug: string } }) {
  const supabase = createSupabase()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, leads(name, phone)')
    .or(`slug.eq.${params.slug},public_token.eq.${params.slug}`)
    .single() as { data: Invoice | null }

  if (!invoice) notFound()

  const { data: settings } = await supabase
    .from('ai_settings')
    .select('business_name')
    .eq('workspace_id', invoice.workspace_id)
    .single()

  const businessName = settings?.business_name ?? 'Jualin Business'
  const status = statusConfig[invoice.status] ?? { label: invoice.status, color: 'text-foreground', bg: 'bg-muted/20 border-border' }
  const items: InvoiceItem[] = Array.isArray(invoice.items) ? invoice.items : []
  const isPaid = invoice.status === 'paid'

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-1">Invoice dari</p>
          <h1 className="text-2xl font-bold text-foreground">{businessName}</h1>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
          {/* Status banner */}
          <div className={`border-b border-border px-6 py-4 flex items-center justify-between ${status.bg}`}>
            <div>
              <p className="text-xs text-muted-foreground">Nomor Invoice</p>
              <p className="font-mono font-bold text-foreground">{invoice.slug ?? invoice.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <span className={`text-sm font-semibold ${status.color}`}>{status.label}</span>
              {isPaid && invoice.paid_at && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Lunas {new Date(invoice.paid_at).toLocaleDateString('id-ID')}
                </p>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Customer info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ditagihkan kepada</p>
                <p className="font-semibold text-foreground">{invoice.leads?.name ?? 'Customer'}</p>
                {invoice.leads?.phone && <p className="text-sm text-muted-foreground">{invoice.leads.phone}</p>}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tanggal Invoice</p>
                <p className="text-sm">{new Date(invoice.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                {invoice.due_date && (
                  <>
                    <p className="text-xs text-muted-foreground mt-2 mb-1">Jatuh Tempo</p>
                    <p className={`text-sm ${invoice.status === 'overdue' ? 'text-red-400 font-semibold' : ''}`}>
                      {new Date(invoice.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide font-medium">Detail Tagihan</p>
              <div className="space-y-0">
                {items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 py-3 border-b border-border/50 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.name}</p>
                      {item.note && <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{item.qty} x {fmt(item.price)}</p>
                    </div>
                    <p className="font-semibold text-foreground">{fmt(item.qty * item.price)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-muted/30 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{fmt(invoice.subtotal ?? 0)}</span>
              </div>
              {(invoice.discount ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Diskon</span>
                  <span>-{fmt(invoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t border-border pt-2 mt-2">
                <span>Total Tagihan</span>
                <span className="text-primary">{fmt(invoice.total ?? 0)}</span>
              </div>
            </div>

            {/* Payment info */}
            {!isPaid && invoice.payment_method && (
              <div className="border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide font-medium">Cara Pembayaran</p>
                <p className="font-medium">{invoice.payment_method}</p>
                {invoice.payment_account && (
                  <p className="text-sm font-mono bg-muted/30 rounded px-2 py-1 mt-1 inline-block">{invoice.payment_account}</p>
                )}
              </div>
            )}

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-muted/20 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Catatan</p>
                <p className="text-sm text-foreground">{invoice.notes}</p>
              </div>
            )}

            {/* Payment proof upload CTA */}
            {!isPaid && invoice.status !== 'cancelled' && (
              <div className="border border-primary/30 bg-primary/5 rounded-xl p-5 text-center space-y-3">
                <p className="font-semibold text-foreground">Sudah Transfer?</p>
                <p className="text-sm text-muted-foreground">
                  Kirim bukti pembayaran via WhatsApp agar pesanan segera diproses.
                </p>
                {invoice.leads?.phone && (
                  <a
                    href={`https://wa.me/${invoice.leads.phone.replace(/\D/g, '')}?text=Halo, saya sudah transfer untuk Invoice ${invoice.slug}. Ini bukti bayarnya:`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Kirim Bukti Bayar via WhatsApp
                  </a>
                )}
              </div>
            )}

            {isPaid && (
              <div className="border border-green-500/30 bg-green-500/10 rounded-xl p-5 text-center">
                <p className="text-green-400 font-bold text-lg">✓ Pembayaran Lunas</p>
                <p className="text-sm text-muted-foreground mt-1">Terima kasih! Pesanan sedang diproses.</p>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Invoice dibuat oleh {businessName} menggunakan Jualin.ai
        </p>
      </div>
    </main>
  )
}
