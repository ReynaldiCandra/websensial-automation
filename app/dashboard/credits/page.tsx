'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingDown, TrendingUp, Zap, AlertTriangle, Plus, Gift } from 'lucide-react'

interface CreditData {
  total_credits: number
  used_credits: number
  plan: string
  reset_at: string
}

interface Transaction {
  id: string
  amount: number
  type: string
  description: string
  created_at: string
}

export default function CreditsPage() {
  const supabase = createClient()
  const [credits, setCredits] = useState<CreditData | null>(null)
  const [history, setHistory] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: creditData } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const { data: txData } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (creditData) setCredits(creditData)
    if (txData) setHistory(txData)
    setLoading(false)
  }

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: '#64748B' }}>Loading...</div>

  const remaining = (credits?.total_credits || 0) - (credits?.used_credits || 0)
  const percentage = credits?.total_credits ? ((remaining / credits.total_credits) * 100) : 0
  const resetDate = new Date(credits?.reset_at || '')

  return (
    <div style={{ padding: '24px', background: '#0D0D12', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#E2E8F0', margin: '0 0 8px' }}>
          Kredit Bulanan
        </h1>
        <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>
          Kelola dan monitor penggunaan kredit Anda
        </p>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #6C3BF5 0%, #4F1FD4 100%)', borderRadius: 16, padding: 32, marginBottom: 24, color: '#FFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 13, opacity: 0.8, margin: 0, textTransform: 'uppercase' }}>Available Credits</p>
            <p style={{ fontSize: 48, fontWeight: 700, margin: '8px 0 0' }}>
              {remaining.toLocaleString()}
            </p>
          </div>
          <Zap size={32} style={{ opacity: 0.8 }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ background: '#FFF', height: '100%', width: `${percentage}%`, transition: 'width 0.3s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 8, opacity: 0.8 }}>
            <span>{(credits?.used_credits || 0).toLocaleString()} used</span>
            <span>{(credits?.total_credits || 0).toLocaleString()} total</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <p style={{ fontSize: 11, opacity: 0.7, margin: 0, textTransform: 'uppercase' }}>Plan</p>
            <p style={{ fontSize: 16, fontWeight: 600, margin: '4px 0 0' }}>{credits?.plan || 'Free'}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, opacity: 0.7, margin: 0, textTransform: 'uppercase' }}>Reset Date</p>
            <p style={{ fontSize: 16, fontWeight: 600, margin: '4px 0 0' }}>
              {resetDate.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {percentage < 20 && (
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <AlertTriangle size={16} />
            Kredit Anda hampir habis. Upgrade plan untuk mendapatkan kredit lebih banyak.
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 24px', background: '#6C3BF5', border: 'none', borderRadius: 8, color: '#FFF', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => (e.currentTarget as any).style.background = '#7C4BF5'} onMouseLeave={e => (e.currentTarget as any).style.background = '#6C3BF5'}>
          <Plus size={18} /> Upgrade Plan
        </button>
        <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#E2E8F0', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { (e.currentTarget as any).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as any).style.borderColor = '#6C3BF5' }} onMouseLeave={e => { (e.currentTarget as any).style.background = 'transparent'; (e.currentTarget as any).style.borderColor = 'rgba(255,255,255,0.1)' }}>
          <Gift size={18} /> Redeem Voucher
        </button>
      </div>

      <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0', margin: 0 }}>Transaction History</h2>
        </div>

        {history.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
            <p style={{ margin: 0 }}>Belum ada history transaksi</p>
          </div>
        ) : (
          <div>
            {history.map(tx => (
              <div key={tx.id} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 8,
                    background: tx.type === 'add' ? '#10B98133' : '#EF444433',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: tx.type === 'add' ? '#10B981' : '#EF4444'
                  }}>
                    {tx.type === 'add' ? <Plus size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', margin: 0 }}>
                      {tx.description}
                    </p>
                    <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>
                      {new Date(tx.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: tx.type === 'add' ? '#10B981' : '#EF4444' }}>
                  {tx.type === 'add' ? '+' : '-'}{tx.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
