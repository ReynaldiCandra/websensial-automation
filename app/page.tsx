'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bot, Flame, MessageCircle, FileText, GitMerge, BarChart3,
  CheckCircle, ChevronDown, Menu, X, Zap, Shield, Clock,
  TrendingUp, Users, Star, ArrowRight
} from 'lucide-react'

const features = [
  { icon: Bot, title: 'AI Training', desc: 'Isi produk, harga, FAQ, tone brand. AI menjawab berdasarkan data bisnismu, bukan jawaban generic.' },
  { icon: Flame, title: 'Lead Scoring', desc: 'Deteksi buying signal otomatis. Hot, Warm, Cold langsung terbaca dari isi chat customer.' },
  { icon: MessageCircle, title: 'WhatsApp Chat', desc: 'Balas chat 24/7 otomatis. Admin bisa ambil alih kapan saja dengan satu klik.' },
  { icon: FileText, title: 'Quotation & Invoice', desc: 'Kirim penawaran dan invoice langsung dari chat. Customer tinggal bayar.' },
  { icon: GitMerge, title: 'Pipeline CRM', desc: 'Pantau semua deal dari tanya produk sampai closing di satu kanban board.' },
  { icon: BarChart3, title: 'Business Intelligence', desc: 'Lihat revenue, konversi, AI adoption rate, dan performa sales secara real-time.' },
]

const steps = [
  { icon: MessageCircle, num: '1', title: 'Customer Chat', desc: 'Customer tanya harga, promo, stok, atau cara order lewat WhatsApp.' },
  { icon: Bot, num: '2', title: 'AI Handle', desc: 'AI balas sesuai produk, harga, FAQ, dan tone brand yang sudah kamu isi.' },
  { icon: Zap, num: '3', title: 'Closing Action', desc: 'AI deteksi hot lead, kirim quotation atau invoice, dan follow-up otomatis.' },
  { icon: BarChart3, num: '4', title: 'Deal Terpantau', desc: 'Pipeline update, owner bisa lihat lead, invoice, dan revenue dari dashboard.' },
]

const plans = [
  {
    name: 'Trial', monthlyPrice: 0, yearlyPrice: 0, badge: '',
    desc: 'Coba dulu 7 hari gratis',
    features: ['50 Customer / trial', '100 Credit', '1 nomor WhatsApp', '2 user', 'Lead Scoring', 'Pipeline CRM'],
  },
  {
    name: 'Starter', monthlyPrice: 199000, yearlyPrice: 99500, badge: '',
    desc: 'Untuk bisnis kecil',
    features: ['300 Customer / bulan', '2.000 Credit', '1 nomor WhatsApp', '2 user', '25 Produk & 50 FAQ', 'Lead Scoring & Pipeline'],
  },
  {
    name: 'Growth', monthlyPrice: 499000, yearlyPrice: 249500, badge: 'Paling Populer',
    desc: 'Paling pas untuk scale',
    features: ['1.000 Customer / bulan', '7.500 Credit', '1 nomor WA & 5 user', '100 Produk & 200 FAQ', '5x Scan Brand / bulan', 'Full Auto & Pipeline'],
  },
  {
    name: 'Business', monthlyPrice: 999000, yearlyPrice: 499500, badge: '',
    desc: 'Volume chat aktif',
    features: ['3.000 Customer / bulan', '18.000 Credit', '3 nomor WA & 15 user', '500 Produk & 1.000 FAQ', 'Quotation & Invoice', 'Advanced Analytics & API'],
  },
]

const faqs = [
  { q: 'Apakah AI bisa tahu produk saya?', a: 'Bisa. Isi Produk & Harga, FAQ, cara menjawab, atau pakai Scan Brand Otomatis agar AI punya konteks yang jelas tentang bisnis kamu.' },
  { q: 'Apakah bisa menggantikan admin?', a: 'Bisa jadi co-pilot dulu, bisa juga full auto. Mulai dari mode suggestion, lanjut semi auto, lalu full auto setelah data training terasa aman.' },
  { q: 'Apakah AI bisa urus invoice sampai bayar?', a: 'Bisa. AI bisa membuat quotation, mengubahnya jadi invoice, mengirim instruksi bayar, follow-up pembayaran, dan memasukkan bukti bayar ke antrian review.' },
  { q: 'Bagaimana kalau AI tidak yakin?', a: 'Chat akan ditandai perlu admin. Kamu bisa ambil alih manual, kirim attachment, tambah catatan, lalu resume AI lagi saat sudah aman.' },
]

function formatPrice(price: number) {
  if (price === 0) return 'Gratis'
  return `Rp${(price / 1000).toFixed(0)}rb`
}

