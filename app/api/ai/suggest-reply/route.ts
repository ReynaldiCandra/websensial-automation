// app/api/ai/suggest-reply/route.ts
// AI Smart Response Suggestions — suggest 3 next replies based on context

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
    const { messages, phone } = await req.json() as {
      messages: { role: string; content: string }[]
      phone: string
    }

    const supabase = createSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Load business context
    const [{ data: settings }, { data: products }, { data: faqs }] = await Promise.all([
      supabase.from('ai_settings').select('*').eq('workspace_id', user.id).single(),
      supabase.from('products').select('name,price,description').eq('workspace_id', user.id).limit(10),
      supabase.from('faqs').select('question,answer').eq('workspace_id', user.id).limit(10),
    ])

    const businessName = settings?.business_name ?? 'bisnis kami'
    const tone         = settings?.tone ?? 'ramah dan profesional'
    const language     = settings?.default_language ?? 'id'

    const productList = products?.map(p => `- ${p.name}: ${p.price}`).join('\n') ?? 'Tidak ada produk'
    const faqList     = faqs?.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n') ?? ''

    const langInstruction = language === 'id' ? 'Balas dalam Bahasa Indonesia.' : `Balas dalam bahasa: ${language}.`

    const systemPrompt = `Kamu adalah AI sales assistant untuk ${businessName}.
Tone: ${tone}.
${langInstruction}

Produk:
${productList}

FAQ:
${faqList}

Tugasmu: Berikan TEPAT 3 pilihan balasan JSON yang bisa langsung dikirim ke customer.
Format respons — HANYA JSON array, tidak ada teks lain:
[
  { "text": "<teks balasan>", "action": "<label aksi: FAQ/QUOTATION/FOLLOW_UP/INVOICE/CLOSING/INFO>" },
  { "text": "<teks balasan>", "action": "<label aksi>" },
  { "text": "<teks balasan>", "action": "<label aksi>" }
]

Sesuaikan setiap pilihan dengan konteks chat terakhir. Satu opsi harus mendorong ke closing (quotation/invoice). Jangan gunakan emoji berlebihan.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.6,
      max_tokens: 600,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-6) as { role: 'user' | 'assistant'; content: string }[],
        { role: 'user', content: 'Berikan 3 saran balasan terbaik dalam format JSON.' },
      ],
    })

    const raw = completion.choices[0]?.message?.content ?? '[]'

    // Parse JSON safely
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
