// app/api/ai/suggest-reply/route.ts
// AI Smart Response Suggestions — suggest 3 next replies based on context

import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as {
      messages: { role: string; content: string }[]
      phone?: string
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [{ data: aiTraining }, { data: products }, { data: faqs }] = await Promise.all([
      supabase.from('ai_training').select('*').eq('user_id', user.id).single(),
      supabase.from('products').select('name, price, description').eq('user_id', user.id).limit(10),
    supabase.from('faqs').select('question, answer').eq('user_id', user.id).limit(10),
    ])

    const businessName = aiTraining?.business_name ?? 'bisnis kami'
    const tone = aiTraining?.tone ?? 'ramah dan profesional'
    const language = aiTraining?.default_language ?? 'id'

    const productList = products?.length
      ? products.map(p => `- ${p.name}: Rp${Number(p.price).toLocaleString('id-ID')}`).join('\n')
      : 'Tidak ada produk'
    const faqList = faqs?.length
      ? faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n')
      : ''

    const langInstruction = language === 'id' ? 'Balas dalam Bahasa Indonesia.' : `Balas dalam bahasa: ${language}.`

    const systemPrompt = `Kamu adalah Kak Alexa, CS ${businessName} yang ramah dan natural seperti CS marketplace terbaik.

ATURAN BAHASA WAJIB:
- Sebut diri "saya" bukan "kami"
- Panggil customer "kak" atau "kakak" bukan "kamu" atau "Anda"
- Kalimat pendek dan natural seperti chat WA sungguhan
- Pakai emoticon secukupnya: 😊 🙏 ✨ 🎉
- JANGAN pakai markdown atau bullet point
- Selalu akhiri dengan closing hook yang natural

Tone: ${tone}.
${langInstruction}

Data Produk:
${productList}

FAQ:
${faqList}

TUGASMU: Berikan TEPAT 3 pilihan balasan kontekstual sesuai situ.
Variasikan: 1 info langsung, 1 empati+solusi, 1 dorong closing.

Format HANYA JSON array tanpa teks lain:
[
  { "text": "<balasan natural>", "action": "<FAQ|QUOTATION|FOLLOW_UP|INVOICE|CLOSING|INFO|EMPATHY>" },
  { "text": "<balasan natural>", "action": "<label>" },
  { "text": "<balasan natural>", "action": "<label>" }
]`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 600,
      messages: [
        { role: 'system', content: systemPrompt },
        ...(messages.slice(-6) as { role: 'user' | 'assistant'; content: string }[]),
        { role: 'user', content: 'Berikan 3 saran balasan terbaik dalam format JSON.' },
      ],
    })

    const raw = completion.choices[0]?.message?.content ?? '[]'

    let suggestions: { text: string; action: string }[] = []
    try {
      const match = raw.match(/\[[\s\S]*\]/)
      if (match) suggestions = JSON.parse(match[0])
    } catch (_) {
      suggestions = [{ text: raw.trim(), action: 'INFO' }]
    }

    return NextResponse.json({ suggestions: suggestions.slice(0, 3) })
  } catch (err) {
    console.error('suggest-reply error:', err)
    return NextResponse.json({ error: 'Gagal membuat saran' }, { status: 500 })
  }
}
