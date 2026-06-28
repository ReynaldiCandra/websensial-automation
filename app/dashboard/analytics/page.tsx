'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import {
  TrendingUp, Users, DollarSign, Target,
  Flame, Thermometer, Snowflake, RefreshCw,
  CheckCircle, XCircle, Clock,
} from 'lucide-react'

interface AnalyticsData {
  totalLeads: number
  hotLeads: number
  warmLeads: number
  coldLeads: number
  wonLeads: number
  lostLeads: number
  totalDealValue: number
  wonDealValue: number
  conversionRate: number
  avgLeadScore: number
  stageBreakdown: { stage: string; count: number; label: string }[]
  recentLeads: { name: string | null; phone: string; temperature: string; lead_score: number; pipeline_stage: string | null; created_at: string }[]
  topLeads: { name: string | null; phone: string; lead_score: number; temperature: string; deal_value: number | null; pipeline_stage: string | null }[]
}

const STAGE_LABELS: Record<string, string> = {
  new: 'Baru',
  contacted: 'Dihubungi',
  interested: 'Tertarik',
  quotation_sent: 'Penawaran',
  invoice_sent: 'Invoice',
  payment_pending: 'Menunggu Bayar',
  won: 'Closing ✅',
  lost: 'Gagal ❌',
}

const tempColor = (t: string) => {
  if (t === 'hot') return 'text-red-400'
  if (t === 'warm') return 'text-yellow-400'
  return 'text-blue-400'
}

