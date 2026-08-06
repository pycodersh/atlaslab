import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { FREE_EPISODES } from '@/lib/kpatto/config'
import { fetchWebtoonEpisode } from '@/lib/kpatto/fetch-episode'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> },
) {
  const { episodeId } = await params
  const match = episodeId.match(/kp-ep-(\d+)/)
  if (!match) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const epNum = parseInt(match[1])

  // In local development (VERCEL_ENV not set), skip paywall gate.
  // Server-side check only — never exposed to the client via env variable.
  const isLocalDev = !process.env.VERCEL_ENV

  if (!isLocalDev && epNum > FREE_EPISODES) {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'pro_required' }, { status: 403 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('kpatto_pro')
      .eq('id', user.id)
      .single()

    if (!profile?.kpatto_pro) {
      return NextResponse.json({ error: 'pro_required' }, { status: 403 })
    }
  }

  // Auth check passed (or free episode) — fetch with admin client (bypasses RLS)
  const admin = createAdminClient()
  const data = await fetchWebtoonEpisode(episodeId, admin)

  if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': epNum <= FREE_EPISODES
        ? 'public, s-maxage=3600, stale-while-revalidate=86400'
        : 'private, no-store',
    },
  })
}
