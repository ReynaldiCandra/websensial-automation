'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/client'
import { Users, MessageCircle, TrendingUp, DollarSign, ArrowUpRight, Flame, Thermometer, Snowflake, Plus } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (u) {
        setUser(u)
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('owner_id', u.id)
          .single()
        if (company) {
          const { data: l } = await supabase
            .from('leads')
            .select('*')
            .eq('company_id', company.id)
            .order('created_at', { ascending: false })
            .limit(5)
          if (l) setLeads(l)
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const hot = leads.filter(l => l.temperature === 'hot').length
  const warm = leads.filter(l => l.temperature === 'warm').length
  const cold = leads.filter(l => l.temperature === 'cold').length

  const stats = [
    { label: 'Total Leads', value: leads.length, icon: Users, color: '#6C3BF5', bg: 'rgba(108,59,245,0.12)', sub: '0% minggu ini', subColor: '#68D391' },
    { label: 'Active Chats', value: 0, icon: MessageCircle, color: '#38BDF8', bg: 'rgba(56,189,248,0.12)', sub: 'Real-time', subColor: '#718096' },
    { label: 'Conversion Rate', value: '0%', icon: TrendingUp, color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', sub: 'Bulan ini', subColor: '#718096' },
    { label: 'Revenue', value: 'Rp 0', icon: DollarSign, color: '#68D391', bg: 'rgba(104,211,145,0.12)', sub: 'Bulan ini', subColor: '#718096' },
  ]

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#4A5568' }}>Loading...</div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div style={{ padding: 28 }}>
        {/* Header */}
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#F1F5F9', margin: 0 }}>
              Selamat datang, {user?.email?.split('@')[0] || 'User'} 👋
            </h1>
            <p style={{ fontSize: 13, color: '#4A5568', marginTop: 4 }}>Ini ringkasan bisnis kamu hari ini</p>
          </div>
          <Link href="/dashboard/leads">
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'linear-gradient(135deg,#6C3BF5,#4F1FD4)', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <Plus size={14} /> Tambah Lead
            </button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map(({ label, value, icon: Icon, color, bg, sub, subColor }) => (
            <div key={label} style={{ background: '#16161F', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{label}</span>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={color} />
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#F1F5F9', marginBottom: 6 }}>{value}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: subColor }}>
                <ArrowUpRight size={12} />
                {sub}
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
          {/* Recent Leads */}
          <div style={{ background: '#16161F', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', margin: 0 }}>Recent Leads</h3>
                <p style={{ fontSize: 12, color: '#4A5568', margin: '2px 0 0' }}>Leads terbaru kamu</p>
              </div>
              <Link href="/dashboard/leads" style={{ fontSize: 12, color: '#6C3BF5', textDecoration: 'none' }}>Lihat semua →</Link>
            </div>
            {leads.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <Users size={36} style={{ color: '#2D3748', margin: '0 auto 12px' }} />
                <p style={{ color: '#4A5568', fontSize: 13, margin: 0 }}>Belum ada leads. Mulai tambahkan lead baru.</p>
                <Link href="/dashboard/leads">
                  <button style={{ marginTop: 16, padding: '8px 20px', background: 'rgba(108,59,245,0.15)', border: '1px solid rgba(108,59,245,0.3)', borderRadius: 8, color: '#A78BFA', fontSize: 13, cursor: 'pointer' }}>
                    Tambah Lead
                  </button>
                </Link>
              </div>
            ) : (
              <div>
                {leads.map((lead, i) => (
                  <div key={lead.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: i < leads.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(108,59,245,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#A78BFA' }}>
                        {(lead.name || lead.phone || 'L')[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#CBD5E0', margin: 0 }}>{lead.name || lead.phone}</p>
                        <p style={{ fontSize: 11, color: '#4A5568', margin: '2px 0 0' }}>{lead.phone}</p>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 99,
                      background: lead.temperature === 'hot' ? 'rgba(252,129,74,0.15)' : lead.temperature === 'warm' ? 'rgba(251,191,36,0.15)' : 'rgba(99,179,237,0.15)',
                      color: lead.temperature === 'hot' ? '#FC814A' : lead.temperature === 'warm' ? '#FBbF24' : '#63B3ED',
                    }}>
                      {lead.temperature === 'hot' ? '🔥 Hot' : lead.temperature === 'warm' ? '🌡 Warm' : '❄️ Cold'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lead Status */}
          <div style={{ background: '#16161F', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', margin: '0 0 4px' }}>Lead Status</h3>
            <p style={{ fontSize: 12, color: '#4A5568', margin: '0 0 20px' }}>Distribusi status leads</p>

            {[
              { label: 'Hot', count: hot, icon: Flame, color: '#FC814A', bg: 'rgba(252,129,74,0.12)' },
              { label: 'Warm', count: warm, icon: Thermometer, color: '#FBbF24', bg: 'rgba(251,191,36,0.12)' },
              { label: 'Cold', count: cold, icon: Snowflake, color: '#63B3ED', bg: 'rgba(99,179,237,0.12)' },
            ].map(({ label, count, icon: Icon, color, bg }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: bg, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={14} color={color} />
                  <span style={{ fontSize: 13, color: '#CBD5E0' }}>{label}</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 600, color }}>{count}</span>
              </div>
            ))}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#4A5568' }}>Total</span>
                <span style={{ fontSize: 24, fontWeight: 700, color: '#F1F5F9' }}>{leads.length}</span>
              </div>
              <div style={{ marginTop: 12, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                {leads.length > 0 && <div style={{ height: 4, borderRadius: 99, width: (hot/leads.length*100)+'%', background: 'linear-gradient(90deg,#6C3BF5,#FC814A)' }} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
