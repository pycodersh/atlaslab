/**
 * kp_expressions.english 90건 반영
 * npx tsx scripts/_apply_english_fix_90.ts
 *
 * [1] JSON 로드
 * [2] DB korean 값 대조 (불일치 시 중단)
 * [3] english UPDATE
 * [4] 반영 확인 (90건 전부 + 절단 0건)
 */
import * as dotenv from 'dotenv'
import * as path   from 'path'
import * as fs     from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

type FixRow = { id: number; korean: string; english: string }

async function main() {
  // ── [1] JSON 로드 ─────────────────────────────────────────────────────────────
  const jsonPath = path.resolve('C:/Users/msj15/Downloads/english-fix-90.json')
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ 파일 없음:', jsonPath); process.exit(1)
  }
  const fixes: FixRow[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  console.log(`\n[1] JSON 로드 완료: ${fixes.length}건`)

  // ── [2] DB korean 대조 ────────────────────────────────────────────────────────
  console.log('\n[2] DB korean 값 대조')
  const ids = fixes.map(r => r.id)

  const { data: dbRows, error: e0 } = await sb
    .from('kp_expressions')
    .select('id, korean')
    .in('id', ids)

  if (e0) { console.error('조회 실패:', e0.message); process.exit(1) }

  const dbMap = new Map<number, string>((dbRows ?? []).map(r => [r.id, r.korean]))

  const mismatches: Array<{ id: number; jsonKo: string; dbKo: string }> = []
  const notFound:   number[] = []

  for (const fix of fixes) {
    const dbKo = dbMap.get(fix.id)
    if (dbKo === undefined) { notFound.push(fix.id); continue }
    if (dbKo.trim() !== fix.korean.trim()) {
      mismatches.push({ id: fix.id, jsonKo: fix.korean, dbKo })
    }
  }

  if (notFound.length) {
    console.error(`\n  ❌ DB에서 찾지 못한 id: ${notFound.join(', ')}`)
    process.exit(1)
  }
  if (mismatches.length) {
    console.error(`\n  ❌ korean 불일치 ${mismatches.length}건 — 중단`)
    mismatches.forEach(m =>
      console.error(`  id=${m.id}\n    JSON: "${m.jsonKo}"\n    DB  : "${m.dbKo}"`)
    )
    process.exit(1)
  }
  console.log(`  ✅ 전체 ${fixes.length}건 korean 일치 확인`)

  // ── [3] UPDATE ────────────────────────────────────────────────────────────────
  console.log('\n[3] english UPDATE 시작')
  let ok = 0; let fail = 0
  for (const fix of fixes) {
    const { error: eu } = await sb
      .from('kp_expressions')
      .update({ english: fix.english })
      .eq('id', fix.id)
    if (eu) {
      console.error(`  ❌ id=${fix.id} 실패: ${eu.message}`)
      fail++
    } else {
      ok++
      if (ok % 10 === 0) console.log(`  ... ${ok}/${fixes.length}건 완료`)
    }
  }
  console.log(`  업데이트 완료: ✅ ${ok}건  ❌ ${fail}건`)
  if (fail > 0) process.exit(1)

  // ── [4] 반영 확인 ─────────────────────────────────────────────────────────────
  console.log('\n[4] 반영 확인')

  // 4a. 업데이트한 90건 값 확인
  const { data: updated } = await sb
    .from('kp_expressions')
    .select('id, korean, english')
    .in('id', ids)
    .order('id')

  const fixMap = new Map(fixes.map(r => [r.id, r.english]))
  let mismatchCount = 0
  for (const row of updated ?? []) {
    const expected = fixMap.get(row.id)
    if (row.english !== expected) {
      console.error(`  ❌ id=${row.id} 반영 불일치\n    기대: "${expected}"\n    실제: "${row.english}"`)
      mismatchCount++
    }
  }
  if (mismatchCount === 0) {
    console.log(`  ✅ 전체 ${(updated ?? []).length}건 DB 값 일치`)
  }

  // 4b. 절단 재검사 (id 861–1053 범위 전체)
  const { data: rangeRows } = await sb
    .from('kp_expressions')
    .select('id, korean, english')
    .gte('id', 861)
    .lte('id', 1053)
    .order('id')

  const endings = new Set(['.', '!', '?', ')', '"', '\u2019', '\u201d', '\u2026', '~', "'", ';'])
  const stillTruncated = (rangeRows ?? []).filter(r => {
    const e = (r.english ?? '').trim()
    return e.length > 0 && !endings.has(e.slice(-1))
  })

  // "~" 패턴 허용 (처음엔 낯설었는데 "It felt strange at first, but ~")
  const truelyTruncated = stillTruncated.filter(r => !r.english.endsWith('~'))

  if (truelyTruncated.length === 0) {
    console.log(`  ✅ id 861–1053 범위 절단 항목 0건`)
  } else {
    console.log(`\n  ⚠️ 여전히 절단 의심 ${truelyTruncated.length}건:`)
    truelyTruncated.forEach(r =>
      console.log(`    id=${r.id}  "${r.korean}"  →  "${r.english}"`)
    )
  }

  console.log('\n✅ 완료')
}

main().catch(e => { console.error(e); process.exit(1) })
