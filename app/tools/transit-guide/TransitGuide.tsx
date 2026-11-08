'use client'

import { useState } from 'react'
import { CITIES, FROM_HUBS, HUBS, TO_CITIES, findRoute, type City, type CityId, type TransitMode, type TransitRoute } from '@/data/transitRoutes'

const cityOf = (id: CityId) => CITIES.find(c => c.id === id) as City
const isHub = (id: CityId) => FROM_HUBS.includes(id)
const short = (city: City) => city.name.split(' / ')[0]

// 지도는 위경도를 그대로 평면에 옮긴 약도다
const project = (lon: number, lat: number) => [Math.round((lon - 125.7) * 56) + 14, Math.round((38.8 - lat) * 66) + 4] as const
const COAST = [
  [126.35, 37.85], [126.55, 37.45], [126.75, 37.0], [126.35, 36.75], [126.5, 36.4], [126.75, 35.95], [126.45, 35.55], [126.4, 35.0],
  [126.25, 34.6], [126.55, 34.3], [127.0, 34.55], [127.5, 34.7], [128.1, 34.85], [128.6, 34.85], [129.05, 35.05], [129.35, 35.4],
  [129.5, 36.0], [129.4, 36.5], [129.4, 37.0], [129.1, 37.55], [128.7, 38.0], [128.35, 38.6], [127.4, 38.35], [126.7, 38.0],
].map(([lon, lat]) => project(lon, lat).join(',')).join(' ')
const [JEJU_X, JEJU_Y] = project(126.55, 33.38)

function RouteMap({ from, to, onPick }: { from: CityId; to: CityId; onPick: (id: CityId) => void }) {
  const [fx, fy] = project(cityOf(from).lon, cityOf(from).lat)
  const [tx, ty] = project(cityOf(to).lon, cityOf(to).lat)
  return (
    <svg className="tg-map notranslate" viewBox="0 0 290 372" role="group" aria-label={`Map of Korea showing the route from ${short(cityOf(from))} to ${short(cityOf(to))}. Not to scale.`}>
      <polygon points={COAST} fill="#F3F1EC" stroke="#D6D3CC" strokeWidth="1.5" strokeLinejoin="round" />
      <ellipse cx={JEJU_X} cy={JEJU_Y} rx="20" ry="10" fill="#F3F1EC" stroke="#D6D3CC" strokeWidth="1.5" />
      <line className="tg-route-line" x1={fx} y1={fy} x2={tx} y2={ty} stroke="#C8102E" strokeWidth="2.5" strokeDasharray="2 7" strokeLinecap="round" />
      {CITIES.map(city => {
        const [x, y] = project(city.lon, city.lat)
        const isFrom = city.id === from
        const isTo = city.id === to
        const left = city.label === 'left'
        return (
          <g key={city.id} className={`tg-pin${isFrom ? ' is-from' : ''}${isTo ? ' is-to' : ''}`} role="button" tabIndex={isFrom || isTo ? -1 : 0}
            aria-label={`Go to ${short(city)}`} onClick={() => onPick(city.id)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(city.id) } }}>
            <circle cx={x} cy={y} r="15" fill="transparent" />
            <circle className="tg-dot" cx={x} cy={y} r={isFrom || isTo ? 7 : 4} />
            <text x={left ? x - 9 : x + 9} y={y + 4} textAnchor={left ? 'end' : 'start'}>{short(city)}</text>
          </g>
        )
      })}
    </svg>
  )
}

/** 방향에 맞춰 허브를 뒤집어 읽는다 — 팁은 언제나 내리는 허브의 것이다 */
function ModeCard({ mode, reversed, verdict }: { mode: TransitMode; reversed: boolean; verdict: string }) {
  const departure = HUBS[mode.hubs[reversed ? 1 : 0]]
  const arrival = HUBS[mode.hubs[reversed ? 0 : 1]]
  return (
    <article className={`tg-mode${verdict === 'Best Choice' ? ' is-best' : ''}`}>
      <p className="tg-verdict">{verdict || ' '}</p>
      <h3 className="tg-mode-name">{mode.name}</h3>
      <dl className="tg-facts">
        <div><dt>Duration</dt><dd>{mode.duration}{mode.via && <span className="tg-via">{mode.via}</span>}</dd></div>
        <div><dt>Estimated Fare</dt><dd className="tg-fare notranslate" translate="no">{mode.fare}</dd></div>
        <div><dt>Departure Hub</dt><dd>{departure.name}</dd></div>
        <div><dt>Arrival Hub &amp; City Connection Tip</dt><dd><strong>{arrival.name}</strong><span className="tg-tip">{arrival.tip}</span></dd></div>
      </dl>
    </article>
  )
}

