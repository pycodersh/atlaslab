/**
 * 숙소 글 상단 랜드마크 미니맵 — MDX 에서 <StayMap id="gyeongwonjae" /> 로 쓴다. 데이터는 lib/blog/stayMaps.
 *
 * 타일 지도 대신 인라인 SVG 로 그린다: 외부 요청 · 스크립트가 없고, 폰 폭에서 그대로 줄어들며,
 * 색은 CSS 변수라 html.dark 에서 같이 바뀐다(블로그 글 화면은 지금 라이트 전용이라 OS 다크 설정은 따르지 않는다 —
 * 밝은 본문 한가운데 어두운 지도가 뜨지 않게).
 * 지도 안에는 번호 배지만 두고 이름 · 시간은 아래 범례에 적는다 — 폰 폭(약 340px)에서 지도 속 글자는 읽히지 않는다.
 */
import { FRAMES, STAY_MAPS, type LatLon, type StayLandmark } from '@/lib/blog/stayMaps'

const W = 800

const CSS = `
.stay-map {
  --sm-bg: #F4F1EC; --sm-grid: rgba(17,17,17,0.06); --sm-park: #CFE3C2; --sm-park-edge: #AFCD9F;
  --sm-water: #B7D5E6; --sm-plaza: #E7E0D4; --sm-plaza-edge: #D3C9B8; --sm-ink: #262626; --sm-muted: #6B6560; --sm-card: #FFFFFF; --sm-border: #E5E1DC;
  --sm-accent: #C8102E; --sm-pin: #262626; --sm-halo: #F4F1EC;
  margin: 8px 0 36px; border: 1px solid var(--sm-border); border-radius: 14px; overflow: hidden;
  background: var(--sm-card); color: var(--sm-ink);
}
html.dark .stay-map {
  --sm-bg: #1C1E1F; --sm-grid: rgba(255,255,255,0.05); --sm-park: #29452F; --sm-park-edge: #35593C;
  --sm-water: #1F3B4D; --sm-plaza: #2C2A26; --sm-plaza-edge: #3A3732; --sm-ink: #EDEDED; --sm-muted: #A3A09C; --sm-card: #141414; --sm-border: #2E2E2E;
  --sm-accent: #F0485E; --sm-pin: #E5E5E5; --sm-halo: #1C1E1F;
}
.stay-map svg { display: block; width: 100%; height: auto; background: var(--sm-bg); }
.stay-map .sm-label { font: 700 20px/1 "DM Sans", system-ui, sans-serif; fill: var(--sm-ink);
  paint-order: stroke; stroke: var(--sm-halo); stroke-width: 6px; stroke-linejoin: round; }
.stay-map .sm-sub { font: 500 15px/1 "DM Sans", system-ui, sans-serif; fill: var(--sm-muted);
  paint-order: stroke; stroke: var(--sm-halo); stroke-width: 5px; stroke-linejoin: round; }
.stay-map .sm-small { font: 600 13px/1 "DM Sans", system-ui, sans-serif; fill: var(--sm-muted); }
.stay-map .sm-legend { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; padding: 16px 18px 6px; }
.stay-map .sm-item { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; line-height: 1.35; }
.stay-map .sm-badge { flex: 0 0 auto; width: 22px; height: 22px; border-radius: 50%; display: inline-flex;
  align-items: center; justify-content: center; font-size: 12px; font-weight: 700;
  background: var(--sm-pin); color: var(--sm-card); }
.stay-map .sm-badge--hotel { background: var(--sm-accent); color: #fff; }
.stay-map .sm-badge--area { border-radius: 6px; background: var(--sm-park); border: 1.5px solid var(--sm-park-edge); }
.stay-map .sm-badge--drive { background: transparent; color: var(--sm-ink); border: 1.5px solid var(--sm-ink); font-size: 12px; }
.stay-map .sm-name { display: block; font-weight: 600; color: var(--sm-ink); }
.stay-map .sm-time { display: block; color: var(--sm-muted); font-size: 13px; }
.stay-map .sm-credit { margin: 0; padding: 4px 18px 14px; font-size: 11px; color: var(--sm-muted); }
@media (max-width: 560px) {
  .stay-map .sm-legend { grid-template-columns: 1fr; gap: 9px; padding: 14px 14px 4px; }
  .stay-map .sm-credit { padding: 4px 14px 12px; }
  /* SVG 글자는 지도와 같이 줄어든다 — 폰에서는 사용자 단위 크기를 키워 약 11px 로 맞춘다 */
  .stay-map .sm-label { font-size: 28px; }
  .stay-map .sm-sub { display: none; }
}
`

