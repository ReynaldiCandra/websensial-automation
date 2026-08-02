import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Dashboard | Websensial',
  description: 'Lead management and automation dashboard',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 border-r bg-card">
          <div className="p-6">
            <h2 className="text-lg font-bold">Websensial</h2>
            <p className="text-xs text-muted-foreground">Lead Automation</p>
          </div>

          <nav className="space-y-2 px-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/leads">
              <Button variant="ghost" className="w-full justify-start">
                Leads
              </Button>
            </Link>
            <Link href="/dashboard/chats">
              <Button variant="ghost" className="w-full justify-start">
                Chats
              </Button>
            </Link>
            <Link href="/dashboard/rules">
              <Button variant="ghost" className="w-full justify-start">
                Rules
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button variant="ghost" className="w-full justify-start">
                Analytics
              </Button>
            </Link>
          </nav>

          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full justify-start">
                Settings
              </Button>
            </Link>
            <form action="/auth/logout" method="POST">
              <Button variant="ghost" className="w-full justify-start text-red-600">
                Logout
              </Button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
