import { NextResponse } from 'next/server'

export async function GET() {
  const WAHA = process.env.WAHA_API_URL
  const KEY = process.env.WAHA_API_KEY
  const SESSION = process.env.WAHA_SESSION || 'default'

  const result: Record<string, unknown> = {
    env: {
      WAHA_API_URL: WAHA || null,
      WAHA_SESSION: SESSION,
      hasKey: !!KEY,
    },
  }

  if (!WAHA || !KEY) {
    result.error = 'Missing env vars'
    return NextResponse.json(result, { status: 500 })
  }

  try {
    const sessionsRes = await fetch(`${WAHA}/api/sessions`, {
      headers: { 'X-Api-Key': KEY },
      cache: 'no-store',
    })
    result.sessionsStatus = sessionsRes.status
    result.sessions = await sessionsRes.json().catch(() => null)
  } catch (err) {
    result.sessionsError = String(err)
  }

  return NextResponse.json(result)
}
