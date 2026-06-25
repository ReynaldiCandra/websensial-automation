'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Zap, Gift, TrendingUp, Clock } from 'lucide-react'

interface CreditData {
  plan: string
  credits_used: number
  credits_total: number
  reset_date: string | null
}

interface Transaction {
  id: string
  type: 'usage' | 'topup' | 'reset'
  amount: number
  description: string
  created_at: string
}

const PLAN_COLORS: Record<string, string> = {
  Free: 'from-violet-600 to-violet-800',
  Starter: 'from-blue-600 to-blue-800',
  Growth: 'from-purple-600 to-indigo-700',
  Business: 'from-rose-600 to-pink-700',
  Scale: 'from-amber-500 to-orange-600',
}

const PLAN_CREDITS: Record<string, number> = {
  Free: 100,
  Starter: 2000,
  Growth: 7500,
  Business: 18000,
  Scale: 50000,
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function CreditsPage() {
  const supabase = createClient()
  const [data, setData]           = useState<CreditData | null>(null)
  const [transactions, setTx]     = useState<Transaction[]>([])
  const [loading, setLoading]     = useState(true)
  const [companyId, setCompanyId] = useState<string | null>(null)

  const getCompanyId = useCallback(async (): Promise<string | null> => {
    if (companyId) return companyId
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase.from('companies').select('id').eq('owner_id', user.id).single()
    const id = data?.id ?? null
    if (id) setCompanyId(id)
    return id
  }, [supabase, companyId])

  const loadData = useCallback(async () => {
    const cid = await getCompanyId()
    if (!cid) return

    // Load subscription/credits
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan, credits_used, credits_total, reset_date')
      .eq('company_id', cid)
      .single()

    if (sub) {
      setData({
        plan: sub.plan ?? 'Free',
        credits_used: sub.credits_used ?? 0,
        credits_total: sub.credits_total ?? PLAN_CREDITS[sub.plan ?? 'Free'] ?? 100,
        reset_date: sub.reset_date ?? null,
      })
    } else {
      // Fallback: coba tabel credits
      const { data: credits } = await supabase
        .from('credits')
        .select('plan, credits_used, credits_total, reset_date')
        .eq('company_id', cid)
        .single()

      setData({
        plan: credits?.plan ?? 'Free',
        credits_used: credits?.credits_used ?? 0,
        credits_total: credits?.credits_total ?? PLAN_CREDITS[credits?.plan ?? 'Free'] ?? 100,
        reset_date: credits?.reset_date ?? null,
      })
    }

    // Load transaction history
    const { data: txData } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('company_id', cid)
      .order('created_at', { ascending: false })
      .limit(20)
    if (txData) setTx(txData as Transaction[])

    setLoading(false)
  }, [supabase, getCompanyId])

  useEffect(() => { void loadData() }, [loadData])

  const used         = data?.credits_used ?? 0
  const total        = data?.credits_total ?? 100
  const remaining    = Math.max(0, total - used)
  const percent      = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
  const planGradient = PLAN_COLORS[data?.plan ?? 'Free'] ?? PLAN_COLORS.Free
  const almostOut    = percent >= 80

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center h-64">
          <p className="text-muted-foreground">Memuat data kredit...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6" /> Kredit Bulanan
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola dan monitor penggunaan kredit AI kamu
          </p>
        </div>

        {/* Credit card */}
        <div className={`rounded-xl bg-gradient-to-br ${planGradient} p-6 text-white`}>
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-semibold tracking-widest opacity-80">AVAILABLE CREDITS</p>
            <Zap className="w-5 h-5 opacity-70" />
          </div>
          <p className="text-5xl font-bold mb-6">{remaining.toLocaleString('id-ID')}</p>

          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-2">
            <div
              className="h-2 rounded-full bg-white transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs opacity-80 mb-5">
            <span>{used.toLocaleString('id-ID')} terpakai</span>
            <span>{total.toLocaleString('id-ID')} total</span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <p className="opacity-70">PLAN</p>
              <p className="font-semibold mt-0.5">{data?.plan ?? 'Free'}</p>
            </div>
            <div>
              <p className="opacity-70">RESET</p>
              <p className="font-semibold mt-0.5">{formatDate(data?.reset_date)}</p>
            </div>
          </div>

          {almostOut && (
            <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <Zap className="w-4 h-4" />
              <p className="text-xs">Kredit hampir habis. Upgrade plan untuk kredit lebih banyak.</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="w-full" size="lg">
            <TrendingUp className="w-4 h-4 mr-2" /> Upgrade Plan
          </Button>
          <Button variant="outline" className="w-full" size="lg">
            <Gift className="w-4 h-4 mr-2" /> Redeem Voucher
          </Button>
        </div>

        {/* Transaction history */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" /> Riwayat Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Belum ada riwayat transaksi</p>
            ) : (
              <div className="divide-y divide-border">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(tx.created_at)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={tx.type === 'usage'
                        ? 'text-red-400 border-red-400/30'
                        : 'text-green-400 border-green-400/30'
                      }
                    >
                      {tx.type === 'usage' ? '-' : '+'}{Math.abs(tx.amount).toLocaleString('id-ID')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
