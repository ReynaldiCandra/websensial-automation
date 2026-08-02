import { NextResponse } from 'next/server'
import { recommendationEngine } from '@/lib/ai/recommendations'

export async function POST(request: Request) {
  try {
    const { leadId, conversationHistory } = await request.json()

    if (!leadId || !conversationHistory) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const suggestions = await recommendationEngine.generateSuggestions(
      leadId,
      conversationHistory
    )

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
