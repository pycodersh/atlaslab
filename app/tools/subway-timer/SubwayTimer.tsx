'use client'

import { useEffect, useState } from 'react'

const WINDOW_MS = 15 * 60 * 1000
const MINUTE_MS = 60 * 1000
const STORAGE_KEY = 'atlas_subway_timer_end'

function readEnd(): number | null {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY))
    return Number.isFinite(value) && value > 0 ? value : null
  } catch { return null }
}

function writeEnd(end: number | null) {
  try {
    if (end === null) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, String(end))
  } catch { /* 저장이 막힌 브라우저에서는 이 화면에서만 동작한다 */ }
}

function clock(ms: number) {
  const seconds = Math.ceil(ms / 1000)
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

function timeOfDay(ts: number) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const R = 92
const CIRCUMFERENCE = 2 * Math.PI * R

export function SubwayTimer() {
  // 남은 시간은 저장된 종료 시각에서 매번 계산한다 — 화면이 꺼져 interval 이 멈춰도 어긋나지 않는다
  const [end, setEnd] = useState<number | null>(null)
  const [now, setNow] = useState(0)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- localStorage 와 현재 시각은 하이드레이션 뒤에만 읽을 수 있다 */
    setEnd(readEnd())
    setNow(Date.now())
    /* eslint-enable react-hooks/set-state-in-effect */
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [])

  const update = (next: number | null) => {
    writeEnd(next)
    setEnd(next)
    setNow(Date.now())
  }

  const remaining = end === null ? WINDOW_MS : Math.max(end - now, 0)
  const running = end !== null && remaining > 0
  const expired = end !== null && remaining === 0
  const dash = CIRCUMFERENCE * (remaining / WINDOW_MS)

  return (
    <section className="tl-card st-card" aria-label="Re-entry countdown">
      <style>{`
        .st-card { text-align: center; }
        .st-ring { position: relative; width: 220px; height: 220px; margin: 4px auto 18px; }
        .st-ring svg { display: block; transform: rotate(-90deg); }
        .st-time { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 52px; font-weight: 700; font-variant-numeric: tabular-nums; color: #111827; }
        .st-status { font-size: 17px; font-weight: 700; margin: 0 0 18px; color: #111827; min-height: 24px; }
        .st-status.is-expired { color: #C8102E; }
        .st-card .tl-actions { justify-content: center; }
      `}</style>
      <div className="st-ring">
        <svg width="220" height="220" viewBox="0 0 220 220" aria-hidden="true">
          <circle cx="110" cy="110" r={R} fill="none" stroke="#F3F4F6" strokeWidth="12" />
          <circle cx="110" cy="110" r={R} fill="none" stroke="#C8102E" strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRCUMFERENCE}`} />
        </svg>
        <div className="st-time notranslate" translate="no" role="timer">{clock(remaining)}</div>
      </div>

      <p className={`st-status${expired ? ' is-expired' : ''}`} aria-live="polite">
        {running && end !== null && <>Re-enter before <span className="notranslate" translate="no">{timeOfDay(end)}</span></>}
        {expired && 'Time is up. Tapping in now will likely charge a new fare.'}
        {end === null && 'Start right after you tap out.'}
      </p>

      <div className="tl-actions">
        {end === null && <button type="button" className="tl-btn" onClick={() => update(Date.now() + WINDOW_MS)}>Start 15:00</button>}
        {running && end !== null && <button type="button" className="tl-btn tl-btn-ghost" onClick={() => update(end - MINUTE_MS)}>Started late: −1 min</button>}
        {end !== null && <button type="button" className="tl-btn tl-btn-ghost" onClick={() => update(null)}>Reset</button>}
      </div>
    </section>
  )
}
