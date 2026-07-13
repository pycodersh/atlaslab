'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { useTrainerSafe } from '@/contexts/TrainerContext'
import { useAuth } from '@/contexts/AuthContext'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { TopNav } from '@/components/TopNav'
import { getDailyStats, getActivityByDate, todayStr } from '@/lib/srs/storage'
import { loadStats } from '@/lib/adaptive/adaptive-engine'
import { loadStatsFromSupabase } from '@/lib/adaptive/supabase-sync'
import { magazineStories } from '@/data/magazine-stories'
import { getStoryRound, getStoryStatus, type StoryRoundData } from '@/lib/srs/story-round'

const PATTERN_GOAL = 500

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeekDays(): Date[] {
  const today = new Date()
  const dow = today.getDay()
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

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: '6px 0 -4px 2px', fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: '#5C6BC0', textTransform: 'uppercase' }}>
      {children}
    </p>
  )
}

// ── Glass card style helper ────────────────────────────────────────────────────
function glassStyle(isDark: boolean): React.CSSProperties {
  return {
    borderRadius: 20,
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.85)'}`,
  }
}

// ── Section 1: Today's Session ─────────────────────────────────────────────────
function TodaySessionCard({
  storyDone, patternDone, challengeDone, isDark, motivationLine,
}: {
  storyDone: boolean; patternDone: boolean; challengeDone: boolean; isDark: boolean; motivationLine: string
}) {
  const steps = [
    { label: 'Story',     done: storyDone,     active: !storyDone },
    { label: 'Pattern',   done: patternDone,   active: storyDone && !patternDone },
    { label: 'Challenge', done: challengeDone, active: patternDone && !challengeDone },
  ]

  return (
    <div style={{ borderRadius: 20, background: '#EEF1FF', padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
        {/* connector line 1: from center of step1 to center of step2 */}
        <div style={{
          position: 'absolute', top: 15, height: 2, zIndex: 0,
          left: 'calc(100% / 6 + 15px)',
          width: 'calc(100% / 3 - 30px)',
          background: storyDone ? '#5C6BC0' : '#e0e3f0',
        }} />
        {/* connector line 2: from center of step2 to center of step3 */}
        <div style={{
          position: 'absolute', top: 15, height: 2, zIndex: 0,
          left: 'calc(100% / 2 + 15px)',
          width: 'calc(100% / 3 - 30px)',
          background: patternDone ? '#5C6BC0' : '#e0e3f0',
        }} />

        {steps.map(({ label, done, active }) => (
          <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: done ? '#5C6BC0' : active ? '#EEF1FF' : '#f0f1f5',
              border: done ? 'none' : active ? '2px solid #5C6BC0' : '1.5px solid #e0e0e0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
            }}>
              {done ? (
                <svg width={13} height={13} viewBox="0 0 13 13" fill="none">
                  <path d="M2.5 6.5l3 3 5-5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: active ? '#5C6BC0' : '#d0d0d0' }} />
              )}
            </div>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: done || active ? '#5C6BC0' : '#bbb',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>
      <p style={{ margin: '12px 0 0', fontSize: 11, fontWeight: 500, color: '#5C6BC0', lineHeight: 1.4 }}>
        {motivationLine}
      </p>
    </div>
  )
}

// ── Section 2: Stat chips ──────────────────────────────────────────────────────
function StatChips({ streak, totalSessions, patternsLearned, isDark }: {
  streak: number; totalSessions: number; patternsLearned: number; isDark: boolean
}) {
  const chips = [
    { label: 'STREAK',     value: `${streak}`,           accent: '#F4511E' },
    { label: 'SESSIONS',   value: `${totalSessions}`,   accent: '#5C6BC0' },
    { label: 'PATTERNS',   value: `${patternsLearned}`, accent: '#9575CD' },
    { label: 'CHALLENGES', value: '–',                  accent: '#F5A623' },
  ]
  return (
    <div style={{ display: 'flex', gap: 7 }}>
      {chips.map(c => (
        <div key={c.label} style={{
          flex: 1, borderRadius: 14, padding: '12px 4px',
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.60)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: isDark ? '0.5px solid rgba(255,255,255,0.12)' : '0.5px solid rgba(255,255,255,0.80)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: c.accent, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {c.value}
          </span>
          <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.5px', color: c.accent, opacity: 0.75, textTransform: 'uppercase', textAlign: 'center' }}>
            {c.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Section 3: Recent Sessions ─────────────────────────────────────────────────
function RecentSessions({ storyRounds, isDark }: { storyRounds: StoryRoundData[]; isDark: boolean }) {
  const textMuted  = isDark ? '#a0a0c0' : '#5a5a7a'
  const textStrong = isDark ? '#e8e8f0' : '#1a1a2e'
  const divider    = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'

  const recent = useMemo(() =>
    storyRounds
      .filter(r => r.round > 0 && r.lastCompletedAt)
      .sort((a, b) => (b.lastCompletedAt ?? '').localeCompare(a.lastCompletedAt ?? ''))
      .slice(0, 5)
      .map(r => ({ ...r, story: magazineStories.find(s => s.id === r.storyId) })),
  [storyRounds])

  return (
    <div style={{ ...glassStyle(isDark), padding: '14px 16px' }}>
      {recent.length === 0 ? (
        <p style={{ fontSize: 13, color: textMuted, margin: 0 }}>Complete your first session to see it here.</p>
      ) : (
        <div>
          {recent.map(({ storyId, round, isMastered, lastCompletedAt, story }, i) => (
            <div key={storyId} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 0',
              borderTop: i === 0 ? 'none' : `1px solid ${divider}`,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: '#EEF1FF',
                border: '1px solid rgba(92,107,192,0.20)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#5C6BC0' }}>
                  S{String(storyId).padStart(2, '0')}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: textStrong, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {story?.title ?? `Story ${storyId}`}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: textMuted }}>
                  {lastCompletedAt ? formatDate(lastCompletedAt) : '—'}
                </p>
              </div>
              {isMastered ? (
                <span style={{ fontSize: 9, fontWeight: 700, color: '#4CAF50', background: 'rgba(76,175,80,0.10)', border: '1px solid rgba(76,175,80,0.28)', borderRadius: 7, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Mastered
                </span>
              ) : (
                <span style={{ fontSize: 9, fontWeight: 700, color: '#5C6BC0', background: '#EEF1FF', border: '1px solid rgba(92,107,192,0.25)', borderRadius: 7, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Round {round}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Section 4: This Week Calendar ─────────────────────────────────────────────
function WeekCalendar({ activityMap, isDark }: { activityMap: Record<string, number>; isDark: boolean }) {
  const textMuted = isDark ? '#a0a0c0' : '#5a5a7a'
  const today     = useMemo(() => toIso(new Date()), [])
  const weekDays  = useMemo(() => getWeekDays(), [])

  const attendedDays = weekDays.filter(d => (activityMap[toIso(d)] ?? 0) > 0).length

  const weekLabel = useMemo(() => {
    const first = weekDays[0]
    const last  = weekDays[6]
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${fmt(first)} – ${fmt(last).replace(/\w+ /, '')}`
  }, [weekDays])

  return (
    <div style={{ ...glassStyle(isDark), padding: '14px 14px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: textMuted }}>{weekLabel}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#5C6BC0' }}>{attendedDays} / 7 days</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 3 }}>
        {weekDays.map((d, i) => {
          const iso     = toIso(d)
          const done    = (activityMap[iso] ?? 0) > 0
          const isToday = iso === today
          const isFut   = d > new Date() && !isToday
          return (
            <div key={iso} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: textMuted, textTransform: 'uppercase' }}>
                {DOW_LABELS[i]}
              </span>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: done ? '#5C6BC0' : isToday ? '#EEF1FF' : (isDark ? 'rgba(255,255,255,0.05)' : '#f0f1f5'),
                border: isToday && !done ? '2px solid #E53935' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: isFut ? 0.35 : 1,
                transition: 'background 0.2s',
              }}>
                {done ? (
                  <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 600, color: isToday ? '#E53935' : (isDark ? '#666' : '#aaa'), lineHeight: 1 }}>
                    {d.getDate()}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Section 5: Overall Progress (accordion) ────────────────────────────────────
function OverallAccordion({ patternsLearned, storyRounds, isDark }: {
  patternsLearned: number; storyRounds: StoryRoundData[]; isDark: boolean
}) {
  const [mapOpen, setMapOpen] = useState(false)

  const textMuted = isDark ? '#a0a0c0' : '#5a5a7a'
  const pct       = Math.min(100, Math.round((patternsLearned / PATTERN_GOAL) * 100))

  const storyRoundMap = useMemo(() => {
    const m: Record<number, StoryRoundData> = {}
    for (const r of storyRounds) m[r.storyId] = r
    return m
  }, [storyRounds])

  function storyColor(storyId: number): { bg: string; text: string; border?: string } {
    const r = storyRoundMap[storyId]
    if (!r || r.round === 0) return { bg: isDark ? 'rgba(255,255,255,0.05)' : '#f0f1f5', text: '#ccc' }
    if (r.isMastered)         return { bg: '#E8F5E9', text: '#4CAF50' }
    return { bg: '#EEF1FF', text: '#5C6BC0', border: '1.5px solid rgba(92,107,192,0.35)' }
  }

  return (
    <div style={{ ...glassStyle(isDark), padding: '16px 16px' }}>

      {/* Percentage + pattern count + bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#5C6BC0', lineHeight: 1 }}>{pct}%</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#5C6BC0' }}>{patternsLearned} / {PATTERN_GOAL} patterns</span>
        </div>
        <div style={{ height: 6, borderRadius: 99, background: '#EEF1FF', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: '#5C6BC0', borderRadius: 99,
            transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
      </div>

      {/* Story map accordion */}
      <button
        type="button"
        onClick={() => setMapOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 0', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: '#5C6BC0', textTransform: 'uppercase' }}>
          Story Map
        </span>
        <svg width={14} height={14} viewBox="0 0 16 16" fill="none"
          style={{ transition: 'transform 0.3s ease', transform: mapOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
        >
          <path d="M4 6l4 4 4-4" stroke={textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div style={{ maxHeight: mapOpen ? '2000px' : 0, overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
        <div style={{ paddingTop: 10, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
          {magazineStories.map(s => {
            const c = storyColor(s.id)
            const r = storyRoundMap[s.id]
            const total = s.patterns.length
            const done  = r?.round > 0 ? total : 0
            return (
              <div key={s.id} style={{
                borderRadius: 10, padding: '7px 4px',
                background: c.bg, border: c.border ?? 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: c.text, lineHeight: 1 }}>
                  S{String(s.id).padStart(2, '0')}
                </span>
                <span style={{ fontSize: 9, color: c.text, opacity: 0.7, fontWeight: 600 }}>
                  {r?.round > 0 ? `${done}/${total}` : '–'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ProgressPage() {
  const { theme } = useTheme()
  const isDark    = theme === 'dark'
  const { user }  = useAuth()
  const trainer   = useTrainerSafe()

  const [storyRounds,    setStoryRounds]    = useState<StoryRoundData[]>([])
  const [todayStats,     setTodayStats]     = useState({ stories: 0, patterns: 0, reviews: 0 })
  const [activityMap,    setActivityMap]    = useState<Record<string, number>>({})
  const [mounted,        setMounted]        = useState(false)
  const [streak,         setStreak]         = useState(0)
  const [totalSessions,  setTotalSessions]  = useState(0)
  const [patternsLearned,setPatternsLearned]= useState(0)

  useEffect(() => {
    async function init() {
      if (user?.id) await loadStatsFromSupabase(user.id)

      const adaptiveStats = loadStats()
      const rounds        = magazineStories.map(s => getStoryRound(s.id))
      const daily         = getDailyStats(todayStr())
      const activity      = getActivityByDate()

      setStreak(adaptiveStats.currentStreak)
      setTotalSessions(adaptiveStats.totalSessions)
      setPatternsLearned(adaptiveStats.totalPatternsLearned)
      setStoryRounds(rounds)
      setTodayStats(daily)
      setActivityMap(activity)
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

  const today              = useMemo(() => toIso(new Date()), [])
  const storyDoneToday     = storyRounds.some(r => r.lastCompletedAt === today)
  const patternDoneToday   = todayStats.patterns > 0
  const challengeDoneToday = false

  const stepsDone = [storyDoneToday, patternDoneToday, challengeDoneToday].filter(Boolean).length
  const motivationLine = stepsDone === 0 ? "Start your session — you're ready."
    : stepsDone === 1 ? "Good start. Two steps to go."
    : stepsDone === 2 ? "One step left — finish strong."
    : "Session complete. Great work!"

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: TAB_BAR_HEIGHT + 24 }}>
      <TopNav />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '10px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>

        <SectionLabel>Today&apos;s Session</SectionLabel>
        <TodaySessionCard
          storyDone={storyDoneToday}
          patternDone={patternDoneToday}
          challengeDone={challengeDoneToday}
          isDark={isDark}
          motivationLine={motivationLine}
        />

        <StatChips
          streak={streak}
          totalSessions={totalSessions}
          patternsLearned={patternsLearned}
          isDark={isDark}
        />

        <SectionLabel>Recent Sessions</SectionLabel>
        <RecentSessions storyRounds={storyRounds} isDark={isDark} />

        <SectionLabel>This Week</SectionLabel>
        <WeekCalendar activityMap={activityMap} isDark={isDark} />

        <SectionLabel>Overall Progress</SectionLabel>
        <OverallAccordion
          patternsLearned={patternsLearned}
          storyRounds={storyRounds}
          isDark={isDark}
        />

      </div>
    </div>
  )
}
