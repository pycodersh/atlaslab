/**
 * 도구 페이지 위젯 바로 아래 '다음 행동' 미니 액션 카드 2~3개 — 도구 주제에 맞는 예약 · 학습 링크.
 * 홈의 도구 카드에는 넣지 않고, 각 도구 페이지(/tools/슬러그)에서 위젯과 FAQ 사이에 둔다.
 * 아래 FAQ 아코디언과 같은 폭의 그리드: 카드 3개면 3열 · 2개면 2열(폰은 1열).
 * 카드: 위 줄 브랜드 점 + 대문자 브랜드 · 오른쪽 화살표(외부 ↗ · 사이트 안 →), 가운데 제목, 아래 3~4단어 설명.
 *
 * 링크 출처
 *  - Klook: 검색 결과 + aid=138930 (각 검색어는 브라우저로 결과가 주제와 맞는지 확인함, 2026-11-12)
 *  - Trip.com: 호텔 글 제휴 단축 링크가 넘겨주는 Allianceid · SID 를 붙인 일반 페이지(서울 호텔 목록 · 호텔 · 항공).
 *    Trip.com 은 KTX 를 팔지 않아(trains/korea → 유럽 기차 페이지) 이동 카드는 국내선 항공으로 둔다.
 *  - K-Pantry /kpantry/en, K-PATTO /kpatto, italki 는 교육 글과 같은 제휴 링크.
 * 설명 문구는 링크가 실제로 여는 페이지만 말한다(예: 서울 호텔 목록은 역 앞으로 걸러 주지 않으므로 'Seoul hotel rates').
 * 외부 링크는 새 창 + rel="nofollow sponsored noopener", 사이트 안 링크는 같은 창.
 */
import { TOTAL_RECIPES } from '@/lib/kpantry/access'
import type { ToolId } from './toolList'

type Brand = 'Klook' | 'Trip.com' | 'K-Pantry' | 'K-PATTO' | 'italki'
type Card = { brand: Brand; label: string; sub: string; href: string }

/** 브랜드 포인트 색 — Klook 오렌지 · Trip.com 블루 · K-Pantry/K-PATTO 버건디 · italki 레드 */
const BRAND_COLOR: Record<Brand, string> = {
  Klook: '#FF5B00',
  'Trip.com': '#287DFA',
  'K-Pantry': '#8A1C3B',
  'K-PATTO': '#8A1C3B',
  italki: '#E5484D',
}

const klook = (q: string) => `https://www.klook.com/en-US/search/result/?query=${encodeURIComponent(q)}&aid=138930`
const TRIP_AFF = 'Allianceid=10997841&SID=333357760'
const TRIP_SEOUL_HOTELS = `https://www.trip.com/hotels/list?city=274&${TRIP_AFF}`
const TRIP_HOTELS = `https://www.trip.com/hotels/?${TRIP_AFF}`
const TRIP_FLIGHTS = `https://www.trip.com/flights/?${TRIP_AFF}`
const KPANTRY = '/kpantry/en'
const KPATTO = '/kpatto'
const ITALKI = 'https://www.italki.com/affshare?ref=af34196889'

