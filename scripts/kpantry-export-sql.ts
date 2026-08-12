/**
 * kpantry-export-sql.ts
 *
 * k-pantry 원본 4개 테이블 → patto Supabase용 SQL INSERT 파일 생성
 * PostgREST 우회 — SQL Editor에서 직접 실행하는 용도
 *
 * 출력:
 *   scripts/sql-export/01_pantry_ingredients.sql
 *   scripts/sql-export/02_pantry_recipes.sql
 *   scripts/sql-export/03_pantry_recipe_ingredients.sql
 *   scripts/sql-export/04_pantry_recipe_steps.sql
 *
 * 실행:
 *   npx tsx scripts/kpantry-export-sql.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'
import { writeFileSync, mkdirSync } from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

// ── 설정 ──────────────────────────────────────────────────────
const SRC_URL = 'https://mzcdowxmmuefowcayzfk.supabase.co'
const SRC_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16Y2Rvd3htbXVlZm93Y2F5emZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTA0NjM1MSwiZXhwIjoyMTAwNjIyMzUxfQ.TGy4ghXZv-CkYGTCSDBk3HsiSgyDrYqHnbj-gL7lRa0'

const DST_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
if (!DST_URL) { console.error('NEXT_PUBLIC_SUPABASE_URL 없음'); process.exit(1) }

// ── URL 치환 ──────────────────────────────────────────────────
const URL_RULES: Array<{ from: string; to: string }> = [
  {
    from: `${SRC_URL}/storage/v1/object/public/recipe-images/`,
    to:   `${DST_URL}/storage/v1/object/public/pantry-recipe-images/`,
  },
  {
    from: `${SRC_URL}/storage/v1/object/public/ingredients/`,
    to:   `${DST_URL}/storage/v1/object/public/pantry-ingredients/`,
  },
]

function replaceUrl(url: string | null | undefined): string | null {
  if (!url) return url ?? null
  for (const rule of URL_RULES) {
    if (url.startsWith(rule.from)) return rule.to + url.slice(rule.from.length)
  }
  return url
}

// ── SQL 리터럴 변환 ───────────────────────────────────────────
// 작은따옴표 → 두 번 이스케이프 (PostgreSQL 표준)
function litStr(s: string): string {
  return `'${s.replace(/'/g, "''")}'`
}

function lit(v: unknown): string {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'boolean')        return v ? 'TRUE' : 'FALSE'
  if (typeof v === 'number')         return isFinite(v) ? String(v) : 'NULL'
  if (Array.isArray(v)) {
    // PostgreSQL TEXT[] 배열 리터럴
    // ARRAY['el1','el2']::text[]  /  ARRAY[]::text[]
    if (v.length === 0) return `ARRAY[]::text[]`
    const els = v.map(el =>
      el === null || el === undefined ? 'NULL' : litStr(String(el)),
    )
    return `ARRAY[${els.join(', ')}]::text[]`
  }
  if (typeof v === 'string') return litStr(v)
  // object (JSONB 등)
  return litStr(JSON.stringify(v))
}

// ── 원본 전체 조회 ────────────────────────────────────────────
const src = createClient(SRC_URL, SRC_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function fetchAll(table: string): Promise<Record<string, unknown>[]> {
  const PAGE = 1000
  const rows: Record<string, unknown>[] = []
  let offset = 0
  while (true) {
    const { data, error } = await src
      .from(table)
      .select('*')
      .range(offset, offset + PAGE - 1)
    if (error) throw new Error(`fetchAll(${table}): ${error.message}`)
    if (!data || data.length === 0) break
    rows.push(...(data as Record<string, unknown>[]))
    if (data.length < PAGE) break
    offset += PAGE
  }
  return rows
}

// ── SQL 파일 생성 ─────────────────────────────────────────────
function buildSql(
  dstTable: string,
  rows: Record<string, unknown>[],
  batchSize = 100,
): string {
  if (rows.length === 0) return `-- ${dstTable}: 데이터 없음\n`

  const cols = Object.keys(rows[0])
  const updateCols = cols.filter(c => c !== 'id') // ON CONFLICT 갱신 컬럼
  const lines: string[] = []

  lines.push(`-- ══════════════════════════════════════════`)
  lines.push(`-- ${dstTable}  (${rows.length}행)`)
  lines.push(`-- Generated: ${new Date().toISOString()}`)
  lines.push(`-- ══════════════════════════════════════════`)
  lines.push('')

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const colList = cols.map(c => `"${c}"`).join(', ')
    const valRows = batch.map(row => {
      const vals = cols.map(c => lit(row[c]))
      return `  (${vals.join(', ')})`
    })

    lines.push(`INSERT INTO ${dstTable} (${colList}) VALUES`)
    lines.push(valRows.join(',\n'))
    lines.push(`ON CONFLICT (id) DO UPDATE SET`)
    lines.push(updateCols.map(c => `  "${c}" = EXCLUDED."${c}"`).join(',\n') + ';')
    lines.push('') // 빈 줄 구분
  }

  return lines.join('\n')
}

// ── 메인 ─────────────────────────────────────────────────────
async function main() {
  const OUT_DIR = resolve(process.cwd(), 'scripts/sql-export')
  mkdirSync(OUT_DIR, { recursive: true })

  console.log('══════════════════════════════════════════════════════════')
  console.log('  K-PANTRY SQL 파일 생성')
  console.log(`  출처: ${SRC_URL}`)
  console.log(`  대상 URL: ${DST_URL}`)
  console.log(`  출력: ${OUT_DIR}`)
  console.log('══════════════════════════════════════════════════════════')

  // 1. ingredients → pantry_ingredients
  console.log('\n[1/4] ingredients 조회 중...')
  const rawIng = await fetchAll('ingredients')
  const ingredients = rawIng.map(r => ({
    ...r,
    image_url: replaceUrl(r.image_url as string | null),
  }))
  console.log(`  ${ingredients.length}행`)
  writeFileSync(
    resolve(OUT_DIR, '01_pantry_ingredients.sql'),
    buildSql('pantry_ingredients', ingredients),
    'utf8',
  )
  console.log('  ✅ 01_pantry_ingredients.sql')

  // 2. recipes → pantry_recipes
  console.log('\n[2/4] recipes 조회 중...')
  const rawRec = await fetchAll('recipes')
  const recipes = rawRec.map(r => ({
    ...r,
    hero_image_url: replaceUrl(r.hero_image_url as string | null),
  }))
  console.log(`  ${recipes.length}행`)
  writeFileSync(
    resolve(OUT_DIR, '02_pantry_recipes.sql'),
    buildSql('pantry_recipes', recipes),
    'utf8',
  )
  console.log('  ✅ 02_pantry_recipes.sql')

  // 3. recipe_ingredients → pantry_recipe_ingredients
  console.log('\n[3/4] recipe_ingredients 조회 중...')
  const ri = await fetchAll('recipe_ingredients')
  console.log(`  ${ri.length}행`)
  writeFileSync(
    resolve(OUT_DIR, '03_pantry_recipe_ingredients.sql'),
    buildSql('pantry_recipe_ingredients', ri),
    'utf8',
  )
  console.log('  ✅ 03_pantry_recipe_ingredients.sql')

  // 4. recipe_steps → pantry_recipe_steps
  console.log('\n[4/4] recipe_steps 조회 중...')
  const rawRs = await fetchAll('recipe_steps')
  const rs = rawRs.map(r => ({
    ...r,
    image_url: replaceUrl(r.image_url as string | null),
  }))
  console.log(`  ${rs.length}행`)
  writeFileSync(
    resolve(OUT_DIR, '04_pantry_recipe_steps.sql'),
    buildSql('pantry_recipe_steps', rs),
    'utf8',
  )
  console.log('  ✅ 04_pantry_recipe_steps.sql')

  // 행 수 요약
  console.log('\n══════════════════════════════════════════════════════════')
  console.log('  요약')
  console.log(`  pantry_ingredients      : ${ingredients.length}행`)
  console.log(`  pantry_recipes          : ${recipes.length}행`)
  console.log(`  pantry_recipe_ingredients: ${ri.length}행`)
  console.log(`  pantry_recipe_steps     : ${rs.length}행`)
  console.log('══════════════════════════════════════════════════════════')
  console.log('\n✅ 파일 4개 생성 완료.')
  console.log('   Supabase SQL Editor에서 01 → 02 → 03 → 04 순서로 실행하세요.')
}

main().catch(e => { console.error(e); process.exit(1) })
