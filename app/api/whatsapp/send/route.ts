import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getWhatsAppClient } from '@/lib/whatsapp/baileys-client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { to, message, leadId } = body as {
      to?: string
      message?: string
      leadId?: string
    }

    if (!to || typeof to !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "to" field' },
        { status: 400 },
      )
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Missing or invalid "message" field' },
        { status: 400 },
      )
    }

    const client = getWhatsAppClient(user.id)

    if (!client.isConnected) {
      return NextResponse.json(
        { error: 'WhatsApp not connected. Scan QR code first.' },
        { status: 409 },
      )
    }

    const result = await client.sendMessage(to, message.trim())

    await supabase.from('chat_messages').insert({
      chat_id: to,
      sender_type: 'agent',
      sender_id: user.id,
      message_text: message.trim(),
      message_type: 'text',
      ...(leadId ? { lead_id: leadId } : {}),
    })

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      timestamp: result.timestamp,
    })
  } catch (error) {
    console.error('[whatsapp/send] POST error:', error)
    return NextResponse.json(
      {
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
