/**
 * Paradise City 글(paradise-city-incheon-ultimate-guide) — 인스타 릴스에서 들어오는 모바일 방문자용 정리 (2026-10-28)
 *
 * 1) 고지 바로 아래에 'Quick Stay Highlights' 요약 카드(핵심 3줄 + Trip.com · Klook CIMER 버튼)
 * 2) 사진 묶음을 2열 격자로(lib/blog/proseCss.ts 의 .post-gallery) — 한 장씩 내려 보는 스크롤을 줄인다
 *    · 1장: 지도 · 외관 · 셔틀버스 · 정류장 표지  · 2장: 디럭스 · 객실 · 스위트 거실 · 대리석 욕실
 *    · 5장: 원더박스 외관 · 게임 부스 · 범퍼카 · 대형 미끄럼틀
 *    2장은 욕실 설명 줄을 객실 설명 목록 안으로 올려, 사진 묶음이 설명 뒤에 한 번에 오게 한다.
 * 본문 설명(게이트 번호 · 카지노 규칙 · 객실 구성)과 기존 예약 버튼(2장 · 4장 · 5장)은 그대로 둔다.
 *
 * 안전장치: 바꿀 부분이 지금 본문에 정확히 한 번씩 있을 때만 쓴다. 바꾸기 전 본문은 scripts/backups/ 에 남긴다.
 * 다시 돌리면 이미 바뀐 본문을 알아보고 아무것도 하지 않는다.
 *
 * 실행: npx tsx scripts/update-blog-paradise-city-mobile.ts [--dry-run] [--out <파일>]  (--out: 바뀐 본문을 파일로도 남긴다)
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

import { createClient } from '@supabase/supabase-js'

const SLUG = 'paradise-city-incheon-ultimate-guide'
const DRY = process.argv.includes('--dry-run')
const IMG = 'https://eecvvgkihtcgfikaimao.supabase.co/storage/v1/object/public/blog-covers/paradise-city-incheon-ultimate-guide'
const TRIP = 'https://www.trip.com/t/d0jPwqYrlW2'
const KLOOK_CIMER = 'https://affiliate.klook.com/redirect?aid=138930&aff_adid=1497066&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2Factivity%2F226558-paradise-cimer-spa-incheon-ticket%2F%3Fcampaignid%3D24261382032%26device%3Dc%26loc_physical_ms%3D9220764%26network%3Dx%26gad_campaignid%3D24272442907'

const fig = (name: string, alt: string, caption = alt) =>
  `<figure className="post-figure">\n<img src="${IMG}-${name}.webp" alt="${alt}" loading="lazy" />\n<figcaption>${caption}</figcaption>\n</figure>`
const block = (figs: string[]) => figs.join('\n\n')
const gallery = (figs: string[]) => `<div className="post-gallery">\n${figs.join('\n')}\n</div>`

const DISCLOSURE = '<p className="post-disclosure"><strong>Disclosure:</strong> This post contains affiliate links. If you make a booking or purchase through these links, I may earn a small commission at no additional cost to you.</p>'

const QUICK_CARD = `<div className="quick-card">
<p className="quick-card__title">Quick Stay Highlights</p>
<ul className="quick-card__list">
<li>✈️ <strong>Incheon Airport transit:</strong> free shuttle every 30 mins from Terminal 1 (5–10 min ride)</li>
<li>🌊 <strong>Must-do:</strong> CIMER European Aqua Spa &amp; Jjimjilbang + Wonderbox</li>
<li>🎟️ <strong>Booking tip:</strong> free CIMER / Wonderbox access is included in select room packages</li>
</ul>
<div className="quick-card__btns">
<a href="${TRIP}" target="_blank" rel="noopener noreferrer sponsored" className="cta-btn">Check Room Rates on Trip.com ↗</a>
<a href="${KLOOK_CIMER}" target="_blank" rel="noopener noreferrer sponsored" className="cta-btn cta-btn-outline">Get CIMER Spa Day Pass on Klook ↗</a>
</div>
</div>`

const S1 = [
  fig('map-airport', 'Map of Paradise City and its distance from Incheon Airport Terminal 1 and Terminal 2', 'Paradise City and Incheon Airport Terminals 1 and 2: straight-line and road distances (map © OpenStreetMap contributors)'),
  fig('g1-exterior', 'Paradise City hotel exterior at dusk'),
  fig('g1-bus', 'Paradise City free shuttle bus at Incheon Airport'),
  fig('g1-sign', 'Free shuttle bus stop sign at Incheon Airport'),
]
const ROOMS = [
  fig('g2-room-1-hd', 'Deluxe room with a king bed, sofa and floor-to-ceiling windows'),
  fig('g2-room-2-hd', 'Guest room with a sofa in the foreground and a king bed beyond'),
  fig('g2-room-3-hd', 'Suite living room with a TV and armchairs, bedroom visible through the doors'),
]
const BATH = fig('g3-bathroom', 'Luxury marble bathroom with deep-soaking bathtub')
const ATMOS = '* **The Atmosphere**: Grand, bright, and welcoming. Standard Deluxe rooms are noticeably more spacious than average Seoul hotel rooms, featuring king or double beds, walk-in closets, and complimentary soft drinks and beer in the minibar.'
const BATH_LINE = '* **Bathrooms**: Finished in pure white Italian marble, equipped with deep-soaking bathtubs, separate rain showers, and premium amenities.'
const WONDER = [
  fig('g9-wonderbox-1', 'Wonderbox building lit up at night'),
  fig('g9-wonderbox-2', 'Carnival game stalls inside Wonderbox'),
  fig('g9-wonderbox-3', 'Bumper cars on a red floor inside Wonderbox'),
  fig('g9-wonderbox-4', 'Giant tree slide and carnival set inside Wonderbox'),
]

const CHANGES: { name: string; from: string; to: string }[] = [
  { name: 'quick card under the disclosure', from: DISCLOSURE, to: `${DISCLOSURE}\n\n${QUICK_CARD}` },
  { name: 'section 1 photos → 2×2 grid', from: block(S1), to: gallery(S1) },
  {
    name: 'section 2 room + bathroom photos → 2×2 grid',
    from: `${ATMOS}\n\n${block(ROOMS)}\n\n${BATH_LINE}\n\n${BATH}`,
    to: `${ATMOS}\n${BATH_LINE}\n\n${gallery([...ROOMS, BATH])}`,
  },
  { name: 'section 5 Wonderbox photos → 2×2 grid', from: block(WONDER), to: gallery(WONDER) },
]

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  if (!new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.startsWith('eecvvgkihtcgfikaimao')) throw new Error('patto Supabase 가 아니다 — 중단')
  const { data: post, error } = await sb.from('blog_posts').select('id, content').eq('slug', SLUG).single()
  if (error) throw new Error(error.message)
  const original = (post.content as string).replace(/\r\n/g, '\n')
  if (original.includes('className="quick-card"')) { console.log('· 이미 적용됨 — 바꿀 것 없음'); return }

  let next = original
  for (const c of CHANGES) {
    const n = next.split(c.from).length - 1
    if (n !== 1) throw new Error(`'${c.name}': 바꿀 부분이 ${n}번 있다(1번이어야 함) — 아무것도 쓰지 않고 중단`)
    next = next.replace(c.from, c.to)
    console.log(`  ✓ ${c.name}`)
  }
  // 예약 버튼 · 설명은 그대로여야 한다
  for (const keep of ['Check Real-time Rates on Trip.com', 'View Special Packages on Klook', 'Get CIMER Spa Day Pass (Instant Confirmation)', 'Book Wonderbox Entry Ticket', 'Gate 3C or Gate 14C', 'foreign passport holders only']) {
    if (!next.includes(keep)) throw new Error(`'${keep}' 가 사라졌다 — 중단`)
  }
  console.log(`길이 ${original.length} → ${next.length}`)
  const outIdx = process.argv.indexOf('--out')
  if (outIdx > 0) fs.writeFileSync(process.argv[outIdx + 1], next)   // 저장 전에 MDX 컴파일 확인용
  if (DRY) return

  const dir = path.resolve(process.cwd(), 'scripts', 'backups'); fs.mkdirSync(dir, { recursive: true })
  const bak = path.join(dir, `${SLUG}-${new Date().toISOString().replace(/[:.]/g, '-')}.md`)
  fs.writeFileSync(bak, post.content as string)
  const { error: upErr } = await sb.from('blog_posts').update({ content: next }).eq('id', post.id).eq('content', post.content as string)
  if (upErr) throw new Error(upErr.message)
  console.log(`✅ 저장 (백업: ${path.relative(process.cwd(), bak)})`)
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
