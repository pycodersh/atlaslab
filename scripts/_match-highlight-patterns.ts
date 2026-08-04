/**
 * 대본의 Focus/Exposure Pattern을 파싱해서 EP별 대사에 매칭
 * --ep 1-100 : EP 범위 지정 (기본: 1-100)
 * --insert   : 실제 DELETE+INSERT 실행 (기본: dry-run)
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const cliArgs = process.argv.slice(2)
const doInsert = cliArgs.includes('--insert')
const epArg = cliArgs.find(a => a.startsWith('--ep'))
const epRange = epArg ? cliArgs[cliArgs.indexOf(epArg) + 1] : '1-100'
const [epFrom, epTo] = epRange.includes('-')
  ? epRange.split('-').map(Number)
  : [Number(epRange), Number(epRange)]

// 건너뛸 범용 토큰: 부사+~해요 조합이 파싱하면 남는 "해요"
const SKIP_TOKENS = new Set(['해요'])

// "예요" 토큰은 ~이에요/예요 표현에 묶음 (받침 유무 변형)
const YEOYO_ALIAS = '이에요'   // findExpr에서 "이에요"도 함께 시도

// ── 패턴 토큰 파싱 ──────────────────────────────────────────────────────────
function parsePatternToken(raw: string): string[] {
  const token = raw.trim()
  if (token.startsWith('~')) {
    const after = token.slice(1)
    if (after.includes('/')) return after.split('/').map(s => s.trim()).filter(Boolean)
    return [after]
  }
  if (token.includes('~')) {
    // "너무 ~해요" → "해요"  (SKIP_TOKENS 처리됨)
    const afterTilde = token.slice(token.indexOf('~') + 1)
    if (afterTilde.includes('/')) return afterTilde.split('/').map(s => s.trim()).filter(Boolean)
    return [afterTilde]
  }
  if (token.includes('/')) {
    return token.split('/').map(s => s.trim()).filter(Boolean)
  }
  return [token]
}

// ── 대본 파싱 ─────────────────────────────────────────────────────────────
interface EpPattern {
  ep: number
  focus: string[]
  exposure: string[]
  focusRaw: string
  exposureRaw: string
}

function parseScript(mdPath: string): Map<number, EpPattern> {
  const text = fs.readFileSync(mdPath, 'utf-8')
  const lines = text.split('\n')
  const result = new Map<number, EpPattern>()
  let curEp = 0

  for (const line of lines) {
    const t = line.trim()
    const epMatch = t.match(/^## EP(\d+)/)
    if (epMatch) { curEp = parseInt(epMatch[1]); continue }

    const focusMatch = t.match(/^\*\*Focus Pattern:\*\*\s*(.+)/)
    if (focusMatch && curEp > 0) {
      const raw = focusMatch[1]
      const tokens: string[] = []
      for (const part of raw.split(' / ')) tokens.push(...parsePatternToken(part))
      if (!result.has(curEp)) result.set(curEp, { ep: curEp, focus: [], exposure: [], focusRaw: '', exposureRaw: '' })
      result.get(curEp)!.focus = tokens
      result.get(curEp)!.focusRaw = raw
      continue
    }

    const expMatch = t.match(/^\*\*Exposure Pattern:\*\*\s*(.+)/)
    if (expMatch && curEp > 0) {
      const raw = expMatch[1]
      const tokens: string[] = []
      for (const part of raw.split(' / ')) tokens.push(...parsePatternToken(part))
      if (!result.has(curEp)) result.set(curEp, { ep: curEp, focus: [], exposure: [], focusRaw: '', exposureRaw: '' })
      result.get(curEp)!.exposure = tokens
      result.get(curEp)!.exposureRaw = raw
    }
  }
  return result
}

// ── DB 로드 ──────────────────────────────────────────────────────────────
async function fetchAll<T>(table: string, cols: string): Promise<T[]> {
  let all: T[] = []
  let offset = 0
  while (true) {
    const { data } = await supabase.from(table).select(cols).range(offset, offset + 999)
    if (!data?.length) break
    all = all.concat(data as T[])
    if (data.length < 1000) break
    offset += 1000
  }
  return all
}

// ── 메인 ─────────────────────────────────────────────────────────────────
async function main() {
  const mdPath = path.resolve(process.cwd(), 'data/kpatto/source/kpatto_scripts_final.md')
  console.log(`\n=== 패턴 매칭 (EP${epFrom}~EP${epTo}) [${doInsert ? '✏ INSERT' : '🔍 dry-run'}] ===\n`)

  const patterns = parseScript(mdPath)
  const allDialogues = await fetchAll<{ id: number; episode_id: number; text_ko: string }>('kp_dialogues', 'id, episode_id, text_ko')
  const expressions = await fetchAll<{ id: number; korean: string }>('kp_expressions', 'id, korean')

  const { data: eps } = await supabase.from('kp_episodes').select('id, episode_num')
  const epIdMap = new Map<number, number>((eps ?? []).map((e: any) => [e.episode_num, e.id]))

  // kp_expressions: korean 정확 일치 → id
  const exprByKorean = new Map<string, number>(expressions.map(e => [e.korean.trim(), e.id]))

  type MatchRow = {
    dialogue_id: number
    expression_id: number | null
    matched_text: string
    role: 'focus' | 'exposure'
    ep: number
    text_ko: string
    exprKorean: string | null
  }

  const results: MatchRow[] = []

  // 선언됐지만 대사에 없는 패턴 (대본 수정 대상)
  const missingInDialogues: { ep: number; role: string; token: string; raw: string }[] = []

  // 대사에는 있지만 kp_expressions에 없는 패턴 (표현 추가 대상)
  const missingInExpressions: { ep: number; role: string; token: string; raw: string }[] = []

  // 건너뛴 패턴 (SKIP_TOKENS)
  const skipped: { ep: number; role: string; token: string; raw: string }[] = []

  const findExpr = (token: string): { id: number; korean: string } | null => {
    // "예요" → "이에요"도 함께 시도 (같은 표현의 받침 변형)
    const candidates = token === '예요' ? [token, YEOYO_ALIAS] : [token]

    for (const c of candidates) {
      const exactId = exprByKorean.get(c)
      if (exactId) return { id: exactId, korean: c }
      const withTilde = '~' + c
      const tildeId = exprByKorean.get(withTilde)
      if (tildeId) return { id: tildeId, korean: withTilde }
      for (const e of expressions) {
        if (e.korean.replace(/~/g, '').trim() === c) return { id: e.id, korean: e.korean }
      }
    }
    return null
  }

  for (let epNum = epFrom; epNum <= epTo; epNum++) {
    const pat = patterns.get(epNum)
    if (!pat) { console.log(`EP${String(epNum).padStart(2,'0')}: 대본 패턴 없음`); continue }

    const epId = epIdMap.get(epNum)
    if (!epId) { console.log(`EP${String(epNum).padStart(2,'0')}: DB episode 없음`); continue }

    const epDlgs = allDialogues.filter(d => d.episode_id === epId)

    const processTokens = (tokens: string[], role: 'focus' | 'exposure', rawLine: string) => {
      for (const token of tokens) {
        if (!token) continue

        // 범용 토큰 건너뜀
        if (SKIP_TOKENS.has(token)) {
          skipped.push({ ep: epNum, role, token, raw: rawLine })
          continue
        }

        const expr = findExpr(token)

        // 대사 매칭
        const matched = epDlgs.filter(d => d.text_ko.includes(token))
        if (matched.length === 0) {
          missingInDialogues.push({ ep: epNum, role, token, raw: rawLine })
          continue
        }
        if (!expr) {
          missingInExpressions.push({ ep: epNum, role, token, raw: rawLine })
        }

        for (const dlg of matched) {
          results.push({
            dialogue_id: dlg.id,
            expression_id: expr?.id ?? null,
            matched_text: token,
            role,
            ep: epNum,
            text_ko: dlg.text_ko,
            exprKorean: expr?.korean ?? null,
          })
        }
      }
    }

    processTokens(pat.focus, 'focus', pat.focusRaw)
    processTokens(pat.exposure, 'exposure', pat.exposureRaw)
  }

  // ── EP별 상세 출력 ──────────────────────────────────────────────────────
  const byEp = new Map<number, MatchRow[]>()
  for (const r of results) {
    if (!byEp.has(r.ep)) byEp.set(r.ep, [])
    byEp.get(r.ep)!.push(r)
  }

  for (const [ep, rows] of [...byEp.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(`\n── EP${String(ep).padStart(2,'0')} (${rows.length}건) ──`)
    for (const r of rows) {
      const exprStr = r.expression_id ? `expr#${r.expression_id}(${r.exprKorean})` : '⚠ expr없음'
      console.log(`  [${r.role.padEnd(8)}] "${r.matched_text}" → "${r.text_ko.slice(0,30)}" | ${exprStr}`)
    }
  }

  // ── 건너뜀 목록 ──────────────────────────────────────────────────────────
  if (skipped.length > 0) {
    console.log('\n\n=== 건너뛴 범용 토큰 (SKIP_TOKENS) ===')
    for (const s of skipped) {
      console.log(`  EP${String(s.ep).padStart(2,'0')} [${s.role}] "${s.token}" (원문: ${s.raw})`)
    }
  }

  // ── 대사 미매칭 (대본 수정 대상) ─────────────────────────────────────────
  console.log(`\n\n=== 선언됐지만 대사에 없는 패턴 (${missingInDialogues.length}건) — 대본 수정 대상 ===`)
  if (missingInDialogues.length > 0) {
    for (const m of missingInDialogues) {
      console.log(`  EP${String(m.ep).padStart(2,'0')} [${m.role}] "${m.token}" (원문: ${m.raw})`)
    }
  } else {
    console.log('  없음')
  }

  // ── 표현 미매칭 (kp_expressions 추가 필요) ─────────────────────────────
  if (missingInExpressions.length > 0) {
    console.log(`\n\n=== 대사엔 있지만 kp_expressions에 없는 패턴 (${missingInExpressions.length}건) ===`)
    for (const m of missingInExpressions) {
      console.log(`  EP${String(m.ep).padStart(2,'0')} [${m.role}] "${m.token}"`)
    }
  }

  // ── 통계 ──────────────────────────────────────────────────────────────
  const focusCnt = results.filter(r => r.role === 'focus').length
  const exposureCnt = results.filter(r => r.role === 'exposure').length
  const withExpr = results.filter(r => r.expression_id).length

  // 중복 제거 기준 행 수
  const seen = new Set<string>()
  let deduped = 0
  for (const r of results) {
    const key = `${r.dialogue_id}|${r.matched_text}|${r.role}`
    if (!seen.has(key)) { seen.add(key); deduped++ }
  }

  const zeroMatchEps: number[] = []
  for (let epNum = epFrom; epNum <= epTo; epNum++) {
    if (patterns.has(epNum) && !byEp.has(epNum)) zeroMatchEps.push(epNum)
  }

  console.log(`\n\n${'='.repeat(50)}`)
  console.log(`총 매칭 행: ${results.length}건 (중복 제거 후: ${deduped}건)`)
  console.log(`  focus   : ${focusCnt}건`)
  console.log(`  exposure: ${exposureCnt}건`)
  console.log(`  expr 연결: ${withExpr}건 / 미연결: ${results.length - withExpr}건`)
  console.log(`건너뜀 (SKIP_TOKENS): ${skipped.length}건`)
  console.log(`대사 미매칭 (누락 패턴): ${missingInDialogues.length}건`)
  if (zeroMatchEps.length > 0) {
    console.log(`\n매칭 0건인 EP: ${zeroMatchEps.map(n => `EP${String(n).padStart(2,'0')}`).join(', ')}`)
  } else {
    console.log(`매칭 0건인 EP: 없음`)
  }

  // ── INSERT ─────────────────────────────────────────────────────────────
  if (doInsert) {
    console.log('\n\n기존 kp_dialogue_expressions 전체 삭제 중...')
    const { error: delErr } = await supabase.from('kp_dialogue_expressions').delete().neq('id', 0)
    if (delErr) { console.error('삭제 실패:', delErr.message); return }
    console.log('삭제 완료')

    // 중복 제거 후 INSERT
    const toInsert: { dialogue_id: number; expression_id: number | null; matched_text: string; role: string }[] = []
    const ins = new Set<string>()
    for (const r of results) {
      const key = `${r.dialogue_id}|${r.matched_text}|${r.role}`
      if (ins.has(key)) continue
      ins.add(key)
      toInsert.push({ dialogue_id: r.dialogue_id, expression_id: r.expression_id, matched_text: r.matched_text, role: r.role })
    }

    console.log(`INSERT ${toInsert.length}건...`)
    let ok = 0, fail = 0
    for (const row of toInsert) {
      const { error } = await supabase.from('kp_dialogue_expressions').insert(row)
      if (error) { console.error(`  ✗ dlg=${row.dialogue_id}:`, error.message); fail++ }
      else ok++
    }
    console.log(`완료: ${ok}건 성공, ${fail}건 실패`)
  }
}

main().catch(console.error)
