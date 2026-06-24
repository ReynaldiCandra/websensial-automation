import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getWhatsAppClient } from '@/lib/whatsapp/baileys-client'

export async function GET() {
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

    const { data: session } = await supabase
      .from('whatsapp_sessions')
      .select('connected, phone, battery, last_connected_at')
      .eq('user_id', user.id)
      .maybeSingle()

    const connected = client.isConnected || session?.connected === true

    return NextResponse.json({
      connected,
      phone: client.phone ?? session?.phone ?? null,
      battery: client.battery ?? session?.battery ?? null,
      lastConnectedAt: session?.last_connected_at ?? null,
    })
  } catch (error) {
    console.error('[whatsapp/status] GET error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get WhatsApp status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
