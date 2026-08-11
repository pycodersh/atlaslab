/**
 * EP13·EP25 hightlight 수정 (DE matched_text + 해당 버블 dialogue_id 연결)
 *
 * EP13 DE5669: "뭐 해?" → "에 뭐 해?"
 * EP25 DE5717: "가 봤어요?" → "에 가 봤어요?"
 *
 * 전 화 dialogue_id=NULL이므로:
 *   1) kp_dialogue_expressions.matched_text 수정
 *   2) 해당 버블의 dialogue_id 연결 → 화면 반영
 *
 * --dry: 계획만 출력
 * npx tsx scripts/fix-ep13-ep25-highlights.ts --dry
 * npx tsx scripts/fix-ep13-ep25-highlights.ts
 */
import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
const DRY = process.argv.includes('--dry')

const TARGETS = [
  { deId: 5669, epNum: 13, newMt: '에 뭐 해?',      matchKorean: '뭐 해?' },
  { deId: 5717, epNum: 25, newMt: '에 가 봤어요?',   matchKorean: '가 봤어요?' },
]

async function main() {
  console.log(`\nEP13·EP25 하이라이트 수정${DRY ? ' [DRY]' : ''}\n`)

  for (const t of TARGETS) {
    // DE 현재값
    const { data: de } = await sb.from('kp_dialogue_expressions')
      .select('id, dialogue_id, matched_text')
      .eq('id', t.deId).single()
    const dlgId = de?.dialogue_id as number

    // kp_dialogues 대사 확인
    const { data: dlg } = await sb.from('kp_dialogues')
      .select('id, text_ko, episode_id, speaker')
      .eq('id', dlgId).single()

    // EP 버블에서 현재 highlight_text 로 해당 버블 찾기
    const { data: bubbles } = await sb.from('kp_bubbles')
      .select('id, korean, highlight_text, dialogue_id, position')
      .eq('episode_id', t.epNum)
    const bubble = (bubbles ?? []).find(b =>
      String(b.highlight_text ?? '') === t.matchKorean ||
      String(b.korean ?? '').includes(t.matchKorean.replace(/\?$/, ''))
    )

    console.log(`── EP${t.epNum} DE${t.deId} ──`)
    console.log(`  DE: dialogue_id=${dlgId}  matched_text="${de?.matched_text}" → "${t.newMt}"`)
    console.log(`  dlg: id=${dlgId} [${dlg?.speaker}] "${dlg?.text_ko}"`)
    if (bubble) {
      const pos = (bubble.position as Record<string,unknown>) ?? {}
      console.log(`  bubble id=${bubble.id}: hl="${bubble.highlight_text}" dlg=${bubble.dialogue_id ?? 'NULL'}`)
      console.log(`         position: widthPct=${pos.widthPct} xPct=${pos.xPct} yPct=${pos.yPct} bubbleKey=${pos.bubbleKey} lines=${pos.lines}`)
    } else {
      console.log(`  ⚠ 버블 매칭 없음 — highlight_text="${t.matchKorean}"인 버블 탐색`)
      for (const b of (bubbles ?? [])) {
        if (b.highlight_text) console.log(`    candidate: id=${b.id} hl="${b.highlight_text}" ko="${String(b.korean).slice(0,40)}"`)
      }
    }

    if (!DRY) {
      // 1) DE matched_text 수정
      const { error: e1 } = await sb.from('kp_dialogue_expressions')
        .update({ matched_text: t.newMt })
        .eq('id', t.deId)
      if (e1) { console.error('  ✗ DE 수정 실패:', e1.message); continue }
      console.log(`  ✓ DE${t.deId} matched_text → "${t.newMt}"`)

      // 2) 버블에 dialogue_id 연결
      if (bubble) {
        const { error: e2 } = await sb.from('kp_bubbles')
          .update({ dialogue_id: dlgId })
          .eq('id', bubble.id)
        if (e2) { console.error('  ✗ 버블 dialogue_id 연결 실패:', e2.message); continue }

        // position 보존 확인
        const { data: after } = await sb.from('kp_bubbles')
          .select('id, dialogue_id, position').eq('id', bubble.id).single()
        const pos = (after?.position as Record<string,unknown>) ?? {}
        console.log(`  ✓ bubble${bubble.id} dialogue_id → ${dlgId}`)
        console.log(`    position 보존: widthPct=${pos.widthPct} xPct=${pos.xPct} yPct=${pos.yPct} bubbleKey=${pos.bubbleKey} lines=${pos.lines}`)
      } else {
        console.log('  ⚠ 버블 연결 건너뜀 — 수동 확인 필요')
      }
    }
    console.log()
  }
  console.log('✓ 완료')
}
main().catch(console.error)
