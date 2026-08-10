/**
 * kpantry-check-slugs.ts
 * k-pantry recipes 테이블 slug 컬럼 검증 + null 건 slug 자동 생성
 *
 * 실행:
 *   npm run tsx scripts/kpantry-check-slugs.ts
 *   (또는: npx tsx scripts/kpantry-check-slugs.ts)
 *
 * 전제 조건:
 *   .env.local 에 NEXT_PUBLIC_KPANTRY_SUPABASE_URL
 *               및 NEXT_PUBLIC_KPANTRY_SUPABASE_ANON_KEY 가 있어야 함
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const URL  = process.env.NEXT_PUBLIC_KPANTRY_SUPABASE_URL
const KEY  = process.env.NEXT_PUBLIC_KPANTRY_SUPABASE_ANON_KEY

if (!URL || !KEY) {
  console.error('❌ .env.local 에 NEXT_PUBLIC_KPANTRY_SUPABASE_URL / NEXT_PUBLIC_KPANTRY_SUPABASE_ANON_KEY 가 없습니다.')
  process.exit(1)
}

const supabase = createClient(URL, KEY)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[''()&,/]/g, '')   // 특수문자 제거
    .replace(/\s+/g, '-')        // 공백 → 하이픈
    .replace(/-+/g, '-')         // 다중 하이픈 → 단일
    .replace(/^-|-$/g, '')       // 앞뒤 하이픈 제거
}

async function main() {
  // ── 1. 전체 레시피 조회
  const { data: recipes, error: fetchErr } = await supabase
    .from('recipes')
    .select('id, name_en, slug')
    .order('name_en')

  if (fetchErr) {
    console.error('❌ 조회 실패:', fetchErr.message)
    process.exit(1)
  }

  const total     = recipes.length
  const nullCount = recipes.filter(r => !r.slug).length
  const allSlugs  = recipes.map(r => r.slug).filter(Boolean) as string[]
  const dupSlugs  = allSlugs.filter((s, i) => allSlugs.indexOf(s) !== i)

  console.log(`\n총 레시피: ${total}건`)
  console.log(`slug null:  ${nullCount}건`)
  console.log(`slug 중복:  ${[...new Set(dupSlugs)].length}건`)

  if (nullCount === 0 && dupSlugs.length === 0) {
    console.log('\n✅ 모든 레시피에 유니크 slug 있음 — 작업 불필요')
    return
  }

  if (dupSlugs.length > 0) {
    console.warn('\n⚠️ 중복 slug (대시보드 SQL로 수동 수정 필요):')
    ;[...new Set(dupSlugs)].forEach(s => console.warn(`  - ${s}`))
  }

  if (nullCount === 0) return

  // ── 2. null 레코드에 slug 생성
  console.log('\nslug 생성 중...')

  const usedSlugs = new Set<string>(allSlugs)
  const updates: Array<{ id: string; slug: string; nameEn: string }> = []

  for (const r of recipes) {
    if (r.slug) continue

    let base = slugify(r.name_en)
    if (!base) base = r.id  // 폴백: UUID

    let candidate = base
    let counter = 2
    while (usedSlugs.has(candidate)) {
      candidate = `${base}-${counter++}`
    }
    usedSlugs.add(candidate)
    updates.push({ id: r.id, slug: candidate, nameEn: r.name_en })
  }

  console.log(`생성 대상 ${updates.length}건:`)
  updates.forEach(u => console.log(`  ${u.nameEn.padEnd(30)} → ${u.slug}`))

  // ── 3. DB 업데이트 (50건씩 배치)
  const BATCH = 50
  let done = 0
  for (let i = 0; i < updates.length; i += BATCH) {
    const batch = updates.slice(i, i + BATCH)
    for (const { id, slug } of batch) {
      const { error: e } = await supabase
        .from('recipes')
        .update({ slug })
        .eq('id', id)
      if (e) console.error(`  id=${id} 실패: ${e.message}`)
    }
    done += batch.length
    process.stdout.write(`  ${done}/${updates.length} 완료\r`)
  }
  console.log()

  // ── 4. 재검증
  const { data: after } = await supabase
    .from('recipes')
    .select('slug')

  const nullAfter = (after ?? []).filter(r => !r.slug).length
  const slugsAfter = (after ?? []).map(r => r.slug).filter(Boolean) as string[]
  const dupAfter   = slugsAfter.filter((s, i) => slugsAfter.indexOf(s) !== i)

  console.log(`\n─── 결과 ───`)
  console.log(`null 건수: ${nullAfter} ${nullAfter === 0 ? '✅' : '❌'}`)
  console.log(`중복 건수: ${[...new Set(dupAfter)].length} ${dupAfter.length === 0 ? '✅' : '❌'}`)
}

main().catch(e => { console.error(e); process.exit(1) })
