/**
 * 신규 패턴(1241~1293) kp_dialogue_expressions 재연결
 * 패턴의 korean 텍스트로 에피소드 내 대사를 찾아 focus role 연결
 * 의미 유사 대사에 연결 금지 — 패턴 핵심 어구가 포함된 대사에만 연결
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })

// 패턴에서 검색 키워드 추출: (으)ㄹ → 실제 형태 변환
function extractSearchTokens(korean: string): string[] {
  const cleaned = korean
    .replace(/^~/,'').replace(/~$/,'')
    .replace(/\(으\)ㄹ/g, '을 ')  // "(으)ㄹ" → 종성 있을 경우 '을'
    .replace(/\(이\)/g, '')
    .replace(/[()]/g, '')
    .trim()
  const tokens = cleaned.split(/[/\s]+/).filter(t => t.length >= 2)
  return tokens
}

async function main() {
  // 현재 연결된 expression_ids
  const { data: existing } = await sb.from('kp_dialogue_expressions')
    .select('expression_id, dialogue_id, role')
    .gte('expression_id', 1241).lte('expression_id', 1293)
  const linkedIds = new Set((existing ?? []).map((r: any) => r.expression_id))
  console.log(`현재 연결된 신규 패턴: ${linkedIds.size}건`)

  // 미연결 패턴 조회
  const { data: allNewExprs } = await sb.from('kp_expressions')
    .select('id, korean, english, first_episode')
    .gte('id', 1241).lte('id', 1293)
    .order('id')

  const missing = (allNewExprs ?? []).filter((e: any) => !linkedIds.has(e.id))
  console.log(`미연결 패턴: ${missing.length}건`)

  // 에피소드 맵
  const { data: epRows } = await sb.from('kp_episodes').select('id, episode_num').gte('episode_num', 1).lte('episode_num', 100)
  const epNumToId = new Map((epRows ?? []).map((e: any) => [e.episode_num as number, e.id as number]))

  let linked = 0, failed = 0
  const failList: string[] = []

  for (const expr of missing as any[]) {
    const epId = epNumToId.get(expr.first_episode)
    if (!epId) { failList.push(`[NO_EP] id=${expr.id} ${expr.korean}`); failed++; continue }

    // 에피소드 내 모든 대사 조회
    const { data: dials } = await sb.from('kp_dialogues')
      .select('id, text_ko')
      .eq('episode_id', epId)
      .order('id')

    const tokens = extractSearchTokens(expr.korean)
    if (tokens.length === 0) { failList.push(`[NO_TOKEN] id=${expr.id} ${expr.korean}`); failed++; continue }

    // 토큰 포함 대사 검색 (가장 많이 매칭되는 대사 선택)
    let bestDial: any = null
    let bestScore = 0
    for (const dial of (dials ?? []) as any[]) {
      const score = tokens.filter(t => dial.text_ko.includes(t)).length
      if (score > bestScore) { bestScore = score; bestDial = dial }
    }

    if (!bestDial || bestScore === 0) {
      failList.push(`[NOT_FOUND] id=${expr.id} EP${expr.first_episode} "${expr.korean}" tokens=[${tokens.join(',')}]`)
      failed++
      continue
    }

    // 이미 연결되어 있는지 확인
    const { data: dup } = await sb.from('kp_dialogue_expressions')
      .select('id')
      .eq('expression_id', expr.id)
      .eq('dialogue_id', bestDial.id)
      .eq('role', 'focus')
      .maybeSingle()
    if (dup) {
      console.log(`  SKIP (이미 연결): id=${expr.id} → dial=${bestDial.id}`)
      linked++
      continue
    }

    const { error } = await sb.from('kp_dialogue_expressions').insert({
      expression_id: expr.id,
      dialogue_id: bestDial.id,
      role: 'focus',
      matched_text: bestDial.text_ko,
    })

    if (error) {
      failList.push(`[INSERT_ERR] id=${expr.id}: ${error.message}`)
      failed++
    } else {
      console.log(`  ✅ id=${expr.id} EP${expr.first_episode} "${expr.korean}" → "${bestDial.text_ko}"`)
      linked++
    }
  }

  // ~(으)ㄹ 줄 몰랐어요는 EP81과 EP86 양쪽 연결
  const doubleLinkExpr = (allNewExprs ?? []).find((e: any) => e.korean.includes('줄 몰랐어요') || e.korean.includes('줄몰랐어요'))
  if (doubleLinkExpr) {
    for (const epNum of [81, 86]) {
      const epId = epNumToId.get(epNum)
      if (!epId) continue
      const { data: dials } = await sb.from('kp_dialogues').select('id, text_ko').eq('episode_id', epId).order('id')
      const tokens = extractSearchTokens(doubleLinkExpr.korean)
      let bestDial: any = null; let bestScore = 0
      for (const d of (dials ?? []) as any[]) {
        const score = tokens.filter((t: string) => d.text_ko.includes(t)).length
        if (score > bestScore) { bestScore = score; bestDial = d }
      }
      if (!bestDial || bestScore === 0) { console.log(`  [DOUBLE] EP${epNum} 매칭 실패`); continue }
      const { data: dup } = await sb.from('kp_dialogue_expressions').select('id')
        .eq('expression_id', doubleLinkExpr.id).eq('dialogue_id', bestDial.id).eq('role', 'focus').maybeSingle()
      if (!dup) {
        const { error } = await sb.from('kp_dialogue_expressions').insert({
          expression_id: doubleLinkExpr.id, dialogue_id: bestDial.id, role: 'focus', matched_text: bestDial.text_ko,
        })
        if (error) console.log(`  [DOUBLE] EP${epNum} INSERT 실패: ${error.message}`)
        else { console.log(`  ✅ [DOUBLE] EP${epNum} id=${doubleLinkExpr.id} → "${bestDial.text_ko}"`); linked++ }
      }
    }
  }

  console.log(`\n연결 성공: ${linked} / 실패: ${failed}`)
  if (failList.length > 0) {
    console.log('\n실패 목록:')
    failList.forEach(f => console.log('  ' + f))
  }

  // 최종 집계
  const { count: finalCnt } = await sb.from('kp_dialogue_expressions').select('*', { count: 'exact', head: true })
  const { count: newCnt } = await sb.from('kp_dialogue_expressions').select('*', { count: 'exact', head: true }).gte('expression_id', 1241).lte('expression_id', 1293)
  console.log(`\n최종 kp_dialogue_expressions: ${finalCnt}건`)
  console.log(`최종 신규 패턴(1241~1293) 연결: ${newCnt}건`)
}

main().catch(console.error)
