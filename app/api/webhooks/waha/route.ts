// app/api/webhooks/waha/route.ts
// WAHA WhatsApp Webhook — handles incoming messages
// Includes: multi-language detection, tone customization, fallback to human, auto lead scoring

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ─── Detect language from text ────────────────────────────────
function detectLanguage(text: string): string {
  const lower = text.toLowerCase()
  // Simple heuristic — extend as needed
  if (/\b(halo|aku|kamu|tolong|berapa|mau|bisa|dong|kak|nih|yuk)\b/.test(lower)) return 'id'
  if (/\b(hello|please|price|want|can|how|much|need)\b/.test(lower)) return 'en'
  if (/\b(你好|价格|多少|需要)\b/.test(text)) return 'zh'
  return 'id' // default
}

// ─── Build AI system prompt ───────────────────────────────────
function buildSystemPrompt(ctx: {
  businessName: string
  tone: string
  instructions: string
  products: { name: string; price: number; description: string }[]
  faqs: { question: string; answer: string }[]
  language: string
  aiMode: string
}): string {
  const langMap: Record<string, string> = {
    id: 'Bahasa Indonesia',
    en: 'English',
    zh: 'Mandarin',
  }
  const langLabel = langMap[ctx.language] ?? 'Bahasa Indonesia'

  const productList = ctx.products.length
    ? ctx.products.map(p => `- ${p.name}: Rp${p.price?.toLocaleString('id-ID') ?? 0} — ${p.description}`).join('\n')
    : 'Belum ada produk terdaftar.'

  const faqList = ctx.faqs.length
    ? ctx.faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
    : 'Belum ada FAQ.'

  return `Kamu adalah AI Sales Agent untuk ${ctx.businessName}.
Tone & Gaya: ${ctx.tone || 'ramah, sopan, dan profesional'}.
Instruksi khusus: ${ctx.instructions || 'Bantu customer dari tanya harga sampai closing.'}
Mode AI: ${ctx.aiMode}.
SELALU balas dalam ${langLabel}.

=== DATA PRODUK ===
${productList}

=== FAQ ===
${faqList}

=== PANDUAN ===
- Jika customer tanya harga, jawab dengan harga dari data produk di atas
- Jika customer menunjukkan intent beli (minta invoice, konfirmasi order, dll), tawarkan untuk kirim quotation/invoice
- Jika tidak tahu jawaban, katakan jujur dan tawarkan bantuan tim
- Jangan pernah mengarang informasi yang tidak ada di data
- Respons singkat dan natural, tidak perlu sangat panjang
- Jangan gunakan markdown (**, ##) dalam respons`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Support both WAHA and Baileys webhook formats
    const event   = body.event ?? body.type
    const payload = body.payload ?? body

    if (event !== 'message' && event !== 'message.any') {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const from    = payload.from ?? payload.key?.remoteJid ?? ''
    const msgBody = payload.body ?? payload.message?.conversation ?? payload.message?.extendedTextMessage?.text ?? ''

    if (!from || !msgBody || from.includes('@g.us')) {
      // Skip group messages
      return NextResponse.json({ ok: true, skipped: 'group or empty' })
    }

    // Normalize phone number
    const phone = from.replace('@s.whatsapp.net', '').replace(/\D/g, '')

    // Find workspace by connected phone (waha_sessions table or similar)
    // Adjust this query based on how you store WA sessions
    const { data: session } = await supabase
      .from('waha_sessions')
      .select('workspace_id')
      .limit(1)
      .single()

    const workspaceId = session?.workspace_id ?? process.env.DEFAULT_WORKSPACE_ID
    if (!workspaceId) return NextResponse.json({ ok: false, error: 'No workspace' })

    // ── 1. Find or create lead ────────────────────────────────
    let { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('phone', phone)
      .single()

    if (!lead) {
      const { data: newLead } = await supabase
        .from('leads')
        .insert({
          workspace_id: workspaceId,
          phone,
          name: payload.notifyName ?? phone,
          status: 'new',
          temperature: 'cold',
          score: 10,
        })
        .select()
        .single()
      lead = newLead
    }

    // ── 2. Store incoming message ─────────────────────────────
    await supabase.from('messages').insert({
      workspace_id: workspaceId,
      lead_id: lead?.id,
      phone,
      content: msgBody,
      sender_type: 'customer',
    })

    // ── 3. Update lead last seen ──────────────────────────────
    await supabase
      .from('leads')
      .update({ last_message: msgBody.slice(0, 200), last_seen_at: new Date().toISOString() })
      .eq('phone', phone)
      .eq('workspace_id', workspaceId)

    // ── 4. Check if escalated (human takes over) ──────────────
    if (lead?.is_escalated) {
      return NextResponse.json({ ok: true, mode: 'human_escalated' })
    }

    // ── 5. Load AI settings ───────────────────────────────────
    const [{ data: settings }, { data: products }, { data: faqs }] = await Promise.all([
      supabase.from('ai_settings').select('*').eq('workspace_id', workspaceId).single(),
      supabase.from('products').select('*').eq('workspace_id', workspaceId),
      supabase.from('faqs').select('*').eq('workspace_id', workspaceId),
    ])

    const aiMode = settings?.ai_mode ?? 'auto'

    // If AI mode is off or manual, skip
    if (aiMode === 'manual' || aiMode === 'off') {
      return NextResponse.json({ ok: true, mode: 'manual' })
    }

    // ── 6. Detect language (if multi-language enabled) ────────
    const useMultiLang  = settings?.multi_language ?? false
    const detectedLang  = useMultiLang ? detectLanguage(msgBody) : (settings?.default_language ?? 'id')

    // ── 7. Get chat history ───────────────────────────────────
    const { data: history } = await supabase
      .from('messages')
      .select('content, sender_type')
      .eq('workspace_id', workspaceId)
      .eq('phone', phone)
      .order('created_at', { ascending: true })
      .limit(20)

    const chatHistory = (history ?? []).map(m => ({
      role: m.sender_type === 'customer' ? 'user' : 'assistant',
      content: m.content,
    })) as { role: 'user' | 'assistant'; content: string }[]

    // ── 8. Generate AI reply ──────────────────────────────────
    const systemPrompt = buildSystemPrompt({
      businessName: settings?.business_name ?? 'bisnis kami',
      tone: settings?.tone ?? '',
      instructions: settings?.special_instructions ?? '',
      products: products ?? [],
      faqs: faqs ?? [],
      language: detectedLang,
      aiMode,
    })

    let aiReply = ''
    let shouldFallback = false

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

      // Check if AI itself suggests escalation
      if (
        aiReply.toLowerCase().includes('[eskalasi]') ||
        aiReply.toLowerCase().includes('[escalate]')
      ) {
        shouldFallback = true
      }
    } catch (_) {
      shouldFallback = true
    }

    // ── 9. Fallback handling ──────────────────────────────────
    const fallbackEnabled   = settings?.fallback_enabled ?? true
    const fallbackThreshold = settings?.fallback_threshold ?? 2
    const fallbackMsg       = settings?.fallback_message ?? 'Mohon tunggu, saya hubungkan ke tim kami.'

    // Count consecutive unanswered / low-confidence messages
    const recentAI = (history ?? []).filter(m => m.sender_type === 'ai').slice(-fallbackThreshold)
    const allGeneric = recentAI.every(m =>
      m.content.includes('mohon tunggu') || m.content.includes('tim kami')
    )

    if (fallbackEnabled && (shouldFallback || (recentAI.length >= fallbackThreshold && allGeneric))) {
      // Escalate lead
      await supabase
        .from('leads')
        .update({ is_escalated: true, escalated_at: new Date().toISOString() })
        .eq('phone', phone)
        .eq('workspace_id', workspaceId)

      aiReply = fallbackMsg
    }

    if (!aiReply) return NextResponse.json({ ok: true, skipped: 'empty reply' })

    // ── 10. Send reply via WhatsApp ───────────────────────────
    await fetch(`${process.env.WAHA_API_URL}/api/sendText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: from,
        text: aiReply,
        session: process.env.WAHA_SESSION ?? 'default',
      }),
    })

    // ── 11. Store AI reply ────────────────────────────────────
    await supabase.from('messages').insert({
      workspace_id: workspaceId,
      lead_id: lead?.id,
      phone,
      content: aiReply,
      sender_type: shouldFallback ? 'human' : 'ai',
    })

    // ── 12. Async: re-score lead (fire and forget) ────────────
    if (lead?.id) {
      void fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/score-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({ leadId: lead.id, phone }),
      }).catch(() => { /* non-blocking */ })
    }

    return NextResponse.json({ ok: true, replied: aiReply.slice(0, 50) })
  } catch (err) {
    console.error('waha webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
