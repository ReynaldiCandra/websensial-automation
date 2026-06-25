'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Edit2, Shield, User, Mail, Clock } from 'lucide-react'

interface TeamMember {
  id: string
  email: string
  name?: string
  role: 'admin' | 'manager' | 'member'
  status: 'active' | 'inactive'
  joined_at: string
}

export default function TeamPage() {
  const supabase = createClient()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteModal, setInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'manager' | 'member'>('member')
  const [editModal, setEditModal] = useState<TeamMember | null>(null)

  useEffect(() => { fetchMembers() }, [])

  async function fetchMembers() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('team_members')
      .select('*')
      .eq('workspace_id', user.id)
      .order('joined_at', { ascending: false })

    if (data) setMembers(data as TeamMember[])
    setLoading(false)
  }

  async function handleInvite() {
    if (!inviteEmail) return
    await supabase.from('team_invites').insert({
      email: inviteEmail,
      role: inviteRole,
      created_at: new Date().toISOString(),
    })
    setInviteEmail('')
    setInviteRole('member')
    setInviteModal(false)
    fetchMembers()
  }

  async function handleRemove(memberId: string) {
    await supabase.from('team_members').delete().eq('id', memberId)
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    await supabase.from('team_members').update({ role: newRole }).eq('id', memberId)
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole as any } : m))
    setEditModal(null)
  }

  const roleColors = {
    admin: { bg: '#6C3BF533', color: '#A78BFA', label: 'Admin' },
    manager: { bg: '#3B82F533', color: '#93C5FD', label: 'Manager' },
    member: { bg: '#10B98133', color: '#86EFAC', label: 'Member' },
  }

  return (
    <div style={{ padding: '24px', background: '#0D0D12', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#E2E8F0', margin: '0 0 8px' }}>
            Tim Anda
          </h1>
          <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>
            Kelola anggota tim dan permission mereka
          </p>
        </div>
        <button
          onClick={() => setInviteModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#6C3BF5', border: 'none', borderRadius: 8, color: '#FFF', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <Plus size={18} /> Undang Anggota
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Members', value: members.length, icon: User },
          { label: 'Admins', value: members.filter(m => m.role === 'admin').length, icon: Shield },
          { label: 'Active', value: members.filter(m => m.status === 'active').length, icon: Clock },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Icon size={18} style={{ color: '#6C3BF5' }} />
                <p style={{ fontSize: 12, color: '#64748B', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>
                  {stat.label}
                </p>
              </div>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#E2E8F0', margin: 0 }}>
                {stat.value}
              </p>
            </div>
          )
        })}
      </div>

      <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0', margin: 0 }}>Anggota Tim</h2>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading...</div>
        ) : members.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
            <p style={{ margin: 0 }}>Belum ada anggota tim. Undang anggota pertama Anda!</p>
          </div>
        ) : (
          <div>
            {members.map(member => (
              <div key={member.id} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6C3BF5, #4F1FD4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 600, fontSize: 14 }}>
                    {member.name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', margin: 0 }}>
                      {member.name || member.email}
                    </p>
                    <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>
                      {member.email}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: roleColors[member.role].bg, borderRadius: 4, color: roleColors[member.role].color, fontSize: 12, fontWeight: 600 }}>
                    {roleColors[member.role].label}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: member.status === 'active' ? '#10B98133' : '#6B728033', borderRadius: 4, color: member.status === 'active' ? '#10B981' : '#94A3B8', fontSize: 11, fontWeight: 600 }}>
                    {member.status === 'active' ? 'Active' : 'Inactive'}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setEditModal(member)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: 4, transition: 'color 0.2s' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleRemove(member.id)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: 4, transition: 'color 0.2s' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {inviteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => setInviteModal(false)}>
          <div style={{ background: '#111118', borderRadius: 12, padding: 24, maxWidth: 400, width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0', margin: '0 0 16px' }}>Undang Anggota Baru</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Email</label>
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} type="email" placeholder="member@example.com" style={{ width: '100%', padding: 12, background: '#0D0D12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#E2E8F0', fontSize: 13 }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Role</label>
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value as any)} style={{ width: '100%', padding: 12, background: '#0D0D12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#E2E8F0', fontSize: 13 }}>
                <option value="member">Member</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setInviteModal(false)} style={{ flex: 1, padding: '10px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#CBD5E0', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={handleInvite} style={{ flex: 1, padding: '10px 16px', background: '#6C3BF5', border: 'none', borderRadius: 6, color: '#FFF', cursor: 'pointer', fontWeight: 600 }}>
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => setEditModal(null)}>
          <div style={{ background: '#111118', borderRadius: 12, padding: 24, maxWidth: 400, width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0', margin: '0 0 16px' }}>Ubah Role</h3>
            <p style={{ color: '#64748B', fontSize: 13, margin: '0 0 16px' }}>{editModal.email}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['member', 'manager'].map(role => (
                <button key={role} onClick={() => handleRoleChange(editModal.id, role)} style={{ flex: 1, padding: '10px 16px', background: editModal.role === role ? '#6C3BF5' : 'transparent', border: '1px solid' + (editModal.role === role ? '#6C3BF5' : 'rgba(255,255,255,0.1)'), borderRadius: 6, color: editModal.role === role ? '#FFF' : '#CBD5E0', cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
