/**
 * kp_bubbles EP01~10 대사를 kp_dialogues(MD 기준)로 교체 + dialogue_id 연결
 *
 * 매칭 전략:
 *  1. 정규화 후 완전 일치 (줄바꿈 제거, 공백 정규화)
 *  2. 부분 포함 (버블 텍스트 ⊂ 대화 or 반대)
 *  3. 첫/끝 어절 일치
 *  4. fallback: 매칭 없음 → dialogue_id=null, korean 유지
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

function norm(s: string): string {
  return s.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/[.!?。！？]+$/, '').trim()
}

function words(s: string): string[] {
  return norm(s).split(/\s+/).filter(w => w.length >= 2)
}

function matchScore(bubble: string, dialogue: string): number {
  const nb = norm(bubble)
  const nd = norm(dialogue)

  // 1. 완전 일치
  if (nb === nd) return 100

  // 2. 포함
  if (nd.includes(nb) || nb.includes(nd)) return 80

  // 3. 어절 겹침
  const bw = words(bubble)
  const dw = words(dialogue)
  if (!bw.length || !dw.length) return 0

  const dSet = new Set(dw)
  const overlap = bw.filter(w => dSet.has(w)).length
  const ratio = overlap / Math.max(bw.length, dw.length)

  // 첫 어절 일치 보너스
  const firstMatch = bw[0] === dw[0] ? 10 : 0
  // 끝 어절 일치 보너스
  const lastMatch = bw.at(-1) === dw.at(-1) ? 10 : 0

  return Math.round(ratio * 60) + firstMatch + lastMatch
}

interface Bubble {
  id: number
  panel_id: number
  order_num: number
  speaker: string
  korean: string
  dialogue_id: number | null
}

interface Dialogue {
  id: number
  scene_id: number
  order_num: number
  speaker: string
  text_ko: string
}

async function processEpisode(epNum: number) {
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', epNum).single()
  if (!ep) { console.warn(`EP${epNum} 없음`); return }

  const [{ data: rawBubbles }, { data: rawDialogues }] = await Promise.all([
    sb.from('kp_bubbles')
      .select('id, panel_id, order_num, speaker, korean, dialogue_id')
      .eq('episode_id', ep.id)
      .order('panel_id, order_num'),
    sb.from('kp_dialogues')
      .select('id, scene_id, order_num, speaker, text_ko')
      .eq('episode_id', ep.id)
      .order('scene_id, order_num'),
  ])

  const bubbles: Bubble[] = (rawBubbles ?? []) as Bubble[]
  const dialogues: Dialogue[] = (rawDialogues ?? []) as Dialogue[]

  if (!bubbles.length) { console.log(`  EP${String(epNum).padStart(2,'0')} — 버블 없음`); return }
  if (!dialogues.length) { console.log(`  EP${String(epNum).padStart(2,'0')} — 대화 없음`); return }

  const matched: Array<{ bubbleId: number; dialogueId: number; score: number; oldKo: string; newKo: string; newSpeaker: string }> = []
  const unmatched: number[] = []
  const usedDialogueIds = new Set<number>()

  // 버블마다 최고 점수 대화 찾기
  for (const b of bubbles) {
    let bestScore = 0
    let bestDlg: Dialogue | null = null

    for (const d of dialogues) {
      if (usedDialogueIds.has(d.id)) continue
      const score = matchScore(b.korean, d.text_ko)
      if (score > bestScore) { bestScore = score; bestDlg = d }
    }

    // 40점 미만이면 매칭 안 함
    if (bestDlg && bestScore >= 40) {
      usedDialogueIds.add(bestDlg.id)
      matched.push({
        bubbleId: b.id,
        dialogueId: bestDlg.id,
        score: bestScore,
        oldKo: b.korean,
        newKo: bestDlg.text_ko,
        newSpeaker: bestDlg.speaker,
      })
    } else {
      unmatched.push(b.id)
    }
  }

  // DB 업데이트 (매칭된 것만)
  let updated = 0
  for (const m of matched) {
    const { error } = await sb
      .from('kp_bubbles')
      .update({ korean: m.newKo, speaker: m.newSpeaker, dialogue_id: m.dialogueId })
      .eq('id', m.bubbleId)
    if (error) console.error(`  버블 ${m.bubbleId} 업데이트 오류:`, error.message)
    else updated++
  }

  const epLabel = `EP${String(epNum).padStart(2,'0')}`
  console.log(`\n${epLabel} — 버블 ${bubbles.length}개 / 대화 ${dialogues.length}개 / 매칭 ${matched.length}개 / 업데이트 ${updated}개 / 미매칭 ${unmatched.length}개`)

  // 변경 사항 출력
  for (const m of matched) {
    const changed = norm(m.oldKo) !== norm(m.newKo)
    if (changed) {
      console.log(`  [변경] "${m.oldKo.replace(/\n/g, '\\n')}" → "${m.newKo}"  (score=${m.score})`)
    }
  }

  // 미매칭 버블
  for (const bid of unmatched) {
    const b = bubbles.find(x => x.id === bid)!
    console.log(`  [미매칭] id=${bid} "${b.korean.replace(/\n/g, '\\n')}"`)
  }
}

async function main() {
  console.log('=== kp_bubbles 대사 교체 + dialogue_id 연결 (EP01~10) ===\n')

  // dialogue_id 컬럼 존재 확인
  const { data: sample } = await sb.from('kp_bubbles').select('*').limit(1)
  const cols = sample?.[0] ? Object.keys(sample[0]) : []
  if (!cols.includes('dialogue_id')) {
    console.error('❌ dialogue_id 컬럼 없음. 먼저 step4-add-dialogue-id.sql을 Supabase에서 실행해주세요.')
    process.exit(1)
  }

  for (let ep = 1; ep <= 10; ep++) {
    await processEpisode(ep)
  }

  // 최종 통계
  const { count: total } = await sb.from('kp_bubbles').select('id', { count: 'exact', head: true })
  const { count: linked } = await sb.from('kp_bubbles').select('id', { count: 'exact', head: true }).not('dialogue_id', 'is', null)
  console.log(`\n=== 완료 ===`)
  console.log(`kp_bubbles 전체: ${total}개`)
  console.log(`dialogue_id 연결됨: ${linked}개`)
  console.log(`미연결: ${(total ?? 0) - (linked ?? 0)}개`)
}

main().catch(console.error)