export default function LandingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#111' }}>

      {/* NAVBAR */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderBottom: '0.5px solid #e5e7eb', padding: '0 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#0F6E56' }}>Websensial</span>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }} className="hidden-mobile">
            {['Cara Kerja', 'Fitur', 'Harga', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
                style={{ fontSize: 14, color: '#374151', textDecoration: 'none', fontWeight: 500 }}>
                {item}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href="/auth/login">
              <button style={{ padding: '8px 16px', border: '0.5px solid #e5e7eb', borderRadius: 8, background: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#374151' }}>
                Login
              </button>
            </Link>
            <Link href="/auth/signup">
              <button style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: '#0F6E56', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'white' }}>
                Mulai Trial
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: '#020617', color: 'white', padding: '80px 24px 100px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(29,158,117,0.15)', border: '0.5px solid rgba(29,158,117,0.4)', borderRadius: 99, padding: '6px 16px', fontSize: 13, color: '#5DCAA5', marginBottom: 24, fontWeight: 500 }}>
            AI Sales Agent untuk WhatsApp
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: -1 }}>
            AI yang handle chat WhatsApp kamu sampai{' '}
            <span style={{ color: '#1D9E75' }}>closing</span>
          </h1>
          <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.7, margin: '0 0 36px' }}>
            Chat numpuk, customer minta harga, follow-up lupa, invoice telat? Biarkan AI jawab otomatis, kirim quotation, reminder, sampai closing.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/signup">
              <button style={{ padding: '14px 28px', background: '#1D9E75', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                Coba Gratis 7 Hari <ArrowRight size={16} />
              </button>
            </Link>
            <a href="#fitur">
              <button style={{ padding: '14px 28px', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.2)', borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: 'pointer', color: 'white' }}>
                Lihat Fitur
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <section style={{ background: '#0F6E56', padding: '20px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[
            { icon: Users, label: '300+ bisnis aktif' },
            { icon: MessageCircle, label: '60.000+ pesan diproses' },
            { icon: TrendingUp, label: '+60% closing rate' },
            { icon: Star, label: '11.300+ leads tercatat' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white' }}>
              <Icon size={16} style={{ opacity: 0.8 }} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CARA KERJA */}
      <section id="cara-kerja" style={{ padding: '80px 24px', background: '#f9fafb' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Cara Kerja</p>
            <h2 style={{ fontSize: 34, fontWeight: 700, margin: 0 }}>Dari customer tanya harga sampai bukti bayar masuk</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {steps.map(({ icon: Icon, num, title, desc }) => (
              <div key={num} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color="#0F6E56" />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1D9E75', background: '#E1F5EE', padding: '2px 8px', borderRadius: 99 }}>Step {num}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FITUR */}
      <section id="fitur" style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Fitur Utama</p>
            <h2 style={{ fontSize: 34, fontWeight: 700, margin: 0 }}>Bukan chatbot biasa. Ini mesin closing.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 24, transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#1D9E75')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={20} color="#0F6E56" />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px' }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="harga" style={{ padding: '80px 24px', background: '#f9fafb' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Harga</p>
            <h2 style={{ fontSize: 34, fontWeight: 700, margin: '0 0 20px' }}>Pilih paket sesuai kebutuhan</h2>
            <div style={{ display: 'inline-flex', background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: 4, gap: 4 }}>
              {(['monthly', 'yearly'] as const).map(cycle => (
                <button key={cycle} onClick={() => setBilling(cycle)}
                  style={{ padding: '8px 20px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: billing === cycle ? '#0F6E56' : 'transparent', color: billing === cycle ? 'white' : '#374151', transition: 'all 0.2s' }}>
                  {cycle === 'monthly' ? 'Bulanan' : 'Tahunan'}{cycle === 'yearly' && <span style={{ fontSize: 11, marginLeft: 4, color: billing === 'yearly' ? '#9FE1CB' : '#1D9E75' }}>Hemat 50%</span>}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {plans.map(plan => (
              <div key={plan.name} style={{ background: 'white', border: plan.badge ? '2px solid #1D9E75' : '0.5px solid #e5e7eb', borderRadius: 12, padding: 24, position: 'relative' }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#1D9E75', color: 'white', fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                    {plan.badge}
                  </div>
                )}
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>{plan.name}</h3>
                <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 16px' }}>{plan.desc}</p>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 28, fontWeight: 700 }}>
                    {formatPrice(billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)}
                  </span>
                  {plan.monthlyPrice > 0 && <span style={{ fontSize: 13, color: '#9ca3af' }}>/bulan</span>}
                </div>
                <div style={{ marginBottom: 20 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <CheckCircle size={14} color="#1D9E75" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 13, color: '#374151' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/auth/signup">
                  <button style={{ width: '100%', padding: '10px 0', background: plan.badge ? '#0F6E56' : 'white', color: plan.badge ? 'white' : '#0F6E56', border: `1px solid ${plan.badge ? '#0F6E56' : '#1D9E75'}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    {plan.monthlyPrice === 0 ? 'Mulai Trial Gratis' : `Pilih ${plan.name}`}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>FAQ</p>
            <h2 style={{ fontSize: 34, fontWeight: 700, margin: 0 }}>Pertanyaan yang sering muncul</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ border: '0.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>{faq.q}</span>
                  <ChevronDown size={16} color="#6b7280" style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 20px 16px', fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: '#020617', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: 'white', margin: '0 0 16px' }}>
            Jangan biarkan chat WhatsApp cuma jadi obrolan
          </h2>
          <p style={{ fontSize: 16, color: '#94a3b8', margin: '0 0 32px', lineHeight: 1.7 }}>
            Mulai trial gratis, hubungkan WhatsApp, isi data bisnis, dan biarkan AI handle chat sampai closing.
          </p>
          <Link href="/auth/signup">
            <button style={{ padding: '14px 32px', background: '#1D9E75', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', color: 'white', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Mulai Trial Gratis <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0a0f1a', padding: '40px 24px', borderTop: '0.5px solid #1e293b' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#1D9E75' }}>Websensial</span>
            <p style={{ fontSize: 12, color: '#475569', margin: '4px 0 0' }}>AI Sales Agent WhatsApp untuk bisnis Indonesia</p>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Fitur', 'Harga', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>{item}</a>
            ))}
            <Link href="/auth/login" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>Login</Link>
          </div>
          <p style={{ fontSize: 12, color: '#334155', margin: 0 }}>© 2026 Websensial. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
