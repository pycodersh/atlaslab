/**
 * blog_posts INSERT — 카페 시리즈 2편
 *   1) order-iced-americano-korea
 *   2) for-here-or-to-go-korean
 *
 * locale='en', app='k-patto', is_paused=false (2편의 DB 지정에 생략되어
 * 시리즈 기존값을 따름).
 *
 * content 는 원고 훼손을 막기 위해 각 .md 파일에서 그대로 읽는다.
 * 본문은 <YouTube /> 임베드를 쓰며, 해당 컴포넌트는 커밋 638f1861 에서 배포 완료.
 *
 * slug 가 하나라도 이미 있으면 아무것도 INSERT 하지 않고 중단한다.
 *
 * 실행: npx tsx scripts/insert-posts-cafe-batch.ts
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

function md(name: string) {
  return fs.readFileSync(path.resolve(process.cwd(), 'scripts', name), 'utf8').trimEnd()
}

const POSTS = [
  {
    slug:         'order-iced-americano-korea',
    locale:       'en',
    app:          'k-patto',
    category:     'Real-Life Korean',
    tags:         ['cafe', 'coffee', 'travel', 'korean phrases'],
    title:        'How to Order Coffee in Korea (Iced Americano Is the Default)',
    description:  "Koreans drink more iced americano than anything else, and ordering one takes four words. Here's the phrase and the two questions you'll be asked back.",
    content:      md('_post-order-iced-americano-korea.md'),
    published_at: '2026-09-07T00:00:00+00:00',
    is_paused:    false,
  },
  {
    slug:         'for-here-or-to-go-korean',
    locale:       'en',
    app:          'k-patto',
    category:     'Real-Life Korean',
    tags:         ['cafe', 'travel', 'korean phrases', 'listening'],
    title:        '"For Here or To Go?" — The Korean Question That Freezes Everyone',
    description:  "You order your coffee, the barista asks one more thing, and you have no idea what it was. It's almost always this question — and the answer is two words.",
    content:      md('_post-for-here-or-to-go-korean.md'),
    published_at: '2026-09-08T00:00:00+00:00',
    is_paused:    false,
  },
]

async function main() {
  for (const p of POSTS) console.log(`원고 로드: ${p.slug}  ${p.content.length} chars`)

  // 1. slug 충돌 확인 — 하나라도 있으면 전부 중단
  const slugs = POSTS.map(p => p.slug)
  const { data: existing, error: chkErr } = await sb
    .from('blog_posts')
    .select('slug, app, locale, is_paused, published_at')
    .in('slug', slugs)
  if (chkErr) throw new Error(`충돌 확인 실패: ${chkErr.message}`)

  if (existing && existing.length > 0) {
    console.error('\n⛔ slug 충돌 — 아무것도 INSERT 하지 않고 중단')
    for (const e of existing) {
      console.error(`  slug=${e.slug} app=${e.app} locale=${e.locale} is_paused=${e.is_paused} published_at=${e.published_at}`)
    }
    process.exit(1)
  }
  console.log('✅ slug 충돌 없음 (2건)')

  // 2. INSERT
  const { data: inserted, error: insErr } = await sb
    .from('blog_posts')
    .insert(POSTS)
    .select('id, slug, app, locale, category, tags, published_at, is_paused')
  if (insErr) throw new Error(`INSERT 실패: ${insErr.message}`)

  console.log('\n✅ INSERT 완료')
  console.log(JSON.stringify(inserted, null, 2))

  // 3. HTTP 200 + 사이트맵
  console.log('\n── 페이지 검증 ──')
  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  for (const p of POSTS) {
    const url = `${PROD}/blog/${p.locale}/${p.app}/${p.slug}`
    const res = await fetch(url)
    console.log(`  ${res.status === 200 ? '✅' : '❌'} ${res.status}  ${url}`)
    console.log(`     ${xml.includes(p.slug) ? '✅' : '❌'} sitemap 등재`)
  }

  // 4. 공개 글 총합
  const now = new Date().toISOString()
  const { count } = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', now)
  console.log(`\n공개 글 총합: ${count}편 (직전 91편 → 93편 기대)`)
  console.log(`  현재=${now}`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
