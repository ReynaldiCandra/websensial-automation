import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import rulesEngine from '@/lib/rules-engine/engine'
import type { Rule, RuleExecutionContext } from '@/lib/rules-engine/types'

/**
 * Rule Execution Endpoint
 * POST /api/rules/execute - Execute rules for a lead
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { leadId, companyId, trigger, data } = body

    if (!leadId || !companyId || !trigger) {
      return NextResponse.json(
        { error: 'Missing required fields: leadId, companyId, trigger' },
        { status: 400 }
      )
    }

    // Fetch all rules for this company
    const { data: rules, error: rulesError } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('company_id', companyId)
      .eq('enabled', true)

    if (rulesError) {
      throw rulesError
    }

    // Register rules in engine
    (rules || []).forEach((rule: any) => {
      rulesEngine.registerRule({
        id: rule.id,
        companyId: rule.company_id,
        name: rule.name,
        description: rule.description,
        enabled: rule.enabled,
        trigger: rule.trigger,
        conditions: rule.conditions || [],
        actions: rule.actions || [],
        priority: rule.priority || 0,
        createdAt: new Date(rule.created_at),
        updatedAt: new Date(rule.updated_at),
      } as Rule)
    })

    // Execute rules
    const context: RuleExecutionContext = {
      leadId,
      companyId,
      trigger,
      data: data || {},
      executedRules: [],
    }

    const results = await rulesEngine.execute(context)

    // Store execution log
    await supabase.from('rule_executions').insert({
      lead_id: leadId,
      company_id: companyId,
      trigger,
      executed_rules: context.executedRules,
      results,
      data_snapshot: data,
    })

    return NextResponse.json({
      success: true,
      leadId,
      trigger,
      executedRules: context.executedRules.length,
      results,
    })
  } catch (error) {
    console.error('[Rules Execute] Error:', error)
    return NextResponse.json(
      { error: 'Failed to execute rules' },
      { status: 500 }
    )
  }
}
