/**
 * Basics 글 — 본문 맨 위에 12초 Remotion 쇼트 <KoreanBasicVideo slug="..." /> 삽입 (2026-11-04, 10편 → 33편)
 *
 * 영상 문구는 remotion/KoreanBasic/videos.json, 블로그 재생은 components/blog/KoreanBasicPlayer.
 * 대상은 videos.json 의 모든 slug 에서 '너 vs 당신'(따로 <DangerPronounsVideo />)을 뺀 것. 각 slug 의 모든 locale 행에 넣는다.
 * 새 글은 videos.json 에 항목 · 보이스오버를 더하고 배포한 뒤 이 스크립트를 다시 돌리면 된다.
 *
 * 안전장치: MDX 컴파일을 통과해야 쓰고, 바꾸기 전 본문은 scripts/backups/ 에 남긴다.
 * 쓰기 직전 본문을 다시 읽어 그 사이 바뀌었으면 멈춘다. 다시 돌리면 이미 들어간 것을 알아보고 건너뛴다.
 * 컴포넌트가 배포된 뒤에 돌릴 것 — 그 전에 태그가 들어가면 라이브 글이 모르는 태그로 깨진다.
 *
 * 실행: npx tsx scripts/update-blog-basics-videos.ts [--dry-run]
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

import { createClient } from '@supabase/supabase-js'
import videos from '../remotion/KoreanBasic/videos.json'

const SLUGS = Object.keys(videos).filter(s => s !== 'korean-never-say-dangsin-neo')
const DRY = process.argv.includes('--dry-run')

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } },
)

async function main() {
  if (!new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.startsWith('eecvvgkihtcgfikaimao')) throw new Error('patto Supabase 가 아니다 — 중단')

  const { data: posts, error } = await sb.from('blog_posts').select('id, slug, locale, content').in('slug', SLUGS)
  if (error) throw new Error(error.message)
  const absent = SLUGS.filter(s => !posts!.some(p => p.slug === s))
  if (absent.length) throw new Error(`DB 에 없는 slug: ${absent.join(', ')} — 중단`)

  const { compile } = await import('@mdx-js/mdx')
  const remarkGfm = (await import('remark-gfm')).default
  const dir = path.resolve(process.cwd(), 'scripts', 'backups')

  for (const post of posts!) {
    const tag = `<KoreanBasicVideo slug="${post.slug}" />`
    const before = post.content as string
    if (before.includes('<KoreanBasicVideo')) { console.log(`· [${post.locale}] ${post.slug} 이미 들어 있음 — 건너뜀`); continue }
    const next = `${tag}\n\n${before.replace(/^\s+/, '')}`
    await compile(next, { remarkPlugins: [remarkGfm] })
    console.log(`[${post.locale}] ${post.slug} — 길이 ${before.length} → ${next.length}, MDX OK`)
    if (DRY) continue

    fs.mkdirSync(dir, { recursive: true })
    const bak = path.join(dir, `${post.slug}-${post.locale}-${new Date().toISOString().replace(/[:.]/g, '-')}.md`)
    fs.writeFileSync(bak, before)
    const { data: again } = await sb.from('blog_posts').select('content').eq('id', post.id).single()
    if (again?.content !== before) throw new Error(`[${post.locale}] ${post.slug} 그 사이 본문이 바뀌었다 — 쓰지 않고 중단`)
    const { error: upErr } = await sb.from('blog_posts').update({ content: next }).eq('id', post.id)
    if (upErr) throw new Error(upErr.message)
    console.log(`✅ [${post.locale}] ${post.slug} 저장 (백업: ${path.relative(process.cwd(), bak)})`)
  }
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
