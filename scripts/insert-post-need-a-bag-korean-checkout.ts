/**
 * blog_posts 단건 INSERT — 'need-a-bag-korean-checkout'
 * locale='en', app='k-patto', is_paused=false
 *
 * content 는 원고 훼손을 막기 위해 별도 .md 파일에서 그대로 읽는다.
 * 본문 <YouTube id="1f4_AGypPRc" /> 는 oEmbed 로 실존·제목을 먼저 확인했다
 * ("The Speed of a Korean Convenience Store 🇰🇷 (Did you catch that?)", K-PATTO 채널).
 *
 * 실행: npx tsx scripts/insert-post-need-a-bag-korean-checkout.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const PROD = 'https://www.atlaslabstudios.com'

const MD_PATH = path.resolve(
  process.cwd(),
  'scripts',
  '_post-need-a-bag-korean-checkout.md'
)

const POST = {
  slug:         'need-a-bag-korean-checkout',
  locale:       'en',
  app:          'k-patto',
  category:     'Real-Life Korean',
  tags:         ['convenience store', 'checkout', 'travel', 'korean phrases'],
  title:        '"Do You Need a Bag?" — Paying at a Korean Convenience Store',
  description:  "Bags cost money in Korea, and the question comes fast. Here's the exchange from start to finish, and what to say if you'd rather skip it.",
  content:      fs.readFileSync(MD_PATH, 'utf8').trimEnd(),
  published_at: '2026-09-14T00:00:00+00:00',
  is_paused:    false,
}

async function main() {
  console.log(`원고 로드: ${MD_PATH}`)
  console.log(`  ${POST.content.length} chars`)
  console.log(`  YouTube 태그: ${POST.content.match(/<YouTube[^>]*\/>/g)?.join(', ') ?? '없음'}`)

  // 1. slug 충돌 확인 — 있으면 INSERT 하지 않는다
  const { data: existing, error: chkErr } = await sb
    .from('blog_posts')
    .select('slug, app, locale, is_paused, published_at')
    .eq('slug', POST.slug)
  if (chkErr) throw new Error(`충돌 확인 실패: ${chkErr.message}`)

  if (existing && existing.length > 0) {
    console.error('\n⛔ slug 충돌 — INSERT 하지 않고 중단')
    for (const e of existing) {
      console.error(`  slug=${e.slug} app=${e.app} locale=${e.locale} is_paused=${e.is_paused} published_at=${e.published_at}`)
    }
    process.exit(1)
  }
  console.log('✅ slug 충돌 없음')

  const before = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
  console.log(`  삽입 전 공개 글: ${before.count}편`)

  // 2. INSERT
  const { data: inserted, error: insErr } = await sb
    .from('blog_posts')
    .insert(POST)
    .select('id, slug, app, locale, category, tags, published_at, is_paused')
    .single()
  if (insErr) throw new Error(`INSERT 실패: ${insErr.message}`)

  console.log('\n✅ INSERT 완료')
  console.log(JSON.stringify(inserted, null, 2))

  // 3. HTTP 200 + 사이트맵
  const url = `${PROD}/blog/${POST.locale}/${POST.app}/${POST.slug}`
  const res = await fetch(url)
  console.log(`\n── 페이지 검증 ──`)
  console.log(`  ${res.status === 200 ? '✅' : '❌'} ${res.status}  ${url}`)

  const html = await res.text()
  const hasEmbed = html.includes('youtube.com/embed/1f4_AGypPRc')
  const hasThumb = html.includes('art-thumb')
  console.log(`  ${hasEmbed ? '✅' : '❌'} 본문 유튜브 임베드`)
  console.log(`  ${hasThumb ? '✅' : '❌'} 상단 썸네일 영역`)

  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  const hits = (xml.match(new RegExp(POST.slug, 'g')) ?? []).length
  console.log(`  ${hits === 1 ? '✅' : '❌'} sitemap 등재 ${hits}건`)

  // 4. 목록 노출 + 공개 글 총합
  const list = await fetch(`${PROD}/blog?tab=phrases`).then(r => r.text())
  console.log(`  ${list.includes(POST.slug) ? '✅' : '❌'} 목록(Korean phrases) 노출`)

  const now = new Date().toISOString()
  const { count } = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', now)
  console.log(`\n공개 글 총합: ${count}편 (삽입 전 ${before.count}편 → +1 기대)`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
