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
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/websensial-logo-teal.png"
              alt="Websensial"
              width={180}
              height={48}
              className="h-10 w-auto"
            />
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a href="#features" className="text-sm text-gray-600 hover:text-teal-600 transition font-medium">
              Fitur
            </a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-teal-600 transition font-medium">
              Harga
            </a>
            <a href="#cara-kerja" className="text-sm text-gray-600 hover:text-teal-600 transition font-medium">
              Cara Kerja
            </a>
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                Masuk
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                Mulai Gratis
              </Button>
            </Link>
          </div>
          {/* Mobile nav */}
          <div className="flex md:hidden gap-2">
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="border-teal-600 text-teal-600 text-xs">Masuk</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs">Daftar</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-teal-50/30 to-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-sm text-teal-700 font-medium">AI Sales Automation untuk WhatsApp</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-gray-900">
            Jual Lebih Banyak,<br />
            <span className="text-teal-600">Kerja Lebih Sedikit</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Websensial mengotomasi proses penjualan WhatsApp Anda — dari chat pertama sampai closing — dengan AI yang merespons natural layaknya tim sales terbaik.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white gap-2 px-8 py-6 text-base">
                Coba Gratis Sekarang <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#cara-kerja">
              <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:border-teal-600 hover:text-teal-600 px-8 py-6 text-base">
                Lihat Cara Kerja
              </Button>
            </a>
          </div>

          {/* Hero mockup */}
          <div className="mt-16 rounded-2xl border border-gray-200 overflow-hidden shadow-2xl shadow-teal-100 bg-white mx-auto max-w-4xl">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="ml-4 bg-white rounded border border-gray-200 px-3 py-1 text-xs text-gray-400 w-64 text-left">
                app.websensial.ai/dashboard
              </div>
            </div>
            <div className="aspect-video bg-gradient-to-br from-teal-50 to-white flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-teal-600" />
                </div>
                <p className="text-gray-400 text-sm font-medium">Dashboard Preview</p>
                <p className="text-gray-300 text-xs mt-1">AI Chat · Leads · Analytics · Invoices</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-teal-400 mb-2">500+</div>
            <p className="text-sm text-gray-400">Bisnis aktif</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-teal-400 mb-2">+60%</div>
            <p className="text-sm text-gray-400">Closing rate naik</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-teal-400 mb-2">24/7</div>
            <p className="text-sm text-gray-400">AI respons otomatis</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-teal-400 mb-2">Rp 0</div>
            <p className="text-sm text-gray-400">Biaya setup</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-wider mb-3">Fitur Unggulan</p>
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Semua yang Anda Butuhkan</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Tools lengkap untuk scale penjualan tanpa tambah tim
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'AI Assistant Cerdas',
                desc: 'Respons otomatis dengan 4 tone: Profesional, Ramah, Rendah Hati, Energik',
                items: ['Respons natural & personal', 'Customize per audience', 'One-click insertion'],
              },
              {
                icon: MessageCircle,
                title: 'Live Chat WhatsApp',
                desc: 'Semua percakapan customer dalam satu dashboard terpusat',
                items: ['Real-time messaging', 'Multi-chat management', 'Riwayat chat lengkap'],
              },
              {
                icon: Users,
                title: 'Lead Management',
                desc: 'Track lead dengan scoring otomatis dan temperature indicator',
                items: ['AI Lead Scoring', 'Hot/Warm/Cold status', 'Pipeline management'],
              },
              {
                icon: BarChart3,
                title: 'Quotation & Invoice',
                desc: 'Generate dan track penawaran & invoice secara otomatis',
                items: ['Auto-generate dokumen', 'Pelacakan pembayaran', 'Revenue analytics'],
              },
              {
                icon: Zap,
                title: 'Automation Workflows',
                desc: 'Set up rules untuk auto-respond & follow-up dengan timing yang tepat',
                items: ['Trigger-based actions', 'Smart scheduling', 'No-code builder'],
              },
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                desc: 'Dashboard real-time dengan insight mendalam tentang performa sales',
                items: ['Conversion metrics', 'Revenue tracking', 'Custom reports'],
              },
            ].map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="p-6 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50 transition-all duration-200 bg-white group">
                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{f.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 leading-relaxed">{f.desc}</p>
                  <ul className="space-y-2">
                    {f.items.map((item, j) => (
                      <li key={j} className="flex gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="cara-kerja" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-wider mb-3">Cara Kerja</p>
            <h2 className="text-4xl font-bold mb-4 text-gray-900">3 Langkah Mulai</h2>
            <p className="text-lg text-gray-500">Setup dalam hitungan menit, bukan hari</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-0.5 bg-teal-100"></div>
            {[
              { num: '1', title: 'Connect WhatsApp', desc: 'Hubungkan nomor WhatsApp bisnis Anda dalam hitungan menit. Tidak perlu coding.' },
              { num: '2', title: 'Setup AI Assistant', desc: 'Train AI dengan info produk & tone komunikasi unik bisnis Anda.' },
              { num: '3', title: 'Start Automating', desc: 'Mulai auto-respond dan lihat closing rate naik hingga 60%.' },
            ].map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg shadow-teal-200">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-wider mb-3">Harga</p>
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Transparan, Tanpa Biaya Tersembunyi</h2>
            <p className="text-lg text-gray-500">Mulai gratis, upgrade saat bisnis berkembang</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="p-8 rounded-2xl border border-gray-200 bg-white">
              <h3 className="text-xl font-bold mb-1 text-gray-900">Starter</h3>
              <p className="text-gray-500 text-sm mb-6">Untuk testing & bisnis kecil</p>
              <div className="text-5xl font-bold mb-1 text-gray-900">Rp 0</div>
              <p className="text-gray-400 text-sm mb-8">/bulan</p>
              <ul className="space-y-3 mb-8">
                {['1 chat conversation', 'AI responses terbatas', 'Basic dashboard', 'Community support'].map((f, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/sign-up">
                <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:border-teal-600 hover:text-teal-600">
                  Mulai Gratis
                </Button>
              </Link>
            </div>

            <div className="p-8 rounded-2xl border-2 border-teal-600 bg-white relative shadow-xl shadow-teal-100 md:-mt-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold">
                Paling Populer
              </div>
              <h3 className="text-xl font-bold mb-1 text-gray-900">Growth</h3>
              <p className="text-gray-500 text-sm mb-6">Untuk bisnis yang scaling</p>
              <div className="text-5xl font-bold mb-1 text-gray-900">Rp 299K</div>
              <p className="text-gray-400 text-sm mb-8">/bulan</p>
              <ul className="space-y-3 mb-8">
                {['10 chat conversations', 'Unlimited AI responses', 'Advanced analytics', 'Email support'].map((f, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/sign-up">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  Upgrade ke Growth
                </Button>
              </Link>
            </div>

            <div className="p-8 rounded-2xl border border-gray-200 bg-white">
              <h3 className="text-xl font-bold mb-1 text-gray-900">Enterprise</h3>
              <p className="text-gray-500 text-sm mb-6">Custom solution</p>
              <div className="text-5xl font-bold mb-1 text-gray-900">Custom</div>
              <p className="text-gray-400 text-sm mb-8">/bulan</p>
              <ul className="space-y-3 mb-8">
                {['Unlimited everything', 'Custom integrations', 'Dedicated support', 'SLA guarantee'].map((f, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:border-teal-600 hover:text-teal-600">
                Hubungi Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-teal-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">Siap Scale Sales Anda?</h2>
          <p className="text-xl mb-10 text-teal-100">
            Bergabung dengan 500+ bisnis yang sudah meningkatkan closing rate mereka.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-3 justify-center flex-wrap max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email bisnis Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 min-w-0"
              required
            />
            <Button type="submit" className="bg-white text-teal-600 hover:bg-teal-50 font-semibold px-6">
              Coba Sekarang
            </Button>
          </form>
          {submitted && (
            <p className="mt-4 text-sm text-teal-100">✓ Terima kasih! Cek email Anda untuk langkah selanjutnya.</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <Image
                src="/websensial-logo-teal.png"
                alt="Websensial"
                width={140}
                height={36}
                className="h-8 w-auto mb-4"
              />
              <p className="text-sm text-gray-500 leading-relaxed">
                AI Sales Automation untuk WhatsApp Business Indonesia.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 text-sm">Produk</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                {['Fitur', 'Harga', 'Dokumentasi'].map((l) => (
                  <li key={l}><a href="#" className="hover:text-teal-600 transition">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 text-sm">Perusahaan</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                {['Tentang Kami', 'Blog', 'Kontak'].map((l) => (
                  <li key={l}><a href="#" className="hover:text-teal-600 transition">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                {['Privasi', 'Syarat & Ketentuan'].map((l) => (
                  <li key={l}><a href="#" className="hover:text-teal-600 transition">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2025 Websensial. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              {['Twitter', 'LinkedIn', 'Instagram'].map((s) => (
                <a key={s} href="#" className="hover:text-teal-600 transition">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
