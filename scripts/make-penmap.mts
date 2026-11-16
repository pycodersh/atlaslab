/**
 * 펜화 지도 생성기 — public/maps/penmap-v1.svg + lib/maps/penmap-labels.generated.json
 *
 * 깔끔한 에디토리얼 지도(v2, 2026-11-16) — 도시와 핀이 먼저 보이게 배경을 덜어냈다:
 * 전국(확대 전):  Natural Earth 10m 땅을 부드럽게(단순화 + Chaikin) 다듬어 웜 스톤 #EFECE2 로 채운다.
 *                본토 외에는 큰 섬(65 km² 이상: 제주 · 울릉 · 강화 · 거제 · 진도 · 남해 …)만, 북한은 더 옅게.
 *                강은 한강 / 남한강 / 낙동강만. 물결 해칭 · 산 기호 · 도 경계는 그리지 않는다.
 * 지역(확대 후):  geoBoundaries ADM2 시군구로 땅을 채우고(같은 틴트) 바깥 경계 중 바다 쪽만 해안선으로,
 *                맞닿은 경계 = 구 경계(옅은 점선) · OSM 강 · 물(종이색 수면).
 * 글자는 넣지 않는다 — 영문 지명은 화면(components/maps/PenMap)이 같은 투영으로 얹는다.
 *
 * 실행(patto/ 에서): npx tsx scripts/make-penmap.mts
 *   원본은 node_modules/.cache/penmap 에 한 번 받아 둔다(Overpass 는 가볍게 · 재시도). 바꿨으면 VER 를 올린다.
 * 출처 표기: Natural Earth(퍼블릭 도메인) · geoBoundaries(CC BY 3.0) · © OpenStreetMap contributors.
 */
import * as fs from 'fs'
import * as path from 'path'
import { CANVAS, REGION_BBOX, project, type LL } from '../lib/maps/penmap'

const VER = 'v2'
const CACHE = 'node_modules/.cache/penmap'
const UA = { 'User-Agent': 'AtlasLabStudios-MapBuilder/1.0 (+https://www.atlaslabstudios.com)' }
const SRC = {
  world: 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-10m.json',
  rivers: 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_10m_rivers_lake_centerlines.geojson',
  adm1: 'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/KOR/ADM1/geoBoundaries-KOR-ADM1.geojson',
  adm2: 'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/KOR/ADM2/geoBoundaries-KOR-ADM2.geojson',
}
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

type P = [number, number] // 지도 단위 [x, y]
type Line = P[]

/* ── 원본 받기(캐시) ─────────────────────────────────────────── */
async function cached(name: string, url: string) {
  const f = path.join(CACHE, name)
  if (!fs.existsSync(f) || fs.statSync(f).size < 1000) {
    console.log('  받는 중', name)
    const res = await fetch(url, { headers: UA })
    if (!res.ok) throw new Error(`${name}: ${res.status}`)
    fs.writeFileSync(f, Buffer.from(await res.arrayBuffer()))
  }
  return JSON.parse(fs.readFileSync(f, 'utf8'))
}

