'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Plus,
  Search,
  Filter,
  Download,
  Send,
  CheckCircle,
  Clock,
  DollarSign,
} from 'lucide-react'

// Mock quotations data
const mockQuotations = [
  {
    id: 'QT-2024-001',
    customer: 'Budi Santoso',
    amount: 'Rp 5.000.000',
    date: '22 Juni 2024',
    status: 'sent',
    expiryDate: '29 Juni 2024',
    items: 3,
  },
  {
    id: 'QT-2024-002',
    customer: 'Siti Nurhaliza',
    amount: 'Rp 3.500.000',
    date: '21 Juni 2024',
    status: 'accepted',
    expiryDate: '28 Juni 2024',
    items: 2,
  },
  {
    id: 'QT-2024-003',
    customer: 'Joko Subroto',
    amount: 'Rp 2.000.000',
    date: '20 Juni 2024',
    status: 'draft',
    expiryDate: '27 Juni 2024',
    items: 5,
  },
]

const statusConfig = {
  draft: { label: 'Draft', variant: 'outline' as const },
  sent: { label: 'Terkirim', variant: 'secondary' as const },
  accepted: { label: 'Diterima', variant: 'default' as const },
  rejected: { label: 'Ditolak', variant: 'outline' as const },
}

export default function QuotationsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Quotations</h1>
            <p className="text-muted-foreground">
              Buat dan kelola quotation untuk leads Anda
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" />
            Buat Quotation
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari quotation berdasarkan nomor atau customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">
                Total Quotations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {mockQuotations.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +2 bulan ini
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                Rp 10.5M
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Pending quotations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">
                Acceptance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">67%</div>
              <p className="text-xs text-muted-foreground mt-1">
                2 dari 3 diterima
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">
                Avg. Days to Close
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">5</div>
              <p className="text-xs text-muted-foreground mt-1">
                Hari
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quotations Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Daftar Quotations</CardTitle>
            <CardDescription>
              {mockQuotations.length} quotations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-foreground font-semibold">
                      Nomor QT
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      Customer
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      Jumlah Item
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      Total
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      Expire Date
                    </TableHead>
                    <TableHead className="text-foreground font-semibold text-right">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockQuotations.map((qt) => (
                    <TableRow
                      key={qt.id}
                      className="border-border hover:bg-accent/5 transition-colors"
                    >
                      <TableCell className="font-mono text-sm text-foreground">
                        {qt.id}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {qt.customer}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {qt.items} items
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {qt.amount}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            statusConfig[qt.status as keyof typeof statusConfig]
                              .variant
                          }
                        >
                          {
                            statusConfig[qt.status as keyof typeof statusConfig]
                              .label
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {qt.expiryDate}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/90"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/90"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
