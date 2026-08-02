import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import rulesEngine from '@/lib/rules-engine/engine'

/**
 * Lead Scoring Endpoint
 * POST /api/rules/score - Calculate and store lead score
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { leadId, messageCount, responseTimeMs, keywordMatches, daysSinceLastMessage } = body

    if (!leadId) {
      return NextResponse.json(
        { error: 'leadId is required' },
        { status: 400 }
      )
    }

    // Calculate score
    const score = rulesEngine.calculateLeadScore({
      messageCount: messageCount || 0,
      responseTimeMs: responseTimeMs || 0,
      keywordMatches: keywordMatches || 0,
      daysSinceLastMessage: daysSinceLastMessage || 0,
    })

    score.leadId = leadId

    // Store in database
    const { data: stored, error } = await supabase
      .from('lead_scores')
      .upsert(
        {
          lead_id: leadId,
          score: score.score,
          level: score.level,
          factors: score.factors,
          updated_at: new Date(),
        },
        { onConflict: 'lead_id' }
      )
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      leadId,
      score: score.score,
      level: score.level,
      factors: score.factors,
    })
  } catch (error) {
    console.error('[Lead Score] Error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate lead score' },
      { status: 500 }
    )
  }
}
