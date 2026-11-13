'use client'

import { useEffect, useState } from 'react'
import { HOLIDAY_YEARS, KOREA_HOLIDAYS, SCHOOL_SEASONS, lastDayOf, type Holiday, type HolidayImpact } from '@/data/koreaHolidays'

type Filter = 'upcoming' | 'year' | 'major'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming Holidays' },
  { id: 'year', label: 'Full Year' },
  { id: 'major', label: 'Major Shutdowns Only' },
]
const UPCOMING_COUNT = 6

const IMPACT: Record<HolidayImpact, { label: string; fg: string; dot: string }> = {
  'major-shutdown': { label: 'Major Shutdown', fg: '#E11D48', dot: '#F43F5E' },
  crowded: { label: 'Crowded', fg: '#D97706', dot: '#F59E0B' },
  normal: { label: 'Normal Operations', fg: '#059669', dot: '#10B981' },
}

// 날짜 문자열은 달력 날짜 그대로 읽는다 — 방문자의 시간대를 타면 하루가 밀린다
const parts = (iso: string) => new Date(`${iso}T00:00:00Z`)
const fmt = (iso: string, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options }).format(parts(iso))
const monthDay = (iso: string) => fmt(iso, { month: 'short', day: 'numeric' })

// 'Fri, Jan 1, 2027' · 연휴는 'Feb 6–8, 2027' · 대체공휴일은 뒤에 한 줄로 잇는다
function whenLabel({ date, endDate, substitute }: Holiday) {
  const year = parts(date).getUTCFullYear()
  const span = !endDate ? `${fmt(date, { weekday: 'short' })}, ${monthDay(date)}`
    : `${monthDay(date)}–${date.slice(0, 7) === endDate.slice(0, 7) ? parts(endDate).getUTCDate() : monthDay(endDate)}`
  return `${span}, ${year}${substitute ? ` · Substitute: ${monthDay(substitute)}` : ''}`
}
const seoulToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date())

function HolidayCard({ holiday, past }: { holiday: Holiday; past: boolean }) {
  const impact = IMPACT[holiday.impact]
  const start = parts(holiday.date)
  const days = holiday.endDate ? `${start.getUTCDate()}–${parts(holiday.endDate).getUTCDate()}` : String(start.getUTCDate())
  return (
    <article className={`hc-card${past ? ' is-past' : ''}`}>
      <div className="hc-date notranslate" translate="no" aria-hidden="true">
        <span className="hc-month">{fmt(holiday.date, { month: 'short' })}</span>
        <span className={`hc-day${holiday.endDate ? ' is-range' : ''}`}>{days}</span>
      </div>
      <div className="hc-body">
        <div className="hc-head">
          <div className="hc-titles">
            <h3 className="hc-name notranslate" translate="no">{holiday.name}</h3>
            <p className="hc-ko notranslate" translate="no" lang="ko">{holiday.koreanName}</p>
          </div>
          <span className="hc-tag notranslate" translate="no" style={{ color: impact.fg }}><i style={{ background: impact.dot }} />{impact.label}</span>
        </div>
        <p className="hc-when notranslate" translate="no">{whenLabel(holiday)}</p>
        <p className="hc-tip">{holiday.travelTip}</p>
      </div>
    </article>
  )
}

