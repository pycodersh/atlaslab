/**
 * 숙소 글 지도(<StayMap id="..." />) 생성기 — 지역별 바탕 이미지 + 호텔별 경로 · 핀 · 말풍선 데이터.
 *
 * 1) 지역(REGIONS)마다 OSM 표준 타일을 붙여 밝은 톤으로 누른 바탕 이미지를 만들고
 *    영어 지명(Incheon Bridge · Han River …)을 얹어 blog-covers/stay-map-<region>-<VER>.webp 로 올린다.
 * 2) 호텔(MAPS)마다 OSRM 공개 서버로 실제 도로 · 도보 경로를 받아 이미지 좌표로 바꾸고,
 *    말풍선(흰 카드)을 핀 · 지명 · 다른 카드와 겹치지 않는 자리에 미리 배치한다.
 * 3) 결과를 lib/blog/stay-maps.generated.json 에 쓴다. 컴포넌트(components/blog/StayMap)는 이 파일만 읽는다.
 *
 * 실행(patto/ 에서): node scripts/make-stay-maps.mjs [--no-upload]
 *   새 호텔은 MAPS 에 항목을 더하고 다시 돌린다. 바탕을 바꿨으면 VER 를 올려 CDN 캐시를 피한다.
 *
 * 이용 정책: 타일 · OSRM · 공개 서버는 가벼운 사용만 — 타일은 디스크에 캐시하고 요청 사이에 간격을 둔다.
 * 표기: © OpenStreetMap contributors (컴포넌트 아래 줄에 나온다).
 * 시간: 도로 시간은 OSRM 무교통 계산값이라 말풍선 문구는 사람이 정한다(아래 cards 의 lines).
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import sharp from 'sharp'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const VER = 'v2'
const W = 1200
const UA = { headers: { 'User-Agent': 'AtlasLabStudios-MapBuilder/1.0 (+https://www.atlaslabstudios.com)' } }
const sleep = ms => new Promise(r => setTimeout(r, ms))
const NO_UPLOAD = process.argv.includes('--no-upload')

/* ── 장소 (OSM 실측) ───────────────────────────────────────── */
const P = {
  T1: [37.44957, 126.45212], T2: [37.46847, 126.43474],
  GW: [37.39174, 126.63745], OW: [37.38939, 126.64407], SH: [37.39011, 126.64544],
  PARK: [37.3925, 126.6385], PARK_W: [37.3941, 126.6323], BRIDGE: [37.4215, 126.5830],
  SEOUL: [37.55542, 126.97259], FS: [37.57065, 126.97537], LE: [37.55967, 126.97945],
  GATE: [37.57593, 126.97682], SQUARE: [37.5720, 126.97675], NAMDAEMUN: [37.55928, 126.97735],
  MYEONGDONG: [37.56384, 126.98505], TOWER: [37.55117, 126.98823],
}

/* ── 지역 바탕 ─────────────────────────────────────────────── */
const REGIONS = {
  songdo: {
    bbox: [37.372, 126.405, 37.505, 126.675], // [남, 서, 북, 동] — 공항 T1·T2, 인천대교, 송도가 한 화면
    labels: [
      { t: 'Yeongjong Island', at: [37.488, 126.505], size: 22 },
      { t: 'Yellow Sea', at: [37.405, 126.47], size: 26, italic: true },
      { t: 'INCHEON', at: [37.468, 126.64], size: 22 },
      { t: 'SONGDO', at: [37.378, 126.612], size: 20 },
    ],
  },
  seoul: {
    bbox: [37.514, 126.925, 37.590, 127.035], // 한강 · 남산 · 서울역 · 경복궁 · 명동이 한 화면
    labels: [
      { t: 'Han River', at: [37.5205, 126.968], size: 24, italic: true },
      { t: 'Namsan', at: [37.5465, 126.9935], size: 20 },
      { t: 'JONGNO', at: [37.5745, 127.003], size: 18 },
      { t: 'YONGSAN', at: [37.535, 126.962], size: 18 },
      { t: 'MAPO', at: [37.552, 126.938], size: 18 },
    ],
  },
}

