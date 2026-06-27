// app/api/ai/score-lead/route.ts
// Auto Lead Scoring — analisis chat history dan beri skor 0-100

import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

type Temperature = 'hot' | 'warm' | 'cold'

export async function POST(req: NextRequest) {
  try {
    const { leadId } = await req.json() as { leadId: string; phone?: string }
    if (!leadId) return NextResponse.json({ error: 'leadId wajib diisi' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single()
    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('id', leadId)
      .eq('company_id', company.id)
      .single()
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const { data: chat } = await supabase
      .from('chats')
      .select('id')
      .eq('lead_id', leadId)
      .eq('company_id', company.id)
      .single()

    if (!chat) {
      return NextResponse.json({ score: 10, temperature: 'cold', signals: ['Belum ada chat'] })
    }

    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('message_text, sender_type, created_at')
      .eq('chat_id', chat.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!msgs || msgs.length === 0) {
      return NextResponse.json({ score: 10, temperature: 'cold', signals: ['Belum ada pesan'] })
    }

    const transcript = msgs
      .reverse()
      .map(m => `[${m.sender_type === 'customer' ? 'Customer' : 'AI'}]: ${m.message_text}`)
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

    result.score = Math.max(0, Math.min(100, result.score))

    if (result.score >= 70) result.temperature = 'hot'
    else if (result.score >= 40) result.temperature = 'warm'
    else result.temperature = 'cold'

    await supabase
      .from('leads')
      .update({
        lead_score: result.score,
        temperature: result.temperature,
      })
      .eq('id', leadId)
      .eq('company_id', company.id)

    return NextResponse.json(result)
  } catch (err) {
    console.error('score-lead error:', err)
    return NextResponse.json({ error: 'Gagal scoring lead' }, { status: 500 })
  }
}
