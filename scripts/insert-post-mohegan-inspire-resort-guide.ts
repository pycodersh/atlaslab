/**
 * blog_posts 단건 INSERT — 'mohegan-inspire-resort-guide' (Stay in Korea 두 번째 글)
 *
 * app='k-patto', locale='en', category='Stay in Korea'. 이미지·제휴 링크는 아직 없어서
 *  - 본문 사진은 OSM 거리 지도 한 장만 넣는다(scripts/make-stay-map.mjs, config: scripts/stay-maps/mohegan-inspire.json).
 *  - 호텔·Klook 버튼은 MDX 주석 안에 숨겨 두었다(링크가 나오면 href 를 채우고 주석을 푼다).
 * 원고의 HTML 태그는 이 사이트의 MDX 규칙에 맞게 바꿨다: class→className, 제휴 고지는 post-disclosure,
 * 팁 박스는 tip-box(안은 마크다운), 버튼은 cta-btn, HTML 주석은 MDX 주석으로.
 *
 * 실행: npx tsx scripts/insert-post-mohegan-inspire-resort-guide.ts
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
const MD_PATH = path.resolve(process.cwd(), 'scripts', '_post-mohegan-inspire-resort-guide.md')

const POST = {
  slug:         'mohegan-inspire-resort-guide',
  locale:       'en',
  app:          'k-patto',
  category:     'Stay in Korea',
  tags:         ['Mohegan INSPIRE', 'INSPIRE Resort', 'Incheon Airport', 'K-POP', 'luxury hotel', 'travel Korea'],
  title:        'Mohegan INSPIRE Resort Guide: K-POP Arena, Aurora Digital Street, Splash Bay & Luxury Staycations Near Incheon Airport',
  description:  "A foreign traveler's guide to Mohegan INSPIRE Entertainment Resort near Incheon Airport: free shuttles, the 15,000-seat INSPIRE Arena, Aurora digital street, Splash Bay, Le Space, and dining.",
  content:      fs.readFileSync(MD_PATH, 'utf8').trimEnd(),
  published_at: new Date(Date.now() - 2 * 60_000).toISOString().replace('.000Z', '+00:00'),
  is_paused:    false,
}

async function main() {
  console.log(`원고: ${POST.content.length} chars`)
  const section = topicSectionKey(POST.app, POST.category)
  console.log(`섹션 판정: ${section}`)
  if (section !== 'stay-in-korea') { console.error('⛔ Stay in Korea 섹션이 아니다 — 중단'); process.exit(1) }
  if (/<!--/.test(POST.content)) { console.error('⛔ HTML 주석이 남아 있다(MDX 오류 원인) — 중단'); process.exit(1) }

  // 실제 페이지와 같은 컴파일 옵션으로 먼저 시험한다
  // (정적 import 는 tsx 의 CJS 해석에서 estree-walker 가 깨져 동적 import 로 읽는다)
  const { compile } = await import('@mdx-js/mdx')
  const { default: remarkGfm } = await import('remark-gfm')
  await compile(POST.content, { remarkPlugins: [remarkGfm] })
  console.log('✅ MDX 컴파일 통과')

  // 본문이 참조하는 지도 이미지를 먼저 올린다
  {
    const { error: upErr } = await sb.storage.from('blog-covers').upload('mohegan-inspire-resort-guide-map-airport.png', fs.readFileSync(path.resolve(process.cwd(), 'map-preview', 'mohegan-inspire-osm-map.png')), { contentType: 'image/png', upsert: true })
    if (upErr) throw new Error(`지도 업로드 실패: ${upErr.message}`)
    console.log('✅ 지도 이미지 업로드')
  }

  const { data: existing, error: chkErr } = await sb.from('blog_posts').select('slug, app, locale, is_paused').eq('slug', POST.slug)
  if (chkErr) throw new Error(`충돌 확인 실패: ${chkErr.message}`)
  if (existing && existing.length) { console.error('⛔ slug 충돌 — 중단', JSON.stringify(existing)); process.exit(1) }
  console.log('✅ slug 충돌 없음')

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
  console.log(`2. ${html.includes('Stay in Korea') ? '✅' : '❌'} 페이지에 카테고리 라벨 표시, H2 ${(html.match(/<h2/g) ?? []).length}개`)

  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  console.log(`3. ${xml.includes(POST.slug) ? '✅' : '❌'} 사이트맵 등재`)

  const list = await fetch(`${PROD}/blog?tab=stay-in-korea`).then(r => r.text())
  console.log(`4. ${list.includes(POST.slug) ? '✅' : '❌'} /blog?tab=stay-in-korea 에 노출`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
