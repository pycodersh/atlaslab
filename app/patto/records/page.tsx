'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { useTrainerSafe } from '@/contexts/TrainerContext'
import { useAuth } from '@/contexts/AuthContext'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { TopNav } from '@/components/TopNav'
import { getDailyStats, getActivityByDate, todayStr, localDateStr } from '@/lib/srs/storage'
import { loadStats } from '@/lib/adaptive/adaptive-engine'
import { loadStatsFromSupabase } from '@/lib/adaptive/supabase-sync'
import { magazineStories } from '@/data/magazine-stories'
import { getStoryRound, getStoryStatus, type StoryRoundData } from '@/lib/srs/story-round'

// ── Constants ──────────────────────────────────────────────────────────────────
const PATTERN_GOAL = 500

// ── Helpers ────────────────────────────────────────────────────────────────────
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

// ── Sub-components ─────────────────────────────────────────────────────────────

function StepIndicator({ done, active, label }: { done: boolean; active: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: done ? '#5C6BC0' : active ? '#EEF1FF' : '#f0f1f5',
        border: done ? 'none' : active ? '2px solid #5C6BC0' : '1.5px solid #ddd',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s',
      }}>
        {done ? (
          <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
            <path d="M3 7l3 3 5-5" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: active ? '#5C6BC0' : '#ccc',
          }} />
        )}
      </div>
      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
        color: done ? '#5C6BC0' : active ? '#5C6BC0' : '#bbb',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
    </div>
  )
}

