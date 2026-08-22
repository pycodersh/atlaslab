import { notFound } from 'next/navigation'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { FREE_EPISODES } from '@/lib/kpatto/config'
import { KPattoStoryClient } from '@/components/kpatto/KPattoStoryClient'

interface PageProps {
  params: Promise<{ id: string }>
}

/** Normalize numeric shorthand (11 → kp-ep-011) so /kpatto/story/11 works. */
function normalizeEpId(raw: string): string {
  if (/^\d+$/.test(raw)) return `kp-ep-${raw.padStart(3, '0')}`
  return raw
}

/**
 * 서버에서 (1) id 형식 (2) 에피소드 존재 여부 (3) 유료 에피소드 구독 권한을 판정한다.
 * 어느 하나라도 실패하면 notFound() → 실제 HTTP 404.
 *
 * 이전에는 항상 200을 반환한 뒤 클라이언트에서 뒤늦게 404 화면으로 바꿨다(soft 404).
 * 크롤러에게 EP11~100 이 정상 페이지 100개로 보이던 원인.
 *
 * 권한 판정 규칙은 /api/kpatto/episode/[episodeId] 라우트와 동일하게 유지할 것.
 */
export default async function KPattoStoryPage({ params }: PageProps) {
  const { id: rawId } = await params
  const id = normalizeEpId(rawId)

  const match = id.match(/^kp-ep-(\d+)$/)
  if (!match) notFound()

  const epNum = parseInt(match[1], 10)
  if (!Number.isFinite(epNum) || epNum < 1) notFound()

  // ── 1. 존재하지 않는 에피소드 (kp-ep-999 등) → 404 ──────────────────────────
  const admin = createAdminClient()
  const { data: episode } = await admin
    .from('kp_episodes')
    .select('episode_num')
    .eq('episode_num', epNum)
    .maybeSingle()

  if (!episode) notFound()

  // ── 2. 유료 에피소드(EP11~) 권한 판정 ───────────────────────────────────────
  // 로컬 개발(VERCEL_ENV 미설정)에서는 게이트를 건너뛴다 — API 라우트와 동일 규칙.
  const isLocalDev = !process.env.VERCEL_ENV

  if (!isLocalDev && epNum > FREE_EPISODES) {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) notFound()

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('kpatto_pro')
      .eq('id', user.id)
      .single()

    if (!profile?.kpatto_pro) notFound()
  }

  return <KPattoStoryClient id={id} />
}
