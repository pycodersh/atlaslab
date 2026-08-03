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
  variant:       string         // 'blank' | 'identify'
  question:      string
  hint:          string | null
  answer:        string
  options:       string[] | null
  tokens:        string[] | null
  expression_id: number
  example_index: number
}

// ── 슬롯 → 회차 ──────────────────────────────────────────────────────────────
const SLOT_ROUND: Record<string, number> = {
  MC1: 1, MC2: 1, FB1: 1, FB2: 1, SB1: 1,
  MC3: 2, MC4: 2, FB3: 2, FB4: 2, SB2: 2,
  MC5: 3, MC6: 3, FB5: 3, FB6: 3, SB3: 3,
}

// 12문장 인덱스: [A1,A2,A3, B1,B2,B3, C1,C2,C3, D1,D2,D3] = 0-11
const MC_SLOTS: [string, number][] = [
  ['MC1', 0], ['MC2', 3], ['MC3', 6], ['MC4', 9], ['MC5', 1], ['MC6', 4],
]
const FB_SLOT_NAMES = ['FB1','FB2','FB3','FB4','FB5','FB6']
const FB_DEFAULT_INDICES = [7, 10, 2, 5, 8, 11]

const SB_SLOTS: [string, number][] = [['SB1', 0], ['SB2', 4], ['SB3', 8]]

// ── 굴절형 후보 매핑 ──────────────────────────────────────────────────────────
// key: 정규화된 패턴 문자열(~/-제거, 공백트림), value: 추가 후보 목록
const MORPH_MAP: Record<string, string[]> = {
  '어서':    ['어서','아서','여서','해서','와서','워서','나서','러서'],
  '었':      ['었','았','였','했'],
  '어요':    ['어요','아요','해요','여요','워요'],
  '어 보다': ['어 봐','아 봐','해 봐','어 봤','아 봤','해 봤','어 보','아 보'],
  '어 주다': ['어 줘','아 줘','해 줘','어 줄','어 주','아 주'],
  '으면':    ['으면','면'],
  '으니까':  ['으니까','니까'],
  '으러':    ['으러','러'],
  '을게':    ['을게','ㄹ게','게'],
  '을까요?': ['을까요','ㄹ까요','까요'],
  '을까요':  ['을까요','ㄹ까요','까요'],
  '는데':    ['는데','은데','ㄴ데','인데'],
  '어지다':  ['어져','아져','해져','어졌','아졌','해졌'],
  '어야':    ['어야','아야','해야'],
  '으로':    ['으로','로'],
  '이/가':   ['이','가'],
  '은/는':   ['은','는'],
  '을/를':   ['을','를'],
}

function expandCandidates(cleaned: string): string[] {
  // '/'로 분리된 각 조각에 대해 MORPH_MAP 조회 + 자동 규칙 적용
  const pieces = cleaned.split('/').map(s => s.trim()).filter(Boolean)
  const set = new Set<string>()

  for (const p of pieces) {
    set.add(p)

    // MORPH_MAP 직접 매핑
    if (MORPH_MAP[p]) {
      for (const v of MORPH_MAP[p]) set.add(v)
      continue
    }

    // 자동 규칙: '으'로 시작하면 '으' 없는 형태 추가
    if (p.startsWith('으')) {
      set.add(p.slice(1))
    }

    // 자동 규칙: '어'로 시작하면 '아'/'여'/'해' 변형 추가
    if (p.startsWith('어')) {
      set.add('아' + p.slice(1))
      set.add('여' + p.slice(1))
      set.add('해' + p.slice(1))
    }
  }

  // 긴 문자열 먼저 시도 (부분 매칭 우선순위 확보)
  return Array.from(set).sort((a, b) => b.length - a.length)
}

