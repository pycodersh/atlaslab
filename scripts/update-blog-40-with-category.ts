/**
 * update-blog-40-with-category.ts
 * Downloads 폴더의 10개 JSON 파일(총 40건)을 blog_posts에 반영.
 *
 * 갱신 필드: slug / title / description / tags / content / category(컬럼 있을 때)
 * 유지 필드: published_at / is_paused / created_at / app / locale / pattern_id
 *
 * 실행: npx tsx scripts/update-blog-40-with-category.ts
 */

import * as dotenv from 'dotenv'
import * as path   from 'path'
import * as fs     from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

type PostPatch = {
  id:          string
  slug:        string
  title:       string
  description: string
  tags:        string[]
  content:     string
  category?:   string
}

const FILES = [
  'C:\\Users\\msj15\\Downloads\\kpatto-blog-rewrite-sample3.json',  // 3건
  'C:\\Users\\msj15\\Downloads\\kpatto-blog-batch1.json',           // 4건
  'C:\\Users\\msj15\\Downloads\\kpatto-blog-batch2.json',           // 3건
  'C:\\Users\\msj15\\Downloads\\kpatto-blog-batch3.json',           // 4건
  'C:\\Users\\msj15\\Downloads\\kpatto-blog-batch4.json',           // 4건
  'C:\\Users\\msj15\\Downloads\\kpatto-blog-batch5-6.json',         // 7건
  'C:\\Users\\msj15\\Downloads\\kpatto-blog-batch7.json',           // 4건
  'C:\\Users\\msj15\\Downloads\\kpatto-blog-batch8.json',           // 4건
  'C:\\Users\\msj15\\Downloads\\kpatto-blog-batch9.json',           // 4건
  'C:\\Users\\msj15\\Downloads\\kpatto-blog-batch10.json',          // 3건
]

async function checkCategoryColumn(): Promise<boolean> {
  // information_schema 조회로 category 컬럼 유무 확인
  const { data, error } = await sb
    .rpc('check_column_exists', { p_table: 'blog_posts', p_column: 'category' })
    .single()

  if (error) {
    // RPC 없을 경우 실제 쿼리로 fallback
    const { error: e2 } = await sb
      .from('blog_posts')
      .select('category')
      .limit(1)
    return !e2
  }
  return !!data
}

