'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { KPOP_EVENTS, type KpopEvent } from '@/data/kpopEvents'
import { VENUE_QUICK_GUIDES, type VenueKey } from '@/data/venueQuickGuides'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const lastDay = (e: KpopEvent) => e.endDate ?? e.date
const ymd = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
const shortDate = (date: string) => date.slice(5).replace('-', '.')
const dateRange = (e: KpopEvent) => e.endDate ? `${shortDate(e.date)} - ${shortDate(e.endDate)}` : shortDate(e.date)
const seoulToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date())

function EventCard({ event, onQuickGuide }: { event: KpopEvent; onQuickGuide: (key: VenueKey) => void }) {
  const soldOut = event.status === 'Sold Out'
  const quickKey = !event.guideSlug && event.venueKey && VENUE_QUICK_GUIDES[event.venueKey] ? event.venueKey : null
  const hasGuideButton = !!event.guideSlug || !!quickKey
  return (
    <article className="kp-card">
      <div className="kp-top">
        <p className="kp-date notranslate" translate="no">{dateRange(event)}</p>
        <div className="kp-info">
          <p className={`kp-status${soldOut ? ' is-out' : ''}`}>{event.status}</p>
          <h3 className="kp-artist notranslate" translate="no">{event.artist}</h3>
          <p className="kp-title notranslate" translate="no">{event.title}</p>
          <p className="kp-venue">{event.venue}</p>
        </div>
      </div>
      <div className={`kp-actions${hasGuideButton ? '' : ' is-single'}`}>
        <a className="kp-btn is-primary" href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
          {soldOut ? 'Check Availability' : 'Buy Tickets (Global)'} <span aria-hidden="true">↗</span>
        </a>
        {event.guideSlug
          ? <a className="kp-btn" href={event.guideSlug}>Venue &amp; Survival Guide</a>
          : quickKey && <button type="button" className="kp-btn" onClick={() => onQuickGuide(quickKey)}>Venue &amp; Survival Guide</button>}
      </div>
    </article>
  )
}

