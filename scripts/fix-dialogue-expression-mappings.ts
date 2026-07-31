import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
)

async function getEpId(epNum: number) {
  const { data } = await sb.from('kp_episodes').select('id').eq('episode_num', epNum).single()
  return data!.id as number
}

async function findDialogue(epId: number, textLike: string) {
  const { data } = await sb
    .from('kp_dialogues')
    .select('id, text_ko, speaker')
    .eq('episode_id', epId)
    .ilike('text_ko', `%${textLike}%`)
  return data ?? []
}

async function findExpression(koreanLike: string) {
  const { data } = await sb
    .from('kp_expressions')
    .select('id, korean')
    .ilike('korean', `%${koreanLike}%`)
  return data ?? []
}

async function main() {
  // ── Fix 1: EP07 ~깎아 주세요 ─────────────────────────────────────────
  // 현재: matched_text="조금만 더 주세요!" → 잘못됨
  // 수정: matched_text="좀 깎아 주세요" + dialogue_id = 실제 깎아주세요 대사
  const ep7Id = await getEpId(7)
  const kkaDialog = await findDialogue(ep7Id, '깎아')
  const kkaExpr = await findExpression('깎아')
  console.log('EP07 깎아 대화:', kkaDialog)
  console.log('EP07 깎아 표현:', kkaExpr)

  if (kkaDialog.length && kkaExpr.length) {
    // kp_dialogue_expressions에서 잘못된 레코드 찾기
    // expression_id = 깎아표현 id, matched_text = "조금만 더 주세요!"
    const wrongExprId = kkaExpr[0].id
    const { data: wrongRec } = await sb
      .from('kp_dialogue_expressions')
      .select('id, dialogue_id, matched_text')
      .eq('expression_id', wrongExprId)
      .eq('role', 'focus')
    console.log('EP07 깎아 잘못된 레코드:', wrongRec)

    if (wrongRec?.length) {
      const { error } = await sb
        .from('kp_dialogue_expressions')
        .update({
          dialogue_id: kkaDialog[0].id,
          matched_text: kkaDialog[0].text_ko,
        })
        .eq('id', wrongRec[0].id)
      console.log('EP07 깎아 수정:', error ? `에러: ${error.message}` : '완료')
    }
  }

  // ── Fix 2: EP05 ~해 본 적 있어요? ───────────────────────────────────
  // 현재: matched_text="뭐가 맛있어요?" → 잘못됨
  // 수정: matched_text="삼겹살 먹어 본 적 있어요?" + 실제 dialogue_id
  const ep5Id = await getEpId(5)
  const bonjeokDialog = await findDialogue(ep5Id, '본 적')
  const bonjeokExpr = await findExpression('본 적')
  console.log('\nEP05 본 적 대화:', bonjeokDialog)
  console.log('EP05 본 적 표현:', bonjeokExpr)

  if (bonjeokDialog.length && bonjeokExpr.length) {
    const wrongExprId = bonjeokExpr[0].id
    const { data: wrongRec } = await sb
      .from('kp_dialogue_expressions')
      .select('id, dialogue_id, matched_text')
      .eq('expression_id', wrongExprId)
      .eq('role', 'focus')
    console.log('EP05 본 적 잘못된 레코드:', wrongRec)

    if (wrongRec?.length) {
      const { error } = await sb
        .from('kp_dialogue_expressions')
        .update({
          dialogue_id: bonjeokDialog[0].id,
          matched_text: bonjeokDialog[0].text_ko,
        })
        .eq('id', wrongRec[0].id)
      console.log('EP05 본 적 수정:', error ? `에러: ${error.message}` : '완료')
    }
  }

  // ── Fix 3: EP08 ~써봤어요? ───────────────────────────────────────────
  // 현재: matched_text="여기 진짜 좋아! K-뷰티 최고야!" → 잘못됨
  // 수정: matched_text="이거 써봤어요?" + 실제 dialogue_id
  const ep8Id = await getEpId(8)
  const sseoDialog = await findDialogue(ep8Id, '써봤어')
  const sseoExpr = await findExpression('써봤어')
  console.log('\nEP08 써봤어 대화:', sseoDialog)
  console.log('EP08 써봤어 표현:', sseoExpr)

  if (sseoDialog.length && sseoExpr.length) {
    const wrongExprId = sseoExpr[0].id
    const { data: wrongRec } = await sb
      .from('kp_dialogue_expressions')
      .select('id, dialogue_id, matched_text')
      .eq('expression_id', wrongExprId)
      .eq('role', 'focus')
    console.log('EP08 써봤어 잘못된 레코드:', wrongRec)

    if (wrongRec?.length) {
      const { error } = await sb
        .from('kp_dialogue_expressions')
        .update({
          dialogue_id: sseoDialog[0].id,
          matched_text: sseoDialog[0].text_ko,
        })
        .eq('id', wrongRec[0].id)
      console.log('EP08 써봤어 수정:', error ? `에러: ${error.message}` : '완료')
    }
  }

  console.log('\n=== 수정 완료 ===')
}

main().catch(console.error)
