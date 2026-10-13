/**
 * Stay in Korea 글용 "숙소 ↔ 주변 랜드마크" 거리 지도 생성기 (OpenStreetMap 기반).
 *
 * 숙소 1곳과 랜드마크 N곳을 받아, 지도 위에 핀·경로선·거리 박스를 얹은 PNG 한 장을 만든다.
 *   - 지도: OSM 표준 타일(z=자동, 최대 16). 하단에 © OpenStreetMap contributors 표기를 넣는다.
 *   - 경로: 랜드마크마다 mode 가 "drive"(승용차) 또는 "walk"(도보) — OSRM 공개 서버(OSM 데이터)로 실제 도로 경로를 받는다.
 *           mode 가 "none" 이거나 경로 조회가 실패하면 직선 거리만 적는다.
 *   - 좌표: lat/lon 을 주면 그대로, 없으면 name(또는 query)을 Nominatim 으로 찾는다(1초 간격, 결과는 캐시).
 *
 * 사용법 (patto/ 에서)
 *   node scripts/make-stay-map.mjs scripts/stay-maps/paradise-city.json
 *   node scripts/make-stay-map.mjs <config.json> --out map-preview/foo.png      출력 경로 덮어쓰기
 *   node scripts/make-stay-map.mjs <config.json> --upload <글 slug>             blog-covers 에 올리고 본문에 붙일 figure 조각을 출력
 *
 * config 예)
 *   {
 *     "output": "map-preview/paradise-city-osm-map.png",
 *     "width": 1600, "height": 900,
 *     "hotel": { "name": "Paradise City", "sub": "Resort and hotels", "lat": 37.43702, "lon": 126.45673 },
 *     "landmarks": [
 *       { "name": "Incheon Airport T1", "lat": 37.44957, "lon": 126.45212, "mode": "drive" },
 *       { "name": "Namsan Seoul Tower", "query": "N Seoul Tower, Seoul", "mode": "walk" }
 *     ]
 *   }
 *
 * 이용 정책: OSM 타일/Nominatim/OSRM 공개 서버는 가벼운 사용만 허용한다. 요청 사이에 간격을 두고
 * 타일을 디스크에 캐시한다. 대량 생성(수십 장 연속)은 하지 않는다.
 *
 * 글에 넣을 때: 이미지 캡션에 "map © OpenStreetMap contributors" 를 함께 적는다(스크립트가 snippet 에 넣어 준다).
 * 소요 시간은 승용차·도보 "계산값"이다. 셔틀·대중교통 시간은 지도로 알 수 없으니 글에서 따로 확인해 적는다.
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import sharp from 'sharp'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const UA = { 'User-Agent': 'AtlasLabStudios-MapBuilder/1.0 (+https://www.atlaslabstudios.com)' }
const sleep = ms => new Promise(r => setTimeout(r, ms))

/* ---------- 인자 ---------- */
const argv = process.argv.slice(2)
const cfgPath = argv.find(a => !a.startsWith('--'))
const opt = name => { const i = argv.indexOf(`--${name}`); return i !== -1 ? argv[i + 1] : null }
if (!cfgPath) {
  console.error('사용법: node scripts/make-stay-map.mjs <config.json> [--out 파일.png] [--upload <slug>]')
  process.exit(1)
}
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'))
const OUT = opt('out') ?? cfg.output ?? 'map-preview/stay-map.png'
const W = cfg.width ?? 1600
const H = cfg.height ?? 900
const MAX_Z = cfg.maxZoom ?? 16
if (!cfg.hotel || !Array.isArray(cfg.landmarks) || !cfg.landmarks.length) {
  console.error('config 에 hotel 과 landmarks(1개 이상)가 필요하다.'); process.exit(1)
}

