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

    if (error || !data) return NextResponse.json({ episodeId: id, overrides: {} })
    return NextResponse.json({ episodeId: id, overrides: data.overrides ?? {}, bubbles: data.bubbles ?? {} })
  } catch {
    return NextResponse.json({ episodeId: id, overrides: {} })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { episodeId, overrides, bubbles } = body
  if (!episodeId) return NextResponse.json({ error: 'No episodeId' }, { status: 400 })

  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('kpatto_webtoon_layouts')
      .upsert({ episode_id: episodeId, overrides: overrides ?? {}, bubbles: bubbles ?? {} }, { onConflict: 'episode_id' })

    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
