'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Flame, BookOpen, Zap } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { TopNav } from '@/components/TopNav'
import { getStreak } from '@/lib/srs/storage'
import { magazineStories } from '@/data/magazine-stories'
import { getStoryRound, type StoryRoundData } from '@/lib/srs/story-round'
import { LearningCalendar } from '@/components/LearningCalendar'
import { getFutureSchedule, type ScheduledDay } from '@/lib/srs/engine'
import { getActivityByDate } from '@/lib/srs/storage'

// ── Constants ──────────────────────────────────────────────────────────────────
const WEEKLY_GOAL = 10
const DAILY_GOAL  = 1

// ── Helpers ────────────────────────────────────────────────────────────────────
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

// ── CountUp hook ───────────────────────────────────────────────────────────────
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

// ── Animated Ring (Animated Radial Chart pattern) ─────────────────────────────
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

// ── Animated Bar Chart (Activity Chart Card pattern) ──────────────────────────
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
            {/* Count label — only for days with activity */}
            <span style={{
              fontSize: 8, fontWeight: 700, lineHeight: 1,
              color: isToday ? accent : textMuted,
              opacity: (count > 0 && mounted) ? 1 : 0,
              transition: reducedMotion ? 'none' : `opacity 0.3s ${delay + 300}ms`,
            }}>
              {count > 0 ? count : ''}
            </span>

            {/* Bar wrapper — fixed height for track */}
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

            {/* Day label — circle for today */}
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

