/**
 * scripts/generate-challenges.ts
 * K-PATTO 챌린지 1,500문제 생성 (재실행 가능)
 * 스펙: kpatto_challenge_spec.md
 *
 * 사용법:
 *   npx tsx scripts/generate-challenges.ts --dry-run   # 검증만
 *   npx tsx scripts/generate-challenges.ts             # 실제 DB 쓰기
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const DRY_RUN = process.argv.includes('--dry-run')

// ── 타입 ────────────────────────────────────────────────────────────────────
type Sentence = { ko: string; en: string }
type Expr     = { id: number; korean: string; examples: Sentence[] }

interface Row {
  ep_no:         number
  slot:          string
  round_no:      number
  type:          string
  question:      string
  hint:          string | null
  answer:        string
  options:       string[] | null
  tokens:        string[] | null
  expression_id: number
  example_index: number
}

// ── 슬롯 → 회차 ──────────────────────────────────────────────────────────────
// 1회차: MC1, MC2, FB1, FB2, SB1
// 2회차: MC3, MC4, FB3, FB4, SB2
// 3회차: MC5, MC6, FB5, FB6, SB3
const SLOT_ROUND: Record<string, number> = {
  MC1: 1, MC2: 1, FB1: 1, FB2: 1, SB1: 1,
  MC3: 2, MC4: 2, FB3: 2, FB4: 2, SB2: 2,
  MC5: 3, MC6: 3, FB5: 3, FB6: 3, SB3: 3,
}

// ── 12문장 배열 인덱스: [A1,A2,A3, B1,B2,B3, C1,C2,C3, D1,D2,D3] ──────────
//                         0   1   2   3   4   5   6   7   8   9  10  11
const MC_SLOTS: [string, number][] = [
  ['MC1', 0], ['MC2', 3], ['MC3', 6], ['MC4', 9], ['MC5', 1], ['MC6', 4],
]
const FB_SLOTS: [string, number][] = [
  ['FB1', 7], ['FB2', 10], ['FB3', 2], ['FB4', 5], ['FB5', 8], ['FB6', 11],
]
const SB_SLOTS: [string, number][] = [
  ['SB1', 0], ['SB2', 4], ['SB3', 8],
]

// ── 유틸 ─────────────────────────────────────────────────────────────────────
function makeBlank(ko: string, patternKo: string): string | null {
  // ~와 - 제거, 남은 문자열이 '/'를 포함하면 대안별로 시도
  const cleaned = patternKo.replace(/[~\-]/g, '').trim()
  if (!cleaned) return null
  const candidates = cleaned.split('/').map(s => s.trim()).filter(Boolean)
  for (const key of candidates) {
    const idx = ko.indexOf(key)
    if (idx !== -1) return ko.slice(0, idx) + '___' + ko.slice(idx + key.length)
  }
  return null
}

function buildMCOptions(answer: string, wrongs: string[], answerPos: number): string[] {
  const opts = ['', '', '', '']
  opts[answerPos] = answer
  const remaining = [0, 1, 2, 3].filter(p => p !== answerPos)
  wrongs.forEach((w, j) => { opts[remaining[j]] = w })
  return opts
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nK-PATTO 챌린지 생성${DRY_RUN ? '  [DRY-RUN]' : ''}`)

  // kp_expressions 전체 로드 (id 오름차순)
  const { data: allExprs, error: exprErr } = await supabase
    .from('kp_expressions')
    .select('id, korean, examples, episodes')
    .order('id')
  if (exprErr || !allExprs) {
    console.error('표현 로드 실패:', exprErr?.message)
    process.exit(1)
  }

  const rows: Row[]       = []
  const fbFails: string[] = []
  let ep15count = 0

  for (let ep = 1; ep <= 100; ep++) {
    // 해당 EP 표현: episodes 배열에 ep 포함, id 오름차순, 최대 4개
    const epExprs: Expr[] = allExprs
      .filter(e => Array.isArray(e.episodes) && (e.episodes as number[]).includes(ep))
      .slice(0, 4)
      .map(e => ({
        id:       e.id,
        korean:   e.korean,
        examples: (e.examples ?? []) as Sentence[],
      }))

    if (epExprs.length < 4) {
      console.warn(`  ⚠ EP${String(ep).padStart(2, '0')}: 표현 ${epExprs.length}개 (4개 필요) — 스킵`)
      continue
    }

    // 12문장 구성: [A1,A2,A3, B1,B2,B3, C1,C2,C3, D1,D2,D3]
    type S12 = { ko: string; en: string; exprIdx: number; exIdx: number }
    const s12: S12[] = []
    for (let ei = 0; ei < 4; ei++) {
      for (let si = 0; si < 3; si++) {
        const ex = epExprs[ei].examples[si] ?? { ko: '', en: '' }
        s12.push({ ko: ex.ko, en: ex.en, exprIdx: ei, exIdx: si })
      }
    }

    const epRows: Row[] = []

    // ── MC (6문제) ──────────────────────────────────────────────────────────
    // question=ko, answer=en, 오답=(i+3)%12/(i+6)%12/(i+9)%12의 en
    // 정답 위치=i%4
    for (const [slot, idx] of MC_SLOTS) {
      const s = s12[idx]
      const wrongs = [
        s12[(idx + 3) % 12].en,
        s12[(idx + 6) % 12].en,
        s12[(idx + 9) % 12].en,
      ]
      epRows.push({
        ep_no: ep, slot, round_no: SLOT_ROUND[slot], type: 'multiple_choice',
        question: s.ko, hint: null, answer: s.en,
        options: buildMCOptions(s.en, wrongs, idx % 4), tokens: null,
        expression_id: epExprs[s.exprIdx].id, example_index: s.exIdx,
      })
    }

    // ── FB (6문제) ──────────────────────────────────────────────────────────
    // question=ko(빈칸), hint=en, answer=pattern_ko, options=4개 pattern_ko (A,B,C,D 순)
    const fbOptions = epExprs.map(e => e.korean)
    for (const [slot, idx] of FB_SLOTS) {
      const s    = s12[idx]
      const expr = epExprs[s.exprIdx]
      const blanked = makeBlank(s.ko, expr.korean)
      if (blanked === null) {
        fbFails.push(
          `  EP${String(ep).padStart(2, '0')} ${slot}  표현="${expr.korean}"  예문="${s.ko}"`,
        )
        continue
      }
      epRows.push({
        ep_no: ep, slot, round_no: SLOT_ROUND[slot], type: 'fill_blank',
        question: blanked, hint: s.en, answer: expr.korean,
        options: fbOptions, tokens: null,
        expression_id: expr.id, example_index: s.exIdx,
      })
    }

    // ── SB (3문제) ──────────────────────────────────────────────────────────
    // tokens=ko 공백 분리, hint=en, answer=ko
    // 토큰 2개 이하이면 다음 인덱스로 순환 탐색
    for (const [slot, defIdx] of SB_SLOTS) {
      let placed = false
      for (let off = 0; off < 12; off++) {
        const s    = s12[(defIdx + off) % 12]
        const toks = s.ko.split(' ').filter(Boolean)
        if (toks.length >= 3) {
          epRows.push({
            ep_no: ep, slot, round_no: SLOT_ROUND[slot], type: 'sentence_build',
            question: s.ko, hint: s.en, answer: s.ko,
            options: null, tokens: toks,
            expression_id: epExprs[s.exprIdx].id, example_index: s.exIdx,
          })
          placed = true
          break
        }
      }
      if (!placed) console.warn(`  ⚠ EP${ep} ${slot}: 토큰 3개 이상 예문 없음`)
    }

    if (epRows.length === 15) ep15count++
    rows.push(...epRows)
  }

  // ── DB 쓰기 ──────────────────────────────────────────────────────────────
  if (!DRY_RUN) {
    process.stdout.write('\n  DB 삭제...')
    const { error: delErr } = await supabase
      .from('kp_challenges')
      .delete()
      .gte('ep_no', 1)
      .lte('ep_no', 100)
    if (delErr) {
      console.error('\n  삭제 오류:', delErr.message)
      process.exit(1)
    }
    process.stdout.write(' ✓\n  삽입')
    const BATCH = 100
    for (let i = 0; i < rows.length; i += BATCH) {
      const { error } = await supabase.from('kp_challenges').insert(rows.slice(i, i + BATCH))
      if (error) {
        console.error(`\n  삽입 오류 [${i}..${i + BATCH}]:`, error.message)
        process.exit(1)
      }
      process.stdout.write('.')
    }
    console.log(` ✓  (${rows.length}행)`)
  }

  // ── §6 리포트 ────────────────────────────────────────────────────────────
  const mcRows = rows.filter(r => r.type === 'multiple_choice')
  const fbRows = rows.filter(r => r.type === 'fill_blank')
  const sbRows = rows.filter(r => r.type === 'sentence_build')

  const rt = (rs: Row[], t: string) => rs.filter(r => r.type === t).length
  const r1 = rows.filter(r => r.round_no === 1)
  const r2 = rows.filter(r => r.round_no === 2)
  const r3 = rows.filter(r => r.round_no === 3)

  const optNot4  = mcRows.filter(r => (r.options?.length ?? 0) !== 4).length
  const ansNotIn = mcRows.filter(r => !r.options?.includes(r.answer)).length
  const tokFew   = sbRows.filter(r => (r.tokens?.length ?? 0) < 3).length

  const dupSet = new Set<string>()
  let dups = 0
  for (const r of rows) {
    const k = `${r.ep_no}:${r.slot}`
    if (dupSet.has(k)) dups++
    else dupSet.add(k)
  }

  console.log(`
=== §6 리포트${DRY_RUN ? '  [DRY-RUN]' : ''} ===

kp_challenges          ${rows.length}행
  EP당 15문제인 EP 수    ${ep15count} / 100
  multiple_choice        ${mcRows.length}
  fill_blank             ${fbRows.length}
  sentence_build         ${sbRows.length}

회차별 분포
  round 1                ${r1.length}  (MC ${rt(r1, 'multiple_choice')} / FB ${rt(r1, 'fill_blank')} / SB ${rt(r1, 'sentence_build')})
  round 2                ${r2.length}  (MC ${rt(r2, 'multiple_choice')} / FB ${rt(r2, 'fill_blank')} / SB ${rt(r2, 'sentence_build')})
  round 3                ${r3.length}  (MC ${rt(r3, 'multiple_choice')} / FB ${rt(r3, 'fill_blank')} / SB ${rt(r3, 'sentence_build')})

무결성
  options 4개 아닌 문제       ${optNot4}건
  정답이 options에 없는 문제  ${ansNotIn}건
  tokens 3개 미만 문제        ${tokFew}건
  빈칸 치환 실패              ${fbFails.length}건${fbFails.length > 0 ? '  ← 수정 필요' : ''}
  중복 문제 (ep_no:slot)      ${dups}건`)

  if (fbFails.length > 0) {
    console.log('\n빈칸 치환 실패 목록:')
    for (const f of fbFails) console.log(f)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
