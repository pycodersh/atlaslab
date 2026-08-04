/**
 * kp_dialogue_expressions.role 기준으로 kp_expressions.category 업데이트
 * - focus만 연결 → 'focus'
 * - exposure만 연결 → 'exposure'
 * - 둘 다 → 'focus'
 *
 * 실행: npx tsx scripts/fix-expression-categories.ts [--apply]
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const APPLY = process.argv.includes('--apply')

async function main() {
  // kp_dialogue_expressions 전체 (expression_id, role)
  const { data: deRows, error: e1 } = await sb
    .from('kp_dialogue_expressions')
    .select('expression_id, role')
  if (e1 || !deRows) { console.error('조회 실패:', e1?.message); process.exit(1) }

  // expression_id → role 집합
  const roleMap = new Map<number, Set<string>>()
  for (const r of deRows as any[]) {
    if (!roleMap.has(r.expression_id)) roleMap.set(r.expression_id, new Set())
    roleMap.get(r.expression_id)!.add(r.role)
  }

  // kp_expressions 전체
  const { data: exprs, error: e2 } = await sb
    .from('kp_expressions')
    .select('id, category')
  if (e2 || !exprs) { console.error('조회 실패:', e2?.message); process.exit(1) }

  // 변경 분류
  const toFocus:    number[] = []
  const toExposure: number[] = []
  const unchanged:  number[] = []
  const noLinks:    number[] = []

  for (const expr of exprs as any[]) {
    const roles = roleMap.get(expr.id)
    if (!roles || roles.size === 0) { noLinks.push(expr.id); continue }

    const hasFocus    = roles.has('focus')
    const hasExposure = roles.has('exposure')
    const newCat = (hasFocus || (hasFocus && hasExposure)) ? 'focus' : 'exposure'

    if (expr.category === newCat) { unchanged.push(expr.id); continue }
    if (newCat === 'focus')    toFocus.push(expr.id)
    else                       toExposure.push(expr.id)
  }

  console.log(`\n분석 완료`)
  console.log(`  → focus로 변경    : ${toFocus.length}개`)
  console.log(`  → exposure로 변경 : ${toExposure.length}개`)
  console.log(`  변경 없음 (이미 정확) : ${unchanged.length}개`)
  console.log(`  kp_dialogue_expressions 연결 없음: ${noLinks.length}개`)

  if (!APPLY) {
    console.log('\n[DRY RUN] --apply 없이는 DB 변경하지 않습니다.')
    return
  }

  // focus 업데이트
  if (toFocus.length) {
    const { error } = await sb
      .from('kp_expressions')
      .update({ category: 'focus' })
      .in('id', toFocus)
    if (error) { console.error('focus UPDATE 실패:', error.message); process.exit(1) }
    console.log(`\n✅ focus로 업데이트: ${toFocus.length}개`)
  }

  // exposure 업데이트
  if (toExposure.length) {
    const { error } = await sb
      .from('kp_expressions')
      .update({ category: 'exposure' })
      .in('id', toExposure)
    if (error) { console.error('exposure UPDATE 실패:', error.message); process.exit(1) }
    console.log(`✅ exposure로 업데이트: ${toExposure.length}개`)
  }

  // 결과 확인
  const { data: after } = await sb
    .from('kp_expressions')
    .select('category')
  const counts: Record<string, number> = {}
  for (const e of (after ?? []) as any[]) {
    const c = e.category ?? 'null'
    counts[c] = (counts[c] ?? 0) + 1
  }
  console.log('\n[ 업데이트 후 category 분포 ]')
  for (const [k, v] of Object.entries(counts).sort()) {
    console.log(`  ${k}: ${v}개`)
  }
}

main().catch(console.error)
