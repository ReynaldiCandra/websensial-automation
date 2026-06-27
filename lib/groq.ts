import Groq from 'groq-sdk'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface BusinessContext {
  products: Array<{ name: string; price?: string; description?: string }>
  faqs: Array<{ question: string; answer: string }>
  tone: string
  businessName: string
}

export type SuggestedAction =
  | 'send_quotation'
  | 'send_invoice'
  | 'follow_up'
  | 'answer_faq'
  | 'escalate'

export interface AIReplyResult {
  reply: string
  confidence: number
  suggestedAction: SuggestedAction
}

export type LeadTemperature = 'hot' | 'warm' | 'cold'

export interface LeadScoreResult {
  score: number
  temperature: LeadTemperature
  signals: string[]
}

const apiKey = process.env.GROQ_API_KEY

if (!apiKey) {
  console.warn('[groq] GROQ_API_KEY is not set')
}

export const groqClient = new Groq({ apiKey })

const MODEL = 'llama-3.1-8b-instant' as const

const BUYING_SIGNAL_KEYWORDS = [
  'harga',
  'beli',
  'order',
  'invoice',
  'bayar',
  'mau',
  'deal',
  'closing',
] as const

const FAQ_KEYWORDS = ['apa', 'bagaimana', 'kapan', 'dimana', 'faq', 'tanya'] as const

const ESCALATE_KEYWORDS = [
  'komplain',
  'refund',
  'marah',
  'kecewa',
  'manager',
  'bos',
] as const

const INVOICE_KEYWORDS = ['invoice', 'bayar', 'transfer', 'pembayaran', 'order'] as const

const QUOTATION_KEYWORDS = ['harga', 'quotation', 'penawaran', 'berapa', 'deal'] as const

function normalizeText(text: string): string {
  return text.toLowerCase().trim()
}

function findMatchedKeywords(
  text: string,
  keywords: readonly string[],
): string[] {
  const normalized = normalizeText(text)
  return keywords.filter((kw) => normalized.includes(kw))
}

function clampConfidence(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)))
}

function getTemperature(score: number): LeadTemperature {
  if (score >= 70) return 'hot'
  if (score >= 40) return 'warm'
  return 'cold'
}

function buildBusinessSystemPrompt(
  systemPrompt: string,
  businessContext: BusinessContext,
): string {
  const productsText =
    businessContext.products.length > 0
      ? businessContext.products
          .map(
            (p) =>
              `- ${p.name}${p.price ? ` (${p.price})` : ''}${p.description ? `: ${p.description}` : ''}`,
          )
          .join('\n')
      : 'Tidak ada data produk.'

  const faqsText =
    businessContext.faqs.length > 0
      ? businessContext.faqs
          .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
          .join('\n\n')
      : 'Tidak ada FAQ.'

  return `${systemPrompt}

Konteks bisnis:
- Nama bisnis: ${businessContext.businessName}
- Tone komunikasi: ${businessContext.tone}

Produk:
${productsText}

FAQ:
${faqsText}

Instruksi:
- Balas dalam Bahasa Indonesia yang natural
- Singkat, actionable, dan sesuai tone bisnis
- Jangan mengarang harga/produk di luar konteks di atas`
}

function calculateConfidence(messages: ChatMessage[]): number {
  const userText = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join(' ')

  const matched = findMatchedKeywords(userText, BUYING_SIGNAL_KEYWORDS)
  if (matched.length === 0) return 25

  return clampConfidence(30 + matched.length * 10)
}

function inferSuggestedAction(
  messages: ChatMessage[],
  confidence: number,
): SuggestedAction {
  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''
  const allUserText = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join(' ')

  if (findMatchedKeywords(lastUserMessage, ESCALATE_KEYWORDS).length > 0) {
    return 'escalate'
  }

  if (
    findMatchedKeywords(allUserText, INVOICE_KEYWORDS).length > 0 &&
    confidence >= 60
  ) {
    return 'send_invoice'
  }

  if (findMatchedKeywords(allUserText, QUOTATION_KEYWORDS).length > 0) {
    return 'send_quotation'
  }

  if (findMatchedKeywords(lastUserMessage, FAQ_KEYWORDS).length > 0) {
    return 'answer_faq'
  }

  return 'follow_up'
}

export class GroqServiceError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'GroqServiceError'
  }
}

export async function generateAIReply(
  messages: ChatMessage[],
  systemPrompt: string,
  businessContext: BusinessContext,
): Promise<AIReplyResult> {
  if (!process.env.GROQ_API_KEY) {
    throw new GroqServiceError('GROQ_API_KEY is not configured')
  }

  if (!messages.length) {
    throw new GroqServiceError('Messages array cannot be empty')
  }

  try {
    const confidence = calculateConfidence(messages)
    const suggestedAction = inferSuggestedAction(messages, confidence)

    const completion = await groqClient.chat.completions.create({
      model: MODEL,
      max_tokens: 512,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: buildBusinessSystemPrompt(systemPrompt, businessContext),
        },
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
    })

    const reply = completion.choices[0]?.message?.content?.trim()

    if (!reply) {
      throw new GroqServiceError('Empty response from Groq API')
    }

    return { reply, confidence, suggestedAction }
  } catch (error) {
    if (error instanceof GroqServiceError) throw error
    throw new GroqServiceError(
      error instanceof Error ? error.message : 'Failed to generate AI reply',
      error,
    )
  }
}

export async function detectLeadScore(
  chatHistory: ChatMessage[],
): Promise<LeadScoreResult> {
  const userMessages = chatHistory.filter((m) => m.role === 'user')
  const signals: string[] = []

  if (userMessages.length === 0) {
    return { score: 0, temperature: 'cold', signals: ['no_user_messages'] }
  }

  const allText = userMessages.map((m) => m.content).join(' ')
  let score = 10

  const buyingMatches = findMatchedKeywords(allText, BUYING_SIGNAL_KEYWORDS)
  for (const kw of buyingMatches) {
    signals.push(`buying_signal:${kw}`)
    score += 12
  }

  const frequencyBonus = Math.min(25, Math.max(0, (userMessages.length - 1) * 5))
  if (frequencyBonus > 0) {
    signals.push(`engagement:${userMessages.length}_messages`)
  }
  score += frequencyBonus

  const lastMessage = userMessages[userMessages.length - 1]?.content ?? ''
  const recentMatches = findMatchedKeywords(lastMessage, BUYING_SIGNAL_KEYWORDS)
  if (recentMatches.length > 0) {
    signals.push('recent_buying_intent')
    score += 15
  }

  if (findMatchedKeywords(allText, INVOICE_KEYWORDS).length > 0) {
    signals.push('payment_intent')
    score += 10
  }

  const finalScore = clampConfidence(score)
  return {
    score: finalScore,
    temperature: getTemperature(finalScore),
    signals,
  }
}
