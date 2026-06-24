'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import {
  TrendingUp,
  Users,
  MessageCircle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)

        // Fetch company data
        const { data: companies } = await supabase
          .from('companies')
          .select('*')
          .eq('owner_id', authUser.id)
          .single()

        if (companies) {
          setCompany(companies)
        }
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Selamat datang, {user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            {company?.name || 'My Company'}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Leads */}
          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">
                  Total Leads
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-4 h-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">0</div>
              <div className="flex items-center gap-1 text-sm text-green-500">
                <ArrowUpRight className="w-4 h-4" />
                <span>0% minggu ini</span>
              </div>
            </CardContent>
          </Card>

          {/* Active Chats */}
          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">
                  Active Chats
                </CardTitle>
                <div className="p-2 bg-accent/10 rounded-lg">
                  <MessageCircle className="w-4 h-4 text-accent" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">0</div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>Real-time conversations</span>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">
                  Conversion Rate
                </CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">0%</div>
              <div className="flex items-center gap-1 text-sm text-red-500">
                <ArrowDownRight className="w-4 h-4" />
                <span>Data belum tersedia</span>
              </div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">
                  Revenue
                </CardTitle>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <DollarSign className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">Rp 0</div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>Bulan ini</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Leads */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>Leads terbaru Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Belum ada leads. Mulai dengan menambahkan lead baru.</p>
                <Button className="mt-4 bg-primary hover:bg-primary/90">
                  Tambah Lead
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Hot Leads Summary */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Lead Status</CardTitle>
              <CardDescription>Distribusi status leads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">🔥 Hot</span>
                <Badge variant="secondary">0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">🟡 Warm</span>
                <Badge variant="secondary">0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">❄️ Cold</span>
                <Badge variant="secondary">0</Badge>
              </div>
              <div className="border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Total</span>
                <div className="text-2xl font-bold text-foreground mt-2">0</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
