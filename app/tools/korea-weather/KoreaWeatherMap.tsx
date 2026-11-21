'use client'

import { CITIES as MAP_CITIES } from '@/data/transitRoutes'
import { KoreaPenSvg, penXY as project } from '@/components/maps/KoreaPenSvg'

const LIGHTNING = new Set([1087, 1273, 1276, 1279, 1282])
const SNOW = new Set([1066, 1069, 1072, 1114, 1117, 1168, 1171, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264])
const DRIZZLE = new Set([1150, 1153])
const FOG = new Set([1012, 1015, 1018, 1021, 1024, 1027, 1030, 1033, 1036, 1039, 1042, 1045, 1048, 1135, 1147])

type Kind = 'clear' | 'partly' | 'cloudy' | 'fog' | 'thunder' | 'snow' | 'drizzle' | 'rain'

// WeatherAPI 날씨 코드 → 아이콘 종류. 문구는 API 가 주는 condition.text 를 그대로 쓴다
function kindOf(code: number): Kind {
  if (code === 1000) return 'clear'
  if (code === 1003) return 'partly'
  if (code === 1006 || code === 1009) return 'cloudy'
  if (FOG.has(code)) return 'fog'
  if (LIGHTNING.has(code)) return 'thunder'
  if (SNOW.has(code)) return 'snow'
  if (DRIZZLE.has(code)) return 'drizzle'
  return 'rain'
}

const CLOUD = 'M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z'
const RAYS = 'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41'
const MOON = 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'
const RAISED = 'translate(1.200 -4.500) scale(.92)'

const SLATE = { fill: '#E2E8F0', stroke: '#94A3B8' }
const DEEP = { fill: '#CBD5E1', stroke: '#64748B' }
const SUN = { fill: '#FEF3C7', stroke: '#F59E0B' }
const NIGHT = { fill: '#E0E7FF', stroke: '#6366F1' }

const Sun = ({ transform }: { transform?: string }) => <g transform={transform}><circle cx="12" cy="12" r="4.500" {...SUN} /><path d={RAYS} stroke={SUN.stroke} /></g>

function art(kind: Kind, isDay: boolean) {
  switch (kind) {
    case 'clear': return isDay ? <Sun /> : <path d={MOON} {...NIGHT} />
    case 'partly': return <>
      {isDay ? <Sun transform="translate(-2.500 -3) scale(.72)" /> : <path d={MOON} transform="translate(-1 -2) scale(.65)" {...NIGHT} />}
      <path d={CLOUD} transform="translate(3 3.500) scale(.84)" fill="#F0F9FF" stroke="#7DD3FC" />
    </>
    case 'cloudy': return <path d={CLOUD} {...SLATE} />
    case 'fog': return <><path d={CLOUD} transform={RAISED} {...SLATE} /><path d="M6 18h12M8 21.500h8" stroke="#94A3B8" /></>
    case 'thunder': return <><path d={CLOUD} transform={RAISED} {...DEEP} /><path d="M13 14l-3 4.500h4L12 23" stroke="#F59E0B" /></>
    case 'snow': return <path d="M12 2v20M3.340 7l17.320 10M3.340 17 20.660 7M12 6l-2.500-2M12 6l2.500-2M12 18l-2.500 2M12 18l2.500 2" stroke="#06B6D4" />
    case 'drizzle': return <><path d={CLOUD} transform={RAISED} {...DEEP} /><path d="M9 18v1.500M15 18v1.500M12 20.500V22" stroke="#3B82F6" /></>
    default: return <><path d={CLOUD} transform={RAISED} {...DEEP} /><path d="M8 17l-1 4M12.500 17l-1 4M17 17l-1 4" stroke="#3B82F6" /></>
  }
}

export function WeatherIcon({ code, isDay = true, size }: { code: number; isDay?: boolean; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth={size > 40 ? 1.400 : 1.750} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {art(kindOf(code), isDay)}
    </svg>
  )
}

const BAR: Record<Kind, string> = {
  clear: 'linear-gradient(90deg, #FBBF24, #F97316)',
  partly: 'linear-gradient(90deg, #7DD3FC, #FBBF24)',
  cloudy: 'linear-gradient(90deg, #CBD5E1, #94A3B8)',
  fog: 'linear-gradient(90deg, #CBD5E1, #94A3B8)',
  thunder: 'linear-gradient(90deg, #64748B, #F59E0B)',
  snow: 'linear-gradient(90deg, #A5F3FC, #22D3EE)',
  drizzle: 'linear-gradient(90deg, #93C5FD, #3B82F6)',
  rain: 'linear-gradient(90deg, #60A5FA, #2563EB)',
}
export const barTone = (code: number) => BAR[kindOf(code)]

