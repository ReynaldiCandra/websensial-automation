import { NextResponse } from 'next/server'

export async function GET() {
  const WAHA = process.env.WAHA_API_URL!
  const KEY = process.env.WAHA_API_KEY!
  const res = await fetch(`${WAHA}/api/sessions/default`, {
    headers: { 'X-Api-Key': KEY }
  })
  const data = await res.json()
  return NextResponse.json(data)
}
