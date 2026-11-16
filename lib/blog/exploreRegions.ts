/**
 * Explore Korea 글 → Regional Hotspot Finder 의 11개 지역(서울은 6개 권역까지) 자동 배치.
 *
 * 손으로 쓴 글 목록 없이 이미 있는 데이터만 본다. 앞에서부터 처음 맞는 규칙을 쓴다:
 *  1) 호텔 글 — 본문의 <StayMap id> → explore-geo.generated.json 의 호텔 좌표(make-stay-maps 의 OSM 실측).
 *     좌표에서 가장 가까운 명소의 도시 · 권역으로 넣는다(멀면 지역 없음: 송도 · 인천 호텔).
 *     서울 권역은 호텔 지도의 바탕 지역(stay-maps region)이 권역 이름과 같으면 그쪽이 먼저다.
 *  2) 명소 카드가 링크하는 가이드(regionalHotspots 의 spot.guide.slug) — 그 명소들의 도시 · 권역, 핀은 그 명소들 중 가운데.
 *  3) 제목 · 슬러그에 도시 이름이 나오는 글('near/from Seoul' 은 서울 글이 아니다) — 그 도시. 제목 · 요약에
 *     명소 이름이 나오면 그 명소 자리에 핀, 아니면 핀 없이 목록에만.
 * 어디에도 안 맞는 글은 지역 필터 'All' 에서만 보인다(스크립트 출력 · 보고서 참고).
 */
import geo from './explore-geo.generated.json'
import { HOTSPOT_CITIES, type Hotspot, type SeoulClusterId } from '@/data/regionalHotspots'
import type { CityId } from '@/data/transitRoutes'

export type LL = [number, number]
export type ExploreGeo = { regions: CityId[]; area: SeoulClusterId | null; ll: LL | null }

const HOTELS = geo.hotels as unknown as Record<string, LL>
const SPOT_LL = geo.spots as unknown as Record<string, LL>

/** 지도 · 필터가 쓰는 지역 목록 — Hotspot Finder 와 같은 순서 · 이름(Chuncheon 은 짧게) */
export const EXPLORE_REGIONS: { id: CityId; name: string }[] = HOTSPOT_CITIES.map(c => ({ id: c.id, name: c.name }))

/** 명소 하나하나 — 도시 · 권역 · 좌표가 붙은 평평한 목록(지도 겹쳐 보기에도 쓴다) */
export type PlacedSpot = Hotspot & { city: CityId; area: SeoulClusterId | null; ll: LL | null }
export const PLACED_SPOTS: PlacedSpot[] = HOTSPOT_CITIES.flatMap((c): PlacedSpot[] =>
  c.clusters
    ? c.clusters.flatMap(cl => cl.spots.map(s => ({ ...s, city: c.id, area: cl.id, ll: SPOT_LL[s.name] ?? null })))
    : c.spots.map(s => ({ ...s, city: c.id, area: null, ll: SPOT_LL[s.name] ?? null })),
)

export function km([a, b]: LL, [c, d]: LL) {
  const r = Math.PI / 180
  const x = (d - b) * r * Math.cos(((a + c) / 2) * r), y = (c - a) * r
  return Math.sqrt(x * x + y * y) * 6371
}

const HOTEL_MAPS = geo.hotelMaps as Record<string, string>
const SEOUL_AREAS = new Set<string>(HOTSPOT_CITIES.find(c => c.id === 'seoul')?.clusters?.map(c => c.id) ?? [])

// 가장 가까운 명소가 이보다 멀면 그 도시 글이 아니다(제주는 섬 전체가 한 지역이라 넓게)
const NEAR_KM: Partial<Record<CityId, number>> = { jeju: 40 }
const NEAR_DEFAULT_KM = 12

function nearestSpot(ll: LL) {
  let best: { s: PlacedSpot; d: number } | null = null
  for (const s of PLACED_SPOTS) {
    if (!s.ll) continue
    const d = km(ll, s.ll)
    if (!best || d < best.d) best = { s, d }
  }
  return best && best.d <= (NEAR_KM[best.s.city] ?? NEAR_DEFAULT_KM) ? best.s : null
}

