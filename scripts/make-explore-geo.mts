/**
 * Explore Korea 지도 좌표 생성기 — lib/blog/explore-geo.generated.json 을 만든다.
 *
 *  - hotels: <StayMap id> → [lat, lon]. scripts/make-stay-maps.mjs 의 P(OSM 실측 좌표) · MAPS(호텔 → P 키)를
 *    소스 글자 그대로 읽어 온다(그 파일은 건드리지 않는다 — 지도 생성기와 좌표가 한 곳에서만 관리된다).
 *  - spots: Regional Hotspot Finder 명소 이름 → [lat, lon]. OSM Nominatim 으로 한 번 찾고,
 *    도시 경계 상자 안에 든 결과만 받는다. 이미 있는 명소는 다시 묻지 않는다(--refresh 로 전부 다시).
 *
 * 실행(patto/ 에서): npx tsx scripts/make-explore-geo.mts [--refresh]
 * 이용 정책: Nominatim 은 초당 1회 이하 — 요청 사이 1.1초. 표기: © OpenStreetMap contributors.
 */
import * as fs from 'fs'
import { HOTSPOT_CITIES } from '../data/regionalHotspots'
import { CITIES } from '../data/transitRoutes'

const OUT = 'lib/blog/explore-geo.generated.json'
const UA = { headers: { 'User-Agent': 'AtlasLabStudios-MapBuilder/1.0 (+https://www.atlaslabstudios.com)', 'Accept-Language': 'en' } }
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const REFRESH = process.argv.includes('--refresh')
type LL = [number, number]

