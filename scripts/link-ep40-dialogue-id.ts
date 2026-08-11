/**
 * EP40 kp_bubbles.dialogue_id 연결
 *   bubble 3703 → dialogue_id=11352 (나라마다 달라서 → 달라요. 그게 재미있어요.)
 *   bubble 3699 → dialogue_id=11348 (처음엔 다 낯설었는데…)
 *
 * dialogue_id 연결 후 fetch-episode.ts가 자동으로
 *   korean       = kp_dialogues.text_ko
 *   highlight_text = kp_dialogue_expressions.matched_text
 * 를 사용하게 됨. kp_bubbles.position(위치) 건드리지 않음.
 *
 * --dry : 실행 없이 계획 출력
 * npx tsx scripts/link-ep40-dialogue-id.ts --dry
 * npx tsx scripts/link-ep40-dialogue-id.ts
 */
import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const DRY = process.argv.includes('--dry')

const LINKS = [
  { bubbleId: 3703, dialogueId: 11352, label: '나라마다 달라요. 그게 재미있어요.' },
  { bubbleId: 3699, dialogueId: 11348, label: '처음엔 다 낯설었는데…' },
]

async function main() {
  console.log(`\nEP40 dialogue_id 연결${DRY ? ' [DRY]' : ''}\n`)

  for (const lk of LINKS) {
    // 수정 전 확인
    const { data: before } = await sb.from('kp_bubbles')
      .select('id, korean, highlight_text, dialogue_id, position')
      .eq('id', lk.bubbleId)
      .single()
    const pos = (before?.position as Record<string,unknown>) ?? {}
    console.log(`bubble id=${lk.bubbleId} → dialogue_id=${lk.dialogueId}`)
    console.log(`  korean:         "${before?.korean}"`)
    console.log(`  highlight_text: "${before?.highlight_text}"`)
    console.log(`  dialogue_id:    ${before?.dialogue_id ?? 'NULL'} → ${lk.dialogueId}`)
    console.log(`  position:       widthPct=${pos.widthPct} xPct=${pos.xPct} yPct=${pos.yPct} bubbleKey=${pos.bubbleKey} lines=${pos.lines}`)

    // 연결 대상 kp_dialogues 확인
    const { data: dlg } = await sb.from('kp_dialogues').select('id, text_ko, audio_url').eq('id', lk.dialogueId).single()
    const { data: de } = await sb.from('kp_dialogue_expressions').select('matched_text').eq('dialogue_id', lk.dialogueId).eq('role', 'focus').maybeSingle()
    console.log(`  → kp_dialogues text_ko:  "${dlg?.text_ko}"`)
    console.log(`  → DE matched_text:       "${de?.matched_text}"`)

    if (!DRY) {
      const { error } = await sb.from('kp_bubbles')
        .update({ dialogue_id: lk.dialogueId })
        .eq('id', lk.bubbleId)
      if (error) {
        console.error(`  ✗ 실패: ${error.message}`)
        return
      }
      console.log(`  ✓ 연결 완료`)
    } else {
      console.log(`  [DRY] 실행하면 dialogue_id → ${lk.dialogueId}`)
    }
    console.log()
  }

  // 연결 후 position 재확인
  if (!DRY) {
    console.log('── 연결 후 position 보존 확인 ──')
    for (const lk of LINKS) {
      const { data: after } = await sb.from('kp_bubbles')
        .select('id, dialogue_id, position')
        .eq('id', lk.bubbleId)
        .single()
      const pos = (after?.position as Record<string,unknown>) ?? {}
      console.log(`bubble id=${lk.bubbleId}: dialogue_id=${after?.dialogue_id}  widthPct=${pos.widthPct} xPct=${pos.xPct} yPct=${pos.yPct} bubbleKey=${pos.bubbleKey} lines=${pos.lines}`)
    }
  }

  console.log('\n✓ 완료')
}
main().catch(console.error)
