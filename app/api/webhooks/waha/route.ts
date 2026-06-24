import { NextRequest, NextResponse } from 'next/server'
import {
  validateWAHAWebhook,
  WAHAIncomingMessage,
} from '@/lib/services/waha-whatsapp-service'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('[v0] WAHA Webhook received:', {
      from: body.from,
      text: body.text?.substring(0, 50),
      timestamp: body.timestamp,
    })

    if (!validateWAHAWebhook(body)) {
      return NextResponse.json(
        { error: 'Invalid WAHA webhook format' },
        { status: 400 }
      )
    }

    const wahaMessage = body as WAHAIncomingMessage

    if (wahaMessage.isFromMe) {
      console.log('[v0] Skipping outgoing message from us')
      return NextResponse.json({ ok: true })
    }

    const supabase = createClient()

    try {
      await supabase.from('chat_messages').insert({
        chat_id: wahaMessage.from,
        sender_type: 'customer',
        sender_id: wahaMessage.from,
        message_text: wahaMessage.text,
        message_type: 'text',
      })

      console.log('[v0] Message saved to database')
    } catch (dbError) {
      console.error('[v0] Database error:', dbError)
    }

    return NextResponse.json({ ok: true, messageId: wahaMessage.messageId })
  } catch (error) {
    console.error('[v0] WAHA Webhook Error:', error)

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const wabaToken = request.nextUrl.searchParams.get('hub.verify_token')
  const challenge = request.nextUrl.searchParams.get('hub.challenge')

  const verifyToken = process.env.WAHA_VERIFY_TOKEN || 'websensial-verify-token'

  if (wabaToken === verifyToken && challenge) {
    return NextResponse.json(challenge)
  }

  return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
}
