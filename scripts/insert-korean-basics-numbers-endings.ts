/**
 * Korean basics 새 글 6편 INSERT (2026-11-04) — Numbers & Counters 4편 + Sentence Endings & Nuances 2편.
 *
 * 원고는 content/blog/<slug>.mdx (frontmatter: title · description · tags · category). 본문 맨 위에 <KoreanBasicVideo />,
 * 중간 · 끝에 <KpattoCta variant="mid|end" /> 가 들어 있다(본문 CTA 가 있으면 글 하단 앱 배너는 따로 나오지 않는다).
 * app='k-patto', locale='en', category='Korean Grammar' — Basics 안의 칩은 lib/blog/subcategories 의 슬러그 매핑이 정한다.
 *
 * 하는 일: slug 충돌 확인(일시중지 글 포함) → MDX 컴파일 시험 → INSERT(published_at 은 1분 간격 과거 시각).
 * 영상 데이터(videos.json)와 컴포넌트가 배포된 뒤에 돌릴 것 — 글 상세는 첫 방문 때 구워 하루 캐시한다.
 *
 * 실행: npx tsx scripts/insert-korean-basics-numbers-endings.ts [--dry-run]
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'
import videos from '../remotion/KoreanBasic/videos.json'

const SLUGS = [
  'korean-counters-gae-myeong-jan-byeong',
  'korean-prices-money-eolmayeyo',
  'korean-dates-days-of-week',
  'korean-age-sal-man-nai',
  'korean-requests-a-eo-juseyo',
  'korean-because-aseo-vs-euni-kka',
]
const DRY = process.argv.includes('--dry-run')

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } },
)

async function main() {
  if (!new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.startsWith('eecvvgkihtcgfikaimao')) throw new Error('patto Supabase 가 아니다 — 중단')
  const { compile } = await import('@mdx-js/mdx')
  const remarkGfm = (await import('remark-gfm')).default

  const rows = []
  for (const [i, slug] of SLUGS.entries()) {
    const file = path.resolve(process.cwd(), 'content', 'blog', `${slug}.mdx`)
    const { data: fm, content: raw } = matter(fs.readFileSync(file, 'utf8'))
    const content = raw.trim()
    if (fm.slug !== slug) throw new Error(`${slug}: frontmatter slug 가 다르다 (${fm.slug})`)
    if (!(slug in videos)) throw new Error(`${slug}: videos.json 에 영상 항목이 없다`)
    if (!content.startsWith(`<KoreanBasicVideo slug="${slug}" />`)) throw new Error(`${slug}: 본문 맨 위 영상 태그가 없다`)
    await compile(content, { remarkPlugins: [remarkGfm] })
    const { data: ex, error } = await sb.from('blog_posts').select('slug, is_paused').eq('slug', slug)
    if (error) throw new Error(error.message)
    if (ex?.length) throw new Error(`slug 충돌 — 중단: ${slug} ${JSON.stringify(ex)}`)
    console.log(`✅ ${slug}: ${content.split(/\s+/).length}단어, MDX OK, 충돌 없음`)
    rows.push({
      slug, locale: 'en', app: 'k-patto', category: fm.category ?? 'Korean Grammar',
      tags: fm.tags, title: fm.title, description: String(fm.description).trim(), content,
      // 1분 간격, 모두 현재보다 과거(미래면 사이트맵 lte(now) 에서 빠진다). 순서: 첫 글이 더 앞.
      published_at: new Date(Date.now() - (SLUGS.length - i + 1) * 60_000).toISOString().replace(/\.\d{3}Z$/, '+00:00'),
      is_paused: false,
    })
  }
  if (DRY) return

  const { data: inserted, error: insErr } = await sb.from('blog_posts').insert(rows).select('id, slug, category, published_at')
  if (insErr) throw new Error(`INSERT 실패: ${insErr.message}`)
  console.log('✅ INSERT 완료', JSON.stringify(inserted, null, 2))
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
