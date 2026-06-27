import { NextResponse } from 'next/server'

export async function GET() {
  const WAHA = process.env.WAHA_API_URL
  const KEY = process.env.WAHA_API_KEY
  const SESSION = process.env.WAHA_SESSION || 'default'

  if (!WAHA || !KEY) {
    return NextResponse.json({ error: 'Server WAHA env tidak lengkap' }, { status: 500 })
  }

  try {
    const res = await fetch(`${WAHA}/api/sessions/${SESSION}`, {
      headers: { 'X-Api-Key': KEY },
      cache: 'no-store',
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      return NextResponse.json({ error: `WAHA error ${res.status}`, detail }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[whatsapp/status] Fetch failed:', err)
    return NextResponse.json({ error: 'Gagal connect ke WAHA server' }, { status: 502 })
  }
}
