/**
 * EP11~30: kp_bubbles.korean vs kp_dialogues.text_ko 불일치 조회
 * dialogue_id가 연결된 bubble만 비교
 */
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // 1. EP11~30 episode_id 목록
  const { data: eps } = await sb
    .from('kp_episodes')
    .select('id, episode_num')
    .gte('episode_num', 11).lte('episode_num', 30)
    .order('episode_num')
  if (!eps?.length) { console.error('에피소드 없음'); return }

  const epMap = new Map(eps.map(e => [e.id as number, e.episode_num as number]))
  const epIds = eps.map(e => e.id as number)

  // 2. dialogue_id 연결된 bubbles 전체 조회
  const { data: bubbles } = await sb
    .from('kp_bubbles')
    .select('id, episode_id, speaker, korean, dialogue_id')
    .in('episode_id', epIds)
    .not('dialogue_id', 'is', null)
    .order('episode_id').order('id')

  const bubbleList = (bubbles ?? []) as {
    id: number; episode_id: number; speaker: string; korean: string; dialogue_id: number
  }[]

  if (!bubbleList.length) { console.log('연결된 bubble 없음'); return }

  // 3. 연결된 dialogue_id 목록으로 kp_dialogues 조회
  const dlgIds = [...new Set(bubbleList.map(b => b.dialogue_id))]
  const { data: dialogues } = await sb
    .from('kp_dialogues')
    .select('id, text_ko')
    .in('id', dlgIds)

  const dlgMap = new Map((dialogues ?? []).map(d => [d.id as number, d.text_ko as string]))

  // 4. 비교
  type Diff = { bubbleId: number; epNum: number; speaker: string; bubbleKo: string; dlgKo: string }
  const diffs: Diff[] = []
  let totalLinked = 0

  for (const b of bubbleList) {
    totalLinked++
    const dlgText = dlgMap.get(b.dialogue_id)
    if (dlgText == null) continue
    if (b.korean !== dlgText) {
      diffs.push({
        bubbleId: b.id,
        epNum: epMap.get(b.episode_id) ?? 0,
        speaker: b.speaker,
        bubbleKo: b.korean,
        dlgKo: dlgText,
      })
    }
  }

  // 5. 에피소드별 집계
  const byEp: Record<number, { total: number; diff: number }> = {}
  for (const b of bubbleList) {
    const epNum = epMap.get(b.episode_id) ?? 0
    if (!byEp[epNum]) byEp[epNum] = { total: 0, diff: 0 }
    byEp[epNum].total++
  }
  for (const d of diffs) {
    byEp[d.epNum].diff++
  }

  console.log(`\n=== EP11~30 bubble-dialogue 불일치 요약 ===`)
  console.log(`연결된 bubble 총 ${totalLinked}개 중 불일치 ${diffs.length}건\n`)
  console.log('EP    linked  diff  match%')
  for (const [epNum, v] of Object.entries(byEp).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    const pct = v.total > 0 ? Math.round((1 - v.diff / v.total) * 100) : 100
    const flag = v.diff > 0 ? ' ⚠️' : ' ✅'
    console.log(`EP${String(epNum).padEnd(3)} ${String(v.total).padEnd(7)} ${String(v.diff).padEnd(5)} ${pct}%${flag}`)
  }

  if (diffs.length === 0) {
    console.log('\n✅ 모든 연결된 bubble이 dialogue와 일치합니다.')
    return
  }

  // 6. 샘플: 에피소드별 첫 2건씩
  console.log(`\n=== 불일치 샘플 (에피소드별 최대 2건) ===\n`)
  const shown: Record<number, number> = {}
  for (const d of diffs) {
    if ((shown[d.epNum] ?? 0) >= 2) continue
    shown[d.epNum] = (shown[d.epNum] ?? 0) + 1
    console.log(`EP${d.epNum} bubble id=${d.bubbleId} [${d.speaker}]`)
    console.log(`  bubble.korean: "${d.bubbleKo}"`)
    console.log(`  dialogue.text: "${d.dlgKo}"`)
  }

  // 7. 판단 힌트: 어느 쪽이 더 최신?
  console.log(`\n=== 버전 판단 힌트 ===`)
  // bubble쪽에 존댓말이 많은지 반말이 많은지
  const JONDAEMAL = /(?:요|죠|이에요|예요|세요|습니다)[!?.,]?\s*$/
  let bubbleJondae = 0, dlgJondae = 0
  for (const d of diffs) {
    if (JONDAEMAL.test(d.bubbleKo)) bubbleJondae++
    if (JONDAEMAL.test(d.dlgKo)) dlgJondae++
  }
  console.log(`불일치 ${diffs.length}건 중:`)
  console.log(`  bubble.korean 존댓말 종결: ${bubbleJondae}건`)
  console.log(`  dialogue.text_ko 존댓말 종결: ${dlgJondae}건`)
  console.log(`  → 말투 수정 후 더 많이 존댓말인 쪽이 더 최신`)
  console.log(`  → bubble 존댓말이 많으면 bubble이 구버전(jisu가 존댓말 시절)`)
  console.log(`  → dialogue 존댓말이 적으면 dialogue가 최신(반말 수정 반영)`)
}
main().catch(console.error)
