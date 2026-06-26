import { NextResponse } from 'next/server'

export async function GET() {
  const WAHA = process.env.WAHA_API_URL!
  const KEY = process.env.WAHA_API_KEY!
  try {
    const res = await fetch(`${WAHA}/api/default/auth/qr?format=image`, {
      headers: { 'X-Api-Key': KEY }
    })
    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return NextResponse.json({ qr: `data:image/png;base64,${base64}` })
  } catch {
    return NextResponse.json({ qr: null })
  }
}