/* ---------- 지오코딩(캐시) ---------- */
const GEO_CACHE = path.join(os.tmpdir(), 'atlas-geocode-cache.json')
const geoCache = fs.existsSync(GEO_CACHE) ? JSON.parse(fs.readFileSync(GEO_CACHE, 'utf8')) : {}
async function resolvePlace(p) {
  if (typeof p.lat === 'number' && typeof p.lon === 'number') return { ...p }
  const q = p.query ?? p.name
  if (!geoCache[q]) {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`, { headers: UA })
    const j = await res.json()
    if (!j.length) throw new Error(`장소를 찾지 못했다: ${q} (lat/lon 을 직접 적어 준다)`)
    geoCache[q] = { lat: Number(j[0].lat), lon: Number(j[0].lon), label: j[0].display_name }
    fs.writeFileSync(GEO_CACHE, JSON.stringify(geoCache))
    console.log(`  좌표 조회: ${q} → ${geoCache[q].lat.toFixed(5)}, ${geoCache[q].lon.toFixed(5)}  (${geoCache[q].label.slice(0, 60)})`)
    await sleep(1100)
  }
  return { ...p, lat: geoCache[q].lat, lon: geoCache[q].lon }
}

/* ---------- 지리 계산 ---------- */
const lon2x = (lon, z) => ((lon + 180) / 360) * 2 ** z * 256
const lat2y = (lat, z) => {
  const r = (lat * Math.PI) / 180
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z * 256
}
const haversineKm = (a, b) => {
  const R = 6371, toR = d => (d * Math.PI) / 180
  const dLat = toR(b.lat - a.lat), dLon = toR(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/* ---------- 경로 ---------- */
const ROUTERS = {
  drive: (a, b) => `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=full&geometries=geojson`,
  walk: (a, b) => `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=full&geometries=geojson`,
}
async function getRoute(from, to, mode) {
  if (mode === 'none' || !ROUTERS[mode]) return null
  try {
    const res = await fetch(ROUTERS[mode](from, to), { headers: UA })
    const j = await res.json()
    const r = j.routes?.[0]
    if (!r) return null
    // 도보 서버의 duration 은 차량 프로파일 값일 수 있어 도보는 거리 기준(시속 4.8km)으로 다시 계산한다.
    const km = r.distance / 1000
    const min = mode === 'walk' ? (km / 4.8) * 60 : r.duration / 60
    return { km, min, coords: r.geometry.coordinates, mode }
  } catch (e) {
    console.warn(`  경로 조회 실패(${mode}) — 직선 거리만 표시: ${e.message}`)
    return null
  }
}

/* ---------- 타일(디스크 캐시) ---------- */
const TILE_DIR = path.join(os.tmpdir(), 'atlas-osm-tiles')
async function getTile(z, x, y) {
  const f = path.join(TILE_DIR, String(z), String(x), `${y}.png`)
  if (fs.existsSync(f)) return fs.readFileSync(f)
  const res = await fetch(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`, { headers: UA })
  if (!res.ok) throw new Error(`타일 ${z}/${x}/${y} → HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  fs.mkdirSync(path.dirname(f), { recursive: true })
  fs.writeFileSync(f, buf)
  await sleep(150)
  return buf
}

/* ---------- 라벨 배치 ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const PALETTE = ['#1a73e8', '#7b3fe4', '#0f9d58', '#e37400', '#d93f8e', '#00897b']
const BOX_W = 340

function pill(x, y, w, lines, accent) {
  const h = 16 + lines.length * 30
  return {
    h,
    svg: `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#fff" stroke="${accent}" stroke-width="3"/>` +
      lines.map((t, i) => `<text x="${x + 16}" y="${y + 34 + i * 30}" font-family="Arial, Helvetica, sans-serif" font-size="${i === 0 ? 24 : 21}" font-weight="${i === 0 ? 700 : 400}" fill="${i === 0 ? '#111' : '#444'}">${esc(t)}</text>`).join('') + '</g>',
  }
}
const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

