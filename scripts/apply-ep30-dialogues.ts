/**
 * EP30 A안: kp_dialogues 텍스트를 kp_bubbles에 덮어쓰고 dialogue_id 연결
 *
 * 매핑 전략: 화자 그룹별 순차 매핑
 *   - jisu bubble[0,1,2...] → jisu dialogue[0,1,2...] (id 오름차순)
 *   - emma bubble[0,1,2...] → emma dialogue[0,1,2...] (id 오름차순)
 *
 * 실행: npx tsx scripts/apply-ep30-dialogues.ts
 * 적용: npx tsx scripts/apply-ep30-dialogues.ts --apply
 */
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const APPLY = process.argv.includes('--apply')

type Bubble   = { id: number; speaker: string; korean: string; dialogue_id: number | null }
type Dialogue = { id: number; speaker: string; text_ko: string }

async function main() {
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 30).single()
  if (!ep) { console.error('EP30 없음'); process.exit(1) }
  const epId = ep.id as number

  const [{ data: bRaw }, { data: dRaw }] = await Promise.all([
    sb.from('kp_bubbles').select('id, speaker, korean, dialogue_id')
      .eq('episode_id', epId).order('id'),
    sb.from('kp_dialogues').select('id, speaker, text_ko')
      .eq('episode_id', epId).order('id'),
  ])

  const bubbles   = (bRaw  ?? []) as Bubble[]
  const dialogues = (dRaw  ?? []) as Dialogue[]

  console.log(`\nEP30  bubbles=${bubbles.length}  dialogues=${dialogues.length}`)

  // 화자 그룹별 분리
  const speakers = [...new Set(bubbles.map(b => b.speaker))]
  const mapping: { bubble: Bubble; dialogue: Dialogue; speakerMatch: boolean }[] = []

  for (const spk of speakers) {
    const bGroup = bubbles.filter(b => b.speaker === spk)    // id 순 유지
    const dGroup = dialogues.filter(d => d.speaker === spk)  // id 순 유지

    if (bGroup.length !== dGroup.length) {
      console.warn(`⚠️  ${spk}: bubble ${bGroup.length}개 ≠ dialogue ${dGroup.length}개 — 수 불일치!`)
    }

    const len = Math.min(bGroup.length, dGroup.length)
    for (let i = 0; i < len; i++) {
      mapping.push({
        bubble: bGroup[i],
        dialogue: dGroup[i],
        speakerMatch: bGroup[i].speaker === dGroup[i].speaker,
      })
    }
    // 남은 것 경고
    if (bGroup.length > dGroup.length) {
      for (let i = len; i < bGroup.length; i++) {
        console.warn(`  ⚠️  매핑 없음: bubble id=${bGroup[i].id} [${spk}] "${bGroup[i].korean}"`)
      }
    }
  }

  // 정렬: bubble.id 순으로 보기 편하게
  mapping.sort((a, b) => a.bubble.id - b.bubble.id)

  console.log(`\n=== 매핑 계획 (${mapping.length}건) ===\n`)
  for (const m of mapping) {
    const icon = m.speakerMatch ? '✅' : '⚠️'
    console.log(`${icon} bubble id=${m.bubble.id} [${m.bubble.speaker}]`)
    console.log(`   전: "${m.bubble.korean}"`)
    console.log(`   후: "${m.dialogue.text_ko}"  (dlg id=${m.dialogue.id})`)
  }

  const mismatched = mapping.filter(m => !m.speakerMatch)
  if (mismatched.length) {
    console.log(`\n⚠️  화자 불일치 ${mismatched.length}건 — 텍스트는 교체되지만 bubble.speaker는 유지됩니다.`)
  }

  if (!APPLY) {
    console.log('\n──── DRY RUN ────')
    console.log('적용: npx tsx scripts/apply-ep30-dialogues.ts --apply')
    return
  }

  console.log('\n──── DB 적용 ────')
  let ok = 0, fail = 0
  for (const m of mapping) {
    const { error } = await sb
      .from('kp_bubbles')
      .update({ korean: m.dialogue.text_ko, dialogue_id: m.dialogue.id })
      .eq('id', m.bubble.id)
    if (error) {
      console.error(`  ❌ bubble id=${m.bubble.id}: ${error.message}`)
      fail++
    } else {
      console.log(`  ✅ bubble id=${m.bubble.id} → "${m.dialogue.text_ko}"`)
      ok++
    }
  }
  console.log(`\n완료: ✅ ${ok}건 / ❌ ${fail}건`)

  // 적용 후 확인
  console.log('\n=== 적용 후 EP30 bubbles ===')
  const { data: after } = await sb
    .from('kp_bubbles').select('id, speaker, korean, dialogue_id')
    .eq('episode_id', epId).order('id')
  for (const b of (after ?? []) as Bubble[]) {
    const tag = b.dialogue_id != null ? `dlg=${b.dialogue_id}` : 'NULL'
    console.log(`  id=${b.id} [${b.speaker}] (${tag}) "${b.korean}"`)
  }
}
main().catch(console.error)
