import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main() {
  // ── A. kp_dialogue_expressions 총계 ──────────────────────────────────────────
  const { count: deCount } = await sb
    .from('kp_dialogue_expressions')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'focus')
  console.log(`\n=== A. kp_dialogue_expressions (role=focus) 총계 ===`)
  console.log(`  count = ${deCount}`)

  // ── B. 스크립트 txt에서 전체 ▸ 슬롯 파싱 ──────────────────────────────────────
  const scriptsDir = path.resolve(process.cwd(), 'data/kpatto/scripts')
  const txtFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.txt')).sort()

  type Slot = {
    ep: number
    cut: number
    expressionText: string
    matchedText: string
    dialogueLine: string
  }

  const slots: Slot[] = []
  for (const file of txtFiles) {
    const text = fs.readFileSync(path.join(scriptsDir, file), 'utf-8')
    const lines = text.split('\n')
    let currentEp = 0
    let currentCut = 0
    let lastDialogue = ''
    for (const line of lines) {
      const epMatch = line.match(/^EP(\d+)/)
      if (epMatch) { currentEp = parseInt(epMatch[1]); currentCut = 0 }
      const cutMatch = line.match(/^\[컷(\d+)\]/)
      if (cutMatch) currentCut = parseInt(cutMatch[1])
      const dlgMatch = line.match(/^\s+(?:\S+)(?:\(.*?\))?:\s+(.+)$/)
      if (dlgMatch && !line.trim().startsWith('EN:') && !line.trim().startsWith('▸'))
        lastDialogue = dlgMatch[1].trim()
      const exprMatch = line.match(/▸\s+(.+?)\s+→\s+"(.+)"/)
      if (exprMatch && currentEp > 0) {
        slots.push({
          ep: currentEp,
          cut: currentCut,
          expressionText: exprMatch[1].trim(),
          matchedText: exprMatch[2].trim(),
          dialogueLine: lastDialogue,
        })
      }
    }
  }
  console.log(`\n=== B. 스크립트 ▸ 슬롯 총계 ===`)
  console.log(`  total slots = ${slots.length}`)

  // ── C. DB에서 kp_expressions 조회 ────────────────────────────────────────────
  const { data: allExprs } = await sb.from('kp_expressions').select('id, korean')
  const exprMap = new Map<string, number>((allExprs ?? []).map(e => [e.korean, e.id]))

  // ── D. 각 에피소드별 first-occurrence 추적 (sync 로직과 동일) ─────────────────
  // linked_ids_per_ep: ep → Set<expressionId> (이미 링크된 표현)
  const linkedIds = new Map<number, Set<number>>()

  // ── E. 슬롯별 실패 분류 ──────────────────────────────────────────────────────
  type Failure = {
    ep: number; cut: number; expression: string; matched: string; dialogue: string; reason: string
  }
  const failures: Failure[] = []

  for (const s of slots) {
    const exprId = exprMap.get(s.expressionText)

    // 1) 표현 DB 없음
    if (exprId === undefined) {
      failures.push({ ep: s.ep, cut: s.cut, expression: s.expressionText, matched: s.matchedText, dialogue: s.dialogueLine, reason: '표현 DB 없음' })
      continue
    }

    // 2) matched_text가 대사의 substring이 아님
    if (!s.dialogueLine.includes(s.matchedText)) {
      failures.push({ ep: s.ep, cut: s.cut, expression: s.expressionText, matched: s.matchedText, dialogue: s.dialogueLine, reason: '문자열 불일치' })
      continue
    }

    // 3) first-occurrence only (같은 ep에서 이미 링크된 표현이면 skip)
    if (!linkedIds.has(s.ep)) linkedIds.set(s.ep, new Set())
    if (linkedIds.get(s.ep)!.has(exprId)) {
      // 중복 skip — 실패 아니라 정상 skip
      continue
    }
    linkedIds.get(s.ep)!.add(exprId)
  }

  // ── F. 결과 출력 ─────────────────────────────────────────────────────────────
  console.log(`\n=== C. 매칭 실패 건 (총 ${failures.length}개) ===`)
  if (failures.length === 0) {
    console.log('  실패 없음 ✓')
  } else {
    const w = (s: string, n: number) => s.slice(0, n).padEnd(n)
    console.log(`  EP  | 컷 | ${w('표현', 22)} | ${w('matched_text', 18)} | ${w('대사 원문', 22)} | 실패 사유`)
    console.log(`  ${'─'.repeat(100)}`)
    for (const f of failures) {
      console.log(
        `  ${String(f.ep).padStart(3)} | ${String(f.cut).padStart(2)} | ${w(f.expression, 22)} | ${w(f.matched, 18)} | ${w(f.dialogue, 22)} | ${f.reason}`
      )
    }
  }

  // ── G. EP01~50 재매칭 필요 여부 ──────────────────────────────────────────────
  // id > 1235인 표현이 EP01~50 스크립트에서 사용됐는지 확인
  const newExprSet = new Set((allExprs ?? []).filter(e => e.id > 1235).map(e => e.korean))
  const ep1to50NewUsages = slots.filter(s => s.ep <= 50 && newExprSet.has(s.expressionText))
  console.log(`\n=== D. EP01~50에서 신규 표현(id>1235) 사용 건수 ===`)
  console.log(`  count = ${ep1to50NewUsages.length}`)
  if (ep1to50NewUsages.length > 0) {
    console.log('  EP  | 컷 | expression')
    for (const u of ep1to50NewUsages)
      console.log(`  ${String(u.ep).padStart(3)} | ${String(u.cut).padStart(2)} | ${u.expressionText}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
