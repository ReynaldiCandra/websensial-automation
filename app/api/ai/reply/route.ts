import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateAIReply,
  detectLeadScore,
  GroqServiceError,
  type ChatMessage,
} from '@/lib/groq'

const RATE_LIMIT_MAX = 100
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

type ReplyMode = 'suggestion' | 'semi_auto' | 'full_auto'

interface ReplyRequestBody {
  leadId: string
  messages: ChatMessage[]
  mode: ReplyMode
}

interface AiTrainingRow {
  system_prompt: string
  special_instructions: string
  tone: string
  business_name: string
}

function isValidMode(mode: unknown): mode is ReplyMode {
  return mode === 'suggestion' || mode === 'semi_auto' || mode === 'full_auto'
}

function isValidMessages(messages: unknown): messages is ChatMessage[] {
  return (
    Array.isArray(messages) &&
    messages.length > 0 &&
    messages.every(
      (m) =>
        typeof m === 'object' &&
        m !== null &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0,
    )
  )
}

async function checkRateLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<{ allowed: boolean; remaining: number }> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()

  const { count, error } = await supabase
    .from('ai_suggestions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since)

  if (error) {
    throw new Error(`Rate limit check failed: ${error.message}`)
  }

  const used = count ?? 0
  return {
    allowed: used < RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - used),
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured' },
        { status: 500 },
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateLimit = await checkRateLimit(supabase, user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Maximum ${RATE_LIMIT_MAX} requests per hour`,
          remaining: 0,
        },
        {
          status: 429,
          headers: { 'X-RateLimit-Remaining': '0' },
        },
      )
    }

    let body: ReplyRequestBody
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { leadId, messages, mode } = body

    if (!leadId || typeof leadId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid leadId' },
        { status: 400 },
      )
    }

    if (!isValidMessages(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 },
      )
    }

    if (!isValidMode(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be: suggestion, semi_auto, full_auto' },
        { status: 400 },
      )
    }

    const { data: training, error: trainingError } = await supabase
      .from('ai_training')
      .select('system_prompt, special_instructions, tone, business_name')
      .eq('user_id', user.id)
      .maybeSingle()

    if (trainingError) {
      console.error('[ai/reply] Training fetch error:', trainingError)
      return NextResponse.json(
        { error: 'Failed to fetch business context' },
        { status: 500 },
      )
    }

    const [productsRes, faqsRes] = await Promise.all([
      supabase
        .from('products')
        .select('name, price, description')
        .eq('user_id', user.id),
      supabase
        .from('faqs')
        .select('question, answer')
        .eq('user_id', user.id),
    ])

    const trainingRow = training as AiTrainingRow | null

    const businessContext = {
      products: (productsRes.data ?? []).map((p) => ({
        name: p.name,
        price: String(p.price),
        description: p.description,
      })),
      faqs: faqsRes.data ?? [],
      tone: trainingRow?.tone ?? 'ramah',
      businessName: trainingRow?.business_name ?? 'Bisnis Saya',
    }

    const systemPrompt =
      [trainingRow?.system_prompt, trainingRow?.special_instructions]
        .filter(Boolean)
        .join('\n\n') ||
      'Anda adalah AI sales assistant yang membantu closing penjualan via WhatsApp.'

    const [aiResult, leadScore] = await Promise.all([
      generateAIReply(messages, systemPrompt, businessContext),
      detectLeadScore(messages),
    ])

    const { error: insertError } = await supabase.from('ai_suggestions').insert({
      user_id: user.id,
      lead_id: leadId,
      suggested_reply: aiResult.reply,
      confidence: aiResult.confidence,
      action: aiResult.suggestedAction,
      mode,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error('[ai/reply] Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save AI suggestion' },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        reply: aiResult.reply,
        confidence: aiResult.confidence,
        suggestedAction: aiResult.suggestedAction,
        leadScore,
      },
      {
        headers: {
          'X-RateLimit-Remaining': String(rateLimit.remaining - 1),
        },
      },
    )
  } catch (error) {
    console.error('[ai/reply] Error:', error)

    if (error instanceof GroqServiceError) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
