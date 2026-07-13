'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { useTrainerSafe } from '@/contexts/TrainerContext'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { getStreak, getLearnedPatternCount, getDailyStats, getActivityByDate, todayStr } from '@/lib/srs/storage'
import { magazineStories } from '@/data/magazine-stories'
import { getStoryRound, type StoryRoundData } from '@/lib/srs/story-round'
import { LearningCalendar } from '@/components/LearningCalendar'
import { getFutureSchedule, type ScheduledDay } from '@/lib/srs/engine'

// ── Constants ──────────────────────────────────────────────────────────────────
const PATTERN_GOAL = 500

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

function formatDate(isoDate: string): string {
  const today = todayStr()
  const yesterday = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return toIso(d) })()
  if (isoDate === today)     return 'Today'
  if (isoDate === yesterday) return 'Yesterday'
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const DOW_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// ── Sub-components ─────────────────────────────────────────────────────────────

function StepIndicator({ done, label }: { done: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: done ? 'rgba(107,143,255,0.85)' : 'rgba(255,255,255,0.12)',
        border: done ? 'none' : '1.5px solid rgba(255,255,255,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.3s',
      }}>
        {done ? (
          <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
            <path d="M3 7l3 3 5-5" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }} />
        )}
      </div>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: done ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  )
}

