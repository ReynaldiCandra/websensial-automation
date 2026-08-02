import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * WhatsApp Webhook Handler
 * Receives and processes incoming messages from WhatsApp Business API
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    // WhatsApp sends messages in this format
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value

    if (!value?.messages) {
      // Could be a status update or other event
      return NextResponse.json({ received: true })
    }

    // Process each message
    for (const message of value.messages) {
      const contact = value.contacts?.[0]
      const profile = contact?.profile
      
      const parsedMessage = {
        externalId: message.id,
        from: message.from,
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        body: message.text?.body || '',
        type: message.type,
        mediaUrl: message.image?.link || message.video?.link || message.document?.link,
        senderName: profile?.name || 'Unknown',
      }

      // Store message in database
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('id, company_id')
        .eq('channel', 'whatsapp')
        .eq('contact_id', message.from)
        .single()

      if (chatError && chatError.code !== 'PGRST116') {
        console.error('[WhatsApp] Chat lookup error:', chatError)
        continue
      }

      if (!chat) {
        // Create new chat if doesn't exist
        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert({
            channel: 'whatsapp',
            status: 'active',
            company_id: value.business_phone_number_id, // Use phone number ID as company placeholder
          })
          .select('id')
          .single()

        if (createError) {
          console.error('[WhatsApp] Chat creation error:', createError)
          continue
        }

        if (newChat) {
          // Store message
          await supabase.from('chat_messages').insert({
            chat_id: newChat.id,
            sender_type: 'contact',
            message_body: parsedMessage.body,
            message_type: parsedMessage.type,
            external_message_id: parsedMessage.externalId,
          })
        }
      } else {
        // Store message in existing chat
        await supabase.from('chat_messages').insert({
          chat_id: chat.id,
          sender_type: 'contact',
          message_body: parsedMessage.body,
          message_type: parsedMessage.type,
          external_message_id: parsedMessage.externalId,
        })

        // Update chat last_message_at
        await supabase
          .from('chats')
          .update({ last_message_at: new Date() })
          .eq('id', chat.id)
      }

      // Mark message as processed
      await supabase.from('processed_messages').insert({
        company_id: chat?.company_id || value.business_phone_number_id,
        message_id: message.id,
        external_id: message.id,
        source: 'whatsapp',
        status: 'completed',
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[WhatsApp] Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * WhatsApp Webhook Verification
 * Required for initial webhook setup in Meta Business Platform
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'websensial_verify_token'

  if (mode === 'subscribe' && token === verifyToken) {
    return NextResponse.json(challenge)
  }

  return NextResponse.json({ error: 'Invalid verification' }, { status: 403 })
}
