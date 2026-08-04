/**
 * K-PATTO DB Seed Script — EP21~30 패널 & 버블 마이그레이션
 *
 * 실행:
 *   cd patto
 *   npx tsx scripts/seed-ep21-30.ts
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

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
  EPISODE_021_WEBTOON, EPISODE_022_WEBTOON, EPISODE_023_WEBTOON,
  EPISODE_024_WEBTOON, EPISODE_025_WEBTOON, EPISODE_026_WEBTOON,
  EPISODE_027_WEBTOON, EPISODE_028_WEBTOON, EPISODE_029_WEBTOON,
  EPISODE_030_WEBTOON,
]

const EP_META: Record<number, { title: string; location: string; characters: string[] }> = {
  21: { title: '어제 뭐 했어?',  location: '학교 복도 / 한강',       characters: ['emma', 'jisu']              },
  22: { title: '추측하기',       location: '맛집 앞 / 식당',          characters: ['emma', 'minjun']            },
  23: { title: '해야 해요',      location: '도서관',                   characters: ['emma', 'jisu']              },
  24: { title: '의견 나누기',    location: '카페',                     characters: ['emma', 'sophie']            },
  25: { title: '경험 이야기',    location: '한강공원 / 제주도(회상)',   characters: ['emma', 'minjun']            },
  26: { title: 'K-드라마 이야기', location: '소피 방',                 characters: ['emma', 'sophie']            },
  27: { title: 'K-POP',         location: '지수 방',                  characters: ['emma', 'jisu']              },
  28: { title: 'K-뷰티 쇼핑',   location: '뷰티숍',                   characters: ['emma', 'sophie', 'staff']   },
  29: { title: '건강과 운동',    location: '공원',                     characters: ['emma', 'minjun']            },
  30: { title: '어디 살아요?',   location: '지하철 / 홍대 동네',        characters: ['emma', 'jisu']              },
}

const FOCUS_MAP: Record<number, Array<{ highlight: string; pattern: string }>> = {
  21: [
    { highlight: '한강에 갔어요',   pattern: '~에 갔어요' },
    { highlight: '치킨도 먹었어요', pattern: '~도 먹었어요' },
    { highlight: '이번 주말에 가요', pattern: '이번 ~에 가요' },
  ],
  22: [
    { highlight: '유명한 것 같아요', pattern: '~는 것 같아요' },
    { highlight: '맛있을 것 같아요', pattern: '~을 것 같아요' },
    { highlight: '시킬 것 같아요',   pattern: '~ㄹ 것 같아요' },
  ],
  23: [
    { highlight: '공부해야 해요',  pattern: '~해야 해요' },
    { highlight: '써야 해',        pattern: '~야/어야 해' },
    { highlight: '보면 안 돼',     pattern: '~면 안 돼요' },
  ],
  24: [
    { highlight: '특히 매운 거',   pattern: '특히 ~' },
    { highlight: '매운 것 같아요', pattern: '너무 ~것 같아요' },
    { highlight: '제 생각에는',    pattern: '제 생각에는 ~' },
  ],
  25: [
    { highlight: '가 봤어요',    pattern: '~아/어 봤어요' },
    { highlight: '못 가 봤어요', pattern: '못 ~봤어요' },
    { highlight: '먹어 봤어요',  pattern: '~어 봤어요' },
  ],
  26: [
    { highlight: '이상한 변호사 우영우', pattern: '드라마 제목' },
    { highlight: '빠져 있어요',          pattern: '~에 빠져 있어요' },
    { highlight: '언제 나와요',          pattern: '언제 ~요?' },
  ],
  27: [
    { highlight: 'BTS 팬이에요',   pattern: '~팬이에요' },
    { highlight: '들어 봤어요',    pattern: '~아/어 봤어요?' },
    { highlight: '같이 가고 싶어요', pattern: '같이 ~고 싶어요' },
  ],
  28: [
    { highlight: '써 봐도 돼요', pattern: '~봐도 돼요?' },
    { highlight: '효과 있어요',  pattern: '~있어요?' },
    { highlight: '살게요',        pattern: '~ㄹ게요' },
  ],
  29: [
    { highlight: '운동 좋아해요', pattern: '~좋아해요?' },
    { highlight: '자전거 타요',   pattern: '~타요' },
    { highlight: '제일 중요해요', pattern: '~이/가 제일 중요해요' },
  ],
  30: [
    { highlight: '어디 살아요',       pattern: '어디 살아요?' },
    { highlight: '홍대 근처에 살아요', pattern: '~근처에 살아요' },
    { highlight: '걸어서 10분이에요',  pattern: '걸어서 ~분이에요' },
  ],
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

function log(msg: string) { console.log(`[seed-ep21-30] ${msg}`) }
function err(label: string, e: unknown) { console.error(`[seed-ep21-30] ❌ ${label}:`, e); process.exit(1) }

async function upsertEpisodes(): Promise<Map<number, number>> {
  log('Upserting kp_episodes EP21~30...')
  const rows = EPISODES.map(ep => {
    const meta = EP_META[ep.episode]
    return {
      episode_num: ep.episode,
      title: ep.title,
      theme: ep.theme,
      location: meta.location,
      characters: meta.characters,
      is_free: false,
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

async function cleanPanels(episodeMap: Map<number, number>): Promise<void> {
  log('Cleaning existing panels & bubbles for EP21~30...')
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
    log(`  EP${String(ep.episode).padStart(2,'0')} ✓ — ${panelRows.length} panels, ${bubbleCount} bubbles`)
  }
  log(`  ✓ total: ${totalPanels} panels, ${totalBubbles} bubbles`)
}

async function linkBubbleDialogues(episodeMap: Map<number, number>): Promise<void> {
  log('Linking kp_bubbles.dialogue_id from kp_dialogues...')
  let linked = 0

  for (const ep of EPISODES) {
    const episodeId = episodeMap.get(ep.episode)!
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
      await supabase.from('kp_bubbles').update({ dialogue_id: match.id }).eq('id', bubble.id)
      linked++
    }
  }
  log(`  ✓ ${linked} bubble→dialogue links created`)
}

async function seedFocusExpressions(episodeMap: Map<number, number>): Promise<void> {
  log('Seeding kp_dialogue_expressions (role=focus) for EP21~30...')
  let total = 0

  for (const [epNum, focusItems] of Object.entries(FOCUS_MAP)) {
    const episodeId = episodeMap.get(parseInt(epNum))
    if (!episodeId) { log(`  EP${epNum}: not in DB, skipping`); continue }

    const { data: dialogues } = await supabase
      .from('kp_dialogues').select('id, text_ko').eq('episode_id', episodeId)
    if (!dialogues?.length) { log(`  EP${epNum}: no dialogues found`); continue }

    const dialogueIds = dialogues.map(d => d.id)
    await supabase.from('kp_dialogue_expressions')
      .delete().in('dialogue_id', dialogueIds).eq('role', 'focus')

    const rows: Array<{ dialogue_id: number; matched_text: string; role: string }> = []
    for (const item of focusItems) {
      const match = dialogues.find(d => (d.text_ko as string).includes(item.highlight))
      if (!match) { log(`  EP${epNum} WARN: no dialogue for "${item.highlight}"`); continue }
      rows.push({ dialogue_id: match.id, matched_text: item.highlight, role: 'focus' })
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

async function main() {
  log('=== K-PATTO EP21~30 Seed Start ===\n')
  const episodeMap = await upsertEpisodes()
  await cleanPanels(episodeMap)
  await seedPanelsAndBubbles(episodeMap)
  await linkBubbleDialogues(episodeMap)
  await seedFocusExpressions(episodeMap)
  log('\n=== 완료 ===')
  log(`episodes : EP21~30 (${episodeMap.size}개)`)
}

main().catch(console.error)
