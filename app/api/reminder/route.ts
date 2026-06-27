// app/api/reminder/route.ts
// Reminder Automation — follow-up otomatis untuk invoice pending & inactive chats
// Trigger via cron job: POST /api/reminder dengan header Authorization

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

// WAJIB ADA AGAR TIDAK DI-BUILD OLEH VERCEL
export const dynamic = 'force-dynamic';

async function sendWhatsApp(phone: string, message: string) {
  try {
    await fetch(`${process.env.WAHA_API_URL}/api/sendText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: `${phone}@s.whatsapp.net`,
        text: message,
        session: process.env.WAHA_SESSION ?? 'default',
      }),
    })
    return true
  } catch (_) {
    return false
  }
}

async function generateReminderMessage(
  groq: Groq,
  type: 'invoice' | 'inactive',
  context: { customerName: string; businessName: string; invoiceId?: string; daysSince?: number; tone?: string }
): Promise<string> {
  const toneHint = context.tone ?? 'ramah dan sopan'

  const prompt = type === 'invoice'
    ? `Buat pesan reminder pembayaran invoice WhatsApp untuk ${context.customerName}.
         Bisnis: ${context.businessName}. Invoice: ${context.invoiceId}.
         Tone: ${toneHint}. Maksimal 3 kalimat, natural, tidak terkesan spam.`
    : `Buat pesan follow-up untuk lead ${context.customerName} yang tidak membalas selama ${context.daysSince} hari.
         Bisnis: ${context.businessName}. Tone: ${toneHint}. Singkat, friendly, ajak bicara lagi.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 150,
      messages: [
        { role: 'system', content: 'Kamu adalah Kak Alexa, CS yang ramah. Tulis pesan WhatsApp reminder yang natural, hangat, pakai kak/kakak, sebut diri saya bukan kami, max 3 kalimat, ada emoticon, tidak spam.' },
        { role: 'user', content: prompt },
      ],
    })
    return completion.choices[0]?.message?.content?.trim() ?? ''
  } catch (_) {
    if (type === 'invoice') {
      return `Halo kak ${context.customerName}, ada yang bisa saya bantu terkait invoice-nya? Saya siap membantu ya kak 😊`
    }
    return `Halo ${context.customerName}, ada yang bisa kami bantu? Jangan ragu untuk bertanya!`
  }
}

export async function POST(req: NextRequest) {
  // Security: require cron secret
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 1. PINDAHKAN INISIALISASI KE SINI (Di DALAM fungsi POST)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  const results = { invoiceReminders: 0, inactiveFollowups: 0, errors: 0 }

  try {
    // ── 1. Invoice Payment Reminders ──────────────────────────
    const cutoff24h  = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const cutoff72h  = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()

    const { data: pendingInvoices } = await supabase
      .from('invoices')
      .select('*, leads(name, phone, workspace_id)')
      .eq('status', 'pending')
      .lt('created_at', cutoff24h)
      .lt('reminder_count', 3)

    for (const invoice of pendingInvoices ?? []) {
      const lead = invoice.leads as { name: string; phone: string; workspace_id: string } | null
      if (!lead?.phone) continue

      const { data: settings } = await supabase
        .from('ai_settings')
        .select('business_name, tone')
        .eq('workspace_id', lead.workspace_id)
        .single()

      const message = await generateReminderMessage(groq, 'invoice', {
        customerName: lead.name,
        businessName: settings?.business_name ?? 'kami',
        invoiceId: invoice.id.slice(0, 8).toUpperCase(),
        tone: settings?.tone,
      })

      if (!message) continue

      const sent = await sendWhatsApp(lead.phone, message)

      if (sent) {
        await Promise.all([
          supabase
            .from('invoices')
            .update({ reminder_count: (invoice.reminder_count ?? 0) + 1, last_reminder_at: new Date().toISOString() })
            .eq('id', invoice.id),
          supabase.from('messages').insert({
            workspace_id: lead.workspace_id,
            phone: lead.phone,
            content: message,
            sender_type: 'ai',
          }),
          supabase.from('reminder_logs').insert({
            workspace_id: lead.workspace_id,
            invoice_id: invoice.id,
            phone: lead.phone,
            message,
            status: 'sent',
          }),
        ])
        results.invoiceReminders++
      }
    }

    // ── 2. Inactive Chat Follow-ups ───────────────────────────
    const { data: inactiveLeads } = await supabase
      .from('leads')
      .select('*')
      .not('temperature', 'eq', 'cold')
      .eq('is_escalated', false)
      .lt('last_seen_at', cutoff72h)

    for (const lead of inactiveLeads ?? []) {
      if (!lead.phone) continue

      const { data: recentLog } = await supabase
        .from('reminder_logs')
        .select('id')
        .eq('phone', lead.phone)
        .eq('workspace_id', lead.workspace_id)
        .gt('sent_at', cutoff72h)
        .limit(1)

      if (recentLog && recentLog.length > 0) continue

      const daysSince = Math.floor((Date.now() - new Date(lead.last_seen_at).getTime()) / (1000 * 60 * 60 * 24))

      const { data: settings } = await supabase
        .from('ai_settings')
        .select('business_name, tone')
        .eq('workspace_id', lead.workspace_id)
        .single()

      const message = await generateReminderMessage(groq, 'inactive', {
        customerName: lead.name ?? 'Kak',
        businessName: settings?.business_name ?? 'kami',
        daysSince,
        tone: settings?.tone,
      })

      if (!message) continue

      const sent = await sendWhatsApp(lead.phone, message)

      if (sent) {
        await Promise.all([
          supabase.from('reminder_logs').insert({
            company_id: lead.company_id,
            lead_id: lead.id,
            phone: lead.phone,
            message,
            status: 'sent',
            sent_at: new Date().toISOString(),
          }),
        ])
        results.inactiveFollowups++
      }
    }
  } catch (err) {
    console.error('Reminder error:', err)
    results.errors++
  }

  return NextResponse.json({
    success: true,
    ...results,
    timestamp: new Date().toISOString(),
  })
}
