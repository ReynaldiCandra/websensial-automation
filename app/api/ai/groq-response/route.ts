import { NextRequest, NextResponse } from 'next/server'
import {
  generateResponseWithGroq,
  generateQuickSuggestions,
  ToneType,
} from '@/lib/services/groq-ai-service'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { message, tone, previousMessages, type } = body

    if (!message || !tone) {
      return NextResponse.json(
        { error: 'Missing required fields: message, tone' },
        { status: 400 }
      )
    }

    if (!['profesional', 'ramah', 'rendah_hati', 'energik'].includes(tone)) {
      return NextResponse.json(
        { error: 'Invalid tone. Must be: profesional, ramah, rendah_hati, energik' },
        { status: 400 }
      )
    }

    let response: any

    if (type === 'suggestions') {
      const suggestions = await generateQuickSuggestions(message)
      response = { suggestions }
    } else {
      const generatedMessage = await generateResponseWithGroq(
        message,
        tone as ToneType,
        previousMessages
      )

      response = {
        message: generatedMessage,
        tone,
        model: 'mixtral-8x7b-32768',
        provider: 'groq',
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[v0] Groq API Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
