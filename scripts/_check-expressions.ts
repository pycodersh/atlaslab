import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main() {
  // ── 0. 실제 컬럼 목록 ───────────────────────────────────────────────────────
  const { data: sample1 } = await sb.from('kp_expressions').select('*').limit(1)
  const cols = sample1 && sample1.length > 0 ? Object.keys(sample1[0]) : []
  console.log('\n=== 0. 컬럼 목록 ===')
  console.log(cols.join(', '))

  // ── 1. 전체 개수 ─────────────────────────────────────────────────────────────
  const { count: total } = await sb.from('kp_expressions').select('*', { count: 'exact', head: true })
  console.log(`\n=== 1. 전체 개수 ===\n  count = ${total}`)

  // ── 2. 신규분 (id > 1235) ─────────────────────────────────────────────────────
  const { count: newCount } = await sb.from('kp_expressions')
    .select('*', { count: 'exact', head: true })
    .gt('id', 1235)
  const { data: newRows } = await sb.from('kp_expressions')
    .select('id, korean')
    .gt('id', 1235)
    .order('id')
  console.log(`\n=== 2. 신규분 (id > 1235) count = ${newCount} ===`)
  if (newRows && newRows.length > 0) {
    console.log('  id    | korean')
    for (const r of newRows) console.log(`  ${String(r.id).padEnd(5)} | ${r.korean}`)
  } else {
    console.log('  (없음)')
  }

  // ── 3. 미완성 카드 ────────────────────────────────────────────────────────────
  const hasLiteralEn = cols.includes('literal_en')
  const hasUsageEn   = cols.includes('usage_en')
  const hasEnglish   = cols.includes('english')
  const hasDesc      = cols.includes('description')
  console.log(`\n=== 3. 미완성 카드 ===`)

  if (hasLiteralEn && hasUsageEn) {
    const { data: inc } = await sb.from('kp_expressions')
      .select('id, korean, literal_en, usage_en')
      .or('literal_en.is.null,literal_en.eq.,usage_en.is.null,usage_en.eq.')
      .order('id')
    console.log(`  [literal_en / usage_en 기준] 미완성 = ${inc?.length ?? 0}개`)
    for (const r of inc ?? [])
      console.log(`  ${r.id} | ${r.korean} | literal=${r.literal_en ?? 'NULL'} | usage=${r.usage_en ?? 'NULL'}`)
  } else {
    console.log(`  literal_en/usage_en 컬럼 없음`)
    // english / description 기준으로 체크
    const filters: string[] = []
    if (hasEnglish) filters.push('english.is.null', 'english.eq.')
    if (hasDesc)    filters.push('description.is.null', 'description.eq.')
    if (filters.length > 0) {
      const selectCols = ['id', 'korean', hasEnglish ? 'english' : null, hasDesc ? 'description' : null]
        .filter(Boolean).join(', ')
      const { data: inc2 } = await sb.from('kp_expressions')
        .select(selectCols)
        .or(filters.join(','))
        .order('id')
      console.log(`  [english/description 기준] 미완성 = ${inc2?.length ?? 0}개`)
      for (const r of inc2 ?? [])
        console.log(`  ${(r as any).id} | ${(r as any).korean}`)
    }
  }

  // ── 4. 예문 개수 ────────────────────────────────────────────────────────────
  console.log(`\n=== 4. 예문 개수 (3개가 아닌 것) ===`)
  if (cols.includes('examples')) {
    const { data: allEx } = await sb.from('kp_expressions').select('id, korean, examples')
    const notThree = (allEx ?? []).filter(r => {
      const ex = r.examples
      if (ex === null || ex === undefined) return true
      if (Array.isArray(ex)) return ex.length !== 3
      return true
    })
    console.log(`  총 ${notThree.length}개`)
    if (notThree.length > 0 && notThree.length <= 60) {
      console.log('  id    | cnt | korean')
      for (const r of notThree) {
        const cnt = Array.isArray(r.examples) ? r.examples.length : 'NULL'
        console.log(`  ${String(r.id).padEnd(5)} | ${String(cnt).padEnd(3)} | ${r.korean}`)
      }
    }
  } else {
    console.log('  examples 컬럼 없음')
  }

  // ── 5. 배분표 대조: 스크립트 txt → DB ────────────────────────────────────────
  console.log(`\n=== 5. 배분표 대조 (스크립트 txt vs DB) ===`)
  const scriptsDir = path.resolve(process.cwd(), 'data/kpatto/scripts')
  const txtFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.txt')).sort()

  // 스크립트에서 ▸ 표현 추출 (expressionText 부분만)
  const scriptExprs = new Map<string, string[]>() // expression → [ep 목록]
  for (const file of txtFiles) {
    const text = fs.readFileSync(path.join(scriptsDir, file), 'utf-8')
    const lines = text.split('\n')
    let currentEp = ''
    for (const line of lines) {
      const epMatch = line.match(/^EP(\d+)/)
      if (epMatch) currentEp = `EP${epMatch[1].padStart(2, '0')}`
      const m = line.match(/▸\s+(.+?)\s+→/)
      if (m && currentEp) {
        const expr = m[1].trim()
        if (!scriptExprs.has(expr)) scriptExprs.set(expr, [])
        if (!scriptExprs.get(expr)!.includes(currentEp))
          scriptExprs.get(expr)!.push(currentEp)
      }
    }
  }
  console.log(`  스크립트 고유 표현 수: ${scriptExprs.size}`)
  console.log(`  스크립트 총 슬롯 수: ${[...scriptExprs.values()].reduce((s, v) => s + v.length, 0)}`)

  const { data: allExprs } = await sb.from('kp_expressions').select('id, korean')
  const dbSet = new Set((allExprs ?? []).map(e => e.korean))

  const missing: { expr: string; eps: string[] }[] = []
  for (const [expr, eps] of scriptExprs.entries()) {
    if (!dbSet.has(expr)) missing.push({ expr, eps })
  }
  missing.sort((a, b) => parseInt(a.eps[0].replace('EP', '')) - parseInt(b.eps[0].replace('EP', '')))
  console.log(`  DB에 없는 표현: ${missing.length}개`)
  if (missing.length > 0) {
    console.log(`\n  ${'표현'.padEnd(32)}| 등장 에피소드`)
    console.log(`  ${'─'.repeat(32)}|${'─'.repeat(20)}`)
    for (const m of missing)
      console.log(`  ${m.expr.padEnd(32)}| ${m.eps.join(', ')}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
