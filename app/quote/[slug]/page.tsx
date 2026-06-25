// app/quote/[slug]/page.tsx
// Public Quotation Link — bisa diakses tanpa login
// URL: /quote/QUO-XXXXXXXX atau /quote/<public_token>

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

interface QuoteItem {
  name: string
  qty: number
  price: number
  note?: string
}

interface Quotation {
  id: string
  slug: string
  public_token: string
  status: string
  expires_at: string | null
  created_at: string
  items: QuoteItem[]
  subtotal: number
  discount: number
  total: number
  notes: string | null
  leads: { name: string; phone: string } | null
  workspace_id: string
  business_name?: string
}

function createSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // pakai service role untuk bypass RLS di public page
    { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
  )
}

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const statusLabel: Record<string, { label: string; color: string }> = {
  draft:    { label: 'Draft',    color: 'text-muted-foreground' },
  sent:     { label: 'Terkirim', color: 'text-blue-400' },
  accepted: { label: 'Diterima', color: 'text-green-400' },
  rejected: { label: 'Ditolak',  color: 'text-red-400' },
  expired:  { label: 'Expired',  color: 'text-yellow-400' },
}

export default async function PublicQuotePage({ params }: { params: { slug: string } }) {
  const supabase = createSupabase()

  const { data: quote } = await supabase
    .from('quotations')
    .select('*, leads(name, phone)')
    .or(`slug.eq.${params.slug},public_token.eq.${params.slug}`)
    .single() as { data: Quotation | null }

  if (!quote) notFound()

  // Ambil nama bisnis dari ai_settings
  const { data: settings } = await supabase
    .from('ai_settings')
    .select('business_name')
    .eq('workspace_id', quote.workspace_id)
    .single()

  const businessName = settings?.business_name ?? 'Jualin Business'
  const status = statusLabel[quote.status] ?? { label: quote.status, color: 'text-foreground' }
  const items: QuoteItem[] = Array.isArray(quote.items) ? quote.items : []

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-1">Penawaran dari</p>
          <h1 className="text-2xl font-bold text-foreground">{businessName}</h1>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
          {/* Top bar */}
          <div className="bg-primary/10 border-b border-border px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Nomor Penawaran</p>
              <p className="font-mono font-bold text-foreground">{quote.slug ?? quote.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <span className={`text-sm font-semibold ${status.color}`}>{status.label}</span>
          </div>

          <div className="p-6 space-y-6">
            {/* Customer info */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Kepada</p>
              <p className="font-semibold text-foreground">{quote.leads?.name ?? 'Customer'}</p>
              {quote.leads?.phone && <p className="text-sm text-muted-foreground">{quote.leads.phone}</p>}
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Tanggal</p>
                <p>{new Date(quote.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              {quote.expires_at && (
                <div>
                  <p className="text-xs text-muted-foreground">Berlaku Sampai</p>
                  <p>{new Date(quote.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div>
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide font-medium">Rincian Produk</p>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 py-3 border-b border-border/50 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.name}</p>
                      {item.note && <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{item.qty}x × {fmt(item.price)}</p>
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
                <span>{fmt(quote.subtotal ?? 0)}</span>
              </div>
              {(quote.discount ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Diskon</span>
                  <span>-{fmt(quote.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t border-border pt-2 mt-2">
                <span>Total Penawaran</span>
                <span className="text-primary">{fmt(quote.total ?? 0)}</span>
              </div>
            </div>

            {/* Notes */}
            {quote.notes && (
              <div className="bg-muted/20 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Catatan</p>
                <p className="text-sm text-foreground">{quote.notes}</p>
              </div>
            )}

            {/* CTA */}
            {quote.status === 'sent' && (
              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground mb-3">
                  Tertarik dengan penawaran ini? Hubungi kami via WhatsApp untuk konfirmasi.
                </p>
                {quote.leads?.phone && (
                  <a
                    href={`https://wa.me/${quote.leads.phone.replace(/\D/g, '')}?text=Halo, saya mau konfirmasi penawaran ${quote.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Hubungi via WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Dokumen ini dibuat oleh {businessName} menggunakan Jualin.ai
        </p>
      </div>
    </main>
  )
}
