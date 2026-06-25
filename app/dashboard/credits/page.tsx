'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingDown, TrendingUp, Zap, AlertTriangle } from 'lucide-react'

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

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Memuat...</div>

  const remaining = credits ? credits.total_credits - credits.used_credits : 0
  const percentage = credits ? Math.round((remaining / credits.total_credits) * 100) : 0
  const isLow = percentage < 20

  return (
    <div style={{ padding: 24 }}>
      <div className="mb-6">
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>Kredit</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Pantau pemakaian kredit AI kamu</p>
      </div>

      {isLow && (
        <div style={{ background: '#FAEEDA', border: '0.5px solid #BA7517', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <AlertTriangle size={16} color="#BA7517" />
          <span style={{ fontSize: 13, color: '#854F0B', fontWeight: 500 }}>Kredit tinggal {percentage}% — segera top up atau upgrade paket</span>
        </div>
      )}

      <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Sisa Kredit</p>
            <div className="flex items-end gap-2 mt-1">
              <span style={{ fontSize: 40, fontWeight: 700, color: isLow ? '#A32D' : '#0F6E56' }}>{remaining.toLocaleString('id-ID')}</span>
              <span style={{ fontSize: 16, color: '#9ca3af', marginBottom: 6 }}>/ {credits?.total_credits.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ background: '#E1F5EE', color: '#0F6E56', fontSize: 12, padding: '4px 10px', borderRadius: 99, fontWeight: 500, textTransform: 'capitalize' }}>
              {credits?.plan || 'trial'}
            </span>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Reset: {credits?.reset_at ? new Date(credits.reset_at).toLocaleDateString('id-ID') : '-'}</p>
          </div>
        </div>
        <div style={{ height: 8, background: '#f3f4f6', borderRadius: 99 }}>
          <div style={{ height: 8, borderRadius: 99, width: `${percentage}%`, background: isLow ? '#E24B4A' : percentage < 50 ? '#BA7517' : '#1D9E75', transition: 'width 0.5s' }} />
        </div>
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>{percentage}% tersisa</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Dipakai bulan ini', value: credits?.used_credits.toLocaleString('id-ID') || '0', icon: TrendingDown, color: '#E24B4A' },
          { label: 'Total kredit', value: credits?.total_credits.toLocaleString('id-ID') || '0', icon: Zap, color: '#1D9E75' },
          { label: 'Rata-rata/hari', value: Math.round((credits?.used_credits || 0) / 30).toLocaleString('id-ID'), icon: TrendingUp, color: '#185FA5' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: '#f9fafb', borderRadius: 10, padding: 16 }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} color={color} />
              <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{label}</p>
            </div>
            <p style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #e5e7eb' }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>Riwayat Transaksi</h3>
        </div>
        {history.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Belum ada transaksi</div>
        ) : (
          <div>
            {history.map(tx => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '0.5px solid #f3f4f6' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{tx.description}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: tx.amount > 0 ? '#0F6E56' : '#E24B4A' }}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
