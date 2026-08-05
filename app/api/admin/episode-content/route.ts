/**
 * Admin-only episode content API.
 *
 * Returns the fully-assembled WebtoonEpisodeData for a given episode,
 * fetched via service_role (bypasses RLS and paywall).
 *
 * Used exclusively by the editor at /kpatto/editor/[episodeId].
 * Blocked in production by middleware (ADMIN_PATHS includes /api/admin).
 * In local dev (VERCEL_ENV unset) it passes through freely.
 *
 * - No paywall gate: editors need to see all panels/bubbles, including paid ones.
 * - RLS is NOT changed: only the read path is switched to service_role.
 * - The viewer (/kpatto/story) is untouched and continues to use the anon path.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchWebtoonEpisode } from '@/lib/kpatto/fetch-episode'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id param (?id=kp-ep-001)' }, { status: 400 })
  }

  try {
    // Pass the admin client as override so fetchWebtoonEpisode uses service_role
    // and bypasses all RLS policies (including kp_panels/kp_bubbles is_free filter
    // and kp_dialogues no-SELECT policy).
    const adminClient = createAdminClient()
    const episode = await fetchWebtoonEpisode(id, adminClient)

    if (!episode) {
      return NextResponse.json({ error: `Episode not found: ${id}` }, { status: 404 })
    }

    return NextResponse.json(episode)
  } catch (err) {
    console.error('[admin/episode-content] error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
