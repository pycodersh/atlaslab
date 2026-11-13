/**
 * 명소 사진 후보 — Wikimedia Commons 에서 상업적 이용이 되는 고화질 사진을 찾아 컨택트 시트로 만든다.
 *
 * 명소마다 두 갈래로 찾는다.
 *   ① 좌표 주변(geosearch, 기본 반경 400m) — 장소가 맞을 가능성이 가장 높다
 *   ② 키워드(full-text search) — 좌표 없는 좋은 사진을 줍는다
 * 그다음 파일 정보(imageinfo · extmetadata)로 거른다.
 *   - 라이선스: CC0 · Public domain · CC BY · CC BY-SA 만. NC · ND · GFDL 단독 · 공정이용은 뺀다.
 *   - 크기: 긴 변 1600px 이상(후보가 4장 미만이면 1200px 까지 낮춘다). JPEG · PNG · WebP 만.
 *   - 지도 · 로고 · 도면 · 문장(紋章) 같은 그림은 제목으로 거른다.
 * 결과는 사람이 고르는 용도다 — 자동으로 글에 넣지 않는다. 장소가 맞는지는 눈으로 확인한다
 * (한국은 파노라마의 자유가 좁아 현대 건축물 사진은 Commons 에 드물다).
 *
 * 사용법 (patto/ 에서)
 *   node scripts/commons-contact-sheet.mjs scripts/commons/gyeongju.json
 * config 예)
 *   { "id": "gyeongju", "title": "Gyeongju one-day course",
 *     "spots": [ { "key": "bulguksa", "name": "Bulguksa Temple", "query": "Bulguksa, Gyeongju", "keywords": ["Bulguksa"], "radius": 500 } ] }
 *   lat/lon 을 주면 그대로 쓰고, 없으면 query 로 Nominatim 을 찾는다(make-stay-map.mjs 와 같은 캐시).
 * 출력: commons-preview/<id>.html (원본 링크 · 라이선스 · 저작자), <id>.jpg (번호 붙은 격자), <id>.json (고른 뒤 올릴 때 쓰는 정보)
 */
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import sharp from 'sharp'

const UA = { 'User-Agent': 'AtlasLabStudios-PhotoPicker/1.0 (+https://www.atlaslabstudios.com)' }
const API = 'https://commons.wikimedia.org/w/api.php'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const cfgPath = process.argv[2]
if (!cfgPath) { console.error('사용법: node scripts/commons-contact-sheet.mjs <config.json>'); process.exit(1) }
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'))
const PER_SPOT = cfg.perSpot ?? 8
const OUT_DIR = 'commons-preview'

