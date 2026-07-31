/**
 * K-PATTO DB Refresh — EP11~30 패널 & 버블 재시드
 * (이미지 교체 후 패널 수 변경된 에피소드 반영)
 *
 * 실행:
 *   npx tsx scripts/seed-ep11-30-refresh.ts
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { EPISODE_011_WEBTOON } from '../data/kpatto/episode-011-webtoon'
import { EPISODE_012_WEBTOON } from '../data/kpatto/episode-012-webtoon'
import { EPISODE_013_WEBTOON } from '../data/kpatto/episode-013-webtoon'
import { EPISODE_014_WEBTOON } from '../data/kpatto/episode-014-webtoon'
import { EPISODE_015_WEBTOON } from '../data/kpatto/episode-015-webtoon'
import { EPISODE_016_WEBTOON } from '../data/kpatto/episode-016-webtoon'
import { EPISODE_017_WEBTOON } from '../data/kpatto/episode-017-webtoon'
import { EPISODE_018_WEBTOON } from '../data/kpatto/episode-018-webtoon'
import { EPISODE_019_WEBTOON } from '../data/kpatto/episode-019-webtoon'
import { EPISODE_020_WEBTOON } from '../data/kpatto/episode-020-webtoon'
import { EPISODE_021_WEBTOON } from '../data/kpatto/episode-021-webtoon'
import { EPISODE_022_WEBTOON } from '../data/kpatto/episode-022-webtoon'
import { EPISODE_023_WEBTOON } from '../data/kpatto/episode-023-webtoon'
import { EPISODE_024_WEBTOON } from '../data/kpatto/episode-024-webtoon'
import { EPISODE_025_WEBTOON } from '../data/kpatto/episode-025-webtoon'
import { EPISODE_026_WEBTOON } from '../data/kpatto/episode-026-webtoon'
import { EPISODE_027_WEBTOON } from '../data/kpatto/episode-027-webtoon'
import { EPISODE_028_WEBTOON } from '../data/kpatto/episode-028-webtoon'
import { EPISODE_029_WEBTOON } from '../data/kpatto/episode-029-webtoon'
import { EPISODE_030_WEBTOON } from '../data/kpatto/episode-030-webtoon'
import type { WebtoonEpisodeData } from '../data/kpatto/webtoon-types'

const EPISODES: WebtoonEpisodeData[] = [
  EPISODE_011_WEBTOON, EPISODE_012_WEBTOON, EPISODE_013_WEBTOON,
  EPISODE_014_WEBTOON, EPISODE_015_WEBTOON, EPISODE_016_WEBTOON,
  EPISODE_017_WEBTOON, EPISODE_018_WEBTOON, EPISODE_019_WEBTOON,
  EPISODE_020_WEBTOON, EPISODE_021_WEBTOON, EPISODE_022_WEBTOON,
  EPISODE_023_WEBTOON, EPISODE_024_WEBTOON, EPISODE_025_WEBTOON,
  EPISODE_026_WEBTOON, EPISODE_027_WEBTOON, EPISODE_028_WEBTOON,
  EPISODE_029_WEBTOON, EPISODE_030_WEBTOON,
]

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

function log(msg: string) { console.log(`[refresh] ${msg}`) }
function err(label: string, e: unknown) { console.error(`[refresh] ❌ ${label}:`, e); process.exit(1) }

async function getEpisodeMap(): Promise<Map<number, number>> {
  const epNums = EPISODES.map(e => e.episode)
  const { data, error } = await supabase
    .from('kp_episodes')
    .select('id, episode_num')
    .in('episode_num', epNums)
  if (error) err('fetch kp_episodes', error)
  const map = new Map<number, number>()
  data!.forEach(row => map.set(row.episode_num, row.id))
  log(`Found ${map.size} episodes in DB`)
  return map
}

async function cleanPanels(episodeMap: Map<number, number>): Promise<void> {
  log('Deleting existing panels & bubbles for EP11~30...')
  const ids = Array.from(episodeMap.values())
  const { error: bErr } = await supabase.from('kp_bubbles').delete().in('episode_id', ids)
  if (bErr) err('delete kp_bubbles', bErr)
  const { error: pErr } = await supabase.from('kp_panels').delete().in('episode_id', ids)
  if (pErr) err('delete kp_panels', pErr)
  log('  ✓ old panels & bubbles removed')
}

async function seedPanelsAndBubbles(episodeMap: Map<number, number>): Promise<void> {
  log('Inserting kp_panels + kp_bubbles...')
  let totalPanels = 0
  let totalBubbles = 0

  for (const ep of EPISODES) {
    const episode_id = episodeMap.get(ep.episode)
    if (!episode_id) { log(`  EP${ep.episode}: not in DB, skipping`); continue }

    const panelRows = ep.sections.map((section, idx) => {
      const base = { episode_id, order_num: idx + 1, type: section.type }
      if (section.type === 'panel') {
        return { ...base, image_url: section.imageUrl, layout: section.layout, height_ratio: null }
      } else if (section.type === 'gap') {
        return { ...base, image_url: null, layout: null, height_ratio: section.heightRatio }
      } else {
        return { ...base, image_url: (section as any).imageUrl ?? null, layout: null, height_ratio: null }
      }
    })

    const { data: panels, error: pErr } = await supabase
      .from('kp_panels').insert(panelRows).select('id, order_num, type')
    if (pErr) err(`kp_panels (EP${ep.episode})`, pErr)

    totalPanels += panels!.length

    for (const panel of panels!) {
      if (panel.type !== 'gap') continue
      const sectionIdx = panel.order_num - 1
      const section = ep.sections[sectionIdx]
      if (section.type !== 'gap' || section.bubbles.length === 0) continue

      const bubbleRows = section.bubbles.map((b, bIdx) => ({
        panel_id:       panel.id,
        episode_id,
        order_num:      bIdx + 1,
        speaker:        b.speaker,
        korean:         b.korean,
        translations:   { en: b.translation },
        audio_url:      null,
        highlight_text: b.highlight_text ?? null,
        position: {
          xPct:      b.xPct,
          yPct:      b.yPct,
          widthPct:  b.widthPct,
          bubbleKey: b.bubbleKey,
          lines:     b.lines ?? 1,
        },
        tail: b.tail ?? null,
      }))

      const { error: bErr } = await supabase.from('kp_bubbles').insert(bubbleRows)
      if (bErr) err(`kp_bubbles (EP${ep.episode} panel ${panel.id})`, bErr)
      totalBubbles += bubbleRows.length
    }

    const bubbleCount = ep.sections
      .filter(s => s.type === 'gap')
      .reduce((acc, s) => acc + (s.type === 'gap' ? s.bubbles.length : 0), 0)
    log(`  EP${String(ep.episode).padStart(2, '0')} ✓ — ${panelRows.length} sections, ${bubbleCount} bubbles`)
  }

  log(`  ✓ total: ${totalPanels} panels, ${totalBubbles} bubbles`)
}

async function main() {
  log('=== K-PATTO EP11~30 Refresh Start ===\n')
  const episodeMap = await getEpisodeMap()
  await cleanPanels(episodeMap)
  await seedPanelsAndBubbles(episodeMap)
  log('\n=== 완료 ===')
}

main().catch(console.error)
