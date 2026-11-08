'use client'

import { useState } from 'react'

/**
 * 서울 출발 도시 간 교통 비교. 요금 · 시간은 2026-11-08 에 확인한 공개 자료의 대략값이다(화면 아래 출처).
 * 김포 직항이 확인되지 않는 구간은 값을 지어내지 않고 flight 를 unavailable 로 둔다.
 * 2026-09-01 KTX · SRT 통합 뒤 요금이 정리 중이라 값을 고칠 때는 Korail 에서 다시 확인한다.
 */
type Mode = {
  name: string
  verdict?: 'Fastest' | 'Cheapest' | 'Best Choice'
  duration: string
  fare: string
  departure: string
  arrival: string
  tip: string
}
type Destination = {
  id: string
  name: string
  lon: number
  lat: number
  train?: Mode
  flight?: Mode
  bus?: Mode
  noFlight?: string
  ferry?: string
}

const TRAIN = 'Train (KTX/SRT)'
const FLIGHT = 'Flight'
const BUS = 'Express Bus'
const SEOUL = { lon: 126.98, lat: 37.57 }

const DESTINATIONS: Destination[] = [
  {
    id: 'busan', name: 'Busan', lon: 129.08, lat: 35.18,
    train: {
      name: TRAIN, verdict: 'Fastest', duration: '2h 15m – 3h', fare: 'About ₩54,400',
      departure: 'Seoul Station or Suseo Station',
      arrival: 'Busan Station (Metro Line 1)',
      tip: 'For Haeundae or Gwangalli, change to Line 2 at Seomyeon. Allow 45–60 minutes.',
    },
    flight: {
      name: FLIGHT, duration: 'About 1h 10m in the air; 2h 45m with airport time', fare: 'About ₩50,000 – 125,000',
      departure: 'Gimpo Airport (GMP)',
      arrival: 'Gimhae Airport (PUS)',
      tip: 'Gimhae is farther from central Busan than Busan Station. The bus to Haeundae takes about 1h 40m.',
    },
    bus: {
      name: BUS, verdict: 'Cheapest', duration: '4h – 4h 40m', fare: 'About ₩23,000 – 44,000',
      departure: 'Seoul Express Bus Terminal',
      arrival: 'Busan Central Bus Terminal',
      tip: 'The terminal is on the north edge of the city. Take Metro Line 1 into town.',
    },
  },
  {
    id: 'daegu', name: 'Daegu', lon: 128.6, lat: 35.87,
    train: {
      name: TRAIN, verdict: 'Fastest', duration: 'About 1h 40m', fare: 'About ₩43,500',
      departure: 'Seoul Station or Suseo Station',
      arrival: 'Dongdaegu Station (Metro Line 1)',
      tip: 'Ride Line 1 toward Banwoldang for the Dongseongno shopping area.',
    },
    noFlight: 'We could not confirm a regular direct flight from Gimpo. The train is the practical choice.',
    bus: {
      name: BUS, verdict: 'Cheapest', duration: 'About 3h 45m', fare: 'About ₩22,100 – 42,500',
      departure: 'Seoul Express Bus Terminal',
      arrival: 'Dongdaegu Terminal',
      tip: 'The terminal is at Dongdaegu Station, so you can walk straight to Metro Line 1.',
    },
  },
  {
    id: 'gangneung', name: 'Gangneung', lon: 128.9, lat: 37.75,
    train: {
      name: TRAIN, verdict: 'Fastest', duration: '1h 50m – 2h', fare: 'About ₩27,600',
      departure: 'Seoul Station or Cheongnyangni Station',
      arrival: 'Gangneung Station',
      tip: 'Anmok Beach and Coffee Street are about 15 minutes by taxi, around ₩7,000 – 9,000. Local buses run less often.',
    },
    noFlight: 'We could not confirm a direct flight from Gimpo to this part of the east coast.',
    bus: {
      name: BUS, verdict: 'Cheapest', duration: '2h 30m – 2h 50m', fare: 'About ₩24,300 – 33,100',
      departure: 'Dong Seoul Terminal or Seoul Express Bus Terminal',
      arrival: 'Gangneung Express Bus Terminal',
      tip: 'Dong Seoul is the quicker departure point. Check a map app for the local bus to the coast.',
    },
  },
  {
    id: 'jeonju', name: 'Jeonju', lon: 127.15, lat: 35.82,
    train: {
      name: TRAIN, verdict: 'Fastest', duration: '1h 26m – 1h 53m', fare: 'About ₩31,300 – 34,600',
      departure: 'Yongsan Station (most trains) or Seoul Station',
      arrival: 'Jeonju Station',
      tip: 'Hanok Village is 10–15 minutes by taxi, around ₩6,000 – 8,000, or 20–25 minutes by city bus.',
    },
    noFlight: 'Jeonju has no airport with flights from Seoul. Take the train or bus.',
    bus: {
      name: BUS, verdict: 'Cheapest', duration: '2h 40m – 3h 30m', fare: 'About ₩14,300 – 27,100',
      departure: 'Central City Terminal (Honam Line side)',
      arrival: 'Jeonju Express Bus Terminal',
      tip: 'Friday evenings, Sunday returns and holidays can take up to about 4 hours.',
    },
  },
  {
    id: 'jeju', name: 'Jeju', lon: 126.53, lat: 33.5,
    flight: {
      name: FLIGHT, verdict: 'Best Choice', duration: 'About 55m – 1h 10m in the air', fare: 'About ₩30,000 – 80,000',
      departure: 'Gimpo Airport (GMP)',
      arrival: 'Jeju International Airport (CJU), Jeju City',
      tip: 'Book 3–6 weeks ahead for the lowest fares. A rental car helps, because buses are slow and infrequent outside the main towns.',
    },
    ferry: 'No ferry runs directly from Seoul. Going overland to Mokpo or Wando and then sailing takes about 7–9 hours door to door, so we don’t recommend it.',
  },
  {
    id: 'gyeongju', name: 'Gyeongju', lon: 129.22, lat: 35.84,
    train: {
      name: TRAIN, verdict: 'Fastest', duration: '2h – 2h 45m', fare: 'About ₩48,500',
      departure: 'Seoul Station or Suseo Station',
      arrival: 'Gyeongju Station (formerly Singyeongju)',
      tip: 'The station is about 11 km from downtown. Buses reach the Express Bus Terminal in about 20 minutes, then it’s a 10-minute walk to Hwangnidan-gil.',
    },
    noFlight: 'We could not confirm a current direct flight from Gimpo. Connecting via Busan or Ulsan takes over 4 hours.',
    bus: {
      name: BUS, verdict: 'Cheapest', duration: '3h 30m – 3h 50m', fare: 'About ₩23,000 – 48,000',
      departure: 'Seoul Express Bus Terminal',
      arrival: 'Gyeongju Express Bus Terminal',
      tip: 'You arrive right in town, about a 10-minute walk from Hwangnidan-gil.',
    },
  },
]

