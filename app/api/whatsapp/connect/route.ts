import { NextResponse } from 'next/server'

export async function POST() {
  const WAHA = process.env.WAHA_API_URL
  const KEY = process.env.WAHA_API_KEY
  const SESSION = process.env.WAHA_SESSION || 'default'

  if (!WAHA || !KEY) {
    return NextResponse.json({ error: 'Server WAHA env tidak lengkap' }, { status: 500 })
  }

  const headers = { 'Content-Type': 'application/json', 'X-Api-Key': KEY }

  try {
    const getRes = await fetch(`${WAHA}/api/sessions/${SESSION}`, {
      headers: { 'X-Api-Key': KEY },
      cache: 'no-store',
    })

    if (getRes.status === 404) {
      const createRes = await fetch(`${WAHA}/api/sessions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: SESSION, start: true }),
      })
      const createData = await createRes.json().catch(() => ({}))
      if (!createRes.ok) {
        return NextResponse.json({ error: `WAHA create error ${createRes.status}`, detail: createData }, { status: 502 })
      }
      return NextResponse.json(createData)
    }

    const existing = await getRes.json().catch(() => ({}))

    if (existing?.status === 'WORKING' || existing?.status === 'SCAN_QR_CODE') {
      return NextResponse.json(existing)
    }

    const startRes = await fetch(`${WAHA}/api/sessions/${SESSION}/start`, {
      method: 'POST',
      headers,
    })
    const startData = await startRes.json().catch(() => ({}))

    if (!startRes.ok) {
      return NextResponse.json({ error: `WAHA start error ${startRes.status}`, detail: startData }, { status: 502 })
    }

    return NextResponse.json(startData)
  } catch (err) {
    console.error('[whatsapp/connect] Fetch failed:', err)
    return NextResponse.json({ error: 'Gagal connect ke WAHA server' }, { status: 502 })
  }
}

export async function DELETE() {
  const WAHA = process.env.WAHA_API_URL
  const KEY = process.env.WAHA_API_KEY
  const SESSION = process.env.WAHA_SESSION || 'default'

  if (!WAHA || !KEY) {
    return NextResponse.json({ error: 'Server WAHA env tidak lengkap' }, { status: 500 })
  }

  try {
    const res = await fetch(`${WAHA}/api/sessions/${SESSION}`, {
      method: 'DELETE',
      headers: { 'X-Api-Key': KEY },
    })

    if (!res.ok && res.status !== 404) {
      const detail = await res.text().catch(() => '')
      return NextResponse.json({ error: `WAHA error ${res.status}`, detail }, { status: 502 })
    }

    return NextResponse.json({ success: true, message: 'Disconnected' })
  } catch (err) {
    console.error('[whatsapp/connect] DELETE failed:', err)
    return NextResponse.json({ error: 'Gagal disconnect dari WAHA server' }, { status: 502 })
  }
}
