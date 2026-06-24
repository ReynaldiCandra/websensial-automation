'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Settings, Bell, Shield, Zap, CreditCard, Users } from 'lucide-react'

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Kelola pengaturan akun dan konfigurasi aplikasi Anda
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Company Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Pengaturan Perusahaan</CardTitle>
                  <CardDescription>
                    Informasi dasar perusahaan Anda
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Nama Perusahaan
                  </label>
                  <Input
                    placeholder="Nama perusahaan Anda"
                    defaultValue="My Company"
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email Bisnis
                  </label>
                  <Input
                    type="email"
                    placeholder="email@company.com"
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Nomor WhatsApp Business
                  </label>
                  <Input
                    placeholder="+62 812-3456-7890"
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Website
                  </label>
                  <Input
                    placeholder="https://company.com"
                    className="bg-background border-border"
                  />
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                Simpan Perubahan
              </Button>
            </CardContent>
          </Card>

          {/* WhatsApp Integration */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-green-500" />
                  <div>
                    <CardTitle>WhatsApp Business API</CardTitle>
                    <CardDescription>
                      Konfigurasi integrasi WhatsApp Business
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                  Connected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Business Account ID
                </label>
                <Input
                  placeholder="Masukkan Business Account ID"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Access Token
                </label>
                <Input
                  type="password"
                  placeholder="Masukkan Access Token"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Webhook URL
                </label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value="https://yourdomain.com/webhook"
                    className="bg-background border-border"
                  />
                  <Button variant="outline">Copy</Button>
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                Update WhatsApp Settings
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-500" />
                <div>
                  <CardTitle>Notifikasi</CardTitle>
                  <CardDescription>
                    Pengaturan notifikasi dan alert
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox defaultChecked />
                <label className="text-sm font-medium text-foreground cursor-pointer">
                  Email notification untuk lead baru
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox defaultChecked />
                <label className="text-sm font-medium text-foreground cursor-pointer">
                  Notifikasi untuk pesan masuk
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox defaultChecked />
                <label className="text-sm font-medium text-foreground cursor-pointer">
                  Alert untuk quotation yang expired
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox defaultChecked />
                <label className="text-sm font-medium text-foreground cursor-pointer">
                  Reminder untuk invoice yang overdue
                </label>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                Simpan Preferensi Notifikasi
              </Button>
            </CardContent>
          </Card>

          {/* Team & Users */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-500" />
                <div>
                  <CardTitle>Tim & Pengguna</CardTitle>
                  <CardDescription>
                    Kelola anggota tim dan akses
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="bg-primary hover:bg-primary/90">
                Kelola Anggota Tim
              </Button>
            </CardContent>
          </Card>

          {/* Billing & Subscription */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-green-500" />
                <div>
                  <CardTitle>Billing & Subscription</CardTitle>
                  <CardDescription>
                    Kelola paket berlangganan Anda
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-border rounded-lg bg-accent/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Paket Saat Ini
                  </span>
                  <Badge className="bg-primary">Pro</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Rp 249.500/bulan · Renewal pada 22 Juli 2024
                </p>
              </div>
              <Button variant="outline">Ubah Paket</Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-red-500" />
                <div>
                  <CardTitle>Keamanan</CardTitle>
                  <CardDescription>
                    Kelola keamanan akun Anda
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline">Ubah Password</Button>
              <Button variant="outline">
                Aktifkan Two-Factor Authentication
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