/* ── 호텔별 지도 ───────────────────────────────────────────────
 * routes: 실제 경로(OSRM). cards: 말풍선 — at 이 핀 자리, pin:false 면 핀 없이 말풍선만(다리 같은 선형 지물).
 * 시간 문구는 OSRM 측정값을 반올림해 사람이 적는다(무교통 차량 시간은 '약'으로). */
const AIRPORT_CARD = { at: P.T1, pin2: P.T2, title: 'Incheon Airport T1 / T2', lines: ['28–32 km by road', 'about 30 min via Incheon Bridge'], color: '#1a73e8' }
// 다리 말풍선은 첫 경로(T1→호텔)에서 경도 126.575 에 가장 가까운 점 — 바다 한가운데 실제 다리 위
const BRIDGE_CARD = { onRoute: { route: 0, lon: 126.575 }, pin: false, title: 'Incheon Bridge', lines: ['21 km sea crossing on the airport route'], color: '#1a73e8' }
const airportRoutes = to => [
  { from: 'T1', to, mode: 'drive', color: '#1a73e8' },
  { from: 'T2', to, mode: 'drive', color: '#1a73e8' },
]

const MAPS = {
  gyeongwonjae: {
    region: 'songdo', hotel: { at: P.GW, title: 'Gyeongwonjae', lines: ['Hanok hotel inside Central Park'] },
    routes: airportRoutes('GW'),
    cards: [AIRPORT_CARD, BRIDGE_CARD,
      { at: P.PARK_W, title: 'Songdo Central Park', lines: ['The hotel sits inside it'], color: '#2e8b57' }],
  },
  oakwood: {
    region: 'songdo', hotel: { at: P.OW, title: 'Oakwood Premier', lines: ['Upper floors of Posco Tower'] },
    routes: airportRoutes('OW'),
    cards: [AIRPORT_CARD, BRIDGE_CARD,
      { at: P.PARK_W, title: 'Songdo Central Park', lines: ['2 min walk'], color: '#2e8b57' }],
  },
  sheraton: {
    region: 'songdo', hotel: { at: P.SH, title: 'Sheraton Grand', lines: ['Across from Central Park'] },
    routes: airportRoutes('SH'),
    cards: [AIRPORT_CARD, BRIDGE_CARD,
      { at: P.PARK_W, title: 'Songdo Central Park', lines: ['One crosswalk away'], color: '#2e8b57' }],
  },
  'four-seasons-seoul': {
    region: 'seoul', hotel: { at: P.FS, title: 'Four Seasons Seoul', lines: ['Gwanghwamun'] },
    routes: [
      { from: 'SEOUL', to: 'FS', mode: 'drive', color: '#1a73e8' },
      { from: 'FS', to: 'GATE', mode: 'walk', color: '#e37400' },
    ],
    cards: [
      { at: P.SEOUL, title: 'Seoul Station', lines: ['AREX Airport Express', '2.3 km · about 10 min by taxi'], color: '#1a73e8' },
      { at: P.GATE, title: 'Gyeongbokgung Palace', lines: ['0.8 km · 10 min walk'], color: '#e37400' },
      { at: P.SQUARE, title: 'Gwanghwamun Square', lines: ['3 min walk'], color: '#7b3fe4' },
    ],
  },
  lescape: {
    region: 'seoul', hotel: { at: P.LE, title: "L'Escape", lines: ['Hoehyeon Stn Exit 7 at the door'] },
    routes: [
      { from: 'SEOUL', to: 'LE', mode: 'drive', color: '#1a73e8' },
      { from: 'LE', to: 'MYEONGDONG', mode: 'walk', color: '#e37400' },
      { from: 'LE', to: 'TOWER', mode: 'walk', color: '#2e8b57' },
    ],
    cards: [
      { at: P.SEOUL, title: 'Seoul Station', lines: ['AREX Airport Express', '1 stop on Line 4 · 5 min by taxi'], color: '#1a73e8' },
      { at: P.NAMDAEMUN, title: 'Namdaemun Market', lines: ['2 min walk'], color: '#7b3fe4' },
      { at: P.MYEONGDONG, title: 'Myeongdong Street', lines: ['0.8 km · 10 min walk'], color: '#e37400' },
      { at: P.TOWER, title: 'N Seoul Tower', lines: ['1.8 km uphill walk', 'or Namsan cable car'], color: '#2e8b57' },
    ],
  },
}

