import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const COMPANY_ID = '8e0bcf1e-490b-4ee4-8bb3-70bb544e2bf3'

export async function GET() {
  const [{ data: leads }, { data: chats }, { data: msgs }] = await Promise.all([
    supabase.from('leads').select('id, name, phone, temperature, lead_score, last_seen_at').eq('company_id', COMPANY_ID).order('created_at', { ascending: false }),
    supabase.from('chats').select('id').eq('company_id', COMPANY_ID).eq('status', 'open'),
    supabase.from('chat_messages').select('id, message_text, created_at').eq('sender_type', 'customer').order('created_at', { ascending: false }).limit(5),
  ])

  return NextResponse.json({
    leads: leads ?? [],
    activeChats: chats?.length ?? 0,
    recentMessages: msgs ?? [],
  })
}
