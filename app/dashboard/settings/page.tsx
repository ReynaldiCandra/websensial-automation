'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Users, UserPlus, Mail, Trash2, Crown, ShieldCheck, User } from 'lucide-react'

interface TeamMember {
  id: string
  email: string
  role: 'owner' | 'admin' | 'member'
  status: 'active' | 'invited'
  joined_at?: string
}

const roleIcon = (role: string) => {
  if (role === 'owner') return <Crown className="w-3 h-3 text-yellow-400" />
  if (role === 'admin') return <ShieldCheck className="w-3 h-3 text-blue-400" />
  return <User className="w-3 h-3 text-muted-foreground" />
}

const roleBadge = (role: string) => {
  if (role === 'owner') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
  if (role === 'admin') return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  return 'bg-border text-muted-foreground'
}

export default function TeamPage() {
  const supabase = createClient()
  const [members, setMembers]     = useState<TeamMember[]>([])
  const [loading, setLoading]     = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole]   = useState<'admin' | 'member'>('member')
  const [inviting, setInviting]   = useState(false)
  const [plan, setPlan]           = useState<string>('Free')
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null)

  const maxMembers: Record<string, number> = {
    Free: 2, Starter: 2, Growth: 5, Business: 15, Scale: 50,
  }

  const getCompanyId = useCallback(async (): Promise<string | null> => {
    if (companyId) return companyId
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    setCurrentUser(user)
    const { data } = await supabase.from('companies').select('id').eq('owner_id', user.id).single()
    const id = data?.id ?? null
    if (id) setCompanyId(id)
    return id
  }, [supabase, companyId])

  const loadData = useCallback(async () => {
    const cid = await getCompanyId()
    if (!cid) return

    // Coba load dari company_members jika tabel tersedia
    const { data: membersData } = await supabase
      .from('company_members')
      .select('*')
      .eq('company_id', cid)

    if (membersData) {
      setMembers(membersData as TeamMember[])
    } else {
      // Fallback: hanya tampilkan owner
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setMembers([{
          id: user.id,
          email: user.email ?? '',
          role: 'owner',
          status: 'active',
          joined_at: user.created_at,
        }])
      }
    }

    // Load plan dari subscription jika tersedia
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('company_id', cid)
      .single()
    if (sub?.plan) setPlan(sub.plan)

    setLoading(false)
  }, [supabase, getCompanyId])

  useEffect(() => { void loadData() }, [loadData])

  const invite = async () => {
    if (!inviteEmail.trim() || inviting) return
    const max = maxMembers[plan] ?? 2
    if (members.length >= max) {
      alert(`Plan ${plan} hanya bisa ${max} user. Upgrade plan untuk tambah lebih banyak anggota.`)
      return
    }

    setInviting(true)
    const cid = await getCompanyId()
    if (!cid) { setInviting(false); return }

    const { error } = await supabase
      .from('company_members')
      .insert({
        company_id: cid,
        email: inviteEmail.trim(),
        role: inviteRole,
        status: 'invited',
      })

    if (!error) {
      setInviteEmail('')
      await loadData()
    } else {
      alert('Gagal invite: ' + error.message)
    }
    setInviting(false)
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('Hapus anggota ini?')) return
    await supabase.from('company_members').delete().eq('id', memberId)
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  const max = maxMembers[plan] ?? 2

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" /> Manajemen Tim
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola anggota tim dan akses dashboard
          </p>
        </div>

        {/* Kuota */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Anggota Tim</p>
                <p className="text-2xl font-bold mt-1">{members.length} <span className="text-sm text-muted-foreground font-normal">/ {max} slot</span></p>
              </div>
              <Badge variant="outline" className="text-xs">{plan}</Badge>
            </div>
            {members.length >= max && (
              <p className="text-xs text-yellow-400 mt-3 bg-yellow-500/10 px-3 py-2 rounded-md">
                ⚡ Kuota tim penuh. Upgrade plan untuk menambah lebih banyak anggota.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Invite */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Undang Anggota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="email@domain.com"
                  className="pl-9"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && void invite()}
                />
              </div>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as 'admin' | 'member')}
                className="border border-border rounded-md px-3 text-sm bg-background text-foreground"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <Button onClick={() => void invite()} disabled={!inviteEmail.trim() || inviting}>
                {inviting ? 'Mengundang...' : 'Undang'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Member list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Anggota ({members.length})</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {loading && <p className="text-sm text-muted-foreground py-4 text-center">Memuat...</p>}
            {!loading && members.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">Belum ada anggota</p>
            )}
            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                    {member.email?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border ${roleBadge(member.role)}`}>
                        {roleIcon(member.role)} {member.role}
                      </span>
                      {member.status === 'invited' && (
                        <span className="text-xs text-muted-foreground">• Menunggu konfirmasi</span>
                      )}
                    </div>
                  </div>
                </div>
                {member.role !== 'owner' && member.id !== currentUser?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-400"
                    onClick={() => void removeMember(member.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Role guide */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">PANDUAN ROLE</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex gap-2 items-start">
                <Crown className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p><strong className="text-foreground">Owner</strong> — Akses penuh. Dapat hapus tim, ubah plan, dan kelola billing.</p>
              </div>
              <div className="flex gap-2 items-start">
                <ShieldCheck className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                <p><strong className="text-foreground">Admin</strong> — Bisa kelola lead, chat, invoice, pipeline. Tidak bisa ubah billing.</p>
              </div>
              <div className="flex gap-2 items-start">
                <User className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p><strong className="text-foreground">Member</strong> — Akses baca dan balas chat. Tidak bisa hapus data.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
