/**
 * blog_posts 4건 INSERT — Life in Korea 탭 (영어)
 *   1. zero-tipping-split-bills-korea
 *   2. google-maps-alternatives-korea
 *   3. olive-young-instant-tax-refund-guide
 *   4. late-night-medicine-korea-clinics-guide
 *
 * 원고 frontmatter 의 category("culture"/"tech"/"life")는 목록 탭 key 이거나
 * 이 사이트에 없는 값이라 DB 값이 아니다. 사용자가 네 편 모두 Life in Korea 라고
 * 했고, 그 탭 기존 글이 전부 app='k-patto' / locale='en' / category='Korean Culture'
 * 이므로 그 값을 쓴다(새 category 를 만들지 않는다). 특히 2번은 "tech" 이지만
 * tech 탭이 없어 Life in Korea 로 넣는다.
 * 표지 이미지는 아직 없어 COVER_BY_SLUG 에 넣지 않았다(받으면 등록).
 *
 * published_at: 삽입 시각 기준 8/6/4/2분 전 — 전부 과거이고 서로 순서가 있으며
 * 직전 Life 글(지하철 09-22 01:56)보다 뒤다.
 *
 * 실행: npx tsx scripts/insert-life-batch-tips-maps-oliveyoung-medicine.ts
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
const PREV = '2026-09-22T01:56:13+00:00'   // 직전 Life 글 seoul-subway-transfer-transit-card-guide

type Spec = { slug: string; title: string; description: string; tags: string[]; cells: number }

const SPECS: Spec[] = [
  {
    slug: 'zero-tipping-split-bills-korea',
    title: 'Zero Tipping and Split Bills: How to Pay for Food and Drinks in Korea',
    description: "Master South Korea's strict no-tipping culture, upfront POS counter settlements, and painless Dutch pay protocols across restaurants and cafes.",
    tags: ['Korea Dining', 'No Tip Culture', 'Kiosk Ordering', 'Dutch Pay'],
    cells: 15,
  },
  {
    slug: 'google-maps-alternatives-korea',
    title: 'Why Google Maps Fails in Korea: Navigating with Naver and Kakao',
    description: 'Overcome South Korean geopolitical mapping restrictions by transitioning from Google Maps to fully functional Naver Map and Kakao T navigation ecosystems.',
    tags: ['Google Maps Korea', 'Naver Map', 'Kakao T', 'Korea Travel Tech'],
    cells: 20,
  },
  {
    slug: 'olive-young-instant-tax-refund-guide',
    title: 'The Olive Young Survival Guide: Instant Tax Refunds and Must-Buy K-Beauty Sets',
    description: 'Decode value sets from single units on the shelf and claim instant point-of-sale tax refunds using your physical passport at Olive Young checkout counters.',
    tags: ['Olive Young', 'Tax Refund Korea', 'K-Beauty Shopping', 'Seoul Travel'],
    cells: 15,
  },
  {
    slug: 'late-night-medicine-korea-clinics-guide',
    title: 'Getting Sick Late at Night in Korea: Convenience Store Medicine and English Clinics',
    description: 'Locate designated emergency OTC medicines at 24-hour convenience stores and navigate fast, affordable walk-in outpatient clinics without advance reservations.',
    tags: ['Korea Healthcare', 'Convenience Store Medicine', 'Seoul Clinics', 'Emergency Care'],
    cells: 15,
  },
]

const APP = 'k-patto'
const LOCALE = 'en'
const CATEGORY = 'Korean Culture'

async function countPublic() {
  const { count } = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
  return count ?? 0
}

async function main() {
  if (topicSectionKey(APP, CATEGORY) !== 'life') {
    console.error('⛔ Life in Korea 탭이 아니다 — 중단'); process.exit(1)
  }

  // 0. 네 편 모두 슬러그 충돌 확인 — 하나라도 있으면 아무것도 넣지 않는다
  for (const s of SPECS) {
    const { data, error } = await sb.from('blog_posts').select('slug, app, locale, is_paused').eq('slug', s.slug)
    if (error) throw new Error(`충돌 확인 실패: ${error.message}`)
    if (data && data.length) { console.error(`⛔ slug 충돌 — 전부 중단: ${JSON.stringify(data)}`); process.exit(1) }
  }
  console.log('✅ 4개 slug 모두 충돌 없음 (비공개 포함)')

  const startCount = await countPublic()
  console.log(`삽입 전 공개 글: ${startCount}편\n`)

  const now = Date.now()
  const offsets = [8, 6, 4, 2]
  const inserted: { slug: string; id: string; published_at: string }[] = []

  for (let i = 0; i < SPECS.length; i++) {
    const s = SPECS[i]
    const published_at = new Date(now - offsets[i] * 60_000).toISOString().replace('.000Z', '+00:00')
    if (new Date(published_at).getTime() <= new Date(PREV).getTime()) { console.error('⛔ published_at 이 직전 글보다 앞 — 중단'); process.exit(1) }

    const content = fs.readFileSync(path.resolve(process.cwd(), 'scripts', `_post-${s.slug}.md`), 'utf8').trimEnd()
    const row = {
      slug: s.slug, locale: LOCALE, app: APP, category: CATEGORY, tags: s.tags,
      title: s.title, description: s.description, content, published_at, is_paused: false,
    }
    const { data, error } = await sb.from('blog_posts').insert(row).select('id, slug, app, locale, category, tags, published_at').single()
    if (error) throw new Error(`${s.slug} INSERT 실패: ${error.message}`)
    inserted.push({ slug: s.slug, id: data.id, published_at: data.published_at })
    console.log(`✅ INSERT ${i + 1}/4  ${data.slug}  id=${data.id}  ${data.published_at}`)
  }

  // ── 확인 ──
  console.log('\n── 확인 ──')
  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  const lifeList = await fetch(`${PROD}/blog?tab=life`).then(r => r.text())

  for (const s of SPECS) {
    const url = `${PROD}/blog/${LOCALE}/${APP}/${s.slug}`
    const res = await fetch(url)
    const html = await res.text()
    const tables = (html.match(/<table/g) ?? []).length
    const cells = (html.match(/<td/g) ?? []).length
    const sm = (xml.match(new RegExp(s.slug, 'g')) ?? []).length
    console.log(`${s.slug}`)
    console.log(`   ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}   ${tables === 1 && cells === s.cells ? '✅' : '❌'} 표 ${tables}개/셀 ${cells}(기대 ${s.cells})   ${sm === 1 ? '✅' : '❌'} 사이트맵 ${sm}건   ${lifeList.includes(s.slug) ? '✅' : '❌'} Life 탭 노출`)
  }

  const end = await countPublic()
  console.log(`\n공개 글 ${startCount} → ${end}  ${end === startCount + SPECS.length ? '✅' : '❌'} (기대 +${SPECS.length})`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
