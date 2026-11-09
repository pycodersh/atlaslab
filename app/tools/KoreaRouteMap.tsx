'use client'

import { CITIES, type City, type CityId } from '@/data/transitRoutes'

const cityOf = (id: CityId) => CITIES.find(c => c.id === id) as City
export const shortCity = (city: City) => city.name.split(' / ')[0]

// 지도는 위경도를 그대로 평면에 옮긴 약도다
const project = (lon: number, lat: number) => [Math.round((lon - 125.7) * 56) + 14, Math.round((38.8 - lat) * 66) + 4] as const
const COAST = [
  [126.35, 37.85], [126.55, 37.45], [126.75, 37.0], [126.35, 36.75], [126.5, 36.4], [126.75, 35.95], [126.45, 35.55], [126.4, 35.0],
  [126.25, 34.6], [126.55, 34.3], [127.0, 34.55], [127.5, 34.7], [128.1, 34.85], [128.6, 34.85], [129.05, 35.05], [129.35, 35.4],
  [129.5, 36.0], [129.4, 36.5], [129.4, 37.0], [129.1, 37.55], [128.7, 38.0], [128.35, 38.6], [127.4, 38.35], [126.7, 38.0],
].map(([lon, lat]) => project(lon, lat).join(',')).join(' ')
const [JEJU_X, JEJU_Y] = project(126.55, 33.38)

/** 한반도 거점 약도 — Transit Guide 와 Hotspot Finder 가 함께 쓴다. from 에서 to 로 점선을 잇고 두 핀을 강조한다 */
export function KoreaRouteMap({ from, to, onPick, className = '' }: { from: CityId; to: CityId; onPick: (id: CityId) => void; className?: string }) {
  const [fx, fy] = project(cityOf(from).lon, cityOf(from).lat)
  const [tx, ty] = project(cityOf(to).lon, cityOf(to).lat)
  return (
    <>
      <style>{`
        .km-map { display: block; width: 100%; max-width: 300px; height: auto; }
        .km-route-line { animation: km-dash 1s linear infinite; }
        @keyframes km-dash { to { stroke-dashoffset: -9; } }
        @media (prefers-reduced-motion: reduce) { .km-route-line { animation: none; } }
        .km-pin { cursor: pointer; outline: none; }
        .km-pin .km-dot { fill: #D1D5DB; stroke: #fff; stroke-width: 1.5; transition: fill .15s; }
        .km-pin text { font: 500 11px "DM Sans", Inter, system-ui, sans-serif; fill: #6B7280; }
        .km-pin.is-from .km-dot { fill: #111827; stroke-width: 2; }
        .km-pin.is-to .km-dot { fill: #C8102E; stroke-width: 2; }
        .km-pin.is-from text { font-weight: 700; fill: #111827; }
        .km-pin.is-to text { font-weight: 700; fill: #C8102E; }
        .km-pin:focus-visible .km-dot { stroke: #C8102E; stroke-width: 3; }
        @media (hover: hover) { .km-pin:not(.is-from):not(.is-to):hover .km-dot { fill: #6B7280; } }
      `}</style>
      <svg className={`km-map notranslate ${className}`} viewBox="0 0 290 372" role="group" aria-label={`Map of Korea showing the route from ${shortCity(cityOf(from))} to ${shortCity(cityOf(to))}. Not to scale.`}>
        <polygon points={COAST} fill="#F3F1EC" stroke="#D6D3CC" strokeWidth="1.5" strokeLinejoin="round" />
        <ellipse cx={JEJU_X} cy={JEJU_Y} rx="20" ry="10" fill="#F3F1EC" stroke="#D6D3CC" strokeWidth="1.5" />
        <line className="km-route-line" x1={fx} y1={fy} x2={tx} y2={ty} stroke="#C8102E" strokeWidth="2.5" strokeDasharray="2 7" strokeLinecap="round" />
        {CITIES.map(city => {
          const [x, y] = project(city.lon, city.lat)
          const isFrom = city.id === from
          const isTo = city.id === to
          const left = city.label === 'left'
          return (
            <g key={city.id} className={`km-pin${isFrom ? ' is-from' : ''}${isTo ? ' is-to' : ''}`} role="button" tabIndex={isFrom || isTo ? -1 : 0}
              aria-label={`Go to ${shortCity(city)}`} onClick={() => onPick(city.id)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(city.id) } }}>
              <circle cx={x} cy={y} r="15" fill="transparent" />
              <circle className="km-dot" cx={x} cy={y} r={isFrom || isTo ? 7 : 4} />
              <text x={left ? x - 9 : x + 9} y={y + 4} textAnchor={left ? 'end' : 'start'}>{shortCity(city)}</text>
            </g>
          )
        })}
      </svg>
    </>
  )
}
