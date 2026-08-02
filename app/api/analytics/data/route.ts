import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data - in production, query from database
    const analyticsData = {
      leads: { count: 342, trend: 23 },
      messages: { count: 1248, trend: 31 },
      conversion: { rate: 28.5, trend: 5 },
      avgResponseTime: { hours: 2.3, trend: 12 },
      dailyData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (30 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        leads: Math.floor(Math.random() * 20) + 5,
        messages: Math.floor(Math.random() * 50) + 20,
        conversion: Math.floor(Math.random() * 35) + 15
      }))
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