const tempIcon = (t: string) => {
  if (t === 'hot') return <Flame className="w-3.5 h-3.5 text-red-400" />
  if (t === 'warm') return <Thermometer className="w-3.5 h-3.5 text-yellow-400" />
  return <Snowflake className="w-3.5 h-3.5 text-blue-400" />
}

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'baru saja'
  if (hours < 24) return `${hours}j lalu`
  if (days < 7) return `${days}h lalu`
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export default function AnalyticsPage() {
  const supabase = createClient()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!company) { setLoading(false); return }

    const { data: leads } = await supabase
      .from('leads')
      .select('id, name, phone, temperature, lead_score, pipeline_stage, deal_value, created_at')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })

    if (!leads) { setLoading(false); return }

    const totalLeads = leads.length
    const hotLeads = leads.filter(l => l.temperature === 'hot').length
    const warmLeads = leads.filter(l => l.temperature === 'warm').length
    const coldLeads = leads.filter(l => l.temperature === 'cold').length
    const wonLeads = leads.filter(l => l.pipeline_stage === 'won').length
    const lostLeads = leads.filter(l => l.pipeline_stage === 'lost').length
    const totalDealValue = leads.reduce((sum, l) => sum + (l.deal_value ?? 0), 0)
    const wonDealValue = leads.filter(l => l.pipeline_stage === 'won').reduce((sum, l) => sum + (l.deal_value ?? 0), 0)
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0
    const avgLeadScore = totalLeads > 0 ? Math.round(leads.reduce((sum, l) => sum + (l.lead_score ?? 0), 0) / totalLeads) : 0

    const stageCounts: Record<string, number> = {}
    leads.forEach(l => {
      const s = l.pipeline_stage ?? 'new'
      stageCounts[s] = (stageCounts[s] ?? 0) + 1
    })
    const stageBreakdown = Object.entries(stageCounts).map(([stage, count]) => ({
      stage, count, label: STAGE_LABELS[stage] ?? stage
    })).sort((a, b) => b.count - a.count)

    const topLeads = [...leads]
      .sort((a, b) => (b.lead_score ?? 0) - (a.lead_score ?? 0))
      .slice(0, 5)

    setData({
      totalLeads, hotLeads, warmLeads, coldLeads,
      wonLeads, lostLeads, totalDealValue, wonDealValue,
      conversionRate, avgLeadScore, stageBreakdown,
      recentLeads: leads.slice(0, 8),
      topLeads,
    })
    setLoading(false)
  }, [supabase])

  useEffect(() => { void loadAnalytics() }, [loadAnalytics])

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    </DashboardLayout>
  )

  if (!data) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-96 text-muted-foreground">Tidak ada data</div>
    </DashboardLayout>
  )

  const funnelStages = ['new', 'contacted', 'interested', 'quotation_sent', 'invoice_sent', 'payment_pending', 'won']
  const maxFunnelCount = Math.max(...funnelStages.map(s => data.stageBreakdown.find(b => b.stage === s)?.count ?? 0), 1)

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">Data real-time dari semua leads & pipeline</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadAnalytics()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: data.totalLeads, icon: <Users className="w-5 h-5 text-blue-400" />, color: 'text-blue-400', sub: `Avg score: ${data.avgLeadScore}` },
            { label: 'Hot Leads', value: data.hotLeads, icon: <Flame className="w-5 h-5 text-red-400" />, color: 'text-red-400', sub: `${data.warmLeads} warm, ${data.coldLeads} cold` },
            { label: 'Conversion Rate', value: `${data.conversionRate}%`, icon: <Target className="w-5 h-5 text-green-400" />, color: 'text-green-400', sub: `${data.wonLeads} closing` },
            { label: 'Deal Value Won', value: `Rp ${(data.wonDealValue / 1000000).toFixed(1)}M`, icon: <DollarSign className="w-5 h-5 text-emerald-400" />, color: 'text-emerald-400', sub: `Total pipeline: Rp ${(data.totalDealValue / 1000000).toFixed(1)}M` },
          ].map(stat => (
            <Card key={stat.label} className="bg-card">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                  </div>
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Sales Funnel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Sales Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {funnelStages.map(stage => {
                const count = data.stageBreakdown.find(b => b.stage === stage)?.count ?? 0
                const pct = Math.round((count / maxFunnelCount) * 100)
                return (
                  <div key={stage} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{STAGE_LABELS[stage]}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-border rounded-full">
                      <div
                        className={`h-2 rounded-full transition-all ${stage === 'won' ? 'bg-green-400' : stage === 'payment_pending' ? 'bg-orange-400' : 'bg-primary'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Lead Temperature */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="w-4 h-4" /> Distribusi Suhu Lead
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Hot', count: data.hotLeads, color: 'bg-red-400', textColor: 'text-red-400' },
                { label: 'Warm', count: data.warmLeads, color: 'bg-yellow-400', textColor: 'text-yellow-400' },
                { label: 'Cold', count: data.coldLeads, color: 'bg-blue-400', textColor: 'text-blue-400' },
              ].map(item => {
                const pct = data.totalLeads > 0 ? Math.round((item.count / data.totalLeads) * 100) : 0
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={item.textColor}>{item.label}</span>
                      <span className="font-medium">{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-border rounded-full">
                      <div className={`h-2.5 rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}

              <div className="pt-2 border-t border-border grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-400 text-lg font-bold">
                    <CheckCircle className="w-4 h-4" /> {data.wonLeads}
                  </div>
                  <p className="text-xs text-muted-foreground">Closing</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-red-400 text-lg font-bold">
                    <XCircle className="w-4 h-4" /> {data.lostLeads}
                  </div>
                  <p className="text-xs text-muted-foreground">Gagal</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Top Leads by Score */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" /> Top Leads by Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topLeads.map((lead, i) => (
                <div key={lead.phone} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {tempIcon(lead.temperature)}
                        <span className="text-sm font-medium">{lead.name ?? lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {lead.deal_value && (
                          <span className="text-xs text-green-400">Rp {(lead.deal_value / 1000000).toFixed(1)}M</span>
                        )}
                        <span className={`text-xs font-mono font-bold ${tempColor(lead.temperature)}`}>{lead.lead_score}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-border rounded-full">
                      <div
                        className={`h-1.5 rounded-full ${lead.temperature === 'hot' ? 'bg-red-400' : lead.temperature === 'warm' ? 'bg-yellow-400' : 'bg-blue-400'}`}
                        style={{ width: `${lead.lead_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {data.topLeads.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">Belum ada leads</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" /> Leads Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recentLeads.map(lead => (
                <div key={lead.phone + lead.created_at} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    {tempIcon(lead.temperature)}
                    <div>
                      <p className="text-sm font-medium">{lead.name ?? lead.phone}</p>
                      <p className="text-xs text-muted-foreground">{STAGE_LABELS[lead.pipeline_stage ?? 'new']}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold ${tempColor(lead.temperature)}`}>{lead.lead_score}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(lead.created_at)}</span>
                  </div>
                </div>
              ))}
              {data.recentLeads.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">Belum ada leads</p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  )
}
