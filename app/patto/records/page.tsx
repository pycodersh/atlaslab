'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronsDown, ChevronsUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { TopNav } from '@/components/TopNav'
import { getStreak } from '@/lib/srs/storage'
import { magazineStories } from '@/data/magazine-stories'
import { getStoryRound, type StoryRoundData } from '@/lib/srs/story-round'
import { getStorySessionState } from '@/lib/srs/story-session'
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

// Session date resets at 04:00 KST (not midnight)
function getSessionDate(): string {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60000)
  if (kst.getUTCHours() < 4) kst.setUTCDate(kst.getUTCDate() - 1)
  return kst.toISOString().slice(0, 10)
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

  const dayPatternMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const r of weeklyCompleted) {
      if (!r.lastCompletedAt) continue
      const story = magazineStories.find(s => s.id === r.storyId)
      const pCount = story?.patterns.length ?? 5
      map[r.lastCompletedAt] = (map[r.lastCompletedAt] ?? 0) + pCount
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

  // Today session stats (04:00 KST reset, L/R/C per story)
  const todaySessionStats = useMemo(() => {
    const sessionDate = getSessionDate()
    const completedToday = storyRounds.filter(r => r.lastCompletedAt === sessionDate)
    const inProgress = storyRounds.filter(
      r => !r.isMastered &&
        r.nextReviewAt !== null &&
        r.nextReviewAt <= sessionDate &&
        r.lastCompletedAt !== sessionDate,
    )
    const m = Math.max(DAILY_GOAL, completedToday.length + inProgress.length)
    let listeningDone = completedToday.length
    let readingDone   = completedToday.length * 2
    let challengeDone = completedToday.length
    let fullyDone     = completedToday.length
    for (const r of inProgress) {
      const sess = getStorySessionState(r.storyId, r.round)
      if (sess.listeningCompleted) listeningDone++
      readingDone += Math.min(2, sess.readingCount)
      if (sess.challengeCompleted) challengeDone++
      if (sess.listeningCompleted && sess.readingCount >= 2 && sess.challengeCompleted) fullyDone++
    }
    return { m, listeningDone, readingDone, challengeDone, fullyDone }
  }, [storyRounds])

  const chipTitle  = '#FFFFFF'

  const sectionChip = (icon: React.ReactNode, title: string, counter: string) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: 'calc(100% + 12px)', boxSizing: 'border-box',
      marginLeft: -6, marginRight: -6,
      background: '#1E293B', border: 'none', borderRadius: 10, padding: '10px 16px',
      marginBottom: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#818CF8', display: 'flex', alignItems: 'center', flexShrink: 0, fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 16, fontWeight: 500, color: '#FFFFFF' }}>{title}</span>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#818CF8', letterSpacing: '0.05em', whiteSpace: 'nowrap', flexShrink: 0 }}>{counter}</span>
    </div>
  )

  const sectionDivider: React.CSSProperties = {
    borderTop: `0.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(30,30,80,0.09)'}`,
    margin: '24px 0',
  }

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: TAB_BAR_HEIGHT + 24 }}>
      <TopNav />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* TODAY'S SESSION */}
        <div style={{ width: '100%' }}>
          {sectionChip(
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/>
              <rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
            </svg>,
            "Today's Session",
            `${todaySessionStats.fullyDone} / ${todaySessionStats.m} done`,
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {([
              {
                label: 'Listening',
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                  </svg>
                ),
                done: todaySessionStats.listeningDone,
                target: todaySessionStats.m * 1,
              },
              {
                label: 'Reading',
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                ),
                done: todaySessionStats.readingDone,
                target: todaySessionStats.m * 2,
              },
              {
                label: 'Challenge',
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 2h6l2 3H2z"/><path d="M22 22h-6l-2-3h8z"/>
                    <path d="M7 2v2a5 5 0 0 0 5 5h0a5 5 0 0 1 5 5v2"/>
                    <path d="M17 22v-2a5 5 0 0 0-5-5h0a5 5 0 0 1-5-5V7"/>
                  </svg>
                ),
                done: todaySessionStats.challengeDone,
                target: todaySessionStats.m * 1,
              },
            ] as const).map(({ label, icon, done, target }) => {
              const pct = target === 0 ? 0 : Math.min(1, done / target)
              const complete = pct >= 1
              return (
                <div key={label}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {icon}
                      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--pm)' }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.10em', fontVariantNumeric: 'tabular-nums', lineHeight: 1, color: complete ? '#22C55E' : 'var(--pm)' }}>
                      {done} / {target}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ?? RECENT SESSIONS ???????????????????????????????????????????????? */}
        {recentSessions.length > 0 && (
          <div>
            <div style={sectionDivider} />
            {sectionChip(
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>,
              'Recent Sessions',
              `${recentSessions.length} stories`,
            )}
            <div>
              {recentSessions.map(({ storyId, round, lastCompletedAt, story }, i) => (
                <button
                  key={storyId} type="button"
                  onClick={() => router.push(`/patto/stories/${storyId}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                    padding: '13px 0', fontFamily: 'inherit',
                    borderBottom: i === recentSessions.length - 1 ? 'none' : '0.5px solid var(--pglass-border)',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(107,143,255,0.10)', border: '1px solid rgba(107,143,255,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#6B8FFF' }}>S{String(storyId).padStart(2, '0')}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: 'var(--pt)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{story?.title ?? ''}</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--pm)' }}>{getRelativeDateLabel(lastCompletedAt)}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--pm)', border: '1px solid var(--pglass-border)', borderRadius: 8, padding: '3px 8px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    Round {round}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* THIS WEEK */}
        <div style={{ width: '100%' }}>
          <div style={sectionDivider} />
          {sectionChip(
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="5" width="16" height="16" rx="2"/>
              <path d="M16 3v4M8 3v4M4 11h16"/><path d="M8 16h.01M12 16h.01M16 16h.01"/>
            </svg>,
            'This Week',
            `${activeDaysThisWeek} / 7 days`,
          )}
          <div>
            {/* Bar chart */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {(() => {
                const maxP = Math.max(...weekDays.map(wd => dayPatternMap[toIso(wd)] ?? 0), 1)
                return weekDays.map((d, i) => {
                  const iso        = toIso(d)
                  const isToday    = iso === today
                  const isFuture   = d > new Date() && !isToday
                  const patterns   = dayPatternMap[iso] ?? 0
                  const hasActivity = patterns > 0
                  const barH = hasActivity ? Math.max(4, Math.round((patterns / maxP) * 76)) : 4
                  const barBg = hasActivity ? '#6366F1' : isToday ? '#EEF2FF' : 'var(--pglass)'
                  const barBorder = hasActivity ? 'none' : isToday ? '1.5px solid #6366F1' : '0.5px solid var(--pglass-border)'
                  const labelColor = (hasActivity || isToday) ? '#6366F1' : 'var(--pm)'
                  const labelWeight = (hasActivity || isToday) ? 500 : 400
                  return (
                    <div key={iso} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '100%', height: 80, display: 'flex', alignItems: 'flex-end' }}>
                        <div style={{
                          width: '100%', height: barH,
                          borderRadius: '4px 4px 0 0',
                          background: barBg, border: barBorder,
                          opacity: isFuture ? 0.35 : 1,
                          transition: 'height 0.4s cubic-bezier(0.22,1,0.36,1)',
                        }} />
                      </div>
                      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <span style={{ fontSize: 11, fontWeight: labelWeight, color: labelColor, lineHeight: 1 }}>{DOW_LABELS[i]}</span>
                        <span style={{ fontSize: 11, color: 'var(--pm)', lineHeight: 1 }}>{d.getDate()}</span>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        </div>

        {/* OVERALL PROGRESS */}
        <div style={{ width: '100%' }}>
          <div style={sectionDivider} />
          {sectionChip(
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"/>
              <rect x="7" y="10" width="3" height="9" rx="1"/><rect x="13" y="6" width="3" height="13" rx="1"/>
            </svg>,
            'Overall Progress',
            '',
          )}

          {/* 3-column stat text-only */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
            {([
              { value: masteredCount, label: 'MASTERED', numColor: '#4338CA', labelColor: '#6366F1' },
              { value: storyMapStats.inProgress, label: 'LEARNING', numColor: 'var(--pt)', labelColor: 'var(--pm)' },
              { value: Math.max(0, 500 - masteredCount - storyMapStats.inProgress), label: 'REMAINING', numColor: 'var(--pt)', labelColor: 'var(--pm)' },
            ] as const).map(({ value, label, numColor, labelColor }) => (
              <div key={label} style={{
                padding: '10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                ...(label === 'LEARNING' ? { borderLeft: `0.5px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(30,30,80,0.10)'}`, borderRight: `0.5px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(30,30,80,0.10)'}` } : {}),
              }}>
                <span style={{ fontSize: 'clamp(1.2rem, 4.5vw, 1.45rem)', fontWeight: 800, color: numColor, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: labelColor, letterSpacing: '0.10em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* View pattern map button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setMapExpanded(v => !v)}
              style={{
                background: '#EEF2FF', border: 'none', borderRadius: 999,
                padding: '6px 20px', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center',
                opacity: 1, transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {mapExpanded
                ? <ChevronsUp size={18} color="#6366F1" />
                : <ChevronsDown size={18} color="#6366F1" />}
            </button>
          </div>

          {/* Inline pattern map */}
          <div style={{
            maxHeight: mapExpanded ? 2000 : 0,
            opacity: mapExpanded ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.3s ease, opacity 0.3s ease',
          }}>
            <div style={{ paddingTop: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3 }}>
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
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 7, fontWeight: 600, color: isMastered ? 'rgba(0,0,0,0.5)' : round >= 1 ? 'rgba(255,255,255,0.8)' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'), lineHeight: 1 }}>{ms.id}</span>
                    </div>
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
          </div>
        </div>

      </div>
    </div>
  )
}