export function KoreaHolidayModal() {
  const [filter, setFilter] = useState<Filter>('upcoming')
  const [today, setToday] = useState('')
  const [year, setYear] = useState(HOLIDAY_YEARS[0])

  useEffect(() => {
    const now = seoulToday()
    /* eslint-disable react-hooks/set-state-in-effect -- 오늘 날짜는 하이드레이션 뒤에만 읽을 수 있다 */
    setToday(now)
    // 전체 보기는 남은 휴일이 더 많은 해를 먼저 보여 준다
    const left = (y: number) => KOREA_HOLIDAYS.filter(h => h.date.startsWith(String(y)) && lastDayOf(h) >= now).length
    setYear(HOLIDAY_YEARS.reduce((best, y) => (left(y) > left(best) ? y : best)))
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  const ahead = KOREA_HOLIDAYS.filter(h => lastDayOf(h) >= today)
  const list = filter === 'upcoming' ? ahead.slice(0, UPCOMING_COUNT)
    : filter === 'major' ? ahead.filter(h => h.impact === 'major-shutdown')
      : KOREA_HOLIDAYS.filter(h => h.date.startsWith(String(year)))

  return (
    <>
      <style>{`
        .tl-wrap.hc-wrap { max-width: 768px; }
        .hc-root { max-width: 768px; margin: 0 auto; }
        .hc-filters { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 12px; }
        .hc-filter { min-height: 48px; padding: 6px; border: 1px solid #E5E7EB; border-radius: 12px; background: #fff; color: #374151; cursor: pointer; font: 600 13px/1.25 "DM Sans", Inter, system-ui, sans-serif; }
        .hc-filter[aria-selected="true"] { background: #111827; border-color: #111827; color: #fff; }
        .hc-years { display: flex; gap: 8px; margin-bottom: 12px; }
        .hc-year { min-width: 72px; min-height: 44px; padding: 6px 12px; border: 1px solid #E5E7EB; border-radius: 10px; background: #fff; color: #374151; cursor: pointer; font: 600 13px "DM Sans", Inter, system-ui, sans-serif; }
        .hc-year[aria-pressed="true"] { background: #C8102E; border-color: #C8102E; color: #fff; }
        .hc-filter:focus-visible, .hc-year:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        .hc-list { display: flex; flex-direction: column; gap: 12px; min-height: 240px; margin-bottom: 16px; }
        .hc-card { display: flex; gap: 16px; padding: 16px; background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
        .hc-card.is-past { background: #F9FAFB; box-shadow: none; }
        .hc-date { flex: none; display: flex; flex-direction: column; align-items: center; justify-content: center; align-self: flex-start; width: 68px; height: 72px; border-radius: 14px; background: linear-gradient(135deg, #F43F5E, #DC2626); color: #fff; }
        .hc-card.is-past .hc-date { background: #6B7280; }
        .hc-month { font: 700 11px "DM Sans", Inter, system-ui, sans-serif; letter-spacing: .1em; text-transform: uppercase; }
        .hc-day { font: 800 28px/1.1 "DM Sans", Inter, system-ui, sans-serif; }
        .hc-day.is-range { font-size: 20px; line-height: 1.5; }
        .hc-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
        .hc-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
        .hc-titles { min-width: 0; }
        .hc-name { margin: 0; font-family: "Playfair Display", Georgia, serif; font-size: 18px; font-weight: 700; line-height: 1.25; color: #111827; }
        .hc-ko { margin: 1px 0 0; font-family: Pretendard, "DM Sans", system-ui, sans-serif; font-size: 13px; font-weight: 500; color: #6B7280; }
        .hc-when { margin: 0; font-size: 12px; color: #64748B; }
        .hc-tag { flex: none; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; line-height: 1.5; white-space: nowrap; }
        .hc-tag i { flex: none; width: 6px; height: 6px; border-radius: 50%; }
        .hc-tip { margin: 2px 0 0; padding: 2px 0 2px 10px; border-left: 2px solid #E2E8F0; font-size: 12px; line-height: 1.625; color: #64748B; }
        .hc-seasons { padding: 16px; background: rgba(238,242,255,.7); border: 1px solid #E0E7FF; border-radius: 16px; margin-bottom: 12px; }
        .hc-seasons h3 { margin: 0 0 2px; font-family: "Playfair Display", Georgia, serif; font-size: 18px; font-weight: 700; color: #1E1B4B; }
        .hc-seasons-lead { margin: 0 0 12px; font-size: 13px; color: #4338CA; }
        .hc-season { padding: 14px; background: #fff; border: 1px solid #E0E7FF; border-radius: 12px; }
        .hc-season + .hc-season { margin-top: 8px; }
        .hc-season-top { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 2px 10px; }
        .hc-season-name { margin: 0; font-size: 15px; font-weight: 700; color: #111827; }
        .hc-season-name span { margin-left: 6px; font-family: Pretendard, "DM Sans", system-ui, sans-serif; font-size: 13px; font-weight: 500; color: #6B7280; }
        .hc-season-period { font-size: 12px; font-weight: 700; color: #4338CA; }
        .hc-season p { margin: 6px 0 0; font-size: 13px; line-height: 1.5; color: #374151; }
        .hc-season p strong { color: #111827; }
        .hc-notes { padding: 16px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; margin-bottom: 14px; }
        .hc-notes h3 { margin: 0 0 8px; font-size: 15px; font-weight: 700; color: #0F172A; }
        .hc-notes ul { margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.55; color: #334155; }
        .hc-notes li + li { margin-top: 6px; }
        .hc-notes strong { color: #0F172A; }
        /* 폰은 뱃지가 제목 칸을 눌러 긴 이름이 넘치므로 제목 아래로 내린다 */
        @media (max-width: 479px) { .hc-head { flex-direction: column; gap: 4px; } .hc-card { gap: 12px; padding: 14px; } .hc-date { width: 60px; height: 66px; } .hc-day { font-size: 25px; } .hc-day.is-range { font-size: 18px; } }
      `}</style>

      <div className="hc-root">
        <div className="hc-filters" role="tablist" aria-label="Filter holidays">
          {FILTERS.map(f => <button key={f.id} type="button" role="tab" className="hc-filter" aria-selected={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>)}
        </div>

        {filter === 'year' && (
          <div className="hc-years notranslate" translate="no" role="group" aria-label="Year">
            {HOLIDAY_YEARS.map(y => <button key={y} type="button" className="hc-year" aria-pressed={year === y} onClick={() => setYear(y)}>{y}</button>)}
          </div>
        )}

        {/* key: 자동 번역이 글자 노드를 바꿔 끼우므로 목록이 바뀌면 새로 그린다. 오늘 날짜를 알기 전에는 지난 휴일이 비치지 않게 비워 둔다 */}
        <div key={`${filter}-${year}`} className="hc-list" role="tabpanel">
          {today && list.map(h => <HolidayCard key={`${h.date}-${h.name}`} holiday={h} past={lastDayOf(h) < today} />)}
        </div>

        <section className="hc-seasons" aria-label="School Breaks and Campus Seasons">
          <h3>School Breaks &amp; Campus Seasons</h3>
          <p className="hc-seasons-lead">Typical seasons. Exact dates vary by school.</p>
          {SCHOOL_SEASONS.map(s => (
            <article key={s.name} className="hc-season">
              <div className="hc-season-top">
                <h4 className="hc-season-name"><b className="notranslate" translate="no">{s.name}</b><span className="notranslate" translate="no" lang="ko">{s.koreanName}</span></h4>
                <span className="hc-season-period">{s.period}</span>
              </div>
              <p>{s.impact}</p>
              <p><strong>Tip:</strong> {s.tip}</p>
            </article>
          ))}
        </section>

        <section className="hc-notes" aria-label="Essential Notes">
          <h3>Essential Notes</h3>
          <ul>
            <li><strong>Substitute holidays:</strong> when a holiday falls on a weekend, the next weekday usually becomes a day off. Seollal and Chuseok get one only when they overlap a Sunday, and New Year’s Day and Memorial Day get none.</li>
            <li><strong>KTX peak booking:</strong> Seollal and Chuseok tickets go on sale in a special advance window, so check Korail well before you travel.</li>
            <li><strong>Lunar dates:</strong> Seollal, Buddha’s Birthday and Chuseok move each year, so check the year shown on each card.</li>
          </ul>
        </section>

        {/* 날짜 기준일 · 출처 안내는 페이지의 About this tool 참고 문구로 옮겼다 */}
      </div>
    </>
  )
}
