'use client'

import { useCallback, useEffect, useState, type ComponentType } from 'react'
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Moon, Sun } from 'lucide-react'

const CITIES = [
  { name: 'Seoul', lat: 37.57, lon: 126.98 },
  { name: 'Busan', lat: 35.18, lon: 129.08 },
  { name: 'Jeju', lat: 33.5, lon: 126.53 },
  { name: 'Gangneung', lat: 37.75, lon: 128.9 },
  { name: 'Daegu', lat: 35.87, lon: 128.6 },
  { name: 'Jeonju', lat: 35.82, lon: 127.15 },
  { name: 'Gyeongju', lat: 35.84, lon: 129.22 },
  { name: 'Sokcho', lat: 38.2, lon: 128.59 },
  { name: 'Chuncheon', lat: 37.88, lon: 127.73 },
  { name: 'Yeosu', lat: 34.76, lon: 127.66 },
]

const CACHE_KEY = 'atlas_weather_v1'
const UNIT_KEY = 'atlas_weather_unit'
const CACHE_MS = 60 * 60 * 1000

type CityWeather = {
  current_weather: { temperature: number; windspeed: number; weathercode: number; is_day: number }
  daily: {
    time: string[]
    weathercode: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_max: (number | null)[]
  }
}
type Cached = { fetchedAt: number; cities: CityWeather[] }
type Status = 'loading' | 'ready' | 'stale' | 'error'
type Unit = 'C' | 'F'

function describe(code: number): { text: string; Icon: ComponentType<{ size?: number; strokeWidth?: number }> } {
  if (code === 0) return { text: 'Clear Sky', Icon: Sun }
  if (code === 1) return { text: 'Mainly Clear', Icon: Sun }
  if (code === 2) return { text: 'Partly Cloudy', Icon: CloudSun }
  if (code === 3) return { text: 'Overcast', Icon: Cloud }
  if (code === 45 || code === 48) return { text: 'Fog', Icon: CloudFog }
  if (code === 56 || code === 57) return { text: 'Freezing Drizzle', Icon: CloudDrizzle }
  if (code >= 51 && code <= 55) return { text: 'Drizzle', Icon: CloudDrizzle }
  if (code === 61) return { text: 'Light Rain', Icon: CloudRain }
  if (code === 63) return { text: 'Rain', Icon: CloudRain }
  if (code === 65) return { text: 'Heavy Rain', Icon: CloudRain }
  if (code === 66 || code === 67) return { text: 'Freezing Rain', Icon: CloudRain }
  if (code === 71) return { text: 'Light Snow', Icon: CloudSnow }
  if (code === 73 || code === 77) return { text: 'Snow', Icon: CloudSnow }
  if (code === 75) return { text: 'Heavy Snow', Icon: CloudSnow }
  if (code >= 80 && code <= 82) return { text: 'Rain Showers', Icon: CloudRain }
  if (code === 85 || code === 86) return { text: 'Snow Showers', Icon: CloudSnow }
  if (code === 95) return { text: 'Thunderstorm', Icon: CloudLightning }
  if (code === 96 || code === 99) return { text: 'Thunderstorm with Hail', Icon: CloudLightning }
  return { text: 'Cloudy', Icon: Cloud }
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
  const params = new URLSearchParams({
    latitude: CITIES.map(c => c.lat).join(','),
    longitude: CITIES.map(c => c.lon).join(','),
    current_weather: 'true',
    daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'Asia/Seoul',
    forecast_days: '7',
  })
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const cities = await res.json() as CityWeather[]
  if (!Array.isArray(cities) || cities.length !== CITIES.length) throw new Error('unexpected response')
  const fresh = { fetchedAt: Date.now(), cities }
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(fresh)) } catch { /* 저장이 막히면 이번 화면에서만 쓴다 */ }
  return fresh
}

const seoulTime = (ts: number) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(ts)
const dayLabel = (date: string, i: number) => i === 0 ? 'Today' : new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))