/* ── 지도 계산(웹 메르카토르, 512px 타일) ─────────────────────── */
const X = (lon, z) => ((lon + 180) / 360) * 2 ** z * 512
const Y = (lat, z) => { const r = (lat * Math.PI) / 180; return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z * 512 }

// OSM 표준 타일(256px) — 512px@z 좌표는 256px@(z+1) 좌표와 같아서 z+1 타일을 그대로 붙인다(@2x 해상도).
// CARTO 래스터는 2026년 기준 API 키가 필요해 쓰지 않는다(키 없이 받으면 'API KEY REQUIRED' 그림이 온다).
async function tile(z, x, y) {
  const f = path.join(os.tmpdir(), 'atlas-osm-tiles', `${z}`, `${x}`, `${y}.png`)
  if (fs.existsSync(f)) return fs.readFileSync(f)
  const res = await fetch(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`, UA)
  if (!res.ok) throw new Error(`tile ${z}/${x}/${y} HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, buf); await sleep(150)
  return buf
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

async function buildRegion(key, reg) {
  const [s, w, n, e] = reg.bbox
  // 원본이 출력보다 크거나 같은(축소해서 선명한) 가장 작은 줌
  let z = 8
  while (X(e, z) - X(w, z) < W) z++
  const x0 = X(w, z), y0 = Y(n, z), bw = X(e, z) - x0, bh = Y(s, z) - y0
  const H = Math.round((W * bh) / bw)
  const k = W / bw
  const T = 256, tz = z + 1
  const tx0 = Math.floor(x0 / T), tx1 = Math.floor((x0 + bw) / T), ty0 = Math.floor(y0 / T), ty1 = Math.floor((y0 + bh) / T)
  console.log(`   ${key}: OSM z${tz} 타일 ${(tx1 - tx0 + 1) * (ty1 - ty0 + 1)}장`)
  const comps = []
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) comps.push({ input: await tile(tz, tx, ty), left: (tx - tx0) * T, top: (ty - ty0) * T })
  const mosaic = await sharp({ create: { width: (tx1 - tx0 + 1) * T, height: (ty1 - ty0 + 1) * T, channels: 3, background: '#f2efe9' } }).composite(comps).png().toBuffer()
  // 밝은 톤: 채도를 낮추고 살짝 밝게 — 바다 · 강 · 도로 윤곽은 남기고 한글 지명 · 상점 표시는 뒤로 물린다
  const cropped = await sharp(mosaic).extract({ left: Math.round(x0 - tx0 * T), top: Math.round(y0 - ty0 * T), width: Math.round(bw), height: Math.round(bh) })
    .resize(W, H).modulate({ saturation: 0.5, brightness: 1.05 }).linear(0.72, 255 * 0.26).toBuffer()
  const px = ([lat, lon]) => [(X(lon, z) - x0) * k, (Y(lat, z) - y0) * k]

  // 영어 지명(굽기) — 말풍선 배치 때 장애물로도 쓴다
  const obstacles = []
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`
  for (const l of reg.labels) {
    const [lx, ly] = px(l.at)
    const tw = l.t.length * l.size * 0.62
    obstacles.push({ x: lx - tw / 2, y: ly - l.size, w: tw, h: l.size * 1.4 })
    svg += `<text x="${lx}" y="${ly}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${l.size}" font-weight="700" ${l.italic ? 'font-style="italic"' : ''} letter-spacing="${l.italic ? 0 : 2}" fill="${l.italic ? '#4a7fa8' : '#7a7468'}" stroke="#fff" stroke-width="5" paint-order="stroke">${esc(l.t)}</text>`
  }
  svg += '</svg>'
  const img = await sharp(cropped).composite([{ input: Buffer.from(svg) }]).webp({ quality: 82 }).toBuffer()

  const name = `stay-map-${key}-${VER}.webp`
  fs.mkdirSync('map-preview', { recursive: true }); fs.writeFileSync(path.join('map-preview', name), img)
  let url = `/map-preview/${name}`
  if (!NO_UPLOAD) {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } })
    const { error } = await sb.storage.from('blog-covers').upload(name, img, { contentType: 'image/webp', upsert: true })
    if (error) throw new Error(`업로드 실패 ${name}: ${error.message}`)
    url = sb.storage.from('blog-covers').getPublicUrl(name).data.publicUrl
  }
  // 축척: 막대가 90px 이상이 되는 가장 작은 눈금
  const mPerPx = (156543.03392 * Math.cos(((s + n) / 2) * Math.PI / 180)) / 2 ** z / 2 / k
  const m = [200, 500, 1000, 2000, 5000, 10000].find(v => v / mPerPx >= 90) ?? 10000
  console.log(`✅ ${key}: z${z} ${W}x${H} ${(img.length / 1024).toFixed(0)}KB  ${url}`)
  return { img: url, w: W, h: H, px, obstacles, scale: { px: Math.round(m / mPerPx), label: m >= 1000 ? `${m / 1000} km` : `${m} m` } }
}

/* ── 경로 ─────────────────────────────────────────────────── */
const ROUTER = {
  drive: (a, b) => `https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`,
  walk: (a, b) => `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`,
}
async function route(r) {
  const j = await (await fetch(ROUTER[r.mode](P[r.from], P[r.to]), UA)).json()
  await sleep(1100)
  const g = j.routes?.[0]
  if (!g) throw new Error(`경로 없음 ${r.from}→${r.to}: ${j.code}`)
  console.log(`   ${r.from}→${r.to} ${r.mode} ${(g.distance / 1000).toFixed(1)} km, ${(g.duration / 60).toFixed(0)} min`)
  return g.geometry.coordinates.map(([lon, lat]) => [lat, lon])
}
function simplify(pts, tol) {
  if (pts.length < 3) return pts
  const [a, b] = [pts[0], pts[pts.length - 1]]
  let dmax = 0, idx = 0
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((b[0] - a[0]) * (a[1] - pts[i][1]) - (a[0] - pts[i][0]) * (b[1] - a[1])) / L
    if (d > dmax) { dmax = d; idx = i }
  }
  return dmax > tol ? [...simplify(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplify(pts.slice(idx), tol)] : [a, b]
}

/* ── 말풍선 배치 ───────────────────────────────────────────────
 * 카드 크기는 컴포넌트 CSS 와 같은 비율로 잡는다: 폭 30%, 글자 = 컨테이너 폭의 2.0% / 1.75%, 줄간 1.3, 안쪽 여백 1.2% */
const CARD_W = W * 0.30
const cardH = lines => Math.round(W * 0.012 * 2 + W * 0.020 * 1.3 + lines * W * 0.0175 * 1.3 + 6)
const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
const area = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y))

function placeCards(cards, H, obstacles, routePts) {
  const placed = []
  const GAP = 34
  for (const c of cards) {
    const h = cardH(c.lines.length)
    const [ax, ay] = c.anchor
    const cands = []
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, -1], [0, 1], [1, -1], [-1, -1], [1, 1], [-1, 1]]) {
      for (const dist of [GAP, GAP + 50, GAP + 110, GAP + 180]) {
        const x = dx > 0 ? ax + dist : dx < 0 ? ax - dist - CARD_W : ax - CARD_W / 2
        const y = dy > 0 ? ay + dist : dy < 0 ? ay - dist - h : ay - h / 2
        cands.push({ x, y, w: CARD_W, h, dist })
      }
    }
    const score = r => {
      let p = r.dist * 2
      if (r.x < 8 || r.y < 8 || r.x + r.w > W - 8 || r.y + r.h > H - 56) p += 1e6
      for (const o of [...placed, ...obstacles]) p += area(r, o) * 3
      for (const o of placed) if (hit(r, o)) p += 5e4
      for (const [px, py] of routePts) if (px > r.x && px < r.x + r.w && py > r.y && py < r.y + r.h) p += 6
      return p
    }
    const best = cands.sort((a, b) => score(a) - score(b))[0]
    placed.push(best)
    c.box = best
    // 지시선: 핀에서 카드 가장 가까운 점까지
    c.leader = [ax, ay, Math.max(best.x, Math.min(ax, best.x + best.w)), Math.max(best.y, Math.min(ay, best.y + best.h))]
  }
}

/* ── 실행 ─────────────────────────────────────────────────── */
async function main() {
  const regions = {}
  const out = { version: VER, regions: {}, maps: {} }
  for (const [key, reg] of Object.entries(REGIONS)) {
    regions[key] = await buildRegion(key, reg)
    const { img, w, h, scale } = regions[key]
    out.regions[key] = { img, w, h, scale }
  }

  for (const [id, m] of Object.entries(MAPS)) {
    console.log(`▶ ${id}`)
    const R = regions[m.region]
    const r1 = v => Math.round(v * 10) / 10
    const routes = []
    const geo = []
    for (const r of m.routes) {
      const g = await route(r)
      geo.push(g)
      const pts = simplify(g.map(R.px), 1.2)
      routes.push({ color: r.color, dash: r.mode === 'walk', pts: pts.map(([x, y]) => `${r1(x)},${r1(y)}`).join(' '), raw: pts })
    }
    const routePts = routes.flatMap(r => r.raw)
    const [hx, hy] = R.px(m.hotel.at)

    // 핀: 호텔 + 카드마다(공항은 T2 핀 하나 더)
    let num = 0
    const onRoute = c => geo[c.onRoute.route].reduce((a, b) => Math.abs(b[1] - c.onRoute.lon) < Math.abs(a[1] - c.onRoute.lon) ? b : a)
    const cards = m.cards.map(c => ({ ...c, anchor: R.px(c.onRoute ? onRoute(c) : c.at), num: c.pin === false ? null : ++num }))
    const pins = cards.flatMap(c => c.num === null ? [] : [
      { x: r1(c.anchor[0]), y: r1(c.anchor[1]), num: c.num, color: c.color },
      ...(c.pin2 ? [{ x: r1(R.px(c.pin2)[0]), y: r1(R.px(c.pin2)[1]), num: c.num, color: c.color }] : []),
    ])
    const pinObstacles = [[hx, hy, 30], ...pins.map(p => [p.x, p.y, 22])].map(([x, y, r]) => ({ x: x - r, y: y - r, w: 2 * r, h: 2 * r }))

    // 호텔 카드를 먼저 놓고(가장 중요) 나머지를 놓는다
    const all = [{ title: m.hotel.title, lines: m.hotel.lines, color: '#C8102E', anchor: [hx, hy], num: null, hotel: true }, ...cards]
    placeCards(all, R.h, [...R.obstacles, ...pinObstacles], routePts)

    out.maps[id] = {
      region: m.region,
      hotel: { x: r1(hx), y: r1(hy), title: m.hotel.title, lines: m.hotel.lines },
      routes: routes.map(({ raw, ...r }) => r),
      pins,
      cards: all.map(c => ({
        num: c.num, hotel: !!c.hotel, title: c.title, lines: c.lines, color: c.color,
        x: r1(c.box.x), y: r1(c.box.y), leader: c.leader.map(r1),
      })),
    }
  }
  fs.writeFileSync('lib/blog/stay-maps.generated.json', JSON.stringify(out, null, 1))
  console.log('\n✅ lib/blog/stay-maps.generated.json')
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
