/**
 * _link-ep01-30-bubbles.ts
 * EP01-30 kp_bubbles.dialogue_id 연결 (현재 null)
 *
 * 매칭 전략: bubble.korean == dialogue.text_ko (에피소드 내)
 * 중복 텍스트: 같은 텍스트가 여러 dialogue에 있으면 첫 번째 미매칭 dialogue 사용.
 *
 * --dry-run : 변경 예정 출력만
 * --ep 1    : 특정 EP만 (기본: 1-30)
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const args = process.argv.slice(2)
const dryRun  = args.includes('--dry-run')
const epIndex = args.indexOf('--ep')
let epNums = epIndex >= 0 && args[epIndex + 1]
  ? [parseInt(args[epIndex + 1])]
  : Array.from({ length: 30 }, (_, i) => i + 1)

async function main() {
  console.log(`\n[link-ep01-30] ${dryRun ? '🔍 dry-run' : '✏ 적용'} — EP: ${epNums.join(', ')}\n`)

  let totalLinked = 0, totalUnmatched = 0

  for (const epNum of epNums) {
    // episode_id
    const { data: ep } = await supabase.from('kp_episodes').select('id').eq('episode_num', epNum).single()
    if (!ep) { console.log(`EP${epNum}: DB 없음`); continue }
    const epId = ep.id

    // null dialogue_id인 bubble
    const { data: nullBubbles } = await supabase
      .from('kp_bubbles').select('id, korean').eq('episode_id', epId).is('dialogue_id', null)
    if (!nullBubbles?.length) { console.log(`EP${String(epNum).padStart(2,'0')}: null bubble 없음 ✓`); continue }

    // dialogues for this episode
    const { data: dialogues } = await supabase
      .from('kp_dialogues').select('id, text_ko').eq('episode_id', epId).order('id')
    if (!dialogues?.length) { console.log(`EP${String(epNum).padStart(2,'0')}: dialogue 없음`); continue }

    // dialogue_id 역매핑: text_ko → 아직 안 쓴 dialogue id 목록
    const availableByText = new Map<string, number[]>()
    for (const d of dialogues) {
      if (!availableByText.has(d.text_ko)) availableByText.set(d.text_ko, [])
      availableByText.get(d.text_ko)!.push(d.id)
    }

    const updates: { bubbleId: number; dialogueId: number; text: string }[] = []
    const unmatched: { bubbleId: number; text: string }[] = []

    for (const b of nullBubbles) {
      const candidates = availableByText.get(b.korean)
      if (candidates?.length) {
        const dlgId = candidates.shift()! // 첫 번째 미사용 dialogue 사용
        updates.push({ bubbleId: b.id, dialogueId: dlgId, text: b.korean })
      } else {
        unmatched.push({ bubbleId: b.id, text: b.korean })
      }
    }

    if (dryRun) {
      console.log(`EP${String(epNum).padStart(2,'0')}: 연결 예정 ${updates.length}건 / 미매칭 ${unmatched.length}건`)
      for (const u of updates.slice(0, 3)) {
        console.log(`  bubble=${u.bubbleId} → dialogue=${u.dialogueId}  "${u.text}"`)
      }
      if (updates.length > 3) console.log(`  ... 외 ${updates.length - 3}건`)
      for (const u of unmatched) console.log(`  ⚠ 미매칭: bubble=${u.bubbleId} "${u.text}"`)
    } else {
      // 일괄 업데이트
      for (const u of updates) {
        const { error } = await supabase.from('kp_bubbles').update({ dialogue_id: u.dialogueId }).eq('id', u.bubbleId)
        if (error) console.error(`  ✗ bubble=${u.bubbleId}:`, error.message)
      }
      for (const u of unmatched) console.warn(`  ⚠ 미매칭: bubble=${u.bubbleId} "${u.text}"`)
      console.log(`EP${String(epNum).padStart(2,'0')}: 연결 ${updates.length}건 완료 / 미매칭 ${unmatched.length}건`)
      totalLinked += updates.length
    }
    totalUnmatched += unmatched.length
  }

  if (!dryRun) {
    console.log(`\n총 연결: ${totalLinked}건  미매칭: ${totalUnmatched}건`)
  }
}

main().catch(console.error)
