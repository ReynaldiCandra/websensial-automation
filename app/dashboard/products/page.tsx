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
  Edit2,
  Trash2,
  Package,
  DollarSign,
  Zap,
  Settings2,
} from 'lucide-react'

// Mock products
const mockProducts = [
  {
    id: 1,
    name: 'Paket Starter',
    description: 'Paket dasar untuk UMKM',
    price: 'Rp 500.000',
    category: 'Package',
    status: 'active',
    sales: 45,
  },
  {
    id: 2,
    name: 'Paket Professional',
    description: 'Paket lengkap dengan support',
    price: 'Rp 1.500.000',
    category: 'Package',
    status: 'active',
    sales: 28,
  },
  {
    id: 3,
    name: 'Paket Enterprise',
    description: 'Custom solution untuk perusahaan besar',
    price: 'Rp 5.000.000+',
    category: 'Package',
    status: 'active',
    sales: 12,
  },
]

// Mock automations
const mockAutomations = [
  {
    id: 1,
    name: 'Welcome Message',
    trigger: 'New lead from WhatsApp',
    action: 'Send automated greeting',
    status: 'active',
    created: '22 Juni 2024',
  },
  {
    id: 2,
    name: 'Quotation Follow-up',
    trigger: 'Quotation sent',
    action: 'Send reminder after 3 days',
    status: 'active',
    created: '20 Juni 2024',
  },
  {
    id: 3,
    name: 'Invoice Reminder',
    trigger: 'Invoice due in 2 days',
    action: 'Send payment reminder',
    status: 'paused',
    created: '18 Juni 2024',
  },
]

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'products' | 'automations'>('products')

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Products & Automation
            </h1>
            <p className="text-muted-foreground">
              Kelola produk dan atur otomasi penjualan Anda
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" />
            Tambah Baru
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-border">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'products'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Produk
            </div>
          </button>
          <button
            onClick={() => setActiveTab('automations')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'automations'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Automasi
            </div>
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            {/* Search and Filter */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari produk..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Total Produk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {mockProducts.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aktif dan tersedia
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Total Penjualan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">85</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Semua produk
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">
                    Rp 7M+
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total revenue
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Products Table */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Daftar Produk</CardTitle>
                <CardDescription>
                  {mockProducts.length} produk terdaftar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-foreground font-semibold">
                          Nama Produk
                        </TableHead>
                        <TableHead className="text-foreground font-semibold">
                          Deskripsi
                        </TableHead>
                        <TableHead className="text-foreground font-semibold">
                          Harga
                        </TableHead>
                        <TableHead className="text-foreground font-semibold">
                          Kategori
                        </TableHead>
                        <TableHead className="text-foreground font-semibold text-center">
                          Penjualan
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
                      {mockProducts.map((product) => (
                        <TableRow
                          key={product.id}
                          className="border-border hover:bg-accent/5 transition-colors"
                        >
                          <TableCell className="font-medium text-foreground">
                            {product.name}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {product.description}
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            {product.price}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {product.category}
                          </TableCell>
                          <TableCell className="text-center font-semibold text-foreground">
                            {product.sales}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary/90"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
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
          </>
        )}

        {/* Automations Tab */}
        {activeTab === 'automations' && (
          <>
            {/* Search */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari automasi..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Total Automasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {mockAutomations.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Workflow tersedia
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Aktif
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">2</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Running now
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Paused
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-500">1</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ditunda sementara
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Automations Table */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Daftar Automasi</CardTitle>
                <CardDescription>
                  {mockAutomations.length} automasi workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-foreground font-semibold">
                          Nama Automasi
                        </TableHead>
                        <TableHead className="text-foreground font-semibold">
                          Trigger
                        </TableHead>
                        <TableHead className="text-foreground font-semibold">
                          Aksi
                        </TableHead>
                        <TableHead className="text-foreground font-semibold">
                          Status
                        </TableHead>
                        <TableHead className="text-foreground font-semibold">
                          Dibuat
                        </TableHead>
                        <TableHead className="text-foreground font-semibold text-right">
                          Kontrol
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockAutomations.map((auto) => (
                        <TableRow
                          key={auto.id}
                          className="border-border hover:bg-accent/5 transition-colors"
                        >
                          <TableCell className="font-medium text-foreground">
                            {auto.name}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {auto.trigger}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {auto.action}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                auto.status === 'active'
                                  ? 'bg-green-500/20 text-green-500 border-green-500/30'
                                  : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                              }
                            >
                              {auto.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {auto.created}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary/90"
                              >
                                <Settings2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
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
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
