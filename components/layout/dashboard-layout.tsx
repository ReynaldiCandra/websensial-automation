'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, MessageCircle, Sparkles, Users, GitMerge,
  FileText, CheckSquare, Package, BarChart3, CreditCard,
  Users2, BookOpen, LogOut, Menu, X, ChevronRight
} from 'lucide-react'

const navItems = [
  { group: 'Main', items: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: MessageCircle, label: 'Chat', href: '/dashboard/chat' },
    { icon: Sparkles, label: 'AI Training', href: '/dashboard/ai-training' },
  ]},
  { group: 'Sales', items: [
    { icon: Users, label: 'Leads', href: '/dashboard/leads' },
    { icon: GitMerge, label: 'Pipeline', href: '/dashboard/pipeline' },
    { icon: FileText, label: 'Quotations', href: '/dashboard/quotations' },
    { icon: FileText, label: 'Invoices', href: '/dashboard/invoices' },
    { icon: CheckSquare, label: 'Bukti Bayar', href: '/dashboard/payment-proof' },
  ]},
  { group: 'Settings', items: [
    { icon: Package, label: 'Products', href: '/dashboard/products' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: CreditCard, label: 'Credits', href: '/dashboard/credits' },
    { icon: Users2, label: 'Tim', href: '/dashboard/settings/team' },
    { icon: BookOpen, label: 'API Docs', href: '/dashboard/api-docs' },
  ]},
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0D0D12', color: '#E2E8F0', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 220,
        background: '#111118',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 0' : '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', minHeight: 64 }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Image src="/websensial-logo-tech.png" alt="Websensial" width={120} height={32} style={{ height: 28, width: 'auto', objectFit: 'contain' }} />
            </div>
          )}
          {collapsed && (
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6C3BF5,#4F1FD4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'white' }}>W</div>
          )}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', padding: 4 }}>
              <X size={14} />
            </button>
          )}
        </div>

        {collapsed && (
          <button onClick={() => setCollapsed(false)} style={{ background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', padding: '12px 0', display: 'flex', justifyContent: 'center' }}>
            <Menu size={16} />
          </button>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {navItems.map(({ group, items }) => (
            <div key={group} style={{ marginBottom: 8 }}>
              {!collapsed && (
                <p style={{ fontSize: 10, fontWeight: 600, color: '#4A5568', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 8px 4px', margin: 0 }}>{group}</p>
              )}
              {items.map(({ icon: Icon, label, href }) => {
                const isActive = pathname === href
                return (
                  <Link key={href} href={href}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: collapsed ? '10px 0' : '9px 10px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: 8, marginBottom: 2, cursor: 'pointer',
                      background: isActive ? 'rgba(108,59,245,0.15)' : 'transparent',
                      color: isActive ? '#A78BFA' : '#64748B',
                      transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = '#CBD5E0' } }}
                      onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#64748B' } }}
                    >
                      <Icon size={16} style={{ flexShrink: 0 }} />
                      {!collapsed && <span style={{ fontSize: 13, fontWeight: isActive ? 500 : 400 }}>{label}</span>}
                      {!collapsed && isActive && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10, padding: collapsed ? '10px 0' : '9px 10px', borderRadius: 8, border: 'none',
            background: 'transparent', color: '#4A5568', cursor: 'pointer', fontSize: 13,
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color = '#FC8181' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#4A5568' }}
          >
            <LogOut size={16} />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: 56, background: '#111118', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
          <div style={{ fontSize: 13, color: '#4A5568' }}>
            {pathname.split('/').filter(Boolean).map((p, i, arr) => (
              <span key={i}>
                <span style={{ color: i === arr.length - 1 ? '#CBD5E0' : '#4A5568', textTransform: 'capitalize' }}>{p.replace(/-/g, ' ')}</span>
                {i < arr.length - 1 && <span style={{ margin: '0 6px' }}>/</span>}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6C3BF5,#4F1FD4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'white' }}>W</div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', background: '#0D0D12' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