/* ---------- 좌표(make-stay-map.mjs 와 같은 캐시) ---------- */
const GEO_CACHE = path.join(os.tmpdir(), 'atlas-geocode-cache.json')
const geoCache = fs.existsSync(GEO_CACHE) ? JSON.parse(fs.readFileSync(GEO_CACHE, 'utf8')) : {}
async function resolve(s) {
  if (typeof s.lat === 'number' && typeof s.lon === 'number') return s
  const q = s.query ?? s.name
  if (!geoCache[q]) {
    const j = await (await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`, { headers: UA })).json()
    if (!j.length) throw new Error(`좌표를 찾지 못했다: ${q}`)
    geoCache[q] = { lat: Number(j[0].lat), lon: Number(j[0].lon), label: j[0].display_name }
    fs.writeFileSync(GEO_CACHE, JSON.stringify(geoCache))
    await sleep(1100)
  }
  console.log(`  ${s.name}: ${geoCache[q].lat.toFixed(5)}, ${geoCache[q].lon.toFixed(5)} (${String(geoCache[q].label).slice(0, 50)})`)
  return { ...s, lat: geoCache[q].lat, lon: geoCache[q].lon }
}

/* ---------- Commons API ---------- */
// POST 로 보낸다 — 파일 제목이 길어(플리커 이관 사진 등) 40개를 GET 주소에 담으면 414 가 난다
async function api(params) {
  const body = new URLSearchParams({ format: 'json', formatversion: '2', ...params })
  for (let k = 0; k < 3; k++) {
    const res = await fetch(API, { method: 'POST', headers: { ...UA, 'Content-Type': 'application/x-www-form-urlencoded' }, body })
    if (res.ok) { await sleep(250); return res.json() }
    console.warn(`  API HTTP ${res.status}, 다시 시도`)
    await sleep(1500 * (k + 1))
  }
  throw new Error(`Commons API 실패: ${params.action} ${params.list ?? params.prop ?? ''}`)
}
const strip = html => String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
const BAD_TITLE = /\b(map|logo|plan|diagram|seal|coat of arms|flag|emblem|stamp|ticket|sign board|poster)\b/i

function licenseOf(meta) {
  const short = strip(meta.LicenseShortName?.value)
  const code = strip(meta.License?.value).toLowerCase()
  const s = `${code} ${short.toLowerCase()}`
  if (/\bnc\b|-nc|non-?commercial|\bnd\b|-nd|no ?deriv|fair use|non-free/.test(s)) return null
  if (/cc0|public domain|^pd|\bpd\b/.test(s)) return { kind: /cc0/.test(s) ? 'CC0' : 'Public domain', short: short || 'Public domain', attribution: false }
  if (/cc[- ]by[- ]sa/.test(s)) return { kind: 'CC BY-SA', short, attribution: true }
  if (/cc[- ]by\b|cc-by-\d/.test(s)) return { kind: 'CC BY', short, attribution: true }
  return null   // GFDL 단독 · 기타는 쓰지 않는다
}
const distKm = (a, b) => {
  const R = 6371, t = d => (d * Math.PI) / 180
  const h = Math.sin(t(b.lat - a.lat) / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(t(b.lon - a.lon) / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

async function candidatesFor(spot) {
  const titles = new Map()   // title → { geo: dist|null, kw: bool }
  const geo = await api({ action: 'query', list: 'geosearch', gscoord: `${spot.lat}|${spot.lon}`, gsradius: String(spot.radius ?? 400), gsnamespace: '6', gslimit: '80' })
  for (const g of geo.query?.geosearch ?? []) titles.set(g.title, { geo: g.dist / 1000, kw: false })
  for (const kw of spot.keywords ?? [spot.name]) {
    const s = await api({ action: 'query', list: 'search', srsearch: `${kw} filetype:bitmap`, srnamespace: '6', srlimit: '40' })
    for (const r of s.query?.search ?? []) titles.set(r.title, { ...(titles.get(r.title) ?? { geo: null }), kw: true })
  }
  const list = [...titles.keys()].filter(t => !BAD_TITLE.test(t))
  const infos = []
  for (let i = 0; i < list.length; i += 40) {
    const j = await api({ action: 'query', titles: list.slice(i, i + 40).join('|'), prop: 'imageinfo|coordinates', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '480' })
    for (const p of j.query?.pages ?? []) {
      const ii = p.imageinfo?.[0]; if (!ii) continue
      if (!/image\/(jpeg|png|webp)/.test(ii.mime)) continue
      const lic = licenseOf(ii.extmetadata ?? {}); if (!lic) continue
      const m = ii.extmetadata ?? {}
      const c = p.coordinates?.[0]
      infos.push({
        title: p.title, page: ii.descriptionurl, thumb: ii.thumburl, original: ii.url, width: ii.width, height: ii.height,
        license: lic.short, licenseKind: lic.kind, licenseUrl: strip(m.LicenseUrl?.value) || null, attributionRequired: lic.attribution,
        artist: strip(m.Artist?.value) || 'Unknown', credit: strip(m.Credit?.value), date: strip(m.DateTimeOriginal?.value).slice(0, 10),
        restrictions: strip(m.Restrictions?.value), description: strip(m.ImageDescription?.value).slice(0, 160),
        distKm: c ? distKm(spot, { lat: c.lat, lon: c.lon }) : titles.get(p.title)?.geo ?? null, viaGeo: titles.get(p.title)?.geo != null, viaKeyword: !!titles.get(p.title)?.kw,
      })
    }
  }
  const long = i => Math.max(i.width, i.height)
  let pool = infos.filter(i => long(i) >= 1600)
  if (pool.length < 4) pool = infos.filter(i => long(i) >= 1200)
  const kwHit = i => (spot.keywords ?? [spot.name]).some(k => i.title.toLowerCase().includes(k.toLowerCase()))
  const score = i => (i.viaGeo ? 3 : 0) + (kwHit(i) ? 3 : 0) + (i.viaKeyword ? 1 : 0) + Math.min(long(i) / 4000, 1) - (i.distKm ?? 1) + (i.width >= i.height ? 0.5 : 0)
  // 한 사람이 같은 자리에서 연달아 찍은 사진이 후보를 다 채우지 않게 저작자당 2장까지만
  const perArtist = new Map()
  return pool.sort((a, b) => score(b) - score(a)).filter(i => {
    const n = (perArtist.get(i.artist) ?? 0) + 1
    perArtist.set(i.artist, n)
    return n <= 2
  }).slice(0, PER_SPOT)
}

/* ---------- 출력 ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
async function main() {
  console.log('좌표 확인…')
  const spots = []
  for (const s of cfg.spots) spots.push(await resolve(s))
  const result = []
  for (const s of spots) {
    console.log(`검색: ${s.name}`)
    const c = await candidatesFor(s)
    c.forEach((x, i) => { x.id = `${s.key}-${i + 1}` })
    result.push({ key: s.key, name: s.name, lat: s.lat, lon: s.lon, candidates: c })
    console.log(`  후보 ${c.length}장`)
  }
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(path.join(OUT_DIR, `${cfg.id}.json`), JSON.stringify({ id: cfg.id, title: cfg.title, spots: result }, null, 2))

  // HTML — 사람이 클릭해 원본을 열어 볼 수 있게
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(cfg.title)} — photo candidates</title>
<style>body{margin:0;padding:24px;font:14px/1.5 system-ui,sans-serif;background:#fafaf9;color:#1c1917}h1{font-size:22px;margin:0 0 4px}h2{font-size:18px;margin:32px 0 10px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}.c{background:#fff;border:1px solid #e7e5e4;border-radius:10px;overflow:hidden}
.c img{display:block;width:100%;aspect-ratio:3/2;object-fit:cover;background:#eee}.m{padding:8px 10px;font-size:12px;color:#57534e}.id{font-weight:700;color:#c8102e;font-size:14px}
.warn{color:#b45309}a{color:#1d4ed8}</style>
<h1>${esc(cfg.title)} — Wikimedia Commons candidates</h1><p>Commercial-use licenses only (CC0 · PD · CC BY · CC BY-SA). Pick by ID, e.g. <b>${esc(result[0]?.candidates[0]?.id ?? '')}</b>. Check that each photo really shows the place.</p>
${result.map(s => `<h2>${esc(s.name)} <small>(${s.candidates.length})</small></h2><div class="g">${s.candidates.map(c => `<div class="c"><a href="${esc(c.page)}" target="_blank"><img src="${esc(c.thumb)}" loading="lazy" alt=""></a><div class="m"><div class="id">${esc(c.id)}</div>
${esc(c.width)}×${esc(c.height)} · ${esc(c.license)}${c.distKm != null ? ` · ${(c.distKm * 1000).toFixed(0)} m away` : ''}<br>by ${esc(c.artist).slice(0, 60)}${c.date ? ` · ${esc(c.date)}` : ''}${c.restrictions ? `<br><span class="warn">⚠ ${esc(c.restrictions)}</span>` : ''}<br><a href="${esc(c.page)}" target="_blank">${esc(c.title.replace(/^File:/, '').slice(0, 60))}</a></div></div>`).join('')}</div>`).join('')}`
  fs.writeFileSync(path.join(OUT_DIR, `${cfg.id}.html`), html)

  // JPG 격자 — 한 장으로 훑어보기용(명소당 한 줄, 칸마다 ID)
  const CW = 320, CH = 213, LW = 200, rows = result.length, cols = PER_SPOT
  const comps = []
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LW + cols * CW}" height="${rows * (CH + 28)}">`
  for (const [r, s] of result.entries()) {
    const y = r * (CH + 28)
    svg += `<text x="12" y="${y + CH / 2}" font-family="Arial" font-size="20" font-weight="700" fill="#111">${esc(s.name.slice(0, 18))}</text>`
    for (const [k, c] of s.candidates.entries()) {
      try {
        const buf = Buffer.from(await (await fetch(c.thumb, { headers: UA })).arrayBuffer())
        comps.push({ input: await sharp(buf).resize(CW - 8, CH, { fit: 'cover' }).toBuffer(), left: LW + k * CW, top: y })
        await sleep(150)
      } catch { /* 썸네일 실패는 칸만 비운다 */ }
      svg += `<rect x="${LW + k * CW}" y="${y + CH}" width="${CW - 8}" height="26" fill="#111"/><text x="${LW + k * CW + 8}" y="${y + CH + 19}" font-family="Arial" font-size="17" font-weight="700" fill="#fff">${esc(c.id)} · ${esc(c.licenseKind)}</text>`
    }
  }
  svg += '</svg>'
  await sharp({ create: { width: LW + cols * CW, height: rows * (CH + 28), channels: 3, background: '#f5f5f4' } })
    .composite([...comps, { input: Buffer.from(svg), left: 0, top: 0 }]).jpeg({ quality: 82 }).toFile(path.join(OUT_DIR, `${cfg.id}.jpg`))
  console.log(`\n✅ ${OUT_DIR}/${cfg.id}.html · .jpg · .json`)
}
main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
