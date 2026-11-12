/**
 * content/stays/*.mdx (Explore Korea › Hotels) · content/explore/*.mdx (Explore Korea › Places) → blog_posts 업서트
 *
 * 원고 파일이 단일 출처다. frontmatter 의 title · description · category · tags 를 쓰고, 본문은 frontmatter 를 뗀 MDX 그대로 넣는다.
 * 본문이 쓰는 <StayMap> · <BookingCta> 는 components/blog/mdxComponents 에 있으니,
 * 그 컴포넌트가 들어간 배포가 프로덕션에 올라간 뒤에 돌릴 것(먼저 넣으면 글 페이지가 렌더 오류로 죽는다).
 *
 * 실행: npx tsx scripts/publish-stays.ts [--dry] [slug ...]
 *   --dry  MDX 컴파일 · 섹션 판정만 하고 DB 에 쓰지 않는다
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import matter from 'gray-matter'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { topicSectionKey } from '../lib/blog/sections'

const APP = 'k-patto'
const LOCALE = 'en'
const PROD = 'https://www.atlaslabstudios.com'
// content/stays = Explore Korea › Hotels, content/explore = Explore Korea › Places(여행지 · 투어 · 컬처 가이드)
const DIRS = [path.resolve(process.cwd(), 'content', 'stays'), path.resolve(process.cwd(), 'content', 'explore')]
const ALLOWED_SECTIONS = new Set(['hotels', 'places'])

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const only = args.filter(a => !a.startsWith('--'))

async function main() {
  const { compile } = await import('@mdx-js/mdx')
  const { default: remarkGfm } = await import('remark-gfm')

  const files = DIRS.filter(d => fs.existsSync(d)).flatMap(d => fs.readdirSync(d).filter(f => f.endsWith('.mdx')).map(f => path.join(d, f)))
  const posts = files.map(file => {
    const f = path.basename(file)
    const { data, content } = matter(fs.readFileSync(file, 'utf8'))
    return {
      slug: String(data.slug ?? f.replace(/\.mdx$/, '')),
      locale: LOCALE,
      app: APP,
      category: String(data.category),
      tags: (data.tags ?? []) as string[],
      title: String(data.title),
      description: String(data.description ?? ''),
      content: content.trim(),
      // featured_image 가 업로드된 URL(scripts/upload-stay-images.ts)이면 카드 · 상단 썸네일로 쓴다. 아니면 DB 값을 건드리지 않는다
      ...(/^https?:\/\//.test(String(data.featured_image ?? '')) ? { thumbnail: String(data.featured_image) } : {}),
    }
  }).filter(p => !only.length || only.includes(p.slug))

  for (const p of posts) {
    const section = topicSectionKey(p.app, p.category)
    if (!section || !ALLOWED_SECTIONS.has(section)) throw new Error(`${p.slug}: Hotels · Places 섹션이 아니다(${section})`)
    if (/<!--/.test(p.content)) throw new Error(`${p.slug}: HTML 주석이 남아 있다(MDX 오류 원인)`)
    if (!p.description) throw new Error(`${p.slug}: description 없음`)
    await compile(p.content, { remarkPlugins: [remarkGfm] })
    console.log(`✅ ${p.slug} — ${p.content.length} chars, MDX 컴파일 통과, 섹션 ${section}`)
  }
  if (dry) { console.log('\n--dry: DB 에 쓰지 않음'); return }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  )

  for (const p of posts) {
    const { data: existing, error: chkErr } = await sb.from('blog_posts').select('id, app, locale').eq('slug', p.slug)
    if (chkErr) throw new Error(`조회 실패: ${chkErr.message}`)
    const same = existing?.find(r => r.app === APP && r.locale === LOCALE)
    if (existing?.length && !same) throw new Error(`${p.slug}: 다른 app/locale 에 같은 slug 가 있다 ${JSON.stringify(existing)}`)

    if (same) {
      const { error } = await sb.from('blog_posts').update(p).eq('id', same.id)
      if (error) throw new Error(`UPDATE 실패: ${error.message}`)
      console.log(`↻ 갱신 ${p.slug}`)
    } else {
      const row = { ...p, is_paused: false, published_at: new Date(Date.now() - 2 * 60_000).toISOString() }
      const { error } = await sb.from('blog_posts').insert(row)
      if (error) throw new Error(`INSERT 실패: ${error.message}`)
      console.log(`＋ 새 글 ${p.slug}`)
    }
  }

  // ── 프로덕션 확인 ──
  for (const p of posts) {
    const url = `${PROD}/blog/${LOCALE}/${APP}/${p.slug}`
    const res = await fetch(url)
    const html = await res.text()
    // 호텔 글은 지도 · 예약 버튼이 있어야 하고, 여행지(Places) 글은 200 이면 된다
    const hotel = topicSectionKey(p.app, p.category) === 'hotels'
    const parts = hotel ? html.includes('stay-map') && html.includes('booking-cta') : true
    const ok = res.status === 200 && parts
    console.log(`${ok ? '✅' : '❌'} HTTP ${res.status}${hotel ? ` 지도·버튼 ${parts ? '있음' : '없음'}` : ''}  ${url}`)
  }
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
