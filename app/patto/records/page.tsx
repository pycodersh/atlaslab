'use client'

import { useEffect, useMemo, useState } from 'react'
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
function RingChart({ pct, size = 96, stroke = 8, color = '#6B8FFF' }: {
  pct: number; size?: number; stroke?: number; color?: string
}) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(pct, 100) / 100)
  return (
    <svg width={size} height={size} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
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
  const bannerGradient     = isOutperform
    ? 'linear-gradient(135deg, #1a2060, #3d1560)'
    : 'linear-gradient(135deg, #1a2880, #3d2090)'

  // My stories — started at least 1 round
  const myStoriesData = useMemo(() =>
    storyRounds
      .filter(r => r.round > 0)
      .map(r => ({ ...r, story: magazineStories.find(s => s.id === r.storyId)! }))
      .sort((a, b) => a.storyId - b.storyId),
  [storyRounds])

  // Shared glass card style (adapts to theme)
  const glassCard: React.CSSProperties = {
    borderRadius: 20,
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.68)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.82)'}`,
  }

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
          borderRadius: 24, overflow: 'hidden',
          background: bannerGradient,
          padding: '20px 22px 18px',
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

          {/* Ring + text row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <RingChart pct={weeklyPct} size={96} stroke={8} color={ringColor} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>
                  {weeklyPct}%
                </span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
                THIS WEEK
              </p>
              <p style={{ margin: '5px 0 3px', fontSize: 19, fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                {weeklyStoryCount} / {WEEKLY_GOAL} 스토리{isOutperform ? ' 🎉' : ''}
              </p>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.50)' }}>
                {isOutperform
                  ? '주간 목표 초과 달성!'
                  : `목표까지 ${Math.max(WEEKLY_GOAL - weeklyStoryCount, 0)}개 남았어요`}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 18 }}>
            <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.12)', position: 'relative' }}>
              <div style={{
                height: '100%', width: `${weeklyPct}%`,
                background: 'linear-gradient(90deg, #6B8FFF, #D7B56D)',
                borderRadius: 99,
                transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
                position: 'relative',
              }}>
                {isOutperform && weeklyPct > 0 && (
                  <div style={{
                    position: 'absolute', right: -3, top: '50%', transform: 'translateY(-50%)',
                    width: 11, height: 11, borderRadius: '50%',
                    background: '#D7B56D',
                    boxShadow: '0 0 10px 4px rgba(215,181,109,0.55)',
                  }} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── 3 Chips ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          {/* 🔥 Streak */}
          <div style={{
            flex: 1, borderRadius: 16, padding: '14px 10px',
            background: isOutperform
              ? 'linear-gradient(135deg, rgba(215,181,109,0.22), rgba(215,181,109,0.10))'
              : 'linear-gradient(135deg, rgba(215,181,109,0.14), rgba(192,139,48,0.07))',
            border: `1px solid ${isOutperform ? 'rgba(215,181,109,0.45)' : 'rgba(215,181,109,0.20)'}`,
            boxShadow: isOutperform ? '0 0 16px rgba(215,181,109,0.22)' : 'none',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, lineHeight: 1 }}>🔥</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#D7B56D', lineHeight: 1.15, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{streak}</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(215,181,109,0.65)', marginTop: 3, textTransform: 'uppercase' }}>Streak</div>
          </div>

          {/* 📚 이번 주 스토리 */}
          <div style={{
            flex: 1, borderRadius: 16, padding: '14px 10px',
            background: 'linear-gradient(135deg, rgba(107,143,255,0.16), rgba(74,122,200,0.07))',
            border: '1px solid rgba(107,143,255,0.20)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, lineHeight: 1 }}>📚</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#8EA7FF', lineHeight: 1.15, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{weeklyStoryCount}</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(142,167,255,0.60)', marginTop: 3, textTransform: 'uppercase' }}>이번 주</div>
          </div>

          {/* ⚡ 이번 주 패턴 */}
          <div style={{
            flex: 1, borderRadius: 16, padding: '14px 10px',
            background: 'linear-gradient(135deg, rgba(178,143,255,0.16), rgba(140,107,200,0.07))',
            border: '1px solid rgba(178,143,255,0.20)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, lineHeight: 1 }}>⚡</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#CFC4FF', lineHeight: 1.15, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{weeklyPatternCount}</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(178,143,255,0.60)', marginTop: 3, textTransform: 'uppercase' }}>패턴</div>
          </div>
        </div>

        {/* ── Weekly / Monthly section ── */}
        <div style={{ ...glassCard, padding: '18px 16px 16px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(60,60,100,0.42)', textTransform: 'uppercase' }}>
            {viewMode === 'weekly' ? 'WEEKLY' : 'MONTHLY'}
          </p>

          {viewMode === 'weekly' ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
              {weekDays.map((d, i) => {
                const iso     = toIso(d)
                const count   = dayCountMap[iso] ?? 0
                const done    = count > 0
                const isToday = iso === today
                const isFut   = d > new Date() && !isToday
                return (
                  <div key={iso} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', color: isDark ? 'rgba(255,255,255,0.32)' : 'rgba(60,60,100,0.38)', textTransform: 'uppercase' }}>
                      {DOW_LABELS[i]}
                    </span>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: done
                        ? 'linear-gradient(135deg, #4A7AC8, #6B8FFF)'
                        : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                      border: isToday && !done
                        ? '2px solid rgba(107,143,255,0.65)'
                        : '2px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: isFut ? 0.28 : 1,
                      transition: 'background 0.2s',
                    }}>
                      {done ? (
                        <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                          <path d="M3 7l3 3 5-5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(40,40,80,0.38)' }}>
                          {d.getDate()}
                        </span>
                      )}
                    </div>
                    {done && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#6B8FFF', lineHeight: 1 }}>+{count}</span>
                    )}
                    {!done && <span style={{ fontSize: 9, color: 'transparent' }}>·</span>}
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
          <div style={{ ...glassCard, padding: '28px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(60,60,100,0.6)', margin: '0 0 6px' }}>
              아직 시작한 스토리가 없어요
            </p>
            <p style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(60,60,100,0.4)', margin: 0, lineHeight: 1.6 }}>
              스토리를 완료하면 여기에 기록돼요
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