// 지도는 위경도를 그대로 평면에 옮긴 약도다
const project = (lon: number, lat: number) => [Math.round((lon - 125.7) * 56), Math.round((38.8 - lat) * 66)] as const
const COAST = [
  [126.35, 37.85], [126.55, 37.45], [126.75, 37.0], [126.35, 36.75], [126.5, 36.4], [126.75, 35.95], [126.45, 35.55], [126.4, 35.0],
  [126.25, 34.6], [126.55, 34.3], [127.0, 34.55], [127.5, 34.7], [128.1, 34.85], [128.6, 34.85], [129.05, 35.05], [129.35, 35.4],
  [129.5, 36.0], [129.4, 36.5], [129.4, 37.0], [129.1, 37.55], [128.7, 38.0], [128.35, 38.6], [127.4, 38.35], [126.7, 38.0],
].map(([lon, lat]) => project(lon, lat).join(',')).join(' ')
const [JEJU_X, JEJU_Y] = project(126.55, 33.38)

function RouteMap({ dest }: { dest: Destination }) {
  const [sx, sy] = project(SEOUL.lon, SEOUL.lat)
  const [dx, dy] = project(dest.lon, dest.lat)
  // 이름표가 지도 밖으로 나가지 않게 동쪽 도시는 핀 왼쪽에 적는다
  const labelLeft = dx > 130
  return (
    <svg className="tg-map" viewBox="0 0 240 370" role="img" aria-label={`Map showing the route from Seoul to ${dest.name}. Not to scale.`}>
      <polygon points={COAST} fill="#F3F1EC" stroke="#D6D3CC" strokeWidth="1.5" strokeLinejoin="round" />
      <ellipse cx={JEJU_X} cy={JEJU_Y} rx="20" ry="10" fill="#F3F1EC" stroke="#D6D3CC" strokeWidth="1.5" />
      <line x1={sx} y1={sy} x2={dx} y2={dy} stroke="#C8102E" strokeWidth="2.5" strokeDasharray="2 7" strokeLinecap="round" />
      <circle cx={sx} cy={sy} r="6" fill="#111827" stroke="#fff" strokeWidth="2" />
      <circle cx={dx} cy={dy} r="7" fill="#C8102E" stroke="#fff" strokeWidth="2" />
      <g className="notranslate" fontFamily='"DM Sans", Inter, system-ui, sans-serif' fontSize="14" fontWeight="700">
        <text x={sx + 10} y={sy - 8} fill="#111827">Seoul</text>
        <text x={labelLeft ? dx - 11 : dx + 12} y={dy + 5} textAnchor={labelLeft ? 'end' : 'start'} fill="#C8102E">{dest.name}</text>
      </g>
    </svg>
  )
}

