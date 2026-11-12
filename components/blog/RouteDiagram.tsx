/**
 * 여행 가이드 위치 다이어그램 — MDX 에서 <RouteDiagram id="ski-resorts" /> 로 쓴다.
 *
 * StayMap(호텔 글)은 OSM 지도 이미지 위에 경로를 얹지만, 이 다이어그램은 순수 인라인 SVG 개념도다.
 * 서울에서 몇 시간 · 어느 방향인지만 보여 주면 되는 글(스키장 · DMZ)이라 실제 지도 대신 간략 윤곽을 그린다.
 * 겉모양은 StayMap 과 맞춘다 — 흰 카드 · #E5E1DC 테두리 · 14px 둥근 모서리 · 레드(#C8102E) 번호 핀 ·
 * 폰(≤640px)에서는 지도 속 보조 문구를 숨기고 같은 내용을 아래 번호 목록으로 보여 준다(SVG 는 폭에 비례해 줄어
 * 375px 에서 보조 문구가 6~7px 이 되기 때문이다). 지명 · 소요 시간은 폰에서도 남긴다.
 *
 * 좌표: 스키장 지도는 위경도를 단순 투영(x = (경도 − 126.55) × 250, y = (38.35 − 위도) × 315)한 값이다.
 * DMZ 지도는 축척 없는 개념도라 남→북 순서만 맞춘다.
 */
import type { ReactNode } from 'react'

const RED = '#C8102E'
const INK = '#292524'
const MUTED = '#78716C'
const SEA = '#E8EEF1'
const FONT = '"DM Sans", system-ui, sans-serif'

type Legend = { mark: 'start' | number; title: string; detail: string }
type Diagram = { aria: string; viewBox: string; legend: Legend[]; credit: string; svg: ReactNode }

const CSS = `
.route-dg { margin: 8px 0 36px; border: 1px solid #E5E1DC; border-radius: 14px; overflow: hidden; background: #fff; }
html.dark .route-dg { border-color: #2E2E2E; background: #141414; }
.route-dg .rd-canvas { background: #FAF9F6; line-height: 0; }
.route-dg svg { display: block; width: 100%; height: auto; }
.route-dg .rd-detail { fill: #57534E; font: 500 18px ${FONT}; }
.route-dg .rd-legend { display: none; list-style: none; margin: 0; padding: 14px 14px 4px; }
.route-dg .rd-legend li { display: flex; gap: 10px; align-items: flex-start; margin: 0 0 10px; padding: 0; font-size: 14px; line-height: 1.35; }
.route-dg .rd-legend li::before { content: none; }
.route-dg .rd-dot { flex: 0 0 auto; display: block; width: 22px; height: 22px; border-radius: 50%; color: #fff; font: 700 12px/22px ${FONT}; text-align: center; background: ${RED}; }
.route-dg .rd-dot--start { background: ${INK}; }
.route-dg .rd-legend b { display: block; color: #111; font-weight: 600; }
html.dark .route-dg .rd-legend b { color: #EDEDED; }
.route-dg .rd-legend span span { display: block; color: #6B6560; font-size: 13px; }
html.dark .route-dg .rd-legend span span { color: #A3A09C; }
.route-dg .rd-credit { margin: 0; padding: 8px 14px 12px; font-size: 11px; line-height: 1.4; color: #6B6560; }
@media (max-width: 640px) {
  .route-dg .rd-detail { display: none; }
  .route-dg .rd-legend { display: block; }
}
`

/* ── SVG 조각 ─────────────────────────────────────────────── */
function Start({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={17} fill="#fff" stroke={INK} strokeWidth={4} />
      <circle cx={x} cy={y} r={7} fill={INK} />
    </g>
  )
}
function Pin({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={17} fill={RED} stroke="#fff" strokeWidth={4} />
      <text x={x} y={y + 6.5} textAnchor="middle" fill="#fff" style={{ font: `700 18px ${FONT}` }}>{n}</text>
    </g>
  )
}
/** 지명(굵게) + 보조 문구(폰에서 숨김) */
function Label({ x, y, anchor = 'middle', name, details = [] }: { x: number; y: number; anchor?: 'start' | 'middle' | 'end'; name: string; details?: string[] }) {
  return (
    <g>
      <text x={x} y={y} textAnchor={anchor} fill={INK} style={{ font: `700 25px ${FONT}` }}>{name}</text>
      {details.map((d, i) => (
        <text key={d} className="rd-detail" x={x} y={y + 26 + i * 23} textAnchor={anchor}>{d}</text>
      ))}
    </g>
  )
}
/** 경로 위 소요 시간 칩 */
function Pill({ x, y, text, w }: { x: number; y: number; text: string; w: number }) {
  return (
    <g>
      <rect x={x - w / 2} y={y - 18} width={w} height={36} rx={18} fill="#fff" stroke="#D6D3D1" strokeWidth={2} />
      <text x={x} y={y + 7.5} textAnchor="middle" fill="#C2410C" style={{ font: `700 23px ${FONT}` }}>{text}</text>
    </g>
  )
}
function Route({ d, faint = false }: { d: string; faint?: boolean }) {
  return (
    <g>
      <path d={d} fill="none" stroke="#FAF9F6" strokeWidth={10} strokeLinecap="round" />
      <path d={d} fill="none" stroke={faint ? '#A8A29E' : MUTED} strokeWidth={faint ? 3 : 4} strokeLinecap="round" strokeDasharray={faint ? '3 9' : '2 12'} />
    </g>
  )
}
function Geo({ x, y, text, anchor = 'middle', italic = false, size = 20 }: { x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end'; italic?: boolean; size?: number }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill="#A8A29E" letterSpacing={italic ? 1 : 3}
      style={{ font: `${italic ? 'italic 500' : '700'} ${size}px ${FONT}` }}>{text}</text>
  )
}

