import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Rules API
 * GET /api/rules - List all rules
 * POST /api/rules - Create new rule
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      )
    }

    // Get rules from database
    const { data: rules, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('company_id', companyId)
      .order('priority', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(rules || [])
  } catch (error) {
    console.error('[Rules API] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rules' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { companyId, name, description, trigger, conditions, actions, priority, enabled } = body

    if (!companyId || !name || !trigger) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create rule in database
    const { data: rule, error } = await supabase
      .from('automation_rules')
      .insert({
        company_id: companyId,
        name,
        description,
        trigger,
        conditions: conditions || [],
        actions: actions || [],
        priority: priority || 0,
        enabled: enabled !== false,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    console.error('[Rules API] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create rule' },
      { status: 500 }
    )
  }
}
