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
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

// Mock invoices data
const mockInvoices = [
  {
    id: 'INV-2024-001',
    customer: 'Budi Santoso',
    amount: 'Rp 5.000.000',
    date: '22 Juni 2024',
    dueDate: '27 Juni 2024',
    status: 'paid',
    paidDate: '25 Juni 2024',
  },
  {
    id: 'INV-2024-002',
    customer: 'Siti Nurhaliza',
    amount: 'Rp 3.500.000',
    date: '21 Juni 2024',
    dueDate: '26 Juni 2024',
    status: 'overdue',
    paidDate: null,
  },
  {
    id: 'INV-2024-003',
    customer: 'Joko Subroto',
    amount: 'Rp 2.000.000',
    date: '20 Juni 2024',
    dueDate: '25 Juni 2024',
    status: 'pending',
    paidDate: null,
  },
]

const statusConfig = {
  paid: { label: 'Lunas', variant: 'default' as const, icon: CheckCircle },
  pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
  overdue: { label: 'Overdue', variant: 'outline' as const, icon: AlertCircle },
}

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Invoices</h1>
            <p className="text-muted-foreground">
              Kelola invoice dan track pembayaran customer
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" />
            Buat Invoice
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari invoice berdasarkan nomor atau customer..."
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
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                Rp 10.5M
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +Rp 5M vs bulan lalu
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">
                Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                Rp 5M
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                1 invoice
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                Rp 2M
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                1 invoice
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                Rp 3.5M
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                1 invoice
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Daftar Invoices</CardTitle>
            <CardDescription>
              {mockInvoices.length} invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-foreground font-semibold">
                      Nomor Invoice
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      Customer
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      Jumlah
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      Tanggal Invoice
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      Jatuh Tempo
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="text-foreground font-semibold text-right">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map((invoice) => {
                    const config =
                      statusConfig[
                        invoice.status as keyof typeof statusConfig
                      ]
                    const StatusIcon = config.icon
                    return (
                      <TableRow
                        key={invoice.id}
                        className="border-border hover:bg-accent/5 transition-colors"
                      >
                        <TableCell className="font-mono text-sm text-foreground">
                          {invoice.id}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {invoice.customer}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {invoice.amount}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {invoice.date}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {invoice.dueDate}
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
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
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
