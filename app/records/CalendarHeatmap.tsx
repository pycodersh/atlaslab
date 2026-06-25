'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type DayData = { iso: string; count: number; isToday: boolean; future: boolean }

function buildMonth(
  year: number,
  month: number,
  studyCounts: Record<string, number>
): (DayData | null)[][] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const firstDay = new Date(year, month, 1)
  // 0=Sun→6, shift to Mon=0
  const startDow = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (DayData | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const iso = date.toISOString().slice(0, 10)
    cells.push({
      iso,
      count: studyCounts[iso] ?? 0,
      isToday: date.getTime() === today.getTime(),
      future: date.getTime() > today.getTime(),
    })
  }

  // chunk into weeks
  const weeks: (DayData | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    const w = cells.slice(i, i + 7)
    while (w.length < 7) w.push(null)
    weeks.push(w)
  }
  return weeks
}

function cellColor(day: DayData | null): string {
  if (!day || day.future) return 'bg-transparent'
  if (day.count === 0) return 'bg-[#EDE5DC]'
  if (day.count <= 2) return 'bg-[#C9799A]'
  if (day.count <= 5) return 'bg-[#A6385E]'
  return 'bg-[#8B2246]'
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function CalendarHeatmap({ studyCounts }: { studyCounts: Record<string, number> }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function next() {
    const today = new Date()
    if (year > today.getFullYear() || (year === today.getFullYear() && month >= today.getMonth())) return
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const today = new Date()
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  const weeks = buildMonth(year, month, studyCounts)

  // count studied days this month
  const studiedThisMonth = Object.keys(studyCounts).filter(
    iso => iso.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
  ).length

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-5">
        <button type="button" onClick={prev} className="p-1 text-[#9B9490] hover:text-[#8B2246] transition-colors cursor-pointer">
          <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <div className="text-center">
          <p className="text-[13px] font-bold text-[#1A1A1A] tracking-wide">
            {MONTHS[month]} {year}
          </p>
          <p className="text-[10px] text-[#9B9490] mt-0.5">{studiedThisMonth} days studied</p>
        </div>
        <button
          type="button"
          onClick={next}
          disabled={isCurrentMonth}
          className={`p-1 transition-colors cursor-pointer ${isCurrentMonth ? 'text-[#E0D8D2] cursor-not-allowed' : 'text-[#9B9490] hover:text-[#8B2246]'}`}
        >
          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-[#C8BFB5]">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="space-y-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1.5">
            {week.map((day, di) => (
              <div
                key={di}
                title={day?.iso}
                className={[
                  'aspect-square rounded-md',
                  cellColor(day),
                  day?.isToday ? 'ring-2 ring-[#8B2246] ring-offset-1 ring-offset-[#FAF8F4]' : '',
                ].join(' ')}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-[9px] text-[#C8BFB5]">Less</span>
        {['bg-[#EDE5DC]', 'bg-[#C9799A]', 'bg-[#A6385E]', 'bg-[#8B2246]'].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span className="text-[9px] text-[#C8BFB5]">More</span>
      </div>
    </div>
  )
}
