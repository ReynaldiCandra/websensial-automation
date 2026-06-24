'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  Target,
  Clock,
  BarChart3,
} from 'lucide-react'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('month')

  const analyticsData = [
    {
      label: 'Total Leads',
      value: '245',
      change: '+15%',
      positive: true,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Conversion Rate',
      value: '32%',
      change: '+5%',
      positive: true,
      icon: Target,
      color: 'text-green-500',
    },
    {
      label: 'Revenue',
      value: 'Rp 45.5M',
      change: '+23%',
      positive: true,
      icon: DollarSign,
      color: 'text-emerald-500',
    },
    {
      label: 'Avg. Response Time',
      value: '2.4 min',
      change: '-30%',
      positive: true,
      icon: Clock,
      color: 'text-orange-500',
    },
  ]

  const topPerformers = [
    {
      rank: 1,
      name: 'Paket Professional',
      revenue: 'Rp 28.5M',
      units: 19,
      trend: '+45%',
    },
    {
      rank: 2,
      name: 'Paket Starter',
      revenue: 'Rp 12.8M',
      units: 26,
      trend: '+12%',
    },
    {
      rank: 3,
      name: 'Paket Enterprise',
      revenue: 'Rp 4.2M',
      units: 1,
      trend: '+8%',
    },
  ]

  const customerSegments = [
    { segment: 'New Customers', count: 45, percentage: '18%', color: 'bg-blue-500' },
    { segment: 'Returning', count: 124, percentage: '51%', color: 'bg-green-500' },
    { segment: 'VIP', count: 38, percentage: '15%', color: 'bg-purple-500' },
    { segment: 'At Risk', count: 38, percentage: '16%', color: 'bg-red-500' },
  ]

  const monthlyTrends = [
    { month: 'April', leads: 145, revenue: 'Rp 18.2M', conversion: '28%' },
    { month: 'May', leads: 168, revenue: 'Rp 22.5M', conversion: '30%' },
    { month: 'June', leads: 245, revenue: 'Rp 45.5M', conversion: '32%' },
  ]

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Advanced Analytics
            </h1>
            <p className="text-muted-foreground">
              Dashboard insights dan laporan performa bisnis Anda
            </p>
          </div>
          <div className="flex gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-card border border-border rounded-lg px-4 py-2 text-foreground"
            >
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="quarter">Quarter</option>
              <option value="year">Tahun Ini</option>
            </select>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {analyticsData.map((metric) => {
            const Icon = metric.icon
            return (
              <Card key={metric.label} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-foreground">
                      {metric.label}
                    </CardTitle>
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {metric.value}
                      </div>
                      <p className={`text-xs mt-1 ${metric.positive ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.change} from last period
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Customer Segments */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>
                Distribusi customers berdasarkan status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerSegments.map((seg) => (
                  <div key={seg.segment}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {seg.segment}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {seg.count} customers
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {seg.percentage}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${seg.color}`}
                        style={{ width: seg.percentage }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>
                Produk dengan revenue terbesar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((product) => (
                  <div
                    key={product.rank}
                    className="flex items-center justify-between p-3 bg-accent/5 rounded-lg border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          #{product.rank}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.units} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {product.revenue}
                      </p>
                      <p className="text-xs text-green-500">
                        {product.trend}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends Table */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>
              Performa bisnis per bulan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-foreground font-semibold">
                      Bulan
                    </TableHead>
                    <TableHead className="text-foreground font-semibold text-center">
                      Leads
                    </TableHead>
                    <TableHead className="text-foreground font-semibold text-center">
                      Revenue
                    </TableHead>
                    <TableHead className="text-foreground font-semibold text-center">
                      Conversion Rate
                    </TableHead>
                    <TableHead className="text-foreground font-semibold text-right">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyTrends.map((trend) => (
                    <TableRow
                      key={trend.month}
                      className="border-border hover:bg-accent/5 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">
                        {trend.month}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-medium text-foreground">
                          {trend.leads}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-semibold text-foreground">
                          {trend.revenue}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                          {trend.conversion}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-500">
                            Up
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Top Channel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-2">
                WhatsApp
              </div>
              <p className="text-sm text-muted-foreground">
                68% dari semua leads datang via WhatsApp
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                Peak Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-2">
                14:00 - 16:00
              </div>
              <p className="text-sm text-muted-foreground">
                Waktu paling aktif untuk penjualan
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-red-500" />
                Avg. Deal Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-2">
                Rp 1.8M
              </div>
              <p className="text-sm text-muted-foreground">
                Rata-rata value per deal
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
