import { createServer } from 'http'
import { WebSocketServer } from 'ws'

export interface ChatMessage {
  id: string
  chatId: string
  userId: string
  content: string
  timestamp: Date
  isTyping?: boolean
}

export class ChatWebSocketServer {
  private wss: WebSocketServer | null = null
  private clients: Map<string, any> = new Map()

  async initialize(port: number) {
    const server = createServer()
    this.wss = new WebSocketServer({ server })

    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url || '', `http://${req.headers.host}`)
      const chatId = url.searchParams.get('chatId')
      const userId = url.searchParams.get('userId')

      if (!chatId || !userId) {
        ws.close(1008, 'Missing chatId or userId')
        return
      }

      const clientId = `${chatId}:${userId}`
      this.clients.set(clientId, ws)

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString())
        this.broadcastMessage(chatId, message)
      })

      ws.on('close', () => {
        this.clients.delete(clientId)
      })

      ws.on('error', (error) => {
        console.error('[WebSocket] Error:', error)
      })
    })

    server.listen(port, () => {
      console.log(`[WebSocket] Server running on port ${port}`)
    })
  }

  broadcastMessage(chatId: string, message: ChatMessage) {
    this.clients.forEach((ws, clientId) => {
      if (clientId.startsWith(chatId)) {
        ws.send(JSON.stringify(message))
      }
    })
  }

  sendTypingIndicator(chatId: string, userId: string) {
    this.clients.forEach((ws, clientId) => {
      if (clientId.startsWith(chatId) && !clientId.includes(userId)) {
        ws.send(JSON.stringify({
          type: 'typing',
          userId,
          chatId,
          timestamp: new Date()
        }))
      }
    })
  }

  getActiveConnections(chatId: string): number {
    let count = 0
    this.clients.forEach((_, clientId) => {
      if (clientId.startsWith(chatId)) count++
    })
    return count
  }
}

export const chatWebSocketServer = new ChatWebSocketServer()
