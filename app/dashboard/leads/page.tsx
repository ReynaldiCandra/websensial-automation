'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'
import {
  Search, Flame, Thermometer, Snowflake, TrendingUp,
  RefreshCw, UserCheck, BarChart2, MessageCircle,
} from 'lucide-react'
import Link from 'next/link'

interface Lead {
  id: string
  name: string | null
  phone: string
  email: string | null
  status: string | null
  temperature: 'hot' | 'warm' | 'cold'
  lead_score: number
  last_message: string | null
  last_seen_at: string | null
  is_escalated: boolean
  pipeline_stage: string | null
  deal_value: number | null
  created_at: string
}

const tempIcon = (t: string) => {
  if (t === 'hot') return <Flame className="w-4 h-4 text-red-400" />
  if (t === 'warm') return <Thermometer className="w-4 h-4 text-yellow-400" />
  return <Snowflake className="w-4 h-4 text-blue-400" />
}

const tempBadge = (t: string) => {
  if (t === 'hot') return 'bg-red-500/10 text-red-400 border-red-500/30'
  if (t === 'warm') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
  return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
}

const scoreBar = (score: number) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 bg-border rounded-full h-1.5 max-w-[80px]">
      <div
        className={`h-1.5 rounded-full ${score >= 70 ? 'bg-red-400' : score >= 40 ? 'bg-yellow-400' : 'bg-blue-400'}`}
        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
      />
    </div>
    <span className="text-xs font-medium">{score}</span>
  </div>
)

export default function LeadsPage() {
  const supabase = createClient()
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'hot' | 'warm' | 'cold' | 'escalated'>('all')
  const [rescoring, setRescoring] = useState<string | null>(null)

  const getCompanyId = useCallback(async (): Promise<string | null> => {
    if (companyId) return companyId
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase.from('companies').select('id').eq('owner_id', user.id).single()
    const id = data?.id ?? null
    if (id) setCompanyId(id)
    return id
  }, [supabase, companyId])

  const loadLeads = useCallback(async () => {
    const cid = await getCompanyId()
    if (!cid) { setLoading(false); return }
    const { data } = await supabase
      .from('leads')
      .select('id, name, phone, email, status, temperature, lead_score, last_message, last_seen_at, is_escalated, pipeline_stage, deal_value, created_at')
      .eq('company_id', cid)
      .order('lead_score', { ascending: false })
    if (data) setLeads(data as Lead[])
    setLoading(false)
  }, [supabase, getCompanyId])

  useEffect(() => { void loadLeads() }, [loadLeads])

  const rescore = async (lead: Lead) => {
    setRescoring(lead.id)
    try {
      const res = await fetch('/api/ai/score-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, phone: lead.phone }),
      })
      const data = await res.json()
      if (data.score !== undefined) {
        setLeads(prev => prev.map(l =>
          l.id === lead.id
            ? { ...l, lead_score: data.score, temperature: data.temperature ?? l.temperature }
            : l
        ))
      }
    } catch (_) { /* ignore */ }
    setRescoring(null)
  }

  const filtered = leads
    .filter(l => {
      if (filter === 'hot') return l.temperature === 'hot'
      if (filter === 'warm') return l.temperature === 'warm'
      if (filter === 'cold') return l.temperature === 'cold'
      if (filter === 'escalated') return l.is_escalated
      return true
    })
    .filter(l =>
      !search ||
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search) ||
      l.email?.toLowerCase().includes(search.toLowerCase())
    )

  const counts = {
    hot: leads.filter(l => l.temperature === 'hot').length,
    warm: leads.filter(l => l.temperature === 'warm').length,
    cold: leads.filter(l => l.temperature === 'cold').length,
    escalated: leads.filter(l => l.is_escalated).length,
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads & Lead Scoring</h1>
          <p className="text-muted-foreground text-sm mt-1">Semua prospek dari WhatsApp, dinilai otomatis oleh AI</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Hot Leads', value: counts.hot, icon: <Flame className="w-5 h-5 text-red-400" />, color: 'text-red-400' },
            { label: 'Warm Leads', value: counts.warm, icon: <Thermometer className="w-5 h-5 text-yellow-400" />, color: 'text-yellow-400' },
            { label: 'Cold Leads', value: counts.cold, icon: <Snowflake className="w-5 h-5 text-blue-400" />, color: 'text-blue-400' },
            { label: 'Eskalasi', value: counts.escalated, icon: <UserCheck className="w-5 h-5 text-orange-400" />, color: 'text-orange-400' },
          ].map(stat => (
            <Card key={stat.label} className="bg-card">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                  </div>
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, nomor, email..."
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {(['all', 'hot', 'warm', 'cold', 'escalated'] as const).map(f => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f === 'all' ? 'Semua' : f === 'escalated' ? 'Eskalasi' : f}
                {f !== 'all' && <span className="ml-1 text-xs">({counts[f as keyof typeof counts] ?? leads.length})</span>}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadLeads()}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Nomor WA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1"><BarChart2 className="w-4 h-4" /> Lead Score</div>
                  </TableHead>
                  <TableHead>Suhu</TableHead>
                  <TableHead>Pesan Terakhir</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Memuat lead...</TableCell>
                  </TableRow>
                )}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Tidak ada lead ditemukan</TableCell>
                  </TableRow>
                )}
                {filtered.map(lead => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.name ?? '—'}</p>
                        {lead.email && <p className="text-xs text-muted-foreground">{lead.email}</p>}
                        {lead.is_escalated && (
                          <span className="text-xs text-orange-400">⚡ Eskalasi</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{lead.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">{lead.status ?? 'baru'}</Badge>
                    </TableCell>
                    <TableCell>{scoreBar(lead.lead_score ?? 0)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border ${tempBadge(lead.temperature ?? 'cold')}`}>
                        {tempIcon(lead.temperature ?? 'cold')} {lead.temperature ?? 'cold'}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-80px]">
                      <p className="text-xs text-muted-foreground truncate">{lead.last_message ?? '—'}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/chats?phone=${lead.phone}`}>
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void rescore(lead)}
                          disabled={rescoring === lead.id}
                          title="Re-score AI"
                        >
                          {rescoring === lead.id
                            ? <RefreshCw className="w-4 h-4 animate-spin" />
                            : <TrendingUp className="w-4 h-4" />
                        }
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
