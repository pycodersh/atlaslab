'use client'

import { useEffect, useState } from 'react'
import { CITIES, HUBS, routeBetween, type City, type CityId, type TransitMode, type TransitRoute } from '@/data/transitRoutes'
import { Bus, ExternalLink, Plane, TrainFront, type LucideIcon } from 'lucide-react'
import { KoreaRouteMap, shortCity as short } from '../KoreaRouteMap'

const cityOf = (id: CityId) => CITIES.find(c => c.id === id) as City

const iata = (hubName: string) => hubName.match(/\(([A-Z]{3})\)/)?.[1].toLowerCase()

/** 교통수단별 공식 예매처. 시외버스는 고속버스 전용인 KOBUS 에 없어 T-money 로 보낸다 */
function bookingFor(mode: TransitMode, departure: string, arrival: string) {
  if (mode.kind === 'train') return { href: 'https://www.korail.com/global/eng/main', label: 'Book on Korail' }
  if (mode.kind === 'flight') {
    const [from, to] = [iata(departure), iata(arrival)]
    return { href: from && to ? `https://www.skyscanner.net/transport/flights/${from}/${to}/` : 'https://www.skyscanner.net/', label: 'Search Flights' }
  }
  if (mode.kind === 'bus') {
    return mode.name.startsWith('Intercity')
      ? { href: 'https://txbuse.t-money.co.kr/main.do', label: 'Book Bus (T-money)' }
      : { href: 'https://www.kobus.co.kr/', label: 'Book Bus (KOBUS)' }
  }
  return null
}

const MODE_ICON: Partial<Record<TransitMode['kind'], LucideIcon>> = { train: TrainFront, flight: Plane, bus: Bus }

/** 방향에 맞춰 허브를 뒤집어 읽는다 — 팁은 언제나 내리는 허브의 것이다 */
function ModeCard({ mode, reversed, verdict }: { mode: TransitMode; reversed: boolean; verdict: string }) {
  const departure = HUBS[mode.hubs[reversed ? 1 : 0]]
  const arrival = HUBS[mode.hubs[reversed ? 0 : 1]]
  const booking = bookingFor(mode, departure.name, arrival.name)
  const Icon = MODE_ICON[mode.kind]
  // 항공은 '비행시간; 공항 포함 시간' 으로 적혀 있다 — 둘째 줄은 보조 글자로 내린다
  const [duration, durationNote] = mode.duration.split('; ')
  return (
    <article className={`tg-mode${verdict === 'Best Choice' ? ' is-best' : ''}`}>
      <div className="tg-mode-head">
        <p className="tg-verdict">{verdict}</p>
        <h3 className="tg-mode-name">{Icon && <Icon size={20} aria-hidden="true" />}{mode.name}</h3>
      </div>
      <dl className="tg-stats">
        <div><dt>Duration</dt>
        <dd className="tg-duration">{duration}{durationNote && <span className="tg-note-line">{durationNote}</span>}{mode.via && <span className="tg-via">{mode.via}</span>}</dd></div>
        <div><dt className="tg-fare-label">Estimated Fare</dt>
        <dd className="tg-fare notranslate" translate="no">{mode.fare}</dd></div>
      </dl>
      <dl className="tg-hubs">
        <dt>Departure</dt>
        <dd className="tg-depart">{departure.name}</dd>
        <dt className="tg-arrive-label">Arrival &amp; Tips</dt>
        <dd><strong>{arrival.name}</strong><span className="tg-tip">{arrival.tip}</span></dd>
      </dl>
      {booking && <a className="tg-book" href={booking.href} target="_blank" rel="noopener noreferrer"><span className="notranslate" translate="no">{booking.label}</span><ExternalLink size={14} color="#64748B" aria-hidden="true" /></a>}
    </article>
  )
}