function verdictFor(mode: TransitMode, route: TransitRoute, toJeju: boolean) {
  if (route.modes.length === 1) return toJeju ? 'Best Choice' : mode.via ? 'With a change' : 'Direct option'
  const fastest = Math.min(...route.modes.map(m => m.minutes))
  const cheapest = Math.min(...route.modes.map(m => m.minFare))
  return [mode.minutes === fastest && 'Fastest', mode.minFare === cheapest && 'Cheapest'].filter(Boolean).join(' · ')
}

function flightBanner(route: TransitRoute) {
  if (route.flightNote) return route.flightNote
  if (route.modes.some(m => m.highSpeed)) return 'No direct flights available for this route. High-speed rail is the fastest choice.'
  return 'No direct flights available for this route.'
}

export function TransitGuide() {
  const [from, setFrom] = useState<CityId>('seoul')
  const [to, setTo] = useState<CityId>('busan')
  const route = findRoute(from, to)

  const fromOptions = isHub(from) ? FROM_HUBS : [...FROM_HUBS, from]
  // 노선은 3대 거점 중 한 곳을 끼어야 있다. 스왑으로 출발지가 지방 도시가 되면 도착지는 거점만 고른다
  const toOptions = (isHub(from) ? [...(from === 'seoul' ? [] : ['seoul' as CityId]), ...TO_CITIES] : FROM_HUBS).filter(id => id !== from)

  const chooseFrom = (next: CityId) => {
    setFrom(next)
    if (next === to) setTo(next === 'busan' ? 'daegu' : 'busan')
  }
  const swap = () => { setFrom(to); setTo(from) }
  const pickOnMap = (id: CityId) => {
    if (id === from || id === to) return
    // 지도에서는 언제나 도착지를 고른다. 지방 → 지방 노선은 없으므로 그때는 출발지를 서울로 되돌린다
    if (!isHub(from) && !isHub(id)) setFrom('seoul')
    setTo(id)
  }

  const reversed = route ? route.a !== from : false
  const toJeju = to === 'jeju' || from === 'jeju'
  const hasFlight = route?.modes.some(m => m.kind === 'flight') ?? false

  return (
    <>
      <style>{`
        .tl-wrap.tg-wrap { max-width: 960px; }
        .tg-bar { display: grid; grid-template-columns: minmax(0, 1fr) 44px minmax(0, 1fr); gap: 8px; align-items: end; margin-bottom: 20px; }
        .tg-field label { display: block; font-size: 13px; font-weight: 600; color: #4B5563; margin-bottom: 6px; }
        .tg-field select { width: 100%; min-height: 52px; padding: 10px 8px 10px 12px; box-sizing: border-box; border: 1px solid #D1D5DB; border-radius: 12px; background-color: #fff; color: #111827; font: 700 16px "DM Sans", Inter, system-ui, sans-serif; text-overflow: ellipsis; }
        .tg-swap { width: 44px; height: 52px; border: 1px solid #111827; border-radius: 12px; background: #111827; color: #fff; font-size: 20px; cursor: pointer; }
        .tg-field select:focus-visible, .tg-swap:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }

        .tg-overview { display: flex; flex-direction: column; align-items: center; gap: 8px; background: #fff; border: 1px solid #F3F4F6; border-radius: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.05); padding: 16px 20px 20px; margin-bottom: 20px; }
        .tg-map { display: block; width: 100%; max-width: 300px; height: auto; }
        .tg-route-line { animation: tg-dash 1s linear infinite; }
        @keyframes tg-dash { to { stroke-dashoffset: -9; } }
        @media (prefers-reduced-motion: reduce) { .tg-route-line { animation: none; } }
        .tg-pin { cursor: pointer; outline: none; }
        .tg-pin .tg-dot { fill: #D1D5DB; stroke: #fff; stroke-width: 1.5; transition: fill .15s; }
        .tg-pin text { font: 500 11px "DM Sans", Inter, system-ui, sans-serif; fill: #6B7280; }
        .tg-pin.is-from .tg-dot { fill: #111827; stroke-width: 2; }
        .tg-pin.is-to .tg-dot { fill: #C8102E; stroke-width: 2; }
        .tg-pin.is-from text { font-weight: 700; fill: #111827; }
        .tg-pin.is-to text { font-weight: 700; fill: #C8102E; }
        .tg-pin:focus-visible .tg-dot { stroke: #C8102E; stroke-width: 3; }
        @media (hover: hover) { .tg-pin:not(.is-from):not(.is-to):hover .tg-dot { fill: #6B7280; } }
        .tg-summary { text-align: center; }
        .tg-route { font-family: "Playfair Display", Georgia, serif; font-size: 24px; font-weight: 700; line-height: 1.2; color: #111827; margin: 0 0 4px; }
        .tg-hint { font-size: 13px; color: #6B7280; margin: 0; }

        .tg-modes { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin-bottom: 12px; }
        .tg-modes.is-1 { max-width: 460px; margin-left: auto; margin-right: auto; }
        .tg-mode { background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 20px; }
        .tg-mode.is-best { border-color: #C8102E; box-shadow: 0 0 0 1px #C8102E; }
        .tg-verdict { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #C8102E; margin: 0 0 4px; }
        .tg-mode-name { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 14px; }
        .tg-facts { margin: 0; }
        .tg-facts > div { padding: 10px 0; border-top: 1px solid #F3F4F6; }
        .tg-facts > div:last-child { padding-bottom: 0; }
        .tg-facts dt { font-size: 12px; color: #6B7280; margin-bottom: 2px; }
        .tg-facts dd { margin: 0; font-size: 14px; line-height: 1.5; color: #111827; }
        .tg-facts .tg-fare { font-size: 16px; font-weight: 700; }
        .tg-facts strong { display: block; font-weight: 600; }
        .tg-tip { display: block; color: #4B5563; margin-top: 4px; }
        .tg-via { display: block; color: #B45309; font-weight: 600; }
        .tg-banner { font-size: 13px; line-height: 1.5; color: #374151; background: #F3F4F6; border-radius: 10px; padding: 10px 14px; margin: 0 0 12px; }
        .tg-tipbox { font-size: 14px; line-height: 1.6; color: #1F2937; background: rgba(255,251,235,.6); border: 1px solid #FDE68A; border-radius: 12px; padding: 12px 16px; margin: 0 0 12px; }
        .tg-note { margin-top: 12px; }

        @media (min-width: 640px) {
          .tg-bar { grid-template-columns: minmax(0, 1fr) 52px minmax(0, 1fr); }
          .tg-swap { width: 52px; }
          .tg-overview { flex-direction: row; justify-content: center; gap: 40px; padding: 20px 28px; }
          .tg-map { width: 300px; flex: 0 0 auto; }
          .tg-summary { text-align: left; }
          .tg-route { font-size: 30px; }
          .tg-modes.is-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (min-width: 768px) { .tg-modes.is-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
      `}</style>

      <div className="tg-bar">
        <div className="tg-field">
          <label htmlFor="tg-from">From</label>
          <select id="tg-from" className="notranslate" translate="no" value={from} onChange={e => chooseFrom(e.target.value as CityId)}>
            {fromOptions.map(id => <option key={id} value={id}>{cityOf(id).name}</option>)}
          </select>
        </div>
        <button type="button" className="tg-swap" aria-label="Swap From and To" onClick={swap}>⇄</button>
        <div className="tg-field">
          <label htmlFor="tg-to">To</label>
          <select id="tg-to" className="notranslate" translate="no" value={to} onChange={e => setTo(e.target.value as CityId)}>
            {toOptions.map(id => <option key={id} value={id}>{cityOf(id).name}</option>)}
          </select>
        </div>
      </div>

      <section className="tg-overview">
        <RouteMap from={from} to={to} onPick={pickOnMap} />
        <div className="tg-summary">
          <h2 key={`${from}-${to}`} className="tg-route notranslate" translate="no">{short(cityOf(from))} → {short(cityOf(to))}</h2>
          <p className="tg-hint">Tap a city on the map to set your destination.</p>
        </div>
      </section>

      {/* key: 자동 번역이 글자 노드를 바꿔 끼우므로 경로가 바뀌면 통째로 새로 그린다 */}
      {route && (
        <div key={`${from}-${to}`}>
          <div className={`tg-modes is-${route.modes.length}`}>
            {route.modes.map(mode => <ModeCard key={mode.name} mode={mode} reversed={reversed} verdict={verdictFor(mode, route, toJeju)} />)}
          </div>
          {!hasFlight && <p className="tg-banner">✈️ Flights: {flightBanner(route)}</p>}
          {route.note && <p className="tg-tipbox">{route.note}</p>}
        </div>
      )}

      <p className="tl-note tg-note">
        Fares are approximate one-way fares and durations are typical, checked November 8, 2026. Some ranges include higher seat classes. KTX and SRT merged in September 2026 and fares are
        still settling, so confirm on{' '}
        <a href="https://www.korail.com" rel="noopener noreferrer" target="_blank">Korail</a> or the bus operator before booking. The return trip may differ slightly.
        Check a map app for current local bus numbers. The map is illustrative and not to scale. Sources:{' '}
        <a href="https://www.rome2rio.com" rel="noopener noreferrer" target="_blank">Rome2Rio</a>,{' '}
        <a href="https://welcome-busan.com/guide/transport/seoul-to-busan-ktx-guide/" rel="noopener noreferrer" target="_blank">Welcome Busan</a>,{' '}
        <a href="https://mileasia.com/korea/ktx-train-guide/" rel="noopener noreferrer" target="_blank">MileAsia KTX</a>,{' '}
        <a href="https://mileasia.com/korea/seoul-to-jeju/" rel="noopener noreferrer" target="_blank">MileAsia Jeju</a>,{' '}
        <a href="https://www.asiaodysseytravel.com/south-korea/seoul-to-jeonju.html" rel="noopener noreferrer" target="_blank">Asia Odyssey</a>.
      </p>
    </>
  )
}