/**
 * 라벨 [도시명 · 아이콘 · 기온] 을 점의 어느 쪽에 둘지. 바탕 상자 없는 글자 + 흰 후광이라 해안선 위에서도 읽힌다.
 *   left / right — 점 옆 같은 높이(GAP 만큼 띄움). 되도록 이쪽 — [점] 도시명 아이콘 기온.
 *   top / bottom — 점 위·아래(gap 만큼 띄움). align 은 라벨의 어느 끝을 점 x + dx 에 맞출지(center 가 기본).
 *     옆자리가 이웃 도시 점 · 라벨이나 지도 오른쪽 끝과 부딪히는 곳만(Seoul · Chuncheon · Daegu · Gyeongju) 쓰고, 짧은 세로 연결선을 그린다.
 * 값은 라벨 상자를 실측해 서로 · 다른 점과 안 겹치고 지도 틀 밖으로 안 나가게 맞췄다(2026-11-21, 펜화 지도 · °F 세 자리 · 선택 상태 굵은 글씨까지).
 *   Gangneung 라벨은 오른쪽 — 바로 아래 울릉도를 가리지 않는다.
 */
type Place = { side: 'left' | 'right' | 'top' | 'bottom'; align?: 'start' | 'center' | 'end'; dx?: number; gap?: number }
const PLACE: Record<string, Place> = {
  Seoul: { side: 'top', align: 'end', dx: 10, gap: 4 },
  Chuncheon: { side: 'top', align: 'end', dx: 30, gap: 16 },
  Sokcho: { side: 'right' },
  Gangneung: { side: 'right' },
  Daegu: { side: 'top', dx: -12, gap: 12 },
  Gyeongju: { side: 'bottom', align: 'start', dx: -18, gap: 4 },
  Busan: { side: 'right' },
  Jeonju: { side: 'left' },
  Yeosu: { side: 'left' },
  Jeju: { side: 'right' },
}
// 라벨은 HTML 이라 글자 폭만큼만 차지한다 — 이 상자(foreignObject) 안에서 쪽에 맞춰 붙는다. 빈 자리는 클릭을 받지 않는다
const BOX_W = 150
const BOX_H = 18
const GAP = 6

export type MapCity = { name: string; current: { temp: number; code: number; isDay: boolean; text: string } }

export function KoreaWeatherMap({ cities, selected, onSelect, temp }: { cities: MapCity[]; selected: number; onSelect: (i: number) => void; temp: (c: number) => string }) {
  return (
    <KoreaPenSvg className="wf-map" ariaLabel="Map of South Korea with current weather for ten cities">
      {/* 선택된 도시를 맨 마지막에 그려 다른 배지 위로 올라오게 한다 */}
      {cities.map((city, i) => ({ city, i })).sort((a, b) => Number(a.i === selected) - Number(b.i === selected)).map(({ city, i }) => {
        const place = MAP_CITIES.find(c => c.name.split(' / ')[0] === city.name)
        if (!place) return null
        const [x, y] = project(place.lon, place.lat)
        const active = i === selected
        const { side, align = 'center', dx = 0, gap = GAP } = PLACE[city.name]
        const vertical = side === 'top' || side === 'bottom'
        const ax = x + dx
        const left = side === 'left' ? x - GAP - BOX_W : side === 'right' ? x + GAP
          : align === 'start' ? ax : align === 'end' ? ax - BOX_W : ax - BOX_W / 2
        const top = side === 'top' ? y - gap - BOX_H : side === 'bottom' ? y + gap : y - BOX_H / 2
        const justify = side === 'left' ? 'end' : side === 'right' ? 'start' : align
        const r = active ? 5 : 3
        return (
          <g key={city.name} className={`wf-pin${active ? ' is-active' : ''}`} role="button" tabIndex={0} aria-pressed={active}
            aria-label={`${city.name}, ${city.current.text}, ${temp(city.current.temp)}`} onClick={() => onSelect(i)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(i) } }}>
            {vertical && <line className="wf-pin-lead" x1={x} y1={side === 'top' ? y - r : y + r} x2={x} y2={side === 'top' ? y - gap : y + gap} />}
            {active && <circle className="wf-pin-ping" cx={x} cy={y} r="6" />}
            <circle className="wf-pin-dot" cx={x} cy={y} r={r} />
            <foreignObject x={left} y={top} width={BOX_W} height={BOX_H}>
              <div className={`wf-label is-${justify}`}>
                <span className="wf-badge">
                  <span className="wf-pin-name">{city.name}</span>
                  <WeatherIcon code={city.current.code} isDay={city.current.isDay} size={14} />
                  <span className="wf-pin-temp">{temp(city.current.temp)}</span>
                </span>
              </div>
            </foreignObject>
          </g>
        )
      })}
    </KoreaPenSvg>
  )
}
