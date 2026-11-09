'use client'

import { COAST, JEJU_X, JEJU_Y, project } from '../KoreaRouteMap'
import { CITIES as MAP_CITIES } from '@/data/transitRoutes'

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

// 칩이 서로 겹치지 않게 도시마다 놓을 쪽을 정한다
const SIDE: Record<string, 'left' | 'right' | 'top'> = {
  Seoul: 'left', Chuncheon: 'top', Sokcho: 'right', Gangneung: 'right', Daegu: 'left',
  Gyeongju: 'right', Busan: 'right', Jeonju: 'left', Yeosu: 'left', Jeju: 'right',
}
const CHIP_H = 22
const chipWidth = (name: string) => Math.round(name.length * 5.900 + 48)

export type MapCity = { name: string; current: { temp: number; code: number; isDay: boolean; text: string } }

export function KoreaWeatherMap({ cities, selected, onSelect, temp }: { cities: MapCity[]; selected: number; onSelect: (i: number) => void; temp: (c: number) => string }) {
  return (
    <svg className="wf-map notranslate" viewBox="-6 24 322 350" role="group" aria-label="Map of Korea with current weather for ten cities. Not to scale.">
      <polygon points={COAST} fill="#F3F1EC" stroke="#D6D3CC" strokeWidth="1.500" strokeLinejoin="round" />
      <ellipse cx={JEJU_X} cy={JEJU_Y} rx="20" ry="10" fill="#F3F1EC" stroke="#D6D3CC" strokeWidth="1.500" />
      {cities.map((city, i) => {
        const place = MAP_CITIES.find(c => c.name.split(' / ')[0] === city.name)
        if (!place) return null
        const [x, y] = project(place.lon, place.lat)
        const active = i === selected
        const w = chipWidth(city.name)
        const side = SIDE[city.name]
        const left = side === 'left' ? x - 8 - w : side === 'right' ? x + 8 : x - w + 26
        const top = side === 'top' ? y - 8 - CHIP_H : y - CHIP_H / 2
        return (
          <g key={city.name} className={`wf-pin${active ? ' is-active' : ''}`} role="button" tabIndex={0} aria-pressed={active}
            aria-label={`${city.name}, ${city.current.text}, ${temp(city.current.temp)}`} onClick={() => onSelect(i)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(i) } }}>
            <circle className="wf-pin-dot" cx={x} cy={y} r={active ? 5 : 3} />
            <rect className="wf-pin-chip" x={left} y={top} width={w} height={CHIP_H} rx={CHIP_H / 2} />
            <text className="wf-pin-name" x={left + 8} y={top + 15}>{city.name}</text>
            <svg x={left + w - 38} y={top + 4} width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{art(kindOf(city.current.code), city.current.isDay)}</svg>
            <text className="wf-pin-temp" x={left + w - 7} y={top + 15} textAnchor="end">{temp(city.current.temp)}</text>
          </g>
        )
      })}
    </svg>
  )
}
