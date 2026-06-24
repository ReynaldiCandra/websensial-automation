'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Phone,
  Video,
  Search,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Clock,
  MessageCircle,
} from 'lucide-react'

// Mock chat data
const mockChats = [
  {
    id: 1,
    name: 'Budi Santoso',
    phone: '+62 812-3456-7890',
    lastMessage: 'Bagaimana dengan harga yang lebih murah?',
    timestamp: '10:30',
    unread: 2,
    status: 'hot',
    avatar: 'BS',
  },
  {
    id: 2,
    name: 'Siti Nurhaliza',
    phone: '+62 813-2456-7890',
    lastMessage: 'Terima kasih atas quotation-nya',
    timestamp: '09:15',
    unread: 0,
    status: 'warm',
    avatar: 'SN',
  },
  {
    id: 3,
    name: 'Joko Subroto',
    phone: '+62 811-2456-7890',
    lastMessage: 'Konfirmasi order untuk besok',
    timestamp: 'Kemarin',
    unread: 0,
    status: 'cold',
    avatar: 'JS',
  },
]

const mockMessages = [
  {
    id: 1,
    sender: 'customer',
    text: 'Halo, saya mau tanya tentang produk Anda',
    timestamp: '09:00',
    avatar: 'BS',
    name: 'Budi Santoso',
  },
  {
    id: 2,
    sender: 'agent',
    text: 'Halo Budi! Terima kasih telah menghubungi kami. Ada yang bisa saya bantu?',
    timestamp: '09:05',
    avatar: 'JA',
    name: 'Jualin AI',
  },
  {
    id: 3,
    sender: 'customer',
    text: 'Bagaimana dengan harga yang lebih murah?',
    timestamp: '10:30',
    avatar: 'BS',
    name: 'Budi Santoso',
  },
]

export default function ChatsPage() {
  const [selectedChat, setSelectedChat] = useState<number | null>(1)
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState(mockMessages)

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'agent',
        text: messageInput,
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        avatar: 'JA',
        name: 'Jualin AI',
      }
      setMessages([...messages, newMessage])
      setMessageInput('')
    }
  }

  const currentChat = mockChats.find((chat) => chat.id === selectedChat)

  return (
    <DashboardLayout>
      <div className="h-full flex gap-6 p-6">
        {/* Chat List */}
        <Card className="w-80 bg-card border-border flex flex-col">
          <CardHeader>
            <CardTitle>WhatsApp Chats</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            {/* Search */}
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari chat..."
                className="pl-10 bg-background border-border"
              />
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {mockChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`w-full p-3 rounded-lg transition-colors text-left ${
                    selectedChat === chat.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-accent/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {chat.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-foreground text-sm">
                          {chat.name}
                        </p>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {chat.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {chat.lastMessage}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={
                            chat.status === 'hot'
                              ? 'default'
                              : chat.status === 'warm'
                                ? 'secondary'
                                : 'outline'
                          }
                          className="text-xs"
                        >
                          {chat.status}
                        </Badge>
                        {chat.unread > 0 && (
                          <Badge className="bg-red-500 text-white text-xs">
                            {chat.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Window */}
        {selectedChat ? (
          <Card className="flex-1 bg-card border-border flex flex-col">
            {/* Chat Header */}
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {currentChat?.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {currentChat?.phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-border"
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-border"
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-border"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === 'agent' ? 'justify-end' : 'justify-start'
                  } gap-2`}
                >
                  <div className="flex gap-2 max-w-xs">
                    {msg.sender === 'customer' && (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {msg.avatar}
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          msg.sender === 'agent'
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-muted text-foreground rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <span className="text-xs text-muted-foreground px-2">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>

                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSendMessage()
                  }}
                  placeholder="Ketik pesan..."
                  className="bg-background border-border"
                />

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Smile className="w-5 h-5" />
                </Button>

                <Button
                  onClick={handleSendMessage}
                  className="bg-primary hover:bg-primary/90"
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="flex-1 bg-card border-border flex items-center justify-center">
            <CardContent className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Pilih chat untuk memulai percakapan
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
