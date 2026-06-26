import { NextResponse } from 'next/server'

export async function POST() {
  const WAHA = process.env.WAHA_API_URL!
  const KEY = process.env.WAHA_API_KEY!
  try {
    await fetch(`${WAHA}/api/sessions/default/stop`, { method: 'POST', headers: { 'X-Api-Key': KEY } })
  } catch {}
  await new Promise(r => setTimeout(r, 1000))
  const res = await fetch(`${WAHA}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': KEY },
    body: JSON.stringify({ name: 'default', start: true })
  })
  const data = await res.json()
  return NextResponse.json(data)
}
