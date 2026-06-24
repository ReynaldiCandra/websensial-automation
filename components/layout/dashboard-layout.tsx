'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  MessageCircle,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Package,
  BarChart3,
} from 'lucide-react'

const navigationItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: MessageCircle,
    label: 'Chat',
    href: '/dashboard/chat',
  },
  {
    icon: Users,
    label: 'Leads',
    href: '/dashboard/leads',
  },
  {
    icon: FileText,
    label: 'Quotations',
    href: '/dashboard/quotations',
  },
  {
    icon: FileText,
    label: 'Invoices',
    href: '/dashboard/invoices',
  },
  {
    icon: Package,
    label: 'Products',
    href: '/dashboard/products',
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    href: '/dashboard/analytics',
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/dashboard/settings',
  },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } bg-card border-r border-border transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-6 border-b border-border flex flex-col items-center justify-center">
          <Image 
            src="/websensial-logo.png" 
            alt="Websensial" 
            width={48} 
            height={48}
            className="w-12 h-12"
            priority
          />
          <p className="text-xs font-semibold text-muted-foreground mt-2 text-center">
            AI Sales Automation
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 text-foreground transition-colors group">
                  <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold hover:bg-primary/90 transition-colors">
              W
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