function verdictFor(mode: TransitMode, route: TransitRoute, toJeju: boolean) {
  if (mode.via && route.modes.length === 1) return 'With a change'
  if (route.modes.length === 1) return toJeju && mode.kind === 'flight' ? 'Best Choice' : 'Direct option'
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
  const found = routeBetween(from, to)
  const route = found?.route

  // Hotspot Finder 의 경로 버튼이 ?to=도시 로 도착지를 넘긴다
  useEffect(() => {
    const target = new URLSearchParams(location.search).get('to')
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 주소는 하이드레이션 뒤에만 읽을 수 있다
    if (target && target !== 'seoul' && CITIES.some(c => c.id === target)) setTo(target as CityId)
  }, [])

  const toOptions = CITIES.filter(c => c.id !== from)

  // From 과 To 가 같아지면 To 를 다른 도시로 옮긴다
  const chooseFrom = (next: CityId) => {
    setFrom(next)
    if (next === to) setTo(next === 'busan' ? 'seoul' : 'busan')
  }
  const swap = () => {
    if (from === to) return
    setFrom(to)
    setTo(from)
  }
  const pickOnMap = (id: CityId) => {
    if (id !== from && id !== to) setTo(id)
  }

  const reversed = found?.reversed ?? false
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
        .tg-summary { text-align: center; }
        .tg-route { font-family: "Playfair Display", Georgia, serif; font-size: 24px; font-weight: 700; line-height: 1.2; color: #111827; margin: 0 0 4px; }
        .tg-hint { font-size: 13px; color: #6B7280; margin: 0; }

        .tg-modes { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin-bottom: 12px; }
        .tg-modes.is-1 { max-width: 460px; margin-left: auto; margin-right: auto; }
        .tg-mode { display: flex; flex-direction: column; background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 20px; }
        .tg-mode.is-best { border-color: #C8102E; box-shadow: 0 0 0 1px #C8102E; }
        .tg-mode-head { margin-bottom: 14px; }
        .tg-verdict { min-height: 20px; font-size: 11px; font-weight: 700; line-height: 20px; letter-spacing: .1em; text-transform: uppercase; color: #C8102E; margin: 0 0 4px; }
        .tg-mode-name { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; color: #111827; margin: 0; }
        .tg-mode-name svg { flex: none; color: #1E293B; }
        .tg-stats, .tg-hubs { margin: 0; }
        .tg-stats dt, .tg-hubs dt { font-size: 11px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: #94A3B8; margin-bottom: 2px; }
        .tg-stats dd, .tg-hubs dd { margin: 0; }
        .tg-duration { font-size: 14px; font-weight: 700; line-height: 1.4; color: #1E293B; }
        .tg-note-line { display: block; font-size: 12px; font-weight: 400; color: #64748B; }
        .tg-via { display: block; color: #B45309; font-weight: 600; font-size: 12px; }
        .tg-stats .tg-fare-label { margin-top: 12px; }
        .tg-fare { font-size: 16px; font-weight: 800; line-height: 1.35; color: #2563EB; }
        .tg-hubs { margin: 16px 0; padding-top: 16px; border-top: 1px solid #F1F5F9; }
        .tg-hubs dt { margin-bottom: 4px; }
        .tg-hubs .tg-arrive-label { margin-top: 12px; }
        .tg-depart { font-size: 14px; font-weight: 500; line-height: 1.45; color: #1E293B; }
        .tg-hubs strong { display: block; font-size: 14px; font-weight: 700; line-height: 1.45; color: #0F172A; }
        .tg-tip { display: block; margin-top: 2px; font-size: 12px; line-height: 1.625; color: #64748B; }
        .tg-book { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; min-height: 44px; margin-top: auto; box-sizing: border-box; border: 1px solid #E2E8F0; border-radius: 12px; background: #fff; color: #1E293B; text-decoration: none; font: 600 12px "DM Sans", Inter, system-ui, sans-serif; transition: background .15s; }
        @media (hover: hover) { .tg-book:hover { background: #F8FAFC; } }
        .tg-book:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        /* 카드끼리 머리 · 수치 · 허브 · 버튼 줄을 같은 높이로 맞춘다 */
        @supports (grid-template-rows: subgrid) {
          @media (min-width: 640px) { .tg-modes.is-2 .tg-mode { display: grid; grid-row: span 5; grid-template-rows: subgrid; row-gap: 0; } .tg-modes.is-2 .tg-stats { display: grid; grid-row: span 2; grid-template-rows: subgrid; row-gap: 0; } }
          @media (min-width: 768px) { .tg-modes.is-3 .tg-mode { display: grid; grid-row: span 5; grid-template-rows: subgrid; row-gap: 0; } .tg-modes.is-3 .tg-stats { display: grid; grid-row: span 2; grid-template-rows: subgrid; row-gap: 0; } }
        }
        .tg-banner { font-size: 13px; line-height: 1.5; color: #374151; background: #F3F4F6; border-radius: 10px; padding: 10px 14px; margin: 0 0 12px; }
        .tg-tipbox { font-size: 14px; line-height: 1.6; color: #1F2937; background: rgba(255,251,235,.6); border: 1px solid #FDE68A; border-radius: 12px; padding: 12px 16px; margin: 0 0 12px; }
        .tg-note { margin-top: 12px; }

        @media (min-width: 640px) {
          .tg-bar { grid-template-columns: minmax(0, 1fr) 52px minmax(0, 1fr); }
          .tg-swap { width: 52px; }
          .tg-overview { flex-direction: row; justify-content: center; gap: 40px; padding: 20px 28px; }
          .km-map { width: 300px; flex: 0 0 auto; }
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
            {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button type="button" className="tg-swap" aria-label="Swap From and To" onClick={swap}>⇄</button>
        <div className="tg-field">
          <label htmlFor="tg-to">To</label>
          <select id="tg-to" className="notranslate" translate="no" value={to} onChange={e => setTo(e.target.value as CityId)}>
            {toOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <section className="tg-overview">
        <KoreaRouteMap from={from} to={to} onPick={pickOnMap} />
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
          {!hasFlight && !found?.transfer && <p className="tg-banner">✈️ Flights: {flightBanner(route)}</p>}
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
