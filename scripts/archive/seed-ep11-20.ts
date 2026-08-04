/**
 * K-PATTO DB Seed Script — EP11~20 패널 & 버블 마이그레이션
 *
 * 실행:
 *   cd patto
 *   npx tsx scripts/seed-ep11-20.ts
 *
 * 사전 조건:
 *   1. kp_episodes에 EP11~20이 존재해야 함 (seed-kpatto-episodes.ts 먼저 실행)
 *   2. seed-kpatto-dialogues.ts 실행 완료 (kp_scenes, kp_dialogues 데이터 필요)
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
import type { WebtoonEpisodeData } from '../data/kpatto/webtoon-types'

const EPISODES: WebtoonEpisodeData[] = [
  EPISODE_011_WEBTOON,
  EPISODE_012_WEBTOON,
  EPISODE_013_WEBTOON,
  EPISODE_014_WEBTOON,
  EPISODE_015_WEBTOON,
  EPISODE_016_WEBTOON,
  EPISODE_017_WEBTOON,
  EPISODE_018_WEBTOON,
  EPISODE_019_WEBTOON,
  EPISODE_020_WEBTOON,
]

const EP_META: Record<number, { title: string; location: string; characters: string[] }> = {
  11: { title: '지하철에서',      location: '지하철역 / 지하철 / 택시',  characters: ['emma','jisu','driver']       },
  12: { title: '식당에서 (심화)', location: '한식당',                    characters: ['emma','minjun','staff']      },
  13: { title: '약속 잡기',       location: '카카오톡 / 카페',            characters: ['emma','jisu','sophie']       },
  14: { title: '길 잃은 에마',    location: '인사동 골목',               characters: ['emma','stranger']            },
  15: { title: '드라마 추천',     location: '카페',                      characters: ['emma','sophie']              },
  16: { title: '날씨 이야기',     location: '학교 앞',                   characters: ['emma','jisu']               },
  17: { title: '약국에서',        location: '약국',                      characters: ['emma','jisu','pharmacist']   },
  18: { title: '취미 이야기',     location: '카페',                      characters: ['emma','minjun']             },
  19: { title: '경복궁 여행',     location: '경복궁',                    characters: ['emma','sophie']              },
  20: { title: '오랜만에 만남',   location: '카페',                      characters: ['emma','sophie']              },
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

function log(msg: string) { console.log(`[seed-ep11-20] ${msg}`) }
function err(label: string, e: unknown) { console.error(`[seed-ep11-20] ❌ ${label}:`, e); process.exit(1) }

// ── STEP 1: Upsert kp_episodes EP11~20 ───────────────────────────────────
async function upsertEpisodes(): Promise<Map<number, number>> {
  log('Upserting kp_episodes EP11~20...')

  const rows = EPISODES.map(ep => {
    const meta = EP_META[ep.episode]
    return {
      episode_num: ep.episode,
      title:       ep.title,
      theme:       ep.theme,
      location:    meta.location,
      characters:  meta.characters,
      is_free:     false,
    }
  })

  const { data, error } = await supabase
    .from('kp_episodes')
    .upsert(rows, { onConflict: 'episode_num' })
    .select('id, episode_num')
  if (error) err('kp_episodes upsert', error)

  const map = new Map<number, number>()
  data!.forEach(row => map.set(row.episode_num, row.id))
  log(`  ✓ ${data!.length} episodes upserted`)
  return map
}

// ── STEP 2: Delete existing panels/bubbles for EP11~20 ───────────────────
async function cleanPanels(episodeMap: Map<number, number>): Promise<void> {
  log('Cleaning existing panels & bubbles for EP11~20...')
  const ids = Array.from(episodeMap.values())

  const { error: bErr } = await supabase.from('kp_bubbles').delete().in('episode_id', ids)
  if (bErr) err('delete kp_bubbles', bErr)

  const { error: pErr } = await supabase.from('kp_panels').delete().in('episode_id', ids)
  if (pErr) err('delete kp_panels', pErr)

  log('  ✓ old panels & bubbles removed')
}

// ── STEP 3: Insert panels + bubbles from TypeScript webtoon data ──────────
async function seedPanelsAndBubbles(episodeMap: Map<number, number>): Promise<void> {
  log('Inserting kp_panels + kp_bubbles...')

  let totalPanels  = 0
  let totalBubbles = 0

  for (const ep of EPISODES) {
    const episode_id = episodeMap.get(ep.episode)!

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
      .from('kp_panels')
      .insert(panelRows)
      .select('id, order_num, type')
    if (pErr) err(`kp_panels (EP${ep.episode})`, pErr)

    totalPanels += panels!.length

    // Insert bubbles for each gap panel
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

    log(`  EP${String(ep.episode).padStart(2,'0')} ✓ — ${panelRows.length} panels, ${ep.sections.filter(s=>s.type==='gap').reduce((acc,s)=>acc+(s.type==='gap'?s.bubbles.length:0),0)} bubbles`)
  }

  log(`  ✓ total: ${totalPanels} panels, ${totalBubbles} bubbles`)
}

// ── STEP 4: Seed kp_dialogue_expressions for focus patterns ──────────────
async function seedFocusExpressions(episodeMap: Map<number, number>): Promise<void> {
  log('Seeding kp_dialogue_expressions (role=focus) for EP11~20...')

  // Focus pattern → matched_text mapping per episode
  const FOCUS_MAP: Record<number, Array<{ highlight: string; pattern: string }>> = {
    11: [
      { highlight: '타면 돼',          pattern: '~타면 돼요' },
      { highlight: '여기서 내려',      pattern: '~에서 내려요' },
      { highlight: '까지 가 주세요',   pattern: '~까지 가 주세요' },
    ],
    12: [
      { highlight: '로 할게요',         pattern: '~로 할게요' },
      { highlight: '덜 맵게 해 주세요', pattern: '덜 ~게 해 주세요' },
      { highlight: '리필 돼요',         pattern: '~리필 돼요?' },
    ],
    13: [
      { highlight: '주말에 뭐 해',      pattern: '~에 뭐 해요?' },
      { highlight: '같이 영화 볼래',    pattern: '같이 ~ㄹ래요?' },
      { highlight: '늦을 것 같아요',    pattern: '~을 것 같아요' },
    ],
    14: [
      { highlight: '길을 잃었어요',          pattern: '길을 잃었어요' },
      { highlight: '쭉 가면 돼요',           pattern: '쭉 가면 돼요' },
      { highlight: '오른쪽으로 꺾으면 돼요', pattern: '~으로 꺾으면 돼요' },
    ],
    15: [
      { highlight: '봤어',        pattern: '~봤어요?' },
      { highlight: '강추야',      pattern: '강추예요!' },
      { highlight: '재미있어',    pattern: '재미있어요' },
    ],
    16: [
      { highlight: '날씨 어때',   pattern: '~날씨 어때요?' },
      { highlight: '올 것 같아요', pattern: '~올 것 같아요' },
      { highlight: '챙겨야겠다',  pattern: '~챙겨야겠어요' },
    ],
    17: [
      { highlight: '머리가 아파요',      pattern: '~이/가 아파요' },
      { highlight: '두통약 있어요',      pattern: '~약 있어요?' },
      { highlight: '안 먹는 게 나아요',  pattern: '안 ~는 게 나아요' },
    ],
    18: [
      { highlight: '취미가 뭐야', pattern: '취미가 뭐예요?' },
      { highlight: '저도요',      pattern: '저도요' },
      { highlight: '별로예요',    pattern: '~별로예요' },
    ],
    19: [
      { highlight: '유명한 게 뭐야', pattern: '여기서 유명한 게 뭐예요?' },
      { highlight: '같이 사진 찍어', pattern: '같이 사진 찍어요' },
      { highlight: '잘 나왔어',      pattern: '사진이 잘 나왔어요?' },
    ],
    20: [
      { highlight: '오랜만이야', pattern: '오랜만이에요' },
      { highlight: '잘 지냈어',  pattern: '잘 지냈어요?' },
      { highlight: '다음에 또 봐', pattern: '다음에 또 봐요' },
    ],
  }

  let total = 0

  for (const [epNum, focusItems] of Object.entries(FOCUS_MAP)) {
    const episodeId = episodeMap.get(parseInt(epNum))
    if (!episodeId) { log(`  EP${epNum}: not in DB, skipping`); continue }

    // Fetch dialogues for this episode that contain the highlight text
    const { data: dialogues } = await supabase
      .from('kp_dialogues')
      .select('id, text_ko')
      .eq('episode_id', episodeId)

    if (!dialogues?.length) { log(`  EP${epNum}: no dialogues found`); continue }

    // Delete existing focus mappings for this episode
    const dialogueIds = dialogues.map(d => d.id)
    await supabase
      .from('kp_dialogue_expressions')
      .delete()
      .in('dialogue_id', dialogueIds)
      .eq('role', 'focus')

    const rows: Array<{ dialogue_id: number; matched_text: string; role: string }> = []

    for (const item of focusItems) {
      // Find the dialogue that contains this highlight text
      const match = dialogues.find(d =>
        (d.text_ko as string).includes(item.highlight)
      )
      if (!match) {
        log(`  EP${epNum} WARN: no dialogue found for highlight "${item.highlight}"`)
        continue
      }
      rows.push({
        dialogue_id:  match.id,
        matched_text: item.highlight,
        role:         'focus',
      })
    }

    if (rows.length > 0) {
      const { error } = await supabase.from('kp_dialogue_expressions').insert(rows)
      if (error) err(`kp_dialogue_expressions EP${epNum}`, error)
      total += rows.length
      log(`  EP${epNum} ✓ — ${rows.length} focus mappings`)
    }
  }

  log(`  ✓ total: ${total} focus expression mappings`)
}

// ── STEP 5: Link bubble dialogue_id from kp_dialogues ────────────────────
async function linkBubbleDialogues(episodeMap: Map<number, number>): Promise<void> {
  log('Linking kp_bubbles.dialogue_id from kp_dialogues...')

  let linked = 0

  for (const ep of EPISODES) {
    const episodeId = episodeMap.get(ep.episode)!

    // Fetch all bubbles and dialogues for this episode
    const [{ data: bubbles }, { data: dialogues }] = await Promise.all([
      supabase.from('kp_bubbles').select('id, korean').eq('episode_id', episodeId),
      supabase.from('kp_dialogues').select('id, text_ko').eq('episode_id', episodeId),
    ])

    if (!bubbles?.length || !dialogues?.length) continue

    for (const bubble of bubbles) {
      const match = (dialogues as Array<{id:number; text_ko:string}>).find(
        d => d.text_ko === bubble.korean
      )
      if (!match) continue

      await supabase
        .from('kp_bubbles')
        .update({ dialogue_id: match.id })
        .eq('id', bubble.id)

      linked++
    }
  }

  log(`  ✓ ${linked} bubble→dialogue links created`)
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  log('=== K-PATTO EP11~20 Seed Start ===\n')

  const episodeMap = await upsertEpisodes()
  await cleanPanels(episodeMap)
  await seedPanelsAndBubbles(episodeMap)
  await linkBubbleDialogues(episodeMap)
  await seedFocusExpressions(episodeMap)

  log('\n=== 완료 ===')
  log(`episodes : EP11~20 (${episodeMap.size}개)`)
  log('panels   : 11 per episode (5 gap + 5 panel + 1 tail gap)')
  log('Run seed-kpatto-dialogues.ts separately for kp_scenes + kp_dialogues if needed')
}

main().catch(console.error)
