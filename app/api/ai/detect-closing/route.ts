// app/api/ai/detect-closing/route.ts
// Auto Closing Detection — AI detects when a deal is ready to close

import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

function createSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const { phone, leadId } = await req.json() as { phone: string; leadId?: string }

    const supabase = createSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get closing keywords from settings
    const { data: settings } = await supabase
      .from('ai_settings')
      .select('closing_keywords')
      .eq('workspace_id', user.id)
      .single()

    const keywords: string[] = settings?.closing_keywords ?? [
      'transfer', 'bayar', 'lanjut invoice', 'oke deal', 'setuju', 'mau pesan', 'jadi beli'
    ]

    // Get last 15 messages
    const { data: msgs } = await supabase
      .from('messages')
      .select('content, sender_type, created_at')
      .eq('workspace_id', user.id)
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(15)

    if (!msgs || msgs.length === 0) {
      return NextResponse.json({ isClosing: false, confidence: 0, reason: 'Belum ada pesan' })
    }

    // Quick keyword check (fast path)
    const lastCustomerMessages = msgs
      .filter(m => m.sender_type === 'customer')
      .slice(0, 5)
      .map(m => m.content.toLowerCase())

    const keywordHit = keywords.some(kw =>
      lastCustomerMessages.some(msg => msg.includes(kw.toLowerCase()))
    )

    const transcript = msgs
      .reverse()
      .map(m => `[${m.sender_type === 'customer' ? 'Customer' : 'AI'}]: ${m.content}`)
      .join('\n')

    // AI confirmation
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content: `Kamu mendeteksi apakah customer siap closing (deal ditandatangani / bayar). 

Tanda closing:
- Customer konfirmasi mau beli/pesan
- Customer minta invoice atau nomor rekening
- Customer bilang sudah transfer / kirim bukti bayar
- Customer setuju dengan harga yang diajukan
- Customer minta mulai pengerjaan

Respons HANYA JSON:
{ "isClosing": <true|false>, "confidence": <0-100>, "reason": "<alasan singkat>", "suggestedAction": "<SEND_INVOICE|MARK_WON|FOLLOW_UP|NONE>" }`,
        },
        {
          role: 'user',
          content: `Keyword match: ${keywordHit ? 'YA' : 'TIDAK'}\n\nPercakapan:\n${transcript}`,
        },
      ],
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    let result: { isClosing: boolean; confidence: number; reason: string; suggestedAction: string } = {
      isClosing: false, confidence: 0, reason: '', suggestedAction: 'NONE',
    }

    try {
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) result = JSON.parse(match[0])
    } catch (_) { /* use defaults */ }

    // If closing detected with high confidence, update lead score & move pipeline
    if (result.isClosing && result.confidence >= 70 && leadId) {
      await supabase
        .from('leads')
        .update({ score: 95, temperature: 'hot' })
        .eq('id', leadId)
        .eq('workspace_id', user.id)

      // Move pipeline stage to "Invoice Sent" or "Won"
      await supabase
        .from('pipeline_deals')
        .update({ stage: result.suggestedAction === 'MARK_WON' ? 'won' : 'invoice_sent' })
        .eq('lead_id', leadId)
        .eq('workspace_id', user.id)
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('detect-closing error:', err)
    return NextResponse.json({ error: 'Gagal deteksi closing' }, { status: 500 })
  }
}
