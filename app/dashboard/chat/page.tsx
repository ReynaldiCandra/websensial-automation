'use client'

import { useState, useRef, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react'

// Mock conversations
const mockConversations = [
  {
    id: 1,
    name: 'Budi Santoso',
    company: 'PT Maju Jaya',
    lastMessage: 'Terima kasih atas quotationnya',
    timestamp: '2 min',
    unread: 2,
    avatar: '👨‍💼',
    status: 'active',
  },
  {
    id: 2,
    name: 'Siti Nurhaliza',
    company: 'CV Berkah',
    lastMessage: 'Kapan bisa kirim invoicenya?',
    timestamp: '15 min',
    unread: 0,
    avatar: '👩‍💼',
    status: 'active',
  },
  {
    id: 3,
    name: 'Joko Subroto',
    company: 'Toko Elektronik',
    lastMessage: 'Saya mau order lebih banyak',
    timestamp: '1 jam',
    unread: 0,
    avatar: '👨‍💼',
    status: 'inactive',
  },
]

// Mock messages
const mockMessages = [
  {
    id: 1,
    sender: 'user',
    text: 'Halo, ada yang bisa saya bantu?',
    timestamp: '10:30',
    status: 'read',
  },
  {
    id: 2,
    sender: 'contact',
    text: 'Ya, saya tertarik dengan produk Anda',
    timestamp: '10:32',
    status: 'read',
  },
  {
    id: 3,
    sender: 'contact',
    text: 'Berapa harganya dan apa terms pembayarannya?',
    timestamp: '10:33',
    status: 'read',
  },
  {
    id: 4,
    sender: 'user',
    text: 'Harga spesial untuk bulk order. Saya kirim quotation ya',
    timestamp: '10:35',
    status: 'read',
  },
  {
    id: 5,
    sender: 'user',
    text: 'Sudah saya kirim via email. Silakan review',
    timestamp: '10:36',
    status: 'delivered',
  },
  {
    id: 6,
    sender: 'contact',
    text: 'Terima kasih atas quotationnya',
    timestamp: '10:45',
    status: 'read',
  },
]

const AI_TONES = [
  { id: 'profesional', label: 'Profesional', description: 'Formal dan bisnis' },
  { id: 'friendly', label: 'Ramah', description: 'Hangat dan santai' },
  { id: 'humble', label: 'Rendah Hati', description: 'Sopan dan hormat' },
  { id: 'energetic', label: 'Energik', description: 'Semangat dan positif' },
]

const SAMPLE_AI_RESPONSES = {
  'Berapa harga produk?': {
    profesional: 'Harga produk kami mulai dari Rp 500.000 dengan berbagai pilihan paket. Saya dapat mengirimkan penawaran detail untuk kebutuhan spesifik Anda.',
    friendly: 'Produk kami harganya mulai dari 500rb nih! Tapi tergantung pilihan yang Anda mau. Mau saya kasih penawaran khusus?',
    humble: 'Terima kasih sudah bertanya. Produk kami tersedia mulai dari Rp 500.000. Saya dengan senang hati akan memberikan penawaran terbaik untuk Anda.',
    energetic: 'Great! Produk kami dimulai dari harga super terjangkau yaitu Rp 500.000! Ada berbagai pilihan paket menarik yang bisa disesuaikan dengan kebutuhan Anda!',
  },
  'Kapan bisa dikirim?': {
    profesional: 'Pengiriman dapat dilakukan dalam 2-3 hari kerja setelah konfirmasi pembayaran. Kami bekerja sama dengan kurir terpercaya untuk memastikan produk sampai dengan aman.',
    friendly: 'Biasanya kita bisa kirim dalam 2-3 hari kerja setelah pembayaran masuk. Cepat kan? Kita pakai kurir yang aman dan terpercaya.',
    humble: 'Dengan izin, biasanya kami dapat mengirimkan dalam 2-3 hari kerja setelah konfirmasi pembayaran. Semoga waktu ini sesuai dengan kebutuhan Anda.',
    energetic: 'Hebat! Kami bisa kirim dalam 2-3 hari kerja saja setelah pembayaran masuk! Pengiriman cepat dan aman dengan mitra kurir terpercaya!',
  },
}

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState(
    mockConversations[0]
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [selectedTone, setSelectedTone] = useState<'profesional' | 'ramah' | 'rendah_hati' | 'energik'>('profesional')
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [])

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessageInput('')
    }
  }

  const generateAIResponse = async (suggestion: string) => {
    setIsLoadingAI(true)
    try {
      const response = await fetch('/api/ai/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: suggestion,
          tone: selectedTone,
          previousMessages: [],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate response')
      }

      const data = await response.json()
      setAiResponses((prev) => ({
        ...prev,
        [suggestion]: data.message,
      }))
      return data.message
    } catch (error) {
      console.error('[v0] AI Generation Error:', error)
      // Fallback ke sample responses jika API error
      const fallback = SAMPLE_AI_RESPONSES[suggestion as keyof typeof SAMPLE_AI_RESPONSES]?.[selectedTone]
      if (fallback) {
        setAiResponses((prev) => ({
          ...prev,
          [suggestion]: fallback,
        }))
        return fallback
      }
      return null
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handleAIAssist = async () => {
    if (!showAIPanel) {
      const suggestions = Object.keys(SAMPLE_AI_RESPONSES).filter(key =>
        messageInput.toLowerCase().includes(key.toLowerCase().split(' ')[0])
      )
      if (suggestions.length === 0 && messageInput.length > 0) {
        suggestions.push(...Object.keys(SAMPLE_AI_RESPONSES).slice(0, 2))
      }
      setAiSuggestions(suggestions)
    }
    setShowAIPanel(!showAIPanel)
  }

  const handleUseSuggestion = async (suggestion: string) => {
    let response = aiResponses[suggestion]
    if (!response) {
      response = await generateAIResponse(suggestion)
    }
    if (response) {
      setMessageInput(response)
      setShowAIPanel(false)
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === 'read') return <CheckCheck className="w-3 h-3 text-blue-500" />
    if (status === 'delivered') return <Check className="w-3 h-3 text-gray-500" />
    return <Clock className="w-3 h-3 text-gray-500" />
  }

  return (
    <DashboardLayout>
      <div className="flex h-screen bg-background">
        {/* Conversations List */}
        <div className="w-80 border-r border-border flex flex-col bg-card">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h1 className="text-2xl font-bold text-foreground mb-4">Chat</h1>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari percakapan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1">
            <div className="space-y-2 p-2">
              {mockConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedConversation.id === conv.id
                      ? 'bg-primary/10 border border-primary'
                      : 'hover:bg-accent/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative text-2xl flex-shrink-0">
                      {conv.avatar}
                      {conv.status === 'active' && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-card"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {conv.name}
                        </h3>
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          {conv.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.company}
                      </p>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {conv.lastMessage}
                      </p>
                      {conv.unread > 0 && (
                        <Badge className="mt-2 bg-primary">
                          {conv.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Chat Header */}
          <div className="h-16 border-b border-border px-6 flex items-center justify-between bg-card">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{selectedConversation.avatar}</div>
              <div>
                <h2 className="font-semibold text-foreground">
                  {selectedConversation.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedConversation.company}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {mockMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 ${
                        msg.sender === 'user'
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <span className="text-xs">{msg.timestamp}</span>
                      {msg.sender === 'user' && getStatusIcon(msg.status)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* AI Panel */}
          {showAIPanel && (
            <div className="border-t border-border bg-card p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  Pilih Gaya Komunikasi:
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {AI_TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setSelectedTone(tone.id)}
                      className={`p-3 rounded-lg text-left transition-colors ${
                        selectedTone === tone.id
                          ? 'bg-primary text-white'
                          : 'bg-background border border-border hover:border-primary'
                      }`}
                    >
                      <div className="text-sm font-medium">{tone.label}</div>
                      <div className="text-xs opacity-75">{tone.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {aiSuggestions.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">Saran Balasan:</h4>
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleUseSuggestion(suggestion)}
                        disabled={isLoadingAI}
                        className="w-full p-2 text-left text-sm bg-background border border-border rounded hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingAI && !aiResponses[suggestion] ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin">⏳</span>
                            Generating...
                          </span>
                        ) : (
                          aiResponses[suggestion] || suggestion
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message Input */}
          <div className="h-20 border-t border-border px-6 py-4 bg-card flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input
              placeholder="Ketik pesan..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSendMessage()
              }}
              className="flex-1 bg-background border-border"
            />
            <Button
              onClick={handleAIAssist}
              variant={showAIPanel ? 'default' : 'ghost'}
              size="sm"
              className={showAIPanel ? 'bg-yellow-500 hover:bg-yellow-600' : 'text-yellow-500'}
              title="AI Assistant"
            >
              <Sparkles className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleSendMessage}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
