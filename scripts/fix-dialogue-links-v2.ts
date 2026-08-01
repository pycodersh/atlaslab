/**
 * EP33 / EP54 / EP61 대사 수정 + 패턴 재연결
 *
 * EP33: kp_dialogues id=7539  한국 친구 사귀고 싶었어요. → 한국 친구를 사귀고 싶었어요.
 * EP54: kp_dialogues id=7750  응! 가르쳐줄 수 있어?     → 응! 가르쳐 줄 수 있어?
 * EP61: kp_dialogue_expressions expression_id=1261 / dialogue_id=7826 삭제
 *       kp_dialogues id=7826  맞아요, 사실 나도 그랬어요. → 맞아요. 저도 그렇게 생각했어요.
 *       kp_dialogue_expressions (1261, 7826, focus) 재연결
 *
 * 실행: npx tsx scripts/fix-dialogue-links-v2.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // ── EP33: 조사 '를' 추가 ──────────────────────────────────────────────────
  console.log('── EP33 대사 수정 ──')
  {
    const { data: before } = await sb.from('kp_dialogues').select('id, text_ko').eq('id', 7539).single()
    console.log(`  Before: id=7539 "${(before as any)?.text_ko}"`)

    const { error } = await sb.from('kp_dialogues')
      .update({ text_ko: '한국 친구를 사귀고 싶었어요.' })
      .eq('id', 7539)
    if (error) { console.error(`  ❌ ${error.message}`); } else { console.log('  ✅ 수정 완료: "한국 친구를 사귀고 싶었어요."') }
  }

  // ── EP54: 띄어쓰기 수정 ──────────────────────────────────────────────────
  console.log('\n── EP54 대사 수정 ──')
  {
    const { data: before } = await sb.from('kp_dialogues').select('id, text_ko').eq('id', 7750).single()
    console.log(`  Before: id=7750 "${(before as any)?.text_ko}"`)

    const { error } = await sb.from('kp_dialogues')
      .update({ text_ko: '응! 가르쳐 줄 수 있어?' })
      .eq('id', 7750)
    if (error) { console.error(`  ❌ ${error.message}`); } else { console.log('  ✅ 수정 완료: "응! 가르쳐 줄 수 있어?"') }
  }

  // ── EP61: 잘못된 연결 삭제 → 대사 수정 → 재연결 ────────────────────────
  console.log('\n── EP61 처리 ──')
  {
    const EXPR_ID = 1261
    const DIAL_ID = 7826

    // 1. 기존 연결 삭제
    const { error: delErr } = await sb.from('kp_dialogue_expressions')
      .delete()
      .eq('expression_id', EXPR_ID)
      .eq('dialogue_id', DIAL_ID)
      .eq('role', 'focus')
    if (delErr) { console.error(`  ❌ 연결 삭제 실패: ${delErr.message}`) }
    else { console.log(`  ✅ 연결 삭제: expr=${EXPR_ID} / dial=${DIAL_ID}`) }

    // 2. 대사 수정
    const { data: before } = await sb.from('kp_dialogues').select('id, text_ko').eq('id', DIAL_ID).single()
    console.log(`  Before: id=${DIAL_ID} "${(before as any)?.text_ko}"`)

    const { error: updErr } = await sb.from('kp_dialogues')
      .update({ text_ko: '맞아요. 저도 그렇게 생각했어요.' })
      .eq('id', DIAL_ID)
    if (updErr) { console.error(`  ❌ 대사 수정 실패: ${updErr.message}`) }
    else { console.log('  ✅ 대사 수정: "맞아요. 저도 그렇게 생각했어요."') }

    // 3. 재연결
    const { error: insErr } = await sb.from('kp_dialogue_expressions')
      .insert({ dialogue_id: DIAL_ID, expression_id: EXPR_ID, role: 'focus' })
    if (insErr) { console.error(`  ❌ 재연결 실패: ${insErr.message}`) }
    else { console.log(`  ✅ 재연결 완료: expr=${EXPR_ID} → dial=${DIAL_ID}`) }
  }

  // ── 검증 ─────────────────────────────────────────────────────────────────
  console.log('\n── 검증 ──')
  const checks = [
    { id: 7539, expected: '한국 친구를 사귀고 싶었어요.' },
    { id: 7750, expected: '응! 가르쳐 줄 수 있어?' },
    { id: 7826, expected: '맞아요. 저도 그렇게 생각했어요.' },
  ]
  for (const { id, expected } of checks) {
    const { data } = await sb.from('kp_dialogues').select('text_ko').eq('id', id).single()
    const actual = (data as any)?.text_ko
    const ok = actual === expected
    console.log(`  [${ok ? '✅' : '❌'}] id=${id}: "${actual}"`)
  }

  // EP61 연결 확인
  const { data: link } = await sb.from('kp_dialogue_expressions')
    .select('id').eq('expression_id', 1261).eq('dialogue_id', 7826).eq('role', 'focus').maybeSingle()
  console.log(`  [${link ? '✅' : '❌'}] EP61 expr=1261 ↔ dial=7826 연결: ${link ? '존재' : '없음'}`)
}

main().catch(console.error)
