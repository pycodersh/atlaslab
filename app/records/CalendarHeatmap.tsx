'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { StudyLog } from '@/lib/review/types'
import { getStudyLogsForDate, getStudyCountsByDate } from '@/lib/review/storage'

type DayData = { iso: string; count: number; isToday: boolean; future: boolean }

function buildMonth(year: number, month: number, studyCounts: Record<string, number>): (DayData | null)[][] {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const firstDay = new Date(year, month, 1)
  const startDow = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (DayData | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const iso = date.toISOString().slice(0, 10)
    cells.push({ iso, count: studyCounts[iso] ?? 0, isToday: date.getTime() === today.getTime(), future: date.getTime() > today.getTime() })
  }
  const weeks: (DayData | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    const w = cells.slice(i, i + 7); while (w.length < 7) w.push(null); weeks.push(w)
  }
  return weeks
}

function cellStyle(day: DayData | null): React.CSSProperties {
  if (!day || day.future) return { background: 'transparent' }
  if (day.count === 0) return { background: 'var(--ph0)' }
  if (day.count <= 2) return { background: 'var(--ph1)' }
  if (day.count <= 5) return { background: 'var(--ph2)' }
  return { background: 'var(--ph3)' }
}

function reviewLabel(n: number) { return n === 0 ? 'New' : `Review #${n}` }

function DayPopup({ iso, logs, onClose }: { iso: string; logs: StudyLog[]; onClose: () => void }) {
  const date = new Date(iso)
  const label = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const totalMin = logs.reduce((s, l) => s + l.studiedMinutes, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-2xl p-6 shadow-2xl pb-10"
        style={{ background: 'var(--pb)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-[11px] tracking-[0.2em] text-[var(--pa)] font-bold mb-1">STUDY LOG</p>
            <p className="font-playfair text-[1.1rem] font-bold text-[var(--pt)]">{label}</p>
          </div>
          <button type="button" onClick={onClose} className="text-[var(--pm2)] hover:text-[var(--pt)] transition-colors cursor-pointer p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {logs.length === 0 ? (
          <p className="text-[13px] text-[var(--pm)] text-center py-4">이 날은 학습 기록이 없어요.</p>
        ) : (
          <>
            {/* Total */}
            <div className="rounded-xl bg-[var(--pc)] px-4 py-3 mb-5 flex items-center justify-between">
              <p className="text-[11.5px] text-[var(--pm)] font-medium">총 학습시간</p>
              <p className="font-playfair text-[1.1rem] font-bold text-[var(--pa)]">{totalMin}분</p>
            </div>

            {/* Log list */}
            <p className="text-[9px] tracking-[0.2em] text-[var(--pm2)] font-semibold mb-3">완료한 학습</p>
            <div className="space-y-0">
              {logs.map((log, i) => (
                <div key={log.id}>
                  {i > 0 && <div className="h-px bg-[var(--pd)]" />}
                  <div className="py-3">
                    <p className="text-[10px] tracking-[0.1em] font-bold text-[var(--pm)] mb-0.5">
                      {log.contentType === 'story' ? 'Story' : 'Pattern Set'} {log.contentId.padStart(2, '0')} · {reviewLabel(log.reviewNumber)}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-semibold text-[var(--pt)]">{log.title}</p>
                      <p className="text-[11px] text-[var(--pm)] shrink-0 ml-2">{log.studiedMinutes}분</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_LABELS = ['M','T','W','T','F','S','S']

export function CalendarHeatmap({ studyCounts: serverCounts }: { studyCounts: Record<string, number> }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedLogs, setSelectedLogs] = useState<StudyLog[]>([])
  const [localCounts, setLocalCounts] = useState<Record<string, number>>(serverCounts)

  // Merge server counts with localStorage counts
  useEffect(() => {
    const ls = getStudyCountsByDate()
    const merged: Record<string, number> = { ...serverCounts }
    for (const [k, v] of Object.entries(ls)) {
      merged[k] = (merged[k] ?? 0) + v
    }
    setLocalCounts(merged)
  }, [serverCounts])

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
  }
  function next() {
    const today = new Date()
    if (year > today.getFullYear() || (year === today.getFullYear() && month >= today.getMonth())) return
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
  }

  function handleDayClick(day: DayData | null) {
    if (!day || day.future) return
    setSelectedDay(day.iso)
    setSelectedLogs(getStudyLogsForDate(day.iso))
  }

  const todayObj = new Date()
  const isCurrentMonth = year === todayObj.getFullYear() && month === todayObj.getMonth()
  const weeks = buildMonth(year, month, localCounts)
  const studiedThisMonth = Object.keys(localCounts).filter(
    iso => iso.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
      && (localCounts[iso] ?? 0) > 0
  ).length

  return (
    <>
      <div>
        {/* Month nav */}
        <div className="flex items-center justify-between mb-5">
          <button type="button" onClick={prev} className="p-1 text-[var(--pm)] hover:text-[var(--pa)] transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <div className="text-center">
            <p className="text-[13px] font-bold text-[var(--pt)] tracking-wide">{MONTHS[month]} {year}</p>
            <p className="text-[10px] text-[var(--pm)] mt-0.5">{studiedThisMonth} days studied</p>
          </div>
          <button type="button" onClick={next} disabled={isCurrentMonth}
            className={`p-1 transition-colors cursor-pointer ${isCurrentMonth ? 'text-[var(--pd)] cursor-not-allowed' : 'text-[var(--pm)] hover:text-[var(--pa)]'}`}>
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-medium text-[var(--pm2)]">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="space-y-1.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1.5">
              {week.map((day, di) => (
                <button
                  key={di}
                  type="button"
                  title={day?.iso}
                  onClick={() => handleDayClick(day)}
                  disabled={!day || day.future}
                  className={[
                    'aspect-square rounded-md transition-opacity',
                    day && !day.future ? 'cursor-pointer hover:opacity-75' : 'cursor-default',
                    day?.isToday ? 'ring-2 ring-[var(--pa)] ring-offset-1 ring-offset-[var(--pb)]' : '',
                  ].join(' ')}
                  style={cellStyle(day)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 justify-end">
          <span className="text-[9px] text-[var(--pm2)]">Less</span>
          {(['var(--ph0)','var(--ph1)','var(--ph2)','var(--ph3)'] as const).map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
          ))}
          <span className="text-[9px] text-[var(--pm2)]">More</span>
        </div>
      </div>

      {/* Day detail popup */}
      {selectedDay && (
        <DayPopup
          iso={selectedDay}
          logs={selectedLogs}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  )
}
