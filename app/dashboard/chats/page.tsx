'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import {
  Search, Send, Paperclip, MoreVertical, MessageCircle,
  Flame, Thermometer, Snowflake, Bot, User, RefreshCw,
  UserCheck, Sparkles, X, Check,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────
interface Lead {
  id: string
  name: string
  phone: string
  score: number
  temperature: 'hot' | 'warm' | 'cold'
  last_message: string | null
  last_seen_at: string | null
  is_escalated: boolean
}

interface Message {
  id: string
  phone: string
  content: string
  sender_type: 'customer' | 'ai' | 'human'
  created_at: string
  is_read: boolean
}

interface SuggestedReply {
  text: string
  action: string
}

// ─── Helper ──────────────────────────────────────────────────
const tempIcon = (t: string) => {
  if (t === 'hot')  return <Flame className="w-3 h-3 text-red-400" />
  if (t === 'warm') return <Thermometer className="w-3 h-3 text-yellow-400" />
  return <Snowflake className="w-3 h-3 text-blue-400" />
}

const tempColor = (t: string) => {
  if (t === 'hot')  return 'bg-red-500/10 text-red-400 border-red-500/30'
  if (t === 'warm') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
  return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
}

const formatTime = (ts: string) =>
  new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

// ─── Main Component ───────────────────────────────────────────
export default function ChatsPage() {
  const supabase = createClient()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [leads, setLeads]               = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [messages, setMessages]         = useState<Message[]>([])
  const [input, setInput]               = useState('')
  const [search, setSearch]             = useState('')
  const [loading, setLoading]           = useState(true)
  const [sending, setSending]           = useState(false)
  const [suggestions, setSuggestions]   = useState<SuggestedReply[]>([])
  const [loadingSug, setLoadingSug]     = useState(false)
  const [showSug, setShowSug]           = useState(false)

  // ── Load leads ──────────────────────────────────────────────
  const loadLeads = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('leads')
      .select('id, name, phone, score, temperature, last_message, last_seen_at, is_escalated')
      .eq('workspace_id', user.id)
      .order('last_seen_at', { ascending: false, nullsFirst: false })
    if (data) setLeads(data as Lead[])
    setLoading(false)
  }, [supabase])

  // ── Load messages for selected lead ─────────────────────────
  const loadMessages = useCallback(async (phone: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('workspace_id', user.id)
      .eq('phone', phone)
      .order('created_at', { ascending: true })
      .limit(100)
    if (data) setMessages(data as Message[])
    // Mark as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('workspace_id', user.id)
      .eq('phone', phone)
      .eq('sender_type', 'customer')
  }, [supabase])

  useEffect(() => { void loadLeads() }, [loadLeads])

  // ── Realtime subscription ────────────────────────────────────
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    const subscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      supabase.getChannels().forEach(ch => supabase.removeChannel(ch))
      channel = supabase
        .channel('realtime-' + Date.now())
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `workspace_id=eq.${user.id}`,
        }, (payload) => {
          const msg = payload.new as Message
          // Append if this is the open conversation
          if (selectedLead && msg.phone === selectedLead.phone) {
            setMessages(prev => [...prev, msg])
          }
          // Refresh lead list for last_message preview
          void loadLeads()
        })
        .subscribe()
    }

    void subscribe()
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [supabase, selectedLead, loadLeads])

  // ── Scroll to bottom on new messages ────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Select lead ─────────────────────────────────────────────
  const selectLead = async (lead: Lead) => {
    setSelectedLead(lead)
    setSuggestions([])
    setShowSug(false)
    await loadMessages(lead.phone)
  }

  // ── Send message ─────────────────────────────────────────────
  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim()
    if (!content || !selectedLead) return
    setSending(true)
    setInput('')
    setSuggestions([])
    setShowSug(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSending(false); return }

    // Insert to DB
    await supabase.from('messages').insert({
      workspace_id: user.id,
      phone: selectedLead.phone,
      lead_id: selectedLead.id,
      content,
      sender_type: 'human',
    })

    // Send via WhatsApp API
    try {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: selectedLead.phone, message: content }),
      })
    } catch (_) { /* non-blocking */ }

    setSending(false)
  }

  // ── AI reply suggestions ─────────────────────────────────────
  const getSuggestions = async () => {
    if (!selectedLead || messages.length === 0) return
    setLoadingSug(true)
    setShowSug(true)
    try {
      const recent = messages.slice(-6).map(m => ({
        role: m.sender_type === 'customer' ? 'user' : 'assistant',
        content: m.content,
      }))
      const res = await fetch('/api/ai/suggest-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: recent, phone: selectedLead.phone }),
      })
      const data = await res.json()
      if (data.suggestions) setSuggestions(data.suggestions)
    } catch (_) { /* ignore */ }
    setLoadingSug(false)
  }

  // ── Escalate / de-escalate ───────────────────────────────────
  const toggleEscalate = async () => {
    if (!selectedLead) return
    const next = !selectedLead.is_escalated
    await supabase.from('leads')
      .update({ is_escalated: next, escalated_at: next ? new Date().toISOString() : null })
      .eq('id', selectedLead.id)
    setSelectedLead({ ...selectedLead, is_escalated: next })
    void loadLeads()
  }

  // ── Filter leads by search ───────────────────────────────────
  const filteredLeads = leads.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.phone?.includes(search) ||
    l.last_message?.toLowerCase().includes(search.toLowerCase())
  )

  const unread = (lead: Lead) =>
    messages.filter(m => m.phone === lead.phone && !m.is_read && m.sender_type === 'customer').length

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex gap-0 overflow-hidden">

        {/* ── Lead / Chat List ──────────────────────────────── */}
        <div className="w-80 flex-shrink-0 border-r border-border flex flex-col bg-card">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground mb-3">WhatsApp Chats</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama / nomor / pesan..."
                className="pl-9 text-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-2.5">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="p-8 text-center text-muted-foreground text-sm">Memuat chat...</div>
            )}
            {!loading && filteredLeads.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                {search ? 'Tidak ada hasil' : 'Belum ada chat masuk'}
              </div>
            )}
            {filteredLeads.map(lead => (
              <button
                key={lead.id}
                onClick={() => selectLead(lead)}
                className={`w-full px-4 py-3 text-left border-b border-border/50 transition-colors hover:bg-accent/5 ${
                  selectedLead?.id === lead.id ? 'bg-primary/10' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                    {lead.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-medium text-sm text-foreground truncate">{lead.name ?? lead.phone}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {lead.is_escalated && <UserCheck className="w-3 h-3 text-orange-400" />}
                        <span className="text-xs text-muted-foreground">
                          {lead.last_seen_at ? formatTime(lead.last_seen_at) : ''}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{lead.last_message ?? 'Belum ada pesan'}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border ${tempColor(lead.temperature)}`}>
                        {tempIcon(lead.temperature)} {lead.score}
                      </span>
                      {unread(lead) > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {unread(lead)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-border">
            <button
              onClick={() => void loadLeads()}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground w-full justify-center"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
        </div>

        {/* ── Chat Window ───────────────────────────────────── */}
        {selectedLead ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="px-5 py-3 border-b border-border bg-card flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{selectedLead.name ?? selectedLead.phone}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border ${tempColor(selectedLead.temperature)}`}>
                    {tempIcon(selectedLead.temperature)} {selectedLead.temperature} — {selectedLead.score}/100
                  </span>
                  <span className="text-xs text-muted-foreground">{selectedLead.phone}</span>
                  {selectedLead.is_escalated && (
                    <span className="text-xs text-orange-400 border border-orange-400/30 rounded px-1.5 py-0.5">
                      Eskalasi ke Human
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleEscalate}
                  className={selectedLead.is_escalated ? 'text-orange-400 border-orange-400/40' : ''}
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  {selectedLead.is_escalated ? 'AI Kembali' : 'Eskalasi'}
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-background/50">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_type === 'customer' ? 'justify-start' : 'justify-end'} gap-2`}>
                  {msg.sender_type === 'customer' && (
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="max-w-sm">
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender_type === 'customer'
                        ? 'bg-card border border-border text-foreground rounded-tl-sm'
                        : msg.sender_type === 'ai'
                          ? 'bg-primary text-white rounded-tr-sm'
                          : 'bg-green-600 text-white rounded-tr-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                      {msg.sender_type === 'ai' && <Bot className="w-3 h-3 text-primary" />}
                      {msg.sender_type === 'human' && <Check className="w-3 h-3 text-green-400" />}
                      <span className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* AI Suggestions */}
            {showSug && (
              <div className="px-5 py-3 border-t border-border bg-card/80">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Saran Balasan AI</span>
                  <button onClick={() => setShowSug(false)} className="ml-auto">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                {loadingSug && <p className="text-xs text-muted-foreground">Membuat saran...</p>}
                <div className="flex flex-col gap-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s.text)}
                      className="text-left text-sm px-3 py-2 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                      <span className="text-xs text-primary font-medium uppercase tracking-wide">{s.action}</span>
                      <p className="mt-0.5 text-foreground">{s.text}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-5 py-4 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="flex-shrink-0 text-muted-foreground">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage() } }}
                  placeholder="Ketik pesan manual..."
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={getSuggestions}
                  title="Saran AI"
                  className="flex-shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </Button>
                <Button
                  onClick={() => void sendMessage()}
                  disabled={!input.trim() || sending}
                  size="icon"
                  className="flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Pesan ini dikirim sebagai Human — AI tidak auto-reply saat kamu sedang aktif di sini
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background/50">
            <div className="text-center">
              <MessageCircle className="w-14 h-14 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">Pilih kontak untuk membuka chat</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
