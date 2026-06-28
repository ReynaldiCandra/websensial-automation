// app/api/webhooks/waha/route.ts
// Schema: company_id, chats+chat_messages, ai_training (user_id), lead_score

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ─── Language detection ────────────────────────────────────
function detectLanguage(text: string): string {
  const l = text.toLowerCase()
  if (/\b(halo|aku|kamu|tolong|berapa|mau|bisa|dong|kak|nih|yuk|harga|produk)\b/.test(l)) return 'id'
  if (/\b(hello|please|price|want|can|how|much|need|hi|thanks)\b/.test(l)) return 'en'
  if (/\b(你好|价格|多少|需要)\b/.test(text)) return 'zh'
  return 'id'
}

// ─── Build system prompt ───────────────────────────────────
function buildPrompt(ctx: {
  businessName: string; tone: string; instructions: string
  products: { name: string; price: number; description: string }[]
  faqs: { question: string; answer: string }[]
  language: string
}): string {
  const langLabel: Record<string, string> = { id: 'Bahasa Indonesia', en: 'English', zh: 'Mandarin' }
  const productList = ctx.products.length
    ? ctx.products.map(p => `- ${p.name}: Rp${Number(p.price).toLocaleString('id-ID')} — ${p.description ?? ''}`).join('\n')
    : 'Belum ada produk terdaftar.'
  const faqList = ctx.faqs.length
    ? ctx.faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
    : 'Belum ada FAQ.'

  return `Kamu adalah Kak Alexa, CS ${ctx.businessName}.

KEPRIBADIAN:
Hangat, natural, singkat — seperti CS Shopee/Tokopedia terbaik. Bukan robot, bukan email resmi.

ATURAN KERAS (JANGAN DILANGGAR):
1. Sebut diri "saya" — JANGAN "kami"
2. Panggil customer "kak" — JANGAN "Anda", "kamu", "Bapak", "Ibu"
3. MAX 2 kalimat per balas — tidak lebih
4. JANGAN tulis label apapun seperti "(Akhiri dengan...)" atau "[Hook]" — langsung tulis kalimatnya saja
5. JANGAN pakai bullet, **, ##, atau formatting
6. HANYA jawab dari data di bawah — kalau tidak ada datanya, jawab: "Boleh saya tanyakan dulu ke tim ya kak 🙏"
7. JANGAN mengarang info, program, atau fasilitas yang tidak ada di data
8. Satu pertanyaan per pesan — jangan tanya banyak sekaligus

CARA MENGAKHIsatu, jangan tulis labelnya):
Gunakan salah satu secara natural di akhir kalimat:
→ Ada yang ingin ditanyakan lagi kak? 😊
→ Mau saya bantu lanjut kak? 🙏
→ Kalau ada yang kurang jelas, saya siap bantu kak ✨
→ Ada lagi yang bisa saya bantu kak? 🎉

ALUR LEADS BARU (pesan pertama):
Sambut hangat → tanya nama dulu → setelah dapat nama, tanya daerah → lalu tanya jenjang

LEADS DARI LUAR DAERAH:
Kalau sebut kota selain Jabodetabek → langsung antusias soal asrama boarding, highlight: makan 3x, laundry, AC, konselor, psikolog

TONE: ${ctx.tone || 'ramah, hangat'}
${ctx.instructions ? `KONTEKS TAMBAHAN: ${ctx.instructions}` : ''}

=== DATA PRODUK & LAYANAN ===
${productList}

=== FAQ ===
${faqList}

INGAT: Kalau tidak ada di data di atas → jangan jawab, arahkan ke tim.`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Support WAHA & Baileys format
    const event   = body.event ?? body.type
    const payload = body.payload ?? body

    if (event !== 'message') {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const from    = payload.from ?? payload.key?.remoteJid ?? ''
    const msgBody = payload.body ?? payload.message?.conversation ?? payload.message?.extendedTextMessage?.text ?? ''

    if (!from || !msgBody || from.includes('@g.us')) {
      return NextResponse.json({ ok: true, skipped: 'group or empty' })
    }

    const phone = from.replace(/@s\.whatsapp\.net$/, '').replace(/@lid$/, '').replace(/\D/g, '')
    const contactName = payload.pushName ?? payload._data?.pushName ?? payload.notifyName ?? payload._data?.notifyName ?? null

    // ── 1. Cari company dari sesi WhatsApp ────────────────────
    // Ambil company_id dari env atau match nomor WA
    const companyId = process.env.DEFAULT_COMPANY_ID
    if (!companyId) return NextResponse.json({ ok: false, error: 'DEFAULT_COMPANY_ID not set' })

    // Ambil owner_id dari companies
    const { data: company } = await supabase
      .from('companies')
      .select('id, name, owner_id')
      .eq('id', companyId)
      .single()
    if (!company) return NextResponse.json({ ok: false, error: 'Company not found' })

    // ── 2. Cari atau buat lead ────────────────────────────────
    let { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('company_id', companyId)
      .eq('phone', phone)
      .single()

    if (!lead) {
      const { data: newLead } = await supabase
        .from('leads')
        .insert({
          company_id: companyId,
          phone,
          name: contactName ?? phone,
          status: 'new',
          temperature: 'cold',
          lead_score: 10,
          source: 'whatsapp',
        })
        .select()
        .single()
      lead = newLead
    }

    // ── 3. Cari atau buat chat ────────────────────────────────
    let { data: chat } = await supabase
      .from('chats')
      .select('id')
      .eq('company_id', companyId)
      .eq('lead_id', lead?.id)
      .single()

    if (!chat) {
      const { data: newChat } = await supabase
        .from('chats')
        .insert({
          company_id: companyId,
          lead_id: lead?.id,
          whatsapp_contact_id: phone,
          status: 'open',
        })
        .select('id')
        .single()
      chat = newChat
    }

    // ── 4. Simpan pesan masuk ke chat_messages ────────────────
    await supabase.from('chat_messages').insert({
      chat_id: chat?.id,
      sender_type: 'customer',
      sender_id: phone,
      message_text: msgBody,
      message_type: 'text',
    })

    // Update lead last_message & last_seen_at
    await supabase.from('leads').update({
      last_message: msgBody.slice(0, 200),
      last_seen_at: new Date().toISOString(),
    }).eq('id', lead?.id).eq('company_id', companyId)

    // Update chat last_message_at
    await supabase.from('chats').update({
      last_message_at: new Date().toISOString(),
    }).eq('id', chat?.id)

    // ── 5. Cek escalasi (human takeover) ──────────────────────
    if (lead?.is_escalated) {
      return NextResponse.json({ ok: true, mode: 'human_escalated' })
    }

    // ── 6. Load AI settings dari ai_training (user_id) ───────
    const [{ data: aiTraining }, { data: products }, { data: faqs }] = await Promise.all([
      supabase.from('ai_training').select('*').eq('user_id', company.owner_id).single(),
      supabase.from('products').select('name, price, description').eq('user_id', company.owner_id),
      supabase.from('faqs').select('question, answer').eq('user_id', company.owner_id),
    ])

    const aiMode = aiTraining?.ai_mode ?? 'auto'
    if (aiMode === 'manual' || aiMode === 'off') {
      return NextResponse.json({ ok: true, mode: 'manual' })
    }

    // ── 7. Ambil riwayat chat dari chat_messages ──────────────
    const { data: history } = await supabase
      .from('chat_messages')
      .select('message_text, sender_type')
      .eq('chat_id', chat?.id)
      .order('created_at', { ascending: true })
      .limit(20)

    const chatHistory = (history ?? []).map(m => ({
      role: m.sender_type === 'customer' ? 'user' : 'assistant',
      content: m.message_text,
    })) as { role: 'user' | 'assistant'; content: string }[]

    // ── 8. Detect language ────────────────────────────────────
    const usedLang = aiTraining?.multi_language
      ? detectLanguage(msgBody)
      : (aiTraining?.default_language ?? 'id')

    // ── 9. Generate AI reply ──────────────────────────────────
    const systemPrompt = buildPrompt({
      businessName: aiTraining?.business_name ?? company.name ?? 'bisnis kami',
      tone: aiTraining?.tone ?? '',
      instructions: aiTraining?.special_instructions ?? '',
      products: products ?? [],
      faqs: faqs ?? [],
      language: usedLang,
    })

    let aiReply = ''
    let shouldEscalate = false

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 400,
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatHistory.slice(-10),
          { role: 'user', content: msgBody },
        ],
      })
      aiReply = completion.choices[0]?.message?.content?.trim() ?? ''
      if (aiReply.toLowerCase().includes('[eskalasi]') || aiReply.toLowerCase().includes('[escalate]')) {
        shouldEscalate = true
      }
    } catch (_) {
      shouldEscalate = true
    }

    // ── 10. Escalate jika perlu ───────────────────────────────
    const fallbackMsg = aiTraining?.fallback_message ?? 'Mohon tunggu, saya hubungkan ke tim kami.'
    if (shouldEscalate || !aiReply) {
      await supabase.from('leads').update({
        is_escalated: true,
        escalated_at: new Date().toISOString(),
      }).eq('id', lead?.id).eq('company_id', companyId)
      aiReply = fallbackMsg
    }

    if (!aiReply) return NextResponse.json({ ok: true, skipped: 'empty reply' })

    // ── 11. Kirim via WhatsApp ────────────────────────────────
    await fetch(`${process.env.WAHA_API_URL}/api/sendText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': process.env.WAHA_API_KEY ?? '' },
      body: JSON.stringify({
        chatId: from,
        text: aiReply,
        session: process.env.WAHA_SESSION ?? 'default',
      }),
    })

    // ── 12. Simpan balasan AI ke chat_messages ────────────────
    await supabase.from('chat_messages').insert({
      chat_id: chat?.id,
      sender_type: shouldEscalate ? 'agent' : 'ai',
      message_text: aiReply,
      message_type: 'text',
    })

    // ── 13. Re-score lead (fire & forget) ────────────────────
    if (lead?.id) {
      void fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/score-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-service-key': process.env.SUPABASE_SERVICE_ROLE_KEY ?? '' },
        body: JSON.stringify({ leadId: lead.id, phone }),
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true, replied: aiReply.slice(0, 50) })
  } catch (err) {
    console.error('[waha webhook]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
