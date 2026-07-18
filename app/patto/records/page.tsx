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
function RingChart({ pct, size = 96, stroke = 8, color = '#6B8FFF', isDark = true }: {
  pct: number; size?: number; stroke?: number; color?: string; isDark?: boolean
}) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(pct, 100) / 100)
  const trackColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'
  return (
    <svg width={size} height={size} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  )
}

// ── Story Dots ─────────────────────────────────────────────────────────────────
function StoryDots({ round, isMastered }: { round: number; isMastered: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <div key={n} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: n <= round
            ? (isMastered ? '#D7B56D' : 'rgba(107,143,255,0.85)')
            : 'rgba(100,100,150,0.18)',
          flexShrink: 0,
          transition: 'background 0.2s',
        }} />
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ProgressPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [streak,      setStreak]      = useState(0)
  const [storyRounds, setStoryRounds] = useState<StoryRoundData[]>([])
  const [viewMode,    setViewMode]    = useState<'weekly' | 'monthly'>('weekly')
  const [futureSchedule, setFutureSchedule] = useState<Record<string, ScheduledDay>>({})
  const [activityMap, setActivityMap]       = useState<Record<string, number>>({})
  const [selectedIso, setSelectedIso]       = useState<string | null>(null)

  useEffect(() => {
    setStreak(getStreak())
    setStoryRounds(magazineStories.map(s => getStoryRound(s.id)))
    setFutureSchedule(getFutureSchedule())
    setActivityMap(getActivityByDate())
  }, [])

  const today    = useMemo(() => toIso(new Date()), [])
  const weekDays = useMemo(() => getWeekDays(), [])
  const weekIsos = useMemo(() => new Set(weekDays.map(toIso)), [weekDays])

  // Completions this week (lastCompletedAt is within Mon–Sun)
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

  const todayCount         = storyRounds.filter(r => r.lastCompletedAt === today).length
  const isOutperform       = todayCount > DAILY_GOAL
  const outperformMult     = isOutperform ? Math.floor(todayCount / DAILY_GOAL) : 0
  const weeklyPct          = Math.min(Math.round((weeklyStoryCount / WEEKLY_GOAL) * 100), 100)
  const ringColor          = isOutperform ? '#D7B56D' : '#6B8FFF'

  const bannerBg = isDark
    ? (isOutperform ? 'rgba(215,181,109,0.14)' : 'rgba(255,255,255,0.07)')
    : (isOutperform ? 'linear-gradient(135deg, rgba(215,181,109,0.13), rgba(215,181,109,0.06))' : 'rgba(255,255,255,0.88)')
  const bannerBorder = isDark
    ? (isOutperform ? 'rgba(215,181,109,0.28)' : 'rgba(255,255,255,0.10)')
    : (isOutperform ? 'rgba(215,181,109,0.32)' : 'rgba(200,212,240,0.60)')
  const bannerShadow = isDark
    ? '0 8px 32px rgba(0,0,0,0.28)'
    : (isOutperform ? '0 4px 28px rgba(215,181,109,0.10)' : '0 4px 28px rgba(100,120,200,0.08)')

  const bannerStyle: React.CSSProperties = {
    background: bannerBg,
    border: `1px solid ${bannerBorder}`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: bannerShadow,
  }

  // My stories — started at least 1 round
  const myStoriesData = useMemo(() =>
    storyRounds
      .filter(r => r.round > 0)
      .map(r => ({ ...r, story: magazineStories.find(s => s.id === r.storyId)! }))
      .sort((a, b) => a.storyId - b.storyId),
  [storyRounds])

  // Story map stats
  const storyMapStats = useMemo(() => {
    const completed   = storyRounds.filter(r => r.isMastered).length
    const inProgress  = storyRounds.filter(r => r.round > 0 && !r.isMastered).length
    const total       = magazineStories.length
    return { completed, inProgress, total }
  }, [storyRounds])

  // Shared glass card style (adapts to theme)
  const glassCard: React.CSSProperties = {
    borderRadius: 20,
    background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.84)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(200,212,240,0.55)'}`,
    boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.28)' : '0 4px 28px rgba(100,120,200,0.06)',
  }

  // Text color for banner (theme-adaptive)
  const bannerTextPrimary   = isDark ? '#fff' : '#1a1a2e'
  const bannerTextSecondary = isDark ? 'rgba(255,255,255,0.50)' : 'rgba(30,30,80,0.52)'
  const bannerTextMuted     = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(30,30,80,0.40)'

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: TAB_BAR_HEIGHT + 24 }}>

      <TopNav />

      {/* ── Sub-header: title + toggle ── */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 20px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--pt)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Progress
          </p>
          <p style={{ margin: '3px 0 0', fontSize: 12, fontWeight: 500, color: 'var(--pm)' }}>
            {getMonthLabel()}
          </p>
        </div>
        {/* Weekly / Monthly toggle */}
        <div style={{
          display: 'flex', gap: 2,
          background: 'var(--pglass)',
          border: '1px solid var(--pglass-border)',
          borderRadius: 12, padding: 3,
        }}>
          {(['weekly', 'monthly'] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setViewMode(v)}
              style={{
                height: 30, padding: '0 13px', borderRadius: 9,
                border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                background: viewMode === v ? 'var(--pa)' : 'transparent',
                color: viewMode === v ? '#fff' : 'var(--pm)',
                transition: 'all 0.18s',
              }}
            >
              {v === 'weekly' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ── Banner ── */}
        <div style={{
          borderRadius: 24,
          padding: '22px 20px 20px',
          ...bannerStyle,
        }}>
          {/* Outperform badge */}
          {isOutperform && (
            <div style={{
              marginBottom: 14,
              display: 'inline-flex', alignItems: 'center',
              background: 'rgba(215,181,109,0.18)',
              border: '1px solid rgba(215,181,109,0.40)',
              borderRadius: 12, padding: '7px 12px',
            }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#D7B56D', lineHeight: 1.3 }}>
                🔥 오늘 목표의 {outperformMult}배 달성! · 오늘 {todayCount}스토리 완료 · 대단해요!
              </span>
            </div>
          )}

          {/* Split layout: left fraction text + right ring chart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {/* Left: big fraction */}
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: bannerTextMuted, textTransform: 'uppercase' }}>
                THIS WEEK
              </p>
              <p style={{ margin: '6px 0 2px', fontSize: 38, fontWeight: 800, color: bannerTextPrimary, lineHeight: 1, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
                {weeklyStoryCount}<span style={{ fontSize: 22, fontWeight: 700, opacity: 0.55 }}>/{WEEKLY_GOAL}</span>
              </p>
              <p style={{ margin: '4px 0 2px', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: bannerTextMuted, textTransform: 'uppercase' }}>
                STORIES THIS WEEK
              </p>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: bannerTextSecondary }}>
                {isOutperform
                  ? '주간 목표 초과 달성! 🎉'
                  : `목표까지 ${Math.max(WEEKLY_GOAL - weeklyStoryCount, 0)}개 남았어요`}
              </p>
            </div>

            {/* Right: ring chart with centered percentage */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <RingChart pct={weeklyPct} size={96} stroke={8} color={ringColor} isDark={isDark} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: isDark ? '#fff' : '#1a1a2e', lineHeight: 1, letterSpacing: '-0.03em' }}>
                  {weeklyPct}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3 Metrics — individual stat tiles ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            {
              icon: <Flame style={{ width: 14, height: 14, color: '#D7B56D' }} strokeWidth={1.8} />,
              value: streak, label: 'STREAK', accentColor: '#D7B56D',
            },
            {
              icon: <BookOpen style={{ width: 14, height: 14, color: '#6B8FFF' }} strokeWidth={1.8} />,
              value: weeklyStoryCount, label: '이번 주', accentColor: '#6B8FFF',
            },
            {
              icon: <Zap style={{ width: 14, height: 14, color: '#9B8FE8' }} strokeWidth={1.8} />,
              value: weeklyPatternCount, label: '패턴', accentColor: '#9B8FE8',
            },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                borderRadius: 18,
                background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.84)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(200,212,240,0.55)'}`,
                boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.28)' : '0 4px 28px rgba(100,120,200,0.06)',
                padding: '14px 8px 12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Accent icon top-left */}
              <div style={{ position: 'absolute', top: 10, left: 10 }}>
                {m.icon}
              </div>
              {/* Big value */}
              <span style={{ fontSize: 28, fontWeight: 800, color: m.accentColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginTop: 10 }}>
                {m.value}
              </span>
              {/* Label */}
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.07em', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(60,60,100,0.40)', textTransform: 'uppercase', marginTop: 5 }}>
                {m.label}
              </span>
              {/* Bottom accent bar */}
              <div style={{
                position: 'absolute', bottom: 0, left: 12, right: 12,
                height: 3, borderRadius: 99,
                background: m.accentColor,
                opacity: 0.45,
              }} />
            </div>
          ))}
        </div>

        {/* ── Weekly / Monthly section ── */}
        <div style={{ ...glassCard, padding: '18px 16px 16px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(60,60,100,0.42)', textTransform: 'uppercase' }}>
            {viewMode === 'weekly' ? 'WEEKLY' : 'MONTHLY'}
          </p>

          {viewMode === 'weekly' ? (
            /* ── Weekly Activity Bars ── */
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4, alignItems: 'flex-end' }}>
              {weekDays.map((d, i) => {
                const iso     = toIso(d)
                const count   = dayCountMap[iso] ?? 0
                const isToday = iso === today
                const isFut   = d > new Date() && !isToday
                const barH    = count > 0 ? Math.min(Math.max(28, count * 20), 64) : 6

                return (
                  <div key={iso} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: isFut ? 0.3 : 1 }}>
                    {/* Day letter */}
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', color: isToday ? '#6B8FFF' : (isDark ? 'rgba(255,255,255,0.32)' : 'rgba(60,60,100,0.38)'), textTransform: 'uppercase' }}>
                      {DOW_LABELS[i]}
                    </span>
                    {/* Bar wrapper (fixed height container for bottom-alignment) */}
                    <div style={{ height: 64, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                      <div style={{
                        width: '100%',
                        height: barH,
                        borderRadius: 4,
                        background: count > 0
                          ? 'linear-gradient(180deg, #8FABFF, #6B8FFF)'
                          : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                        border: isToday
                          ? `1.5px solid ${count > 0 ? '#8FABFF' : 'rgba(107,143,255,0.55)'}`
                          : '1.5px solid transparent',
                        transition: 'height 0.5s cubic-bezier(0.4,0,0.2,1)',
                        flexShrink: 0,
                      }} />
                    </div>
                    {/* Date number */}
                    <span style={{ fontSize: 9, fontWeight: 600, color: isToday ? '#6B8FFF' : (isDark ? 'rgba(255,255,255,0.28)' : 'rgba(40,40,80,0.35)') }}>
                      {d.getDate()}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <LearningCalendar
              onDaySelect={(iso) => {
                setSelectedIso(prev => prev === iso ? null : iso)
              }}
              selectedIso={selectedIso}
              futureSchedule={futureSchedule}
              streak={streak}
            />
          )}
        </div>

        {/* ── My Stories ── */}
        {myStoriesData.length > 0 && (
          <div style={{ ...glassCard, padding: '18px 16px 16px' }}>
            <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(60,60,100,0.42)', textTransform: 'uppercase' }}>
              MY STORIES
            </p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {myStoriesData.map(({ storyId, round, isMastered, story }, i) => (
                <div
                  key={storyId}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 0',
                    borderTop: i === 0 ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(60,60,100,0.38)', flexShrink: 0 }}>
                        S{String(storyId).padStart(2, '0')}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.85)' : '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {story?.title ?? ''}
                      </span>
                    </div>
                    <StoryDots round={round} isMastered={isMastered} />
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {isMastered ? (
                      <span style={{
                        fontSize: 9.5, fontWeight: 700, color: '#D7B56D',
                        background: 'rgba(215,181,109,0.12)',
                        border: '1px solid rgba(215,181,109,0.28)',
                        borderRadius: 7, padding: '2px 8px', whiteSpace: 'nowrap',
                      }}>
                        마스터 ✅
                      </span>
                    ) : (
                      <span style={{
                        fontSize: 9.5, fontWeight: 700,
                        color: isDark ? 'rgba(142,167,255,0.85)' : 'rgba(107,143,255,0.9)',
                        background: 'rgba(107,143,255,0.10)',
                        border: '1px solid rgba(107,143,255,0.18)',
                        borderRadius: 7, padding: '2px 8px', whiteSpace: 'nowrap',
                      }}>
                        {round}회차
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state when no stories started */}
        {myStoriesData.length === 0 && (
          <div style={{ padding: '6px 4px 2px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(60,60,100,0.32)', margin: '0 0 4px' }}>
              아직 시작한 스토리가 없어요
            </p>
            <p style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.20)' : 'rgba(60,60,100,0.25)', margin: 0, lineHeight: 1.5 }}>
              스토리를 완료하면 여기에 기록돼요
            </p>
          </div>
        )}

        {/* ── S1-S100 Story Matrix ── */}
        <div style={{ ...glassCard, padding: '18px 16px 20px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(60,60,100,0.42)', textTransform: 'uppercase' }}>
            STORY MAP · S01–S{magazineStories.length.toString().padStart(2, '0')}
          </p>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            {[
              { label: '미시작', bg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
              { label: '1–2회', bg: isDark ? 'rgba(107,143,255,0.30)' : 'rgba(107,143,255,0.22)' },
              { label: '3–4회', bg: isDark ? 'rgba(107,143,255,0.65)' : 'rgba(107,143,255,0.55)' },
              { label: '마스터', bg: 'linear-gradient(135deg, #D7B56D, #C09900)' },
            ].map(({ label, bg }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: bg, flexShrink: 0 }} />
                <span style={{ fontSize: 9.5, color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(60,60,100,0.45)', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* 10×10 grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            gap: 8,
          }}>
            {magazineStories.map((ms, i) => {
              const rd = storyRounds[i]
              const round      = rd?.round ?? 0
              const isMastered = rd?.isMastered ?? false

              let cellBg: string
              if (isMastered) {
                cellBg = 'linear-gradient(135deg, #D7B56D, #C09900)'
              } else if (round >= 3) {
                cellBg = isDark ? 'rgba(107,143,255,0.60)' : 'rgba(107,143,255,0.50)'
              } else if (round >= 1) {
                cellBg = isDark ? 'rgba(107,143,255,0.28)' : 'rgba(107,143,255,0.20)'
              } else {
                cellBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.055)'
              }

              return (
                <div
                  key={ms.id}
                  title={`S${String(ms.id).padStart(2, '0')}: ${ms.title} (${round}회차${isMastered ? ' ✓' : ''})`}
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: 8,
                    background: cellBg,
                    position: 'relative',
                    transition: 'opacity 0.15s',
                    cursor: 'default',
                  }}
                />
              )
            })}
          </div>

          {/* Story map footer */}
          <p style={{ margin: '12px 0 0', textAlign: 'center', fontSize: 10, fontWeight: 500, color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(60,60,100,0.38)' }}>
            완료 {storyMapStats.completed}개 · 진행중 {storyMapStats.inProgress}개 · 전체 {storyMapStats.total}개
          </p>
        </div>

      </div>
    </div>
  )
}