const CARDS: Record<ToolId, Card[]> = {
  'hotspot-finder': [
    { brand: 'Klook', label: 'Day Tours & Passes', sub: 'Seoul & regional day trips', href: klook('South Korea Day Tour') },
    { brand: 'Trip.com', label: 'Hotels by Area', sub: 'Compare rates by city', href: TRIP_HOTELS },
    { brand: 'K-Pantry', label: 'Local Food Guide', sub: 'Regional dishes to cook', href: KPANTRY },
  ],
  'transit-guide': [
    { brand: 'Trip.com', label: 'Domestic Flights', sub: 'Jeju & Busan routes', href: TRIP_FLIGHTS },
    { brand: 'Klook', label: 'KORAIL Pass & Bus', sub: 'KTX & rail passes', href: klook('Korea Rail Pass') },
    { brand: 'Trip.com', label: 'Destination Hotels', sub: 'Rates at your next stop', href: TRIP_HOTELS },
  ],
  'kpop-calendar': [
    { brand: 'Trip.com', label: 'Arena & Dome Hotels', sub: 'Seoul hotel rates', href: TRIP_SEOUL_HOTELS },
    { brand: 'Klook', label: 'Concert Shuttles & Tours', sub: 'Music shows & idol tours', href: klook('Kpop Concert Seoul') },
    { brand: 'K-PATTO', label: 'Concert Korean Slang', sub: 'Fan phrases with webtoons', href: KPATTO },
  ],
  'krw-converter': [
    { brand: 'Klook', label: 'eSIM & T-money Card', sub: 'Data & transit card', href: klook('Korea eSIM Tmoney') },
    { brand: 'Trip.com', label: 'Compare Hotel Rates', sub: 'Rates across Korea', href: TRIP_HOTELS },
    { brand: 'K-PATTO', label: 'Shopping Korean', sub: 'Phrases for paying', href: KPATTO },
  ],
  'order-builder': [
    { brand: 'K-Pantry', label: `${TOTAL_RECIPES} Korean Recipes`, sub: 'Cook them at home', href: KPANTRY },
    { brand: 'Klook', label: 'Seoul Food Tours', sub: 'Markets & night food', href: klook('Seoul Food Tour') },
    { brand: 'K-PATTO', label: 'Ordering Phrases', sub: 'Order with confidence', href: KPATTO },
  ],
  weather: [
    { brand: 'Klook', label: 'Indoor Attractions', sub: 'Rainy-day Seoul picks', href: klook('Seoul Indoor Attractions') },
    { brand: 'Trip.com', label: 'Central Seoul Hotels', sub: 'Seoul hotel rates', href: TRIP_SEOUL_HOTELS },
  ],
  'holiday-calendar': [
    { brand: 'Trip.com', label: 'Peak-Season Hotels', sub: 'Book before holidays', href: TRIP_HOTELS },
    { brand: 'Klook', label: 'Holiday Day Trips', sub: 'Seoul day tours', href: klook('Seoul Day Tour') },
  ],
  'size-units': [
    { brand: 'K-PATTO', label: 'Store Shopping Korean', sub: 'Ask for sizes & colors', href: KPATTO },
    { brand: 'Klook', label: 'Seoul Shopping Deals', sub: 'Shopping coupons & gifts', href: klook('Seoul Shopping Pass') },
  ],
  'subway-timer': [
    { brand: 'Klook', label: 'Discover Seoul Pass & AREX', sub: 'Attractions & airport train', href: klook('Discover Seoul Pass') },
    { brand: 'Trip.com', label: 'Station-Front Hotels', sub: 'Seoul hotel rates', href: TRIP_SEOUL_HOTELS },
  ],
  'world-time': [
    { brand: 'italki', label: '1-on-1 Korean Tutor', sub: 'Lessons in your timezone', href: ITALKI },
    { brand: 'K-PATTO', label: 'Daily Korean Practice', sub: 'Webtoon pattern lessons', href: KPATTO },
  ],
}

const CSS = `
.wac { margin-top: 24px; }
.wac-title { margin: 0 0 10px; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #A8A29E; }
.wac-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin: 0; padding: 0; list-style: none; }
@media (min-width: 640px) {
  .wac-grid.is-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .wac-grid.is-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
.wac-card { display: flex; flex-direction: column; justify-content: space-between; height: 100%; box-sizing: border-box; padding: 14px;
  background: #fff; border: 1px solid rgba(231,229,228,.9); border-radius: 12px; box-shadow: 0 1px rgba(0,0,0,.05);
  color: #1C1917; text-decoration: none; transition: border-color .15s, box-shadow .15s; }
.wac-card:hover { border-color: #A8A29E; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
.wac-card:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
.wac-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.wac-brand { display: inline-flex; align-items: center; gap: 6px; font-size: 10.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.wac-dot { width: 6px; height: 6px; border-radius: 999px; flex: none; }
.wac-arrow { font-size: 14px; line-height: 1; color: #A8A29E; transition: color .15s, transform .15s; }
.wac-card:hover .wac-arrow { color: #1C1917; transform: translate(1px, -1px); }
.wac-label { margin-top: 6px; font-size: 14px; font-weight: 600; line-height: 1.3; color: #1C1917; }
.wac-sub { margin-top: 2px; font-size: 12px; line-height: 1.4; color: #78716C; }
@media (prefers-reduced-motion: reduce) { .wac-card, .wac-arrow { transition: none; } .wac-card:hover .wac-arrow { transform: none; } }
`

export function WidgetActionChips({ tool }: { tool: ToolId }) {
  const cards = CARDS[tool]
  if (!cards?.length) return null
  return (
    <nav className="wac" aria-label="Explore and book">
      <style>{CSS}</style>
      <p className="wac-title">Explore &amp; Book</p>
      <ul className={`wac-grid is-${Math.min(cards.length, 3)}`}>
        {cards.map(c => {
          const external = c.href.startsWith('http')
          return (
            <li key={c.label}>
              <a className="wac-card" href={c.href}
                {...(external ? { target: '_blank', rel: 'nofollow sponsored noopener' } : {})}>
                <span className="wac-top">
                  <span className="wac-brand notranslate" translate="no" style={{ color: BRAND_COLOR[c.brand] }}>
                    <span className="wac-dot" style={{ background: BRAND_COLOR[c.brand] }} aria-hidden="true" />
                    {c.brand}
                  </span>
                  <span className="wac-arrow" aria-hidden="true">{external ? '↗' : '→'}</span>
                </span>
                <span className="wac-label">{c.label}</span>
                <span className="wac-sub">{c.sub}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
