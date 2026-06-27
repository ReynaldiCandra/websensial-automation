import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const WAHA = process.env.WAHA_API_URL
  const KEY = process.env.WAHA_API_KEY
  const SESSION = process.env.WAHA_SESSION || 'default'

  if (!WAHA || !KEY) {
    return NextResponse.json({ error: 'Server WAHA env tidak lengkap' }, { status: 500 })
  }

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
    const { phone, message, chatId } = body as {
      phone?: string
      message?: string
      chatId?: string
    }

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "phone" field' }, { status: 400 })
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Missing or invalid "message" field' }, { status: 400 })
    }

    const digits = phone.replace(/\D/g, '')
    const chatIdWa = digits.includes('@') ? phone : `${digits}@c.us`

    const sendRes = await fetch(`${WAHA}/api/sendText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': KEY },
      body: JSON.stringify({
        chatId: chatIdWa,
        text: message.trim(),
        session: SESSION,
      }),
    })

    if (!sendRes.ok) {
      const detail = await sendRes.text().catch(() => '')
      console.error(`[whatsapp/send] WAHA error ${sendRes.status}:`, detail)
      return NextResponse.json({ error: `WAHA error ${sendRes.status}`, detail }, { status: 502 })
    }

    const sendData = await sendRes.json().catch(() => ({}))

    if (chatId) {
      await supabase.from('chat_messages').insert({
        chat_id: chatId,
        sender_type: 'agent',
        sender_id: user.id,
        message_text: message.trim(),
        message_type: 'text',
      })
    }

    return NextResponse.json({ success: true, data: sendData })
  } catch (error) {
    console.error('[whatsapp/send] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to send message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
