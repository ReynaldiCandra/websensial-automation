import OpenAI from 'openai'

export type ToneType = 'profesional' | 'ramah' | 'rendah_hati' | 'energik'

interface AIResponse {
  message: string
  tone: ToneType
}

const tonePrompts: Record<ToneType, string> = {
  profesional:
    'Berikan respons yang formal, profesional, dan bisnis-like. Gunakan bahasa yang tepat dan terstruktur.',
  ramah:
    'Berikan respons yang hangat, ramah, dan personal. Gunakan bahasa yang santai namun tetap profesional.',
  rendah_hati:
    'Berikan respons yang rendah hati, menghargai, dan empati. Tunjukkan sikap yang mendengarkan dan mengerti.',
  energik:
    'Berikan respons yang energik, antusias, dan positif. Gunakan bahasa yang dinamis dan penuh semangat.',
}

export async function generateAIResponse(
  customerMessage: string,
  tone: ToneType,
  previousMessages?: string[]
): Promise<AIResponse> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const client = new OpenAI({ apiKey })

  const conversationContext =
    previousMessages && previousMessages.length > 0
      ? `Konteks percakapan sebelumnya:\n${previousMessages.join('\n')}\n\n`
      : ''

  const systemPrompt = `Anda adalah assistant penjualan profesional untuk bisnis. 
${tonePrompts[tone]}

Berikan respons singkat (1-2 kalimat), natural, dan siap untuk dikirim via WhatsApp.
Respons harus langsung actionable dan tidak memerlukan penambahan lagi.`

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 150,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `${conversationContext}Customer: ${customerMessage}\n\nBuat respons yang tepat:`,
        },
      ],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    return {
      message: responseText,
      tone,
    }
  } catch (error) {
    console.error('[v0] AI Service Error:', error)
    throw new Error('Failed to generate AI response')
  }
}

export async function generateOpenAIResponse(
  customerMessage: string,
  tone: ToneType,
  previousMessages?: string[]
): Promise<AIResponse> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const client = new OpenAI({ apiKey })

  const conversationContext =
    previousMessages && previousMessages.length > 0
      ? `Konteks percakapan sebelumnya:\n${previousMessages.join('\n')}\n\n`
      : ''

  const systemPrompt = `Anda adalah assistant penjualan profesional untuk bisnis. 
${tonePrompts[tone]}

Berikan respons singkat (1-2 kalimat), natural, dan siap untuk dikirim via WhatsApp.
Respons harus langsung actionable dan tidak memerlukan penambahan lagi.`

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `${conversationContext}Customer: ${customerMessage}\n\nBuat respons yang tepat:`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    const responseText =
      response.choices[0].message.content || 'Unable to generate response'

    return {
      message: responseText,
      tone,
    }
  } catch (error) {
    console.error('[v0] OpenAI Service Error:', error)
    throw new Error('Failed to generate OpenAI response')
  }
}
