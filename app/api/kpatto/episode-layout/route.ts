/**
 * Public read-only endpoint for webtoon bubble layout overrides.
 *
 * Returns only coordinate/shape data from kpatto_webtoon_layouts.
 * Does NOT return dialogue text, image URLs, or any paid content.
 * Accessible to anonymous users — no auth required.
 *
 * Used by WebtoonEpisode.tsx (viewer) to apply saved bubble positions.
 * Write operations remain on /api/admin/episode-layout (admin-only).
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'No id' }, { status: 400 })

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('kpatto_webtoon_layouts')
      .select('overrides, bubbles')
      .eq('episode_id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ episodeId: id, overrides: {}, bubbles: {} })
    }

    // Return only coordinate/shape data — no content fields
    return NextResponse.json({
      episodeId: id,
      overrides: data.overrides ?? {},
      bubbles:   data.bubbles   ?? {},
    })
  } catch {
    return NextResponse.json({ episodeId: id, overrides: {}, bubbles: {} })
  }
}
