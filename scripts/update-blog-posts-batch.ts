/**
 * update-blog-posts-batch.ts
 * Downloads 폴더의 두 JSON 파일(총 7건)을 blog_posts에 반영.
 *
 * 갱신 필드: slug / title / description / tags / content
 * 유지 필드: published_at / is_paused / created_at / app / locale / pattern_id
 * category  : DB에 해당 컬럼 없음 → 무시
 *
 * 실행: npx tsx scripts/update-blog-posts-batch.ts
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
  category?:   string   // DB 컬럼 없음 — 무시
}

const FILES = [
  'C:\\Users\\msj15\\Downloads\\kpatto-blog-rewrite-sample3.json',
  'C:\\Users\\msj15\\Downloads\\kpatto-blog-batch1.json',
]

async function main() {
  // ── 파일 로드 ─────────────────────────────────────────────────────────────
  const posts: PostPatch[] = []
  for (const fp of FILES) {
    const raw = fs.readFileSync(fp, 'utf-8')
    const arr = JSON.parse(raw) as PostPatch[]
    console.log(`로드: ${path.basename(fp)} → ${arr.length}건`)
    posts.push(...arr)
  }
  console.log(`총 ${posts.length}건 처리 예정\n`)

  // ── 업데이트 전 현재 상태 스냅샷 ────────────────────────────────────────
  const ids = posts.map(p => p.id)
  const { data: before, error: snapErr } = await sb
    .from('blog_posts')
    .select('id, slug, title, published_at, is_paused')
    .in('id', ids)
  if (snapErr) { console.error('스냅샷 실패:', snapErr.message); process.exit(1) }

  console.log('=== 업데이트 전 현재 상태 ===')
  for (const r of (before ?? [])) {
    console.log(`  [${r.id.slice(0,8)}] is_paused=${r.is_paused}  published_at=${r.published_at?.slice(0,10)}  slug=${r.slug}`)
  }
  if ((before ?? []).length !== posts.length) {
    console.warn(`\n⚠️  스냅샷 ${(before ?? []).length}건 — 요청 ${posts.length}건 불일치. ID 누락 확인 필요.`)
  }

  // ── 건별 업데이트 ─────────────────────────────────────────────────────────
  console.log('\n=== 업데이트 실행 ===')
  let ok = 0; let fail = 0
  for (const p of posts) {
    const { error } = await sb
      .from('blog_posts')
      .update({
        slug:        p.slug,
        title:       p.title,
        description: p.description,
        tags:        p.tags,
        content:     p.content,
        // published_at / is_paused / created_at / app / locale → 건드리지 않음
      })
      .eq('id', p.id)

    if (error) {
      console.error(`  ✗ [${p.id.slice(0,8)}] ${error.message}`)
      fail++
    } else {
      console.log(`  ✓ [${p.id.slice(0,8)}] "${p.title.slice(0,50)}"`)
      ok++
    }
  }

  // ── 업데이트 후 확인 ────────────────────────────────────────────────────
  const { data: after } = await sb
    .from('blog_posts')
    .select('id, slug, title, published_at, is_paused')
    .in('id', ids)

  console.log('\n=== 업데이트 후 확인 ===')
  for (const r of (after ?? [])) {
    const was = before?.find(b => b.id === r.id)
    const slugChanged = was?.slug !== r.slug ? ` (slug: ${was?.slug} → ${r.slug})` : ''
    const paOk = was?.published_at === r.published_at ? '✓' : `⚠️ 변경됨:${r.published_at}`
    console.log(`  [${r.id.slice(0,8)}] is_paused=${r.is_paused}  published_at ${paOk}${slugChanged}`)
  }

  console.log(`\n완료: 성공 ${ok}건 / 실패 ${fail}건`)

  // ── category 컬럼 안내 ──────────────────────────────────────────────────
  const hasCat = posts.some(p => p.category)
  if (hasCat) {
    console.log('\n── category 컬럼 안내 ───────────────────────────────────')
    console.log('kpatto-blog-batch1.json 4건에 "category" 필드가 있으나')
    console.log('blog_posts 테이블에 category 컬럼이 없어 반영하지 않았습니다.')
    console.log('\n필요하다면 Supabase에서 아래 SQL을 실행해 컬럼을 추가하세요:')
    console.log('  ALTER TABLE blog_posts ADD COLUMN category text;')
    console.log('이후 이 스크립트에 category 업데이트 로직을 추가하면 됩니다.')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
