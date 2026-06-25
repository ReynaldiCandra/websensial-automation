// app/api/ai/score-lead/route.ts
// Auto Lead Scoring — analisis chat history dan beri skor 0-100

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

type Temperature = 'hot' | 'warm' | 'cold'

export async function POST(req: NextRequest) {
  try {
    const { leadId, phone } = await req.json() as { leadId: string; phone: string }

    const supabase = createSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get last 20 messages
    const { data: msgs } = await supabase
      .from('messages')
      .select('content, sender_type, created_at')
      .eq('workspace_id', user.id)
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!msgs || msgs.length === 0) {
      return NextResponse.json({ score: 10, temperature: 'cold', signals: ['Belum ada pesan'] })
    }

    const transcript = msgs
      .reverse()
      .map(m => `[${m.sender_type === 'customer' ? 'Customer' : 'AI'}]: ${m.content}`)
      .join('\n')

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content: `Kamu adalah sistem scoring lead untuk bisnis Indonesia. Analisis percakapan WhatsApp berikut dan beri skor 0-100.

Panduan scoring:
- 80-100 (HOT): Tanya harga spesifik, minta invoice/quotation, sebut deadline, siap bayar, minta konfirmasi
- 40-79 (WARM): Tanya produk/layanan, minta info lebih, masih pertimbangkan
- 0-39 (COLD): Hanya tanya-tanya umum, belum ada intent beli

Respons HANYA dalam format JSON:
{
  "score": <0-100>,
  "temperature": "<hot|warm|cold>",
  "signals": ["<sinyal 1>", "<sinyal 2>", "<sinyal 3>"]
}`,
        },
        {
          role: 'user',
          content: `Analisis percakapan ini:\n\n${transcript}`,
        },
      ],
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'

    let result: { score: number; temperature: Temperature; signals: string[] } = {
      score: 10,
      temperature: 'cold',
      signals: [],
    }

    try {
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) result = JSON.parse(match[0])
    } catch (_) { /* use defaults */ }

    // Clamp score
    result.score = Math.max(0, Math.min(100, result.score))

    // Determine temperature from score if AI gave wrong value
    if (result.score >= 70)      result.temperature = 'hot'
    else if (result.score >= 40) result.temperature = 'warm'
    else                          result.temperature = 'cold'

    // Update lead in DB
    await supabase
      .from('leads')
      .update({
        score: result.score,
        temperature: result.temperature,
      })
      .eq('id', leadId)
      .eq('workspace_id', user.id)

    return NextResponse.json(result)
  } catch (err) {
    console.error('score-lead error:', err)
    return NextResponse.json({ error: 'Gagal scoring lead' }, { status: 500 })
  }
}
