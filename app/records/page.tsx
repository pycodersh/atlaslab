import { BookOpen, Bookmark, Flame, Clock, Star } from 'lucide-react'

import { TopNav } from '@/components/TopNav'
import { createClient } from '@/lib/supabase/server'
import { getProgressStats } from '@/queries/progress'

export const dynamic = 'force-dynamic'

// ── Calendar helpers ──────────────────────────────────────────────────
function buildCalendar(studiedDates: string[]) {
  const dateSet = new Set(studiedDates)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Align to last Monday (ISO week: Mon=1)
  const dow = today.getDay() // 0=Sun
  const toMonday = dow === 0 ? 6 : dow - 1
  const lastMonday = new Date(today.getTime() - toMonday * 86400000)

  // Build 5 weeks × 7 days starting from 4 weeks before lastMonday
  const startDate = new Date(lastMonday.getTime() - 4 * 7 * 86400000)
  const weeks: { iso: string; studied: boolean; isToday: boolean; future: boolean }[][] = []

  for (let w = 0; w < 5; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate.getTime() + (w * 7 + d) * 86400000)
      const iso = date.toISOString().slice(0, 10)
      week.push({
        iso,
        studied: dateSet.has(iso),
        isToday: date.getTime() === today.getTime(),
        future: date.getTime() > today.getTime(),
      })
    }
    weeks.push(week)
  }
  return weeks
}

function CalendarGrid({ studiedDates }: { studiedDates: string[] }) {
  const weeks = buildCalendar(studiedDates)
  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div>
      {/* Day labels */}
      <div className="flex gap-1.5 mb-2">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="w-7 text-center text-[11px] text-[#C8BFB5] font-medium">
            {d}
          </div>
        ))}
      </div>
      {/* Week rows */}
      {weeks.map((week, wi) => (
        <div key={wi} className="flex gap-1.5 mb-1.5">
          {week.map((day) => (
            <div
              key={day.iso}
              title={day.iso}
              className={[
                'w-7 h-7 rounded-full',
                day.future
                  ? 'bg-transparent'
                  : day.studied
                  ? 'bg-[#8B2246]'
                  : 'bg-[#EDE5DC]',
                day.isToday && !day.studied
                  ? 'ring-1 ring-[#8B2246] ring-offset-1'
                  : '',
              ].join(' ')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Stat row ─────────────────────────────────────────────────────────
function StatRow({
  label,
  value,
  sub,
  icon: Icon,
  barPct,
}: {
  label: string
  value: string
  sub?: string
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
  barPct?: number
}) {
  return (
    <div className="py-6 border-b border-[#EDE5DC]">
      <div className="flex items-start justify-between mb-1">
        <p className="text-[10px] tracking-[0.28em] text-[#8B2246] font-semibold">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-[#C8BFB5] mt-0.5" strokeWidth={1.6} />}
      </div>
      <p className="font-playfair text-[2.6rem] font-bold text-[#1A1A1A] leading-none mt-2">
        {value}
      </p>
      {sub && <p className="text-base text-[#9B9490] mt-1.5">{sub}</p>}
      {barPct !== undefined && (
        <div className="mt-3 h-[2px] bg-[#EDE5DC] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#8B2246] rounded-full"
            style={{ width: `${barPct}%` }}
          />
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────
export default async function RecordsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const stats = user
    ? await getProgressStats(user.id)
    : {
        completedStories: 0,
        totalPatternsSeen: 0,
        totalReviewCount: 0,
        favoritesCount: 0,
        studiedDates: [] as string[],
      }

  const { count: totalStories } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const total = totalStories ?? 100
  const totalPatterns = total * 5
  const studyHours = Math.round((stats.totalReviewCount * 3) / 60)

  // Streak
  const streakDays = (() => {
    const dates = [...(stats.studiedDates ?? [])].sort().reverse()
    if (!dates.length) return 0
    let streak = 0
    const today = new Date()
    for (let i = 0; i < dates.length; i++) {
      const diff = Math.round(
        (today.getTime() - new Date(dates[i]).getTime()) / 86400000
      )
      if (diff === i || diff === i + 1) streak++
      else break
    }
    return streak
  })()

  return (
    <div className="min-h-dvh bg-[#FAF8F4]">
      <TopNav />

      <div className="pt-11 pl-6 pr-6 pb-16 max-w-sm mx-auto">
        {/* Page title */}
        <div className="pt-8 pb-6 border-b border-[#EDE5DC]">
          <h1 className="font-playfair text-[2.8rem] font-black leading-none text-[#1A1A1A] tracking-tight">
            PROGRESS
          </h1>
          <p className="text-base text-[#9B9490] mt-2">나의 학습 기록</p>
        </div>

        {/* ── Learning Calendar ── */}
        <div className="py-6 border-b border-[#EDE5DC]">
          <p className="text-[10px] tracking-[0.28em] text-[#8B2246] font-semibold mb-5">
            LEARNING CALENDAR
          </p>
          <CalendarGrid studiedDates={stats.studiedDates ?? []} />
        </div>

        {/* ── Stats — typography-first, no cards ── */}
        <StatRow
          label="STORIES COMPLETED"
          value={String(stats.completedStories)}
          sub={`/ ${total} stories`}
          icon={BookOpen}
          barPct={Math.round((stats.completedStories / total) * 100)}
        />

        <StatRow
          label="PATTERNS LEARNED"
          value={String(stats.totalPatternsSeen)}
          sub={`/ ${totalPatterns} patterns`}
          barPct={Math.round((stats.totalPatternsSeen / totalPatterns) * 100)}
        />

        <StatRow
          label="CURRENT STREAK"
          value={String(streakDays)}
          sub="days in a row"
          icon={Flame}
        />

        <StatRow
          label="STUDY TIME"
          value={String(studyHours)}
          sub="hours total"
          icon={Clock}
        />

        <StatRow
          label="SAVED PATTERNS"
          value={String(stats.favoritesCount)}
          icon={Bookmark}
        />

        {/* Pattern Library */}
        <div className="py-6 border-b border-[#EDE5DC]">
          <p className="text-[10px] tracking-[0.28em] text-[#8B2246] font-semibold mb-4">
            PATTERN LIBRARY
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base text-[#1A1A1A]">Total Reviewed</p>
              <p className="text-[#9B9490] text-sm mt-0.5">패턴 복습 횟수</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-[#8B2246]" strokeWidth={1.6} />
              <span className="font-playfair text-xl font-bold text-[#1A1A1A]">
                {stats.totalReviewCount}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[10px] tracking-[0.2em] text-[#D8D0C8] text-center pt-10">
          SPEAK NATURALLY. CONNECT DEEPLY.
        </p>
      </div>
    </div>
  )
}
