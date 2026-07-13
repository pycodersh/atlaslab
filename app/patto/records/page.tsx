'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { useTrainerSafe } from '@/contexts/TrainerContext'
import { useAuth } from '@/contexts/AuthContext'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { TopNav } from '@/components/TopNav'
import { getDailyStats, getActivityByDate, todayStr } from '@/lib/srs/storage'
import { loadStats } from '@/lib/adaptive/adaptive-engine'
import { loadStatsFromSupabase } from '@/lib/adaptive/supabase-sync'
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

function StepIndicator({ done, active, label }: { done: boolean; active: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: done ? '#8EA7FF' : 'transparent',
        border: done ? 'none' : active ? '2px solid #5C6BC0' : '1.5px solid #C5CAE9',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s',
      }}>
        {done ? (
          <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
            <path d="M3 7l3 3 5-5" stroke="#1a1a2e" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: active ? '#5C6BC0' : '#C5CAE9',
          }} />
        )}
      </div>
      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
        color: done ? '#5C6BC0' : active ? '#5C6BC0' : '#C5CAE9',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
    </div>
  )
}

// SVG icons for stat cards
const FlameIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28">
    <path d="M12 2C12 2 8 7 8 11C8 13.5 9.5 15.5 12 16C14.5 15.5 16 13.5 16 11C16 7 12 2 12 2Z" fill="#F4511E"/>
    <path d="M12 16C10 16 8.5 17.5 8.5 19.5C8.5 21.5 10 23 12 23C14 23 15.5 21.5 15.5 19.5C15.5 17.5 14 16 12 16Z" fill="#FF8A65"/>
  </svg>
)

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28">
    <path d="M13 2L4 14H11L10 22L20 9H13L13 2Z" fill="#5C6BC0" stroke="#5C6BC0" strokeWidth="0.5"/>
  </svg>
)

const PuzzleIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28">
    <path d="M4 4h6v2.5C10 7.9 11.1 9 12.5 9S15 7.9 15 6.5V4h5v6h-2.5C16.1 10 15 11.1 15 12.5S16.1 15 17.5 15H20v5h-6v-2.5C14 16.1 12.9 15 11.5 15S9 16.1 9 17.5V20H4V4Z" fill="#9575CD"/>
  </svg>
)

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28">
    <path d="M7 3H17V13C17 16 14.8 18 12 18C9.2 18 7 16 7 13V3Z" fill="#F5A623"/>
    <path d="M5 5H7V10C5.5 10 4 8.5 4 7C4 5.9 4.4 5 5 5Z" fill="#F5A623"/>
    <path d="M17 5H19C19.6 5 20 5.9 20 7C20 8.5 18.5 10 17 10V5Z" fill="#F5A623"/>
    <rect x="10" y="18" width="4" height="3" fill="#F5A623"/>
    <rect x="8" y="21" width="8" height="1.5" rx="0.75" fill="#F5A623"/>
  </svg>
)