// ── 호텔: make-stay-maps.mjs 의 P · MAPS 를 읽는다 ─────────────────────
// hotels: id → 좌표, hotelMaps: id → 호텔 지도 바탕 지역(gangnam · hongdae · yeouido … 서울 권역 판정에 쓴다)
function hotelCoords() {
  const src = fs.readFileSync('scripts/make-stay-maps.mjs', 'utf8')
  const pBlock = src.match(/\nconst P = (\{[\s\S]*?\n\})/)
  if (!pBlock) throw new Error('make-stay-maps.mjs 에서 P 를 못 찾았다')
  const P = new Function(`return ${pBlock[1]}`)() as Record<string, LL>
  const hotels: Record<string, LL> = {}
  const hotelMaps: Record<string, string> = {}
  for (const m of src.matchAll(/\n {2}'?([\w-]+)'?: \{\s*region: '(\w+)', hotel: \{ at: P\.(\w+)/g)) {
    if (!P[m[3]]) throw new Error(`P.${m[3]} 없음 (${m[1]})`)
    hotels[m[1]] = P[m[3]]
    hotelMaps[m[1]] = m[2]
  }
  return { hotels, hotelMaps }
}

// ── 명소: Nominatim ────────────────────────────────────────────────────
type Box = [number, number, number, number] // [남, 서, 북, 동]
const inBox = ([lat, lon]: LL, [s, w, n, e]: Box) => lat >= s && lat <= n && lon >= w && lon <= e

async function search(q: string, box?: Box): Promise<{ ll: LL; bbox: Box }[]> {
  const u = new URL('https://nominatim.openstreetmap.org/search')
  u.search = new URLSearchParams({ q, format: 'jsonv2', countrycodes: 'kr', limit: '5' }).toString()
  if (box) { u.searchParams.set('viewbox', `${box[1]},${box[2]},${box[3]},${box[0]}`); u.searchParams.set('bounded', '1') }
  await sleep(1100)
  const res = await fetch(u, UA)
  if (!res.ok) throw new Error(`Nominatim ${res.status} (${q})`)
  const rows = (await res.json()) as { lat: string; lon: string; boundingbox: string[] }[]
  return rows.map(r => ({ ll: [+(+r.lat).toFixed(5), +(+r.lon).toFixed(5)] as LL, bbox: r.boundingbox.map(Number) as Box }))
}

// 도시 행정 경계 — 남이섬은 춘천시, 정동진은 강릉시, 설악산 케이블카는 속초시 안이라 도시 상자 하나로 충분하다
const CITY_QUERY: Record<string, string> = {
  seoul: '서울특별시', busan: '부산광역시', gyeongju: '경주시', jeonju: '전주시', gangneung: '강릉시', sokcho: '속초시',
  yeosu: '여수시', daegu: '대구광역시', andong: '안동시', chuncheon: '춘천시', jeju: '제주특별자치도',
}

// OSM 에 가게 이름 그대로는 없는 명소 — 검색어만 바꾼다(좌표를 손으로 적지 않는다). 먼저 시도하고, 안 되면 기본 순서로
const QUERY_HINT: Record<string, string[]> = {
  'Hongdae Busking & Walk Street': ['홍대걷고싶은거리', '어울마당로'],
  'Yeonmujang-gil Pop-up Street': ['연무장길', '연무장5길'],
  'Ttukseom Cafe Street': ['서울숲길', '뚝섬역'],
  'Hannam-dong Designer Street': ['한남동', '한강진역'],
  'Starfield Library at COEX': ['별마당도서관', '코엑스몰'],
  'Apgujeong Rodeo Street': ['압구정로데오역', '압구정로데오'],
  'Nambu Night Market': ['전주 남부시장', '남부시장'],
  'Anmok Beach Coffee Street': ['안목해변', '강릉항'],
  'Jeongdongjin Sea Fan Trail': ['정동심곡바다부채길', '바다부채길', '정동진역'],
  'Yi Sun-sin Square Food Street': ['이순신광장'],
  'Odongdo Island': ['오동도', 'Odongdo'],
  'Seomun Night Market': ['서문시장'],
  'Kim Gwangseok Street': ['김광석다시그리기길', '김광석길'],
  'Apsan Observatory': ['앞산전망대', '앞산공원', '앞산'],
  'Andong Jjimdak Alley': ['안동구시장', '안동찜닭골목'],
  'Myeongdong Dakgalbi Street': ['명동닭갈비골목', '춘천명동', '명동길'],
  'Dongmun Night Market': ['동문재래시장', '동문시장', '제주동문시장'],
}

// 도시 중심(Transit Guide 의 CITIES)에서 이보다 멀면 동명이처로 보고 버린다 — 제주는 섬 전체라 넓게
const MAX_KM: Partial<Record<string, number>> = { jeju: 60 }
const km = ([a, b]: LL, [c, d]: LL) => {
  const R = 6371, r = Math.PI / 180
  const x = (d - b) * r * Math.cos(((a + c) / 2) * r), y = (c - a) * r
  return Math.sqrt(x * x + y * y) * R
}

async function main() {
  const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {}
  const spots: Record<string, LL> = REFRESH ? {} : { ...(prev.spots ?? {}) }
  const missing: string[] = []

  for (const city of HOTSPOT_CITIES) {
    const all = city.clusters ? city.clusters.flatMap(c => c.spots) : city.spots
    const todo = all.filter(s => !spots[s.name])
    if (!todo.length) continue
    const [area] = await search(CITY_QUERY[city.id])
    if (!area) throw new Error(`도시 경계 없음: ${city.id}`)
    console.log(`\n${city.name} ${JSON.stringify(area.bbox)}`)
    for (const s of todo) {
      // 한국어 전체 이름 → '&' · '·' 앞쪽 이름 → 영어 이름 순서로, 도시 상자 안 결과만
      const tries = [...(QUERY_HINT[s.name] ?? []), s.ko, s.ko.split(/[&·]/)[0].trim(), s.name.replace(/ & .*/, '')]
      const center = CITIES.find(c => c.id === city.id)!
      let hit: LL | null = null
      for (const q of [...new Set(tries)]) {
        const r = (await search(q, area.bbox)).find(x => inBox(x.ll, area.bbox) && km(x.ll, [center.lat, center.lon]) <= (MAX_KM[city.id] ?? 25))
        if (r) { hit = r.ll; console.log(`  ✓ ${s.name} ← "${q}" ${r.ll}`); break }
      }
      if (hit) spots[s.name] = hit
      else { missing.push(`${city.name} / ${s.name}`); console.log(`  ✗ ${s.name}`) }
    }
  }

  const { hotels, hotelMaps } = hotelCoords()
  fs.writeFileSync(OUT, JSON.stringify({ hotels, hotelMaps, spots }, null, 1) + '\n')
  console.log(`\n✅ ${OUT} — hotels ${Object.keys(hotels).length}, spots ${Object.keys(spots).length}`)
  if (missing.length) console.log(`좌표를 못 찾은 명소:\n  ${missing.join('\n  ')}`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
