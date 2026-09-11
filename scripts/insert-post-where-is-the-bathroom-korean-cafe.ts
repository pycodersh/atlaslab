/**
 * blog_posts 단건 INSERT — 'where-is-the-bathroom-korean-cafe'
 * locale='en', app='k-patto', is_paused=false
 *
 * content 는 원고 훼손을 막기 위해 별도 .md 파일에서 그대로 읽는다.
 * 본문은 <YouTube /> 임베드 1개를 쓰며, 해당 컴포넌트는 커밋 638f1861 에서 배포 완료.
 *
 * 실행: npx tsx scripts/insert-post-where-is-the-bathroom-korean-cafe.ts
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
  '_post-where-is-the-bathroom-korean-cafe.md'
)

const POST = {
  slug:         'where-is-the-bathroom-korean-cafe',
  locale:       'en',
  app:          'k-patto',
  category:     'Real-Life Korean',
  tags:         ['cafe', 'restroom', 'travel', 'korean phrases'],
  title:        "Where's the Bathroom? Asking in Korean (And the Door Code Problem)",
  description:  'The restroom is often outside the cafe, in a shared hallway, behind a locked door. Two questions get you in.',
  content:      fs.readFileSync(MD_PATH, 'utf8').trimEnd(),
  published_at: '2026-09-10T00:00:00+00:00',
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

  // 3. HTTP 200 + 사이트맵
  const url = `${PROD}/blog/${POST.locale}/${POST.app}/${POST.slug}`
  const res = await fetch(url)
  console.log(`\n── 페이지 검증 ──`)
  console.log(`  ${res.status === 200 ? '✅' : '❌'} ${res.status}  ${url}`)

  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  console.log(`  ${xml.includes(POST.slug) ? '✅' : '❌'} sitemap 등재`)

  // 4. 공개 글 총합
  const now = new Date().toISOString()
  const { count } = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', now)
  console.log(`\n공개 글 총합: ${count}편 (직전 94편 → 95편 기대)`)
  console.log(`  published_at=${POST.published_at}  현재=${now}`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
