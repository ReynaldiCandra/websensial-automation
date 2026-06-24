import axios from 'axios'

export interface WhatsAppMessage {
  to: string
  body: string
  mediaUrl?: string
}

export interface WhatsAppWebhookEvent {
  entry: Array<{
    changes: Array<{
      value: {
        messages?: Array<{
          from: string
          id: string
          text?: {
            body: string
          }
          image?: {
            id: string
          }
        }>
        statuses?: Array<{
          id: string
          status: string
          timestamp: string
        }>
      }
    }>
  }>
}

const WHATSAPP_API_URL = 'https://graph.instagram.com/v18.0'

export async function sendWhatsAppMessage(
  phoneNumberId: string,
  message: WhatsAppMessage
): Promise<boolean> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

  if (!accessToken) {
    console.error('[v0] WHATSAPP_ACCESS_TOKEN is not configured')
    return false
  }

  if (!phoneNumberId) {
    console.error('[v0] Phone number ID is missing')
    return false
  }

  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: message.to,
        type: message.mediaUrl ? 'image' : 'text',
        text: message.mediaUrl ? undefined : { body: message.body },
        image: message.mediaUrl
          ? { link: message.mediaUrl }
          : undefined,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log(
      `[v0] WhatsApp message sent to ${message.to}:`,
      response.data
    )
    return true
  } catch (error) {
    console.error('[v0] WhatsApp Service Error:', error)
    return false
  }
}

export async function sendWhatsAppTemplate(
  phoneNumberId: string,
  to: string,
  templateName: string,
  templateLanguage: string = 'en',
  parameters?: string[]
): Promise<boolean> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

  if (!accessToken) {
    console.error('[v0] WHATSAPP_ACCESS_TOKEN is not configured')
    return false
  }

  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: templateLanguage,
          },
          components: parameters
            ? [
                {
                  type: 'body',
                  parameters: parameters.map((param) => ({
                    type: 'text',
                    text: param,
                  })),
                },
              ]
            : undefined,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log(
      `[v0] WhatsApp template sent to ${to}:`,
      response.data
    )
    return true
  } catch (error) {
    console.error('[v0] WhatsApp Template Service Error:', error)
    return false
  }
}

export function verifyWebhookToken(
  token: string,
  verifyToken: string
): boolean {
  return token === verifyToken
}

export function validateWebhookSignature(
  body: string,
  signature: string,
  appSecret: string
): boolean {
  // Implement HMAC-SHA256 verification
  const crypto = require('crypto')
  const hash = crypto
    .createHmac('sha256', appSecret)
    .update(body)
    .digest('hex')
  return signature === `sha256=${hash}`
}

export function processWebhookEvent(event: WhatsAppWebhookEvent): {
  messages?: any[]
  statuses?: any[]
} {
  const result: any = {}

  event.entry.forEach((entry) => {
    entry.changes.forEach((change) => {
      if (change.value.messages) {
        result.messages = change.value.messages
      }
      if (change.value.statuses) {
        result.statuses = change.value.statuses
      }
    })
  })

  return result
}
