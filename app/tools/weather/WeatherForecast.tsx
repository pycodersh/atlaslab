'use client'

import { createElement, useCallback, useEffect, useState, type ComponentType } from 'react'
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Moon, Sun } from 'lucide-react'

// 순서는 app/api/weather/route.ts 와 같아야 한다
const CITIES = [
  { name: 'Seoul' }, { name: 'Busan' }, { name: 'Jeju' }, { name: 'Gangneung' }, { name: 'Daegu' },
  { name: 'Jeonju' }, { name: 'Gyeongju' }, { name: 'Sokcho' }, { name: 'Chuncheon' }, { name: 'Yeosu' },
]

const CACHE_KEY = 'atlas_weather_v2'
const UNIT_KEY = 'atlas_weather_unit'
const CACHE_MS = 60 * 60 * 1000

type CityWeather = {
  current: { temp: number; wind: number; isDay: boolean; code: number; text: string }
  days: { date: string; code: number; text: string; max: number; min: number; rain: number | null }[]
}
type Cached = { fetchedAt: number; savedAt: number; cities: CityWeather[] }
type Status = 'loading' | 'ready' | 'stale' | 'error'
type Unit = 'C' | 'F'
type Icon = ComponentType<{ size?: number; strokeWidth?: number }>

const LIGHTNING = new Set([1087, 1273, 1276, 1279, 1282])
const SNOW = new Set([1066, 1069, 1072, 1114, 1117, 1168, 1171, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264])
const DRIZZLE = new Set([1150, 1153])
const FOG = new Set([1012, 1015, 1018, 1021, 1024, 1027, 1030, 1033, 1036, 1039, 1042, 1045, 1048, 1135, 1147])

// WeatherAPI 날씨 코드 → 아이콘. 문구는 API 가 주는 condition.text 를 그대로 쓴다
function iconFor(code: number, isDay = true): Icon {
  if (code === 1000) return isDay ? Sun : Moon
  if (code === 1003) return isDay ? CloudSun : Cloud
  if (code === 1006 || code === 1009) return Cloud
  if (FOG.has(code)) return CloudFog
  if (LIGHTNING.has(code)) return CloudLightning
  if (SNOW.has(code)) return CloudSnow
  if (DRIZZLE.has(code)) return CloudDrizzle
  return CloudRain
}

function outfitTip(tempC: number, rain: number | null) {
  const base =
    tempC >= 28 ? 'Short sleeves and breathable fabrics.'
      : tempC >= 23 ? 'A T-shirt, with a light layer for air-conditioned places.'
        : tempC >= 17 ? 'Long sleeves or a light cardigan.'
          : tempC >= 12 ? 'A trench coat or light jacket.'
            : tempC >= 5 ? 'A warm coat and layers.'
              : 'A padded jacket, hat and gloves.'
  return rain !== null && rain >= 50 ? `${base} Pack an umbrella.` : base
}

const readCache = (): Cached | null => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as Cached | null
    return parsed?.cities?.length === CITIES.length ? parsed : null
  } catch { return null }
}

async function fetchWeather(): Promise<Cached> {
  const res = await fetch('/api/weather', { signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const { fetchedAt, cities } = await res.json() as { fetchedAt: number; cities: CityWeather[] }
  if (!Array.isArray(cities) || cities.length !== CITIES.length) throw new Error('unexpected response')
  const fresh = { fetchedAt, savedAt: Date.now(), cities }
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(fresh)) } catch { /* 저장이 막히면 이번 화면에서만 쓴다 */ }
  return fresh
}

const seoulTime = (ts: number) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(ts)
const dayLabel = (date: string, i: number) => i === 0 ? 'Today' : new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))

function WeatherIcon({ code, isDay, size }: { code: number; isDay?: boolean; size: number }) {
  return createElement(iconFor(code, isDay), { size, strokeWidth: size > 40 ? 1.5 : 1.75 })
}

