/**
 * blog_posts 단건 INSERT — 'hands-free-seoul-subway-lockers-guide' (Life in Korea)
 *
 * Life in Korea 5편 배치의 1번째 글. app / locale / category 형식은 직전 Life 글
 * (late-night-medicine-korea-clinics-guide)을 조회해 그대로 따른다: app='k-patto',
 * locale='en', category='Korean Culture'(Life in Korea 탭 — 새 category 를 만들지 않는다).
 *
 * 원고 frontmatter 의 category("life")는 이 사이트 값이 아니라 목록 탭 key 이므로
 * DB 컬럼값으로 쓰지 않는다. thumbnail 은 사용자가 "이미지는 한꺼번에 작업하자"고
 * 했으므로 이번엔 COVER_BY_SLUG 에 등록하지 않는다(5편 다 받은 뒤 한 번에 처리).
 *
 * published_at 은 삽입 2분 전 시각(과거 확정) — 직전 Life 글(2026-09-26T08:29:18Z)보다 뒤.
 *
 * 실행: npx tsx scripts/insert-post-hands-free-seoul-subway-lockers-guide.ts
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
const MD_PATH = path.resolve(process.cwd(), 'scripts', '_post-hands-free-seoul-subway-lockers-guide.md')

const POST = {
  slug:         'hands-free-seoul-subway-lockers-guide',
  locale:       'en',
  app:          'k-patto',
  category:     'Korean Culture',
  tags:         ['Seoul Travel', 'Subway Lockers', 'Luggage Delivery', 'T-Locker'],
  title:        'Hands-Free Seoul: How to Use Subway Station Lockers and Luggage Delivery Services',
  description:  "Master Seoul's subway digital lockers (T-Locker) and same-day airport luggage delivery services to navigate the city luggage-free.",
  content:      fs.readFileSync(MD_PATH, 'utf8').trimEnd(),
  // 삽입 2분 전 — 과거이면서 직전 Life 글(late-night-medicine-korea-clinics-guide 09-26 08:29:18)보다 뒤
  published_at: new Date(Date.now() - 2 * 60_000).toISOString().replace('.000Z', '+00:00'),
  is_paused:    false,
}

async function main() {
  console.log(`원고: ${POST.content.length} chars`)
  const section = topicSectionKey(POST.app, POST.category)
  console.log(`섹션 판정: ${section}`)
  if (section !== 'life') { console.error('⛔ Life in Korea 탭이 아니다 — 중단'); process.exit(1) }
  console.log(`published_at: ${POST.published_at}  (현재 ${new Date().toISOString()})`)

  const PREV = '2026-09-26T08:29:18.116+00:00'   // late-night-medicine-korea-clinics-guide
  if (new Date(POST.published_at).getTime() <= new Date(PREV).getTime()) {
    console.error(`⛔ published_at 이 직전 글(${PREV})보다 앞 — 중단`); process.exit(1)
  }
  if (new Date(POST.published_at).getTime() > Date.now()) {
    console.error('⛔ published_at 이 미래 — 중단'); process.exit(1)
  }

  const { data: existing, error: chkErr } = await sb
    .from('blog_posts')
    .select('slug, app, locale, is_paused')
    .eq('slug', POST.slug)
  if (chkErr) throw new Error(`충돌 확인 실패: ${chkErr.message}`)
  if (existing && existing.length) {
    console.error('⛔ slug 충돌 — 중단', JSON.stringify(existing)); process.exit(1)
  }
  console.log('✅ slug 충돌 없음')

  const before = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())

  const { data: row, error: insErr } = await sb
    .from('blog_posts')
    .insert(POST)
    .select('id, slug, app, locale, category, tags, published_at, is_paused')
    .single()
  if (insErr) throw new Error(`INSERT 실패: ${insErr.message}`)
  console.log('\n✅ INSERT 완료\n' + JSON.stringify(row, null, 2))

  // ── 확인 ──
  const url = `${PROD}/blog/${POST.locale}/${POST.app}/${POST.slug}`
  const res = await fetch(url)
  const html = await res.text()
  console.log(`\n1. ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}  ${url}`)

  const tables = (html.match(/<table/g) ?? []).length
  const cells = (html.match(/<td/g) ?? []).length
  console.log(`2. ${tables === 1 && cells === 15 ? '✅' : '❌'} 표 ${tables}개 / 셀 ${cells}개 (기대 1 / 15)`)

  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  const hits = (xml.match(new RegExp(POST.slug, 'g')) ?? []).length
  console.log(`3. ${hits === 1 ? '✅' : '❌'} 사이트맵 등재 ${hits}건`)

  const list = await fetch(`${PROD}/blog?tab=life`).then(r => r.text())
  console.log(`4. ${list.includes(POST.slug) ? '✅' : '❌'} Life in Korea 탭 노출`)

  const { count } = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
  console.log(`5. ${count === (before.count ?? 0) + 1 ? '✅' : '❌'} 공개 글 ${before.count} → ${count}`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
