'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard, MessageCircle, Smartphone, BrainCircuit, Users, GitBranch,
  FileText, Receipt, CreditCard, Package, BarChart2,
  Zap, Settings, ChevronLeft, Menu, X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const nav = [
  {
    label: 'MAIN',
    items: [
      { href: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/dashboard/chats',     icon: MessageCircle,   label: 'Chat' },
      { href: '/dashboard/ai-training', icon: BrainCircuit,  label: 'AI Training' },
    ],
  },
  {
    label: 'SALES',
    items: [
      { href: '/dashboard/leads',          icon: Users,     label: 'Leads' },
      { href: '/dashboard/pipeline',       icon: GitBranch, label: 'Pipeline' },
      { href: '/dashboard/quotations',     icon: FileText,  label: 'Quotations' },
      { href: '/dashboard/invoices',       icon: Receipt,   label: 'Invoices' },
      { href: '/dashboard/payment-proof',  icon: CreditCard, label: 'Bukti Bayar' },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { href: '/dashboard/products',       icon: Package,   label: 'Products' },
      { href: '/dashboard/analytics',      icon: BarChart2, label: 'Analytics' },
      { href: '/dashboard/credits',        icon: Zap,       label: 'Credits' },
      { href: '/dashboard/settings/team',  icon: Users,     label: 'Tim' },
      { href: '/dashboard/settings',       icon: Settings,  label: 'Atur' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-card border-r border-border transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* ── Logo ─────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center">
            {/* Ganti /logo.png dengan path logo kamu di folder public/ */}
            <Image
              src="/logo.svg"
              alt="Websensial"
              width={120}
              height={32}
              className="object-contain"
              priority
              onError={(e) => {
                // Fallback jika logo.png belum ada
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
            {/* Fallback text — akan hilang begitu logo.png tersedia */}
            <span className="hidden text-lg font-bold text-primary">Websensial</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <Image
              src="/logo.svg"
              alt="W"
              width={32}
              height={32}
              className="object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="text-muted-foreground hover:text-foreground transition-colors ml-auto"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Navigation ───────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {nav.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-muted-foreground/60 px-2 mb-1 tracking-widest">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
