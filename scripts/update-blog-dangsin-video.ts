/**
 * '너 vs 당신' 글(korean-never-say-dangsin-neo) — 본문 맨 위에 12초 Remotion 쇼트 <DangerPronounsVideo /> 삽입 (2026-11-04)
 *
 * 영상은 remotion/KoreanBasic/DangerPronounsVideo, 블로그 재생은 components/blog/DangerPronounsPlayer.
 * 이 slug 의 모든 locale 행에 넣는다. 첫 문단 앞에 태그 한 줄 + 빈 줄.
 *
 * 안전장치: MDX 컴파일을 통과해야 쓰고, 바꾸기 전 본문은 scripts/backups/ 에 남긴다.
 * 쓰기 직전 본문을 다시 읽어 그 사이 바뀌었으면 멈춘다. 다시 돌리면 이미 들어간 것을 알아보고 건너뛴다.
 *
 * 실행: npx tsx scripts/update-blog-dangsin-video.ts [--dry-run]
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

import { createClient } from '@supabase/supabase-js'

const SLUG = 'korean-never-say-dangsin-neo'
const DRY = process.argv.includes('--dry-run')
const TAG = '<DangerPronounsVideo />'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } },
)

async function main() {
  if (!new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.startsWith('eecvvgkihtcgfikaimao')) throw new Error('patto Supabase 가 아니다 — 중단')
  const { data: posts, error } = await sb.from('blog_posts').select('id, locale, content').eq('slug', SLUG)
  if (error) throw new Error(error.message)
  if (!posts?.length) throw new Error(`${SLUG} 행이 없다 — 중단`)

  const { compile } = await import('@mdx-js/mdx')
  const remarkGfm = (await import('remark-gfm')).default
  const dir = path.resolve(process.cwd(), 'scripts', 'backups')

  for (const post of posts) {
    const before = post.content as string
    if (before.includes(TAG)) { console.log(`· [${post.locale}] 이미 들어 있음 — 건너뜀`); continue }
    const next = `${TAG}\n\n${before.replace(/^\s+/, '')}`
    await compile(next, { remarkPlugins: [remarkGfm] })
    console.log(`[${post.locale}] 맨 위에 ${TAG} — 길이 ${before.length} → ${next.length}, MDX OK`)
    if (DRY) continue

    fs.mkdirSync(dir, { recursive: true })
    const bak = path.join(dir, `${SLUG}-${post.locale}-${new Date().toISOString().replace(/[:.]/g, '-')}.md`)
    fs.writeFileSync(bak, before)
    const { data: again } = await sb.from('blog_posts').select('content').eq('id', post.id).single()
    if (again?.content !== before) throw new Error(`[${post.locale}] 그 사이 본문이 바뀌었다 — 쓰지 않고 중단`)
    const { error: upErr } = await sb.from('blog_posts').update({ content: next }).eq('id', post.id)
    if (upErr) throw new Error(upErr.message)
    console.log(`✅ [${post.locale}] 저장 (백업: ${path.relative(process.cwd(), bak)})`)
  }
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
