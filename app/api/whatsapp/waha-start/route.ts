import { NextResponse } from 'next/server'

export async function POST() {
  const WAHA = process.env.WAHA_API_URL
  const KEY = process.env.WAHA_API_KEY
  const SESSION = process.env.WAHA_SESSION || 'default'

  if (!WAHA || !KEY) {
    console.error('[waha-start] Missing WAHA_API_URL or WAHA_API_KEY env var')
    return NextResponse.json({ error: 'Server WAHA env tidak lengkap' }, { status: 500 })
  }

  const headers = { 'Content-Type': 'application/json', 'X-Api-Key': KEY }

  try {
    const getRes = await fetch(`${WAHA}/api/sessions/${SESSION}`, {
      headers: { 'X-Api-Key': KEY },
      cache: 'no-store',
    })

    if (getRes.status === 404) {
      console.log(`[waha-start] Session "${SESSION}" not found, creating new...`)
      const createRes = await fetch(`${WAHA}/api/sessions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: SESSION, start: true }),
      })
      const createData = await createRes.json().catch(() => ({}))
      if (!createRes.ok) {
        console.error(`[waha-start] Create failed ${createRes.status}:`, createData)
        return NextResponse.json({ error: `WAHA create error ${createRes.status}`, detail: createData }, { status: 502 })
      }
      console.log('[waha-start] Session created:', createData)
      return NextResponse.json(createData)
    }

    const existing = await getRes.json().catch(() => ({}))
    console.log(`[waha-start] Existing session status:`, existing?.status)

    if (existing?.status === 'WORKING' || existing?.status === 'SCAN_QR_CODE') {
      return NextResponse.json(existing)
    }

    if (existing?.status === 'FAILED' || existing?.status === 'STOPPED') {
      console.log(`[waha-start] Session ${existing?.status} — delete & recreate`)
      await fetch(`${WAHA}/api/sessions/${SESSION}`, {
        method: 'DELETE',
        headers: { 'X-Api-Key': KEY },
      })
      await new Promise(r => setTimeout(r, 1500))
      const recreateRes = await fetch(`${WAHA}/api/sessions`, {
      method: 'POST',
        headers,
        body: JSON.stringify({ name: SESSION, start: true }),
      })
      const recreateData = await recreateRes.json().catch(() => ({}))
      console.log('[waha-start] Recreated:', recreateData)
      return NextResponse.json(recreateData)
    }

    const startRes = await fetch(`${WAHA}/api/sessions/${SESSION}/start`, {
      method: 'POST',
      headers,
    })
    const startText = await startRes.text()
    let startData
    try {
      startData = JSON.parse(startText)
    } catch {
      startData = { raw: startText }
    }

    if (!startRes.ok) {
      console.error(`[waha-start] Start failed ${startRes.status}:`, startData)
      return NextResponse.json({ error: `WAHA start error ${startRes.status}`, detail: startData }, { status: 502 })
    }

    console.log('[waha-start] Session started:', SESSION, startData)
    return NextResponse.json(startData)
  } catch (err) {
    console.error('[waha-start] Fetch failed:', err)
    return NextResponse.json({ error: 'Gagal connect ke WAHA server' }, { status: 502 })
  }
}