export function WeatherForecast() {
  const [data, setData] = useState<Cached | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [selected, setSelected] = useState(0)
  const [unit, setUnit] = useState<Unit>('C')

  const load = useCallback(async () => {
    const cached = readCache()
    if (cached && Date.now() - cached.savedAt < CACHE_MS) {
      setData(cached)
      setStatus('ready')
      return
    }
    setStatus(s => s === 'error' ? 'loading' : s)
    try {
      setData(await fetchWeather())
      setStatus('ready')
    } catch {
      setData(cached)
      setStatus(cached ? 'stale' : 'error')
    }
  }, [])

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- localStorage 와 외부 날씨는 하이드레이션 뒤에만 읽을 수 있다 */
    try { if (localStorage.getItem(UNIT_KEY) === 'F') setUnit('F') } catch { /* 기본 °C */ }
    void load()
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [load])

  const chooseUnit = (next: Unit) => {
    setUnit(next)
    try { localStorage.setItem(UNIT_KEY, next) } catch { /* 이번 방문에만 적용된다 */ }
  }
  const temp = (c: number) => `${Math.round(unit === 'C' ? c : c * 9 / 5 + 32)}°`
  const wind = (kmh: number) => unit === 'C' ? `${Math.round(kmh)} km/h` : `${Math.round(kmh * 0.621371)} mph`
  const percent = (p: number | null) => p === null ? '–' : `${p}%`

  const city = data?.cities[selected]
  const lowest = city ? Math.min(...city.days.map(d => d.min)) : 0
  const highest = city ? Math.max(...city.days.map(d => d.max)) : 1
  const range = Math.max(highest - lowest, 1)

  return (
    <>
      <style>{`
        .tl-wrap.wf-wrap { max-width: 960px; }
        .wf-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .wf-head h2, .wf-section-title { font-size: 16px; font-weight: 700; color: #111827; margin: 0; }
        .wf-units { display: flex; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; background: #fff; }
        .wf-units button { min-width: 48px; min-height: 44px; border: 0; background: none; font: 700 14px "DM Sans", Inter, system-ui, sans-serif; color: #6B7280; cursor: pointer; }
        .wf-units button[aria-pressed="true"] { background: #111827; color: #fff; }
        .wf-tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-bottom: 20px; }
        .wf-tile { display: flex; align-items: center; justify-content: space-between; gap: 6px; min-height: 60px; padding: 10px 12px; text-align: left; border: 1px solid #E5E7EB; border-radius: 12px; background: #fff; color: #111827; cursor: pointer; font-family: "DM Sans", Inter, system-ui, sans-serif; }
        .wf-tile[aria-pressed="true"] { background: #F9FAFB; border-color: #111827; box-shadow: 0 0 0 1px #111827; }
        .wf-tile-name { font-size: 14px; font-weight: 600; min-width: 0; overflow-wrap: anywhere; }
        .wf-tile-right { display: flex; align-items: center; gap: 6px; flex: none; color: #4B5563; }
        .wf-tile-temp { font-size: 16px; font-weight: 700; color: #111827; }
        .wf-units button:focus-visible, .wf-tile:focus-visible, .wf-retry:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }

        .wf-panel { background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
        .wf-now { display: flex; align-items: center; gap: 18px; }
        .wf-now-icon { flex: none; color: #C8102E; }
        .wf-now-city { font-size: 14px; font-weight: 600; color: #4B5563; margin: 0; }
        .wf-now-temp { font-size: 52px; font-weight: 700; line-height: 1.05; color: #111827; margin: 0; }
        .wf-now-text { font-size: 16px; font-weight: 600; color: #111827; margin: 0; }
        .wf-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 18px 0 0; }
        .wf-stats div { background: #F9FAFB; border-radius: 10px; padding: 12px 8px; text-align: center; }
        .wf-stats dt { font-size: 12px; color: #4B5563; margin-bottom: 2px; }
        .wf-stats dd { margin: 0; font-size: 15px; font-weight: 700; color: #111827; }
        .wf-tip { font-size: 14px; line-height: 1.5; color: #1F2937; background: rgba(255,251,235,.6); border: 1px solid #FDE68A; border-radius: 10px; padding: 12px 14px; margin: 12px 0 0; }

        .wf-section-title { margin-bottom: 12px; }
        .wf-week { display: flex; gap: 8px; overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x proximity; padding-bottom: 6px; margin-bottom: 14px; }
        .wf-day { flex: 0 0 104px; scroll-snap-align: start; box-sizing: border-box; border: 1px solid #E5E7EB; border-radius: 12px; background: #fff; padding: 12px 10px; text-align: center; color: #111827; }
        .wf-day-name { font-size: 14px; font-weight: 700; margin: 0 0 8px; }
        .wf-day-icon { display: flex; justify-content: center; color: #C8102E; margin-bottom: 4px; }
        .wf-day-text { font-size: 12px; line-height: 1.3; color: #4B5563; min-height: 32px; margin: 0 0 8px; }
        .wf-bar { position: relative; height: 4px; border-radius: 2px; background: #F3F4F6; margin: 0 0 6px; }
        .wf-bar span { position: absolute; top: 0; bottom: 0; border-radius: 2px; background: #C8102E; }
        .wf-day-temps { font-size: 14px; font-weight: 700; margin: 0; }
        .wf-day-temps span { color: #6B7280; font-weight: 500; }
        .wf-day-rain { font-size: 12px; color: #4B5563; margin: 4px 0 0; }

        .wf-alert { font-size: 14px; line-height: 1.5; color: #92400E; background: rgba(255,251,235,.8); border: 1px solid #FDE68A; border-radius: 12px; padding: 12px 14px; margin: 0 0 14px; }
        .wf-retry { min-height: 44px; margin-top: 8px; padding: 8px 16px; border: 1px solid #D1D5DB; border-radius: 10px; background: #fff; font: 700 14px "DM Sans", Inter, system-ui, sans-serif; color: #111827; cursor: pointer; display: block; }
        .wf-loading { font-size: 14px; color: #6B7280; margin: 0 0 14px; }

        @media (min-width: 640px) { .wf-tiles { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (min-width: 768px) {
          .wf-tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .wf-week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); overflow: visible; }
          .wf-day { padding: 12px 6px; }
        }
        @media (max-width: 767px) { .wf-panel { padding: 20px; } }
      `}</style>

      {status === 'loading' && <p className="wf-loading">Loading the latest weather…</p>}
      {status === 'stale' && data && (
        <p key="stale" className="wf-alert">
          We couldn&apos;t update the weather. Showing the last saved data from <span className="notranslate" translate="no">{seoulTime(data.fetchedAt)}</span> KST.
        </p>
      )}
      {status === 'error' && (
        <div key="error" className="wf-alert">
          We couldn&apos;t load the weather. Check your connection and try again.
          <button type="button" className="wf-retry" onClick={() => void load()}>Try again</button>
        </div>
      )}

      {data && city && (
        <>
          <div className="wf-head">
            <h2>Across Korea</h2>
            <div className="wf-units notranslate" translate="no" role="group" aria-label="Temperature unit">
              <button type="button" aria-pressed={unit === 'C'} onClick={() => chooseUnit('C')}>°C</button>
              <button type="button" aria-pressed={unit === 'F'} onClick={() => chooseUnit('F')}>°F</button>
            </div>
          </div>

          <div className="wf-tiles">
            {CITIES.map((c, i) => {
              const now = data.cities[i].current
              return (
                <button key={c.name} type="button" className="wf-tile" aria-pressed={i === selected} onClick={() => setSelected(i)}>
                  <span className="wf-tile-name notranslate" translate="no">{c.name}</span>
                  <span className="wf-tile-right" aria-label={`${now.text}, ${temp(now.temp)}`}>
                    <WeatherIcon code={now.code} isDay={now.isDay} size={20} />
                    <span key={unit} className="wf-tile-temp notranslate" translate="no">{temp(now.temp)}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* key: 자동 번역이 글자 노드를 바꿔 끼우므로 도시 · 단위가 바뀌면 새로 그린다 */}
          <div key={`${selected}-${unit}`}>
            <section className="wf-panel" aria-label={`Current weather in ${CITIES[selected].name}`}>
              <div className="wf-now">
                <span className="wf-now-icon" aria-hidden="true"><WeatherIcon code={city.current.code} isDay={city.current.isDay} size={72} /></span>
                <div>
                  <p className="wf-now-city notranslate" translate="no">{CITIES[selected].name}</p>
                  <p className="wf-now-temp notranslate" translate="no">{temp(city.current.temp)}</p>
                  <p className="wf-now-text">{city.current.text}</p>
                </div>
              </div>
              <dl className="wf-stats">
                <div><dt>Low / High</dt><dd className="notranslate" translate="no">{temp(city.days[0].min)} / {temp(city.days[0].max)}</dd></div>
                <div><dt>Rain chance</dt><dd className="notranslate" translate="no">{percent(city.days[0].rain)}</dd></div>
                <div><dt>Wind</dt><dd className="notranslate" translate="no">{wind(city.current.wind)}</dd></div>
              </dl>
              <p className="wf-tip"><strong>What to wear:</strong> {outfitTip(city.current.temp, city.days[0].rain)}</p>
            </section>

            <h2 className="wf-section-title">{city.days.length}-Day Forecast</h2>
            <div className="wf-week" tabIndex={0} role="group" aria-label={`${city.days.length}-day forecast`}>
              {city.days.map((day, i) => {
                return (
                  <article key={day.date} className="wf-day">
                    <p className="wf-day-name">{dayLabel(day.date, i)}</p>
                    <div className="wf-day-icon" aria-hidden="true"><WeatherIcon code={day.code} size={26} /></div>
                    <p className="wf-day-text">{day.text}</p>
                    <div className="wf-bar" aria-hidden="true"><span style={{ left: `${(day.min - lowest) / range * 100}%`, width: `${Math.max((day.max - day.min) / range * 100, 6)}%` }} /></div>
                    <p className="wf-day-temps notranslate" translate="no"><span>{temp(day.min)}</span> {temp(day.max)}</p>
                    <p className="wf-day-rain">Rain <span className="notranslate" translate="no">{percent(day.rain)}</span></p>
                  </article>
                )
              })}
            </div>
          </div>

          <p className="tl-note">
            Updated <span className="notranslate" translate="no">{seoulTime(data.fetchedAt)}</span> KST and refreshed hourly.{' '}
            <a href="https://www.weatherapi.com/" rel="noopener noreferrer" target="_blank">Powered by WeatherAPI.com</a>. Forecasts can change, so check again before you head out.
          </p>
        </>
      )}
    </>
  )
}
