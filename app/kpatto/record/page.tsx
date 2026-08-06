'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Lock, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { ALL_STORIES } from '@/data/kpatto/sample-episode'
import {
  getStreak,
  getActivityByDate,
  localDateStr,
  getAllRecords,
} from '@/lib/srs/storage'
import { useKPattoSubscription } from '@/lib/kpatto/subscription'
import { FREE_EPISODES } from '@/lib/kpatto/config'
import { getCompletedEpisodeSet } from '@/lib/kpatto/episode-progress'

// ── Tokens ────────────────────────────────────────────────────────────────────
const ACCENT  = '#D4873A'
const T1      = '#111111'
const T2      = '#888888'
const T3      = '#BBBBBB'
const BG      = '#FFFFFF'
const BG2     = '#FAFAFA'
const BORDER  = '#EBEBEB'

// ── Chapter metadata ──────────────────────────────────────────────────────────
const TOTAL_EPISODES = 100
const CHAPTER_SIZE   = 10
const TOTAL_CHAPTERS = 10
const chapterOf = (ep: number) => Math.ceil(ep / CHAPTER_SIZE)

// ── Helpers ───────────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: BG, border: `1px solid ${BORDER}`,
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionTitle({ text, sub }: { text: string; sub?: string }) {
  return (
    <div style={{ padding: '20px 20px 12px' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: T1, letterSpacing: '-0.02em' }}>{text}</div>
      {sub && <div style={{ fontSize: 12, color: T2, marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

// ── Linear progress bar ───────────────────────────────────────────────────────
function LinearBar({ value, total, color = T1 }: { value: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0
  return (
    <div style={{ height: 6, background: BORDER, borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.5s ease' }} />
    </div>
  )
}

// ── Dot progress (10 dots) ────────────────────────────────────────────────────
function DotRow({ done, total = 10, locked = false }: { done: number; total?: number; locked?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: locked ? T3 : i < done ? ACCENT : BORDER,
        }} />
      ))}
    </div>
  )
}

// ── Week calendar ─────────────────────────────────────────────────────────────
function WeekCalendar({
  activityMap,
  joinedAt,
}: {
  activityMap: Record<string, number>
  joinedAt: string | null
}) {
  const days = useMemo(() => {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const key = localDateStr(d)
      const isToday = key === localDateStr(today)
      const isBefore = joinedAt ? key < joinedAt.slice(0, 10) : false
      return { label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i], key, isToday, isBefore }
    })
  }, [joinedAt])

  return (
    <div style={{ display: 'flex', padding: '4px 20px 20px', justifyContent: 'space-between', gap: 6 }}>
      {days.map(({ label, key, isToday, isBefore }, i) => {
        const done = !isBefore && (activityMap[key] ?? 0) > 0
        return (
          <div key={`${key}-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: isToday ? ACCENT : T3 }}>{label}</span>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: isToday ? ACCENT : done ? T1 : 'transparent',
              border: `2px solid ${isToday ? ACCENT : isBefore ? BORDER : done ? T1 : T3}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: isBefore ? 0.3 : 1,
            }}>
              {done && !isToday && (
                <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                  <path d="M1 4L4 7L10 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Chapter row (collapsible) ─────────────────────────────────────────────────
function ChapterRow({
  num,
  done,
  total,
  locked,
  eps,
  completedSet,
  expanded,
  onToggle,
}: {
  num: number
  done: number
  total: number
  locked: boolean
  eps: number[]
  completedSet: Set<number>
  expanded: boolean
  onToggle: () => void
}) {
  const start = (num - 1) * CHAPTER_SIZE + 1
  const end   = start + CHAPTER_SIZE - 1
  const status = locked
    ? 'Locked'
    : done === total ? 'Complete ✓' : done > 0 ? `${done} / ${total}` : 'Not started'
  const statusColor = locked ? T3 : done === total ? '#16A34A' : done > 0 ? ACCENT : T2

  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      {/* Header row */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: locked ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {locked && <Lock size={13} color={T3} strokeWidth={2} style={{ flexShrink: 0 }} />}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: locked ? T3 : T1 }}>
              Chapter {num} · EP{String(start).padStart(2, '0')}–{String(end).padStart(2, '0')}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: statusColor }}>{status}</span>
          </div>
          <DotRow done={done} locked={locked} />
        </div>
        {!locked && (
          expanded
            ? <ChevronUp size={15} color={T2} strokeWidth={2} style={{ flexShrink: 0 }} />
            : <ChevronDown size={15} color={T2} strokeWidth={2} style={{ flexShrink: 0 }} />
        )}
      </button>

      {/* Expanded episode list */}
      {expanded && !locked && (
        <div style={{ background: BG2, borderTop: `1px solid ${BORDER}` }}>
          {eps.map((ep, i) => {
            const story = ALL_STORIES.find(s => s.episode === ep)
            const title = story?.title ?? `Episode ${ep}`
            const isDone = completedSet.has(ep)
            const epId = `kp-ep-${String(ep).padStart(3, '0')}`
            return (
              <Link
                key={ep}
                href={`/kpatto/story/${epId}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 20px',
                  textDecoration: 'none',
                  borderBottom: i < eps.length - 1 ? `1px solid ${BORDER}` : 'none',
                }}
              >
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: isDone ? '#16A34A' : ACCENT,
                  minWidth: 32,
                }}>
                  EP{String(ep).padStart(2, '0')}
                </span>
                <span style={{ flex: 1, fontSize: 13, color: isDone ? T2 : T1, fontWeight: isDone ? 400 : 600 }}>
                  {title}
                </span>
                {isDone
                  ? <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 600 }}>Done</span>
                  : <ChevronRight size={14} color={T3} strokeWidth={2} />
                }
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function KPattoRecordPage() {
  const { isPro } = useKPattoSubscription()

  const allRecords  = typeof window !== 'undefined' ? getAllRecords() : []
  const activityMap = typeof window !== 'undefined' ? getActivityByDate() : {}
  const streak      = typeof window !== 'undefined' ? getStreak() : 0

  // 에피소드 완료 세트 — 새 시스템 (챌린지 통과 기준)
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set())
  useEffect(() => {
    getCompletedEpisodeSet().then(setCompletedSet)
  }, [])

  // Episode records (streak / 주간 통계용 — 기존 SRS)
  const storyRecords = useMemo(
    () => allRecords.filter(r => r.itemType === 'story'),
    [allRecords],
  )
  const startedSet = useMemo(
    () => new Set(storyRecords.filter(r => r.lastPracticedAt).map(r => parseInt(r.itemId))),
    [storyRecords],
  )

  // Expression/pattern mastery (pattern records as proxy for now)
  const patternRecords = useMemo(
    () => allRecords.filter(r => r.itemType === 'pattern'),
    [allRecords],
  )
  const expressionBreakdown = useMemo(() => {
    let mastered = 0, learning = 0
    for (const r of patternRecords) {
      const correct = r.repeatCount ?? 0
      if (correct >= 3) mastered++
      else if (correct >= 1) learning++
    }
    const newCount = Math.max(0, 300 - mastered - learning)
    return { mastered, learning, newCount }
  }, [patternRecords])

  // Last / current episode
  const latestStoryRecord = useMemo(() => {
    if (storyRecords.length === 0) return null
    return [...storyRecords].sort((a, b) =>
      (b.lastPracticedAt ?? '').localeCompare(a.lastPracticedAt ?? ''),
    )[0]
  }, [storyRecords])
  const currentEpNum = latestStoryRecord ? parseInt(latestStoryRecord.itemId) : 1
  const currentChapter = chapterOf(currentEpNum)
  const currentStory = ALL_STORIES.find(s => s.episode === currentEpNum)
  const currentEpId = `kp-ep-${String(currentEpNum).padStart(3, '0')}`

  // Chapters
  const chapters = useMemo(() =>
    Array.from({ length: TOTAL_CHAPTERS }, (_, ci) => {
      const num   = ci + 1
      const start = ci * CHAPTER_SIZE + 1
      const eps   = Array.from({ length: CHAPTER_SIZE }, (_, ei) => start + ei)
      const done  = eps.filter(ep => completedSet.has(ep)).length
      const locked = start > FREE_EPISODES && !isPro
      return { num, start, eps, done, locked }
    }),
    [completedSet, isPro],
  )

  // Collapsible state — open the current chapter by default
  const [expanded, setExpanded] = useState<Record<number, boolean>>(() => ({
    [currentChapter]: true,
  }))
  const toggle = (ch: number) => setExpanded(prev => ({ ...prev, [ch]: !prev[ch] }))

  // This week stats
  const thisWeekStart = localDateStr(new Date(Date.now() - 6 * 86400000))
  const weekEps   = storyRecords.filter(r => (r.lastPracticedAt ?? '') >= thisWeekStart).length
  const weekExprs = patternRecords.filter(r => (r.firstLearnedAt ?? '') >= thisWeekStart).length
  const weekChall = allRecords.filter(r => r.itemType === 'pattern' && (r.lastReviewedAt ?? '') >= thisWeekStart).length

  // Badges
  const totalCompletedEps = completedSet.size
  const badges = [
    {
      emoji: '📖',
      label: 'Chapter 1 Complete',
      sub: 'Finish all 10 episodes in Chapter 1',
      unlocked: chapters[0].done >= 10,
    },
    {
      emoji: '⭐',
      label: '50 Expressions',
      sub: 'Learn 50 expressions',
      unlocked: expressionBreakdown.mastered + expressionBreakdown.learning >= 50,
    },
    {
      emoji: '🔥',
      label: '7-Day Streak',
      sub: 'Study 7 days in a row',
      unlocked: streak >= 7,
    },
    {
      emoji: '🎯',
      label: 'First Challenge Perfect',
      sub: 'Get a perfect score on a challenge',
      unlocked: patternRecords.some(r => (r.repeatCount ?? 0) >= 1),
    },
  ]

  // joinedAt — approximate from the earliest record
  const joinedAt = useMemo(() => {
    const dates = allRecords.map(r => r.firstLearnedAt ?? r.lastPracticedAt ?? '').filter(Boolean)
    return dates.length > 0 ? dates.sort()[0] : null
  }, [allRecords])

  const hasAnyRecord = allRecords.length > 0

  // ── New user state ────────────────────────────────────────────────────────
  if (!hasAnyRecord) {
    return (
      <div style={{ minHeight: '100vh', background: BG, paddingBottom: KPATTO_TAB_BAR_HEIGHT }}>
        <KPattoHeader />
        <div style={{ padding: '48px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>📚</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T1, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            Start your first episode
          </div>
          <div style={{ fontSize: 14, color: T2, lineHeight: 1.6 }}>
            100 stories · 300+ expressions<br />Chapter 1 is free
          </div>
          <Link
            href="/kpatto/story/kp-ep-001"
            style={{
              marginTop: 8,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              height: 52, padding: '0 32px',
              background: ACCENT, color: '#fff',
              borderRadius: 14, fontSize: 15, fontWeight: 700,
              textDecoration: 'none',
              boxShadow: `0 4px 16px ${ACCENT}40`,
            }}
          >
            Begin EP01
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>
      <KPattoHeader />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '16px 16px 0' }}>

        {/* ── [1] Top summary ──────────────────────────────────────────── */}
        <Card>
          <div style={{ padding: '20px 20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: T1, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                You&apos;re on Episode {currentEpNum} · Chapter {currentChapter}
              </div>
              <div style={{ fontSize: 12, color: T2, marginTop: 4 }}>
                {totalCompletedEps} of {TOTAL_EPISODES} episodes complete
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <LinearBar value={totalCompletedEps} total={TOTAL_EPISODES} color={ACCENT} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: T2 }}>EP01</span>
                <span style={{ fontSize: 11, color: T2 }}>
                  {Math.round((totalCompletedEps / TOTAL_EPISODES) * 100)}%
                </span>
                <span style={{ fontSize: 11, color: T2 }}>EP100</span>
              </div>
            </div>
          </div>
        </Card>

        {/* ── [2] Continue card ─────────────────────────────────────────── */}
        <Card>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T2, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
              Continue
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              {/* Thumbnail */}
              <div style={{ position: 'relative', width: 88, height: 60, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: BORDER }}>
                <Image
                  src={currentStory?.thumbnail_url ?? `/kpatto/banners/ep1.png`}
                  alt={currentStory?.title ?? `EP${currentEpNum}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="88px"
                />
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>
                  EP {String(currentEpNum).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                  {currentStory?.title ?? `Episode ${currentEpNum}`}
                </div>
                {currentStory?.title_en && (
                  <div style={{ fontSize: 11, color: T2, marginTop: 1 }}>{currentStory.title_en}</div>
                )}
              </div>
              {/* Button */}
              <Link
                href={`/kpatto/story/${currentEpId}`}
                style={{
                  flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  height: 38, padding: '0 18px',
                  background: ACCENT, color: '#fff',
                  borderRadius: 10, fontSize: 13, fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Continue
              </Link>
            </div>
          </div>
        </Card>

        {/* ── [3] Chapter progress ─────────────────────────────────────── */}
        <div>
          <SectionTitle text="Chapters" />
          <Card style={{ borderRadius: 16, overflow: 'hidden' }}>
            {chapters.map((ch) => (
              <ChapterRow
                key={ch.num}
                num={ch.num}
                done={ch.done}
                total={CHAPTER_SIZE}
                locked={ch.locked}
                eps={ch.eps}
                completedSet={completedSet}
                expanded={!!expanded[ch.num]}
                onToggle={() => toggle(ch.num)}
              />
            ))}
          </Card>
        </div>

        {/* ── [4] Expression mastery ────────────────────────────────────── */}
        <div>
          <SectionTitle text="Expressions" sub="300+ expressions across 100 episodes" />
          <Card>
            <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Segmented bar */}
              <div style={{ display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', gap: 2 }}>
                {(() => {
                  const { mastered, learning } = expressionBreakdown
                  const total = 300
                  const masteredPct = Math.min(100, (mastered / total) * 100)
                  const learningPct = Math.min(100 - masteredPct, (learning / total) * 100)
                  const newPct = 100 - masteredPct - learningPct
                  return (
                    <>
                      <div style={{ width: `${masteredPct}%`, background: T1, borderRadius: 99 }} />
                      <div style={{ width: `${learningPct}%`, background: ACCENT, borderRadius: 99 }} />
                      <div style={{ width: `${newPct}%`, background: BORDER, borderRadius: 99 }} />
                    </>
                  )
                })()}
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', gap: 20 }}>
                {[
                  { label: 'Mastered', count: expressionBreakdown.mastered, color: T1 },
                  { label: 'Learning', count: expressionBreakdown.learning, color: ACCENT },
                  { label: 'New', count: expressionBreakdown.newCount, color: T3 },
                ].map(({ label, count, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: T2 }}>{label} </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T1 }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* ── [5] This week ─────────────────────────────────────────────── */}
        <div>
          <SectionTitle text="This Week" />
          <Card>
            <WeekCalendar activityMap={activityMap} joinedAt={joinedAt} />
            <div style={{
              display: 'flex', borderTop: `1px solid ${BORDER}`,
            }}>
              {[
                { label: 'Expressions', value: weekExprs },
                { label: 'Challenges', value: weekChall },
                { label: 'Episodes', value: weekEps },
              ].map(({ label, value }, i, arr) => (
                <div
                  key={label}
                  style={{
                    flex: 1, textAlign: 'center', padding: '14px 0',
                    borderRight: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none',
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 800, color: value > 0 ? ACCENT : T3, letterSpacing: '-0.03em' }}>{value}</div>
                  <div style={{ fontSize: 11, color: T2, marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
            {streak > 0 && (
              <div style={{
                borderTop: `1px solid ${BORDER}`,
                padding: '12px 20px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 18 }}>🔥</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: ACCENT }}>{streak}-day streak</span>
                <span style={{ fontSize: 12, color: T2 }}>Keep it up!</span>
              </div>
            )}
          </Card>
        </div>

        {/* ── [6] Milestones ────────────────────────────────────────────── */}
        <div>
          <SectionTitle text="Milestones" />
          <Card>
            {badges.map(({ emoji, label, sub, unlocked }, i) => (
              <div key={label}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 20px',
                  opacity: unlocked ? 1 : 0.35,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: unlocked ? `${ACCENT}18` : BORDER,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                    filter: unlocked ? 'none' : 'grayscale(1)',
                  }}>
                    {emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T1 }}>{label}</div>
                    <div style={{ fontSize: 12, color: T2, marginTop: 2 }}>{unlocked ? 'Earned ✓' : sub}</div>
                  </div>
                </div>
                {i < badges.length - 1 && <div style={{ height: 1, background: BORDER, margin: '0 20px' }} />}
              </div>
            ))}
          </Card>
        </div>

      </div>
    </div>
  )
}
