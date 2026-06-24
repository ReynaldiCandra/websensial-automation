'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type ProofStatus = 'pending' | 'verified' | 'rejected'

interface PaymentProof {
  id: string
  image_url: string
  status: ProofStatus
  created_at: string
  rejection_reason?: string
  invoice_id: string
  lead_id: string
  invoices?: { invoice_number: string; total_amount: number }
  leads?: { name: string; phone: string }
}

export default function PaymentProofPage() {
  const supabase = createClient()
  const [proofs, setProofs] = useState<PaymentProof[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | ProofStatus>('all')
  const [preview, setPreview] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<{ id: string; invoiceId: string; leadId: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => { fetchProofs() }, [])

  async function fetchProofs() {
    setLoading(true)
    const { data } = await supabase
      .from('payment_proofs')
      .select('*, invoices(invoice_number, total_amount), leads(name, phone)')
      .order('created_at', { ascending: false })
    if (data) setProofs(data as PaymentProof[])
    setLoading(false)
  }

  async function handleVerify(proof: PaymentProof) {
    await supabase.from('payment_proofs').update({ status: 'verified', reviewed_at: new Date().toISOString() }).eq('id', proof.id)
    await supabase.from('invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', proof.invoice_id)
    await supabase.from('leads').update({ pipeline_stage: 'won' }).eq('id', proof.lead_id)
    setProofs(prev => prev.map(p => p.id === proof.id ? { ...p, status: 'verified' } : p))
  }

  async function handleReject() {
    if (!rejectModal) return
    await supabase.from('payment_proofs').update({ status: 'rejected', rejection_reason: rejectReason, reviewed_at: new Date().toISOString() }).eq('id', rejectModal.id)
    await supabase.from('invoices').update({ status: 'pending' }).eq('id', rejectModal.invoiceId)
    setProofs(prev => prev.map(p => p.id === rejectModal.id ? { ...p, status: 'rejected', rejection_reason: rejectReason } : p))
    setRejectModal(null)
    setRejectReason('')
  }

  const filtered = filter === 'all' ? proofs : proofs.filter(p => p.status === filter)
  const pendingCount = proofs.filter(p => p.status === 'pending').length

  const statusStyle = (s: ProofStatus) => {
    if (s === 'verified') return { background: '#E1F5EE', color: '#0F6E56' }
    if (s === 'rejected') return { background: '#FCEBEB', color: '#A32D2D' }
    return { background: '#FAEEDA', color: '#854F0B' }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Memuat...</div>

  return (
    <div style={{ padding: 24 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>Bukti Pembayaran</h1>
          {pendingCount > 0 && (
            <span style={{ background: '#FAEEDA', color: '#854F0B', fontSize: 12, padding: '2px 10px', borderRadius: 99, fontWeight: 500, marginTop: 4, display: 'inline-block' }}>
              {pendingCount} menunggu review
            </span>
          )}
        </div>
        <button onClick={fetchProofs} style={{ padding: '8px 16px', border: '0.5px solid #e5e7eb', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['all', 'pending', 'verified', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 14px', borderRadius: 8, border: `0.5px solid ${filter === f ? '#1D9E75' : '#e5e7eb'}`, background: filter === f ? '#E1F5EE' : 'white', color: filter === f ? '#0F6E56' : '#374151', fontSize: 13, cursor: 'pointer', fontWeight: filter === f ? 500 : 400 }}>
            {f === 'all' ? 'Semua' : f === 'pending' ? 'Pending' : f === 'verified' ? 'Terverifikasi' : 'Ditolak'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Tidak ada bukti pembayaran</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(proof => (
            <div key={proof.id} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: 160, background: '#f9fafb', cursor: 'pointer' }} onClick={() => setPreview(proof.image_url)}>
                <img src={proof.image_url} alt="Bukti bayar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 11, padding: '2px 8px', borderRadius: 99 }}>
                  Klik untuk preview
                </div>
              </div>
              <div style={{ padding: 14 }}>
                <p style={{ fontWeight: 500, fontSize: 14, margin: '0 0 4px' }}>{proof.leads?.name || 'Unknown'}</p>
                <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 4px' }}>{proof.invoices?.invoice_number}</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#111', margin: '0 0 8px' }}>
                  Rp{Number(proof.invoices?.total_amount || 0).toLocaleString('id-ID')}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ ...statusStyle(proof.status), fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 500 }}>
                    {proof.status === 'pending' ? 'Pending' : proof.status === 'verified' ? 'Terverifikasi' : 'Ditolak'}
                  </span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>
                    {new Date(proof.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
                {proof.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleVerify(proof)}
                      style={{ flex: 1, padding: '7px 0', background: '#E1F5EE', color: '#0F6E56', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                      Verifikasi ✓
                    </button>
                    <button onClick={() => setRejectModal({ id: proof.id, invoiceId: proof.invoice_id, leadId: proof.lead_id })}
                      style={{ flex: 1, padding: '7px 0', background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                      Tolak ✗
                    </button>
              </div>
                )}
                {proof.status === 'rejected' && proof.rejection_reason && (
                  <p style={{ fontSize: 11, color: '#A32D2D', marginTop: 6 }}>Alasan: {proof.rejection_reason}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div onClick={() => setPreview(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, cursor: 'pointer' }}>
          <img src={preview} alt="Preview" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8 }} />
        </div>
      )}

      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 24, width: 400 }}>
            <h3 style={{ fontWeight: 500, marginBottom: 12 }}>Alasan Penolakan</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Tulis alasan penolakan..."
              style={{ width: '100%', padding: 10, border: '0.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, minHeight: 80, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setRejectModal(null)} style={{ flex: 1, padding: '8px 0', border: '0.5px solid #e5e7eb', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 13 }}>
                Batal
              </button>
              <button onClick={handleReject} style={{ flex: 1, padding: '8px 0', background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer', fontSize: 13 }}>
                Tolak Bukti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
