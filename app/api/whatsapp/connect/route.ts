import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getWhatsAppClient } from '@/lib/whatsapp/baileys-client'

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = getWhatsAppClient(user.id)

    if (client.isConnected) {
      return NextResponse.json({
        connected: true,
        phone: client.phone,
        battery: client.battery,
        status: 'connected',
      })
    }

    const qrPromise = client.waitForQR(30000)
    await client.connect()

    if (client.isConnected) {
      return NextResponse.json({
        connected: true,
        phone: client.phone,
        battery: client.battery,
        status: 'connected',
      })
    }

    const qr = await qrPromise

    await supabase.from('whatsapp_sessions').upsert(
      {
        user_id: user.id,
        connected: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

    return NextResponse.json({
      connected: false,
      status: 'waiting_qr',
      qr,
    })
  } catch (error) {
    console.error('[whatsapp/connect] POST error:', error)
    return NextResponse.json(
      {
        error: 'Failed to initiate WhatsApp connection',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = getWhatsAppClient(user.id)
    await client.destroySession()

    await supabase.from('whatsapp_sessions').delete().eq('user_id', user.id)

    return NextResponse.json({ success: true, message: 'Disconnected' })
  } catch (error) {
    console.error('[whatsapp/connect] DELETE error:', error)
    return NextResponse.json(
      {
        error: 'Failed to disconnect WhatsApp',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