/* ── 다이어그램 ─────────────────────────────────────────────── */
const DIAGRAMS: Record<string, Diagram> = {
  'ski-resorts': {
    aria:
      'Diagram of ski resorts east of Seoul: Vivaldi Park in Hongcheon about 1.5 hours away, Yongpyong Resort in Pyeongchang 2.5 to 3 hours away, and High1 Resort in Jeongseon 3 to 3.5 hours away.',
    viewBox: '0 0 800 470',
    credit: 'Simplified diagram, not to scale. Times are typical shuttle-bus times from central Seoul and grow on snowy weekends.',
    legend: [
      { mark: 'start', title: 'Seoul', detail: 'Starting point · ski shuttles leave from central Seoul' },
      { mark: 1, title: 'Vivaldi Park (Hongcheon)', detail: 'About 1.5 hrs · closest, best for day trips' },
      { mark: 2, title: 'Yongpyong Resort (Pyeongchang)', detail: '2.5–3 hrs · 2018 Winter Olympics host' },
      { mark: 3, title: 'High1 Resort (Jeongseon)', detail: '3–3.5 hrs · long beginner runs' },
    ],
    svg: (
      <>
        {/* 동해 — 강원 해안선 간략 윤곽 */}
        <path d="M452,-10 L512,47 L587,173 L642,268 L717,425 L728,480 L810,480 L810,-10 Z" fill={SEA} />
        <path d="M452,-10 L512,47 L587,173 L642,268 L717,425 L728,480" fill="none" stroke="#CBD5DA" strokeWidth={2} />
        <Geo x={712} y={190} text="East Sea" italic size={23} />
        <Geo x={410} y={70} text="GANGWON PROVINCE" />
        <Geo x={110} y={150} text="GYEONGGI" />
        {/* 북쪽 표시 */}
        <g transform="translate(40,48)">
          <path d="M0,-22 L9,4 L0,-2 L-9,4 Z" fill={MUTED} />
          <text x={0} y={24} textAnchor="middle" fill={MUTED} style={{ font: `700 15px ${FONT}` }}>N</text>
        </g>

        {/* 서울 → 리조트 점선 경로 */}
        <Route d="M107,247 Q195,225 283,221" />
        <Route d="M107,247 Q330,60 533,222" />
        <Route d="M107,247 Q300,420 569,360" />
        <Pill x={190} y={232} w={110} text="1.5 hrs" />
        <Pill x={325} y={147} w={134} text="2.5–3 hrs" />
        <Pill x={319} y={362} w={134} text="3–3.5 hrs" />

        <Start x={107} y={247} />
        <Pin x={283} y={221} n={1} />
        <Pin x={533} y={222} n={2} />
        <Pin x={569} y={360} n={3} />

        <Label x={107} y={292} name="Seoul" details={['Starting point']} />
        <Label x={283} y={268} name="Vivaldi Park" details={['Hongcheon']} />
        <Label x={533} y={268} name="Yongpyong" details={['Pyeongchang', '2018 Olympic host']} />
        <Label x={569} y={406} name="High1" details={['Jeongseon', 'Long beginner runs']} />
      </>
    ),
  },

  dmz: {
    aria:
      'Concept diagram of a DMZ tour from Seoul: about one hour north of central Seoul to Imjingak Park and Freedom Bridge, across the Civilian Control Line to the 3rd Infiltration Tunnel and Dora Observatory, which looks across the 4 km wide DMZ and the Military Demarcation Line toward Kaesong in North Korea.',
    viewBox: '0 0 800 570',
    credit: 'Concept diagram, not to scale. Only licensed tours may cross the Civilian Control Line; JSA / Panmunjom is not on standard tours.',
    legend: [
      { mark: 'start', title: 'Central Seoul', detail: 'Myeongdong / Hongdae pickup · ~1 hr, about 50 km to the border area' },
      { mark: 1, title: 'Imjingak Park & Freedom Bridge', detail: 'Staging area south of the Imjin River, open to everyone' },
      { mark: 2, title: '3rd Infiltration Tunnel', detail: 'North of the Civilian Control Line · tour bus only, passport check' },
      { mark: 3, title: 'Dora Observatory', detail: 'Hilltop binoculars looking across the DMZ toward Kaesong' },
    ],
    svg: (
      <>
        {/* 북한 */}
        <rect x={0} y={0} width={800} height={112} fill="#EFECE7" />
        <text x={400} y={58} textAnchor="middle" fill={INK} letterSpacing={3} style={{ font: `700 21px ${FONT}` }}>NORTH KOREA</text>
        <text x={400} y={86} textAnchor="middle" fill={MUTED} style={{ font: `italic 500 22px ${FONT}` }}>Kaesong view</text>

        {/* DMZ 완충 지대(군사분계선 남북 2 km씩) */}
        <defs>
          <pattern id="rd-hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="12" height="12" fill="#F7E7E9" />
            <line x1="0" y1="0" x2="0" y2="12" stroke="#EBC5CB" strokeWidth="4" />
          </pattern>
        </defs>
        <rect x={0} y={112} width={800} height={84} fill="url(#rd-hatch)" />
        <line x1={0} y1={154} x2={800} y2={154} stroke={RED} strokeWidth={3} strokeDasharray="14 8" />
        <rect x={16} y={160} width={232} height={32} rx={6} fill="#fff" opacity={0.92} />
        <text x={28} y={184} fill={RED} letterSpacing={1} style={{ font: `700 21px ${FONT}` }}>DMZ · 4 km wide</text>
        <rect x={476} y={117} width={312} height={32} rx={6} fill="#fff" opacity={0.92} />
        <text x={776} y={141} textAnchor="end" fill={RED} style={{ font: `700 21px ${FONT}` }}>Military Demarcation Line</text>

        {/* 민간인통제구역 · 민간인통제선 */}
        <rect x={0} y={196} width={800} height={124} fill="#F4F2EE" />
        <line x1={0} y1={320} x2={800} y2={320} stroke={INK} strokeWidth={2.5} strokeDasharray="8 7" />
        <text x={20} y={308} fill={MUTED} letterSpacing={2} style={{ font: `700 19px ${FONT}` }}>CIVILIAN CONTROL LINE</text>
        <rect x={392} y={312} width={16} height={16} fill={INK} />

        {/* 임진강 */}
        <path d="M0,350 C120,334 220,366 340,350 S560,334 800,352" fill="none" stroke="#C9D7DE" strokeWidth={14} strokeLinecap="round" />
        <Geo x={24} y={388} text="Imjin River" anchor="start" italic size={22} />

        {/* 땅굴(북에서 남으로 판 굴) · 도라전망대 시선 */}
        <path d="M498,156 L498,232" fill="none" stroke={MUTED} strokeWidth={3} strokeDasharray="4 6" />
        <path d="M300,198 L300,104" fill="none" stroke={MUTED} strokeWidth={2.5} strokeDasharray="2 8" />
        <path d="M290,112 L300,96 L310,112" fill="none" stroke={MUTED} strokeWidth={2.5} />

        {/* 경로: 서울 → 임진각 → 검문소 → 땅굴 · 전망대 */}
        <Route d="M400,522 L400,384" />
        <Route d="M400,384 L400,320 Q400,262 476,250" faint />
        <Route d="M400,320 Q400,240 322,222" faint />
        <Pill x={400} y={458} w={184} text="~1 hr · 50 km" />

        <Start x={400} y={522} />
        <Pin x={400} y={384} n={1} />
        <Pin x={498} y={250} n={2} />
        <Pin x={300} y={216} n={3} />

        <Label x={428} y={530} anchor="start" name="Central Seoul" details={['Myeongdong / Hongdae pickup']} />
        <Label x={428} y={392} anchor="start" name="Imjingak" details={['& Freedom Bridge']} />
        <Label x={526} y={258} anchor="start" name="3rd Tunnel" details={['Infiltration tunnel']} />
        <Label x={272} y={224} anchor="end" name="Dora Observatory" details={['Looks toward Kaesong']} />
      </>
    ),
  },
}

export function RouteDiagram({ id }: { id: string }) {
  const d = DIAGRAMS[id]
  if (!d) return null
  return (
    <figure className="route-dg not-prose">
      <style>{CSS}</style>
      <div className="rd-canvas">
        <svg viewBox={d.viewBox} role="img" aria-label={d.aria}>{d.svg}</svg>
      </div>
      <figcaption>
        <ol className="rd-legend">
          {d.legend.map(l => (
            <li key={l.title}>
              <span className={`rd-dot${l.mark === 'start' ? ' rd-dot--start' : ''}`}>{l.mark === 'start' ? '' : l.mark}</span>
              <span><b>{l.title}</b><span>{l.detail}</span></span>
            </li>
          ))}
        </ol>
        <p className="rd-credit">{d.credit}</p>
      </figcaption>
    </figure>
  )
}
