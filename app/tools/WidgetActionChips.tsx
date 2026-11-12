/**
 * 도구 페이지 위젯 바로 아래 '다음 행동' 미니 칩 2~3개 — 도구 주제에 맞는 예약 · 학습 링크.
 * 홈의 도구 카드에는 넣지 않고, 각 도구 페이지(/tools/슬러그)에서 위젯과 FAQ 사이에 둔다.
 *
 * 링크 출처
 *  - Klook: 검색 결과 + aid=138930 (각 검색어는 브라우저로 결과가 주제와 맞는지 확인함, 2026-11-12)
 *  - Trip.com: 호텔 글 제휴 단축 링크가 넘겨주는 Allianceid · SID 를 붙인 일반 페이지(서울 호텔 목록 · 호텔 · 항공).
 *    Trip.com 은 KTX 를 팔지 않아(trains/korea → 유럽 기차 페이지) 이동 칩은 국내선 항공으로 둔다.
 *  - K-Pantry /kpantry/en, K-PATTO /kpatto, italki 는 교육 글과 같은 제휴 링크.
 * 외부 링크는 새 창 + rel="nofollow sponsored noopener", 사이트 안 링크는 같은 창.
 */
import { TOTAL_RECIPES } from '@/lib/kpantry/access'
import type { ToolId } from './toolList'

type Brand = 'Klook' | 'Trip.com' | 'K-Pantry' | 'K-PATTO' | 'italki'
type Chip = { brand: Brand; label: string; href: string }

const BRAND_COLOR: Record<Brand, string> = {
  Klook: '#FF5B00',
  'Trip.com': '#287DFA',
  'K-Pantry': '#3F7D3A',
  'K-PATTO': '#C8102E',
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

const CHIPS: Record<ToolId, Chip[]> = {
  'hotspot-finder': [
    { brand: 'Klook', label: 'Day Tours & Passes', href: klook('South Korea Day Tour') },
    { brand: 'Trip.com', label: 'Hotels by Area', href: TRIP_HOTELS },
    { brand: 'K-Pantry', label: 'Local Food Guide', href: KPANTRY },
  ],
  'transit-guide': [
    { brand: 'Trip.com', label: 'Domestic Flights', href: TRIP_FLIGHTS },
    { brand: 'Klook', label: 'KORAIL Pass & Bus', href: klook('Korea Rail Pass') },
    { brand: 'Trip.com', label: 'Destination Hotels', href: TRIP_HOTELS },
  ],
  'kpop-calendar': [
    { brand: 'Trip.com', label: 'Arena & Dome Hotels', href: TRIP_SEOUL_HOTELS },
    { brand: 'Klook', label: 'Concert Shuttles & Tours', href: klook('Kpop Concert Seoul') },
    { brand: 'K-PATTO', label: 'Concert Korean Slang', href: KPATTO },
  ],
  'krw-converter': [
    { brand: 'Klook', label: 'eSIM & T-money Card', href: klook('Korea eSIM Tmoney') },
    { brand: 'Trip.com', label: 'Compare Hotel Rates', href: TRIP_HOTELS },
    { brand: 'K-PATTO', label: 'Shopping Korean', href: KPATTO },
  ],
  'order-builder': [
    { brand: 'K-Pantry', label: `${TOTAL_RECIPES} Korean Recipes`, href: KPANTRY },
    { brand: 'Klook', label: 'Seoul Food Tours', href: klook('Seoul Food Tour') },
    { brand: 'K-PATTO', label: 'Ordering Phrases', href: KPATTO },
  ],
  weather: [
    { brand: 'Klook', label: 'Indoor Attractions', href: klook('Seoul Indoor Attractions') },
    { brand: 'Trip.com', label: 'Central Seoul Hotels', href: TRIP_SEOUL_HOTELS },
  ],
  'holiday-calendar': [
    { brand: 'Trip.com', label: 'Peak-Season Hotels', href: TRIP_HOTELS },
    { brand: 'Klook', label: 'Holiday Day Trips', href: klook('Seoul Day Tour') },
  ],
  'size-units': [
    { brand: 'K-PATTO', label: 'Store Shopping Korean', href: KPATTO },
    { brand: 'Klook', label: 'Seoul Shopping Deals', href: klook('Seoul Shopping Pass') },
  ],
  'subway-timer': [
    { brand: 'Klook', label: 'Discover Seoul Pass & AREX', href: klook('Discover Seoul Pass') },
    { brand: 'Trip.com', label: 'Station-Front Hotels', href: TRIP_SEOUL_HOTELS },
  ],
  'world-time': [
    { brand: 'italki', label: '1-on-1 Korean Tutor', href: ITALKI },
    { brand: 'K-PATTO', label: 'Daily Korean Practice', href: KPATTO },
  ],
}

const CSS = `
.wac { margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(231,229,228,.8); }
.wac-title { margin: 0 0 8px; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #A8A29E; }
.wac-list { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; list-style: none; }
.wac-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px;
  background: #FAFAF9; border: 1px solid #E7E5E4; box-shadow: 0 1px rgba(0,0,0,.05);
  font: 500 12px/1.3 "DM Sans", Inter, system-ui, sans-serif; color: #44403C; text-decoration: none; white-space: nowrap;
  transition: background-color .15s, border-color .15s, color .15s; }
.wac-chip:hover { background: #fff; border-color: #B91C1C; color: #B91C1C; }
.wac-chip:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
.wac-brand { font-weight: 600; }
`

export function WidgetActionChips({ tool }: { tool: ToolId }) {
  const chips = CHIPS[tool]
  if (!chips?.length) return null
  return (
    <nav className="wac" aria-label="Explore and book">
      <style>{CSS}</style>
      <p className="wac-title">Explore &amp; Book</p>
      <ul className="wac-list">
        {chips.map(c => {
          const external = c.href.startsWith('http')
          return (
            <li key={c.label}>
              <a className="wac-chip" href={c.href}
                {...(external ? { target: '_blank', rel: 'nofollow sponsored noopener' } : {})}>
                <span className="wac-brand notranslate" translate="no" style={{ color: BRAND_COLOR[c.brand] }}>{c.brand}</span>
                <span>{c.label} {external ? '↗' : '→'}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
