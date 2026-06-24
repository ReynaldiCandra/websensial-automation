import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export type ToneType = 'profesional' | 'ramah' | 'rendah_hati' | 'energik'

const TONE_PROMPTS: Record<ToneType, string> = {
  profesional:
    'Balas dengan bahasa profesional, formal, dan bisnis. Fokus pada solusi efisien.',
  ramah:
    'Balas dengan bahasa ramah, hangat, dan approachable. Buat customer merasa dihargai.',
  rendah_hati:
    'Balas dengan bahasa yang humble, respectful, dan appreciatif. Dengarkan dengan baik.',
  energik:
    'Balas dengan bahasa yang energik, enthusiastic, dan optimistic. Buat excitement!',
}

export async function generateResponseWithGroq(
  message: string,
  tone: ToneType,
  previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  try {
    const systemPrompt = `Anda adalah AI Sales Assistant untuk Websensial.ai - platform otomasi penjualan WhatsApp yang cerdas.
    
${TONE_PROMPTS[tone]}

Konteks bisnis:
- Websensial.ai adalah platform AI Sales Automation untuk WhatsApp
- Anda membantu respond pesan customer dengan nada yang tepat
- Tetap singkat, actionable, dan personal
- Hindari spam atau terlalu formal kecuali tone 'profesional'

Balas dalam Bahasa Indonesia yang natural.`

    const messages = [
      ...(previousMessages || []),
      {
        role: 'user' as const,
        content: message,
      },
    ]

    const completion = await groq.messages.create({
      model: 'mixtral-8x7b-32768',
      max_tokens: 512,
      system: systemPrompt,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    })

    const responseContent = completion.content[0]
    if (responseContent.type === 'text') {
      return responseContent.text
    }

    throw new Error('Unexpected response format from Groq')
  } catch (error) {
    console.error('[v0] Groq API Error:', error)
    throw error
  }
}

export async function generateQuickSuggestions(
  customerMessage: string
): Promise<string[]> {
  try {
    const completion = await groq.messages.create({
      model: 'mixtral-8x7b-32768',
      max_tokens: 256,
      system: `Generate 3 quick response suggestions for a WhatsApp sales chat. 
        Return ONLY the suggestions as JSON array of strings, no other text.
        Suggestions harus practical dan natural.
        Format: ["suggestion1", "suggestion2", "suggestion3"]`,
      messages: [
        {
          role: 'user',
          content: `Customer said: "${customerMessage}"\n\nGenerate 3 response suggestions (as JSON array only).`,
        },
      ],
    })

    const content = completion.content[0]
    if (content.type === 'text') {
      const match = content.text.match(/\[.*\]/s)
      if (match) {
        return JSON.parse(match[0])
      }
    }

    return []
  } catch (error) {
    console.error('[v0] Groq Quick Suggestions Error:', error)
    return []
  }
}
