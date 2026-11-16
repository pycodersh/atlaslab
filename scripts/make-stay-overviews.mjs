/**
 * 숙소 지도 줌 아웃 단계(도시 전체 · 대한민국 전도) 바탕 이미지 생성기.
 *
 * StayMap 은 동네 상세 지도(make-stay-maps.mjs 의 지역 이미지)에서 시작하고, − / City / Korea 버튼으로
 * 이 스크립트가 만든 두 단계로 물러난다. 실제 OSM 타일을 낮은 줌(도시 ≈ z11, 전국 ≈ z7)으로 받아
 * 같은 밝은 톤으로 누르고 영어 지명을 얹는다. 지역마다 상세 지도와 '같은 가로세로 비율'로 만들어
 * 단계를 바꿔도 지도 틀 높이가 그대로다.
 *
 * 호텔 위치는 lib/blog/stay-maps.generated.json 의 상세 지도 픽셀 좌표를 지역 bbox 로 되돌려(역 메르카토르) 구한다
 * — 좌표를 두 군데에 적지 않으려고. 그래서 make-stay-maps.mjs 를 먼저 돌린 뒤 이것을 돌린다.
 *
 * 실행(patto/ 에서): node scripts/make-stay-overviews.mjs [--no-upload]
 * 결과: blog-covers/stay-ov-<region>-<city|korea>-<VER>.webp, lib/blog/stay-map-overviews.generated.json
 * 이용 정책: 타일은 디스크 캐시(make-stay-maps 와 같은 폴더)를 쓰고 요청 사이에 간격을 둔다. © OpenStreetMap contributors.
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import sharp from 'sharp'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

const VER = 'v2'
const UA = { headers: { 'User-Agent': 'AtlasLabStudios-MapBuilder/1.0 (+https://www.atlaslabstudios.com)' } }
const sleep = ms => new Promise(r => setTimeout(r, ms))
const NO_UPLOAD = process.argv.includes('--no-upload')

// make-stay-maps.mjs 의 REGIONS bbox 와 같아야 한다(상세 지도 좌표 → 위경도 역변환용)
const REGION_BBOX = {
  songdo: [37.372, 126.405, 37.505, 126.675],
  seoul: [37.514, 126.925, 37.590, 127.035],
  gangnam: [37.474, 126.985, 37.540, 127.115],
  yeouido: [37.500, 126.890, 37.560, 126.975],
  hongdae: [37.536, 126.895, 37.576, 126.950],
  haeundae: [35.140, 129.120, 35.180, 129.190],
  jungmun: [33.226, 126.383, 33.264, 126.440],
}

// 도시 단계 — center 를 가운데로, 가로 lonSpan 도만큼 보인다
const CITIES = {
  seoul: {
    name: 'Seoul', center: [37.545, 126.985], lonSpan: 0.46,
    labels: [
      { t: 'SEOUL', at: [37.595, 126.985], size: 26 },
      { t: 'Han River', at: [37.528, 126.90], size: 22, italic: true },
      { t: 'GANGNAM', at: [37.488, 127.045], size: 18 },
      { t: 'Gimpo Airport', at: [37.5587, 126.7945], size: 17, dot: true },
      { t: 'Seoul Station', at: [37.5547, 126.9707], size: 15, dot: true },
    ],
  },
  incheon: {
    name: 'Incheon & Seoul', center: [37.47, 126.67], lonSpan: 0.78,
    labels: [
      { t: 'Incheon Airport', at: [37.4602, 126.4407], size: 18, dot: true },
      { t: 'SEOUL', at: [37.565, 126.98], size: 24 },
      { t: 'INCHEON', at: [37.47, 126.70], size: 20 },
      { t: 'Yellow Sea', at: [37.33, 126.40], size: 22, italic: true },
    ],
  },
  busan: {
    name: 'Busan', center: [35.155, 129.07], lonSpan: 0.48,
    labels: [
      { t: 'BUSAN', at: [35.205, 129.06], size: 26 },
      { t: 'Gimhae Airport', at: [35.1795, 128.9382], size: 17, dot: true },
      { t: 'Busan Station', at: [35.1151, 129.0422], size: 15, dot: true },
      { t: 'Korea Strait', at: [35.03, 129.12], size: 20, italic: true },
    ],
  },
  jeju: {
    name: 'Jeju Island', center: [33.37, 126.56], lonSpan: 1.0,
    labels: [
      { t: 'Jeju Airport', at: [33.5104, 126.4914], size: 17, dot: true },
      { t: 'JEJU CITY', at: [33.478, 126.60], size: 18 },
      { t: 'Hallasan', at: [33.3617, 126.5292], size: 18, italic: true },
      { t: 'SEOGWIPO', at: [33.262, 126.62], size: 18 },
    ],
  },
}
const CITY_OF = { songdo: 'incheon', seoul: 'seoul', gangnam: 'seoul', yeouido: 'seoul', hongdae: 'seoul', haeundae: 'busan', jungmun: 'jeju' }

// 대한민국 전도 — 제주까지 세로로 다 들어가게
const KOREA = {
  // 제주 아래로 바다를 넉넉히 둔다 — 오른쪽 아래 확대 버튼이 제주 ★ 를 가리지 않게(가운데 = latRange 가운데)
  center: [35.2, 127.75], latRange: [31.6, 38.8], minLonSpan: 6.2,
  labels: [
    { t: 'SEOUL', at: [37.5665, 126.978], size: 20, dot: true },
    { t: 'BUSAN', at: [35.1796, 129.0756], size: 20, dot: true },
    { t: 'JEJU', at: [33.4996, 126.5312], size: 20, dot: true },
    { t: 'SOUTH KOREA', at: [36.35, 127.95], size: 22 },
    { t: 'Yellow Sea', at: [36.3, 125.35], size: 20, italic: true },
    { t: 'East Sea', at: [37.2, 130.15], size: 20, italic: true },
  ],
}

/* ── 웹 메르카토르(512px 타일 좌표) ── */
const X = (lon, z) => ((lon + 180) / 360) * 2 ** z * 512
const Y = (lat, z) => { const r = (lat * Math.PI) / 180; return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z * 512 }
const LON = (x, z) => (x / (2 ** z * 512)) * 360 - 180
const LAT = (y, z) => { const n = Math.PI - (2 * Math.PI * y) / (2 ** z * 512); return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))) }

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

