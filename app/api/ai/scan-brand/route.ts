import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: { 'User-Agent': 'WebsensialBot/1.0' },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch website (${response.status})` },
        { status: 502 },
      )
    }

    const html = await response.text()

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const descMatch = html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    )
    const ogDescMatch = html.match(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    )

    const brandName = titleMatch?.[1]?.trim() ?? parsedUrl.hostname
    const description =
      descMatch?.[1]?.trim() ?? ogDescMatch?.[1]?.trim() ?? ''

    const { data: doc, error: insertError } = await supabase
      .from('ai_training_documents')
      .insert({
        user_id: user.id,
        file_name: `Brand Scan: ${brandName}`,
        file_type: 'brand_scan',
        brand_url: parsedUrl.toString(),
        status: 'processing',
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to save brand scan' },
        { status: 500 },
      )
    }

    const systemPrompt = `Brand: ${brandName}\nWebsite: ${parsedUrl.toString()}\nDescription: ${description}`

    await supabase
      .from('ai_training')
      .upsert(
        {
          user_id: user.id,
          business_name: brandName,
          system_prompt: systemPrompt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )

    await supabase
      .from('ai_training_documents')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', doc.id)

    return NextResponse.json({
      success: true,
      brandName,
      description,
      documentId: doc.id,
    })
  } catch (error) {
    console.error('[ai/scan-brand] Error:', error)
    return NextResponse.json(
      {
        error: 'Brand scan failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
