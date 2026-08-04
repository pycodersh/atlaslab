/**
 * kp_dialogue_expressions 재구축 - 1단계: 매칭 분석 (DRY RUN)
 *
 * kp_expressions.pattern_ko에서 ~ 슬롯을 제거한 고정 어구를
 * kp_dialogues.text_ko에서 찾아 매칭 결과를 보고합니다.
 * INSERT 없음 - 결과 확인 전용.
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve('C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto', '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

// ~ 슬롯을 제거해 실제 고정 어구 추출
// '~뭐예요?' → ['뭐예요?']
// '~이/가 아니라 ~이/가' → ['이/가 아니라', '이/가']
// '~고 싶어요' → ['고 싶어요']
function extractSearchTerms(korean: string): string[] {
  // ~ 기준으로 split 후 비어 있지 않은 조각만
  const parts = korean.split('~').map(s => s.trim()).filter(s => s.length > 0)
  return parts
}

// 검색어가 text에 포함되는지 확인 (모든 조각이 포함되어야 함)
function matchesAll(text: string, terms: string[]): boolean {
  return terms.every(t => text.includes(t))
}

type ExprRow = { id: number; korean: string; first_episode: number | null }
type DlgRow  = { id: number; episode_id: number; text_ko: string }
type EpRow   = { id: number; episode_num: number }

async function main() {
  console.log('=== kp_dialogue_expressions 매칭 분석 ===\n')

  const [{ data: exprRaw }, { data: dlgRaw }, { data: epRaw }] = await Promise.all([
    sb.from('kp_expressions').select('id, korean, first_episode').order('id'),
    sb.from('kp_dialogues').select('id, episode_id, text_ko').order('id'),
    sb.from('kp_episodes').select('id, episode_num'),
  ])

  const expressions = (exprRaw ?? []) as ExprRow[]
  const dialogues   = (dlgRaw  ?? []) as DlgRow[]
  const episodes    = (epRaw   ?? []) as EpRow[]

  const epNumById = new Map(episodes.map(e => [e.id, e.episode_num]))

  console.log(`kp_expressions: ${expressions.length}개`)
  console.log(`kp_dialogues:   ${dialogues.length}개`)
  console.log(`kp_episodes:    ${episodes.length}개\n`)

  // 매칭 결과 수집
  // match: { expression_id, dialogue_id, matched_text }
  type Match = { expression_id: number; dialogue_id: number; matched_text: string; epNum: number }
  const matches: Match[] = []
  const unmatchedExprs: ExprRow[] = []

  for (const expr of expressions) {
    const terms = extractSearchTerms(expr.korean)
    if (!terms.length) { unmatchedExprs.push(expr); continue }

    let found = false
    for (const dlg of dialogues) {
      if (!matchesAll(dlg.text_ko, terms)) continue
      found = true
      // matched_text: 가장 긴 단일 term을 대표 matched_text로
      const longestTerm = terms.reduce((a, b) => a.length >= b.length ? a : b)
      matches.push({
        expression_id: expr.id,
        dialogue_id:   dlg.id,
        matched_text:  longestTerm,
        epNum:         epNumById.get(dlg.episode_id) ?? 0,
      })
    }
    if (!found) unmatchedExprs.push(expr)
  }

  // ── 결과 요약 ──────────────────────────────────────────────────────────────
  // 고유 (expression_id, dialogue_id) 쌍만 카운트
  console.log(`총 매칭 건수: ${matches.length}건 (목표 ~493건)`)
  console.log(`미매칭 표현: ${unmatchedExprs.length}개 / ${expressions.length}개`)

  // EP별 매칭 수
  const byEp = new Map<number, number>()
  for (const m of matches) {
    byEp.set(m.epNum, (byEp.get(m.epNum) ?? 0) + 1)
  }

  // 모든 EP 번호 수집 (dialogues 기준)
  const allEpNums = new Set<number>()
  for (const d of dialogues) allEpNums.add(epNumById.get(d.episode_id) ?? 0)
  allEpNums.delete(0)

  const zeroEps: number[] = []
  for (const n of [...allEpNums].sort((a, b) => a - b)) {
    if (!byEp.get(n)) zeroEps.push(n)
  }

  console.log(`\n매칭 0건 EP: ${zeroEps.length}개`)
  if (zeroEps.length) console.log('  ' + zeroEps.join(', '))

  // EP별 매칭 수 (10EP 간격 샘플)
  console.log('\nEP별 매칭 수 (샘플):')
  const CHECK = [1, 5, 10, 20, 30, 31, 40, 50, 60, 70, 80, 90, 100]
  for (const n of CHECK) {
    const cnt = byEp.get(n) ?? 0
    console.log(`  EP${String(n).padStart(3,'0')}: ${cnt}건`)
  }

  // 미매칭 표현 샘플
  if (unmatchedExprs.length > 0) {
    console.log(`\n미매칭 표현 샘플 (최대 10개):`)
    for (const e of unmatchedExprs.slice(0, 10)) {
      const terms = extractSearchTerms(e.korean)
      console.log(`  id=${e.id} pattern="${e.korean}" → 검색어: [${terms.join(', ')}]`)
    }
  }

  // 한 표현이 여러 대사에 매칭되는 경우 확인
  const exprMatchCount = new Map<number, number>()
  for (const m of matches) exprMatchCount.set(m.expression_id, (exprMatchCount.get(m.expression_id) ?? 0) + 1)
  const multiMatch = [...exprMatchCount.entries()].filter(([,c]) => c > 1)
  console.log(`\n여러 대사에 매칭되는 표현: ${multiMatch.length}개`)
  if (multiMatch.length > 0) {
    for (const [eid, cnt] of multiMatch.slice(0, 5)) {
      const expr = expressions.find(e => e.id === eid)!
      console.log(`  id=${eid} "${expr.korean}" → ${cnt}건`)
    }
  }

  console.log('\n=== 분석 완료. INSERT 진행 전 확인해주세요. ===')
}

main().catch(e => { console.error(e); process.exit(1) })
