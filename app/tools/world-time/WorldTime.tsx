'use client'

import { useEffect, useState } from 'react'

const CITIES = [
  { id: 'seoul', name: 'Seoul', zone: 'Asia/Seoul' },
  { id: 'new-york', name: 'New York', zone: 'America/New_York' },
  { id: 'los-angeles', name: 'Los Angeles', zone: 'America/Los_Angeles' },
  { id: 'london', name: 'London', zone: 'Europe/London' },
  { id: 'paris', name: 'Paris', zone: 'Europe/Paris' },
  { id: 'sydney', name: 'Sydney', zone: 'Australia/Sydney' },
  { id: 'singapore', name: 'Singapore / Taipei', zone: 'Asia/Singapore' },
]

const SEOUL_UTC_OFFSET_MIN = 9 * 60 // 한국은 일광절약시간이 없다
const DAY_MIN = 24 * 60
const STEP_MIN = 15
const pad = (n: number) => String(n).padStart(2, '0')
const clock = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`

function wall(zone: string, instant: number) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
  }).formatToParts(instant)
  const get = (type: string) => Number(parts.find(p => p.type === type)?.value)
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute') }
}

// 도시 벽시계를 UTC 로 읽은 값과 실제 순간의 차이 = 그 순간의 UTC 오프셋(서머타임 자동 반영)
function offsetMinutes(zone: string, instant: number) {
  const w = wall(zone, instant)
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute)
  return Math.round((asUtc - Math.floor(instant / 60000) * 60000) / 60000)
}

function differenceLabel(zone: string, instant: number) {
  const minutes = offsetMinutes(zone, instant) - SEOUL_UTC_OFFSET_MIN
  if (minutes === 0) return 'Same as Seoul'
  const hours = Math.abs(minutes) / 60
  return `${minutes > 0 ? '+' : '-'}${hours} ${hours === 1 ? 'hr' : 'hrs'}`
}

type Phase = 'night' | 'day' | 'evening'
const phaseOf = (hour: number): Phase => hour < 7 ? 'night' : hour < 18 ? 'day' : 'evening'
const BADGE: Record<Phase, string> = { night: 'Sleeping', day: 'Active / Call OK', evening: 'Evening' }

function CityCard({ city, instant }: { city: typeof CITIES[number]; instant: number | null }) {
  const w = instant === null ? null : wall(city.zone, instant)
  const phase = w ? phaseOf(w.hour) : 'day'
  const date = instant === null ? '' : new Intl.DateTimeFormat('en-US', { timeZone: city.zone, weekday: 'short', month: 'short', day: 'numeric' }).format(instant)
  const isBase = city.id === 'seoul'
  return (
    <article className={`wt-card is-${phase}`}>
      <div className="wt-head">
        <div className="wt-city">
          <h2>{city.name}</h2>
          <p className="wt-sub notranslate" translate="no">{isBase ? 'Base city' : instant === null ? ' ' : differenceLabel(city.zone, instant)}</p>
        </div>
        {w && <span key={phase} className="wt-badge"><i aria-hidden="true" />{BADGE[phase]}</span>}
      </div>
      <p className="wt-time notranslate" translate="no">{w ? `${pad(w.hour)}:${pad(w.minute)}` : '--:--'}</p>
      <p className="wt-sub notranslate" translate="no">{date || ' '}</p>
    </article>
  )
}

export function WorldTime() {
  const [now, setNow] = useState<number | null>(null)
  // null 이면 현재 시각을 따라가고, 슬라이더를 만지면 서울 기준 분(0~1425)이 된다
  const [preview, setPreview] = useState<number | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 현재 시각은 하이드레이션 뒤에만 읽을 수 있다
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const seoul = now === null ? null : wall('Asia/Seoul', now)
  const liveMinutes = seoul ? seoul.hour * 60 + seoul.minute : 15 * 60
  const seoulMinutes = preview ?? liveMinutes
  const instant = now === null || seoul === null
    ? null
    : preview === null
      ? now
      : Date.UTC(seoul.year, seoul.month - 1, seoul.day, 0, preview - SEOUL_UTC_OFFSET_MIN)

  return (
    <>
      <style>{`
        .tl-wrap.wt-wrap { max-width: 960px; }
        .wt-control { background: #fff; border: 1px solid #F3F4F6; border-radius: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.05); padding: 24px; margin-bottom: 20px; }
        .wt-question { margin: 0 0 14px; font-size: 18px; font-weight: 600; line-height: 1.5; color: #111827; }
        .wt-pick { display: inline-block; padding: 1px 10px; border-radius: 8px; background: #111827; color: #fff; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-weight: 700; }
        .wt-range { display: block; width: 100%; height: 44px; margin: 0; accent-color: #C8102E; cursor: pointer; }
        .wt-range:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        .wt-ticks { display: flex; justify-content: space-between; font-size: 12px; color: #6B7280; }
        .wt-live { min-height: 44px; margin-top: 8px; padding: 0; border: 0; background: none; font: 700 14px "DM Sans", Inter, system-ui, sans-serif; color: #C8102E; cursor: pointer; }
        .wt-status { margin: 12px 0 0; font-size: 13px; color: #6B7280; }
        .wt-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
        .wt-card { border: 1px solid; border-radius: 16px; padding: 18px; transition: background .3s, color .3s, border-color .3s; }
        .wt-card.is-night { background: #0F172A; border-color: #1E293B; color: #fff; }
        .wt-card.is-day { background: linear-gradient(to bottom right, rgba(255,251,235,.6), rgba(255,247,237,.4)); border-color: rgba(253,230,138,.6); color: #111827; }
        .wt-card.is-evening { background: linear-gradient(to bottom right, rgba(238,242,255,.7), rgba(250,245,255,.5)); border-color: rgba(199,210,254,.5); color: #111827; }
        .wt-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
        .wt-city { min-width: 0; }
        .wt-city h2 { margin: 0; font-size: 16px; font-weight: 700; line-height: 1.3; }
        .wt-sub { margin: 2px 0 0; font-size: 12px; color: #4B5563; }
        .is-night .wt-sub { color: #CBD5E1; }
        .wt-badge { flex: none; display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; letter-spacing: -.01em; white-space: nowrap; }
        .wt-badge i { flex: none; width: 6px; height: 6px; border-radius: 50%; }
        .is-night .wt-badge { color: #C7D2FE; }
        .is-night .wt-badge i { background: #818CF8; }
        .is-day .wt-badge { color: #047857; }
        .is-day .wt-badge i { background: #10B981; }
        .is-evening .wt-badge { color: #B45309; }
        .is-evening .wt-badge i { background: #F59E0B; }
        .wt-time { margin: 14px 0 0; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 24px; font-weight: 700; letter-spacing: -.025em; line-height: 1.2; }
        @media (min-width: 640px) {
          .wt-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .wt-time { font-size: 30px; }
        }
        @media (min-width: 900px) { .wt-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 767px) { .wt-control { padding: 20px; } .wt-question { font-size: 16px; } }
      `}</style>

      <section className="wt-control">
        <p className="wt-question">
          When it&apos;s <span className="wt-pick notranslate" translate="no">{clock(seoulMinutes)}</span> in Seoul, what time is it back home?
        </p>
        <input className="wt-range" type="range" min={0} max={DAY_MIN - STEP_MIN} step={STEP_MIN} value={Math.floor(seoulMinutes / STEP_MIN) * STEP_MIN}
          aria-label="Time in Seoul" aria-valuetext={`${clock(seoulMinutes)} in Seoul`}
          onChange={e => setPreview(Number(e.target.value))} />
        <div className="wt-ticks notranslate" translate="no" aria-hidden="true"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>
        {preview === null
          ? <p key="live" className="wt-status">Showing the current time. Drag the slider to compare.</p>
          : <button key="back" type="button" className="wt-live" onClick={() => setPreview(null)}>Back to current time</button>}
      </section>

      <div className="wt-grid">
        {CITIES.map(city => <CityCard key={city.id} city={city} instant={instant} />)}
      </div>
    </>
  )
}
