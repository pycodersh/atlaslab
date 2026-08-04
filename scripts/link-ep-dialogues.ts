/**
 * 특정 에피소드의 kp_bubbles ↔ kp_dialogues 연결 상태 확인 + 자동 매칭
 *
 * 실행: npx tsx scripts/link-ep-dialogues.ts 30
 * 적용: npx tsx scripts/link-ep-dialogues.ts 30 --apply
 */
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const EP_NUM = parseInt(process.argv[2] ?? '30')
const APPLY  = process.argv.includes('--apply')

// 텍스트 정규화: 공백·괄호주석 제거 후 비교
function normalize(s: string): string {
  return s.replace(/^\([^)]*\)\s*/, '').replace(/\s+/g, ' ').trim()
}

async function main() {
  // 1. 에피소드 id 조회
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', EP_NUM).single()
  if (!ep) { console.error(`EP${EP_NUM} 없음`); process.exit(1) }
  const epId = ep.id as number
  console.log(`\nEP${EP_NUM}  (episode_id=${epId})`)

  // 2. kp_bubbles 조회
  const { data: bubbles } = await sb
    .from('kp_bubbles')
    .select('id, order_num, speaker, korean, dialogue_id')
    .eq('episode_id', epId)
    .order('order_num')

  const bubbleList = (bubbles ?? []) as {
    id: number; order_num: number; speaker: string; korean: string; dialogue_id: number | null
  }[]

  const linked   = bubbleList.filter(b => b.dialogue_id != null)
  const unlinked = bubbleList.filter(b => b.dialogue_id == null)

  console.log(`\nkp_bubbles 현황: 총 ${bubbleList.length}개`)
  console.log(`  linked   (dialogue_id 있음): ${linked.length}개`)
  console.log(`  unlinked (dialogue_id null): ${unlinked.length}개`)

  if (unlinked.length === 0) {
    console.log('\n✅ 모든 bubble이 이미 연결되어 있습니다.')
    return
  }

  // 3. kp_dialogues 조회
  const { data: dialogues } = await sb
    .from('kp_dialogues')
    .select('id, order_num, speaker, text_ko')
    .eq('episode_id', epId)
    .order('order_num')

  const dlgList = (dialogues ?? []) as {
    id: number; order_num: number; speaker: string; text_ko: string
  }[]

  console.log(`\nkp_dialogues: 총 ${dlgList.length}개`)

  // 이미 연결된 dialogue_id 집합 (중복 연결 방지)
  const usedDlgIds = new Set(linked.map(b => b.dialogue_id as number))

  // 4. 매칭 시도
  // 우선순위:
  //   1) speaker + text 완전 일치
  //   2) speaker + 정규화 텍스트 일치
  //   3) speaker 일치 + order_num 가장 가까운 것
  type Match = { bubble: typeof unlinked[0]; dialogue: typeof dlgList[0]; method: string }
  const matches: Match[] = []
  const noMatch: typeof unlinked[0][] = []

  const availableDlg = dlgList.filter(d => !usedDlgIds.has(d.id))

  for (const b of unlinked) {
    const bNorm = normalize(b.korean)

    // 방법 1: speaker + 완전 일치
    let found = availableDlg.find(d => d.speaker === b.speaker && d.text_ko === b.korean)
    if (found) { matches.push({ bubble: b, dialogue: found, method: '완전일치' }); usedDlgIds.add(found.id); continue }

    // 방법 2: speaker + 정규화 일치
    found = availableDlg.find(d => d.speaker === b.speaker && normalize(d.text_ko) === bNorm)
    if (found) { matches.push({ bubble: b, dialogue: found, method: '정규화일치' }); usedDlgIds.add(found.id); continue }

    // 방법 3: speaker + order_num 근접 (같은 speaker 중 order_num 차이 최소)
    const sameSpeaker = availableDlg.filter(d => d.speaker === b.speaker)
    if (sameSpeaker.length > 0) {
      sameSpeaker.sort((a, z) => Math.abs(a.order_num - b.order_num) - Math.abs(z.order_num - b.order_num))
      const candidate = sameSpeaker[0]
      const diff = Math.abs(candidate.order_num - b.order_num)
      if (diff <= 5) {
        matches.push({ bubble: b, dialogue: candidate, method: `근접(order차이=${diff})` })
        usedDlgIds.add(candidate.id)
        continue
      }
    }

    noMatch.push(b)
  }

  // 5. 결과 출력
  console.log(`\n=== 매칭 결과 ===`)
  console.log(`  매칭 성공: ${matches.length}개`)
  console.log(`  매칭 실패: ${noMatch.length}개\n`)

  for (const m of matches) {
    console.log(`  bubble id=${m.bubble.id} [${m.bubble.speaker}] "${m.bubble.korean}"`)
    console.log(`    → dlg id=${m.dialogue.id} "${m.dialogue.text_ko}"  (${m.method})`)
  }

  if (noMatch.length > 0) {
    console.log(`\n=== 매칭 실패 (수동 처리 필요) ===`)
    for (const b of noMatch) {
      console.log(`  bubble id=${b.id} [${b.speaker}] "${b.korean}"`)
    }
  }

  if (!APPLY) {
    console.log('\n──── DRY RUN ────')
    console.log(`적용: npx tsx scripts/link-ep-dialogues.ts ${EP_NUM} --apply`)
    return
  }

  // 6. DB 업데이트
  console.log('\n──── DB 업데이트 ────')
  let ok = 0, fail = 0
  for (const m of matches) {
    const { error } = await sb
      .from('kp_bubbles')
      .update({ dialogue_id: m.dialogue.id })
      .eq('id', m.bubble.id)
    if (error) { console.error(`  ❌ bubble id=${m.bubble.id}: ${error.message}`); fail++ }
    else { console.log(`  ✅ bubble id=${m.bubble.id} → dlg id=${m.dialogue.id}`); ok++ }
  }
  console.log(`\n완료: ✅ ${ok}건 / ❌ ${fail}건`)
}
main().catch(console.error)
