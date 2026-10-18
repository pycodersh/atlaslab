/**
 * blog_posts 단건 INSERT — 'hotel-check-in-korea' (여행 회화 25번, 26번보다 먼저 시각)
 *
 * app / locale / category / tags 형식은 hotel-luggage-storage-korea(26번)를
 * 조회해 그대로 따른다: app='k-patto', locale='en', category='Real-Life Korean'
 * (Korean phrases 탭 — 새 category 를 만들지 않는다).
 * thumbnail 컬럼은 기존 여행 회화 글처럼 비워 둔다(유튜브 썸네일이 대신 쓰인다).
 *
 * published_at 은 직전 Korean phrases 글(최신)을 DB 에서 조회해 그보다 뒤인지 검사한다.
 *
 * 실행: npx tsx scripts/insert-post-hotel-check-in-korea.ts
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
const MD_PATH = path.resolve(process.cwd(), 'scripts', '_post-hotel-check-in-korea.md')

const POST = {
  slug:         'hotel-check-in-korea',
  locale:       'en',
  app:          'k-patto',
  category:     'Real-Life Korean',
  tags:         ['hotel', 'accommodation', 'travel Korean', 'Seoul'],
  title:        'Checking into a hotel in Korea',
  description:  'What the front desk says when you arrive, how to give your name for the reservation, and what to have ready at a Korean hotel check-in.',
  content:      fs.readFileSync(MD_PATH, 'utf8').trimEnd(),
  published_at: '2026-10-18T11:52:42+00:00', // 26번(11:53:42)보다 1분 앞, 24번(10-12)보다 뒤
  is_paused:    false,
}

async function main() {
  console.log(`원고: ${POST.content.length} chars`)
  console.log(`YouTube 태그: ${POST.content.match(/<YouTube[^>]*\/>/g)?.join(', ')}`)
  const section = topicSectionKey(POST.app, POST.category)
  console.log(`섹션 판정: ${section}`)
  if (section !== 'phrases') { console.error('⛔ Korean phrases 탭이 아니다 — 중단'); process.exit(1) }
  console.log(`published_at: ${POST.published_at}  (현재 ${new Date().toISOString()})`)

  // 순서 검사: 24번(giving-seat-elderly-korea-bus)보다 뒤, 26번(hotel-luggage-storage-korea)보다 앞이어야 한다
  const { data: around, error: prevErr } = await sb
    .from('blog_posts')
    .select('slug, published_at')
    .in('slug', ['giving-seat-elderly-korea-bus', 'hotel-luggage-storage-korea'])
  if (prevErr) throw prevErr
  const t24 = new Date(around!.find(r => r.slug === 'giving-seat-elderly-korea-bus')!.published_at).getTime()
  const t26 = new Date(around!.find(r => r.slug === 'hotel-luggage-storage-korea')!.published_at).getTime()
  const tNew = new Date(POST.published_at).getTime()
  if (!(tNew > t24 && tNew < t26)) {
    console.error(`⛔ published_at 순서 어긋남(24번 ${new Date(t24).toISOString()} < 새 글 < 26번 ${new Date(t26).toISOString()} 이어야 한다) — 중단`); process.exit(1)
  }
  console.log('✅ 순서 확인: 24번 < 25번(이 글) < 26번')
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
  console.log(`2. ${html.includes('youtube.com/embed/wRr_ha3fD68') ? '✅' : '❌'} YouTube 임베드`)

  const tables = (html.match(/<table/g) ?? []).length
  const cells = (html.match(/<td/g) ?? []).length
  // 원고의 표는 'Words to know'(6x3=18) = 1개 / 18셀.
  // 원고의 표는 Words to know 하나(6x3=18).
  console.log(`3. ${tables === 1 && cells === 18 ? '✅' : '❌'} 표 ${tables}개 / 셀 ${cells}개 (원고 실측: 1개 / 18셀)`)

  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  const hits = (xml.match(new RegExp(POST.slug, 'g')) ?? []).length
  console.log(`4. ${hits === 1 ? '✅' : '❌'} 사이트맵 등재 ${hits}건`)

  const list = await fetch(`${PROD}/blog?tab=phrases`).then(r => r.text())
  console.log(`5. ${list.includes(POST.slug) && list.includes('hotel-luggage-storage-korea') ? '✅' : '❌'} Korean phrases 탭에 노출(26번 글과 함께)`)

  const { count } = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
  console.log(`6. ${count === (before.count ?? 0) + 1 ? '✅' : '❌'} 공개 글 ${before.count} → ${count}`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