/** 지역별 OSM(강 · 물 · 봉우리). 서버가 바쁘면 미러를 돌며 기다린다. 끝내 못 받으면 그 지역은 OSM 없이 그린다 */
async function overpass(id: string, [s, w, n, e]: number[]) {
  const f = path.join(CACHE, `osm-${id}.json`)
  if (fs.existsSync(f) && fs.statSync(f).size > 200) return JSON.parse(fs.readFileSync(f, 'utf8'))
  if (process.env.PENMAP_OFFLINE) { console.log(`  (오프라인) ${id}: OSM 캐시 없음`); return { elements: [] } }
  const bb = [s, w, n, e].join(',')
  const q = `[out:json][timeout:90];(way["waterway"="river"](${bb});way["natural"="water"]["water"~"river|lake|reservoir"](${bb});relation["natural"="water"]["water"~"river|lake|reservoir"](${bb});node["natural"="peak"]["ele"](${bb}););out geom qt;`
  for (let i = 0; i < 6; i++) {
    const ep = OVERPASS[i % OVERPASS.length]
    try {
      const res = await fetch(ep, { method: 'POST', headers: { ...UA, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(q) })
      const t = await res.text()
      if (res.ok && t.startsWith('{')) { fs.writeFileSync(f, t); await sleep(3000); return JSON.parse(t) }
    } catch { /* 다음 미러 */ }
    await sleep(6000 * (i + 1))
  }
  console.log(`  ⚠ ${id}: Overpass 응답 없음 — 강 · 물 · 봉우리 없이 그린다`)
  return { elements: [] }
}

/* ── 기하 ───────────────────────────────────────────────────── */
const pr = ([lon, lat]: number[]): P => project(lat, lon)
const r1 = (v: number) => Math.round(v * 10) / 10

function simplify(pts: Line, tol: number): Line {
  if (pts.length < 3) return pts
  // 닫힌 고리는 처음 = 끝이라 기준선이 점이 된다 — 가장 먼 점에서 둘로 나눠 따로 줄인다
  const [fx, fy] = pts[0], [lx, ly] = pts[pts.length - 1]
  if (fx === lx && fy === ly) {
    let fi = 1, fd = 0
    pts.forEach(([x, y], i) => { const dd = Math.hypot(x - fx, y - fy); if (dd > fd) { fd = dd; fi = i } })
    if (fi <= 0 || fi >= pts.length - 1) return pts
    return [...dp(pts.slice(0, fi + 1), tol).slice(0, -1), ...dp(pts.slice(fi), tol)]
  }
  return dp(pts, tol)
}
function dp(pts: Line, tol: number): Line {
  if (pts.length < 3) return pts
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1
  const st: [number, number][] = [[0, pts.length - 1]]
  while (st.length) {
    const [a, b] = st.pop()!
    const [ax, ay] = pts[a], [bx, by] = pts[b]
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1
    let md = 0, mi = -1
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / L
      if (d > md) { md = d; mi = i }
    }
    if (md > tol) { keep[mi] = 1; st.push([a, mi], [mi, b]) }
  }
  return pts.filter((_, i) => keep[i])
}

/** Chaikin 모서리 깎기 — 꺾인 선을 부드러운 곡선처럼(n 번) */
function chaikin(pts: Line, n: number, closed: boolean): Line {
  let p = closed && pts.length > 2 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1] ? pts.slice(0, -1) : pts
  for (let k = 0; k < n; k++) {
    const o: Line = closed ? [] : [p[0]]
    const m = closed ? p.length : p.length - 1
    for (let i = 0; i < m; i++) {
      const a = p[i], b = p[(i + 1) % p.length]
      o.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75])
    }
    if (!closed) o.push(p[p.length - 1])
    p = o
  }
  return closed ? [...p, p[0]] : p
}

/** 반올림한 절대좌표의 차로 상대 명령을 쓴다 — 오차가 쌓이지 않고 글자 수가 준다 */
function d(lines: Line[], close = false) {
  let s = ''
  for (const l of lines) {
    if (l.length < 2) continue
    let [px, py] = [r1(l[0][0]), r1(l[0][1])]
    s += `M${px} ${py}`
    for (let i = 1; i < l.length; i++) {
      const x = r1(l[i][0]), y = r1(l[i][1])
      if (x === px && y === py) continue
      s += `l${r1(x - px)} ${r1(y - py)}`; px = x; py = y
    }
    if (close) s += 'z'
  }
  return s.replace(/ -/g, '-')
}

type BoxU = { x0: number; y0: number; x1: number; y1: number }
const boxU = ([s, w, n, e]: number[], pad = 0): BoxU => {
  const [x0, y0] = project(n, w), [x1, y1] = project(s, e)
  const px = (x1 - x0) * pad, py = (y1 - y0) * pad
  return { x0: x0 - px, y0: y0 - py, x1: x1 + px, y1: y1 + py }
}
const inB = ([x, y]: P, b: BoxU) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1