function StatCard4({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: string; accent: string
}) {
  return (
    <div style={{
      flex: 1,
      borderRadius: 14,
      padding: '12px 6px',
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '0.5px solid rgba(255,255,255,0.85)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
    }}>
      <div style={{ lineHeight: 1, fontSize: 20 }}>{icon}</div>
      <span style={{ fontSize: 22, fontWeight: 700, color: accent, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{value}</span>
      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.07em', color: accent, opacity: 0.75, textTransform: 'uppercase' }}>{label}</span>
    </div>
  )
}

function RecentSessionList({ storyRounds }: { storyRounds: StoryRoundData[] }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textMuted  = isDark ? '#a0a0c0' : '#5a5a7a'
  const textStrong = isDark ? '#e8e8f0' : '#1a1a2e'

  const recent = useMemo(() =>
    storyRounds
      .filter(r => r.round > 0 && r.lastCompletedAt)
      .sort((a, b) => (b.lastCompletedAt ?? '').localeCompare(a.lastCompletedAt ?? ''))
      .slice(0, 5)
      .map(r => ({ ...r, story: magazineStories.find(s => s.id === r.storyId) })),
  [storyRounds])

  if (recent.length === 0) {
    return (
      <p style={{ fontSize: 13, color: textMuted, margin: 0, lineHeight: 1.5 }}>
        Complete your first session to see it here.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {recent.map(({ storyId, round, isMastered, lastCompletedAt, story }, i) => (
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
            <span style={{
              fontSize: 9, fontWeight: 700, color: '#4CAF50',
              background: 'rgba(76,175,80,0.10)',
              border: '1px solid rgba(76,175,80,0.28)',
              borderRadius: 7, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              Mastered
            </span>
          ) : (
            <span style={{
              fontSize: 9, fontWeight: 700, color: '#5C6BC0',
              background: '#EEF1FF',
              border: '1px solid rgba(92,107,192,0.25)',
              borderRadius: 7, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              Round {round}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Today Tab ──────────────────────────────────────────────────────────────────

function TodayTab({
  storyRounds, streak, totalSessions, patternsLearned,
  storyDoneToday, patternDoneToday, challengeDoneToday,
  motivationLine, sessionPct,
}: {
  storyRounds: StoryRoundData[]
  streak: number; totalSessions: number; patternsLearned: number
  storyDoneToday: boolean; patternDoneToday: boolean; challengeDoneToday: boolean
  motivationLine: string; sessionPct: number
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const glassCard: React.CSSProperties = {
    borderRadius: 20,
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.68)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.82)'}`,
  }
  const textMuted = isDark ? '#a0a0c0' : '#5a5a7a'

  const stepsDone = [storyDoneToday, patternDoneToday, challengeDoneToday].filter(Boolean).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* TODAY'S SESSION */}
      <div style={{
        borderRadius: 22, overflow: 'hidden',
        background: '#EEF1FF',
        padding: '16px 20px 18px',
      }}>
        <p style={{ margin: '0 0 14px', fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: '#5C6BC0', textTransform: 'uppercase' }}>
          Today&apos;s Session
        </p>

        <div style={{ display: 'flex', gap: 0, justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', marginBottom: 16 }}>
          {/* connector lines */}
          <div style={{
            position: 'absolute', top: 16, left: '20%', width: '27%', height: 2,
            background: storyDoneToday ? '#5C6BC0' : '#e0e3f0', zIndex: 0,
          }} />
          <div style={{
            position: 'absolute', top: 16, left: '53%', width: '27%', height: 2,
            background: patternDoneToday ? '#5C6BC0' : '#e0e3f0', zIndex: 0,
          }} />
          <StepIndicator done={storyDoneToday}     active={!storyDoneToday}                        label="Story" />
          <StepIndicator done={patternDoneToday}   active={storyDoneToday && !patternDoneToday}     label="Pattern" />
          <StepIndicator done={challengeDoneToday} active={patternDoneToday && !challengeDoneToday} label="Challenge" />
        </div>

        <div style={{ height: 4, borderRadius: 99, background: 'rgba(92,107,192,0.15)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${sessionPct}%`,
            background: 'linear-gradient(90deg, #5C6BC0, #8EA7FF)',
            borderRadius: 99, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 11, fontWeight: 500, color: '#5C6BC0', lineHeight: 1.4 }}>
          {motivationLine}
        </p>
      </div>

      {/* 4 stat cards */}
      <div style={{ display: 'flex', gap: 7 }}>
        <StatCard4 icon="🔥" label="Streak"     value={`${streak}d`}   accent="#F4511E" />
        <StatCard4 icon="⚡" label="Sessions"   value={`${totalSessions}`} accent="#5C6BC0" />
        <div style={{
          flex: 1, borderRadius: 14, padding: '12px 6px',
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '0.5px solid rgba(255,255,255,0.85)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        }}>
          <div style={{ lineHeight: 1, fontSize: 20 }}>🧩</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#9575CD', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', textAlign: 'center' }}>
            {patternsLearned}<span style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>/{PATTERN_GOAL}</span>
          </span>
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.07em', color: '#9575CD', opacity: 0.75, textTransform: 'uppercase' }}>Patterns</span>
        </div>
        <StatCard4 icon="🏆" label="Challenges" value="–" accent="#F5A623" />
      </div>

      {/* Recent sessions */}
      <div style={{ ...glassCard, padding: '14px 16px' }}>
        <p style={{ margin: '0 0 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: textMuted, textTransform: 'uppercase' }}>
          Recent Sessions
        </p>
        <RecentSessionList storyRounds={storyRounds} />
      </div>

    </div>
  )
}

// ── Weekly Tab ─────────────────────────────────────────────────────────────────

function WeeklyTab({ storyRounds, activityMap }: {
  storyRounds: StoryRoundData[]
  activityMap: Record<string, number>
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textMuted = isDark ? '#a0a0c0' : '#5a5a7a'

  const glassCard: React.CSSProperties = {
    borderRadius: 20,
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.68)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.82)'}`,
  }

  const today = useMemo(() => toIso(new Date()), [])
  const weekDays = useMemo(() => getWeekDays(), [])

  // Days attended this week
  const attendedDays = weekDays.filter(d => (activityMap[toIso(d)] ?? 0) > 0).length

  // Week label e.g. "Jul 7–13"
  const weekLabel = useMemo(() => {
    const first = weekDays[0]
    const last  = weekDays[6]
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${fmt(first)} – ${fmt(last).replace(/\w+ /, '')}`
  }, [weekDays])

  // Weekly stats
  const weekIsos = useMemo(() => new Set(weekDays.map(toIso)), [weekDays])
  const weeklyCompleted = storyRounds.filter(r => r.lastCompletedAt && weekIsos.has(r.lastCompletedAt))
  const weeklySessions  = weeklyCompleted.length
  const weeklyPatterns  = useMemo(() => {
    let total = 0
    for (const iso of weekIsos) {
      const s = getDailyStats(iso)
      total += s.patterns
    }
    return total
  }, [weekIsos])

  const weekStatChips = [
    { label: 'Sessions',  value: weeklySessions, accent: '#5C6BC0' },
    { label: 'Patterns',  value: weeklyPatterns, accent: '#9575CD' },
    { label: 'Days',      value: attendedDays,   accent: '#F4511E' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Weekly calendar */}
      <div style={{ ...glassCard, padding: '14px 14px 12px' }}>
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
                  border: isToday && !done ? '2px solid #5C6BC0' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: isFut ? 0.35 : 1,
                  transition: 'background 0.2s',
                }}>
                  {done ? (
                    <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 600, color: isToday ? '#5C6BC0' : (isDark ? '#666' : '#aaa'), lineHeight: 1 }}>
                      {d.getDate()}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly stats */}
      <div style={{ display: 'flex', gap: 7 }}>
        {weekStatChips.map(c => (
          <div key={c.label} style={{
            flex: 1, borderRadius: 14, padding: '12px 6px',
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '0.5px solid rgba(255,255,255,0.85)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: c.accent, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{c.value}</span>
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.07em', color: c.accent, opacity: 0.75, textTransform: 'uppercase' }}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Recent sessions */}
      <div style={{ ...glassCard, padding: '14px 16px' }}>
        <p style={{ margin: '0 0 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: textMuted, textTransform: 'uppercase' }}>
          Recent Sessions
        </p>
        <RecentSessionList storyRounds={storyRounds} />
      </div>
    </div>
  )
}

// ── Overall Tab ────────────────────────────────────────────────────────────────

function OverallTab({ patternsLearned, streak, storyRounds }: {
  patternsLearned: number; streak: number; storyRounds: StoryRoundData[]
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const glassCard: React.CSSProperties = {
    borderRadius: 20,
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.68)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.82)'}`,
  }
  const textMuted = isDark ? '#a0a0c0' : '#5a5a7a'

  const pct = Math.min(100, Math.round((patternsLearned / PATTERN_GOAL) * 100))

  // SRS status counts from storyRounds
  const srsCount = useMemo(() => {
    let newC = 0, learning = 0, review = 0, mastered = 0
    for (const s of magazineStories) {
      const status = getStoryStatus(s.id)
      if (status === 'mastered')    mastered++
      else if (status === 'review_due') review++
      else if (status === 'learning')   learning++
      else                              newC++
    }
    return { new: newC, learning, review, mastered }
  }, [])

  // Story map: pattern count per story
  const patternCountByStory = useMemo(() => {
    const map: Record<number, number> = {}
    for (const s of magazineStories) map[s.id] = s.patterns.length
    return map
  }, [])

  const storyRoundMap = useMemo(() => {
    const m: Record<number, StoryRoundData> = {}
    for (const r of storyRounds) m[r.storyId] = r
    return m
  }, [storyRounds])

  // Story map status color
  function storyColor(storyId: number): { bg: string; text: string; border?: string } {
    const r = storyRoundMap[storyId]
    if (!r || r.round === 0) return { bg: '#f0f1f5', text: '#ccc' }
    if (r.isMastered)         return { bg: '#E8F5E9', text: '#4CAF50' }
    return { bg: '#EEF1FF', text: '#5C6BC0', border: '1.5px solid rgba(92,107,192,0.35)' }
  }

  const SRS_CHIPS = [
    { label: 'New',       value: srsCount.new,      accent: '#9575CD', bg: 'rgba(149,117,205,0.08)' },
    { label: 'Learning',  value: srsCount.learning,  accent: '#5C6BC0', bg: 'rgba(92,107,192,0.08)' },
    { label: 'Review',    value: srsCount.review,    accent: '#F5A623', bg: 'rgba(245,166,35,0.08)' },
    { label: 'Mastered',  value: srsCount.mastered,  accent: '#4CAF50', bg: 'rgba(76,175,80,0.08)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Hero progress card */}
      <div style={{
        borderRadius: 22,
        background: '#5C6BC0',
        padding: '18px 20px 16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase' }}>
              전체 진행도
            </p>
            <span style={{ fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
              {patternsLearned} / {PATTERN_GOAL} 패턴
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 24 }}>🔥</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{streak}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Streak</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: '#fff', borderRadius: 99,
            transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          {['0', '250', '500'].map(v => (
            <span key={v} style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{v}</span>
          ))}
        </div>
      </div>

      {/* SRS status grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 7 }}>
        {SRS_CHIPS.map(c => (
          <div key={c.label} style={{
            borderRadius: 12, padding: '10px 4px',
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '0.5px solid rgba(255,255,255,0.85)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: c.accent, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{c.value}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: c.accent, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Story map */}
      <div style={{ ...glassCard, padding: '14px 14px' }}>
        <p style={{ margin: '0 0 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: textMuted, textTransform: 'uppercase' }}>
          Story Map
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
          {magazineStories.map(s => {
            const c = storyColor(s.id)
            const r = storyRoundMap[s.id]
            const total = patternCountByStory[s.id] ?? 0
            const done  = r?.round > 0 ? total : 0
            return (
              <div key={s.id} style={{
                borderRadius: 10, padding: '7px 4px',
                background: c.bg,
                border: c.border ?? 'none',
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

// ── Overall Accordion ─────────────────────────────────────────────────────────

function OverallAccordion({ patternsLearned, streak, storyRounds }: {
  patternsLearned: number; streak: number; storyRounds: StoryRoundData[]
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [open, setOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [open, storyRounds])

  const textMuted = isDark ? '#a0a0c0' : '#5a5a7a'
  const sectionBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)'
  const sectionBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.80)'

  return (
    <div style={{ borderRadius: 20, overflow: 'hidden', background: sectionBg, border: `1px solid ${sectionBorder}`, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: textMuted, textTransform: 'uppercase' }}>
          Overall
        </span>
        <svg
          width={16} height={16} viewBox="0 0 16 16" fill="none"
          style={{ transition: 'transform 0.3s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
        >
          <path d="M4 6l4 4 4-4" stroke={textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div style={{
        maxHeight: open ? contentHeight + 24 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }}>
        <div ref={contentRef} style={{ padding: '0 0 16px' }}>
          <OverallTab patternsLearned={patternsLearned} streak={streak} storyRounds={storyRounds} />
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ProgressPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { user } = useAuth()
  const trainer = useTrainerSafe()

  const [storyRounds,    setStoryRounds]    = useState<StoryRoundData[]>([])
  const [todayStats,     setTodayStats]     = useState({ stories: 0, patterns: 0, reviews: 0 })
  const [activityMap,    setActivityMap]    = useState<Record<string, number>>({})
  const [mounted,        setMounted]        = useState(false)

  const [streak,          setStreak]          = useState(0)
  const [totalSessions,   setTotalSessions]   = useState(0)
  const [patternsLearned, setPatternsLearned] = useState(0)

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

  const today = useMemo(() => toIso(new Date()), [])

  const storyDoneToday     = storyRounds.some(r => r.lastCompletedAt === today)
  const patternDoneToday   = todayStats.patterns > 0
  const challengeDoneToday = false

  const stepsDone  = [storyDoneToday, patternDoneToday, challengeDoneToday].filter(Boolean).length
  const sessionPct = Math.round((stepsDone / 3) * 100)
  const motivationLine = stepsDone === 0 ? "Start your session — you're ready."
    : stepsDone === 1 ? "Good start. Two steps to go."
    : stepsDone === 2 ? "One step left — finish strong."
    : "Session complete. Great work!"

  const textMuted = isDark ? '#a0a0c0' : '#5a5a7a'

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: TAB_BAR_HEIGHT + 24 }}>

      <TopNav />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '10px 20px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Section 1: TODAY'S SESSION */}
        <section>
          <p style={{ margin: '0 0 10px 2px', fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: textMuted, textTransform: 'uppercase' }}>
            Today&apos;s Session
          </p>
          <TodayTab
            storyRounds={storyRounds}
            streak={streak}
            totalSessions={totalSessions}
            patternsLearned={patternsLearned}
            storyDoneToday={storyDoneToday}
            patternDoneToday={patternDoneToday}
            challengeDoneToday={challengeDoneToday}
            motivationLine={motivationLine}
            sessionPct={sessionPct}
          />
        </section>

        {/* Section 2: WEEKLY */}
        <section>
          <p style={{ margin: '0 0 10px 2px', fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: textMuted, textTransform: 'uppercase' }}>
            Weekly
          </p>
          <WeeklyTab storyRounds={storyRounds} activityMap={activityMap} />
        </section>

        {/* Section 3: OVERALL (accordion) */}
        <section>
          <OverallAccordion patternsLearned={patternsLearned} streak={streak} storyRounds={storyRounds} />
        </section>

      </div>

    </div>
  )
}