// 가이드 slug → 그 가이드를 링크하는 명소들
const SPOTS_BY_GUIDE = new Map<string, PlacedSpot[]>()
for (const s of PLACED_SPOTS) {
  if (!s.guide) continue
  SPOTS_BY_GUIDE.set(s.guide.slug, [...(SPOTS_BY_GUIDE.get(s.guide.slug) ?? []), s])
}

/** 여러 좌표 중 가운데(평균점에 가장 가까운 실제 점) — 평균점은 바다 한가운데일 수 있다 */
function medoid(pts: LL[]): LL | null {
  if (!pts.length) return null
  const c: LL = [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length]
  return pts.reduce((a, p) => (km(p, c) < km(a, c) ? p : a))
}

const CITY_WORDS: { id: CityId; re: RegExp }[] = HOTSPOT_CITIES.map(c => ({
  id: c.id,
  // 'Seoul' 은 'near Seoul' · 'from Seoul' 이면 서울 글이 아니다(DMZ · 스키장 · 등산)
  re: new RegExp(`(?<!\\b(?:near|from)\\s)\\b${c.name.split(' ')[0]}\\b`, 'i'),
}))

const spotWords = (s: PlacedSpot) => [s.name.replace(/ (?:&|and) .*/, ''), s.name.split(' & ')[1]].filter(Boolean) as string[]

/** <StayMap id="..."> — 본문에서 호텔 지도 id 를 뽑는다(서버에서 카드 만들 때 한 번) */
export const stayMapIdOf = (content: string | null | undefined) => content?.match(/<StayMap\s+id="([^"]+)"/)?.[1] ?? null

export function exploreGeoOf(p: { slug: string; title: string; description: string | null; stayMapId: string | null }): ExploreGeo {
  // 1) 호텔 좌표
  const hotel = p.stayMapId ? HOTELS[p.stayMapId] : undefined
  if (hotel) {
    const s = nearestSpot(hotel)
    // 호텔 지도의 바탕 지역(gangnam · hongdae · yeouido)이 서울 권역 이름과 같으면 그걸 따른다 —
    // 반포 JW 메리어트는 가장 가까운 명소가 국립중앙박물관이지만 글도 지도도 강남 숙소로 다룬다
    const mapRegion = HOTEL_MAPS[p.stayMapId!]
    const area = s?.city === 'seoul' && SEOUL_AREAS.has(mapRegion) ? (mapRegion as SeoulClusterId) : s?.area ?? null
    return { regions: s ? [s.city] : [], area, ll: hotel }
  }
  // 2) 명소가 링크하는 가이드
  const linked = SPOTS_BY_GUIDE.get(p.slug)
  if (linked?.length) {
    const cities = [...new Set(linked.map(s => s.city))]
    const areas = [...new Set(linked.map(s => s.area))]
    return { regions: cities, area: areas.length === 1 ? areas[0] : null, ll: medoid(linked.flatMap(s => (s.ll ? [s.ll] : []))) }
  }
  // 3) 제목의 도시 이름 + 제목 · 요약의 명소 이름
  // 슬러그도 본다 — 'gocheok-sky-dome-concert-guide-seoul' 처럼 제목에 없는 도시를 슬러그가 말하는 글이 있다
  const named0 = `${p.title} ${p.slug.replace(/-/g, ' ')}`
  const regions = CITY_WORDS.filter(c => c.re.test(named0)).map(c => c.id)
  if (!regions.length) return { regions: [], area: null, ll: null }
  const text = `${p.title} ${p.description ?? ''}`
  const named = PLACED_SPOTS.filter(s => s.ll && regions.includes(s.city) && spotWords(s).some(w => text.includes(w)))
  const areas = [...new Set(named.map(s => s.area))]
  return {
    regions,
    area: areas.length === 1 ? areas[0] : null,
    // 도시가 둘이면(Seoul vs Busan) 핀 하나로 대표할 수 없다
    ll: regions.length === 1 ? medoid(named.map(s => s.ll!)) : null,
  }
}
