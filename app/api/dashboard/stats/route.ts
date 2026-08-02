import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get user session to determine company_id
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company_id from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    const companyId = profile?.company_id

    if (!companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Fetch statistics
    const [
      { count: totalLeads },
      { data: leadScores },
      { count: activeRules },
      { count: messagesThisMonth },
    ] = await Promise.all([
      supabase
        .from('chats')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId),

      supabase.from('lead_scores').select('level').eq('company_id', companyId),

      supabase
        .from('automation_rules')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('enabled', true),

      supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .gt('created_at', new Date(new Date().setDate(1)).toISOString()),
    ])

    // Calculate lead breakdown
    const hotLeads = leadScores?.filter((s: any) => s.level === 'hot').length || 0
    const warmLeads = leadScores?.filter((s: any) => s.level === 'warm').length || 0
    const coldLeads = leadScores?.filter((s: any) => s.level === 'cold').length || 0

    // Calculate conversion rate (mock)
    const conversionRate =
      totalLeads && totalLeads > 0 ? Math.round((hotLeads / totalLeads) * 100 * 10) / 10 : 0

    return NextResponse.json({
      totalLeads: totalLeads || 0,
      hotLeads,
      warmLeads,
      coldLeads,
      activeRules: activeRules || 0,
      messagesThisMonth: messagesThisMonth || 0,
      conversionRate,
    })
  } catch (error) {
    console.error('[Dashboard Stats] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
