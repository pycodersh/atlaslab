/**
 * 새 글 INSERT — content/blog/<slug>.mdx 의 frontmatter(app · category · title · description · tags)가 단일 출처.
 * locale 은 'en'. 같은 slug 가 이미 있으면 멈추고, MDX 를 컴파일해 본 뒤에만 넣는다.
 * 여러 편을 넘기면 넘긴 순서대로 1분 간격의 published_at(모두 과거)을 준다.
 *
 * 넣은 글:
 *   2026-11-05 korea-arrival-card-keta-guide (Life) — 사실 확인: K-ETA 22개국 한시 면제 2026-12-31까지,
 *     수수료 10,000원 · 유효 3년, e-Arrival Card 도착 3일 전부터 · 72시간 유효 · 무료, Smart Entry 42개 국가·지역(2026-03-16)
 *   2026-11-05 seoul-itinerary-first-timers-3-4-5-days (Places), how-to-read-korean-restaurant-menu (Food),
 *     korea-currency-exchange-cards-wowpass-guide (Life) — 사용자 원고를 사이트 컴포넌트 규격으로 옮기고 사실을 고쳤다
 *
 * --paused: 감춘 채(is_paused true) 넣는다. 목록 · 사이트맵 · 글 페이지 모두 is_paused 로 거르므로 공개되지 않는다.
 *   공개할 때는 is_paused 를 false 로, published_at 을 공개 시각으로 바꾼다.
 *
 * 실행: npx tsx scripts/insert-blog-posts-from-mdx.ts <slug> [<slug> …] [--paused] [--dry-run]
 */
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'

const DRY = process.argv.includes('--dry-run')
const PAUSED = process.argv.includes('--paused')
const SLUGS = process.argv.slice(2).filter(a => !a.startsWith('--'))

async function main() {
  if (!SLUGS.length) throw new Error('slug 를 하나 이상 넘길 것')
  if (!new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.startsWith('eecvvgkihtcgfikaimao')) throw new Error('patto Supabase 가 아니다 — 중단')
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  )
  const { compile } = await import('@mdx-js/mdx')
  const remarkGfm = (await import('remark-gfm')).default

  // 먼저 전부 검사하고, 하나라도 문제가 있으면 아무것도 넣지 않는다
  const rows = []
  for (const [i, slug] of SLUGS.entries()) {
    const { data: fm, content: raw } = matter(fs.readFileSync(path.resolve('content/blog', `${slug}.mdx`), 'utf8'))
    const content = raw.trim()
    if (fm.slug !== slug) throw new Error(`${slug}: frontmatter slug 불일치`)
    if (!fm.app || !fm.category || !fm.title || !String(fm.description ?? '').trim() || !Array.isArray(fm.tags)) throw new Error(`${slug}: frontmatter 가 비었다`)
    await compile(content, { remarkPlugins: [remarkGfm] })
    const { data: dup } = await sb.from('blog_posts').select('id').eq('slug', slug)
    if (dup?.length) throw new Error(`${slug}: 이미 있는 slug — 중단`)
    rows.push({
      app: fm.app, category: fm.category, locale: 'en', slug,
      title: fm.title, description: String(fm.description).trim(), tags: fm.tags,
      content, is_paused: PAUSED, thumbnail: null,
      published_at: new Date(Date.now() - (SLUGS.length - i) * 60_000).toISOString(),
    })
  }
  if (PAUSED) console.log('— 감춘 채(is_paused: true) 넣는다')
  for (const r of rows) console.log(r.slug, '|', r.category, '|', r.title, '|', `${r.content.split(/\s+/).length} words`)
  if (DRY) return
  const { data, error } = await sb.from('blog_posts').insert(rows).select('slug, published_at')
  if (error) throw error
  console.log('inserted', data)
}
main().catch(e => { console.error(e); process.exit(1) })
