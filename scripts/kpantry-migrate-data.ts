/**
 * kpantry-migrate-data.ts
 *
 * k-pantry Supabase → patto Supabase 데이터 이전 (콘텐츠 4개 테이블)
 *
 * 순서:
 *   1. pantry_ingredients  (원본: ingredients)
 *   2. pantry_recipes      (원본: recipes)
 *   3. pantry_recipe_ingredients
 *   4. pantry_recipe_steps
 *
 * 원칙:
 *   - 원본 UUID 보존 (id 명시 upsert)
 *   - image URL 전체 접두어 치환
 *   - 재실행 안전 (onConflict: 'id' → 이미 있으면 갱신)
 *   - 배치 50건
 *
 * 실행:
 *   npx tsx scripts/kpantry-migrate-data.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

// ── 설정 ──────────────────────────────────────────────────────
const SRC_URL = 'https://mzcdowxmmuefowcayzfk.supabase.co'
const SRC_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16Y2Rvd3htbXVlZm93Y2F5emZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTA0NjM1MSwiZXhwIjoyMTAwNjIyMzUxfQ.TGy4ghXZv-CkYGTCSDBk3HsiSgyDrYqHnbj-gL7lRa0'

const DST_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const DST_KEY = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)!

if (!DST_URL || !DST_KEY) {
  console.error('❌ .env.local 에 NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY 없음')
  process.exit(1)
}

// ── URL 치환 규칙 (전체 접두어 매칭) ─────────────────────────
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

function replaceUrl(url: string | null): string | null {
  if (!url) return url
  for (const rule of URL_RULES) {
    if (url.startsWith(rule.from)) {
      return rule.to + url.slice(rule.from.length)
    }
  }
  return url  // 치환 대상 아니면 그대로
}

// ── Supabase 클라이언트 ───────────────────────────────────────
const src = createClient(SRC_URL, SRC_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const dst = createClient(DST_URL, DST_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── 헬퍼: 전체 행 페이지네이션 조회 ─────────────────────────
async function fetchAll<T>(
  client: SupabaseClient,
  table: string,
  select = '*',
): Promise<T[]> {
  const PAGE = 1000
  const rows: T[] = []
  let offset = 0

  while (true) {
    const { data, error } = await client
      .from(table)
      .select(select)
      .range(offset, offset + PAGE - 1)

    if (error) throw new Error(`fetchAll(${table}): ${error.message}`)
    if (!data || data.length === 0) break
    rows.push(...(data as T[]))
    if (data.length < PAGE) break
    offset += PAGE
  }

  return rows
}

// ── 헬퍼: 배치 upsert ────────────────────────────────────────
async function batchUpsert(
  client: SupabaseClient,
  table: string,
  rows: Record<string, unknown>[],
  batchSize = 50,
): Promise<void> {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await client
      .from(table)
      .upsert(batch, { onConflict: 'id' })

    if (error) {
      throw new Error(
        `upsert(${table}) batch ${i}~${i + batch.length - 1}: ${error.message}`,
      )
    }
    process.stdout.write(`  ${Math.min(i + batchSize, rows.length)}/${rows.length}\r`)
  }
  console.log()
}

// ── 1. ingredients → pantry_ingredients ─────────────────────
async function migrateIngredients() {
  console.log('\n[1/4] ingredients → pantry_ingredients')
  const rows = await fetchAll<Record<string, unknown>>(src, 'ingredients')
  console.log(`  원본: ${rows.length}행`)

  const transformed = rows.map(r => ({
    ...r,
    image_url: replaceUrl(r.image_url as string | null),
  }))

  await batchUpsert(dst, 'pantry_ingredients', transformed)
  console.log(`  ✅ ${rows.length}행 완료`)
}

// ── 2. recipes → pantry_recipes ──────────────────────────────
async function migrateRecipes() {
  console.log('\n[2/4] recipes → pantry_recipes')
  const rows = await fetchAll<Record<string, unknown>>(src, 'recipes')
  console.log(`  원본: ${rows.length}행`)

  const transformed = rows.map(r => ({
    ...r,
    hero_image_url: replaceUrl(r.hero_image_url as string | null),
  }))

  await batchUpsert(dst, 'pantry_recipes', transformed)
  console.log(`  ✅ ${rows.length}행 완료`)
}

// ── 3. recipe_ingredients → pantry_recipe_ingredients ────────
async function migrateRecipeIngredients() {
  console.log('\n[3/4] recipe_ingredients → pantry_recipe_ingredients')
  const rows = await fetchAll<Record<string, unknown>>(src, 'recipe_ingredients')
  console.log(`  원본: ${rows.length}행`)

  // 컬럼명은 그대로 (recipe_id, ingredient_id 등 동일)
  await batchUpsert(dst, 'pantry_recipe_ingredients', rows)
  console.log(`  ✅ ${rows.length}행 완료`)
}

// ── 4. recipe_steps → pantry_recipe_steps ────────────────────
async function migrateRecipeSteps() {
  console.log('\n[4/4] recipe_steps → pantry_recipe_steps')
  const rows = await fetchAll<Record<string, unknown>>(src, 'recipe_steps')
  console.log(`  원본: ${rows.length}행`)

  const transformed = rows.map(r => ({
    ...r,
    image_url: replaceUrl(r.image_url as string | null),
  }))

  await batchUpsert(dst, 'pantry_recipe_steps', transformed)
  console.log(`  ✅ ${rows.length}행 완료`)
}

// ── 검증 ─────────────────────────────────────────────────────
const OLD_DOMAIN = 'mzcdowxmmuefowcayzfk'

async function verify() {
  console.log('\n\n══════════════════════════════════════════════════════════')
  console.log('  검증')
  console.log('══════════════════════════════════════════════════════════')

  let failed = false

  // ── 1. 행 수 비교 ─────────────────────────────────────────
  console.log('\n[검증 1] 테이블별 행 수')
  const pairs: Array<[string, string]> = [
    ['ingredients',         'pantry_ingredients'],
    ['recipes',             'pantry_recipes'],
    ['recipe_ingredients',  'pantry_recipe_ingredients'],
    ['recipe_steps',        'pantry_recipe_steps'],
  ]
  for (const [srcTable, dstTable] of pairs) {
    const srcRows = await fetchAll(src, srcTable)
    const dstRows = await fetchAll(dst, dstTable)
    const ok = srcRows.length === dstRows.length
    if (!ok) failed = true
    console.log(
      `  ${ok ? '✅' : '❌'} ${srcTable}: 원본 ${srcRows.length} / 대상 ${dstRows.length}`,
    )
  }

  // ── 2. 구 도메인 잔존 검사 ───────────────────────────────
  console.log('\n[검증 2] 구 도메인 잔존 (3개 컬럼)')
  const urlChecks: Array<{ table: string; col: string }> = [
    { table: 'pantry_ingredients',        col: 'image_url' },
    { table: 'pantry_recipes',            col: 'hero_image_url' },
    { table: 'pantry_recipe_steps',       col: 'image_url' },
  ]
  for (const { table, col } of urlChecks) {
    const rows = await fetchAll<Record<string, string | null>>(dst, table, col)
    const bad = rows.filter(r => (r[col] ?? '').includes(OLD_DOMAIN)).length
    const ok = bad === 0
    if (!ok) failed = true
    console.log(`  ${ok ? '✅' : '❌'} ${table}.${col}: 구 도메인 ${bad}건`)
  }

  // ── 3. slug null / 중복 ───────────────────────────────────
  console.log('\n[검증 3] pantry_recipes slug')
  const recipes = await fetchAll<{ slug: string | null }>(dst, 'pantry_recipes', 'slug')
  const nullSlugs = recipes.filter(r => !r.slug).length
  const allSlugs  = recipes.map(r => r.slug).filter(Boolean) as string[]
  const dupSlugs  = new Set(allSlugs.filter((s, i) => allSlugs.indexOf(s) !== i))
  const okSlug = nullSlugs === 0 && dupSlugs.size === 0
  if (!okSlug) failed = true
  console.log(`  ${nullSlugs === 0 ? '✅' : '❌'} slug null: ${nullSlugs}건`)
  console.log(`  ${dupSlugs.size === 0 ? '✅' : '❌'} slug 중복: ${dupSlugs.size}건`)
  if (dupSlugs.size > 0) {
    console.log(`    중복 목록: ${[...dupSlugs].join(', ')}`)
  }

  // ── 4. 고아 행 검사 ──────────────────────────────────────
  console.log('\n[검증 4] 고아 행 (외래키 무결성)')

  const ingIds = new Set(
    (await fetchAll<{ id: string }>(dst, 'pantry_ingredients', 'id')).map(r => r.id),
  )
  const recIds = new Set(
    (await fetchAll<{ id: string }>(dst, 'pantry_recipes', 'id')).map(r => r.id),
  )

  const ri = await fetchAll<{ recipe_id: string; ingredient_id: string }>(
    dst, 'pantry_recipe_ingredients', 'recipe_id,ingredient_id',
  )
  const orphanRI = ri.filter(
    r => !recIds.has(r.recipe_id) || !ingIds.has(r.ingredient_id),
  ).length
  const okRI = orphanRI === 0
  if (!okRI) failed = true
  console.log(`  ${okRI ? '✅' : '❌'} pantry_recipe_ingredients 고아 행: ${orphanRI}건`)

  const rs = await fetchAll<{ recipe_id: string }>(
    dst, 'pantry_recipe_steps', 'recipe_id',
  )
  const orphanRS = rs.filter(r => !recIds.has(r.recipe_id)).length
  const okRS = orphanRS === 0
  if (!okRS) failed = true
  console.log(`  ${okRS ? '✅' : '❌'} pantry_recipe_steps 고아 행: ${orphanRS}건`)

  // ── 5. 치환된 URL HTTP 요청 확인 (샘플 3건) ──────────────
  console.log('\n[검증 5] 치환 URL 실제 접근 (샘플 3건)')

  // hero_image_url 샘플 1건
  const heroSample = (
    await fetchAll<{ hero_image_url: string | null }>(dst, 'pantry_recipes', 'hero_image_url')
  ).find(r => r.hero_image_url)
  // recipe_step image_url 샘플 1건
  const stepSample = (
    await fetchAll<{ image_url: string | null }>(dst, 'pantry_recipe_steps', 'image_url')
  ).find(r => r.image_url)
  // ingredient image_url 샘플 1건
  const ingSample = (
    await fetchAll<{ image_url: string | null }>(dst, 'pantry_ingredients', 'image_url')
  ).find(r => r.image_url)

  const samples: Array<{ label: string; url: string | null | undefined }> = [
    { label: 'pantry_recipes.hero_image_url',   url: heroSample?.hero_image_url },
    { label: 'pantry_recipe_steps.image_url',   url: stepSample?.image_url },
    { label: 'pantry_ingredients.image_url',    url: ingSample?.image_url },
  ]

  for (const { label, url } of samples) {
    if (!url) {
      console.log(`  ⚠️  ${label}: URL 없음 (건너뜀)`)
      continue
    }
    try {
      const res = await fetch(url, { method: 'HEAD' })
      const ok = res.status === 200
      if (!ok) failed = true
      console.log(`  ${ok ? '✅' : '❌'} ${label}`)
      console.log(`    ${url}`)
      console.log(`    HTTP ${res.status}`)
    } catch (e) {
      failed = true
      console.log(`  ❌ ${label}`)
      console.log(`    ${url}`)
      console.log(`    오류: ${e}`)
    }
  }

  // ── 최종 판정 ────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════')
  if (!failed) {
    console.log('✅ 검증 전항목 통과 — 4단계 진행 가능')
  } else {
    console.log('❌ 검증 실패 항목 있음 — 위 내용 확인 후 재처리')
    process.exit(1)
  }
}

// ── 메인 ─────────────────────────────────────────────────────
async function main() {
  console.log('══════════════════════════════════════════════════════════')
  console.log('  K-PANTRY 데이터 이전 (콘텐츠 4개 테이블)')
  console.log(`  출처: ${SRC_URL}`)
  console.log(`  대상: ${DST_URL}`)
  console.log('══════════════════════════════════════════════════════════')

  await migrateIngredients()
  await migrateRecipes()
  await migrateRecipeIngredients()
  await migrateRecipeSteps()

  await verify()
}

main().catch(e => { console.error(e); process.exit(1) })
