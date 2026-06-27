import { NextResponse } from 'next/server'

export async function GET() {
  const WAHA = process.env.WAHA_API_URL
  const KEY = process.env.WAHA_API_KEY
  const SESSION = process.env.WAHA_SESSION || 'default'

  if (!WAHA || !KEY) {
    console.error('[waha-qr] Missing WAHA_API_URL or WAHA_API_KEY env var')
    return NextResponse.json({ qr: null, error: 'Server WAHA env tidak lengkap' }, { status: 500 })
  }

  try {
    const url = `${WAHA}/api/${SESSION}/auth/qr?format=image`
    const res = await fetch(url, {
      headers: { 'X-Api-Key': KEY },
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error(`[waha-qr] WAHA returned ${res.status} for session "${SESSION}": ${text.slice(0, 300)}`)
      return NextResponse.json(
        { qr: null, error: `WAHA error ${res.status}`, detail: text.slice(0, 300) },
        { status: 502 }
      )
    }

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('image')) {
      const text = await res.text().catch(() => '')
      console.error(`[waha-qr] Unexpected content-type "${contentType}": ${text.slice(0, 300)}`)
      return NextResponse.json(
        { qr: null, error: 'WAHA tidak mengembalikan image (session mungkin belum READY/SCAN_QR_CODE)' },
        { status: 502 }
      )
    }

    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return NextResponse.json({ qr: `data:image/png;base64,${base64}` })
  } catch (err) {
    console.error('[waha-qr] Fetch failed:', err)
    return NextResponse.json({ qr: null, error: 'Gagal connect ke WAHA server' }, { status: 502 })
  }
}