const H = 560
/** 핀이 들어갈 안쪽 영역 — 아래 70 은 공항 칩 · 축척 자리로 비워 둔다 */
const BOX = { left: 60, right: W - 60, top: 56, bottom: H - 84 }
/** 너무 가까운 점들만 있을 때도 동네가 보이게 최소 범위(m) */
const MIN_SPAN_M = 650

/** 호텔 + 랜드마크가 BOX 안에 꽉 차게 맞춘다. 모든 지도가 같은 크기(800×560) · 같은 여백 규격이다 */
function projector(points: readonly LatLon[]) {
  const lat0 = points.reduce((a, p) => a + p[0], 0) / points.length
  const mx = 111320 * Math.cos((lat0 * Math.PI) / 180)
  const my = 110950
  const xs = points.map(p => p[1] * mx)
  const ys = points.map(p => -p[0] * my)
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2
  const bw = Math.max(MIN_SPAN_M, Math.max(...xs) - Math.min(...xs))
  const bh = Math.max(MIN_SPAN_M * 0.6, Math.max(...ys) - Math.min(...ys))
  const unitsPerMeter = Math.min((BOX.right - BOX.left) / bw, (BOX.bottom - BOX.top) / bh)
  const ox = (BOX.left + BOX.right) / 2
  const oy = (BOX.top + BOX.bottom) / 2
  const xy = (lat: number, lon: number): [number, number] =>
    [ox + (lon * mx - cx) * unitsPerMeter, oy + (-lat * my - cy) * unitsPerMeter]
  return { xy, unitsPerMeter }
}

const r1 = (v: number) => Math.round(v * 10) / 10
const pathOf = (pts: readonly (readonly [number, number])[], xy: (lat: number, lon: number) => [number, number]) =>
  pts.map(([lon, lat], i) => { const [x, y] = xy(lat, lon); return `${i ? 'L' : 'M'}${r1(x)},${r1(y)}` }).join('') + 'Z'

function modeIcon(mode: StayLandmark['mode']) {
  return mode === 'drive' ? '✈' : mode === 'underground' ? '⇣' : ''
}