// 상세 지도와 같은 W×H 로, 가운데 · 가로 범위(경도)를 정해 굽는다
async function render(name, { W, H, center, lonSpan, labels }) {
  // 출력보다 원본이 크거나 같은 가장 작은 줌(make-stay-maps 와 같은 규칙)
  let z = 3
  while ((X(center[1] + lonSpan / 2, z) - X(center[1] - lonSpan / 2, z)) < W) z++
  const bw = X(center[1] + lonSpan / 2, z) - X(center[1] - lonSpan / 2, z)
  const bh = (bw * H) / W
  const x0 = X(center[1], z) - bw / 2, y0 = Y(center[0], z) - bh / 2
  const k = W / bw
  const T = 256, tz = z + 1
  const tx0 = Math.floor(x0 / T), tx1 = Math.floor((x0 + bw) / T), ty0 = Math.floor(y0 / T), ty1 = Math.floor((y0 + bh) / T)
  const comps = []
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) comps.push({ input: await tile(tz, tx, ty), left: (tx - tx0) * T, top: (ty - ty0) * T })
  const mosaic = await sharp({ create: { width: (tx1 - tx0 + 1) * T, height: (ty1 - ty0 + 1) * T, channels: 3, background: '#aad3df' } }).composite(comps).png().toBuffer()
  const cropped = await sharp(mosaic).extract({ left: Math.round(x0 - tx0 * T), top: Math.round(y0 - ty0 * T), width: Math.round(bw), height: Math.round(bh) })
    .resize(W, H).modulate({ saturation: 0.5, brightness: 1.05 }).linear(0.72, 255 * 0.26).toBuffer()
  const px = ([lat, lon]) => [(X(lon, z) - x0) * k, (Y(lat, z) - y0) * k]

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`
  for (const l of labels) {
    const [lx, ly] = px(l.at)
    if (lx < 0 || ly < 0 || lx > W || ly > H) continue
    if (l.dot) svg += `<circle cx="${lx}" cy="${ly}" r="5" fill="#5f5a52" stroke="#fff" stroke-width="2"/>`
    const ty = l.dot ? ly - 11 : ly
    svg += `<text x="${lx}" y="${ty}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${l.size}" font-weight="700" ${l.italic ? 'font-style="italic"' : ''} letter-spacing="${l.italic || l.dot ? 0 : 2}" fill="${l.italic ? '#4a7fa8' : '#6f695e'}" stroke="#fff" stroke-width="5" paint-order="stroke">${esc(l.t)}</text>`
  }
  svg += '</svg>'
  const img = await sharp(cropped).composite([{ input: Buffer.from(svg) }]).webp({ quality: 80 }).toBuffer()

  const file = `stay-ov-${name}-${VER}.webp`
  fs.mkdirSync('map-preview', { recursive: true }); fs.writeFileSync(path.join('map-preview', file), img)
  let url = `/map-preview/${file}`
  if (!NO_UPLOAD) {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } })
    const { error } = await sb.storage.from('blog-covers').upload(file, img, { contentType: 'image/webp', upsert: true })
    if (error) throw new Error(`업로드 실패 ${file}: ${error.message}`)
    url = sb.storage.from('blog-covers').getPublicUrl(file).data.publicUrl
  }
  // 축척: 막대가 90px 이상이 되는 가장 작은 눈금
  const mPerPx = (156543.03392 * Math.cos((center[0] * Math.PI) / 180)) / 2 ** z / 2 / k
  const m = [500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000].find(v => v / mPerPx >= 90) ?? 200000
  console.log(`✅ ${name}: tile z${tz} ${comps.length}장 → ${W}x${H} ${(img.length / 1024).toFixed(0)}KB`)
  return { img: url, px, scale: { px: Math.round(m / mPerPx), label: m >= 1000 ? `${m / 1000} km` : `${m} m` } }
}

// 상세 지도 픽셀 → 위경도 (make-stay-maps buildRegion 과 같은 줌 · 원점)
function unproject(region, W, x, y) {
  const [s, w, n, e] = REGION_BBOX[region]
  let z = 8
  while (X(e, z) - X(w, z) < W) z++
  const x0 = X(w, z), y0 = Y(n, z), k = W / (X(e, z) - x0)
  return [LAT(y0 + y / k, z), LON(x0 + x / k, z)]
}

async function main() {
  const detail = JSON.parse(fs.readFileSync('lib/blog/stay-maps.generated.json', 'utf8'))
  const out = { version: VER, regions: {}, maps: {} }
  const views = {}
  for (const [region, r] of Object.entries(detail.regions)) {
    const { w: W, h: H } = r
    const city = CITIES[CITY_OF[region]]
    // 전국: 제주~휴전선이 세로로 다 들어가는 가로 범위(비율이 넓으면 더 넓게)
    let zz = 8
    const latH = Y(KOREA.latRange[0], zz) - Y(KOREA.latRange[1], zz)
    const lonSpanForHeight = ((latH * W) / H / (2 ** zz * 512)) * 360 * 1.08
    const korea = { ...KOREA, lonSpan: Math.max(KOREA.minLonSpan, lonSpanForHeight) }
    const c = await render(`${region}-city`, { W, H, ...city })
    const kk = await render(`${region}-korea`, { W, H, ...korea })
    views[region] = { c, kk }
    out.regions[region] = {
      city: { img: c.img, scale: c.scale, name: city.name },
      korea: { img: kk.img, scale: kk.scale },
    }
  }
  const r1 = v => Math.round(v * 10) / 10
  for (const [id, m] of Object.entries(detail.maps)) {
    const W = detail.regions[m.region].w
    const ll = unproject(m.region, W, m.hotel.x, m.hotel.y)
    const { c, kk } = views[m.region]
    out.maps[id] = { city: c.px(ll).map(r1), korea: kk.px(ll).map(r1) }
  }
  fs.writeFileSync('lib/blog/stay-map-overviews.generated.json', JSON.stringify(out, null, 1))
  console.log('\n✅ lib/blog/stay-map-overviews.generated.json')
}
main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
