'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getActivityByDate } from '@/lib/srs/storage'
import { type ScheduledDay } from '@/lib/srs/engine'
import { useT } from '@/hooks/useT'

type DayData = {
  iso:       string
  dom:       number
  count:     number
  scheduled: ScheduledDay | null
  isToday:   boolean
  future:    boolean
}

const MONTHS    = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_LABELS = ['M','T','W','T','F','S','S']

function buildMonth(
  year: number,
  month: number,
  counts: Record<string, number>,
  futureSchedule: Record<string, ScheduledDay>,
): (DayData | null)[][] {
  const today    = new Date(); today.setHours(0, 0, 0, 0)
  const startDow = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (DayData | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const date  = new Date(year, month, d)
    const iso   = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isFuture = date.getTime() > today.getTime()
    cells.push({
      iso,
      dom:       d,
      count:     isFuture ? 0 : (counts[iso] ?? 0),
      scheduled: isFuture ? (futureSchedule[iso] ?? null) : null,
      isToday:   date.getTime() === today.getTime(),
      future:    isFuture,
    })
  }
  const weeks: (DayData | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    const w = cells.slice(i, i + 7)
    while (w.length < 7) w.push(null)
    weeks.push(w)
  }
  return weeks
}

function cellBg(day: DayData | null, selected: boolean): React.CSSProperties {
  if (!day)        return { background: 'transparent' }
  if (selected)    return { background: 'var(--pa)' }
  if (day.future)  return { background: 'transparent' }
  if (day.count === 0) return { background: 'transparent', border: '1px solid var(--pd)' }
  if (day.count <= 2)  return { background: 'var(--ph1)' }
  if (day.count <= 5)  return { background: 'var(--ph2)' }
  return { background: 'var(--ph3)' }
}

function cellTextColor(day: DayData | null, selected: boolean): string {
  if (!day)             return 'transparent'
  if (selected)         return '#fff'
  if (day.future)       return 'var(--pm2)'
  if (day.count === 0)  return 'var(--pm2)'
  if (day.count <= 2)   return 'var(--pt2)'
  return '#fff'
}

type Props = {
  onDaySelect?:    (iso: string) => void
  selectedIso?:    string | null
  futureSchedule?: Record<string, ScheduledDay>
  streak?:         number
}

export function LearningCalendar({ onDaySelect, selectedIso, futureSchedule = {}, streak = 0 }: Props) {
  const t   = useT()
  const now = new Date()
  const [year,   setYear]   = useState(now.getFullYear())
  const [month,  setMonth]  = useState(now.getMonth())
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => { setCounts(getActivityByDate()) }, [])

  const weeks = useMemo(
    () => buildMonth(year, month, counts, futureSchedule),
    [year, month, counts, futureSchedule],
  )

  const todayObj        = new Date()
  const isCurrentMonth  = year === todayObj.getFullYear() && month === todayObj.getMonth()

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
  }
  function next() {
    if (isCurrentMonth) return
    if (month === 11)   { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
  }

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-5">
        <button type="button" onClick={prev} aria-label="이전 달"
          className="p-1 text-[var(--pm)] hover:text-[var(--pa)] transition-colors cursor-pointer">
          <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <p className="text-[13px] font-bold text-[var(--pt)] tracking-wide">{MONTHS[month]} {year}</p>
        <button type="button" onClick={next} disabled={isCurrentMonth} aria-label="다음 달"
          className={`p-1 transition-colors cursor-pointer ${isCurrentMonth ? 'text-[var(--pd)] cursor-not-allowed' : 'text-[var(--pm)] hover:text-[var(--pa)]'}`}>
          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-[var(--pt2)]">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="space-y-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1.5">
            {week.map((day, di) => {
              const isSelected = !!day && day.iso === selectedIso
              const tappable     = !!day && !day.future && day.count > 0 && !!onDaySelect
              const hasScheduled = !!day && day.future && !!day.scheduled && day.scheduled.count > 0
              return (
                <div
                  key={di}
                  title={
                    day
                      ? day.future && hasScheduled
                        ? `${day.iso} · 복습 예정 ${day.scheduled!.count}개`
                        : `${day.iso} · ${day.count}회`
                      : undefined
                  }
                  role={tappable ? 'button' : undefined}
                  tabIndex={tappable ? 0 : undefined}
                  onClick={tappable ? () => onDaySelect?.(day.iso) : undefined}
                  onKeyDown={tappable ? e => { if (e.key === 'Enter' || e.key === ' ') onDaySelect?.(day!.iso) } : undefined}
                  className={[
                    'rounded-md flex flex-col items-start justify-start p-1',
                    day?.isToday && !isSelected ? 'ring-2 ring-[var(--pa)] ring-offset-1 ring-offset-[var(--pb)]' : '',
                    tappable ? 'cursor-pointer' : '',
                  ].join(' ')}
                  style={{ ...cellBg(day, isSelected), minHeight: 44 }}
                >
                  {day && (
                    <>
                      <span
                        className="text-[9px] leading-none font-bold"
                        style={{ color: cellTextColor(day, isSelected) }}
                      >
                        {day.dom}
                      </span>
                      {hasScheduled && !isSelected && (
                        <span
                          style={{
                            display: 'block',
                            width: 4, height: 4,
                            borderRadius: '50%',
                            background: 'var(--pa)',
                            opacity: 0.55,
                            marginTop: 'auto',
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Bottom row: Streak (left) + Legend (right) */}
      <div className="flex items-center justify-between mt-4">
        {/* Streak */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 13, lineHeight: 1 }}>🔥</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: streak > 0 ? '#C0541A' : 'var(--pm2)', lineHeight: 1 }}>
            {streak > 0 ? `${streak} Days` : '0 Days'}
          </span>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[var(--pm2)]">Less</span>
          <div className="w-3 h-3 rounded-sm" style={{ background: 'transparent', border: '1px solid var(--pd)' }} />
          {(['var(--ph1)', 'var(--ph2)', 'var(--ph3)'] as const).map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
          ))}
          <span className="text-[9px] text-[var(--pm2)]">More</span>
          <span className="text-[9px] text-[var(--pm2)] ml-1">·</span>
          <span
            style={{
              display: 'inline-block', width: 5, height: 5,
              borderRadius: '50%', background: 'var(--pa)', opacity: 0.55,
            }}
          />
          <span className="text-[9px] text-[var(--pm2)]">복습예정</span>
        </div>
      </div>
    </div>
  )
}
