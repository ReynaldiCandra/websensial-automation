'use client'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Crown, ShieldCheck, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TeamPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [members, setMembers] = useState<{id:string,email:string,role:string}[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setMembers([{ id: user.id, email: user.email ?? '', role: 'owner' }])
    })
  }, [])

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6" /> Manajemen Tim</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola anggota tim dan akses dashboard</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">Undang Anggota</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@domain.com"
              className="flex-1 border border-border rounded-md px-3 py-2 text-sm bg-background" />
            <Button onClick={() => alert('Fitur invite akan tersedia setelah setup company_members table')}>Undang</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Anggota ({members.length})</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border">
            {members.map(m => (
              <div key={m.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                    {m.email[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.email}</p>
                    <span className="text-xs text-yellow-400 flex items-center gap-1"><Crown className="w-3 h-3"/> owner</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
