import { EventEmitter } from 'events'
import { mkdir, rm } from 'fs/promises'
import path from 'path'
import QRCode from 'qrcode'
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  extractMessageContent,
  type WASocket,
  type WAMessage,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateAIReply, type ChatMessage } from '@/lib/groq'

export interface SendMessageResult {
  messageId: string
  timestamp: number
}

export interface MessageTemplate {
  header?: string
  body: string
  footer?: string
  buttons?: string[]
}

export interface IncomingWhatsAppMessage {
  from: string
  text: string
  messageId: string
  timestamp: number
}

export interface WhatsAppClientEvents {
  qr: (qrBase64: string) => void
  connected: (phone: string) => void
  disconnected: (reason: string) => void
  message: (message: IncomingWhatsAppMessage) => void
}

const clientInstances = new Map<string, WhatsAppClient>()

export function getWhatsAppClient(userId: string): WhatsAppClient {
  const existing = clientInstances.get(userId)
  if (existing) return existing

  const sessionPath = path.join('/tmp/wa-sessions', userId)
  const client = new WhatsAppClient(userId, sessionPath)
  clientInstances.set(userId, client)
  return client
}

export function removeWhatsAppClient(userId: string): void {
  clientInstances.delete(userId)
}

function formatJid(to: string): string {
  const digits = to.replace(/\D/g, '')
  return digits.includes('@') ? digits : `${digits}@s.whatsapp.net`
}

function extractText(message: WAMessage): string | null {
  if (!message.message) return null
  const content = extractMessageContent(message.message)
  if (!content) return null

  if (content.conversation) return content.conversation
  if (content.extendedTextMessage?.text) {
    return content.extendedTextMessage.text
  }
  if (content.imageMessage?.caption) return content.imageMessage.caption
  return null
}

