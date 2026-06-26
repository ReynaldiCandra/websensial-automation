import { NextResponse } from 'next/server'

export async function POST() {
  const WAHA = process.env.WAHA_API_URL!
  const KEY = process.env.WAHA_API_KEY!
  await fetch(`${WAHA}/api/sessions/default/logout`, { method: 'POST', headers: { 'X-Api-Key': KEY } })
  return NextResponse.json({ ok: true })
}