// ── Story Dots (for My Stories list) ──────────────────────────────────────────
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

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ProgressPage() {
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

  // ── Design tokens ────────────────────────────────────────────────────────────
  const surface: React.CSSProperties = {
    borderRadius: 20,
    background:   isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(180,195,240,0.45)'}`,
    boxShadow: isDark
      ? '0 4px 24px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.05)'
      : '0 2px 20px rgba(80,100,200,0.06)',
  }

  const textPri   = isDark ? '#ffffff' : '#16162a'
  const textSec   = isDark ? 'rgba(255,255,255,0.50)' : 'rgba(30,30,80,0.52)'
  const textMuted = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(50,50,90,0.36)'
  const dividerC  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
  const trackColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)'

  // Heatmap colors
  const hmColors = {
    empty:   isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    lvl1:    isDark ? 'rgba(107,143,255,0.20)' : 'rgba(107,143,255,0.14)',
    lvl2:    isDark ? 'rgba(107,143,255,0.48)' : 'rgba(107,143,255,0.40)',
    master:  isDark ? 'rgba(215,181,109,0.82)' : 'rgba(215,181,109,0.78)',
  }

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: TAB_BAR_HEIGHT + 24 }}>
      <TopNav />

      {/* ── Sub-header ─────────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 480, margin: '0 auto',
        padding: '10px 20px 2px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: textSec }}>
          {getMonthLabel()}
        </span>

        {/* iOS segmented control */}
        <div style={{
          display: 'flex', gap: 2,
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.055)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)'}`,
          borderRadius: 13, padding: 3,
        }}>
          {(['weekly', 'monthly'] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setViewMode(v)}
              style={{
                height: 28, padding: '0 13px', borderRadius: 10,
                border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                background: viewMode === v
                  ? (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.96)')
                  : 'transparent',
                color: viewMode === v ? textPri : textMuted,
                boxShadow: viewMode === v
                  ? (isDark ? '0 1px 6px rgba(0,0,0,0.28)' : '0 1px 6px rgba(0,0,0,0.09)')
                  : 'none',
                transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
              }}
            >
              {v === 'weekly' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '6px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* ── Hero: Animated Radial Progress ─────────────────────────────── */}
        <div style={{
          ...surface,
          borderRadius: 24,
          padding: '20px 20px 18px',
          background: isDark
            ? (isOutperform ? 'rgba(215,181,109,0.07)' : 'rgba(107,143,255,0.07)')
            : (isOutperform ? 'rgba(255,252,245,0.95)' : 'rgba(248,250,255,0.95)'),
          border: `1px solid ${isDark
            ? (isOutperform ? 'rgba(215,181,109,0.18)' : 'rgba(107,143,255,0.16)')
            : (isOutperform ? 'rgba(215,181,109,0.22)' : 'rgba(107,143,255,0.14)')}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Left */}
            <div style={{ flex: 1 }}>
              <p style={{
                margin: '0 0 8px', fontSize: 9.5, fontWeight: 700,
                letterSpacing: '0.13em', textTransform: 'uppercase', color: textMuted,
              }}>
                THIS WEEK
              </p>
              <p style={{
                margin: 0, fontSize: 44, fontWeight: 800, color: textPri,
                lineHeight: 1, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums',
              }}>
                {displayWeekly}
                <span style={{ fontSize: 20, fontWeight: 600, color: textSec }}>
                  /{WEEKLY_GOAL}
                </span>
              </p>
              <p style={{
                margin: '4px 0 0', fontSize: 10, fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase', color: textSec,
              }}>
                STORIES
              </p>

              {/* Progress bar */}
              <div style={{
                marginTop: 14, height: 3, borderRadius: 99,
                background: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${weeklyPct}%`,
                  background: ringColor,
                  opacity: 0.72,
                  transition: reducedMotion ? 'none' : 'width 1.1s cubic-bezier(0.22,1,0.36,1)',
                }} />
              </div>

              <p style={{ margin: '8px 0 0', fontSize: 11, color: textSec, fontWeight: 500 }}>
                {isOutperform
                  ? `목표 초과 달성 · 오늘 ${todayCount}개`
                  : `${Math.max(WEEKLY_GOAL - weeklyStoryCount, 0)}개 남았어요`}
              </p>
            </div>

            {/* Right: Animated ring + countup */}
            <div style={{ position: 'relative', flexShrink: 0, width: 92, height: 92 }}>
              <AnimatedRing
                pct={weeklyPct}
                size={92} stroke={7}
                color={ringColor}
                trackColor={trackColor}
                reducedMotion={reducedMotion}
              />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 0,
              }}>
                <span style={{
                  fontSize: 22, fontWeight: 800, color: ringColor,
                  lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums',
                }}>
                  {displayPct}%
                </span>
                <span style={{
                  fontSize: 7, fontWeight: 700, letterSpacing: '0.10em',
                  textTransform: 'uppercase', color: textMuted, marginTop: 2,
                }}>
                  DONE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Compact Stats Row (single card, 3 columns) ─────────────────── */}
        <div style={{ ...surface, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {[
              { icon: <Flame style={{ width: 12, height: 12 }} strokeWidth={2} />, value: displayStreak,  label: 'Streak',  color: '#E8914A' },
              { icon: <BookOpen style={{ width: 12, height: 12 }} strokeWidth={2} />, value: displayWeekly,  label: '이번 주', color: '#6B8FFF' },
              { icon: <Zap style={{ width: 12, height: 12 }} strokeWidth={2} />,     value: displayPattern, label: '패턴',    color: '#9B8FE8' },
            ].map((m, i) => (
              <div key={i} style={{
                flex: 1,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4, padding: '2px 0',
                borderLeft: i > 0 ? `1px solid ${dividerC}` : 'none',
              }}>
                <span style={{
                  fontSize: 28, fontWeight: 800, color: m.color,
                  lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
                }}>
                  {m.value}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ color: m.color, display: 'flex' }}>{m.icon}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.06em', color: textMuted,
                  }}>
                    {m.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Activity Chart ──────────────────────────────────────────────── */}
        <div style={{ ...surface, padding: '14px 16px 16px' }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 12,
          }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: textMuted,
            }}>
              {viewMode === 'weekly' ? 'WEEKLY ACTIVITY' : 'MONTHLY VIEW'}
            </span>
            {viewMode === 'weekly' && weeklyStoryCount > 0 && (
              <span style={{ fontSize: 10, fontWeight: 600, color: textMuted }}>
                {weeklyStoryCount}개 완료
              </span>
            )}
          </div>

          {viewMode === 'weekly' ? (
            <AnimatedBarChart
              weekDays={weekDays}
              dayCountMap={dayCountMap}
              today={today}
              isDark={isDark}
              reducedMotion={reducedMotion}
            />
          ) : (
            <LearningCalendar
              onDaySelect={(iso) => setSelectedIso(prev => prev === iso ? null : iso)}
              selectedIso={selectedIso}
              futureSchedule={futureSchedule}
              streak={streak}
            />
          )}
        </div>

        {/* ── My Stories ──────────────────────────────────────────────────── */}
        {myStoriesData.length > 0 && (
          <div style={{ ...surface, padding: '14px 16px' }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 10,
            }}>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: textMuted,
              }}>
                MY STORIES
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, color: textMuted }}>
                {myStoriesData.length}개
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {myStoriesData.map(({ storyId, round, isMastered, story }, i) => (
                <div key={storyId} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
                  borderTop: i === 0 ? 'none' : `1px solid ${dividerC}`,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: isMastered
                      ? 'rgba(215,181,109,0.13)'
                      : (isDark ? 'rgba(107,143,255,0.10)' : 'rgba(107,143,255,0.07)'),
                    border: `1px solid ${isMastered ? 'rgba(215,181,109,0.26)' : 'rgba(107,143,255,0.14)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      fontSize: 8, fontWeight: 800,
                      color: isMastered ? '#D7B56D' : (isDark ? 'rgba(142,167,255,0.88)' : '#6B8FFF'),
                    }}>
                      S{String(storyId).padStart(2, '0')}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      display: 'block', fontSize: 12.5, fontWeight: 600,
                      color: isDark ? 'rgba(255,255,255,0.84)' : textPri,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      marginBottom: 4,
                    }}>
                      {story?.title ?? ''}
                    </span>
                    <StoryDots round={round} isMastered={isMastered} />
                  </div>
                  {isMastered ? (
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: '#D7B56D',
                      background: 'rgba(215,181,109,0.10)',
                      border: '1px solid rgba(215,181,109,0.20)',
                      borderRadius: 7, padding: '3px 8px', flexShrink: 0,
                    }}>
                      마스터
                    </span>
                  ) : (
                    <span style={{
                      fontSize: 9, fontWeight: 700,
                      color: isDark ? 'rgba(142,167,255,0.88)' : '#6B8FFF',
                      background: 'rgba(107,143,255,0.08)',
                      border: '1px solid rgba(107,143,255,0.14)',
                      borderRadius: 7, padding: '3px 8px', flexShrink: 0,
                    }}>
                      {round}회차
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {myStoriesData.length === 0 && (
          <div style={{ padding: '24px 4px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: textMuted, margin: '0 0 3px' }}>
              아직 시작한 스토리가 없어요
            </p>
            <p style={{
              fontSize: 11, color: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(60,60,100,0.20)',
              margin: 0, lineHeight: 1.5,
            }}>
              스토리를 완료하면 여기에 기록돼요
            </p>
          </div>
        )}

        {/* ── Story Map Heatmap ───────────────────────────────────────────── */}
        <div style={{ ...surface, padding: '14px 16px 16px' }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', marginBottom: 10,
          }}>
            <div>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: textMuted, display: 'block', marginBottom: 1,
              }}>
                STORY MAP
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: textSec }}>
                S01 – S{magazineStories.length.toString().padStart(2, '0')}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                fontSize: 20, fontWeight: 800, color: '#D7B56D',
                lineHeight: 1, letterSpacing: '-0.02em',
              }}>
                {masteredCount}
              </span>
              <span style={{ fontSize: 9, fontWeight: 600, color: textMuted }}>/{storyMapStats.total}</span>
              <span style={{
                display: 'block', fontSize: 8, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06em', color: textMuted,
              }}>
                MASTERED
              </span>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            {[
              { dot: hmColors.empty,  label: '미시작' },
              { dot: hmColors.lvl1,   label: '1–2회' },
              { dot: hmColors.lvl2,   label: '3–4회' },
              { dot: hmColors.master, label: '마스터' },
            ].map(({ dot, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: 2,
                  background: dot, flexShrink: 0,
                }} />
                <span style={{ fontSize: 8.5, fontWeight: 600, color: textMuted }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{
            marginBottom: 10, height: 3, borderRadius: 99,
            background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 99,
              width: `${mapPct}%`,
              background: 'linear-gradient(90deg, rgba(215,181,109,0.6), #D7B56D)',
              transition: reducedMotion ? 'none' : 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
            }} />
          </div>

          {/* Heatmap grid — compact 10×10 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            gap: 3,
          }}>
            {magazineStories.map((ms, i) => {
              const rd         = storyRounds[i]
              const round      = rd?.round ?? 0
              const isMastered = rd?.isMastered ?? false

              let bg: string
              if (isMastered)  bg = hmColors.master
              else if (round >= 3) bg = hmColors.lvl2
              else if (round >= 1) bg = hmColors.lvl1
              else                 bg = hmColors.empty

              return (
                <div
                  key={ms.id}
                  title={`S${String(ms.id).padStart(2, '0')} · ${ms.title}${isMastered ? ' ✓' : ` · ${round}회`}`}
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: 4,
                    background: bg,
                    cursor: 'default',
                    transition: 'opacity 0.12s',
                  }}
                />
              )
            })}
          </div>

          {/* Footer */}
          <p style={{
            margin: '10px 0 0', textAlign: 'center',
            fontSize: 9.5, fontWeight: 500, color: textMuted,
          }}>
            완료 {masteredCount} · 진행중 {storyMapStats.inProgress} · 전체 {storyMapStats.total}
          </p>
        </div>

      </div>
    </div>
  )
}