async function updateSessionStatus(
  userId: string,
  data: {
    connected: boolean
    phone?: string | null
    battery?: number | null
  },
): Promise<void> {
  try {
    const supabase = createAdminClient()
    await supabase.from('whatsapp_sessions').upsert(
      {
        user_id: userId,
        connected: data.connected,
        phone: data.phone ?? null,
        battery: data.battery ?? null,
        last_connected_at: data.connected ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
  } catch (error) {
    console.error('[WhatsAppClient] Failed to update session status:', error)
  }
}

async function handleIncomingMessage(
  userId: string,
  sock: WASocket,
  message: WAMessage,
): Promise<void> {
  if (message.key.fromMe || !message.key.remoteJid) return

  const text = extractText(message)
  if (!text) return

  const from = message.key.remoteJid
  const incoming: IncomingWhatsAppMessage = {
    from,
    text,
    messageId: message.key.id ?? crypto.randomUUID(),
    timestamp: Number(message.messageTimestamp ?? Date.now()),
  }

  const supabase = createAdminClient()

  try {
    await supabase.from('chat_messages').insert({
      chat_id: from,
      sender_type: 'customer',
      sender_id: from,
      message_text: text,
      message_type: 'text',
    })
  } catch (error) {
    console.error('[WhatsAppClient] Failed to save message:', error)
  }

  const client = clientInstances.get(userId)
  client?.emit('message', incoming)

  try {
    const { data: training } = await supabase
      .from('ai_training')
      .select(
        'system_prompt, special_instructions, tone, business_name, ai_mode, products, faqs',
      )
      .eq('user_id', userId)
      .maybeSingle()

    if (training?.ai_mode !== 'full_auto') return

    const { data: products } = await supabase
      .from('products')
      .select('name, price, description')
      .eq('user_id', userId)

    const { data: faqs } = await supabase
      .from('faqs')
      .select('question, answer')
      .eq('user_id', userId)

    const chatMessages: ChatMessage[] = [{ role: 'user', content: text }]
    const systemPrompt =
      [training.system_prompt, training.special_instructions]
        .filter(Boolean)
        .join('\n\n') ||
      'Anda adalah AI sales assistant yang membantu closing penjualan via WhatsApp.'

    const aiResult = await generateAIReply(chatMessages, systemPrompt, {
      products: (products ?? []).map((p) => ({
        name: p.name,
        price: String(p.price),
        description: p.description,
      })),
      faqs: faqs ?? [],
      tone: training.tone ?? 'ramah',
      businessName: training.business_name ?? 'Bisnis',
    })

    const sent = await sock.sendMessage(from, { text: aiResult.reply })

    await supabase.from('chat_messages').insert({
      chat_id: from,
      sender_type: 'assistant',
      sender_id: userId,
      message_text: aiResult.reply,
      message_type: 'text',
    })

    console.log('[WhatsAppClient] Auto-replied:', sent?.key?.id)
  } catch (error) {
    console.error('[WhatsAppClient] Auto-reply failed:', error)
  }
}

export class WhatsAppClient extends EventEmitter {
  private socket: WASocket | null = null
  private connecting = false
  private _connected = false
  private _phone: string | null = null
  private _battery: number | null = null

  constructor(
    readonly userId: string,
    readonly sessionPath: string,
  ) {
    super()
  }

  get isConnected(): boolean {
    return this._connected
  }

  get phone(): string | null {
    return this._phone
  }

  get battery(): number | null {
    return this._battery
  }

  override on<K extends keyof WhatsAppClientEvents>(
    event: K,
    listener: WhatsAppClientEvents[K],
  ): this {
    return super.on(event, listener)
  }

  override once<K extends keyof WhatsAppClientEvents>(
    event: K,
    listener: WhatsAppClientEvents[K],
  ): this {
    return super.once(event, listener)
  }

  override emit<K extends keyof WhatsAppClientEvents>(
    event: K,
    ...args: Parameters<WhatsAppClientEvents[K]>
  ): boolean {
    return super.emit(event, ...args)
  }

  async connect(): Promise<void> {
    if (this._connected || this.connecting) return

    this.connecting = true

    try {
      await mkdir(this.sessionPath, { recursive: true })

      const { state, saveCreds } = await useMultiFileAuthState(
        this.sessionPath,
      )

      const logger = pino({ level: 'silent' })

      this.socket = makeWASocket({
        auth: state,
        logger,
        printQRInTerminal: false,
        browser: ['Websensial', 'Chrome', '1.0.0'],
      })

      this.socket.ev.on('creds.update', saveCreds)

      this.socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
          try {
            const qrBase64 = await QRCode.toDataURL(qr)
            this.emit('qr', qrBase64)
          } catch (error) {
            console.error('[WhatsAppClient] QR generation failed:', error)
          }
        }

        if (connection === 'open') {
          this._connected = true
          this.connecting = false

          const jid = this.socket?.user?.id ?? ''
          this._phone = jid.split(':')[0]?.split('@')[0] ?? null

          this.emit('connected', this._phone ?? '')
          await updateSessionStatus(this.userId, {
            connected: true,
            phone: this._phone,
            battery: this._battery,
          })
        }

        if (connection === 'close') {
          this._connected = false
          this.connecting = false

          const statusCode = (lastDisconnect?.error as Boom | undefined)?.output
            ?.statusCode
          const shouldReconnect =
            statusCode !== DisconnectReason.loggedOut

          this.emit(
            'disconnected',
            shouldReconnect ? 'connection_lost' : 'logged_out',
          )

          await updateSessionStatus(this.userId, {
            connected: false,
            phone: this._phone,
          })

          if (shouldReconnect) {
            setTimeout(() => {
              void this.connect()
            }, 3000)
          }
        }
      })

      this.socket.ev.on('messages.upsert', async (event) => {
        if (event.type !== 'notify') return
        for (const message of event.messages) {
          if (!this.socket) continue
          await handleIncomingMessage(this.userId, this.socket, message)
        }
      })
    } catch (error) {
      this.connecting = false
      throw error
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.socket?.logout()
    } catch {
      // ignore logout errors
    }

    this.socket?.end(undefined)
    this.socket = null
    this._connected = false
    this.connecting = false

    await updateSessionStatus(this.userId, {
      connected: false,
      phone: null,
    })

    this.emit('disconnected', 'manual_disconnect')
  }

  async destroySession(): Promise<void> {
    await this.disconnect()
    try {
      await rm(this.sessionPath, { recursive: true, force: true })
    } catch (error) {
      console.error('[WhatsAppClient] Failed to remove session:', error)
    }
    removeWhatsAppClient(this.userId)
  }

  async sendMessage(to: string, message: string): Promise<SendMessageResult> {
    if (!this.socket || !this._connected) {
      throw new Error('WhatsApp not connected')
    }

    const jid = formatJid(to)
    const result = await this.socket.sendMessage(jid, { text: message })

    return {
      messageId: result?.key?.id ?? crypto.randomUUID(),
      timestamp: Date.now(),
    }
  }

  async sendTemplate(
    to: string,
    template: MessageTemplate,
  ): Promise<SendMessageResult> {
    if (!this.socket || !this._connected) {
      throw new Error('WhatsApp not connected')
    }

    const jid = formatJid(to)
    let text = template.body

    if (template.header) {
      text = `*${template.header}*\n\n${text}`
    }
    if (template.footer) {
      text = `${text}\n\n_${template.footer}_`
    }
    if (template.buttons?.length) {
      text += `\n\n${template.buttons.map((b, i) => `${i + 1}. ${b}`).join('\n')}`
    }

    const result = await this.socket.sendMessage(jid, { text })
    return {
      messageId: result?.key?.id ?? crypto.randomUUID(),
      timestamp: Date.now(),
    }
  }

  waitForQR(timeoutMs = 30000): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this._connected) {
        reject(new Error('Already connected'))
        return
      }

      const timeout = setTimeout(() => {
        this.removeListener('qr', onQR)
        reject(new Error('QR code generation timed out'))
      }, timeoutMs)

      const onQR = (qrBase64: string) => {
        clearTimeout(timeout)
        resolve(qrBase64)
      }

      this.once('qr', onQR)
    })
  }
}