function ModeCard({ mode }: { mode: Mode }) {
  return (
    <article className={`tg-mode${mode.verdict === 'Best Choice' ? ' is-best' : ''}`}>
      <p className="tg-verdict">{mode.verdict ?? ' '}</p>
      <h3 className="tg-mode-name">{mode.name}</h3>
      <dl className="tg-facts">
        <div><dt>Duration</dt><dd>{mode.duration}</dd></div>
        <div><dt>Estimated Fare</dt><dd className="tg-fare notranslate" translate="no">{mode.fare}</dd></div>
        <div><dt>Departure Hub</dt><dd>{mode.departure}</dd></div>
        <div><dt>Arrival Hub &amp; City Connection Tip</dt><dd><strong>{mode.arrival}</strong><span className="tg-tip">{mode.tip}</span></dd></div>
      </dl>
    </article>
  )
}

export function TransitGuide() {
  const [selected, setSelected] = useState('busan')
  const dest = DESTINATIONS.find(d => d.id === selected) ?? DESTINATIONS[0]
  const modes = [dest.train, dest.flight, dest.bus].filter((m): m is Mode => !!m)
  const summary = dest.ferry
    ? 'Flying is the only practical way to get there from Seoul.'
    : `${modes.find(m => m.verdict === 'Fastest')?.name} is the fastest. ${modes.find(m => m.verdict === 'Cheapest')?.name} is the cheapest.`

  return (
    <>
      <style>{`
        .tl-wrap.tg-wrap { max-width: 960px; }
        .tg-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 20px; }
        .tg-tab {
          min-height: 48px; padding: 8px; border: 1px solid #E5E7EB; border-radius: 12px; background: #fff; cursor: pointer;
          font: 600 14px "DM Sans", Inter, system-ui, sans-serif; color: #374151; transition: border-color .15s, background .15s;
        }
        .tg-tab[aria-selected="true"] { background: #111827; border-color: #111827; color: #fff; }
        .tg-tab:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        @media (hover: hover) { .tg-tab:not([aria-selected="true"]):hover { border-color: #9CA3AF; } }

        .tg-overview { display: flex; align-items: center; gap: 20px; background: #fff; border: 1px solid #F3F4F6; border-radius: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.05); padding: 16px 20px; margin-bottom: 20px; }
        .tg-map { flex: 0 0 auto; display: block; width: 110px; height: auto; }
        .tg-route { font-family: "Playfair Display", Georgia, serif; font-size: 24px; font-weight: 700; line-height: 1.2; color: #111827; margin: 0 0 6px; }
        .tg-summary { font-size: 14px; line-height: 1.6; color: #4B5563; margin: 0; }

        .tg-modes { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin-bottom: 20px; }
        .tg-modes.is-single { max-width: 460px; }
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
        .tg-noflight { background: #F9FAFB; border: 1px dashed #D1D5DB; border-radius: 16px; padding: 20px; }
        .tg-noflight h3 { font-size: 18px; font-weight: 700; color: #6B7280; margin: 0 0 8px; }
        .tg-noflight p { font-size: 14px; line-height: 1.6; color: #4B5563; margin: 0; }
        .tg-ferry { font-size: 14px; line-height: 1.6; color: #1F2937; background: rgba(255,251,235,.6); border: 1px solid #FDE68A; border-radius: 12px; padding: 14px 16px; margin: 0 0 20px; }
        .tg-note { margin-top: 4px; }

        @media (min-width: 640px) {
          .tg-tabs { grid-template-columns: repeat(6, minmax(0, 1fr)); }
          .tg-map { width: 150px; }
          .tg-overview { padding: 20px 28px; gap: 32px; }
          .tg-route { font-size: 30px; }
        }
        @media (min-width: 768px) { .tg-modes:not(.is-single) { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
      `}</style>

      <div className="tg-tabs" role="tablist" aria-label="Destination from Seoul">
        {DESTINATIONS.map(d => (
          <button key={d.id} type="button" role="tab" className="tg-tab notranslate" translate="no" aria-selected={d.id === dest.id} onClick={() => setSelected(d.id)}>
            {d.name}
          </button>
        ))}
      </div>

      {/* key: 자동 번역이 글자 노드를 바꿔 끼우므로 목적지가 바뀌면 통째로 새로 그린다 */}
      <div key={dest.id} role="tabpanel" aria-label={`Seoul to ${dest.name}`}>
        <section className="tg-overview">
          <RouteMap dest={dest} />
          <div>
            <h2 className="tg-route notranslate" translate="no">Seoul → {dest.name}</h2>
            <p className="tg-summary">{summary}</p>
          </div>
        </section>

        <div className={`tg-modes${modes.length === 1 ? ' is-single' : ''}`}>
          {dest.train && <ModeCard mode={dest.train} />}
          {dest.flight
            ? <ModeCard mode={dest.flight} />
            : dest.noFlight && (
              <article className="tg-noflight">
                <h3>Flight: no direct option</h3>
                <p>{dest.noFlight}</p>
              </article>
            )}
          {dest.bus && <ModeCard mode={dest.bus} />}
        </div>

        {dest.ferry && <p className="tg-ferry"><strong>Ferry not recommended.</strong> {dest.ferry}</p>}
      </div>

      <p className="tl-note tg-note">
        Fares are approximate one-way standard fares and durations are typical, checked November 8, 2026. KTX and SRT merged in September 2026 and fares are
        still settling, so confirm the price on{' '}
        <a href="https://www.korail.com" rel="noopener noreferrer" target="_blank">Korail</a> before booking. Bus fares vary by class, and flight prices change daily.
        Check a map app for current local bus numbers. The map is illustrative and not to scale. Sources:{' '}
        <a href="https://welcome-busan.com/guide/transport/seoul-to-busan-ktx-guide/" rel="noopener noreferrer" target="_blank">Welcome Busan</a>,{' '}
        <a href="https://mileasia.com/korea/ktx-train-guide/" rel="noopener noreferrer" target="_blank">MileAsia KTX</a>,{' '}
        <a href="https://mileasia.com/korea/seoul-to-jeju/" rel="noopener noreferrer" target="_blank">MileAsia Jeju</a>,{' '}
        <a href="https://www.asiaodysseytravel.com/south-korea/seoul-to-jeonju.html" rel="noopener noreferrer" target="_blank">Asia Odyssey</a>,{' '}
        <a href="https://www.rome2rio.com/s/Seoul/Busan" rel="noopener noreferrer" target="_blank">Rome2Rio</a>.
      </p>
    </>
  )
}
