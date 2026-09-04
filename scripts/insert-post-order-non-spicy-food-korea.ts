/**
 * blog_posts 단건 INSERT — 'order-non-spicy-food-korea'
 * locale='en', app='k-patto', is_paused=false
 *
 * content 는 원고 훼손을 막기 위해 별도 .md 파일에서 그대로 읽는다.
 * 본문은 <YouTube /> 임베드를 쓰며, 해당 컴포넌트는 커밋 638f1861 에서 배포 완료.
 *
 * 실행: npx tsx scripts/insert-post-order-non-spicy-food-korea.ts
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
  '_post-order-non-spicy-food-korea.md'
)

const POST = {
  slug:         'order-non-spicy-food-korea',
  locale:       'en',
  app:          'k-patto',
  category:     'Real-Life Korean',
  tags:         ['spicy', 'restaurant', 'travel', 'korean phrases'],
  title:        'How to Order Non-Spicy Food in Korea',
  description:  '"A little spicy" in Korea is not a little spicy. Here\'s how to ask before you order, and the phrase that gets your food toned down.',
  content:      fs.readFileSync(MD_PATH, 'utf8').trimEnd(),
  published_at: '2026-09-04T00:00:00+00:00',
  is_paused:    false,
}

async function main() {
  console.log(`원고 로드: ${MD_PATH}`)
  console.log(`  ${POST.content.length} chars`)

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

  // 2. INSERT
  const { data: inserted, error: insErr } = await sb
    .from('blog_posts')
    .insert(POST)
    .select('id, slug, app, locale, category, tags, published_at, is_paused')
    .single()
  if (insErr) throw new Error(`INSERT 실패: ${insErr.message}`)

  console.log('\n✅ INSERT 완료')
  console.log(JSON.stringify(inserted, null, 2))

  // 3. HTTP 200 검증
  const url = `${PROD}/blog/${POST.locale}/${POST.app}/${POST.slug}`
  const res = await fetch(url)
  console.log(`\n── 페이지 검증 ──`)
  console.log(`  ${res.status === 200 ? '✅' : '❌'} ${res.status}  ${url}`)

  // 4. 사이트맵 등재
  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  console.log(`  ${xml.includes(POST.slug) ? '✅' : '❌'} sitemap 등재`)

  // 5. 공개 글 총합
  const now = new Date().toISOString()
  const { count } = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', now)
  console.log(`\n공개 글 총합: ${count}편 (직전 88편 → 89편 기대)`)
  console.log(`  published_at=${POST.published_at}  현재=${now}`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
