/**
 * K-PATTO DB Seed Script — EP01~10 전체 마이그레이션
 *
 * 사전 조건:
 *   1. Supabase SQL Editor에서 kpatto-schema.sql 실행
 *   2. .env.local에 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 설정
 *
 * 실행:
 *   cd patto
 *   npx tsx scripts/seed-kpatto.ts
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// ── Data imports ───────────────────────────────────────────────────────────
import { WEBTOON_EPISODES }  from '../data/kpatto/episode-001-webtoon'
import { KPATTO_PATTERNS }   from '../data/kpatto/patterns'
import { EP001_POOL } from '../data/kpatto/challenge-pool-ep001'
import { EP002_POOL } from '../data/kpatto/challenge-pool-ep002'
import { EP003_POOL } from '../data/kpatto/challenge-pool-ep003'
import { EP004_POOL } from '../data/kpatto/challenge-pool-ep004'
import { EP005_POOL } from '../data/kpatto/challenge-pool-ep005'
import { EP006_POOL } from '../data/kpatto/challenge-pool-ep006'
import { EP007_POOL } from '../data/kpatto/challenge-pool-ep007'
import { EP008_POOL } from '../data/kpatto/challenge-pool-ep008'
import { EP009_POOL } from '../data/kpatto/challenge-pool-ep009'
import { EP010_POOL } from '../data/kpatto/challenge-pool-ep010'

const ALL_POOLS = [
  EP001_POOL, EP002_POOL, EP003_POOL, EP004_POOL, EP005_POOL,
  EP006_POOL, EP007_POOL, EP008_POOL, EP009_POOL, EP010_POOL,
]

// ── Supabase client (service role — bypasses RLS) ─────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

function log(msg: string) { console.log(`[seed] ${msg}`) }
function err(label: string, e: unknown) { console.error(`[seed] ❌ ${label}:`, e); process.exit(1) }

// ── STEP 1: Episodes ───────────────────────────────────────────────────────
async function seedEpisodes(): Promise<Map<number, number>> {
  log('Inserting kp_episodes...')

  const rows = Object.values(WEBTOON_EPISODES)
    .sort((a, b) => a.episode - b.episode)
    .map(ep => ({
      episode_num: ep.episode,
      title:       ep.title,
      theme:       ep.theme ?? null,
      is_free:     true,
    }))

  const { data, error } = await supabase.from('kp_episodes').insert(rows).select('id, episode_num')
  if (error) err('kp_episodes', error)

  const map = new Map<number, number>()
  data!.forEach(row => map.set(row.episode_num, row.id))
  log(`  ✓ ${data!.length} episodes`)
  return map
}

// ── STEP 2: Panels + Bubbles ───────────────────────────────────────────────
async function seedPanelsAndBubbles(episodeMap: Map<number, number>): Promise<void> {
  log('Inserting kp_panels + kp_bubbles...')

  const episodes = Object.values(WEBTOON_EPISODES).sort((a, b) => a.episode - b.episode)

  let totalPanels  = 0
  let totalBubbles = 0

  for (const ep of episodes) {
    const episode_id = episodeMap.get(ep.episode)!

    // Insert all sections for this episode
    const panelRows = ep.sections.map((section, idx) => {
      const base = { episode_id, order_num: idx + 1, type: section.type }

      if (section.type === 'panel') {
        return { ...base, image_url: section.imageUrl, layout: section.layout, height_ratio: null }
      } else if (section.type === 'gap') {
        return { ...base, image_url: null, layout: null, height_ratio: section.heightRatio }
      } else {
        // crop-panel
        return { ...base, image_url: (section as any).imageUrl ?? null, layout: null, height_ratio: null }
      }
    })

    const { data: panels, error: pErr } = await supabase
      .from('kp_panels')
      .insert(panelRows)
      .select('id, order_num, type')
    if (pErr) err(`kp_panels (EP${ep.episode})`, pErr)

    totalPanels += panels!.length

    // For each gap panel, insert its bubbles
    for (const panel of panels!) {
      if (panel.type !== 'gap') continue

      const sectionIdx = panel.order_num - 1
      const section = ep.sections[sectionIdx]
      if (section.type !== 'gap' || section.bubbles.length === 0) continue

      const bubbleRows = section.bubbles.map((b, bIdx) => ({
        panel_id:     panel.id,
        episode_id,
        order_num:    bIdx + 1,
        speaker:      b.speaker,
        korean:       b.korean,
        translations: { en: b.translation },
        audio_url:    null,
        position:     {
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
  }

  log(`  ✓ ${totalPanels} panels, ${totalBubbles} bubbles`)
}

// ── STEP 3: Patterns ───────────────────────────────────────────────────────
async function seedPatterns(episodeMap: Map<number, number>): Promise<Map<string, number>> {
  log('Inserting kp_patterns...')

  const rows = KPATTO_PATTERNS.map((p, globalIdx) => {
    const epMatch     = p.id.match(/kp-ep-(\d+)-p(\d+)/)
    const legacyMatch = p.id.match(/^kp-(\d+)$/)

    let episode_id: number | null = null
    let order_num  = globalIdx + 1

    if (epMatch) {
      episode_id = episodeMap.get(parseInt(epMatch[1])) ?? null
      order_num  = parseInt(epMatch[2])
    } else if (legacyMatch) {
      order_num = parseInt(legacyMatch[1])
    }

    return {
      code:       p.id,
      episode_id,
      order_num,
      pattern:    p.korean,
      structure:  p.structure ?? null,
      examples:   p.examples ?? [],
      level:      p.level,
    }
  })

  const { data, error } = await supabase.from('kp_patterns').insert(rows).select('id, code')
  if (error) err('kp_patterns', error)

  const map = new Map<string, number>()
  data!.forEach(row => map.set(row.code, row.id))
  log(`  ✓ ${data!.length} patterns`)
  return map
}

// ── STEP 4: Challenges ─────────────────────────────────────────────────────
async function seedChallenges(
  episodeMap:  Map<number, number>,
  patternMap:  Map<string, number>,
): Promise<void> {
  log('Inserting kp_challenges...')

  let total = 0

  for (let i = 0; i < ALL_POOLS.length; i++) {
    const pool       = ALL_POOLS[i]
    const episode_id = episodeMap.get(i + 1)!

    const rows = pool.map((q, idx) => {
      const pattern_id = patternMap.get(q.patternId) ?? null
      const base = { episode_id, pattern_id, order_num: idx + 1, type: q.type }

      if (q.type === 'mc') {
        return {
          ...base,
          question: { prompt: q.prompt },
          options:  [q.answer, ...q.distractors],
          answer:   q.answer,
        }
      } else {
        return {
          ...base,
          question: { prompt: q.prompt },
          options:  { answerBlocks: q.answerBlocks, extraBlocks: q.extraBlocks },
          answer:   q.answerBlocks.join(' '),
        }
      }
    })

    const { error } = await supabase.from('kp_challenges').insert(rows)
    if (error) err(`kp_challenges (EP${i + 1})`, error)
    total += rows.length
  }

  log(`  ✓ ${total} challenges`)
}

// ── STEP 5: Voices ─────────────────────────────────────────────────────────
async function seedVoices(): Promise<void> {
  log('Inserting kp_voices...')

  const rows = [
    { speaker: 'emma',     voice_id: 'ko-KR-Wavenet-A', language: 'ko-KR', pitch: 2.0,  speed: 0.95 },
    { speaker: 'jisu',     voice_id: 'ko-KR-Wavenet-B', language: 'ko-KR', pitch: 1.0,  speed: 1.0  },
    { speaker: 'jisoo',    voice_id: 'ko-KR-Wavenet-B', language: 'ko-KR', pitch: 1.0,  speed: 1.0  },
    { speaker: 'minjun',   voice_id: 'ko-KR-Wavenet-C', language: 'ko-KR', pitch: -2.0, speed: 1.0  },
    { speaker: 'sophie',   voice_id: 'ko-KR-Wavenet-A', language: 'ko-KR', pitch: 1.5,  speed: 1.0  },
    { speaker: 'staff',    voice_id: 'ko-KR-Wavenet-B', language: 'ko-KR', pitch: 0.0,  speed: 1.0  },
    { speaker: 'vendor',   voice_id: 'ko-KR-Wavenet-D', language: 'ko-KR', pitch: -1.0, speed: 1.05 },
    { speaker: 'professor',voice_id: 'ko-KR-Wavenet-C', language: 'ko-KR', pitch: -3.0, speed: 0.9  },
    { speaker: 'students', voice_id: 'ko-KR-Wavenet-A', language: 'ko-KR', pitch: 0.0,  speed: 1.0  },
  ]

  const { error } = await supabase.from('kp_voices').insert(rows)
  if (error) err('kp_voices', error)
  log(`  ✓ ${rows.length} voices`)
}

// ── STEP 6: Row count verification ────────────────────────────────────────
async function verify(): Promise<void> {
  log('\n── Row counts ──────────────────────────────────────────────')

  const tables = ['kp_episodes', 'kp_panels', 'kp_bubbles', 'kp_patterns', 'kp_challenges', 'kp_voices']
  for (const t of tables) {
    const { count } = await supabase.from(t).select('*', { count: 'exact', head: true })
    console.log(`  ${t.padEnd(16)} ${count}`)
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('K-PATTO DB Seed — EP01~10')
  console.log('─'.repeat(40))

  const episodeMap = await seedEpisodes()
  await seedPanelsAndBubbles(episodeMap)
  const patternMap = await seedPatterns(episodeMap)
  await seedChallenges(episodeMap, patternMap)
  await seedVoices()
  await verify()

  console.log('\n✅ Migration complete.')
}

main().catch(err => { console.error(err); process.exit(1) })
