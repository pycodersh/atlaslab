/**
 * Phrases(Real-Life Korean) 글 본문 개편 반영 — content/blog/<slug>.mdx 를 원고로 DB 행을 고친다 (2026-11-04~)
 *
 * 개편 기준(샘플 3편으로 확정): 상투적 도입 · 맺음 사설 삭제, 제목 상황 밖 곁다리 절 삭제,
 * 반말 / 존댓말 대조표, 점원 · 상대가 하는 말(+ 대답 예시), 실제 발음 · 구어 뉘앙스, 발음대로 로마자,
 * 끝 CTA 는 공통 카드 <KpattoCta variant="end" />. 대화(The exchange)와 <YouTube /> 는 영상과 맞아야 해서 그대로 둔다.
 *
 * 고치는 컬럼: content · description · tags (title · slug · category · published_at 은 그대로).
 * 안전장치: frontmatter slug 일치 · 원래 본문의 YouTube id 가 새 본문에도 그대로 있는지 · MDX 컴파일 통과를 확인하고,
 * 바꾸기 전 행(content · description · tags)을 scripts/backups/ 에 JSON 으로 남긴다. 쓰기 직전 다시 읽어 그 사이 바뀌었으면 멈춘다.
 * 이미 원고와 같은 행은 건너뛴다.
 *
 * 글 상세는 force-static(하루 revalidate)이라, 반영 뒤 배포(빌드)가 있어야 화면에 나온다.
 *
 * 실행: npx tsx scripts/update-blog-phrases-rewrite.ts <slug> [<slug> ...] [--dry-run]
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'

const DRY = process.argv.includes('--dry-run')
const SLUGS = process.argv.slice(2).filter(a => !a.startsWith('--'))

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } },
)

const youtubeIds = (s: string) => [...s.matchAll(/<YouTube\s+[^>]*id="([^"]+)"/g)].map(m => m[1]).sort().join(',')
const sameTags = (a: unknown, b: unknown) => JSON.stringify(a ?? []) === JSON.stringify(b ?? [])

async function main() {
  if (!SLUGS.length) throw new Error('slug 를 하나 이상 넘길 것')
  if (!new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.startsWith('eecvvgkihtcgfikaimao')) throw new Error('patto Supabase 가 아니다 — 중단')
  const { compile } = await import('@mdx-js/mdx')
  const remarkGfm = (await import('remark-gfm')).default
  const dir = path.resolve(process.cwd(), 'scripts', 'backups')

  for (const slug of SLUGS) {
    const file = path.resolve(process.cwd(), 'content', 'blog', `${slug}.mdx`)
    const { data: fm, content: raw } = matter(fs.readFileSync(file, 'utf8'))
    const content = raw.trim()
    const description = String(fm.description ?? '').trim()
    const tags = fm.tags as string[]
    if (fm.slug !== slug) throw new Error(`${slug}: frontmatter slug 가 다르다 (${fm.slug})`)
    if (fm.category !== 'Real-Life Korean') throw new Error(`${slug}: Phrases 글이 아니다 (${fm.category})`)
    if (!description || !Array.isArray(tags) || !tags.length) throw new Error(`${slug}: description · tags 가 비었다`)
    await compile(content, { remarkPlugins: [remarkGfm] })

    const { data: rows, error } = await sb.from('blog_posts').select('id, locale, content, description, tags').eq('slug', slug)
    if (error) throw new Error(error.message)
    if (!rows?.length) throw new Error(`${slug}: DB 에 없다`)

    for (const row of rows) {
      if (row.content === content && row.description === description && sameTags(row.tags, tags)) {
        console.log(`· [${row.locale}] ${slug} 이미 원고와 같다 — 건너뜀`)
        continue
      }
      if (youtubeIds(row.content) !== youtubeIds(content)) {
        throw new Error(`${slug}: YouTube id 가 바뀌었다 (${youtubeIds(row.content)} → ${youtubeIds(content)}) — 대화 영상과 어긋난다, 중단`)
      }
      const words = (s: string) => s.split(/\s+/).length
      console.log(`[${row.locale}] ${slug} — ${words(row.content)} → ${words(content)}단어, MDX OK, YouTube ${youtubeIds(content) || '없음'}`)
      if (DRY) continue

      fs.mkdirSync(dir, { recursive: true })
      const bak = path.join(dir, `${slug}-${row.locale}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
      fs.writeFileSync(bak, JSON.stringify({ content: row.content, description: row.description, tags: row.tags }, null, 2))
      const { data: again } = await sb.from('blog_posts').select('content, description').eq('id', row.id).single()
      if (again?.content !== row.content || again?.description !== row.description) throw new Error(`${slug}: 그 사이 행이 바뀌었다 — 쓰지 않고 중단`)
      const { error: upErr } = await sb.from('blog_posts').update({ content, description, tags }).eq('id', row.id)
      if (upErr) throw new Error(upErr.message)
      console.log(`✅ [${row.locale}] ${slug} 저장 (백업: ${path.relative(process.cwd(), bak)})`)
    }
  }
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
