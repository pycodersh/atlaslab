'use client'

import { useEffect, useMemo, useState } from 'react'
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

// ── Ring Chart ─────────────────────────────────────────────────────────────────
function RingChart({ pct, size = 108, stroke = 10, color = '#6B8FFF', isDark = true, reducedMotion = false }: {
  pct: number; size?: number; stroke?: number; color?: string; isDark?: boolean; reducedMotion?: boolean
}) {
  const r      = (size - stroke) / 2
  const circ   = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(pct, 100) / 100)
  const track  = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)'
  return (
    <svg width={size} height={size} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.50" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="url(#ringGrad)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: reducedMotion ? 'none' : 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
    </svg>
  )
}

// ── Story Dots ─────────────────────────────────────────────────────────────────
function StoryDots({ round, isMastered }: { round: number; isMastered: boolean }) {
  const filled = isMastered ? '#D7B56D' : '#6B8FFF'
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <div key={n} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: n <= round ? filled : 'rgba(100,100,150,0.15)',
          flexShrink: 0,
          boxShadow: n <= round ? (isMastered ? '0 0 5px rgba(215,181,109,0.45)' : '0 0 5px rgba(107,143,255,0.38)') : 'none',
        }} />
      ))}
    </div>
  )
}

// ── Weekly Activity SVG Chart (21st Weekly KPI Chart pattern) ──────────────────
function WeeklyActivityChart({
  weekDays, dayCountMap, today, isDark,
}: {
  weekDays: Date[]
  dayCountMap: Record<string, number>
  today: string
  isDark: boolean
}) {
  const todayIdx = weekDays.findIndex(d => toIso(d) === today)
  const [sel, setSel] = useState(todayIdx >= 0 ? todayIdx : 0)

  const counts  = weekDays.map(d => dayCountMap[toIso(d)] ?? 0)
  const maxCount = Math.max(...counts, 1)

  // SVG viewBox dimensions
  const W = 320, H = 128
  const colW    = W / 7
  const BAR_MAX = 62      // max line height
  const baseY   = H - 24  // y where day-letter circles sit (center)
  const lineBaseY = baseY - 16  // bottom of bars (above day labels)

  const accent     = '#6B8FFF'
  const trackFill  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.055)'
  const accentDim  = isDark ? 'rgba(107,143,255,0.55)' : 'rgba(107,143,255,0.45)'

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      aria-label="Weekly activity chart"
    >
      {weekDays.map((d, i) => {
        const iso    = toIso(d)
        const count  = counts[i]
        const isFut  = d > new Date() && iso !== today
        const isToday = iso === today
        const isSel  = i === sel

        const cx   = colW * i + colW / 2
        const barH = count > 0 ? Math.max(14, Math.round((count / maxCount) * BAR_MAX)) : 4
        const lineTop = lineBaseY - barH
        const op = isFut ? 0.25 : 1

        return (
          <g
            key={iso}
            onClick={() => setSel(i)}
            style={{ cursor: 'pointer' }}
            role="button"
            aria-label={`${DOW_LABELS[i]}: ${count} stories`}
          >
            {/* Full-column invisible tap target (44px+ touch target) */}
            <rect
              x={cx - colW / 2} y={0}
              width={colW} height={H}
              fill="transparent"
            />
            {/* Column hover background */}
            {isSel && (
              <rect
                x={cx - colW / 2 + 3} y={6}
                width={colW - 6} height={lineBaseY - 6}
                rx={10}
                fill={isDark ? 'rgba(107,143,255,0.10)' : 'rgba(107,143,255,0.07)'}
              />
            )}

            {/* Track (background line) */}
            <line
              x1={cx} y1={lineBaseY}
              x2={cx} y2={lineBaseY - BAR_MAX}
              stroke={trackFill}
              strokeWidth={3} strokeLinecap="round"
              opacity={op}
            />

            {/* Active bar */}
            {count > 0 && (
              <line
                x1={cx} y1={lineBaseY}
                x2={cx} y2={lineTop}
                stroke={isToday ? accent : accentDim}
                strokeWidth={3} strokeLinecap="round"
                opacity={op}
              />
            )}

            {/* Value pill above bar (selected) */}
            {isSel && count > 0 && (
              <>
                <rect
                  x={cx - 13} y={lineTop - 22}
                  width={26} height={17}
                  rx={8.5}
                  fill={accent}
                />
                <text
                  x={cx} y={lineTop - 13}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={9} fontWeight={700} fill="white"
                >
                  {count}
                </text>
              </>
            )}

            {/* Dot for non-selected active bars */}
            {!isSel && count > 0 && (
              <circle cx={cx} cy={lineTop} r={3} fill={accentDim} opacity={op} />
            )}

            {/* Day label — circle for selected, plain text otherwise */}
            {isSel ? (
              <>
                <circle cx={cx} cy={baseY} r={12} fill={accent} />
                <text
                  x={cx} y={baseY}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={9.5} fontWeight={700} fill="white"
                >
                  {DOW_LABELS[i]}
                </text>
              </>
            ) : (
              <text
                x={cx} y={baseY}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={9.5} fontWeight={600}
                fill={isToday
                  ? accent
                  : (isDark ? 'rgba(255,255,255,0.28)' : 'rgba(60,60,100,0.35)')}
                opacity={op}
              >
                {DOW_LABELS[i]}
              </text>
            )}

            {/* Date number below day label */}
            <text
              x={cx} y={H - 2}
              textAnchor="middle" dominantBaseline="auto"
              fontSize={8} fontWeight={600}
              fill={isToday
                ? accent
                : (isDark ? 'rgba(255,255,255,0.20)' : 'rgba(60,60,100,0.28)')}
              opacity={op}
            >
              {d.getDate()}
            </text>
          </g>
        )
      })}
    </svg>
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
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
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

  const todayCount     = storyRounds.filter(r => r.lastCompletedAt === today).length
  const isOutperform   = todayCount > DAILY_GOAL
  const outperformMult = isOutperform ? Math.floor(todayCount / DAILY_GOAL) : 0
  const weeklyPct      = Math.min(Math.round((weeklyStoryCount / WEEKLY_GOAL) * 100), 100)
  const ringColor      = isOutperform ? '#D7B56D' : '#6B8FFF'

  const myStoriesData = useMemo(() =>
    storyRounds
      .filter(r => r.round > 0)
      .map(r => ({ ...r, story: magazineStories.find(s => s.id === r.storyId)! }))
      .sort((a, b) => a.storyId - b.storyId),
  [storyRounds])

  const storyMapStats = useMemo(() => {
    const completed  = storyRounds.filter(r => r.isMastered).length
    const inProgress = storyRounds.filter(r => r.round > 0 && !r.isMastered).length
    const total      = magazineStories.length
    return { completed, inProgress, total }
  }, [storyRounds])

  // ── Design tokens ──────────────────────────────────────────────────────────
  const glassCard: React.CSSProperties = {
    borderRadius: 22,
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.90)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(200,212,240,0.52)'}`,
    boxShadow: isDark
      ? '0 4px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)'
      : '0 2px 24px rgba(100,120,200,0.06)',
  }

  const textPri   = isDark ? '#fff' : '#1a1a2e'
  const textSec   = isDark ? 'rgba(255,255,255,0.52)' : 'rgba(30,30,80,0.54)'
  const textMuted = isDark ? 'rgba(255,255,255,0.30)' : 'rgba(30,30,80,0.36)'
  const divider   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'

  // Banner
  const bannerBg = isDark
    ? (isOutperform
        ? 'linear-gradient(140deg, rgba(215,181,109,0.20) 0%, rgba(255,255,255,0.04) 100%)'
        : 'linear-gradient(140deg, rgba(107,143,255,0.18) 0%, rgba(255,255,255,0.04) 100%)')
    : (isOutperform
        ? 'linear-gradient(140deg, rgba(215,181,109,0.12) 0%, rgba(255,255,255,0.94) 100%)'
        : 'linear-gradient(140deg, rgba(107,143,255,0.10) 0%, rgba(255,255,255,0.94) 100%)')

  const bannerBorder = isDark
    ? (isOutperform ? 'rgba(215,181,109,0.28)' : 'rgba(107,143,255,0.22)')
    : (isOutperform ? 'rgba(215,181,109,0.26)' : 'rgba(107,143,255,0.16)')

  // Metric tiles config
  const metrics = [
    {
      icon: <Flame style={{ width: 15, height: 15 }} strokeWidth={1.8} />,
      value: streak,
      label: 'Streak',
      sub: 'days',
      color: '#E8914A',
      glow: 'rgba(232,145,74,0.15)',
      pct: Math.min((streak / 30) * 100, 100),  // 30일 기준
    },
    {
      icon: <BookOpen style={{ width: 15, height: 15 }} strokeWidth={1.8} />,
      value: weeklyStoryCount,
      label: '이번 주',
      sub: 'stories',
      color: '#6B8FFF',
      glow: 'rgba(107,143,255,0.15)',
      pct: weeklyPct,
    },
    {
      icon: <Zap style={{ width: 15, height: 15 }} strokeWidth={1.8} />,
      value: weeklyPatternCount,
      label: '패턴',
      sub: 'learned',
      color: '#9B8FE8',
      glow: 'rgba(155,143,232,0.15)',
      pct: Math.min((weeklyPatternCount / 50) * 100, 100),  // 50개 기준
    },
  ]

  const masteredCount = storyMapStats.completed
  const mapPct = Math.round((masteredCount / storyMapStats.total) * 100)

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: TAB_BAR_HEIGHT + 24 }}>
      <TopNav />

      {/* ── Sub-header ── */}
      <div style={{
        maxWidth: 480, margin: '0 auto',
        padding: '12px 20px 4px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--pt)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Progress
          </p>
          <p style={{ margin: '3px 0 0', fontSize: 12, fontWeight: 500, color: 'var(--pm)' }}>
            {getMonthLabel()}
          </p>
        </div>

        {/* iOS segmented pill */}
        <div style={{
          display: 'flex', gap: 2,
          background: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)'}`,
          borderRadius: 14, padding: 3,
        }}>
          {(['weekly', 'monthly'] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setViewMode(v)}
              style={{
                height: 30, padding: '0 14px', borderRadius: 11,
                border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                background: viewMode === v
                  ? (isDark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.96)')
                  : 'transparent',
                color: viewMode === v ? (isDark ? '#fff' : '#1a1a2e') : 'var(--pm)',
                boxShadow: viewMode === v
                  ? (isDark ? '0 1px 8px rgba(0,0,0,0.32)' : '0 1px 8px rgba(0,0,0,0.10)')
                  : 'none',
                transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {v === 'weekly' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* ── Hero Banner ── */}
        <div style={{
          borderRadius: 26, padding: '20px',
          background: bannerBg,
          border: `1px solid ${bannerBorder}`,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: isDark
            ? '0 8px 40px rgba(0,0,0,0.30)'
            : (isOutperform ? '0 4px 32px rgba(215,181,109,0.12)' : '0 4px 32px rgba(107,143,255,0.09)'),
        }}>
          {isOutperform && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14,
              background: 'rgba(215,181,109,0.14)',
              border: '1px solid rgba(215,181,109,0.32)',
              borderRadius: 10, padding: '6px 12px',
            }}>
              <Flame style={{ width: 11, height: 11, color: '#D7B56D' }} strokeWidth={2} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#D7B56D' }}>
                오늘 목표 {outperformMult}배 달성 · {todayCount} 스토리 완료
              </span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {/* Left */}
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: textMuted }}>
                THIS WEEK
              </p>
              <p style={{ margin: '7px 0 0', fontSize: 48, fontWeight: 800, color: textPri, lineHeight: 1, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
                {weeklyStoryCount}
                <span style={{ fontSize: 22, fontWeight: 600, color: textSec }}>/{WEEKLY_GOAL}</span>
              </p>
              <p style={{ margin: '2px 0 12px', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.06em', color: textSec }}>
                STORIES
              </p>

              {/* Progress bar */}
              <div style={{ height: 4, borderRadius: 99, background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${weeklyPct}%`, borderRadius: 99,
                  background: `linear-gradient(90deg, ${ringColor}70, ${ringColor})`,
                  transition: 'width 1.3s cubic-bezier(0.34,1.56,0.64,1)',
                }} />
              </div>

              {/* Sub-stats row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                <span style={{ fontSize: 10.5, fontWeight: 500, color: textSec }}>
                  {isOutperform ? '주간 목표 초과!' : `${Math.max(WEEKLY_GOAL - weeklyStoryCount, 0)}개 남았어요`}
                </span>
                {masteredCount > 0 && (
                  <>
                    <span style={{ fontSize: 9, color: textMuted }}>·</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#D7B56D' }}>
                      {masteredCount} 마스터
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Ring */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <RingChart pct={weeklyPct} size={100} stroke={9} color={ringColor} isDark={isDark} reducedMotion={reducedMotion} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
              }}>
                <span style={{ fontSize: 21, fontWeight: 800, color: ringColor, lineHeight: 1, letterSpacing: '-0.03em' }}>
                  {weeklyPct}%
                </span>
                <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: textMuted }}>
                  DONE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3 Metric tiles with progress track ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {metrics.map((m, i) => (
            <div key={i} style={{
              borderRadius: 20,
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(200,212,240,0.50)'}`,
              boxShadow: isDark
                ? '0 4px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.05)'
                : `0 2px 20px ${m.glow}`,
              padding: '14px 10px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              overflow: 'hidden',
            }}>
              {/* Icon badge */}
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: `${m.color}16`,
                border: `1px solid ${m.color}28`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: m.color, marginBottom: 9, flexShrink: 0,
              }}>
                {m.icon}
              </div>
              {/* Value */}
              <span style={{ fontSize: 28, fontWeight: 800, color: m.color, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                {m.value}
              </span>
              {/* Label */}
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: textMuted, marginTop: 4, marginBottom: 12 }}>
                {m.label}
              </span>
              {/* Bottom progress track (Progress Metric Card pattern) */}
              <div style={{ width: '100%', height: 3, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.055)' }}>
                <div style={{
                  height: '100%',
                  width: `${m.pct}%`,
                  background: m.color,
                  opacity: 0.65,
                  transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Weekly / Monthly Activity ── */}
        <div style={{ ...glassCard, padding: '16px 16px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: textMuted }}>
              {viewMode === 'weekly' ? 'WEEKLY ACTIVITY' : 'MONTHLY VIEW'}
            </p>
            {viewMode === 'weekly' && (
              <span style={{ fontSize: 10, fontWeight: 600, color: textMuted }}>
                이번 주 {weeklyStoryCount}개
              </span>
            )}
          </div>

          {viewMode === 'weekly' ? (
            /* 21st Weekly KPI Chart pattern: SVG line chart with interactive selection */
            <WeeklyActivityChart
              weekDays={weekDays}
              dayCountMap={dayCountMap}
              today={today}
              isDark={isDark}
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

        {/* ── My Stories ── */}
        {myStoriesData.length > 0 && (
          <div style={{ ...glassCard, padding: '16px 16px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: textMuted }}>
                MY STORIES
              </p>
              <span style={{ fontSize: 10, fontWeight: 600, color: textMuted }}>
                {myStoriesData.length}개
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {myStoriesData.map(({ storyId, round, isMastered, story }, i) => (
                <div key={storyId} style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  padding: '11px 0',
                  borderTop: i === 0 ? 'none' : `1px solid ${divider}`,
                }}>
                  {/* S-number badge */}
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: isMastered
                      ? 'linear-gradient(135deg, rgba(215,181,109,0.18), rgba(215,181,109,0.08))'
                      : (isDark ? 'rgba(107,143,255,0.11)' : 'rgba(107,143,255,0.08)'),
                    border: `1px solid ${isMastered ? 'rgba(215,181,109,0.28)' : 'rgba(107,143,255,0.16)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 8.5, fontWeight: 800, color: isMastered ? '#D7B56D' : (isDark ? 'rgba(142,167,255,0.90)' : '#6B8FFF') }}>
                      S{String(storyId).padStart(2, '0')}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.85)' : '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 5 }}>
                      {story?.title ?? ''}
                    </span>
                    <StoryDots round={round} isMastered={isMastered} />
                  </div>

                  {isMastered ? (
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#D7B56D', background: 'rgba(215,181,109,0.11)', border: '1px solid rgba(215,181,109,0.22)', borderRadius: 8, padding: '3px 9px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      마스터
                    </span>
                  ) : (
                    <span style={{ fontSize: 9, fontWeight: 700, color: isDark ? 'rgba(142,167,255,0.90)' : '#6B8FFF', background: 'rgba(107,143,255,0.09)', border: '1px solid rgba(107,143,255,0.15)', borderRadius: 8, padding: '3px 9px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {round}회차
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {myStoriesData.length === 0 && (
          <div style={{ padding: '28px 4px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: textMuted, margin: '0 0 4px' }}>
              아직 시작한 스토리가 없어요
            </p>
            <p style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(60,60,100,0.22)', margin: 0, lineHeight: 1.5 }}>
              스토리를 완료하면 여기에 기록돼요
            </p>
          </div>
        )}

        {/* ── Story Map (GitHub Heatmap contribution pattern) ── */}
        <div style={{ ...glassCard, padding: '16px 16px 18px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <p style={{ margin: '0 0 1px', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: textMuted }}>
                STORY MAP
              </p>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: textSec }}>
                S01 – S{magazineStories.length.toString().padStart(2, '0')}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#D7B56D', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {masteredCount}
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, color: textMuted }}>/{storyMapStats.total}</span>
              <p style={{ margin: '1px 0 0', fontSize: 8.5, fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                MASTERED
              </p>
            </div>
          </div>

          {/* Completion progress bar (GitHub contribution bar pattern) */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ height: 4, borderRadius: 99, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.055)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${mapPct}%`,
                background: 'linear-gradient(90deg, rgba(215,181,109,0.70), #D7B56D)',
                transition: 'width 1.4s cubic-bezier(0.34,1.56,0.64,1)',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: textMuted }}>{mapPct}% 완료</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: textMuted }}>진행중 {storyMapStats.inProgress}</span>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {[
              { label: '미시작',  bg: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' },
              { label: '1–2회',  bg: isDark ? 'rgba(107,143,255,0.26)' : 'rgba(107,143,255,0.18)' },
              { label: '3–4회',  bg: isDark ? 'rgba(107,143,255,0.56)' : 'rgba(107,143,255,0.48)' },
              { label: '마스터', bg: 'linear-gradient(135deg, #D7B56D, #C09900)' },
            ].map(({ label, bg }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2.5, background: bg, flexShrink: 0 }} />
                <span style={{ fontSize: 8.5, fontWeight: 600, color: textMuted }}>{label}</span>
              </div>
            ))}
          </div>

          {/* 10×10 grid with number overlay */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
            {magazineStories.map((ms, i) => {
              const rd         = storyRounds[i]
              const round      = rd?.round ?? 0
              const isMastered = rd?.isMastered ?? false

              let cellBg: string
              if (isMastered) {
                cellBg = 'linear-gradient(135deg, #D7B56D 0%, #C09900 100%)'
              } else if (round >= 4) {
                cellBg = isDark ? 'rgba(107,143,255,0.66)' : 'rgba(107,143,255,0.56)'
              } else if (round >= 2) {
                cellBg = isDark ? 'rgba(107,143,255,0.38)' : 'rgba(107,143,255,0.30)'
              } else if (round >= 1) {
                cellBg = isDark ? 'rgba(107,143,255,0.18)' : 'rgba(107,143,255,0.13)'
              } else {
                cellBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.052)'
              }

              return (
                <div
                  key={ms.id}
                  title={`S${String(ms.id).padStart(2, '0')}: ${ms.title} (${round}회차${isMastered ? ' ✓' : ''})`}
                  style={{
                    aspectRatio: '1 / 1', borderRadius: 6,
                    background: cellBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'default',
                  }}
                >
                  <span style={{
                    fontSize: 6, fontWeight: 700, lineHeight: 1, userSelect: 'none',
                    color: isMastered
                      ? 'rgba(255,255,255,0.65)'
                      : (round > 0
                          ? (isDark ? 'rgba(255,255,255,0.50)' : 'rgba(107,143,255,0.72)')
                          : (isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.16)')),
                  }}>
                    {ms.id}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <p style={{ margin: '12px 0 0', textAlign: 'center', fontSize: 9.5, fontWeight: 500, color: textMuted }}>
            완료 {masteredCount} · 진행중 {storyMapStats.inProgress} · 전체 {storyMapStats.total}
          </p>
        </div>

      </div>
    </div>
  )
}