/** 상자 밖으로 나간 부분을 끊어 상자 안 조각만 남긴다 */
function clip(l: Line, b: BoxU): Line[] {
  const out: Line[] = []; let cur: Line = []
  for (const p of l) { if (inB(p, b)) cur.push(p); else { if (cur.length > 1) out.push(cur); cur = [] } }
  if (cur.length > 1) out.push(cur)
  return out
}

function inRing([x, y]: P, ring: Line) {
  let c = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}
type Poly = { rings: Line[]; b: BoxU }
const polyOf = (rings: Line[]): Poly => {
  const xs = rings[0].map(p => p[0]), ys = rings[0].map(p => p[1])
  return { rings, b: { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) } }
}
const onLand = (p: P, land: Poly[]) => land.some(pl => inB(p, pl.b) && inRing(p, pl.rings[0]) && !pl.rings.slice(1).some(h => inRing(p, h)))

/* ── 토폴로지(world-atlas) ───────────────────────────────────── */
function topoPolys(topo: any, id: string): Line[][] {
  const { scale: [sx, sy], translate: [tx, ty] } = topo.transform
  const arcs: number[][][] = topo.arcs.map((a: number[][]) => { let x = 0, y = 0; return a.map(([dx, dy]) => [(x += dx) * sx + tx, (y += dy) * sy + ty]) })
  const arc = (i: number) => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse())
  const ring = (ids: number[]) => ids.flatMap((i, k) => (k ? arc(i).slice(1) : arc(i))).map(pr)
  const g = topo.objects.countries.geometries.find((x: any) => x.id === id)
  const polys = g.type === 'Polygon' ? [g.arcs] : g.arcs
  return polys.map((p: number[][]) => p.map(ring))
}

/* ── 행정 경계: 맞닿은 변(안쪽 경계)과 혼자인 변(해안 · 국경) ────── */
function edges(features: any[], keep: (f: any) => boolean) {
  const key = (c: number[]) => `${c[0].toFixed(5)},${c[1].toFixed(5)}`
  const cnt = new Map<string, number>()
  const pt = new Map<string, number[]>()
  const segs: [string, string][] = []
  for (const f of features) {
    if (!keep(f)) continue
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
    for (const p of polys) for (const ring of p) for (let i = 1; i < ring.length; i++) {
      const a = key(ring[i - 1]), b = key(ring[i]); if (a === b) continue
      pt.set(a, ring[i - 1]); pt.set(b, ring[i])
      const k = a < b ? `${a}|${b}` : `${b}|${a}`
      if (!cnt.has(k)) segs.push(a < b ? [a, b] : [b, a])
      cnt.set(k, (cnt.get(k) ?? 0) + 1)
    }
  }
  const chain = (want: (c: number) => boolean): Line[] => {
    const adj = new Map<string, string[]>()
    for (const [a, b] of segs) {
      if (!want(cnt.get(`${a}|${b}`)!)) continue
      ;(adj.get(a) ?? adj.set(a, []).get(a)!).push(b)
      ;(adj.get(b) ?? adj.set(b, []).get(b)!).push(a)
    }
    const used = new Set<string>()
    const ek = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)
    const lines: Line[] = []
    const walk = (start: string) => {
      for (const nb of adj.get(start) ?? []) {
        if (used.has(ek(start, nb))) continue
        const l = [start]; let prev = start, cur = nb
        used.add(ek(prev, cur))
        while (true) {
          l.push(cur)
          const nx = (adj.get(cur) ?? []).filter(n => !used.has(ek(cur, n)))
          if ((adj.get(cur)?.length ?? 0) !== 2 || !nx.length) break
          used.add(ek(cur, nx[0])); prev = cur; cur = nx[0]
        }
        lines.push(l.map(k => pr(pt.get(k)!)))
      }
    }
    for (const [k, v] of adj) if (v.length !== 2) walk(k)
    for (const k of adj.keys()) walk(k) // 고리
    return lines
  }
  return { inner: chain(c => c >= 2), outer: chain(c => c === 1) }
}

