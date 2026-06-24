import axios from 'axios'

const WAHA_URL = process.env.WAHA_API_URL || 'http://localhost:3001'
const WAHA_WEBHOOK_URL = process.env.WAHA_WEBHOOK_URL || 'http://localhost:3000/api/webhooks/waha'

interface WAHAMessage {
  chatId: string
  text: string
}

interface WAHASession {
  sessionName: string
  phoneNumber: string
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING'
}

export async function initializeWAHASession(
  sessionName: string
): Promise<boolean> {
  try {
    await axios.post(`${WAHA_URL}/sessions/start`, {
      sessionName,
      webhookUrl: WAHA_WEBHOOK_URL,
      webhookEvents: ['message'],
    })

    console.log('[v0] WAHA Session initialized:', sessionName)
    return true
  } catch (error) {
    console.error('[v0] WAHA Session init error:', error)
    return false
  }
}

export async function getWAHASession(
  sessionName: string
): Promise<WAHASession | null> {
  try {
    const response = await axios.get(`${WAHA_URL}/sessions/${sessionName}`)
    return response.data
  } catch (error) {
    console.error('[v0] Error getting WAHA session:', error)
    return null
  }
}

export async function sendWAHAMessage(
  sessionName: string,
  chatId: string,
  message: string
): Promise<boolean> {
  try {
    await axios.post(`${WAHA_URL}/chats/${chatId}/messages`, {
      sessionName,
      text: message,
    })

    console.log('[v0] Message sent via WAHA:', { chatId, messagePreview: message.substring(0, 50) })
    return true
  } catch (error) {
    console.error('[v0] Error sending WAHA message:', error)
    return false
  }
}

export async function getWAHAChats(sessionName: string): Promise<any[]> {
  try {
    const response = await axios.get(`${WAHA_URL}/chats`, {
      params: { sessionName },
    })
    return response.data
  } catch (error) {
    console.error('[v0] Error getting WAHA chats:', error)
    return []
  }
}

export async function getWAHAMessages(
  sessionName: string,
  chatId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    const response = await axios.get(`${WAHA_URL}/chats/${chatId}/messages`, {
      params: { sessionName, limit },
    })
    return response.data
  } catch (error) {
    console.error('[v0] Error getting WAHA messages:', error)
    return []
  }
}

export async function setWAHAWebhook(
  sessionName: string,
  webhookUrl: string,
  events: string[] = ['message']
): Promise<boolean> {
  try {
    await axios.patch(`${WAHA_URL}/sessions/${sessionName}/webhook`, {
      webhookUrl,
      webhookEvents: events,
    })

    console.log('[v0] WAHA Webhook set successfully')
    return true
  } catch (error) {
    console.error('[v0] Error setting WAHA webhook:', error)
    return false
  }
}

export interface WAHAIncomingMessage {
  id: string
  sessionName: string
  messageId: string
  contactId: string
  from: string
  to: string
  text: string
  timestamp: number
  isFromMe: boolean
  isGroupChat: boolean
}

export function validateWAHAWebhook(body: any): body is WAHAIncomingMessage {
  return (
    body &&
    typeof body.sessionName === 'string' &&
    typeof body.text === 'string' &&
    typeof body.from === 'string'
  )
}
