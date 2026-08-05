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
  const { episodeId, overrides, bubbles, force } = body
  if (!episodeId) return NextResponse.json({ error: 'No episodeId' }, { status: 400 })

  const incomingOverrides: Record<string, unknown> = overrides ?? {}

  try {
    const supabase = createAdminClient()

    // ── Overwrite guard ───────────────────────────────────────────────────────
    // Reject if the incoming overrides are empty but the stored row already has
    // coordinate data — this prevents a silent LOAD-failure from wiping the DB.
    // Pass force: true in the request body to bypass (intentional reset).
    if (!force && Object.keys(incomingOverrides).length === 0) {
      const { data: existing } = await supabase
        .from('kpatto_webtoon_layouts')
        .select('overrides')
        .eq('episode_id', episodeId)
        .single()

      const storedKeys = Object.keys((existing?.overrides as Record<string, unknown>) ?? {})
      if (storedKeys.length > 0) {
        return NextResponse.json(
          {
            error: 'overwrite_guard',
            message: `저장 거부: DB에 이미 ${storedKeys.length}개의 override가 있는데 빈 overrides로 덮어쓰려 했습니다. 의도적 초기화라면 force: true를 함께 보내세요.`,
            stored_keys: storedKeys.length,
          },
          { status: 409 },
        )
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const { error } = await supabase
      .from('kpatto_webtoon_layouts')
      .upsert({ episode_id: episodeId, overrides: incomingOverrides, bubbles: bubbles ?? {} }, { onConflict: 'episode_id' })

    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
