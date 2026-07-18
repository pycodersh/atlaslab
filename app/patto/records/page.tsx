'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { TopNav } from '@/components/TopNav'
import { getStreak } from '@/lib/srs/storage'
import { magazineStories } from '@/data/magazine-stories'
import { getStoryRound, type StoryRoundData } from '@/lib/srs/story-round'
import { LearningCalendar } from '@/components/LearningCalendar'
import { getFutureSchedule, type ScheduledDay } from '@/lib/srs/engine'
import { getActivityByDate } from '@/lib/srs/storage'

// ?? Constants ??????????????????????????????????????????????????????????????????
const WEEKLY_GOAL = 10
const DAILY_GOAL  = 1

// ?? Helpers ????????????????????????????????????????????????????????????????????
function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getMonthLabel(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function getWeekDays(): Date[] {
  const today = new Date()
  const dow   = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

const DOW_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const MONTHS     = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getRelativeDateLabel(iso: string | null): string {
  if (!iso) return ''
  const todayIso     = toIso(new Date())
  const yesterdayIso = toIso(new Date(Date.now() - 86400000))
  if (iso === todayIso)     return 'Today'
  if (iso === yesterdayIso) return 'Yesterday'
  const d = new Date(iso + 'T12:00:00')
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

// ?? CountUp hook ???????????????????????????????????????????????????????????????
function useCountUp(target: number, duration = 900, enabled = true): number {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    cancelAnimationFrame(rafRef.current)
    if (!enabled || target === 0) { setCount(target); return }
    const start = performance.now()
    const tick = (now: number) => {
      const p      = Math.min((now - start) / duration, 1)
      const eased  = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(eased * target))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration, enabled])

  return count
}

// ?? Animated Ring (Animated Radial Chart pattern) ?????????????????????????????
function AnimatedRing({
  pct, size = 96, stroke = 8,
  color = '#6B8FFF', trackColor = 'rgba(0,0,0,0.07)',
  reducedMotion = false,
}: {
  pct: number; size?: number; stroke?: number;
  color?: string; trackColor?: string; reducedMotion?: boolean
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(id)
  }, [])

  const r     = (size - stroke) / 2
  const circ  = 2 * Math.PI * r
  const tgt   = circ * (1 - Math.min(pct, 100) / 100)

  return (
    <svg
      width={size} height={size}
      style={{ display: 'block', transform: 'rotate(-90deg)', flexShrink: 0 }}
      aria-hidden
    >
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={trackColor} strokeWidth={stroke}
      />
      {/* Progress */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={mounted ? tgt : circ}
        style={{
          transition: reducedMotion
            ? 'none'
            : 'stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)',
        }}
      />
    </svg>
  )
}

// ?? Animated Bar Chart (Activity Chart Card pattern) ??????????????????????????
function AnimatedBarChart({
  weekDays, dayCountMap, today, isDark, reducedMotion,
}: {
  weekDays: Date[]
  dayCountMap: Record<string, number>
  today: string
  isDark: boolean
  reducedMotion: boolean
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 120)
    return () => clearTimeout(id)
  }, [])

  const counts   = weekDays.map(d => dayCountMap[toIso(d)] ?? 0)
  const maxCount = Math.max(...counts, 1)

  const accent    = '#6B8FFF'
  const accentMid = isDark ? 'rgba(107,143,255,0.45)' : 'rgba(107,143,255,0.35)'
  const track     = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.055)'
  const textMuted = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(50,50,90,0.35)'

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 80 }}>
      {weekDays.map((d, i) => {
        const iso     = toIso(d)
        const count   = counts[i]
        const isToday = iso === today
        const isFut   = d > new Date() && !isToday
        const barPct  = count > 0 ? Math.max(0.20, count / maxCount) : 0
        const barH    = Math.round(barPct * 56)   // max 56px bar

        const delay   = reducedMotion ? 0 : i * 40  // staggered delay ms

        return (
          <div
            key={iso}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 4,
            }}
          >
            {/* Count label ??only for days with activity */}
            <span style={{
              fontSize: 8, fontWeight: 700, lineHeight: 1,
              color: isToday ? accent : textMuted,
              opacity: (count > 0 && mounted) ? 1 : 0,
              transition: reducedMotion ? 'none' : `opacity 0.3s ${delay + 300}ms`,
            }}>
              {count > 0 ? count : ''}
            </span>

            {/* Bar wrapper ??fixed height for track */}
            <div style={{ width: '100%', height: 56, display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
              {/* Track (subtle baseline) */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: 2, borderRadius: 1, background: track,
              }} />
              {/* Active bar */}
              <div style={{
                width: '100%',
                height: mounted ? (count > 0 ? barH : 2) : 2,
                borderRadius: '3px 3px 1px 1px',
                background: isToday ? accent : (isFut ? track : accentMid),
                opacity: isFut ? 0.22 : 1,
                transition: reducedMotion
                  ? 'none'
                  : `height ${0.45}s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
                position: 'relative', zIndex: 1,
              }} />
            </div>

            {/* Day label ??circle for today */}
            {isToday ? (
              <div style={{
                width: 22, height: 22, borderRadius: 11,
                background: accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'white' }}>
                  {DOW_LABELS[i]}
                </span>
              </div>
            ) : (
              <span style={{
                fontSize: 9, fontWeight: 600, color: textMuted, lineHeight: 1,
                opacity: isFut ? 0.4 : 1,
              }}>
                {DOW_LABELS[i]}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ?? Story Dots (for My Stories list) ??????????????????????????????????????????
function StoryDots({ round, isMastered }: { round: number; isMastered: boolean }) {
  const filled = isMastered ? '#D7B56D' : '#6B8FFF'
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <div key={n} style={{
          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
          background: n <= round ? filled : 'rgba(100,100,150,0.14)',
          boxShadow: n <= round ? (isMastered ? '0 0 4px rgba(215,181,109,0.40)' : '0 0 4px rgba(107,143,255,0.36)') : 'none',
        }} />
      ))}
    </div>
  )
}

// ?? Page ???????????????????????????????????????????????????????????????????????
export default function ProgressPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  const [streak,         setStreak]         = useState(0)
  const [storyRounds,    setStoryRounds]    = useState<StoryRoundData[]>([])
  const [viewMode,       setViewMode]       = useState<'weekly' | 'monthly'>('weekly')
  const [futureSchedule, setFutureSchedule] = useState<Record<string, ScheduledDay>>({})
  const [activityMap,    setActivityMap]    = useState<Record<string, number>>({})
  const [selectedIso,    setSelectedIso]    = useState<string | null>(null)
  const [mapExpanded,    setMapExpanded]    = useState(false)

  useEffect(() => {
    setStreak(getStreak())
    setStoryRounds(magazineStories.map(s => getStoryRound(s.id)))
    setFutureSchedule(getFutureSchedule())
    setActivityMap(getActivityByDate())
  }, [])

  const today    = useMemo(() => toIso(new Date()), [])
  const weekDays = useMemo(() => getWeekDays(), [])
  const weekIsos = useMemo(() => new Set(weekDays.map(toIso)), [weekDays])

  const weeklyCompleted = useMemo(() =>
    storyRounds.filter(r => r.lastCompletedAt && weekIsos.has(r.lastCompletedAt)),
  [storyRounds, weekIsos])

  const weeklyStoryCount   = weeklyCompleted.length
  const weeklyPatternCount = useMemo(() =>
    weeklyCompleted.reduce((sum, r) => {
      const s = magazineStories.find(ms => ms.id === r.storyId)
      return sum + (s?.patterns.length ?? 5)
    }, 0),
  [weeklyCompleted])

  const dayCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const r of weeklyCompleted) {
      if (r.lastCompletedAt) map[r.lastCompletedAt] = (map[r.lastCompletedAt] ?? 0) + 1
    }
    return map
  }, [weeklyCompleted])

  const todayCount   = storyRounds.filter(r => r.lastCompletedAt === today).length
  const isOutperform = todayCount > DAILY_GOAL
  const weeklyPct    = Math.min(Math.round((weeklyStoryCount / WEEKLY_GOAL) * 100), 100)
  const ringColor    = isOutperform ? '#D7B56D' : '#6B8FFF'

  const displayPct   = useCountUp(weeklyPct,  800, !reducedMotion)
  const displayStreak = useCountUp(streak,     700, !reducedMotion)
  const displayWeekly = useCountUp(weeklyStoryCount, 750, !reducedMotion)
  const displayPattern = useCountUp(weeklyPatternCount, 800, !reducedMotion)

  const myStoriesData = useMemo(() =>
    storyRounds
      .filter(r => r.round > 0)
      .map(r => ({ ...r, story: magazineStories.find(s => s.id === r.storyId)! }))
      .sort((a, b) => a.storyId - b.storyId),
  [storyRounds])

  const storyMapStats = useMemo(() => ({
    completed:  storyRounds.filter(r => r.isMastered).length,
    inProgress: storyRounds.filter(r => r.round > 0 && !r.isMastered).length,
    total:      magazineStories.length,
  }), [storyRounds])

  const masteredCount = storyMapStats.completed
  const mapPct        = Math.round((masteredCount / storyMapStats.total) * 100)

  const weekRangeLabel = useMemo(() => {
    const s = weekDays[0], e = weekDays[6]
    return `${MONTHS[s.getMonth()]} ${s.getDate()} – ${e.getDate()}`
  }, [weekDays])

  const activeDaysThisWeek = useMemo(() =>
    weekDays.filter(d => (dayCountMap[toIso(d)] ?? 0) > 0).length,
  [weekDays, dayCountMap])

  const recentSessions = useMemo(() =>
    [...myStoriesData]
      .filter(r => r.lastCompletedAt)
      .sort((a, b) => (b.lastCompletedAt ?? '').localeCompare(a.lastCompletedAt ?? ''))
      .slice(0, 3),
  [myStoriesData])

  const totalPatterns = useMemo(() =>
    magazineStories.reduce((sum, s) => sum + s.patterns.length, 0), [])

  // ?? Design tokens ????????????????????????????????????????????????????????????
  const surface: React.CSSProperties = {
    borderRadius: 20,
    background:   'var(--pglass)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid var(--pglass-border)',
    boxShadow: isDark
      ? '0 4px 24px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.05)'
      : '0 2px 20px rgba(80,100,200,0.06)',
  }
  const dividerC = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'

  const SEC: React.CSSProperties = {
    fontSize: 11.5, fontWeight: 800, letterSpacing: '0.08em',
    color: 'var(--pt)', textTransform: 'uppercase', margin: '0 0 10px 2px',
  }

  const storyDone = todayCount > 0

  // ?? Step circle helper ????????????????????????????????????????????????????????
  const stepCircle = (active: boolean) => (
    <div style={{
      width: 26, height: 26, borderRadius: '50%',
      border: `2px solid ${active ? '#6B8FFF' : 'rgba(180,185,220,0.45)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: active ? '#6B8FFF' : 'rgba(180,185,220,0.45)' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: TAB_BAR_HEIGHT + 24 }}>
      <TopNav />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ?? TODAY'S SESSION ???????????????????????????????????????????????? */}
        <div>
          <p style={SEC}>TODAY&apos;S SESSION</p>
          <div style={{ ...surface, padding: '20px 20px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                {stepCircle(true)}
                <span style={{ fontSize: 8.5, fontWeight: 700, color: '#6B8FFF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>STORY</span>
              </div>
              <div style={{ flex: 1, height: 1.5, background: 'rgba(142,167,255,0.28)', alignSelf: 'flex-start', marginTop: 12, marginLeft: 3, marginRight: 3 }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                {stepCircle(false)}
                <span style={{ fontSize: 8.5, fontWeight: 700, color: 'var(--pm)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>PATTERN</span>
              </div>
              <div style={{ flex: 1, height: 1.5, background: 'rgba(142,167,255,0.28)', alignSelf: 'flex-start', marginTop: 12, marginLeft: 3, marginRight: 3 }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                {stepCircle(false)}
                <span style={{ fontSize: 8.5, fontWeight: 700, color: 'var(--pm)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>CHALLENGE</span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--pt)' }}>
              {storyDone
                ? `Good work today! ${todayCount} ${todayCount === 1 ? 'story' : 'stories'} done.`
                : "Start your session when you're ready."}
            </p>
          </div>
        </div>

        {/* ?? Stats: 4 cards ????????????????????????????????????????????????? */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {([
            { value: String(displayStreak),  label: 'STREAK',   color: '#E8914A' },
            { value: String(todayCount),     label: 'SESSIONS', color: '#6B8FFF' },
            { value: String(displayPattern), label: 'PATTERNS', color: '#9B8FE8' },
          ] as const).map(({ value, label, color }) => (
            <div key={label} style={{ ...surface, borderRadius: 20, padding: '14px 12px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 'clamp(1.1rem, 4.5vw, 1.35rem)', fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--pm)', letterSpacing: '0.10em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ?? RECENT SESSIONS ???????????????????????????????????????????????? */}
        {recentSessions.length > 0 && (
          <div>
            <p style={SEC}>RECENT SESSIONS</p>
            <div style={surface}>
              {recentSessions.map(({ storyId, round, lastCompletedAt, story }, i) => (
                <button
                  key={storyId} type="button"
                  onClick={() => router.push(`/patto/stories/${storyId}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                    padding: '13px 16px', fontFamily: 'inherit',
                    borderTop: i === 0 ? 'none' : `1px solid ${dividerC}`,
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(107,143,255,0.10)', border: '1px solid rgba(107,143,255,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#6B8FFF' }}>S{String(storyId).padStart(2, '0')}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: 'var(--pt)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{story?.title ?? ''}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--pm)' }}>{getRelativeDateLabel(lastCompletedAt)}</p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--pm)', border: '1px solid var(--pglass-border)', borderRadius: 8, padding: '3px 8px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    Round {round}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ?? THIS WEEK ?????????????????????????????????????????????????????? */}
        <div>
          <p style={SEC}>THIS WEEK</p>
          <div style={{ ...surface, padding: '16px 16px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)', letterSpacing: '-0.01em' }}>{weekRangeLabel}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--pm)' }}>{activeDaysThisWeek} / 7 days</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {weekDays.map((d, i) => {
                const iso = toIso(d)
                const isToday = iso === today
                const hasActivity = (dayCountMap[iso] ?? 0) > 0
                return (
                  <div key={iso} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--pm)' }}>{DOW_LABELS[i]}</span>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: hasActivity && !isToday ? 'rgba(107,143,255,0.12)' : 'transparent',
                      border: isToday ? '2px solid #6B8FFF' : 'none',
                    }}>
                      <span style={{ fontSize: 11, fontWeight: isToday ? 700 : 500, color: isToday ? '#6B8FFF' : (hasActivity ? '#6B8FFF' : 'var(--pt)') }}>
                        {d.getDate()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ?? OVERALL PROGRESS ??????????????????????????????????????????????? */}
        <div>
          <p style={SEC}>OVERALL PROGRESS</p>
          <div style={{ ...surface, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 31, fontWeight: 700, color: 'var(--pt)', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {mapPct}%
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--pm)', lineHeight: 1.5 }}>
                  {masteredCount} / {totalPatterns} patterns
                </span>
                <button
                  type="button"
                  onClick={() => setMapExpanded(v => !v)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
                    fontSize: 11, fontWeight: 700, color: 'var(--pa)', fontFamily: 'inherit',
                  }}
                >
                  {mapExpanded ? 'Hide' : 'Map'}
                </button>
              </div>
            </div>
            {mapExpanded && (
              <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${dividerC}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3, paddingTop: 14 }}>
                  {magazineStories.map((ms, i) => {
                    const rd = storyRounds[i]
                    const round = rd?.round ?? 0
                    const isMastered = rd?.isMastered ?? false
                    const bg = isMastered
                      ? '#D7B56D'
                      : round >= 3 ? (isDark ? '#8FABFF' : '#6B8FFF')
                      : round >= 1 ? (isDark ? 'rgba(107,143,255,0.35)' : 'rgba(107,143,255,0.25)')
                      : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,20,0.05)')
                    return (
                      <div key={ms.id} title={`Story ${ms.id}`} style={{
                        aspectRatio: '1', borderRadius: 3, background: bg,
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,20,0.06)'}`,
                      }} />
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 10, justifyContent: 'flex-end' }}>
                  {([
                    { color: '#D7B56D', label: 'Mastered' },
                    { color: isDark ? '#8FABFF' : '#6B8FFF', label: 'Round 3+' },
                    { color: isDark ? 'rgba(107,143,255,0.35)' : 'rgba(107,143,255,0.25)', label: 'Started' },
                  ] as const).map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                      <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--pm)' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

