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
  Phone,
  Mail,
  TrendingUp,
  Clock,
  User,
} from 'lucide-react'

// Mock leads data
const mockLeads = [
  {
    id: 1,
    name: 'Budi Santoso',
    phone: '+62 812-3456-7890',
    email: 'budi@example.com',
    company: 'PT Maju Jaya',
    status: 'interested',
    temperature: 'hot',
    score: 85,
    lastInteraction: '2 jam lalu',
  },
  {
    id: 2,
    name: 'Siti Nurhaliza',
    phone: '+62 813-2456-7890',
    email: 'siti@example.com',
    company: 'CV Berkah',
    status: 'contacted',
    temperature: 'warm',
    score: 65,
    lastInteraction: '4 jam lalu',
  },
  {
    id: 3,
    name: 'Joko Subroto',
    phone: '+62 811-2456-7890',
    email: 'joko@example.com',
    company: 'Toko Elektronik',
    status: 'new',
    temperature: 'cold',
    score: 40,
    lastInteraction: 'Kemarin',
  },
]

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const getTemperatureBadgeVariant = (temp: string) => {
    if (temp === 'hot') return 'default'
    if (temp === 'warm') return 'secondary'
    return 'outline'
  }

  const getStatusColor = (status: string) => {
    if (status === 'interested') return 'text-green-500'
    if (status === 'contacted') return 'text-blue-500'
    return 'text-gray-500'
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Lead Management</h1>
            <p className="text-muted-foreground">
              Kelola dan track semua leads Anda
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" />
            Tambah Lead
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari lead berdasarkan nama, email, atau nomor..."
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
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {mockLeads.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +5 bulan ini
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">
                Hot Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">1</div>
              <p className="text-xs text-muted-foreground mt-1">
                Siap untuk closing
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">
                Warm Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">1</div>
              <p className="text-xs text-muted-foreground mt-1">
                Follow-up diperlukan
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">33%</div>
              <p className="text-xs text-muted-foreground mt-1">
                +15% vs bulan lalu
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Leads Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Daftar Leads</CardTitle>
            <CardDescription>
              {mockLeads.length} leads aktif
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-foreground font-semibold">Nama</TableHead>
                    <TableHead className="text-foreground font-semibold">Kontak</TableHead>
                    <TableHead className="text-foreground font-semibold">Perusahaan</TableHead>
                    <TableHead className="text-foreground font-semibold">Status</TableHead>
                    <TableHead className="text-foreground font-semibold text-center">Score</TableHead>
                    <TableHead className="text-foreground font-semibold">Interaksi Terakhir</TableHead>
                    <TableHead className="text-foreground font-semibold text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLeads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className="border-border hover:bg-accent/5 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">
                        {lead.name}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {lead.company}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getTemperatureBadgeVariant(lead.temperature)}
                        >
                          {lead.temperature}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <TrendingUp className="w-3 h-3 text-primary" />
                          <span className="font-semibold text-foreground">
                            {lead.score}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lead.lastInteraction}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary/90"
                        >
                          View
                        </Button>
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
