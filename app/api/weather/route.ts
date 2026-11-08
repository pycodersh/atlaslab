import { NextResponse } from 'next/server'

/**
 * 날씨 프록시 — WeatherAPI.com 키를 브라우저에 내보내지 않고, 방문자 수와 상관없이 호출량을 일정하게 둔다.
 * 도시 10곳 × 시간당 1회 ≈ 월 7,200회. Starter 플랜(7일 예보)이 필요하다. 환경변수: WEATHERAPI_KEY
 * 오류 응답과 로그에는 요청 주소를 남기지 않는다(주소에 키가 들어 있다).
 */
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
const REVALIDATE = 3600

// 화면이 키를 읽을 때마다 함수가 돌지만, 외부 호출은 아래 fetch 캐시로 시간당 한 번이다
export const dynamic = 'force-dynamic'

type Condition = { text: string; code: number }
type Upstream = {
  current: { temp_c: number; wind_kph: number; is_day: number; condition: Condition }
  forecast: {
    forecastday: {
      date: string
      day: { maxtemp_c: number; mintemp_c: number; daily_chance_of_rain: number | string; daily_chance_of_snow: number | string; condition: Condition }
    }[]
  }
}

const chance = (rain: number | string, snow: number | string) => {
  const value = Math.max(Number(rain), Number(snow))
  return Number.isFinite(value) ? value : null
}

async function loadCity(key: string, city: typeof CITIES[number]) {
  const params = new URLSearchParams({ key, q: `${city.lat},${city.lon}`, days: '7', aqi: 'no', alerts: 'no' })
  const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?${params}`, {
    next: { revalidate: REVALIDATE },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`upstream ${res.status}`)
  const json = await res.json() as Upstream
  if (typeof json.current?.temp_c !== 'number' || !json.forecast?.forecastday?.length) throw new Error('unexpected response')
  return {
    current: {
      temp: json.current.temp_c,
      wind: json.current.wind_kph,
      isDay: json.current.is_day === 1,
      code: json.current.condition.code,
      text: json.current.condition.text,
    },
    days: json.forecast.forecastday.map(d => ({
      date: d.date,
      code: d.day.condition.code,
      text: d.day.condition.text,
      max: d.day.maxtemp_c,
      min: d.day.mintemp_c,
      rain: chance(d.day.daily_chance_of_rain, d.day.daily_chance_of_snow),
    })),
  }
}

export async function GET() {
  const key = process.env.WEATHERAPI_KEY?.trim()
  const failure = (status: number) => NextResponse.json({ error: 'weather_unavailable' }, { status, headers: { 'Cache-Control': 'no-store' } })
  if (!key) return failure(503)

  try {
    const cities = await Promise.all(CITIES.map(city => loadCity(key, city)))
    return NextResponse.json(
      { fetchedAt: Date.now(), cities },
      { headers: { 'Cache-Control': `public, s-maxage=${REVALIDATE}, stale-while-revalidate=600` } },
    )
  } catch (error) {
    console.warn('[weather] upstream failed:', error instanceof Error ? error.message.slice(0, 40) : 'unknown')
    return failure(502)
  }
}
