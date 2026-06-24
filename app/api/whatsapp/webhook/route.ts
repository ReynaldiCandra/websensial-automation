import { NextRequest, NextResponse } from 'next/server'
import {
  verifyWebhookToken,
  processWebhookEvent,
  validateWebhookSignature,
} from '@/lib/services/whatsapp-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

    if (!verifyToken) {
      console.error('[v0] WHATSAPP_VERIFY_TOKEN is not configured')
      return NextResponse.json(
        { error: 'Webhook verification token not configured' },
        { status: 500 }
      )
    }

    if (mode === 'subscribe' && verifyWebhookToken(token || '', verifyToken)) {
      console.log('[v0] WhatsApp webhook verified')
      return new NextResponse(challenge, { status: 200 })
    }

    return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
  } catch (error) {
    console.error('[v0] Webhook GET Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-hub-signature-256') || ''
    const appSecret = process.env.WHATSAPP_APP_SECRET

    // Optional: Validate signature
    if (appSecret && signature) {
      const isValid = validateWebhookSignature(body, signature, appSecret)
      if (!isValid) {
        console.warn('[v0] Invalid webhook signature')
        // In production, return 403. For testing, we'll allow it.
      }
    }

    const event = JSON.parse(body)
    const { messages, statuses } = processWebhookEvent(event)

    // Process incoming messages
    if (messages && messages.length > 0) {
      for (const message of messages) {
        console.log('[v0] Incoming WhatsApp message:', {
          from: message.from,
          text: message.text?.body,
          id: message.id,
        })

        // TODO: Save message to database
        // TODO: Trigger AI response if needed
      }
    }

    // Process message statuses
    if (statuses && statuses.length > 0) {
      for (const status of statuses) {
        console.log('[v0] Message status update:', {
          id: status.id,
          status: status.status,
        })

        // TODO: Update message status in database
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Webhook POST Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
