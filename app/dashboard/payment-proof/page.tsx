'use client'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'

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
  const [preview, setPreview] = useState<PaymentProof | null>(null)
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
    setProofs(prev => prev.map(p => p.id === rejectModal.id ? { ...p, status: 'rejected', rejection_reason: rejectReason } : p))
    setRejectModal(null)
    setRejectReason('')
  }

  const filtered = filter === 'all' ? proofs : proofs.filter(p => p.status === filter)
  const stats = {
    pending: proofs.filter(p => p.status === 'pending').length,
    verified: proofs.filter(p => p.status === 'verified').length,
    rejected: proofs.filter(p => p.status === 'rejected').length,
  }

  return (
  <DashboardLayout>
    <div style={{ padding: '24px', background: '#0D0D12', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#E2E8F0', margin: '0 0 8px' }}>
          Bukti Pembayaran
        </h1>
        <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>
          Review dan verifikasi bukti pembayaran dari customer
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Pending', value: stats.pending, icon: Clock, color: '#F59E0B' },
          { label: 'Verified', value: stats.verified, icon: CheckCircle, color: '#10B981' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: '#EF4444' },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => (e.currentTarget as any).style.borderColor = stat.color} onMouseLeave={e => (e.currentTarget as any).style.borderColor = 'rgba(255,255,255,0.06)'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Icon size={20} style={{ color: stat.color }} />
                <p style={{ fontSize: 12, color: '#64748B', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>
                  {stat.label}
                </p>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#E2E8F0', margin: 0 }}>{stat.value}</p>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12 }}>
        {(['all', 'pending', 'verified', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: filter === f ? '#6C3BF5' : 'transparent',
              color: filter === f ? '#FFF' : '#64748B',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>Loading proofs...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>
          <p style={{ fontSize: 14, margin: 0 }}>Tidak ada bukti pembayaran {filter !== 'all' && `dengan status ${filter}`}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(proof => (
            <div key={proof.id} style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden', transition: 'all 0.2s' }} onMouseEnter={e => (e.currentTarget as any).style.borderColor = '#6C3BF5'} onMouseLeave={e => (e.currentTarget as any).style.borderColor = 'rgba(255,255,255,0.06)'}>
              <div style={{ position: 'relative', background: '#0D0D12', aspect: '1/1', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setPreview(proof)}>
                <img src={proof.image_url} alt="proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget as any).style.opacity = 1} onMouseLeave={e => (e.currentTarget as any).style.opacity = 0}>
                  <Eye size={32} style={{ color: '#FFF' }} />
                </div>
              </div>

              <div style={{ padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', margin: '0 0 2px' }}>
                      {proof.leads?.name || 'Unknown'}
                    </p>
                    <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>
                      {proof.invoices?.invoice_number}
                    </p>
                  </div>
                  <span style={{
                    marginLeft: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: proof.status === 'pending' ? '#F59E0B33' : proof.status === 'verified' ? '#10B98133' : '#EF444433',
                    color: proof.status === 'pending' ? '#F59E0B' : proof.status === 'verified' ? '#10B981' : '#EF4444',
                  }}>
                    {proof.status === 'pending' ? '⏳ Pending' : proof.status === 'verified' ? '✅ Verified' : '❌ Rejected'}
                  </span>
                </div>

                {proof.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => handleVerify(proof)} style={{ flex: 1, padding: '8px 12px', background: '#10B981', border: 'none', borderRadius: 6, color: '#FFF', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Verify
                    </button>
                    <button onClick={() => setRejectModal({ id: proof.id, invoiceId: proof.invoice_id, leadId: proof.lead_id })} style={{ flex: 1, padding: '8px 12px', background: '#EF4444', border: 'none', borderRadius: 6, color: '#FFF', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Reject
                    </button>
                  </div>
                )}

                {proof.status === 'rejected' && proof.rejection_reason && (
                  <div style={{ marginTop: 8, padding: 8, background: '#EF444422', borderRadius: 6, fontSize: 11, color: '#FCA5A5' }}>
                    <strong>Reason:</strong> {proof.rejection_reason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => setPreview(null)}>
          <div style={{ position: 'relative', maxWidth: 600, width: '90%', maxHeight: 600 }} onClick={e => e.stopPropagation()}>
            <img src={preview.image_url} alt="preview" style={{ width: '100%', borderRadius: 12 }} />
            <button onClick={() => setPreview(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: 8, color: '#FFF', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => { setRejectModal(null); setRejectReason('') }}>
          <div style={{ background: '#111118', borderRadius: 12, padding: 24, maxWidth: 400, width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0', margin: '0 0 16px' }}>Reject Payment Proof</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Alasan penolakan..." style={{ width: '100%', padding: 12, background: '#0D0D12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, color: '#E2E8F0', fontSize: 13, minHeight: 100, fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={() => { setRejectModal(null); setRejectReason('') }} style={{ flex: 1, padding: '10px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#CBD5E0', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={handleReject} style={{ flex: 1, padding: '10px 16px', background: '#EF4444', border: 'none', borderRadius: 6, color: '#FFF', cursor: 'pointer', fontWeight: 600 }}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </DashboardLayout>
  )
}