function StatCard({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: string; accent: string
}) {
  return (
    <div style={{
      flex: 1,
      borderRadius: 16,
      padding: '14px 8px',
      background: 'rgba(255,255,255,0.65)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '0.5px solid rgba(255,255,255,0.80)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    }}>
      <div style={{ lineHeight: 1 }}>{icon}</div>
      <span style={{ fontSize: 24, fontWeight: 700, color: accent, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{value}</span>
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: accent, opacity: 0.7, textTransform: 'uppercase' }}>{label}</span>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ProgressPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { user } = useAuth()

  const [storyRounds,    setStoryRounds]    = useState<StoryRoundData[]>([])
  const [todayStats,     setTodayStats]     = useState({ stories: 0, patterns: 0, reviews: 0 })
  const [viewMode,       setViewMode]       = useState<'weekly' | 'monthly'>('weekly')
  const [futureSchedule, setFutureSchedule] = useState<Record<string, ScheduledDay>>({})
  const [selectedIso,    setSelectedIso]    = useState<string | null>(null)
  const [mounted,        setMounted]        = useState(false)

  // Adaptive-engine stats (currentStreak, totalSessions, totalPatternsLearned)
  // Synced to/from Supabase user_learning_stats via loadStatsFromSupabase
  const [streak,          setStreak]          = useState(0)
  const [totalSessions,   setTotalSessions]   = useState(0)
  const [patternsLearned, setPatternsLearned] = useState(0)

  const trainer = useTrainerSafe()

  useEffect(() => {
    async function init() {
      // If logged in: pull Supabase stats into localStorage first, then read
      if (user?.id) {
        await loadStatsFromSupabase(user.id)
      }

      const adaptiveStats = loadStats()
      const rounds        = magazineStories.map(s => getStoryRound(s.id))
      const daily         = getDailyStats(todayStr())

      setStreak(adaptiveStats.currentStreak)
      setTotalSessions(adaptiveStats.totalSessions)
      setPatternsLearned(adaptiveStats.totalPatternsLearned)
      setStoryRounds(rounds)
      setTodayStats(daily)
      setFutureSchedule(getFutureSchedule())
      setMounted(true)

      trainer?.setPage('progress')
      const msg = adaptiveStats.currentStreak > 0
        ? `${adaptiveStats.currentStreak} day streak. Keep it up.`
        : "Ready when you are."
      const t = setTimeout(() => trainer?.showMessage(msg, 3000), 900)
      return () => clearTimeout(t)
    }
    init()
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const today    = useMemo(() => toIso(new Date()), [])
  const weekDays = useMemo(() => getWeekDays(), [])
  const weekIsos = useMemo(() => new Set(weekDays.map(toIso)), [weekDays])

  // Completions this week (for calendar dots — from story-round localStorage)
  const weeklyCompleted = useMemo(() =>
    storyRounds.filter(r => r.lastCompletedAt && weekIsos.has(r.lastCompletedAt)),
  [storyRounds, weekIsos])

  // Day → session count map
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
  // TODO: Challenge step — daily_challenges Supabase table exists but not queried here yet.
  // Wire up when Challenge feature UI is built (daily_challenges.is_correct).
  const challengeDoneToday = false

  const stepsDone      = [storyDoneToday, patternDoneToday, challengeDoneToday].filter(Boolean).length
  const sessionPct     = Math.round((stepsDone / 3) * 100)
  const motivationLine = stepsDone === 0 ? "Start your session — you're ready."
    : stepsDone === 1 ? "Good start. Two steps to go."
    : stepsDone === 2 ? "One step left — finish strong."
    : "Session complete. Great work!"

  // Recent sessions — up to 3 most-recent completed story rounds
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

  // Trainer message based on total sessions
  const trainerMsg = totalSessions === 0 ? "Ready when you are."
    : totalSessions <= 3 ? "Good start. Keep going."
    : totalSessions <= 10 ? `Great work. ${totalSessions} sessions completed.`
    : "You're on a roll. Keep it up."

  const glassCard: React.CSSProperties = {
    borderRadius: 20,
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.68)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.82)'}`,
  }

  const textMuted  = isDark ? '#a0a0c0' : '#5a5a7a'
  const textStrong = isDark ? '#e8e8f0' : '#1a1a2e'

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: TAB_BAR_HEIGHT + 24 }}>

      {/* ── TopNav (same as Home/Library) ── */}
      <TopNav />

      {/* ── Weekly / Monthly toggle row ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 20px 4px' }}>
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
                color: viewMode === v ? (isDark ? '#1a1060' : '#fff') : textMuted,
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
          background: '#EEF1FF',
          padding: '16px 20px 18px',
        }}>
          <p style={{ margin: '0 0 14px', fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: '#5C6BC0', textTransform: 'uppercase' }}>
            Today&apos;s Session
          </p>

          <div style={{ display: 'flex', gap: 0, justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', marginBottom: 16 }}>
            <div style={{
              position: 'absolute', top: 16, left: '16.6%', right: '16.6%', height: 1.5,
              background: 'rgba(255,255,255,0.16)', zIndex: 0,
            }} />
            <StepIndicator done={storyDoneToday}     active={!storyDoneToday}                        label="Story" />
            <StepIndicator done={patternDoneToday}   active={storyDoneToday && !patternDoneToday}     label="Pattern" />
            {/* TODO: Challenge step — always false until daily_challenges is wired to this page */}
            <StepIndicator done={challengeDoneToday} active={patternDoneToday && !challengeDoneToday} label="Challenge" />
          </div>

          <div style={{ height: 4, borderRadius: 99, background: 'rgba(92,107,192,0.15)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${sessionPct}%`,
              background: 'linear-gradient(90deg, #6B8FFF, #CFC4FF)',
              borderRadius: 99,
              transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>

          <p style={{ margin: '10px 0 0', fontSize: 11, fontWeight: 500, color: '#5C6BC0', lineHeight: 1.4 }}>
            {motivationLine}
          </p>
        </div>

        {/* ── 2. Four Stat Cards ──
            Data sources:
            · STREAK    → adaptive-engine currentStreak (synced from user_learning_stats.current_streak)
            · SESSIONS  → adaptive-engine totalSessions (synced from user_learning_stats.total_sessions)
            · PATTERNS  → adaptive-engine totalPatternsLearned (synced from user_learning_stats.total_patterns_learned)
            · CHALLENGES → TODO: query daily_challenges table when Challenge UI is built
        */}
        <div style={{ display: 'flex', gap: 8 }}>
          <StatCard icon={<FlameIcon />}  label="Streak"     value={`${streak}d`}                            accent="#F4511E" />
          <StatCard icon={<BoltIcon />}   label="Sessions"   value={`${totalSessions}`}                      accent="#5C6BC0" />
          <StatCard icon={<PuzzleIcon />} label="Patterns"   value={`${patternsLearned} / ${PATTERN_GOAL}`}  accent="#9575CD" />
          <StatCard icon={<TrophyIcon />} label="Challenges" value="–"                                       accent="#F5A623" />
        </div>

        {/* ── 3. Weekly / Monthly Calendar ── */}
        <div style={{ ...glassCard, padding: '14px 14px 12px' }}>
          <p style={{ margin: '0 0 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: textMuted, textTransform: 'uppercase' }}>
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
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#3a3a5c', textTransform: 'uppercase' }}>
                      {DOW_LABELS[i]}
                    </span>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: done || (isToday && !done)
                        ? '#6B8FFF'
                        : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: isFut ? 0.35 : 1,
                      transition: 'background 0.2s',
                    }}>
                      {done ? (
                        <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <span style={{ fontSize: 14, fontWeight: 600, color: isToday ? '#fff' : '#1a1a2e', lineHeight: 1 }}>
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
          <p style={{ margin: '0 0 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: textMuted, textTransform: 'uppercase' }}>
            Recent Sessions
          </p>

          {recentSessions.length === 0 ? (
            <p style={{ fontSize: 13, color: textMuted, margin: 0, paddingBottom: 2, lineHeight: 1.5 }}>
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
                    borderTop: i === 0 ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: isDark ? 'rgba(107,143,255,0.12)' : 'rgba(107,143,255,0.09)',
                    border: `1px solid ${isDark ? 'rgba(107,143,255,0.22)' : 'rgba(107,143,255,0.18)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: isDark ? '#8EA7FF' : '#6B8FFF' }}>
                      S{String(storyId).padStart(2, '0')}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: textStrong, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {story?.title ?? `Story ${storyId}`}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: textMuted }}>
                      {lastCompletedAt ? formatDate(lastCompletedAt) : '—'}
                    </p>
                  </div>

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
          borderRadius: 16, padding: '16px',
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '0.5px solid rgba(255,255,255,0.80)',
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#3a3a5c', lineHeight: 1.5 }}>
            {trainerMsg}
          </p>
        </div>

      </div>
    </div>
  )
}