async function main() {
  // ── 파일 로드 ─────────────────────────────────────────────────────────────
  const posts: PostPatch[] = []
  for (const fp of FILES) {
    const raw = fs.readFileSync(fp, 'utf-8')
    const arr = JSON.parse(raw) as PostPatch[]
    console.log(`로드: ${path.basename(fp)} → ${arr.length}건`)
    posts.push(...arr)
  }
  console.log(`\n총 ${posts.length}건 처리 예정`)

  // ── 중복 slug 사전 검사 ───────────────────────────────────────────────────
  const slugMap = new Map<string, string[]>()
  for (const p of posts) {
    if (!slugMap.has(p.slug)) slugMap.set(p.slug, [])
    slugMap.get(p.slug)!.push(p.id.slice(0, 8))
  }
  const dupSlugs = [...slugMap.entries()].filter(([, ids]) => ids.length > 1)
  if (dupSlugs.length > 0) {
    console.warn('\n⚠️  JSON 내 중복 slug 발견:')
    for (const [slug, ids] of dupSlugs) {
      console.warn(`  "${slug}" → [${ids.join(', ')}]`)
    }
  } else {
    console.log('✓ JSON 내 slug 중복 없음')
  }

  // ── category 컬럼 존재 여부 확인 ──────────────────────────────────────────
  const hasCategoryCol = await checkCategoryColumn()
  console.log(`\ncategory 컬럼: ${hasCategoryCol ? '✓ 존재' : '✗ 없음'}`)
  if (!hasCategoryCol) {
    console.log('\n── category 컬럼 추가 안내 ─────────────────────────────────')
    console.log('Supabase SQL 에디터에서 아래 SQL을 실행한 뒤 스크립트를 재실행하세요:')
    console.log()
    console.log('  ALTER TABLE blog_posts ADD COLUMN category text;')
    console.log()
    console.log('현재 실행: category 제외하고 나머지 필드만 업데이트합니다.')
  }

  // ── 업데이트 전 스냅샷 ────────────────────────────────────────────────────
  const ids = posts.map(p => p.id)
  const { data: before, error: snapErr } = await sb
    .from('blog_posts')
    .select('id, slug, title, published_at, is_paused')
    .in('id', ids)
  if (snapErr) { console.error('\n스냅샷 실패:', snapErr.message); process.exit(1) }

  const foundIds = new Set((before ?? []).map(r => r.id))
  const missingIds = ids.filter(id => !foundIds.has(id))
  if (missingIds.length > 0) {
    console.warn(`\n⚠️  DB에서 찾을 수 없는 ID (${missingIds.length}건):`)
    for (const id of missingIds) {
      const p = posts.find(x => x.id === id)
      console.warn(`  ${id} (slug: ${p?.slug})`)
    }
  }

  console.log(`\n스냅샷: DB에서 ${(before ?? []).length}건 확인 (요청 ${posts.length}건)`)

  // ── 건별 업데이트 ─────────────────────────────────────────────────────────
  console.log('\n=== 업데이트 실행 ===')
  let ok = 0; let fail = 0
  const failedIds: string[] = []

  for (const p of posts) {
    const patch: Record<string, unknown> = {
      slug:        p.slug,
      title:       p.title,
      description: p.description,
      tags:        p.tags,
      content:     p.content,
    }
    if (hasCategoryCol && p.category) {
      patch.category = p.category
    }

    const { error } = await sb
      .from('blog_posts')
      .update(patch)
      .eq('id', p.id)

    if (error) {
      console.error(`  ✗ [${p.id.slice(0, 8)}] ${error.message}`)
      failedIds.push(p.id)
      fail++
    } else {
      const catStr = hasCategoryCol && p.category ? ` [${p.category}]` : ''
      console.log(`  ✓ [${p.id.slice(0, 8)}]${catStr} "${p.title.slice(0, 55)}"`)
      ok++
    }
  }

  // ── 업데이트 후 검증 ────────────────────────────────────────────────────
  const selectFields = hasCategoryCol
    ? 'id, slug, title, published_at, is_paused, category'
    : 'id, slug, title, published_at, is_paused'

  const { data: after } = await sb
    .from('blog_posts')
    .select(selectFields)
    .in('id', ids)

  console.log('\n=== 업데이트 후 확인 ===')
  let paChanged = 0
  for (const r of (after ?? []) as Record<string, string>[]) {
    const was = before?.find(b => b.id === r.id)
    const slugChanged = was?.slug !== r.slug ? ` (slug: ${was?.slug} → ${r.slug})` : ''
    const paOk = was?.published_at === r.published_at
    if (!paOk) paChanged++
    const paStr = paOk ? '✓' : `⚠️ 변경됨:${r.published_at}`
    const catStr = hasCategoryCol ? `  cat=${r.category ?? 'null'}` : ''
    console.log(`  [${r.id.slice(0, 8)}] is_paused=${r.is_paused}  published_at ${paStr}${catStr}${slugChanged}`)
  }

  // ── slug 전체 중복 DB 검사 ────────────────────────────────────────────────
  console.log('\n=== DB slug 중복 검사 ===')
  const { data: allSlugs } = await sb
    .from('blog_posts')
    .select('slug')
    .eq('app', 'k-patto')

  if (allSlugs) {
    const slugCount = new Map<string, number>()
    for (const row of allSlugs) {
      slugCount.set(row.slug, (slugCount.get(row.slug) ?? 0) + 1)
    }
    const dbDups = [...slugCount.entries()].filter(([, c]) => c > 1)
    if (dbDups.length > 0) {
      console.warn(`⚠️  DB에 중복 slug ${dbDups.length}건:`)
      for (const [slug, count] of dbDups) console.warn(`  "${slug}" × ${count}`)
    } else {
      console.log(`✓ DB k-patto 전체 ${allSlugs.length}편 slug 중복 없음`)
    }
  }

  // ── 최종 요약 ────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════')
  console.log(`완료: 성공 ${ok}건 / 실패 ${fail}건`)
  if (failedIds.length > 0) console.log('실패 ID:', failedIds.join(', '))
  if (paChanged > 0) console.warn(`⚠️  published_at 변경된 건수: ${paChanged}건`)
  if (!hasCategoryCol) {
    console.log('\n→ category 컬럼 추가 후 재실행하면 category도 함께 반영됩니다.')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
