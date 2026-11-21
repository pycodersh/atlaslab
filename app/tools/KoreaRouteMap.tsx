'use client'

import { CITIES, type City, type CityId } from '@/data/transitRoutes'
import { KoreaPenSvg, penXY } from '@/components/maps/KoreaPenSvg'

const cityOf = (id: CityId) => CITIES.find(c => c.id === id) as City
export const shortCity = (city: City) => city.name.split(' / ')[0]

/**
 * 한반도 거점 지도 — Intercity Transit 이 쓴다. 그림은 Korea Weather · Hotspot Finder 와 같은 펜화 지도(components/maps/KoreaPenSvg).
 * 도시는 실제 위경도 자리의 점 + 도시명(흰 후광)만. from 이 있으면 경로 지도(점선 + 출발 검정 · 도착 빨강), 없으면 to 핀 하나만 펄스로 강조한다.
 * 다른 도시를 누르면 onPick — 도착지를 바꾼다.
 */
export function KoreaRouteMap({ from, to, onPick, className = '' }: { from?: CityId; to: CityId; onPick: (id: CityId) => void; className?: string }) {
  const start = from ? penXY(cityOf(from).lon, cityOf(from).lat) : null
  const [tx, ty] = penXY(cityOf(to).lon, cityOf(to).lat)
  const label = from ? `showing the route from ${shortCity(cityOf(from))} to ${shortCity(cityOf(to))}` : `with ${shortCity(cityOf(to))} highlighted`
  // 고른 두 도시를 맨 마지막에 그려 다른 이름 위로 올라오게 한다
  const order = [...CITIES].sort((a, b) => Number(a.id === from || a.id === to) - Number(b.id === from || b.id === to))
  return (
    <div className={`km-map ${className}`}>
      <style>{`
        .km-map { width: 100%; max-width: 340px; }
        .km-route-line { animation: km-dash 1s linear infinite; }
        @keyframes km-dash { to { stroke-dashoffset: -9; } }
        .km-ping { fill: #C8102E; pointer-events: none; transform-box: fill-box; transform-origin: center; animation: km-ping 1.6s cubic-bezier(0,0,.2,1) infinite; }
        @keyframes km-ping { from { transform: scale(1); opacity: .55; } to { transform: scale(2.8); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .km-route-line { animation: none; } .km-ping { animation: none; transform: scale(1.8); opacity: .25; } }
        .km-pin { cursor: pointer; outline: none; }
        .km-pin .km-dot { fill: #6B7280; stroke: #fff; stroke-width: 1.5; transition: fill .15s; }
        .km-pin text { font: 600 12px "DM Sans", Inter, system-ui, sans-serif; fill: #374151; paint-order: stroke; stroke: #fff; stroke-width: 3px; stroke-linejoin: round; }
        .km-pin.is-from .km-dot { fill: #111827; stroke-width: 2; }
        .km-pin.is-to .km-dot { fill: #C8102E; stroke-width: 2; }
        .km-pin.is-from text { font-weight: 800; fill: #111827; }
        .km-pin.is-to text { font-weight: 800; fill: #C8102E; }
        .km-pin:focus-visible .km-dot { stroke: #C8102E; stroke-width: 3; }
        @media (hover: hover) { .km-pin:not(.is-from):not(.is-to):hover .km-dot { fill: #C8102E; } .km-pin:not(.is-from):not(.is-to):hover text { fill: #C8102E; } }
      `}</style>
      <KoreaPenSvg ariaLabel={`Map of South Korea ${label}`}>
        {start && <line className="km-route-line" x1={start[0]} y1={start[1]} x2={tx} y2={ty} stroke="#C8102E" strokeWidth="2.5" strokeDasharray="2 7" strokeLinecap="round" />}
        {order.map(city => {
          const [x, y] = penXY(city.lon, city.lat)
          const isFrom = city.id === from
          const isTo = city.id === to
          const left = city.label === 'left'
          return (
            <g key={city.id} className={`km-pin${isFrom ? ' is-from' : ''}${isTo ? ' is-to' : ''}`} role="button" tabIndex={isFrom || isTo ? -1 : 0}
              aria-label={`Go to ${shortCity(city)}`} onClick={() => onPick(city.id)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(city.id) } }}>
              <circle cx={x} cy={y} r="13" fill="transparent" />
              {isTo && !from && <circle className="km-ping" cx={x} cy={y} r="6" />}
              <circle className="km-dot" cx={x} cy={y} r={isFrom || isTo ? 6 : 3.5} />
              <text x={left ? x - 9 : x + 9} y={y + 4} textAnchor={left ? 'end' : 'start'}>{shortCity(city)}</text>
            </g>
          )
        })}
      </KoreaPenSvg>
    </div>
  )
}