async function main() {
  console.log('장소 확인…')
  const hotel = await resolvePlace(cfg.hotel)
  const marks = []
  for (const l of cfg.landmarks) marks.push(await resolvePlace(l))

  console.log('경로 조회…')
  const info = []
  for (const m of marks) {
    const mode = m.mode ?? 'drive'
    const route = await getRoute(m, hotel, mode)
    info.push({ place: m, route, straight: haversineKm(m, hotel) })
    await sleep(300)
  }

  // 줌: 핀과 경로가 (캔버스 − 라벨 여백) 안에 들어오는 가장 큰 값
  const pts = [[hotel.lat, hotel.lon], ...marks.map(m => [m.lat, m.lon]), ...info.flatMap(i => (i.route ? i.route.coords.map(([lo, la]) => [la, lo]) : []))]
  const need = { w: W - 2 * 70 - BOX_W, h: H - 2 * 70 }
  let Z = MAX_Z
  for (; Z > 8; Z--) {
    const xs = pts.map(([, lo]) => lon2x(lo, Z)), ys = pts.map(([la]) => lat2y(la, Z))
    if (Math.max(...xs) - Math.min(...xs) <= need.w && Math.max(...ys) - Math.min(...ys) <= need.h) break
  }
  const xs = pts.map(([, lo]) => lon2x(lo, Z)), ys = pts.map(([la]) => lat2y(la, Z))
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2
  const left = cx - W / 2, top = cy - H / 2
  const toPx = (lat, lon) => [lon2x(lon, Z) - left, lat2y(lat, Z) - top]
  console.log(`줌 ${Z}, 캔버스 ${W}x${H}`)

  // 타일 붙이기
  const tx0 = Math.floor(left / 256), tx1 = Math.floor((left + W) / 256)
  const ty0 = Math.floor(top / 256), ty1 = Math.floor((top + H) / 256)
  const comps = []
  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      comps.push({ input: await getTile(Z, tx, ty), left: Math.round(tx * 256 - left), top: Math.round(ty * 256 - top) })
    }
  }
  const base = await sharp({ create: { width: W, height: H, channels: 3, background: '#e8e4dc' } }).composite(comps).png().toBuffer()

  // 오버레이
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`
  const polyline = (coords, color) => {
    const pts2 = coords.map(([lo, la]) => toPx(la, lo).map(v => v.toFixed(1)).join(',')).join(' ')
    return `<polyline points="${pts2}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>` +
      `<polyline points="${pts2}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" ${coords && info.find(i => i.route?.coords === coords)?.route.mode === 'walk' ? 'stroke-dasharray="2 12"' : ''}/>`
  }
  info.forEach((i, idx) => { if (i.route) svg += polyline(i.route.coords, PALETTE[idx % PALETTE.length]) })

  const [hx, hy] = toPx(hotel.lat, hotel.lon)
  const placed = []
  const place = (px, py, lines, accent, h0) => {
    const h = 16 + lines.length * 30
    // 오른쪽 우선, 공간이 없으면 왼쪽. 겹치면 아래로 밀어 본다.
    let x = px + 34
    if (x + BOX_W > W - 12) x = px - 34 - BOX_W
    let y = Math.min(Math.max(py - h / 2, 12), H - h - 44)
    for (let k = 0; k < 40; k++) {
      const r = { x, y, w: BOX_W, h }
      if (!placed.some(p => overlap(r, p))) break
      y += 18
      if (y > H - h - 44) y = 12 + (k % 5) * 6
    }
    const r = { x, y, w: BOX_W, h }
    placed.push(r)
    return pill(x, y, BOX_W, lines, accent).svg
  }

  let labels = ''
  info.forEach((i, idx) => {
    const [x, y] = toPx(i.place.lat, i.place.lon)
    const color = PALETTE[idx % PALETTE.length]
    svg += `<circle cx="${x}" cy="${y}" r="15" fill="${color}" stroke="#fff" stroke-width="5"/>`
    const lines = [i.place.name, `${i.straight.toFixed(1)} km straight line`]
    if (i.route) {
      const unit = i.route.mode === 'walk' ? 'on foot' : 'by road'
      lines.push(`${i.route.km.toFixed(1)} km ${unit}, about ${Math.max(1, Math.round(i.route.min))} min`)
    }
    labels += place(x, y, lines, color)
  })
  svg += `<circle cx="${hx}" cy="${hy}" r="22" fill="#C8102E" stroke="#fff" stroke-width="6"/><circle cx="${hx}" cy="${hy}" r="7" fill="#fff"/>`
  labels += place(hx, hy, [hotel.name, ...(hotel.sub ? [hotel.sub] : [])], '#C8102E')
  svg += labels

  // 축척(1km 또는 500m) + 저작권
  const mPerPx = (156543.03392 * Math.cos((hotel.lat * Math.PI) / 180)) / 2 ** Z
  // 막대가 70px 이상이 되는 가장 작은 눈금
  const scaleM = [100, 200, 500, 1000, 2000, 5000, 10000].find(m => m / mPerPx >= 70) ?? 10000
  const scalePx = scaleM / mPerPx
  const scaleLabel = scaleM >= 1000 ? `${scaleM / 1000} km` : `${scaleM} m`
  svg += `<g><rect x="24" y="${H - 64}" width="${Math.max(scalePx + 24, 96)}" height="40" rx="8" fill="#fff" opacity="0.92"/><rect x="36" y="${H - 38}" width="${scalePx}" height="6" fill="#222"/><text x="36" y="${H - 44}" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#222">${scaleLabel}</text></g>`
  svg += `<g><rect x="${W - 292}" y="${H - 34}" width="292" height="34" fill="#fff" opacity="0.88"/><text x="${W - 282}" y="${H - 11}" font-family="Arial, Helvetica, sans-serif" font-size="17" fill="#333">© OpenStreetMap contributors</text></g>`
  svg += '</svg>'

  fs.mkdirSync(path.dirname(path.resolve(OUT)), { recursive: true })
  await sharp(base).composite([{ input: Buffer.from(svg) }]).png().toFile(OUT)
  console.log(`\n✅ 저장: ${OUT}`)
  for (const i of info) {
    console.log(`  ${i.place.name}: 직선 ${i.straight.toFixed(2)} km` + (i.route ? ` / ${i.route.mode === 'walk' ? '도보' : '도로'} ${i.route.km.toFixed(2)} km, 약 ${i.route.min.toFixed(1)}분` : ' / (경로 없음)'))
  }

  // 업로드 + 본문 조각
  const slug = opt('upload')
  if (slug) {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } })
    const name = `${slug}-map.png`
    const { error } = await sb.storage.from('blog-covers').upload(name, fs.readFileSync(OUT), { contentType: 'image/png', upsert: true })
    if (error) throw new Error(`업로드 실패: ${error.message}`)
    const url = sb.storage.from('blog-covers').getPublicUrl(name).data.publicUrl
    const alt = `Map of ${hotel.name} and its distance from ${marks.map(m => m.name).join(', ')}`
    console.log(`\n업로드: ${url}\n본문에 붙일 조각(원하는 섹션 맨 위에 넣는다):\n`)
    console.log(`<figure className="post-figure">\n<img src="${url}" alt="${alt}" loading="lazy" />\n<figcaption>${hotel.name} and nearby landmarks: straight-line and travel distances (map © OpenStreetMap contributors)</figcaption>\n</figure>\n`)
    console.log('※ 캐시를 피하려면 같은 slug 로 다시 올릴 때 파일명이 같다. 바꾼 지도가 안 보이면 --out 을 다르게 하고 직접 올린다.')
  }
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