export function WeatherForecast() {
  const [data, setData] = useState<Cached | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [selected, setSelected] = useState(0)
  const [unit, setUnit] = useState<Unit>('C')

  const load = useCallback(async () => {
    const cached = readCache()
    if (cached && Date.now() - cached.fetchedAt < CACHE_MS) {
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
  const lowest = city ? Math.min(...city.daily.temperature_2m_min) : 0
  const highest = city ? Math.max(...city.daily.temperature_2m_max) : 1
  const range = Math.max(highest - lowest, 1)
  const CurrentIcon = city
    ? (city.current_weather.is_day === 0 && city.current_weather.weathercode <= 1 ? Moon : describe(city.current_weather.weathercode).Icon)
    : Cloud

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
              const now = data.cities[i].current_weather
              const { Icon } = describe(now.weathercode)
              return (
                <button key={c.name} type="button" className="wf-tile" aria-pressed={i === selected} onClick={() => setSelected(i)}>
                  <span className="wf-tile-name notranslate" translate="no">{c.name}</span>
                  <span className="wf-tile-right" aria-label={`${describe(now.weathercode).text}, ${temp(now.temperature)}`}>
                    <Icon size={20} strokeWidth={1.75} />
                    <span key={unit} className="wf-tile-temp notranslate" translate="no">{temp(now.temperature)}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* key: 자동 번역이 글자 노드를 바꿔 끼우므로 도시 · 단위가 바뀌면 새로 그린다 */}
          <div key={`${selected}-${unit}`}>
            <section className="wf-panel" aria-label={`Current weather in ${CITIES[selected].name}`}>
              <div className="wf-now">
                <span className="wf-now-icon" aria-hidden="true"><CurrentIcon size={72} strokeWidth={1.5} /></span>
                <div>
                  <p className="wf-now-city notranslate" translate="no">{CITIES[selected].name}</p>
                  <p className="wf-now-temp notranslate" translate="no">{temp(city.current_weather.temperature)}</p>
                  <p className="wf-now-text">{describe(city.current_weather.weathercode).text}</p>
                </div>
              </div>
              <dl className="wf-stats">
                <div><dt>Low / High</dt><dd className="notranslate" translate="no">{temp(city.daily.temperature_2m_min[0])} / {temp(city.daily.temperature_2m_max[0])}</dd></div>
                <div><dt>Rain chance</dt><dd className="notranslate" translate="no">{percent(city.daily.precipitation_probability_max[0])}</dd></div>
                <div><dt>Wind</dt><dd className="notranslate" translate="no">{wind(city.current_weather.windspeed)}</dd></div>
              </dl>
              <p className="wf-tip"><strong>What to wear:</strong> {outfitTip(city.current_weather.temperature, city.daily.precipitation_probability_max[0])}</p>
            </section>

            <h2 className="wf-section-title">7-Day Forecast</h2>
            <div className="wf-week" tabIndex={0} role="group" aria-label="7-day forecast">
              {city.daily.time.map((date, i) => {
                const { text, Icon } = describe(city.daily.weathercode[i])
                const min = city.daily.temperature_2m_min[i]
                const max = city.daily.temperature_2m_max[i]
                return (
                  <article key={date} className="wf-day">
                    <p className="wf-day-name">{dayLabel(date, i)}</p>
                    <div className="wf-day-icon" aria-hidden="true"><Icon size={26} strokeWidth={1.75} /></div>
                    <p className="wf-day-text">{text}</p>
                    <div className="wf-bar" aria-hidden="true"><span style={{ left: `${(min - lowest) / range * 100}%`, width: `${Math.max((max - min) / range * 100, 6)}%` }} /></div>
                    <p className="wf-day-temps notranslate" translate="no"><span>{temp(min)}</span> {temp(max)}</p>
                    <p className="wf-day-rain">Rain <span className="notranslate" translate="no">{percent(city.daily.precipitation_probability_max[i])}</span></p>
                  </article>
                )
              })}
            </div>
          </div>

          <p className="tl-note">
            Updated <span className="notranslate" translate="no">{seoulTime(data.fetchedAt)}</span> KST and refreshed hourly.{' '}
            <a href="https://open-meteo.com/" rel="noopener noreferrer" target="_blank">Weather data by Open-Meteo.com</a>. Forecasts can change, so check again before you head out.
          </p>
        </>
      )}
    </>
  )
}
