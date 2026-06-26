import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { url } = await request.json()
    if (!url || typeof url !== 'string') return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    let parsedUrl: URL
    try { parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`) }
    catch { return NextResponse.json({ error: 'Invalid URL' }, { status: 400 }) }

    let html = ''
    try {
      const res = await fetch(parsedUrl.toString(), {
        headers: { 'User-Agent': 'Mozilla/5.0 WebsensialBot/1.0' },
        signal: AbortSignal.timeout(6000),
      })
      if (res.ok) html = await res.text()
    } catch { }

    const brandName = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? parsedUrl.hostname
    const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim()
      ?? html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ?? ''

    const { data: doc, error: insertError } = await supabase
      .from('ai_training_documents')
      .insert({ user_id: user.id, name: `Brand Scan: ${brandName}`, type: 'brand_scan', url: parsedUrl.toString(), content: `Brand: ${brandName}\nWebsite: ${parsedUrl.toString()}\nDescription: ${description}`, status: 'completed' })
      .select().single()

    if (insertError) {
      console.error('[scan-brand]', insertError)
      return NextResponse.json({ error: 'Failed to save brand scan', details: insertError.message }, { status: 500 })
    }

    await supabase.from('ai_training').upsert(
      { user_id: user.id, business_name: brandName, system_prompt: `Brand: ${brandName}\nWebsite: ${parsedUrl.toString()}\nDescription: ${description}`, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

    return NextResponse.json({ success: true, brandName, description, documentId: doc.id })
  } catch (error) {
    console.error('[ai/scan-brand]', error)
    return NextResponse.json({ error: 'Brand scan failed', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