export function StayMap({ id }: { id: string }) {
  const cfg = STAY_MAPS[id]
  if (!cfg) return null
  const frame = FRAMES[cfg.frame]
  const { xy, unitsPerMeter } = projector([cfg.hotel.at, ...cfg.landmarks.flatMap(l => (l.at ? [l.at] : []))])
  const [hx, hy] = xy(...cfg.hotel.at)

  // 번호는 핀이 있는 랜드마크에만 매긴다(공원 'area' 는 면으로 표시)
  let n = 0
  const items = cfg.landmarks.map(l => ({ ...l, num: l.kind === 'area' ? null : ++n }))
  // 호텔 바로 앞 점(예: 문 앞 지하철 출구)은 배지가 호텔 핀을 덮지 않게 같은 방향으로 MIN_GAP 까지 밀어낸다
  const MIN_GAP = 46
  const pins = items.filter(l => l.num !== null && l.at).map(l => {
    let [x, y] = xy(...l.at!)
    const d = Math.hypot(x - hx, y - hy)
    if (d < MIN_GAP) {
      const [ux, uy] = d > 0.5 ? [(x - hx) / d, (y - hy) / d] : [0.7071, 0.7071]
      ;[x, y] = [hx + ux * MIN_GAP, hy + uy * MIN_GAP]
    }
    return { ...l, x, y }
  })

  // 지도 밖 목적지(공항 · 서울역)는 왼쪽 아래 칩으로 둔다. 화살표는 실제 방위(호텔 → 목적지)로 돌린다
  const off = cfg.offmap
  const [ax, ay] = xy(...off.at)
  const bearing = (Math.atan2(ay - hy, ax - hx) * 180) / Math.PI
  const chipW = 60 + off.chip.length * 8.6

  // 호텔 이름은 넓은 쪽으로 — 오른쪽 가장자리에 붙은 호텔이면 왼쪽에 쓴다
  // 폭은 폰 크기(28 단위) 기준 대략값 — 글자 하나 ≈ 0.6em
  // 오른쪽 → 왼쪽 → 아래 → 위 순서로, 지도 밖으로 나가지 않고 번호 배지와 겹치지 않는 첫 자리를 쓴다
  const labelW = Math.max(cfg.hotel.name.length * 28 * 0.6, (cfg.hotel.sub?.length ?? 0) * 15 * 0.55)
  // 같은 쪽이라도 글자 줄을 위 · 아래로 30 단위 옮긴 자리까지 본다
  // 글자 상자: 이름 줄 위(ly-20) ~ 부제 줄 아래(ly+24)
  type Spot = { lx: number; ly: number; anchor: 'start' | 'end' | 'middle'; box: number[] }
  const spots: Spot[] = ([-4, -36, 28] as const).flatMap((dy): Spot[] => [
    { lx: hx + 22, ly: hy + dy, anchor: 'start' as const, box: [hx + 20, hy + dy - 20, hx + 22 + labelW, hy + dy + 24] },
    { lx: hx - 22, ly: hy + dy, anchor: 'end' as const, box: [hx - 22 - labelW, hy + dy - 20, hx - 20, hy + dy + 24] },
  ]).concat([
    { lx: hx, ly: hy + 52, anchor: 'middle' as const, box: [hx - labelW / 2, hy + 26, hx + labelW / 2, hy + 80] },
    { lx: hx, ly: hy - 56, anchor: 'middle' as const, box: [hx - labelW / 2, hy - 82, hx + labelW / 2, hy - 28] },
  ])
  const inside = ([x0, y0, x1, y1]: number[]) => x0 >= 8 && x1 <= W - 8 && y0 >= 4 && y1 <= H - 70
  const hits = ([x0, y0, x1, y1]: number[]) =>
    pins.filter(p => !(p.x + 18 < x0 || p.x - 18 > x1 || p.y + 18 < y0 || p.y - 18 > y1)).length
  // 깨끗한 자리가 없으면 지도 안에 들어가는 자리 중 배지와 가장 적게 겹치는 곳
  const { lx, ly, anchor } = spots.filter(s => inside(s.box)).sort((a, b) => hits(a.box) - hits(b.box))[0] ?? spots[0]

  const scaleLen = 200 * unitsPerMeter
  const aria = `Map of ${cfg.hotel.name} and nearby landmarks: ` +
    items.map(l => `${l.name} (${l.time})`).join(', ') + `; ${off.name} ${off.time}.`

  return (
    <figure className="stay-map not-prose">
      <style>{CSS}</style>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria}>
        <defs>
          <pattern id={`sm-grid-${id}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="var(--sm-grid)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#sm-grid-${id})`} />

        {frame.shapes.map((s, i) => s.kind === 'water'
          ? <path key={i} d={pathOf(s.poly, xy)} fill="var(--sm-water)" />
          : <path key={i} d={pathOf(s.poly, xy)} fill={s.kind === 'park' ? 'var(--sm-park)' : 'var(--sm-plaza)'}
              stroke={s.kind === 'park' ? 'var(--sm-park-edge)' : 'var(--sm-plaza-edge)'} strokeWidth="2" strokeLinejoin="round" />)}
        {('lines' in frame ? frame.lines : []).map((ln, i) => (
          <path key={`line-${i}`} d={pathOf(ln.pts, xy).slice(0, -1)} fill="none" stroke="var(--sm-water)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {/* 공원(area) — 핀 대신 가장 가까운 가장자리에 이름만 */}
        {items.filter(l => l.kind === 'area' && l.at).map(l => { const [x, y] = xy(...l.at!); return (
          <text key={`area-${l.name}`} x={x} y={y} textAnchor="middle" className="sm-sub" style={{ fontWeight: 700 }}>{l.label ?? l.name}</text>
        ) })}

        {/* 호텔 → 랜드마크 도보선 */}
        {pins.map(({ x, y, ...l }) => (
          <line key={`ln-${l.num}`} x1={hx} y1={hy} x2={x} y2={y} stroke="var(--sm-ink)" strokeOpacity="0.45"
            strokeWidth="2" strokeDasharray={l.mode === 'underground' ? '2 5' : '7 6'} strokeLinecap="round" />
        ))}

        {/* 랜드마크 번호 배지 */}
        {pins.map(({ x, y, ...l }) => (
          <g key={`pin-${l.num}`}>
            <circle cx={x} cy={y} r="15" fill="var(--sm-pin)" stroke="var(--sm-halo)" strokeWidth="3" />
            <text x={x} y={y + 6} textAnchor="middle" style={{ font: '700 17px "DM Sans", system-ui, sans-serif', fill: 'var(--sm-card)' }}>{l.num}</text>
          </g>
        ))}

        {/* 기준점(호텔) */}
        <circle cx={hx} cy={hy} r="26" fill="var(--sm-accent)" opacity="0.18" />
        <circle cx={hx} cy={hy} r="13" fill="var(--sm-accent)" stroke="var(--sm-halo)" strokeWidth="4" />
        <text x={lx} y={ly} textAnchor={anchor} className="sm-label">{cfg.hotel.name}</text>
        {cfg.hotel.sub && <text x={lx} y={ly + 21} textAnchor={anchor} className="sm-sub">{cfg.hotel.sub}</text>}

        {/* 지도 밖 목적지 방향 칩 */}
        <g transform={`translate(20 ${H - 60})`}>
          <rect width={r1(chipW)} height="40" rx="20" fill="var(--sm-card)" stroke="var(--sm-border)" strokeWidth="1.5" />
          <g transform={`translate(24 20) rotate(${r1(bearing)})`}>
            <path d="M-9 0H7M2 -6L9 0L2 6" fill="none" stroke="var(--sm-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <text x="44" y="26" style={{ font: '700 16px "DM Sans", system-ui, sans-serif', fill: 'var(--sm-ink)' }}>{off.chip}</text>
        </g>

        {/* 축척 · 방위 */}
        <g transform={`translate(${W - 56 - scaleLen} ${H - 30})`}>
          <path d={`M0 0V8H${r1(scaleLen)}V0`} fill="none" stroke="var(--sm-ink)" strokeWidth="2" />
          <text x={scaleLen / 2} y="-6" textAnchor="middle" className="sm-small">200 m</text>
        </g>
        <g transform={`translate(${W - 24} ${H - 34})`}>
          <path d="M0 -16L8 6L0 1L-8 6Z" fill="var(--sm-ink)" />
          <text x="0" y="22" textAnchor="middle" className="sm-small">N</text>
        </g>
      </svg>

      <figcaption>
        <div className="sm-legend">
          <div className="sm-item">
            <span className="sm-badge sm-badge--hotel" aria-hidden>★</span>
            <span><span className="sm-name">{cfg.hotel.name}</span><span className="sm-time">Your base</span></span>
          </div>
          {items.map(l => (
            <div className="sm-item" key={l.name}>
              <span className={`sm-badge${l.num === null ? ' sm-badge--area' : ''}`} aria-hidden>{l.num ?? ''}</span>
              <span><span className="sm-name">{l.name}</span><span className="sm-time">{modeIcon(l.mode)} {l.time}</span></span>
            </div>
          ))}
          <div className="sm-item">
            <span className="sm-badge sm-badge--drive" aria-hidden>{off.icon === 'plane' ? '✈' : '→'}</span>
            <span><span className="sm-name">{off.name}</span><span className="sm-time">{off.time}</span></span>
          </div>
        </div>
        <p className="sm-credit">Walking times are approximate. Map data © OpenStreetMap contributors.</p>
      </figcaption>
    </figure>
  )
}
