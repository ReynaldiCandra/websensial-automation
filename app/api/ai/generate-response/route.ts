import { NextRequest, NextResponse } from 'next/server'
import { generateAIResponse, ToneType } from '@/lib/services/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { message, tone, previousMessages } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!tone || !['profesional', 'ramah', 'rendah_hati', 'energik'].includes(tone)) {
      return NextResponse.json(
        { error: 'Valid tone is required' },
        { status: 400 }
      )
    }

    const response = await generateAIResponse(
      message,
      tone as ToneType,
      previousMessages
    )

    return NextResponse.json(response)
  } catch (error) {
    console.error('[v0] API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
