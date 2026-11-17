'use client'

/**
 * Hotspot Finder 서울 지도 — 서울 25개 구의 실제 바깥 테두리 · 구 경계 · 한강, 그리고 여섯 권역.
 * 권역 = 그 권역 명소가 든 구(OSM 행정 경계). scripts/make-penmap.mts 가 lib/maps/seoul-areas.generated.json 으로 굽는다.
 * 고른 권역만 #9E2B25 12% 채움 + 같은 색 테두리. 권역(면 · 이름)을 눌러 고른다.
 * 색은 Explore Korea 지도와 같다: 바다/바탕 흰색, 땅 #F3F4F6, 선 #374151, 강 #CBD5E1.
 */
import data from '@/lib/maps/seoul-areas.generated.json'
import type { SeoulClusterId } from '@/data/regionalHotspots'

type Area = { d: string; gu: string[]; label: [number, number] }
const AREAS = data.areas as unknown as Record<string, Area>
const B = data.box
const PAD = B.w * 0.03
const VB = `${B.x - PAD} ${B.y - PAD} ${B.w + PAD * 2} ${B.h + PAD * 2}`
const FS = B.w / 30 // 이름표 글자 — 지도 폭의 1/30

const CSS = `
.sa-map { display: block; width: 100%; height: auto; background: #fff; }
.sa-map * { vector-effect: non-scaling-stroke; }
.sa-land { fill: #F3F4F6; stroke: #374151; stroke-width: 1.2; stroke-linejoin: round; }
.sa-gu { fill: none; stroke: #D1D5DB; stroke-width: .7; }
.sa-river { fill: #CBD5E1; stroke: none; }
.sa-area { cursor: pointer; outline: none; }
.sa-area path { fill: transparent; stroke: none; transition: fill .15s; }
.sa-area.is-on path { fill: rgba(158,43,37,.12); stroke: #9E2B25; stroke-width: 1.6; stroke-linejoin: round; }
@media (hover: hover) { .sa-area:not(.is-on):hover path { fill: rgba(55,65,81,.06); } }
.sa-area:focus-visible path { stroke: #9E2B25; stroke-width: 2; stroke-dasharray: 4 3; }
.sa-area text { font-family: "DM Sans", Inter, system-ui, sans-serif; font-weight: 700; letter-spacing: .06em; fill: #4B5563;
  paint-order: stroke; stroke: #fff; stroke-width: 3px; stroke-linejoin: round; pointer-events: none; }
.sa-area.is-on text { fill: #9E2B25; }
`

export function SeoulAreaMap({ selected, onSelect, names }: {
  selected: SeoulClusterId
  onSelect: (id: SeoulClusterId) => void
  /** 권역 id → 짧은 영문 이름 */
  names: Record<string, string>
}) {
  // 고른 권역을 맨 위에 그려 테두리가 이웃 권역에 가리지 않게
  const order = Object.keys(AREAS).sort((a, b) => Number(a === selected) - Number(b === selected))
  return (
    <>
      <style>{CSS}</style>
      <svg className="sa-map notranslate" viewBox={VB} role="group" aria-label="Map of Seoul's six walking areas around the Han River">
        <defs><clipPath id="sa-clip"><path d={data.outline} /></clipPath></defs>
        <path className="sa-land" d={data.outline} />
        <path className="sa-river" d={data.river} clipPath="url(#sa-clip)" />
        <path className="sa-gu" d={data.gu} />
        {order.map(id => {
          const a = AREAS[id], on = id === selected
          return (
            <g key={id} className={`sa-area${on ? ' is-on' : ''}`} role="button" tabIndex={0} aria-pressed={on} aria-label={`Show ${names[id] ?? id}`}
              onClick={() => onSelect(id as SeoulClusterId)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(id as SeoulClusterId) } }}>
              <path d={a.d} />
              <text x={a.label[0]} y={a.label[1]} fontSize={FS} textAnchor="middle" dominantBaseline="middle">{(names[id] ?? id).toUpperCase()}</text>
            </g>
          )
        })}
      </svg>
    </>
  )
}