function QuickGuideModal({ venueKey, onClose }: { venueKey: VenueKey; onClose: () => void }) {
  const guide = VENUE_QUICK_GUIDES[venueKey]

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  if (!guide) return null
  return (
    <div className="kp-quick-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="kp-quick" role="dialog" aria-modal="true" aria-labelledby="kp-quick-title">
        <p className="kp-quick-eyebrow">Venue Quick Guide</p>
        <h2 id="kp-quick-title" className="notranslate" translate="no">{guide.name}</h2>
        <p className="kp-quick-location">{guide.location}</p>
        <ul>
          <li><span aria-hidden="true">🚇</span><div><strong>Subway</strong>{guide.subway}</div></li>
          <li><span aria-hidden="true">🛅</span><div><strong>Lockers</strong>{guide.lockers}</div></li>
          <li><span aria-hidden="true">⚠️</span><div><strong>Exit Pro-Tip</strong>{guide.exitTip}</div></li>
        </ul>
        <div className="kp-quick-actions">
          {guide.fullGuide && <a className="kp-btn" href={guide.fullGuide}>Read the full guide</a>}
          <button type="button" className="kp-btn is-primary" autoFocus onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export function KpopCalendar() {
  // 지난 공연을 빼는 기준일은 하이드레이션 뒤에 정한다(빌드 시점 날짜로 굳으면 안 된다)
  const [today, setToday] = useState<string | null>(null)
  const [month, setMonth] = useState({ year: Number(KPOP_EVENTS[0].date.slice(0, 4)), month: Number(KPOP_EVENTS[0].date.slice(5, 7)) - 1 })
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [quickGuide, setQuickGuide] = useState<VenueKey | null>(null)
  const closeQuickGuide = useCallback(() => setQuickGuide(null), [])

  useEffect(() => {
    const now = seoulToday()
    /* eslint-disable react-hooks/set-state-in-effect -- 오늘 날짜는 하이드레이션 뒤에만 읽을 수 있다 */
    setToday(now)
    setMonth({ year: Number(now.slice(0, 4)), month: Number(now.slice(5, 7)) - 1 })
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  const upcoming = useMemo(
    () => KPOP_EVENTS.filter(e => !today || lastDay(e) >= today).sort((a, b) => a.date.localeCompare(b.date)),
    [today],
  )
  const onDay = (day: string) => upcoming.filter(e => day >= e.date && day <= lastDay(e))
  const shown = selectedDay ? onDay(selectedDay) : upcoming

  const cells = useMemo(() => {
    const blanks = new Date(Date.UTC(month.year, month.month, 1)).getUTCDay()
    const days = new Date(Date.UTC(month.year, month.month + 1, 0)).getUTCDate()
    return [...Array<null>(blanks).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  }, [month])

  const moveMonth = (delta: number) => {
    setSelectedDay(null)
    setMonth(m => {
      const d = new Date(Date.UTC(m.year, m.month + delta, 1))
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() }
    })
  }

  return (
    <>
      <style>{`
        .tl-wrap.kp-wrap { max-width: 1040px; }
        .kp-layout { display: block; }
        .kp-calendar { display: none; }
        .kp-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
        .kp-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
        .kp-top { display: flex; gap: 14px; }
        .kp-date { flex: 0 0 62px; margin: 0; font-size: 16px; font-weight: 800; line-height: 1.3; color: #C8102E; }
        .kp-info { min-width: 0; }
        .kp-status { margin: 0 0 2px; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #6B7280; }
        .kp-status.is-out { color: #C8102E; }
        .kp-artist { margin: 0; font-size: 18px; font-weight: 700; line-height: 1.3; color: #111827; overflow-wrap: anywhere; }
        .kp-title, .kp-venue { margin: 2px 0 0; font-size: 14px; line-height: 1.45; color: #4B5563; overflow-wrap: anywhere; }
        .kp-actions { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; margin-top: 16px; }
        .kp-btn {
          display: flex; align-items: center; justify-content: center; gap: 6px; min-height: 44px; padding: 10px 14px; box-sizing: border-box;
          border: 1px solid #D1D5DB; border-radius: 10px; background: #fff; color: #374151; text-decoration: none; text-align: center;
          font: 700 14px "DM Sans", Inter, system-ui, sans-serif; transition: background .15s;
        }
        .kp-btn.is-primary { background: #111827; border-color: #111827; color: #fff; }
        .kp-btn:focus-visible, .kp-nav:focus-visible, .kp-day:focus-visible, .kp-clear:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        @media (hover: hover) {
          .kp-btn:hover { background: #F9FAFB; }
          .kp-btn.is-primary:hover { background: #1F2937; }
        }
        .kp-empty { background: #fff; border: 1px dashed #D1D5DB; border-radius: 16px; padding: 24px; font-size: 14px; color: #4B5563; margin: 0; }
        .kp-note { margin-top: 20px; }

        .kp-actions.is-single { grid-template-columns: minmax(0, 1fr) !important; }
        button.kp-btn { cursor: pointer; width: 100%; }
        .kp-quick-overlay { position: fixed; inset: 0; z-index: 300; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(17,24,39,.55); }
        .kp-quick { box-sizing: border-box; width: 100%; max-width: 440px; max-height: calc(100dvh - 32px); overflow-y: auto; overscroll-behavior: contain; background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
        .kp-quick-eyebrow { margin: 0 0 6px; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #C8102E; }
        .kp-quick h2 { margin: 0; font-size: 22px; font-weight: 700; color: #111827; }
        .kp-quick-location { margin: 2px 0 16px; font-size: 14px; color: #4B5563; }
        .kp-quick ul { list-style: none; margin: 0; padding: 0; }
        .kp-quick li { display: flex; gap: 10px; padding: 12px 0; border-top: 1px solid #F3F4F6; font-size: 14px; line-height: 1.5; color: #374151; }
        .kp-quick li strong { display: block; color: #111827; font-weight: 700; }
        .kp-quick-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 14px; }
        @media (max-width: 767px) { .tl-wrap.kp-wrap { padding-left: 16px; padding-right: 16px; } }
        @media (min-width: 640px) {
          .kp-actions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (min-width: 768px) {
          .kp-layout { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 24px; align-items: start; }
          .kp-calendar { display: block; position: sticky; top: 76px; background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
          .kp-card { padding: 20px; }
          .kp-date { flex-basis: 76px; }
        }
        .kp-month { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .kp-month h2 { font-size: 16px; font-weight: 700; margin: 0; color: #111827; }
        .kp-nav { width: 36px; height: 36px; border: 1px solid #E5E7EB; border-radius: 10px; background: #fff; color: #111827; font-size: 16px; cursor: pointer; }
        .kp-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 2px; text-align: center; }
        .kp-weekday { font-size: 11px; font-weight: 700; color: #6B7280; padding: 4px 0; }
        .kp-day { position: relative; height: 36px; border: 0; border-radius: 8px; background: none; font: 500 13px "DM Sans", Inter, system-ui, sans-serif; color: #9CA3AF; }
        .kp-day.has-event { color: #111827; font-weight: 700; cursor: pointer; background: #FBEFEA; }
        .kp-day.is-today { box-shadow: inset 0 0 0 1px #9CA3AF; }
        .kp-day[aria-pressed="true"] { background: #111827; color: #fff; }
        .kp-clear { display: block; width: 100%; min-height: 40px; margin-top: 10px; border: 0; background: none; font: 600 13px "DM Sans", Inter, system-ui, sans-serif; color: #C8102E; cursor: pointer; }
      `}</style>

      <div className="kp-layout">
        <aside className="kp-calendar" aria-label="Concert calendar">
          <div className="kp-month">
            <button type="button" className="kp-nav" aria-label="Previous month" onClick={() => moveMonth(-1)}>‹</button>
            <h2 key={`${month.year}-${month.month}`} className="notranslate" translate="no">{MONTHS[month.month]} {month.year}</h2>
            <button type="button" className="kp-nav" aria-label="Next month" onClick={() => moveMonth(1)}>›</button>
          </div>
          <div className="kp-grid notranslate" translate="no">
            {WEEKDAYS.map((d, i) => <span key={i} className="kp-weekday">{d}</span>)}
            {cells.map((day, i) => {
              if (day === null) return <span key={`blank-${i}`} />
              const key = ymd(month.year, month.month, day)
              const count = onDay(key).length
              return (
                <button key={key} type="button" className={`kp-day${count ? ' has-event' : ''}${key === today ? ' is-today' : ''}`} disabled={!count}
                  aria-pressed={selectedDay === key} aria-label={`${MONTHS[month.month]} ${day}, ${count} events`}
                  onClick={() => setSelectedDay(v => v === key ? null : key)}>
                  {day}
                </button>
              )
            })}
          </div>
          {selectedDay && <button type="button" className="kp-clear" onClick={() => setSelectedDay(null)}>Show all upcoming</button>}
        </aside>

        {/* key: 자동 번역이 글자 노드를 바꿔 끼우므로 목록이 바뀌면 새로 그린다 */}
        <div key={selectedDay ?? 'all'} className="kp-list">
          {shown.length > 0
            ? shown.map(e => <EventCard key={e.id} event={e} onQuickGuide={setQuickGuide} />)
            : <p className="kp-empty">No upcoming events listed. New dates are added as they&apos;re announced.</p>}
        </div>
      </div>

      {quickGuide && <QuickGuideModal venueKey={quickGuide} onClose={closeQuickGuide} />}

      <p className="tl-note kp-note">
        Dates and venues were checked on November 8, 2026 and can change, so confirm with the organizer before you book or travel. &quot;Upcoming&quot; means the date is listed;
        it doesn&apos;t mean tickets are on sale. Ticket buttons open the show page where we&apos;ve confirmed one, and otherwise the NOL World K-pop listing. Not every show is sold there.
        Sources:{' '}
        <a href="https://www.soompi.com/article/1797016wpp/2026-k-pop-tour-masterlist-concerts-fan-meetings-and-more" rel="noopener noreferrer" target="_blank">Soompi</a>,{' '}
        <a href="https://www.koreatimes.co.kr/entertainment/k-pop/20261014/mma2026-brings-26-k-pop-acts-to-gocheok-dome-for-2-night-spectacle" rel="noopener noreferrer" target="_blank">The Korea Times</a>,{' '}
        <a href="https://sports.khan.co.kr/en/article/202610110728007" rel="noopener noreferrer" target="_blank">Sports Kyunghyang</a>,{' '}
        <a href="https://www.slist.kr/news/articleView.html?idxno=777842" rel="noopener noreferrer" target="_blank">Singlelist</a>.
      </p>
    </>
  )
}
