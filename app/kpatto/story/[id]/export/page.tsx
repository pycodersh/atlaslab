/**
 * /kpatto/story/[id]/export — Webtoon canvas bake mode
 *
 * SERVER COMPONENT — no client-side JS for image content.
 * Access gate: blocked in production; local dev only.
 *
 * Security: EP11+ dialogue text is fetched server-side with admin client (RLS bypass).
 * This route is production-blocked so it cannot be used to exfiltrate pro content.
 */
import { notFound, redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchWebtoonEpisode } from '@/lib/kpatto/fetch-episode'
import { WebtoonEpisodeExport } from '@/components/kpatto/WebtoonEpisodeExport'

// Strip BOM — same pattern as sitemap.ts
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com').replace(/^﻿/, '')
const IS_PROD  = process.env.VERCEL_ENV === 'production'

interface PageProps {
  params: Promise<{ id: string }>
}

type FocusExpr = { korean: string; english: string }

export default async function ExportPage({ params }: PageProps) {
  // ── Block in production ───────────────────────────────────────────────────
  if (IS_PROD) redirect(`/kpatto/story/${(await params).id}`)

  const { id } = await params

  // ── Fetch episode data (admin client bypasses RLS) ─────────────────────
  const supabase = createAdminClient()
  const episode  = await fetchWebtoonEpisode(id, supabase)
  if (!episode) notFound()

  // ── Fetch focus expressions for last summary panel ─────────────────────
  const epMatch = id.match(/kp-ep-(\d+)/)
  let focusExprs: FocusExpr[] = []

  if (epMatch) {
    const epNum = parseInt(epMatch[1])
    const { data: epRow } = await supabase
      .from('kp_episodes')
      .select('id')
      .eq('episode_num', epNum)
      .single()

    if (epRow) {
      const { data: mappings } = await supabase
        .from('kp_dialogue_expressions')
        .select('expression_id')
        .eq('role', 'focus')
        .not('expression_id', 'is', null)

      // episode_id filter via join: get dialogues for this episode
      const { data: dialogueIds } = await supabase
        .from('kp_dialogues')
        .select('id')
        .eq('episode_id', epRow.id)

      const epDialogueIds = new Set((dialogueIds ?? []).map((d: { id: number }) => d.id))

      const { data: focusMaps } = await supabase
        .from('kp_dialogue_expressions')
        .select('dialogue_id, expression_id')
        .eq('role', 'focus')
        .not('expression_id', 'is', null)

      const exprIds = [...new Set(
        (focusMaps ?? [])
          .filter((m: { dialogue_id: number }) => epDialogueIds.has(m.dialogue_id))
          .map((m: { expression_id: number }) => m.expression_id)
      )]

      if (exprIds.length > 0) {
        const { data: exprs } = await supabase
          .from('kp_expressions')
          .select('korean, english')
          .in('id', exprIds)

        focusExprs = (exprs ?? []).map((e: FocusExpr) => ({ korean: e.korean, english: e.english }))
      }
    }
  }

  const epLabel = episode.episode
    ? `EP${String(episode.episode).padStart(2, '0')}`
    : id

  return (
    <WebtoonEpisodeExport
      episode={episode}
      focusExprs={focusExprs}
      siteUrl={SITE_URL}
      epLabel={epLabel}
    />
  )
}
