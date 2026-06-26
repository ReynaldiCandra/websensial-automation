'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import {
  Search, Send, Paperclip, MoreVertical, MessageCircle,
  Flame, Thermometer, Snowflake, Bot, User, RefreshCw,
  UserCheck, Sparkles, X, Check,
} from 'lucide-react'

interface Lead {
  id: string; name: string; phone: string; lead_score: number
  temperature: 'hot' | 'warm' | 'cold'; last_message: string | null
  last_seen_at: string | null; is_escalated: boolean; pipeline_stage: string | null
}
interface Chat { id: string; lead_id: string; status: string; last_message_at: string | null }
interface Message { id: string; chat_id: string; sender_type: 'customer' | 'ai' | 'agent'; message_text: string; message_type: string; created_at: string }
interface SuggestedReply { text: string; action: string }

const tempIcon = (t: string) => t === 'hot' ? <Flame className="w-3 h-3 text-red-400" /> : t === 'warm' ? <Thermometer className="w-3 h-3 text-yellow-400" /> : <Snowflake className="w-3 h-3 text-blue-400" />
const tempColor = (t: string) => t === 'hot' ? 'bg-red-500/10 text-red-400 border-red-500/30' : t === 'warm' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
const formatTime = (ts: string) => new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

export default function ChatsPage() {
  const supabase = createClient()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestedReply[]>([])
  const [loadingSug, setLoadingSug] = useState(false)
  const [showSug, setShowSug] = useState(false)

  const getCompanyId = useCallback(async (): Promise<string | null> => {
    if (companyId) return companyId
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase.from('companies').select('id').eq('owner_id', user.id).single()
    const id = data?.id ?? null
    if (id) setCompanyId(id)
    return id
  }, [supabase, companyId])

  const loadLeads = useCallback(async () => {
    const cid = await getCompanyId()
    if (!cid) return
    const { data } = await supabase.from('leads')
      .select('id, name, phone, lead_score, temperature, last_message, last_seen_at, is_escalated, pipeline_stage')
      .eq('company_id', cid).order('last_seen_at', { ascending: false, nullsFirst: false })
    if (data) setLeads(data as Lead[])
    setLoading(false)
  }, [supabase, getCompanyId])

  const loadChat = useCallback(async (lead: Lead): Promise<Chat | null> => {
    const cid = await getCompanyId()
    if (!cid) return null
    let { data: chat } = await supabase.from('chats').select('*').eq('company_id', cid).eq('lead_id', lead.id).single()
    if (!chat) {
      const { data: newChat } = await supabase.from('chats').insert({ company_id: cid, lead_id: lead.id, whatsapp_contact_id: lead.phone, status: 'open' }).select().single()
      chat = newChat
    }
    return chat as Chat
  }, [supabase, getCompanyId])

  const loadMessages = useCallback(async (chatId: string) => {
    const { data } = await supabase.from('chat_messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true }).limit(100)
    if (data) setMessages(data as Message[])
  }, [supabase])

  useEffect(() => { void loadLeads() }, [loadLeads])

  useEffect(() => {
    if (!selectedChat) return
    const channel = supabase.channel(`chat-${selectedChat.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${selectedChat.id}` },
        (payload) => { setMessages(prev => [...prev, payload.new as Message]); void loadLeads() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, selectedChat, loadLeads])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const selectLead = async (lead: Lead) => {
    setSelectedLead(lead); setSuggestions([]); setShowSug(false); setMessages([])
    const chat = await loadChat(lead)
    if (chat) { setSelectedChat(chat); await loadMessages(chat.id) }
    const cid = await getCompanyId()
    if (cid) await supabase.from('leads').update({ last_seen_at: new Date().toISOString() }).eq('id', lead.id).eq('company_id', cid)
  }

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || !selectedChat) return
    setSending(true); setInput(''); setShowSug(false); setSuggestions([])
    const cid = await getCompanyId()
    const { data: { user } } = await supabase.auth.getUser()
    if (!cid || !user) { setSending(false); return }
    await supabase.from('chat_messages').insert({ chat_id: selectedChat.id, sender_type: 'agent', sender_id: user.id, message_text: content, message_type: 'text' })
    await supabase.from('chats').update({ last_message_at: new Date().toISOString() }).eq('id', selectedChat.id)
    await supabase.from('leads').update({ last_message: content.slice(0, 200), last_seen_at: new Date().toISOString() }).eq('id', selectedLead!.id).eq('company_id', cid)
    try { await fetch('/api/whatsapp/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: selectedLead!.phone, message: content }) }) } catch (_) {}
    setSending(false)
  }

  const getSuggestions = async () => {
    if (!selectedLead || messages.length === 0) return
    setLoadingSug(true); setShowSug(true)
    try {
      const recent = messages.slice(-6).map(m => ({ role: m.sender_type === 'customer' ? 'user' : 'assistant', content: m.message_text }))
      const res = await fetch('/api/ai/suggest-reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: recent, phone: selectedLead.phone }) })
      const data = await res.json()
      if (data.suggestions) setSuggestions(data.suggestions)
    } catch (_) {}
    setLoadingSug(false)
  }

  const toggleEscalate = async () => {
    if (!selectedLead) return
    const cid = await getCompanyId()
    if (!cid) return
    const next = !selectedLead.is_escalated
    await supabase.from('leads').update({ is_escalated: next, escalated_at: next ? new Date().toISOString() : null }).eq('id', selectedLead.id).eq('company_id', cid)
    setSelectedLead({ ...selectedLead, is_escalated: next })
    void loadLeads()
  }

  const filteredLeads = leads.filter(l => !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.phone?.includes(search) || l.last_message?.toLowerCase().includes(search.toLowerCase()))

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
        <div className="w-80 flex-shrink-0 border-r border-border flex flex-col bg-card">
          <div className="p-4 border-b border-border space-y-3">
            <h2 className="font-semibold text-foreground">WhatsApp Chats</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari nama / nomor / pesan..." className="pl-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-2.5"><X className="w-4 h-4 text-muted-foreground" /></button>}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && <p className="p-6 text-center text-sm text-muted-foreground">Memuat chat...</p>}
            {!loading && filteredLeads.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">{search ? 'Tidak ada hasil' : 'Belum ada lead'}</p>}
            {filteredLeads.map(lead => (
              <button key={lead.id} onClick={() => selectLead(lead)} className={`w-full px-4 py-3 text-left border-b border-border/40 transition-colors hover:bg-accent/5 ${selectedLead?.id === lead.id ? 'bg-primary/10' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">{lead.name?.[0]?.toUpperCase() ?? '?'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">{lead.name ?? lead.phone}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-1">{lead.last_seen_at ? formatTime(lead.last_seen_at) : ''}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{lead.last_message ?? 'Belum ada pesan'}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border ${tempColor(lead.temperature ?? 'cold')}`}>{tempIcon(lead.temperature ?? 'cold')} {lead.lead_score ?? 0}</span>
                      {lead.is_escalated && <UserCheck className="w-3 h-3 text-orange-400" />}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-border">
            <button onClick={() => void loadLeads()} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground w-full justify-center"><RefreshCw className="w-3 h-3" /> Refresh</button>
          </div>
        </div>

        {selectedLead && selectedChat ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-5 py-3 border-b border-border bg-card flex items-center justify-between">
              <div>
                <p className="font-semibold">{selectedLead.name ?? selectedLead.phone}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border ${tempColor(selectedLead.temperature ?? 'cold')}`}>{tempIcon(selectedLead.temperature ?? 'cold')} {selectedLead.temperature} — {selectedLead.lead_score}/100</span>
                  <span className="text-xs text-muted-foreground">{selectedLead.phone}</span>
                  {selectedLead.is_escalated && <Badge variant="outline" className="text-xs text-orange-400 border-orange-400/30">Human Mode</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={toggleEscalate} className={selectedLead.is_escalated ? 'border-orange-400/40 text-orange-400' : ''}>
                  <UserCheck className="w-4 h-4 mr-1" />{selectedLead.is_escalated ? 'AI Kembali' : 'Ambil Alih'}
                </Button>
                <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-background/50">
              {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender_type === 'customer' ? 'justify-start' : 'justify-end'} gap-2`}>
                  {msg.sender_type === 'customer' && <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1"><User className="w-4 h-4 text-muted-foreground" /></div>}
                  <div className="max-w-sm">
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.sender_type === 'customer' ? 'bg-card border border-border rounded-tl-sm' : msg.sender_type === 'ai' ? 'bg-primary text-white rounded-tr-sm' : 'bg-green-600 text-white rounded-tr-sm'}`}>{msg.message_text}</div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                      {msg.sender_type === 'ai' && <Bot className="w-3 h-3 text-primary" />}
                      {msg.sender_type === 'agent' && <Check className="w-3 h-3 text-green-400" />}
                      <span className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {showSug && (
              <div className="px-5 py-3 border-t border-border bg-card/80">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Saran Balasan AI</span>
                  <button onClick={() => setShowSug(false)} className="ml-auto"><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
                {loadingSug && <p className="text-xs text-muted-foreground animate-pulse">Membuat saran...</p>}
                <div className="flex flex-col gap-2">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => sendMessage(s.text)} className="text-left text-sm px-3 py-2 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors">
                      <span className="text-xs text-primary font-medium uppercase tracking-wide">{s.action}</span>
                      <p className="mt-0.5 text-foreground">{s.text}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="px-5 py-4 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="flex-shrink-0 text-muted-foreground"><Paperclip className="w-5 h-5" /></Button>
                <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage() } }} placeholder="Ketik pesan manual..." className="flex-1" />
                <Button variant="outline" size="icon" onClick={getSuggestions} className="flex-shrink-0" title="Minta saran AI"><Sparkles className="w-4 h-4 text-primary" /></Button>
                <Button onClick={() => void sendMessage()} disabled={!input.trim() || sending} size="icon" className="flex-shrink-0"><Send className="w-4 h-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Pesan dikirim sebagai Human Agent — AI tidak auto-reply selagi kamu aktif</p>
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
