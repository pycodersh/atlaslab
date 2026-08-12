/**
 * 134건 재분류: "표현 핵심부의 앞부분 단어가 대사에는 있는데 matched_text에는 빠진" 케이스 추출
 *
 * 제외 조건:
 *   - expr_core가 어미로 시작 (으/아/어/겠/ㄴ/는/ㄹ/고 등)
 *   - expr_core에 슬래시(/) 포함 → 슬래시 선택 패턴
 *   - expr_core에 ~ 포함 → 물결 자리 채움 패턴
 *   - matched_text가 반말 변형 (존댓말 어미 제거)
 *
 * 검출 기준:
 *   expr_core를 띄어쓰기로 분리 → 앞 토큰이 독립 단어(조사 아님)인 경우
 *   AND text_ko에 그 단어가 있는데 matched_text 앞에 없으면 → 앞부분 빠짐
 *
 * npx tsx scripts/scan-missing-prefix.ts
 */
import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

/** 어미/조사로만 구성된 토큰이면 true */
function isGrammarOnly(token: string): boolean {
  // 순수 어미로 시작하는 패턴들
  return /^[으아어이겠ㄴ는ㄹ고지가을를은은]/.test(token)
    || /^(이에요|예요|이야|야|에요|아요|해요|죠|네요|ㄴ데|은데|는데|ㄹ게|을게|ㄹ까|을까|ㄴ지|은지|는지|ㄹ수|을수|ㄹ게요|을게요|ㄹ래|을래|ㄴ후|은후|는후)/.test(token)
}

/** 표현 핵심부 추출 (leading ~/-/공백) */
function exprCore(korean: string): string {
  return korean.replace(/^[~\-]+\s*/, '').trim()
}

async function main() {
  // 전 화 focus 매핑
  const { data: deAll } = await sb.from('kp_dialogue_expressions')
    .select('id, dialogue_id, expression_id, matched_text, role')
    .eq('role', 'focus')
    .not('matched_text', 'is', null)

  const dlgIds = [...new Set((deAll ?? []).map(d => d.dialogue_id as number))]
  const { data: dlgAll } = await sb.from('kp_dialogues')
    .select('id, text_ko, episode_id, speaker')
    .in('id', dlgIds)
  const dlgMap = new Map((dlgAll ?? []).map(d => [d.id as number, d]))

  const exprIds = [...new Set((deAll ?? []).filter(d => d.expression_id != null).map(d => d.expression_id as number))]
  const { data: exprAll } = await sb.from('kp_expressions').select('id, korean').in('id', exprIds)
  const exprMap = new Map((exprAll ?? []).map(e => [e.id as number, e.korean as string]))

  const hits: {
    epNum: number
    deId: number
    speaker: string
    exprKorean: string
    core: string
    text: string
    mt: string
    reason: string
  }[] = []

  for (const de of (deAll ?? [])) {
    const dlg = dlgMap.get(de.dialogue_id as number)
    if (!dlg) continue

    const text = String(dlg.text_ko ?? '')
    const mt   = String(de.matched_text ?? '')
    const epNum = dlg.episode_id as number

    const exprKorean = exprMap.get(de.expression_id as number)
    if (!exprKorean) continue

    const core = exprCore(exprKorean)

    // 기준2 위반이 아니면 skip
    if (mt.includes(core)) continue

    // 제외 조건
    if (core.includes('/')) continue      // 슬래시 패턴
    if (core.includes('~')) continue      // 물결 자리 채움

    // core를 단어 단위로 분리
    const tokens = core.split(/\s+/).filter(Boolean)
    if (tokens.length < 2) continue       // 단일 토큰은 어미 결합으로 간주

    // 앞 토큰이 어미/조사만으로 된 경우 제외
    const firstToken = tokens[0]
    if (isGrammarOnly(firstToken)) continue

    // 앞 토큰이 text_ko에는 있는데 matched_text 앞부분에 없는지 확인
    const firstInText = text.includes(firstToken)
    const firstInMt   = mt.includes(firstToken)

    if (!firstInText) continue  // 대사에도 없으면 다른 이슈
    if (firstInMt) continue     // matched_text에도 있으면 OK

    // 반말 변형 체크: expr_core가 "~어요/~해요"로 끝나는데 matched_text가 "~어/~해"로 끝나면 반말 변형
    const coreLastToken = tokens[tokens.length - 1]
    const mtLastToken   = mt.split(/\s+/).filter(Boolean).at(-1) ?? ''
    const isHasPoliteEnding = /[요]$/.test(coreLastToken)
    const isHasCasualEnding = !(/[요]$/.test(mtLastToken))
    if (isHasPoliteEnding && isHasCasualEnding) continue  // 반말 변형

    // 의심 케이스 추가
    hits.push({
      epNum,
      deId: de.id as number,
      speaker: String(dlg.speaker ?? ''),
      exprKorean,
      core,
      text,
      mt,
      reason: `"${firstToken}"이(가) text_ko에 있지만 matched_text에 없음`,
    })
  }

  if (hits.length === 0) {
    console.log('\n✓ 해당 케이스 없음')
    return
  }

  hits.sort((a, b) => a.epNum - b.epNum || a.deId - b.deId)

  const byEp = new Map<number, typeof hits>()
  for (const h of hits) {
    const arr = byEp.get(h.epNum) ?? []
    arr.push(h)
    byEp.set(h.epNum, arr)
  }

  console.log(`\n앞부분 단어 누락 의심 케이스: ${hits.length}건 (${byEp.size}개 화)\n`)
  console.log('─'.repeat(80))
  for (const [epNum, list] of byEp) {
    console.log(`EP${String(epNum).padStart(2,'0')} (${list.length}건)`)
    for (const h of list) {
      console.log(`  DE id=${h.deId} [${h.speaker}] | ${h.reason}`)
      console.log(`    표현:       "${h.exprKorean}"  → core: "${h.core}"`)
      console.log(`    대사:       "${h.text}"`)
      console.log(`    matched_text: "${h.mt}"`)
    }
  }
  console.log('─'.repeat(80))
  console.log(`\n합계: ${hits.length}건`)
}
main().catch(console.error)
