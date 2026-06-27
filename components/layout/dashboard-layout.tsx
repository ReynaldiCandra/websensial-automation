'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard, MessageCircle, Smartphone, BrainCircuit, Users, GitBranch,
  FileText, Receipt, CreditCard, Package, BarChart2,
  Zap, Settings, ChevronLeft, Menu, LogOut,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const nav = [
  {
    label: 'MAIN',
    items: [
      { href: '/dashboard',               icon: LayoutDashboard, label: 'Overview' },
      { href: '/dashboard/chats',         icon: MessageCircle,   label: 'Chat' },
      { href: '/dashboard/whatsapp',      icon: Smartphone,      label: 'WhatsApp' },
      { href: '/dashboard/ai-training',   icon: BrainCircuit,    label: 'AI Training' },
    ],
  },
  {
    label: 'SALES',
    items: [
      { href: '/dashboard/leads',         icon: Users,      label: 'Leads' },
      { href: '/dashboard/pipeline',      icon: GitBranch,  label: 'Pipeline' },
      { href: '/dashboard/quotations',    icon: FileText,   label: 'Quotations' },
      { href: '/dashboard/invoices',      icon: Receipt,    label: 'Invoices' },
      { href: '/dashboard/payment-proof', icon: CreditCard, label: 'Bukti Bayar' },
    ],
  },
  {
    label: 'MANAGE',
    items: [
      { href: '/dashboard/products',      icon: Package,   label: 'Products' },
      { href: '/dashboard/analytics',     icon: BarChart2, label: 'Analytics' },
      { href: '/dashboard/credits',       icon: Zap,       label: 'Credits' },
      { href: '/dashboard/settings/team', icon: Users,     label: 'Tim' },
      { href: '/dashboard/settings',      icon: Settings,  label: 'Settings' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn(
      'flex flex-col h-full transition-all duration-300 relative',
      'bg-[#0D0D14] border-r border-white/[0.05]',
      collapsed ? 'w-[68px]' : 'w-[220px]'
    )}>

      {/* Logo */}
      <div className={cn(
        'flex items-center border-b border-white/[0.05] h-[64px]',
        collapsed ? 'justify-center px-3' : 'px-5'
      )}>
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-white font-semibold text-[15px] tracking-tight">Websensial</span>
          </Link>
        ) : (
          <Link href="/dashboard">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-900 flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5">
        {nav.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-white/20 px-2.5 mb-1.5 tracking-widest uppercase">
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
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150',
                      collapsed ? 'justify-center w-10 h-10 mx-auto' : 'px-3 py-2.5',
                      active
                        ? 'bg-violet-600/20 text-violet-300'
                        : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05]'
                    )}
                  >
                    <item.icon className={cn('flex-shrink-0', collapsed ? 'w-4 h-4' : 'w-4 h-4')} />
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-white/[0.05] p-3">
        <button
          onClick={() => setCollapsed(c => !c)}
          className={cn(
            'flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors text-xs rounded-lg p-2 w-full hover:bg-white/[0.05]',
            collapsed && 'justify-center'
          )}
        >
          {collapsed
            ? <Menu className="w-4 h-4" />
            : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>
          }
        </button>
      </div>
      <div className="p-2 border-t border-border">
        <button
          onClick={async () => {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            await supabase.auth.signOut()
            window.location.href = '/auth/login'
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A10]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
