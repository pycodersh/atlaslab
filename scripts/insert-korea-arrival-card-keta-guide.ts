/**
 * blog_posts 1건 INSERT — Life in Korea 탭(영어): korea-arrival-card-keta-guide
 * 원고: content/blog/korea-arrival-card-keta-guide.mdx (frontmatter 가 단일 출처)
 * Life 탭 기존 글과 같이 app='k-patto' / locale='en' / category='Korean Culture'.
 * 사실 확인(2026-11-05): K-ETA 22개국 한시 면제 2026-12-31까지 연장, 수수료 10,000원 · 유효 3년,
 *   e-Arrival Card 도착 3일 전부터 · 72시간 유효 · 무료, Smart Entry 42개 국가·지역(2026-03-16).
 * 같은 slug 가 이미 있으면 멈춘다. MDX 를 컴파일해 보고 넣는다.
 *
 * 실행: npx tsx scripts/insert-korea-arrival-card-keta-guide.ts [--dry-run]
 */
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'

const SLUG = 'korea-arrival-card-keta-guide'
const DRY = process.argv.includes('--dry-run')

async function main() {
  if (!new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.startsWith('eecvvgkihtcgfikaimao')) throw new Error('patto Supabase 가 아니다 — 중단')
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  )
  const { data: fm, content: raw } = matter(fs.readFileSync(path.resolve('content/blog', `${SLUG}.mdx`), 'utf8'))
  const content = raw.trim()
  if (fm.slug !== SLUG) throw new Error('frontmatter slug 불일치')

  const { compile } = await import('@mdx-js/mdx')
  const remarkGfm = (await import('remark-gfm')).default
  await compile(content, { remarkPlugins: [remarkGfm] })

  const { data: dup } = await sb.from('blog_posts').select('id').eq('slug', SLUG)
  if (dup?.length) throw new Error('이미 있는 slug — 중단')

  const row = {
    app: fm.app, category: fm.category, locale: 'en', slug: SLUG,
    title: fm.title, description: String(fm.description).trim(), tags: fm.tags,
    content, is_paused: false, thumbnail: null,
    published_at: new Date(Date.now() - 60_000).toISOString(),
  }
  console.log({ ...row, content: `${content.split(/\s+/).length} words` })
  if (DRY) return
  const { data, error } = await sb.from('blog_posts').insert(row).select('id, slug, published_at')
  if (error) throw error
  console.log('inserted', data)
}
main().catch(e => { console.error(e); process.exit(1) })
