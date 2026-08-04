/**
 * kp_dialogue_expressions.matched_text가 현재 kp_dialogues.text_ko에
 * 실제로 포함되는지 전수 확인
 *
 * 실행: npx tsx scripts/check-expression-match.ts
 */
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { fetchAllDialogues } from './_db-utils'
dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // kp_dialogue_expressions 전체 (dialogue_id + matched_text)
  const { data: exprs, error: e1 } = await sb
    .from('kp_dialogue_expressions')
    .select('id, dialogue_id, matched_text, expression_id')
    .order('dialogue_id')

  if (e1 || !exprs?.length) {
    console.error('kp_dialogue_expressions 조회 실패:', e1?.message)
    return
  }
  console.log(`kp_dialogue_expressions: 총 ${exprs.length}건`)

  // kp_dialogues 전체 (id + text_ko + episode_id) — 페이지네이션으로 EP99/100 포함
  const dlgs = await fetchAllDialogues(sb, 'id, text_ko, episode_id, speaker')
  if (!dlgs.length) {
    console.error('kp_dialogues 조회 실패 또는 데이터 없음')
    return
  }

  const dlgMap = new Map(dlgs.map((d: any) => [d.id as number, d as any]))

  // 에피소드 번호 맵
  const { data: eps } = await sb.from('kp_episodes').select('id, episode_num')
  const epNumMap = new Map((eps ?? []).map((e: any) => [e.id as number, e.episode_num as number]))

  // 전수 확인
  const mismatches: {
    expr_id: number
    dialogue_id: number
    ep: number
    speaker: string
    text_ko: string
    matched_text: string
  }[] = []

  for (const expr of exprs as any[]) {
    const dlg = dlgMap.get(expr.dialogue_id)
    if (!dlg) {
      // dialogue 자체가 없는 경우 (고아 expression)
      mismatches.push({
        expr_id: expr.id,
        dialogue_id: expr.dialogue_id,
        ep: -1,
        speaker: '?',
        text_ko: '(dialogue 없음)',
        matched_text: expr.matched_text,
      })
      continue
    }

    const textKo: string = dlg.text_ko ?? ''
    const matchedText: string = expr.matched_text ?? ''

    if (!textKo.includes(matchedText)) {
      const epNum = epNumMap.get(dlg.episode_id) ?? 0
      mismatches.push({
        expr_id: expr.id,
        dialogue_id: expr.dialogue_id,
        ep: epNum,
        speaker: dlg.speaker,
        text_ko: textKo,
        matched_text: matchedText,
      })
    }
  }

  if (!mismatches.length) {
    console.log('\n✅ 모든 matched_text가 text_ko 안에 존재합니다.')
    return
  }

  console.log(`\n⚠️  매칭 실패: ${mismatches.length}건 (하이라이트 안 될 수 있음)\n`)

  // 에피소드별 집계
  const byEp: Record<number, number> = {}
  for (const m of mismatches) {
    byEp[m.ep] = (byEp[m.ep] ?? 0) + 1
  }
  console.log('에피소드별:')
  for (const [ep, cnt] of Object.entries(byEp).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    const label = Number(ep) === -1 ? '(고아)' : `EP${String(ep).padStart(2, '0')}`
    console.log(`  ${label}: ${cnt}건`)
  }

  console.log('\n상세 목록:')
  for (const m of mismatches) {
    const label = m.ep === -1 ? '(고아)' : `EP${String(m.ep).padStart(2, '0')}`
    console.log(`  [expr#${m.expr_id}] ${label} [${m.speaker}] dlg#${m.dialogue_id}`)
    console.log(`    text_ko    : "${m.text_ko}"`)
    console.log(`    matched_text: "${m.matched_text}"`)
  }
}

main().catch(console.error)