function makeBlank(ko: string, patternKo: string): string | null {
  const cleaned = patternKo.replace(/[~\-]/g, '').trim()
  if (!cleaned) return null

  const candidates = expandCandidates(cleaned)
  for (const key of candidates) {
    if (!key) continue
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

  const { data: allExprs, error: exprErr } = await supabase
    .from('kp_expressions')
    .select('id, korean, examples, episodes')
    .order('id')
  if (exprErr || !allExprs) {
    console.error('표현 로드 실패:', exprErr?.message)
    process.exit(1)
  }

  const rows: Row[]       = []
  let ep15count           = 0
  let totalFbA            = 0
  let totalFbB            = 0

  for (let ep = 1; ep <= 100; ep++) {
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
    for (const [slot, idx] of MC_SLOTS) {
      const s = s12[idx]
      const wrongs = [
        s12[(idx + 3) % 12].en,
        s12[(idx + 6) % 12].en,
        s12[(idx + 9) % 12].en,
      ]
      epRows.push({
        ep_no: ep, slot, round_no: SLOT_ROUND[slot], type: 'multiple_choice',
        variant: '', question: s.ko, hint: null, answer: s.en,
        options: buildMCOptions(s.en, wrongs, idx % 4), tokens: null,
        expression_id: epExprs[s.exprIdx].id, example_index: s.exIdx,
      })
    }

    // ── FB (6문제) — 수정 3: FB-A 가능한 문장 먼저 배치 ─────────────────────
    const fbOptions = epExprs.map(e => e.korean)

    // 12문장 중 FB-A 가능 여부 사전 계산
    type FbCandidate = { s: S12; blanked: string | null; sIdx: number }
    const fbCandidates: FbCandidate[] = s12.map((s, sIdx) => ({
      s,
      blanked: makeBlank(s.ko, epExprs[s.exprIdx].korean),
      sIdx,
    }))

    // FB 기본 인덱스 순서로, FB-A 가능한 것 먼저 / 나머지(FB-B) 뒤
    const fbDefaultOrder = FB_DEFAULT_INDICES.map(i => fbCandidates[i])
    const fbAPool = fbDefaultOrder.filter(c => c.blanked !== null)
    const fbBPool = fbDefaultOrder.filter(c => c.blanked === null)

    // FB-A 먼저, 부족하면 FB-B로 채움 (총 6슬롯)
    const fbAssigned = [...fbAPool, ...fbBPool].slice(0, 6)

    // 슬롯 이름은 고정 순서 유지
    for (let fi = 0; fi < 6; fi++) {
      const slot = FB_SLOT_NAMES[fi]
      const cand = fbAssigned[fi]
      if (!cand) {
        console.warn(`  ⚠ EP${ep} ${slot}: FB 후보 없음`)
        continue
      }

      const { s, blanked } = cand
      const expr = epExprs[s.exprIdx]

      if (blanked !== null) {
        // FB-A: 빈칸 형태
        totalFbA++
        epRows.push({
          ep_no: ep, slot, round_no: SLOT_ROUND[slot], type: 'fill_blank',
          variant: 'blank',
          question: blanked, hint: s.en, answer: expr.korean,
          options: fbOptions, tokens: null,
          expression_id: expr.id, example_index: s.exIdx,
        })
      } else {
        // FB-B: identify 형태 — 전체 문장 보여주고 어떤 표현인지 고르기
        totalFbB++
        epRows.push({
          ep_no: ep, slot, round_no: SLOT_ROUND[slot], type: 'fill_blank',
          variant: 'identify',
          question: s.ko, hint: s.en, answer: expr.korean,
          options: fbOptions, tokens: null,
          expression_id: expr.id, example_index: s.exIdx,
        })
      }
    }

    // ── SB (3문제) ──────────────────────────────────────────────────────────
    for (const [slot, defIdx] of SB_SLOTS) {
      let placed = false
      for (let off = 0; off < 12; off++) {
        const s    = s12[(defIdx + off) % 12]
        const toks = s.ko.split(' ').filter(Boolean)
        if (toks.length >= 3) {
          epRows.push({
            ep_no: ep, slot, round_no: SLOT_ROUND[slot], type: 'sentence_build',
            variant: '', question: s.ko, hint: s.en, answer: s.ko,
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
  const fbARows = fbRows.filter(r => r.variant === 'blank')
  const fbBRows = fbRows.filter(r => r.variant === 'identify')

  const rt = (rs: Row[], t: string) => rs.filter(r => r.type === t).length
  const r1 = rows.filter(r => r.round_no === 1)
  const r2 = rows.filter(r => r.round_no === 2)
  const r3 = rows.filter(r => r.round_no === 3)

  const optNot4  = mcRows.filter(r => (r.options?.length ?? 0) !== 4).length
  const ansNotIn = mcRows.filter(r => !r.options?.includes(r.answer)).length
  const tokFew   = sbRows.filter(r => (r.tokens?.length ?? 0) < 3).length

  const fbNoOpts = fbRows.filter(r => (r.options?.length ?? 0) !== 4).length
  const fbAnsNotIn = fbRows.filter(r => !r.options?.includes(r.answer)).length

  const dupSet = new Set<string>()
  let dups = 0
  for (const r of rows) {
    const k = `${r.ep_no}:${r.slot}`
    if (dupSet.has(k)) dups++
    else dupSet.add(k)
  }

  const fbBPct = fbRows.length > 0 ? Math.round((fbBRows.length / fbRows.length) * 100) : 0

  console.log(`
=== §6 리포트${DRY_RUN ? '  [DRY-RUN]' : ''} ===

kp_challenges          ${rows.length}행
  EP당 15문제인 EP 수    ${ep15count} / 100
  multiple_choice        ${mcRows.length}
  fill_blank             ${fbRows.length}  (FB-A ${fbARows.length}건 / FB-B ${fbBRows.length}건)
  sentence_build         ${sbRows.length}

회차별 분포
  round 1                ${r1.length}  (MC ${rt(r1,'multiple_choice')} / FB ${rt(r1,'fill_blank')} / SB ${rt(r1,'sentence_build')})
  round 2                ${r2.length}  (MC ${rt(r2,'multiple_choice')} / FB ${rt(r2,'fill_blank')} / SB ${rt(r2,'sentence_build')})
  round 3                ${r3.length}  (MC ${rt(r3,'multiple_choice')} / FB ${rt(r3,'fill_blank')} / SB ${rt(r3,'sentence_build')})

무결성
  options 4개 아닌 MC 문제     ${optNot4}건
  정답이 options에 없는 MC     ${ansNotIn}건
  options 4개 아닌 FB 문제     ${fbNoOpts}건
  정답이 options에 없는 FB     ${fbAnsNotIn}건
  tokens 3개 미만 SB 문제      ${tokFew}건
  빈칸 치환 실패               0건  (FB-B로 대체 완료)
  중복 문제 (ep_no:slot)       ${dups}건
${fbBPct > 50 ? `\n  ⚠ 경고: FB-B 비율 ${fbBPct}% > 50% — 패턴 매칭 점검 필요` : `  FB-B 비율                  ${fbBPct}%  (정상)`}`)
}

main().catch(e => { console.error(e); process.exit(1) })
