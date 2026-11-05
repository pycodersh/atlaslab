/**
 * DB 의 글을 content/blog/<slug>.mdx 로 내려받는다 — 로컬 원고가 없는 글을 개편하기 전에 원본을 파일로 잡아 둔다.
 *
 * frontmatter 는 다른 원고와 같은 모양(app · category · slug · title · description · tags)이고 본문은 DB 그대로다.
 * 이미 파일이 있으면 덮어쓰지 않는다(--force 로만). 개편한 원고는 scripts/update-blog-phrases-rewrite.ts 가 DB 로 올린다.
 *
 * 실행: npx tsx scripts/export-blog-posts-to-mdx.ts <slug> [...]
 *       npx tsx scripts/export-blog-posts-to-mdx.ts --category "Real-Life Korean"   # 그 카테고리에서 파일이 없는 글 전부
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'

const args = process.argv.slice(2)
const force = args.includes('--force')
const catIdx = args.indexOf('--category')
const category = catIdx >= 0 ? args[catIdx + 1] : null
// --category 가 없으면 catIdx 가 -1 이라 catIdx + 1 = 0 이 되어 첫 slug 를 빠뜨렸다(2026-11-05 수정)
const slugs = args.filter((a, i) => !a.startsWith('--') && (catIdx < 0 || i !== catIdx + 1))

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } },
)

async function main() {
  let q = sb.from('blog_posts').select('slug, locale, app, category, title, description, tags, content').eq('locale', 'en')
  if (category) q = q.eq('category', category)
  else if (slugs.length) q = q.in('slug', slugs)
  else throw new Error('slug 또는 --category 를 넘길 것')
  const { data, error } = await q
  if (error) throw new Error(error.message)

  const dir = path.resolve(process.cwd(), 'content', 'blog')
  for (const p of data!) {
    const file = path.join(dir, `${p.slug}.mdx`)
    if (fs.existsSync(file) && !force) continue
    const fm = { app: p.app, category: p.category, slug: p.slug, title: p.title, description: p.description, tags: p.tags ?? [] }
    fs.writeFileSync(file, matter.stringify(`\n${p.content.trim()}\n`, fm))
    console.log(`✓ ${p.slug}`)
  }
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
