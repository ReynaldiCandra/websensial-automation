'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard, MessageCircle, Smartphone, BrainCircuit, Users, GitBranch,
  FileText, Receipt, CreditCard, Package, BarChart2,
  Zap, Settings, ChevronLeft, Menu, LogOut, Bell, Flame, X,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  title: string
  message: string
  type: 'hot_lead' | 'new_message' | 'payment'
  time: string
  read: boolean
}

function NotificationBell() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [hasNew, setHasNew] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('realtime-notifs')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'leads',
      }, (payload) => {
        const lead = payload.new as { name?: string; phone?: string; temperature?: string; id?: string }
        const isHot = lead.temperature === 'hot'
        const notif: Notification = {
          id: lead.id ?? Date.now().toString(),
          title: isHot ? '🔥 Hot Lead Masuk!' : '👤 Lead Baru',
          message: `${lead.name ?? lead.phone ?? 'Customer baru'} baru saja masuk`,
          type: isHot ? 'hot_lead' : 'new_message',
          time: 'baru saja',
          read: false,
        }
        setNotifs(prev => [notif, ...prev].slice(0, 10))
        setHasNew(true)
        // Play sound
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2ozESxgm8zl')
          audio.volume = 0.3
          void audio.play()
        } catch {}
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
      }, (payload) => {
        const msg = payload.new as { sender_type?: string; message_text?: string; id?: string }
        if (msg.sender_type !== 'user') return
        const notif: Notifica = {
          id: msg.id ?? Date.now().toString(),
          title: '💬 Pesan Baru',
          message: (msg.message_text ?? '').slice(0, 50) + ((msg.message_text ?? '').length > 50 ? '...' : ''),
          type: 'new_message',
          time: 'baru saja',
          read: false,
        }
        setNotifs(prev => [notif, ...prev].slice(0, 10))
        setHasNew(true)
      })
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [supabase])

  const unread = notifs.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    setHasNew(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(o => !o); if (open) markAllRead() }}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/[0.05] transition-colo"
      >
        <Bell className={cn('w-4 h-4', hasNew ? 'text-violet-400' : 'text-white/40')} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-[#16161F] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
            <span className="text-sm font-semibold text-white">Notifikasi</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-violet-400 hover:text-violet-300">
                  Tandai semua dibaca
                </button>
              )}
              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4 text-white/30 hover:text-white/70" />
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-xs text-white/30">Belum ada notifikasi</p>
              </div>
            ) : (
              notifs.map(notif => (
                <div key={notif.id} className={cn(
                  'px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors',
                  !notif.read && 'bg-violet-500/5'
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm',
                      notif.type === 'hot_lead' ? 'bg-red-500/20' : 'bg-violet-500/20'
                    )}>
                      {notif.type === 'hot_lead' ? '🔥' : '💬'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/90">{notif.title}</p>
                      <p className="text-xs text-white/40 mt-0.5 truncate">{notif.message}</p>
                      <p className="text-[10px] text-white/20 mt-1">{notif.time}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {notifs.length > 0 && (
            <div className="px-4 py-2.5 border-t border-white/[0.05]">
              <button
                onClick={() => { setNotifs([]); setOpen(false) }}
                className="text-xs text-white/30 hover:text-white/50 w-full text-center"
              >
            Hapus semua notifikasi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-[64px] flex items-center justify-end px-6 border-b border-white/[0.05] bg-[#0A0A10] flex-shrink-0">
          <NotificationBell />
        </div>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
