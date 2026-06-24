'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  MessageCircle,
  Zap,
  BarChart3,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setEmail('')
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/websensial-logo.png"
              alt="Websensial"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="font-bold text-lg">Websensial</span>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a href="#features" className="text-sm hover:text-primary transition">
              Fitur
            </a>
            <a href="#pricing" className="text-sm hover:text-primary transition">
              Harga
            </a>
            <a href="#demo" className="text-sm hover:text-primary transition">
              Demo
            </a>
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm">Mulai Gratis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              AI Sales Automation untuk WhatsApp
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Websensial.ai mengotomasi proses penjualan Anda dari chat pertama hingga closing.
              Gunakan AI untuk generate respons yang personal dan natural.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/auth/sign-up">
                <Button size="lg" className="gap-2">
                  Coba Sekarang <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  Lihat Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-16 rounded-lg border border-border overflow-hidden bg-card">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-24 h-24 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Dashboard & Chat Interface Preview
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <p className="text-sm text-muted-foreground">Businesses menggunakan</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">+60%</div>
            <p className="text-sm text-muted-foreground">Peningkatan Closing Rate</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <p className="text-sm text-muted-foreground">AI Response Otomatis</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">$0</div>
            <p className="text-sm text-muted-foreground">Setup cost (gratis!)</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Fitur Unggulan</h2>
            <p className="text-lg text-muted-foreground">
              Semua tools yang Anda butuhkan untuk scale penjualan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-lg border border-border hover:border-primary transition bg-card">
              <Sparkles className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">AI Assistant Cerdas</h3>
              <p className="text-muted-foreground mb-4">
                Generate respons otomatis dengan 4 tone berbeda: Profesional, Ramah, Rendah Hati, Energik
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>Respons natural & personal</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>Customize per audience</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>One-click insertion</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-lg border border-border hover:border-primary transition bg-card">
              <MessageCircle className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Live Chat WhatsApp</h3>
              <p className="text-muted-foreground mb-4">
                Manage semua customer conversations di satu dashboard terpusat
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>Real-time messaging</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>Multi-chat management</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>Chat history lengkap</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-lg border border-border hover:border-primary transition bg-card">
              <Users className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Lead Management</h3>
              <p className="text-muted-foreground mb-4">
                Track semua lead dengan scoring otomatis dan temperature indicator
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>AI Lead Scoring</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>Hot/Warm/Cold status</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>Pipeline management</span>
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-lg border border-border hover:border-primary transition bg-card">
              <BarChart3 className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Quotation & Invoice</h3>
              <p className="text-muted-foreground mb-4">
                Generate & track quotations dan invoices secara otomatis
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>Auto-generate docs</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>Payment tracking</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>Revenue analytics</span>
                </li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-lg border border-border hover:border-primary transition bg-card">
              <Zap className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Automation Workflows</h3>
              <p className="text-muted-foreground mb-4">
                Set up rules untuk auto-respond & follow-up dengan perfect timing
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>Trigger-based actions</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>Smart scheduling</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>No-code builder</span>
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-lg border border-border hover:border-primary transition bg-card">
              <BarChart3 className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground mb-4">
                Real-time dashboard dengan detailed insights tentang sales performance
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>Conversion metrics</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>Revenue tracking</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>Custom reports</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Bagaimana Cara Kerjanya?</h2>
            <p className="text-lg text-muted-foreground">
              3 langkah sederhana untuk start
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Connect WhatsApp</h3>
              <p className="text-muted-foreground">
                Hubungkan nomor WhatsApp bisnis Anda dalam hitungan menit
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-background text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Setup AI Assistant</h3>
              <p className="text-muted-foreground">
                Train AI dengan produk & tone komunikasi Anda yang unik
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Start Automating</h3>
              <p className="text-muted-foreground">
                Mulai auto-respond & watch conversion rate naik hingga 60%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Pricing Transparan</h2>
            <p className="text-lg text-muted-foreground">
              Mulai gratis, bayar saat ada penggunaan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="p-8 rounded-lg border border-border bg-card">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-muted-foreground mb-6">Untuk testing & SMB</p>
              <div className="text-4xl font-bold mb-6">
                Rp 0<span className="text-lg text-muted-foreground">/bulan</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>1 chat conversation</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>AI responses limited</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Basic dashboard</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Community support</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Mulai Gratis
              </Button>
            </div>

            {/* Growth */}
            <div className="p-8 rounded-lg border-2 border-primary bg-card relative md:-mt-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                Recommended
              </div>
              <h3 className="text-2xl font-bold mb-2">Growth</h3>
              <p className="text-muted-foreground mb-6">Untuk business scaling</p>
              <div className="text-4xl font-bold mb-6">
                Rp 299K<span className="text-lg text-muted-foreground">/bulan</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>10 chat conversations</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Unlimited AI responses</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Email support</span>
                </li>
              </ul>
              <Button className="w-full">
                Upgrade ke Growth
              </Button>
            </div>

            {/* Enterprise */}
            <div className="p-8 rounded-lg border border-border bg-card">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-muted-foreground mb-6">Custom solution</p>
              <div className="text-4xl font-bold mb-6">
                Custom<span className="text-lg text-muted-foreground">/bulan</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Unlimited everything</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>SLA guarantee</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Scale Sales Anda?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join 500+ businesses yang sudah meningkatkan closing rate mereka dengan Websensial.ai
          </p>

          <form onSubmit={handleSubmit} className="flex gap-3 justify-center flex-wrap max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 backdrop-blur text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              required
            />
            <Button
              type="submit"
              variant="secondary"
              className="px-6 py-3"
            >
              Coba Sekarang
            </Button>
          </form>

          {submitted && (
            <p className="mt-4 text-sm text-white/80">
              ✓ Thanks! Check your email for next steps.
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/websensial-logo.png"
                  alt="Websensial"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                <span className="font-bold">Websensial</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI Sales Automation untuk WhatsApp Business
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-foreground transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Docs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2024 Websensial.ai. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-foreground transition">
                Twitter
              </a>
              <a href="#" className="hover:text-foreground transition">
                LinkedIn
              </a>
              <a href="#" className="hover:text-foreground transition">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
