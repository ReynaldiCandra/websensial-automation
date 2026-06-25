'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

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
    <div style={{ minHeight: '100vh', background: '#0D0D12', color: '#E2E8F0' }}>
      {/* Navigation */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,13,18,0.8)', backdropFilter: 'blur(10px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo & Brand */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
            <Image
              src="/websensial-logo-full.png"
              alt="Websensial"
              width={40}
              height={40}
              style={{ height: 40, width: 'auto', objectFit: 'contain' }}
            />
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#E2E8F0' }}>Websensial</span>
          </Link>

          {/* Menu Items */}
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <a href="#features" style={{ fontSize: '14px', color: '#CBD5E0', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#10B981'} onMouseLeave={e => e.currentTarget.style.color = '#CBD5E0'}>
              Fitur
            </a>
            <a href="#pricing" style={{ fontSize: '14px', color: '#CBD5E0', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#10B981'} onMouseLeave={e => e.currentTarget.style.color = '#CBD5E0'}>
              Harga
            </a>
            <a href="#how-it-works" style={{ fontSize: '14px', color: '#CBD5E0', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#10B981'} onMouseLeave={e => e.currentTarget.style.color = '#CBD5E0'}>
              Cara Kerja
            </a>
            <a href="#use-cases" style={{ fontSize: '14px', color: '#CBD5E0', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#10B981'} onMouseLeave={e => e.currentTarget.style.color = '#CBD5E0'}>
              Use Case
            </a>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/auth/login" style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#CBD5E0', textDecoration: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.color = '#10B981' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#CBD5E0' }}>
              Login
            </Link>
            <Link href="/auth/sign-up" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#10B981', color: '#FFF', textDecoration: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#059669'} onMouseLeave={e => e.currentTarget.style.background = '#10B981'}>
              Mulai Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #0D0D12 0%, #1a1a25 100%)', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, #10B98133 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }} />
        
        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          {/* Left Content */}
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '56px', fontWeight: 700, color: '#E2E8F0', marginBottom: '20px', lineHeight: '1.2' }}>
              AI Sales Agent yang handle chat Kamu <span style={{ color: '#10B981' }}>sampai closing</span>.
            </h1>
            <p style={{ fontSize: '16px', color: '#94A3B8', marginBottom: '32px', lineHeight: '1.6', maxWidth: '500px' }}>
              Chat numpuk, customer minta harga, follow-up lupa, invoice telat? Websensial bantu jawab otomatis informasi produk/layanan Anda, kirim quotation dan invoice, reminder, sampai closing.
            </p>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <Link href="/auth/sign-up" style={{ padding: '12px 32px', borderRadius: '24px', border: 'none', background: '#10B981', color: '#FFF', textDecoration: 'none', fontSize: '16px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#059669'} onMouseLeave={e => e.currentTarget.style.background = '#10B981'}>
                Coba Gratis Sekarang
              </Link>
              <Link href="#demo" style={{ padding: '12px 32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#CBD5E0', textDecoration: 'none', fontSize: '16px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.color = '#10B981' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#CBD5E0' }}>
                Lihat Fitur
              </Link>
            </div>

            <p style={{ fontSize: '14px', color: '#64748B' }}>
              Duduk manis dan Websensial membantu Kamu dari chat masuk sampai closing.
            </p>
          </div>

          {/* Right - Chat Demo */}
          <div style={{ position: 'relative' }}>
            <div style={{ background: 'rgba(17,17,24,0.6)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(10px)' }}>
              {/* Chat Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 700, fontSize: '18px' }}>AI</div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', margin: '0 0 2px' }}>GlowMate Skincare</p>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Online, bantu chat sampai closing <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                  </p>
                </div>
              </div>

              {/* Chat Messages */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
                {[
                  { type: 'customer', text: 'Halo kak, ada skincare buat kulit kusam?' },
                  { type: 'ai', text: 'Halo kak, ada nih. Buat kulit kusam biasanya best seller kami Bright Glow Serum.' },
                  { type: 'customer', text: 'Berapa harganya?' },
                  { type: 'ai', text: 'Rp149.000. Serum ringan untuk kulit kusam dan bekas jerawat.' },
                  { type: 'customer', text: 'Mau order, bisa diskon ga?' },
                  { type: 'ai', text: 'Bisa kak, aku bikinin penawaran khusus ya.' },
                ].map((msg, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: msg.type === 'customer' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: '12px', background: msg.type === 'customer' ? 'rgba(107,114,128,0.2)' : '#10B98133', color: '#E2E8F0', fontSize: '13px', lineHeight: '1.4' }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div style={{ display: 'flex', gap: '8px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <input type="text" placeholder="Ketik pesan..." style={{ flex: 1, background: 'transparent', border: 'none', color: '#E2E8F0', fontSize: '13px', outline: 'none' }} />
                <button style={{ background: '#10B981', border: 'none', borderRadius: '4px', color: '#FFF', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Send</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 24px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: 700, color: '#E2E8F0', marginBottom: '16px' }}>Fitur Lengkap untuk Sales</h2>
            <p style={{ fontSize: '16px', color: '#94A3B8', maxWidth: '600px', margin: '0 auto' }}>Semua tools yang Anda butuhkan untuk mengelola sales dari satu dashboard</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { icon: '💬', title: 'AI Chat', desc: 'Jawab otomatis dengan AI yang terlatih dari data Anda' },
              { icon: '📊', title: 'Sales Pipeline', desc: 'Kanban board untuk track progress setiap deal' },
              { icon: '📄', title: 'Quotation & Invoice', desc: 'Buat dan kirim langsung ke WhatsApp' },
              { icon: '💳', title: 'Payment Tracking', desc: 'Review bukti bayar dan update status otomatis' },
              { icon: '👥', title: 'Lead Management', desc: 'Score leads berdasarkan engagement & interest' },
              { icon: '📈', title: 'Analytics', desc: 'Dashboard lengkap untuk metrics dan insights' },
            ].map((feat, idx) => (
              <div key={idx} style={{ padding: '24px', background: '#0D0D12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.background = 'rgba(16,185,129,0.05)' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = '#0D0D12' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{feat.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px', margin: 0 }}>{feat.title}</h3>
                <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '60px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #10B98133 0%, #6C3BF533 100%)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '42px', fontWeight: 700, color: '#E2E8F0', marginBottom: '16px' }}>Siap meningkatkan penjualan Anda?</h2>
          <p style={{ fontSize: '16px', color: '#94A3B8', marginBottom: '32px' }}>Mulai dengan gratis, tidak perlu kartu kredit</p>
          <Link href="/auth/sign-up" style={{ display: 'inline-block', padding: '14px 40px', borderRadius: '24px', background: '#10B981', color: '#FFF', textDecoration: 'none', fontSize: '16px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#059669'} onMouseLeave={e => e.currentTarget.style.background = '#10B981'}>
            Mulai Trial Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 24px', background: '#0D0D12', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Image
              src="/websensial-logo-full.png"
              alt="Websensial"
              width={32}
              height={32}
              style={{ height: 32, width: 'auto', objectFit: 'contain' }}
            />
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#E2E8F0' }}>Websensial</span>
          </div>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>© 2026 Websensial. All rights reserved. Made with ❤️ for sales teams.</p>
        </div>
      </footer>
    </div>
  )
}