function StatCard({ emoji, label, value, accent, bg, border }: {
  emoji: string; label: string; value: string
  accent: string; bg: string; border: string
}) {
  return (
    <div style={{
      flex: 1, borderRadius: 16, padding: '13px 10px 12px',
      background: bg, border: `1px solid ${border}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
    }}>
      <span style={{ fontSize: 17, lineHeight: 1 }}>{emoji}</span>
      <span style={{ fontSize: 17, fontWeight: 800, color: accent, lineHeight: 1.15, marginTop: 3, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{value}</span>
      <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.1em', color: accent, opacity: 0.6, textTransform: 'uppercase', marginTop: 1 }}>{label}</span>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ProgressPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [streak,          setStreak]          = useState(0)
  const [storyRounds,     setStoryRounds]      = useState<StoryRoundData[]>([])
  const [patternsLearned, setPatternsLearned]  = useState(0)
  const [todayStats,      setTodayStats]       = useState({ stories: 0, patterns: 0, reviews: 0 })
  const [viewMode,        setViewMode]         = useState<'weekly' | 'monthly'>('weekly')
  const [futureSchedule,  setFutureSchedule]   = useState<Record<string, ScheduledDay>>({})
  const [activityMap,     setActivityMap]      = useState<Record<string, number>>({})
  const [selectedIso,     setSelectedIso]      = useState<string | null>(null)
  const [mounted,         setMounted]          = useState(false)

  const trainer = useTrainerSafe()

  useEffect(() => {
    const streakVal       = getStreak()
    const rounds          = magazineStories.map(s => getStoryRound(s.id))
    const patternCount    = getLearnedPatternCount()
    const daily           = getDailyStats(todayStr())

    setStreak(streakVal)
    setStoryRounds(rounds)
    setPatternsLearned(patternCount)
    setTodayStats(daily)
    setFutureSchedule(getFutureSchedule())
    setActivityMap(getActivityByDate())
    setMounted(true)

    trainer?.setPage('progress')
    const msg = streakVal > 0
      ? `${streakVal} day streak. Keep it up.`
      : "Ready when you are."
    const t = setTimeout(() => trainer?.showMessage(msg, 3000), 900)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const today    = useMemo(() => toIso(new Date()), [])
  const weekDays = useMemo(() => getWeekDays(), [])
  const weekIsos = useMemo(() => new Set(weekDays.map(toIso)), [weekDays])

  // Completions this week
  const weeklyCompleted = useMemo(() =>
    storyRounds.filter(r => r.lastCompletedAt && weekIsos.has(r.lastCompletedAt)),
  [storyRounds, weekIsos])

  const weeklySessionCount = weeklyCompleted.length

  // Day → session count map for calendar dots
  const dayCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const r of weeklyCompleted) {
      if (r.lastCompletedAt) map[r.lastCompletedAt] = (map[r.lastCompletedAt] ?? 0) + 1
    }
    return map
  }, [weeklyCompleted])

  // Today's session step completions
  const storyDoneToday   = storyRounds.some(r => r.lastCompletedAt === today)
  const patternDoneToday = todayStats.patterns > 0
  // TODO: Challenge step — no data source yet. daily_challenges table exists in Supabase
  // but is not queried from this page. Wire up when Challenge feature UI is built.
  const challengeDoneToday = false

  const stepsDone       = [storyDoneToday, patternDoneToday, challengeDoneToday].filter(Boolean).length
  const sessionPct      = Math.round((stepsDone / 3) * 100)
  const motivationLine  = stepsDone === 0 ? "Start your session — you're ready."
    : stepsDone === 1 ? "Good start. Two steps to go."
    : stepsDone === 2 ? "One step left — finish strong."
    : "Session complete. Great work!"

  // Recent sessions — up to 3 most-recent completed story rounds, sorted desc
  const recentSessions = useMemo(() => {
    return storyRounds
      .filter(r => r.round > 0 && r.lastCompletedAt)
      .sort((a, b) => (b.lastCompletedAt ?? '').localeCompare(a.lastCompletedAt ?? ''))
      .slice(0, 3)
      .map(r => ({
        ...r,
        story: magazineStories.find(s => s.id === r.storyId),
      }))
  }, [storyRounds])

  // Trainer message based on weekly session count
  const trainerMsg = weeklySessionCount === 0 ? "Ready when you are."
    : weeklySessionCount <= 3 ? "Good start. Keep going."
    : weeklySessionCount <= 6 ? `Great work. You completed ${weeklySessionCount} sessions this week.`
    : "Perfect week. You did it."

  // Glass card style
  const glassCard: React.CSSProperties = {
    borderRadius: 20,
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.68)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.82)'}`,
  }

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: TAB_BAR_HEIGHT + 24 }}>

      {/* ── Sticky Header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: isDark
          ? 'linear-gradient(180deg, rgba(12,8,40,0.97) 0%, rgba(12,8,40,0) 100%)'
          : 'linear-gradient(180deg, rgba(245,246,255,0.97) 0%, rgba(245,246,255,0) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: '52px 20px 16px',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: isDark ? '#fff' : '#14142a', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Progress
          </p>
          <p style={{ margin: '3px 0 0', fontSize: 12, fontWeight: 500, color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(60,60,100,0.50)' }}>
            {getMonthLabel()}
          </p>
        </div>
        <div style={{
          display: 'flex', gap: 2,
          background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(107,143,255,0.10)',
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
                background: viewMode === v ? (isDark ? '#fff' : '#6B8FFF') : 'transparent',
                color: viewMode === v ? (isDark ? '#1a1060' : '#fff') : (isDark ? 'rgba(255,255,255,0.50)' : 'rgba(60,60,100,0.50)'),
                transition: 'all 0.18s',
              }}
            >
              {v === 'weekly' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '4px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* ── 1. Today's Session Card ── */}
        <div style={{
          borderRadius: 22, overflow: 'hidden',
          background: 'linear-gradient(135deg, #1a2880, #3d2090)',
          padding: '16px 20px 18px',
        }}>
          <p style={{ margin: '0 0 14px', fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
            Today&apos;s Session
          </p>

          {/* Step indicators */}
          <div style={{ display: 'flex', gap: 0, justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', marginBottom: 16 }}>
            {/* Connector line */}
            <div style={{
              position: 'absolute', top: 16, left: '16.6%', right: '16.6%', height: 1.5,
              background: 'rgba(255,255,255,0.12)', zIndex: 0,
            }} />
            <StepIndicator done={storyDoneToday}     label="Story" />
            <StepIndicator done={patternDoneToday}   label="Pattern" />
            {/* TODO: Challenge step — always ⬜ until daily_challenges is wired to this page */}
            <StepIndicator done={challengeDoneToday} label="Challenge" />
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${sessionPct}%`,
              background: sessionPct === 100
                ? 'linear-gradient(90deg, #6B8FFF, #D7B56D)'
                : 'linear-gradient(90deg, #6B8FFF, #9B7FE8)',
              borderRadius: 99,
              transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>

          {/* Motivation line */}
          <p style={{ margin: '10px 0 0', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.50)', lineHeight: 1.4 }}>
            {motivationLine}
          </p>
        </div>

        {/* ── 2. Four Stat Cards ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          <StatCard
            emoji="🔥" label="Streak"
            value={`${streak}d`}
            accent="#D7B56D"
            bg={isDark ? 'rgba(215,181,109,0.10)' : 'rgba(215,181,109,0.08)'}
            border={isDark ? 'rgba(215,181,109,0.22)' : 'rgba(215,181,109,0.28)'}
          />
          <StatCard
            emoji="📚" label="Sessions"
            value={`${weeklySessionCount}`}
            accent={isDark ? '#8EA7FF' : '#6B8FFF'}
            bg={isDark ? 'rgba(107,143,255,0.10)' : 'rgba(107,143,255,0.07)'}
            border={isDark ? 'rgba(107,143,255,0.22)' : 'rgba(107,143,255,0.20)'}
          />
          <StatCard
            emoji="🧩" label="Patterns"
            value={`${patternsLearned} / ${PATTERN_GOAL}`}
            accent={isDark ? '#CFC4FF' : '#9B7FE8'}
            bg={isDark ? 'rgba(164,120,255,0.10)' : 'rgba(164,120,255,0.07)'}
            border={isDark ? 'rgba(164,120,255,0.22)' : 'rgba(164,120,255,0.18)'}
          />
          {/* TODO: Challenges — query Supabase daily_challenges table when Challenge UI is built.
              Currently shows 0 as placeholder; is_correct count available in daily_challenges.is_correct */}
          <StatCard
            emoji="✍️" label="Challenges"
            value="–"
            accent={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(60,60,100,0.35)'}
            bg={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(60,60,100,0.04)'}
            border={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(60,60,100,0.08)'}
          />
        </div>

        {/* ── 3. Weekly Calendar (compact) ── */}
        <div style={{ ...glassCard, padding: '14px 14px 12px' }}>
          <p style={{ margin: '0 0 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(60,60,100,0.38)', textTransform: 'uppercase' }}>
            {viewMode === 'weekly' ? 'This Week' : 'Monthly'}
          </p>

          {viewMode === 'weekly' ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 3 }}>
              {weekDays.map((d, i) => {
                const iso     = toIso(d)
                const count   = dayCountMap[iso] ?? 0
                const done    = count > 0
                const isToday = iso === today
                const isFut   = d > new Date() && !isToday
                return (
                  <div key={iso} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.04em', color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(60,60,100,0.34)', textTransform: 'uppercase' }}>
                      {DOW_LABELS[i]}
                    </span>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: done
                        ? (isDark ? 'rgba(107,143,255,0.85)' : 'rgba(107,143,255,0.80)')
                        : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                      border: isToday && !done
                        ? `2px solid ${isDark ? 'rgba(107,143,255,0.60)' : 'rgba(107,143,255,0.55)'}`
                        : '2px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: isFut ? 0.22 : 1,
                      transition: 'background 0.2s',
                    }}>
                      {done ? (
                        <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <span style={{ fontSize: 9.5, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(40,40,80,0.34)' }}>
                          {d.getDate()}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 700, color: '#8EA7FF', lineHeight: 1, opacity: done ? 1 : 0 }}>
                      +{count}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <LearningCalendar
              onDaySelect={(iso) => setSelectedIso(prev => prev === iso ? null : iso)}
              selectedIso={selectedIso}
              futureSchedule={futureSchedule}
              streak={streak}
            />
          )}
        </div>

        {/* ── 4. Recent Sessions ── */}
        <div style={{ ...glassCard, padding: '14px 16px' }}>
          <p style={{ margin: '0 0 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(60,60,100,0.38)', textTransform: 'uppercase' }}>
            Recent Sessions
          </p>

          {recentSessions.length === 0 ? (
            <p style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(60,60,100,0.42)', margin: 0, paddingBottom: 2, lineHeight: 1.5 }}>
              Complete your first session to see it here.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentSessions.map(({ storyId, round, isMastered, lastCompletedAt, story }, i) => (
                <div
                  key={storyId}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 0',
                    borderTop: i === 0 ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  }}
                >
                  {/* Story number badge */}
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: isDark ? 'rgba(107,143,255,0.12)' : 'rgba(107,143,255,0.09)',
                    border: `1px solid ${isDark ? 'rgba(107,143,255,0.22)' : 'rgba(107,143,255,0.18)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: isDark ? '#8EA7FF' : '#6B8FFF', letterSpacing: '-0.01em' }}>
                      S{String(storyId).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Title + date */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.82)' : '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {story?.title ?? `Story ${storyId}`}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 10, color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(60,60,100,0.42)' }}>
                      {lastCompletedAt ? formatDate(lastCompletedAt) : '—'}
                    </p>
                  </div>

                  {/* Round / mastered badge */}
                  {isMastered ? (
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: '#D7B56D',
                      background: 'rgba(215,181,109,0.12)',
                      border: '1px solid rgba(215,181,109,0.28)',
                      borderRadius: 7, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      Mastered
                    </span>
                  ) : (
                    <span style={{
                      fontSize: 9, fontWeight: 700,
                      color: isDark ? '#8EA7FF' : '#6B8FFF',
                      background: 'rgba(107,143,255,0.10)',
                      border: '1px solid rgba(107,143,255,0.18)',
                      borderRadius: 7, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      Round {round}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 5. Trainer Message ── */}
        <div style={{
          ...glassCard,
          padding: '12px 16px',
          textAlign: 'center',
        }}>
          <p style={{
            margin: 0, fontSize: 12, fontWeight: 400,
            color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(60,60,100,0.45)',
            lineHeight: 1.5,
          }}>
            {trainerMsg}
          </p>
        </div>

      </div>
    </div>
  )
}
