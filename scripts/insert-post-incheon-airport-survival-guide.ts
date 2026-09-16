/**
 * blog_posts 단건 INSERT — 'incheon-airport-survival-guide' (Life in Korea)
 *
 * 원고 frontmatter 와 이 표의 대응:
 *   category: "life"  → DB 값 'Korean Culture'
 *     "life" 는 /blog 탭 key 이고 DB 컬럼 값이 아니다. Life in Korea 탭의
 *     기존 5편이 전부 app='k-patto' / locale='en' / category='Korean Culture'
 *     라서 그 컨벤션을 따른다(새 category 값을 만들지 않는다).
 *   thumbnail / readTime → 해당 컬럼이 없다. 표지는 lib/blog/thumbnail.ts 의
 *     COVER_BY_SLUG 로 지정하는데, 지정된 파일이 아직 저장소에 없어 비워 둔다.
 *   date: 2026-09-16 → published_at
 *
 * 본문 이미지 2장(/images/posts/icn-terminal-layout.png,
 * /images/posts/t1-arrivals-to-arex.png)은 public/images/posts 자체가 없어
 * 깨진 이미지가 되므로 넣지 않았다. 파일을 받으면 그 자리에 되돌린다.
 *
 * 실행: npx tsx scripts/insert-post-incheon-airport-survival-guide.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { topicSectionKey } from '../lib/blog/sections'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const PROD = 'https://www.atlaslabstudios.com'

const MD_PATH = path.resolve(
  process.cwd(),
  'scripts',
  '_post-incheon-airport-survival-guide.md'
)

const POST = {
  slug:         'incheon-airport-survival-guide',
  locale:       'en',
  app:          'k-patto',
  category:     'Korean Culture',
  tags:         ['Incheon Airport', 'AREX', 'Seoul Travel', 'Transit Card', 'Korea Travel Guide'],
  title:        'Incheon Airport Survival Guide: Terminal Navigation & Transit to Seoul',
  description:  'Master ICN layout, the crucial one-way shuttle train warning, AREX Express vs All-Stop route selection, transit cards, and same-day luggage delivery.',
  content:      fs.readFileSync(MD_PATH, 'utf8').trimEnd(),
  published_at: '2026-09-16T00:00:00+00:00',
  is_paused:    false,
}

async function main() {
  console.log(`원고 로드: ${MD_PATH}`)
  console.log(`  ${POST.content.length} chars`)

  // 분류가 실제로 Life in Korea 탭으로 가는지 코드로 확인한다
  const section = topicSectionKey(POST.app, POST.category)
  console.log(`  섹션 판정: ${section}`)
  if (section !== 'life') {
    console.error('⛔ Life in Korea 탭으로 가지 않는다 — 중단')
    process.exit(1)
  }

  // 1. slug 충돌 확인
  const { data: existing, error: chkErr } = await sb
    .from('blog_posts')
    .select('slug, app, locale, is_paused, published_at')
    .eq('slug', POST.slug)
  if (chkErr) throw new Error(`충돌 확인 실패: ${chkErr.message}`)
  if (existing && existing.length > 0) {
    console.error('\n⛔ slug 충돌 — INSERT 하지 않고 중단')
    for (const e of existing) console.error(`  ${e.slug} app=${e.app} locale=${e.locale}`)
    process.exit(1)
  }
  console.log('✅ slug 충돌 없음')

  const before = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
  console.log(`  삽입 전 공개 글: ${before.count}편`)
  console.log(`  published_at=${POST.published_at} / 현재=${new Date().toISOString()}`)

  // 2. INSERT
  const { data: inserted, error: insErr } = await sb
    .from('blog_posts')
    .insert(POST)
    .select('id, slug, app, locale, category, tags, published_at, is_paused')
    .single()
  if (insErr) throw new Error(`INSERT 실패: ${insErr.message}`)

  console.log('\n✅ INSERT 완료')
  console.log(JSON.stringify(inserted, null, 2))

  // 3. 배포본 검증
  const url = `${PROD}/blog/${POST.locale}/${POST.app}/${POST.slug}`
  const res = await fetch(url)
  const html = await res.text()
  console.log(`\n── 페이지 검증 ──`)
  console.log(`  ${res.status === 200 ? '✅' : '❌'} ${res.status}  ${url}`)
  console.log(`  ${(html.match(/<table/g) ?? []).length === 1 ? '✅' : '❌'} 표 렌더 ${(html.match(/<table/g) ?? []).length}개`)
  console.log(`  ${html.includes('<blockquote') ? '✅' : '❌'} 경고 블록(blockquote)`)
  console.log(`  ${(html.match(/<h2/g) ?? []).length === 5 ? '✅' : '❌'} h2 ${(html.match(/<h2/g) ?? []).length}개`)
  console.log(`  ${html.includes('/images/posts/') ? '❌ 없는 이미지 참조 남음' : '✅ 깨진 이미지 참조 없음'}`)

  const list = await fetch(`${PROD}/blog?tab=life`).then(r => r.text())
  console.log(`  ${list.includes(POST.slug) ? '✅' : '❌'} Life in Korea 탭 노출`)

  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  const hits = (xml.match(new RegExp(POST.slug, 'g')) ?? []).length
  console.log(`  ${hits === 1 ? '✅' : '❌'} sitemap 등재 ${hits}건`)

  const { count } = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
  console.log(`\n공개 글 총합: ${count}편 (삽입 전 ${before.count}편 → +1 기대)`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