/** OSM 멀티폴리곤 바깥 고리 — 조각 난 way 들을 끝점끼리 이어 닫는다 */
function joinRings(parts: Line[]): Line[] {
  const rings: Line[] = []; const left = parts.map(p => p.slice())
  const eq = (a: P, b: P) => Math.abs(a[0] - b[0]) < 0.01 && Math.abs(a[1] - b[1]) < 0.01
  while (left.length) {
    let cur = left.shift()!
    let grew = true
    while (!eq(cur[0], cur[cur.length - 1]) && grew) {
      grew = false
      for (let i = 0; i < left.length; i++) {
        const p = left[i]
        if (eq(cur[cur.length - 1], p[0])) cur = cur.concat(p.slice(1))
        else if (eq(cur[cur.length - 1], p[p.length - 1])) cur = cur.concat(p.slice(0, -1).reverse())
        else continue
        left.splice(i, 1); grew = true; break
      }
    }
    if (cur.length > 3) rings.push(cur)
  }
  return rings
}

/* ── 굽기 ───────────────────────────────────────────────────── */
async function main() {
  fs.mkdirSync(CACHE, { recursive: true })
  const world = await cached('countries-10m.json', SRC.world)
  const riversNE = await cached('rivers-10m.geojson', SRC.rivers)
  const adm1 = await cached('kor-adm1.geojson', SRC.adm1)
  const adm2 = await cached('kor-adm2.geojson', SRC.adm2)

  const canvas = boxU([32.6, 124.5, 38.9, 131.3])
  const g: string[] = []
  const labels: { peaks: { name: string; ll: LL; lod: 'n' | 'c' }[] } = { peaks: [] } // v2: 산 이름은 싣지 않는다(빈 목록)

  // 전국 땅 — 큰 땅덩이만, 부드럽게
  const area = (r: Line) => Math.abs(r.reduce((a, p, i) => { const q = r[(i + 1) % r.length]; return a + p[0] * q[1] - q[0] * p[1] }, 0) / 2)
  const MIN_ISLAND = 6500 // 단위² — 1 km² = 100. 울릉도(약 73 km²)가 남는 선
  const krRings = topoPolys(world, '410').map(p => p[0]).filter(r => r.length > 3 && area(r) >= MIN_ISLAND).map(r => chaikin(simplify(r, 11), 2, true))
  const kpRings = topoPolys(world, '408').map(p => p[0]).filter(r => r.length > 3 && area(r) >= MIN_ISLAND * 4).map(r => chaikin(simplify(r, 14), 2, true))
  g.push(`<g class="pm-lod-n"><path class="pm-nk" d="${d(kpRings, true)}"/><path class="pm-land" d="${d(krRings, true)}"/></g>`)
  console.log(`  남한 땅 ${krRings.length}개(본토 + 큰 섬)`)

  // 강(전국) — 한강 · 남한강 · 낙동강만, 부드러운 곡선
  const ne = riversNE.features.filter((f: any) => ['Han', 'Namhan', 'Nakdong'].includes(f.properties.name))
  const neLines = ne.flatMap((f: any) => (f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates)).map((l: number[][]) => chaikin(simplify(l.map(pr), 6), 2, false))
  g.push(`<path class="pm-lod-n pm-river-n" d="${d(neLines)}"/>`)

  // 지역 상세
  for (const [id, bbox] of Object.entries(REGION_BBOX)) {
    console.log('지역', id)
    const b = boxU(bbox, 0.35)
    const touches = (f: any) => {
      const cs = JSON.stringify(f.geometry.coordinates).match(/-?\d+\.\d+,-?\d+\.\d+/g) ?? []
      return cs.some(c => { const [lon, lat] = c.split(',').map(Number); return inB(pr([lon, lat]), b) })
    }
    const ad = edges(adm2.features, touches)
    const coast = ad.outer.flatMap(l => clip(simplify(l, 0.6), b))
    const inner = ad.inner.flatMap(l => clip(simplify(l, 0.8), b))
    const land: Poly[] = adm2.features.filter(touches).flatMap((f: any) =>
      (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).map((p: number[][][]) => polyOf(p.map(r => r.map(pr)))))
    // 바깥 경계 중 육지 경계(이웃 시군구가 상자 밖이라 혼자 남은 변)는 해안이 아니다 — 양쪽이 다 땅이면 뺀다
    const allAdm2Land: Poly[] = adm2.features.flatMap((f: any) =>
      (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).map((p: number[][][]) => polyOf(p.map(r => r.map(pr)))))
    const nearLand = allAdm2Land.filter(p => p.b.x1 > b.x0 - 50 && p.b.x0 < b.x1 + 50 && p.b.y1 > b.y0 - 50 && p.b.y0 < b.y1 + 50)
    const realCoast = coast.flatMap(l => {
      const out: Line[] = []; let cur: Line = []
      for (let i = 1; i < l.length; i++) {
        const [ax, ay] = l[i - 1], [bx, by] = l[i]; const L = Math.hypot(bx - ax, by - ay) || 1
        const mx = (ax + bx) / 2, my = (ay + by) / 2, nx = -(by - ay) / L * 1.5, ny = (bx - ax) / L * 1.5
        const sea = !onLand([mx + nx, my + ny], nearLand) || !onLand([mx - nx, my - ny], nearLand)
        if (sea) { if (!cur.length) cur.push(l[i - 1]); cur.push(l[i]) } else { if (cur.length > 1) out.push(cur); cur = [] }
      }
      if (cur.length > 1) out.push(cur)
      return out
    })

    // OSM
    const osm = await overpass(id, bbox)
    const rivers: Line[] = [], water: Line[] = []
    for (const el of osm.elements) {
      if (el.type === 'node') continue // 봉우리 — v2 에서는 그리지 않는다
      if (el.type === 'way' && el.tags?.waterway === 'river') { rivers.push(...clip(simplify(el.geometry.map((p: any) => project(p.lat, p.lon)), 0.5), b)); continue }
      if (el.type === 'way' && el.geometry) { const r = el.geometry.map((p: any) => project(p.lat, p.lon)); if (r.length > 3) water.push(simplify(r, 0.4)); continue }
      if (el.type === 'relation') {
        const outers = el.members.filter((m: any) => m.role === 'outer' && m.geometry).map((m: any) => m.geometry.map((p: any) => project(p.lat, p.lon)))
        water.push(...joinRings(outers).map(r => simplify(r, 0.4)))
      }
    }
    // 작은 연못은 뺀다(넓이 순)
    const bigWater = water.filter(r => area(r) > 6)

    g.push(`<g class="pm-lod-c" data-region="${id}">` +
      `<path class="pm-land-c" d="${d(land.flatMap(p => [simplify(p.rings[0], 0.6)]), true)}"/>` +
      (bigWater.length ? `<path class="pm-water" d="${d(bigWater, true)}"/>` : '') +
      (rivers.length ? `<path class="pm-river" d="${d(rivers)}"/>` : '') +
      `<path class="pm-dist" d="${d(inner)}"/>` +
      `<path class="pm-coast" d="${d(realCoast)}"/>` +
      `</g>`)
    console.log(`  해안 ${realCoast.length} · 구경계 ${inner.length} · 강 ${rivers.length} · 물 ${bigWater.length}`)
  }

  const c = CANVAS
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r1(c.x)} ${r1(c.y)} ${r1(c.w)} ${r1(c.h)}">${g.join('')}</svg>\n`
  fs.mkdirSync('public/maps', { recursive: true })
  fs.writeFileSync(`public/maps/penmap-${VER}.svg`, svg)
  fs.writeFileSync('lib/maps/penmap-labels.generated.json', JSON.stringify(labels, null, 1) + '\n')
  console.log(`\n✅ public/maps/penmap-${VER}.svg ${(svg.length / 1024).toFixed(0)} KB · 봉우리 이름 ${labels.peaks.length}`)
}

main().catch(e => { console.error('\n[중단]', e); process.exit(1) })
