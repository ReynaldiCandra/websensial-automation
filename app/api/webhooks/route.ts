import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock - in production, fetch from database
    const webhooks = []
    return NextResponse.json({ webhooks })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const webhook = await request.json()

    // Validate webhook URL
    if (!webhook.url || !webhook.url.startsWith('http')) {
      return NextResponse.json(
        { error: 'Invalid webhook URL' },
        { status: 400 }
      )
    }

    // In production, save to database
    return NextResponse.json({ 
      id: Date.now().toString(),
      ...webhook,
      createdAt: new Date()
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 })
  }
}
