/**
 * EP40 하이라이트 2건 직접 수정 (sync 없음 — kp_bubbles.position 보존)
 *
 * 수정 1: "그래도 나라마다 달라서 재미있어요." 대사 변경 + matched_text
 *   kp_dialogues.id=11352  text_ko → "그래도 나라마다 달라요. 그게 재미있어요."
 *   kp_dialogue_expressions.id=5780  matched_text → "나라마다 달라요"
 *   audio_hash → NULL (재생성 대상 표시)
 *
 * 수정 2: "처음엔 다 낯설었는데…" matched_text만 변경
 *   kp_dialogue_expressions.id=5777  matched_text → "처음엔 다 낯설었는데"
 *
 * --dry : 실행 없이 계획만 출력
 * npx tsx scripts/fix-ep40-highlights.ts --dry
 * npx tsx scripts/fix-ep40-highlights.ts
 */
import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const DRY = process.argv.includes('--dry')
const tag = DRY ? ' [DRY]' : ''

async function main() {
  console.log(`\nEP40 하이라이트 직접 수정${tag}\n`)

  // ── 수정 전 상태 출력 ────────────────────────────────────────────
  const { data: before1 } = await sb.from('kp_dialogues').select('id, text_ko, audio_hash').eq('id', 11352).single()
  const { data: before1de } = await sb.from('kp_dialogue_expressions').select('id, matched_text').eq('id', 5780).single()
  const { data: before2de } = await sb.from('kp_dialogue_expressions').select('id, matched_text').eq('id', 5777).single()

  console.log('── 수정 전 ──')
  console.log(`  [수정1] dlg 11352: text_ko="${before1?.text_ko}"`)
  console.log(`          DE  5780:  matched_text="${before1de?.matched_text}"  audio_hash=${before1?.audio_hash}`)
  console.log(`  [수정2] DE  5777:  matched_text="${before2de?.matched_text}"`)

  if (!DRY) {
    // ── 수정 1-A: kp_dialogues.text_ko 변경 + audio_hash 초기화 ──────
    const { error: e1 } = await sb.from('kp_dialogues')
      .update({
        text_ko:    '그래도 나라마다 달라요. 그게 재미있어요.',
        audio_hash: null,          // 재생성 대상이 되도록 hash 초기화
      })
      .eq('id', 11352)
    if (e1) { console.error('  ✗ dlg update 실패:', e1.message); return }

    // ── 수정 1-B: kp_dialogue_expressions.matched_text ──────────────
    const { error: e2 } = await sb.from('kp_dialogue_expressions')
      .update({ matched_text: '나라마다 달라요' })
      .eq('id', 5780)
    if (e2) { console.error('  ✗ DE 5780 update 실패:', e2.message); return }

    // ── 수정 2: kp_dialogue_expressions.matched_text ─────────────────
    const { error: e3 } = await sb.from('kp_dialogue_expressions')
      .update({ matched_text: '처음엔 다 낯설었는데' })
      .eq('id', 5777)
    if (e3) { console.error('  ✗ DE 5777 update 실패:', e3.message); return }
  }

  // ── 수정 후 상태 출력 ────────────────────────────────────────────
  if (!DRY) {
    const { data: after1 } = await sb.from('kp_dialogues').select('id, text_ko, audio_hash').eq('id', 11352).single()
    const { data: after1de } = await sb.from('kp_dialogue_expressions').select('id, matched_text').eq('id', 5780).single()
    const { data: after2de } = await sb.from('kp_dialogue_expressions').select('id, matched_text').eq('id', 5777).single()

    console.log('\n── 수정 후 ──')
    console.log(`  [수정1] dlg 11352: text_ko="${after1?.text_ko}"`)
    console.log(`          DE  5780:  matched_text="${after1de?.matched_text}"  audio_hash=${after1?.audio_hash ?? 'NULL'}`)
    console.log(`  [수정2] DE  5777:  matched_text="${after2de?.matched_text}"`)

    // kp_bubbles 위치 정보 보존 확인
    const { data: bubbles } = await sb.from('kp_bubbles')
      .select('id, position')
      .eq('dialogue_id', 11352)
    console.log(`\n── kp_bubbles 위치 보존 확인 (dialogue_id=11352) ──`)
    for (const b of (bubbles ?? [])) {
      const pos = b.position as Record<string, unknown> ?? {}
      console.log(`  id=${b.id} widthPct=${pos.widthPct} xPct=${pos.xPct} yPct=${pos.yPct} bubbleKey=${pos.bubbleKey} lines=${pos.lines}`)
    }
  } else {
    console.log('\n[DRY] 실행 시 변경 예정:')
    console.log('  kp_dialogues id=11352: text_ko → "그래도 나라마다 달라요. 그게 재미있어요." / audio_hash → NULL')
    console.log('  kp_dialogue_expressions id=5780: matched_text → "나라마다 달라요"')
    console.log('  kp_dialogue_expressions id=5777: matched_text → "처음엔 다 낯설었는데"')
  }

  console.log('\n✓ 완료')
}
main().catch(console.error)
