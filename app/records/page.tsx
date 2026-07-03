'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check, ChevronRight, BookOpen, Layers, RotateCcw, X,
  AlertCircle, Clock, CalendarClock, HelpCircle,
} from 'lucide-react'

import { TopNav } from '@/components/TopNav'
import { LearningCalendar } from '@/components/LearningCalendar'
import { useT } from '@/hooks/useT'
import { magazineStories } from '@/data/magazine-stories'
import {
  getDueCount,
  getLearnedStoryCount, getLearnedPatternCount, getTotalPracticeMs,
  getStudiedTodayStoryCount, getPracticedTodayCount, getReviewedTodayCount,
  getPracticedPatternCountByStory, getStreak, getDailyStats,
} from '@/lib/srs/storage'
import {
  getStatusCounts, getReviewQueue, getFutureSchedule,
  type PatternStatus, type ReviewQueue, type ScheduledDay,
} from '@/lib/srs/engine'
import { getCurrentPhase, getPhaseProgress, PHASES } from '@/lib/curriculum/phases'

// ── 상수 ─────────────────────────────────────────────────────────────────────

const DAILY = { story: 1, pattern: 5 }

// ── 타입 ─────────────────────────────────────────────────────────────────────

type DayDetail = { iso: string; stories: number; patterns: number; reviews: number }

type Stats = {
  studiedTodayStories:    number
  practicedTodayPatterns: number
  reviewedToday:          number
  dueNow:                 number     // 복습 대기 수 (Review Queue 표시용)
  learnedStories:         number
  learnedPatterns:        number
  totalPracticeMs:        number
  streak:                 number
  ctaHref:                string
  statusCounts:           ReturnType<typeof getStatusCounts>
  queue:                  ReviewQueue
  futureSchedule:         Record<string, ScheduledDay>
}

// ── 헬퍼 ─────────────────────────────────────────────────────────────────────

/**
 * 오늘 이어서 학습할 URL.
 * Review는 /review 별도 페이지가 아닌 Today's Mission 내 Story 흐름에서 자동 처리.
 * (복습 대기 여부와 무관하게 다음 학습 스토리로 안내)
 */
function computeCtaHref(): string {
  const practiced = getPracticedPatternCountByStory()
  const inProgress = magazineStories.find(st => {
    const c = practiced[st.id] ?? 0
    return c > 0 && c < st.patterns.length
  })
  if (inProgress) return `/stories/${inProgress.id}?v=p`
  const newStory = magazineStories.find(st => !(practiced[st.id] > 0)) ?? magazineStories[0]
  return `/stories/${newStory.id}`
}

function fmtTime(ms: number): string {
  const min = Math.floor(ms / 60000)
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const rem = min % 60
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[m - 1]} ${d}, ${y}`
}

// ── 공통 UI 컴포넌트 ──────────────────────────────────────────────────────────

function ActionLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      fontSize: 11, fontWeight: 600, color: 'var(--pa)',
      background: 'none', border: 'none',
      padding: 0, cursor: 'pointer', letterSpacing: '0.01em', lineHeight: 1, opacity: 0.9,
    }}>
      {label}<ChevronRight style={{ width: 10, height: 10, marginLeft: 1 }} strokeWidth={2.2} />
    </button>
  )
}

function SectionLabel({
  label, sub, action,
}: {
  label: string; sub?: string; action?: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <h2 className="font-playfair" style={{
          fontSize: '1.4rem', fontWeight: 900, color: 'var(--pa)',
          margin: 0, letterSpacing: '-0.02em', lineHeight: 1,
        }}>
          {label}
        </h2>
        {action}
      </div>
      {sub && (
        <p style={{ fontSize: 11, color: 'var(--pm)', margin: '7px 0 0', lineHeight: 1.5 }}>
          {sub}
        </p>
      )}
      <div style={{ height: 1, background: 'var(--pd)', marginTop: 14 }} />
    </div>
  )
}

function StatCell({ value, label, border }: { value: React.ReactNode; label: string; border?: boolean }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '18px 4px', borderRight: border ? '1px solid var(--pd)' : 'none',
    }}>
      <p style={{
        fontSize: 'clamp(1.05rem, 4vw, 1.3rem)', fontWeight: 700,
        lineHeight: 1, color: 'var(--pt)', margin: '0 0 6px',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </p>
      <p style={{
        fontSize: 9, fontWeight: 600, letterSpacing: '0.16em',
        color: 'var(--pm)', margin: 0, textTransform: 'uppercase', textAlign: 'center',
      }}>
        {label}
      </p>
    </div>
  )
}

function ProgressRow({
  label, value, total, pct,
}: {
  label: string; value: number; total: number; pct: number
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--pt2)', letterSpacing: '0.02em' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pt)', fontVariantNumeric: 'tabular-nums' }}>
          {value} <span style={{ color: 'var(--pm2)', fontWeight: 400 }}>/ {total}</span>
        </span>
      </div>
      <div style={{ height: 3, background: 'var(--pd)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${Math.max(pct > 0 ? 0.8 : 0, pct)}%`,
          background: 'var(--pa)', borderRadius: 2, transition: 'width 1s ease-out',
        }} />
      </div>
    </div>
  )
}

// ── Mission Row ───────────────────────────────────────────────────────────────

function MissionRow({
  icon: Icon, label, value, total, last,
}: {
  icon: React.ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }>
  label: string; value: number; total: number; last?: boolean
}) {
  const done = total > 0 && value >= total
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0',
      borderBottom: last ? 'none' : '1px solid var(--pd)',
    }}>
      <Icon style={{ width: 14, height: 14, color: 'var(--pa)', flexShrink: 0 }} strokeWidth={1.8} />
      <p style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--pt2)', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--pt)', margin: 0 }}>
        {value} <span style={{ color: 'var(--pm2)', fontWeight: 400 }}>/ {total}</span>
      </p>
      <span style={{
        width: 22, height: 22, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: done ? 'var(--pa)' : 'transparent',
        border: done ? 'none' : '1px solid var(--pd)',
        transition: 'background 0.3s',
      }}>
        <Check style={{ width: 12, height: 12, color: done ? '#fff' : 'transparent' }} strokeWidth={3} />
      </span>
    </div>
  )
}

// ── Review Queue 섹션 ─────────────────────────────────────────────────────────

const QUEUE_CHIPS: {
  key: keyof ReviewQueue
  label: string
  emptyLabel: string
  icon: React.ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }>
  color: string
  bg: string
}[] = [
  {
    key: 'overdue',
    label: 'Overdue',
    emptyLabel: '없음',
    icon: AlertCircle,
    color: '#C0392B',
    bg: 'rgba(192,57,43,0.08)',
  },
  {
    key: 'dueToday',
    label: 'Due Today',
    emptyLabel: '없음',
    icon: Clock,
    color: 'var(--pa)',
    bg: 'rgba(var(--pa-rgb,138,31,69),0.08)',
  },
  {
    key: 'upcoming',
    label: 'Upcoming',
    emptyLabel: '없음',
    icon: CalendarClock,
    color: 'var(--pm)',
    bg: 'var(--pc)',
  },
]

function ReviewQueueSection({ queue }: { queue: ReviewQueue }) {
  return (
    <section style={{ marginBottom: 72 }}>
      <SectionLabel
        label="Review Queue"
        sub="복습 예정 패턴 현황. 오늘 Story 학습 중 자동으로 처리돼요."
      />
      <div style={{ display: 'flex', gap: 10 }}>
        {QUEUE_CHIPS.map(({ key, label, icon: Icon, color, bg }) => {
          const count = queue[key].length
          return (
            <div
              key={key}
              style={{
                flex: 1, padding: '14px 12px', borderRadius: 10,
                background: bg, display: 'flex', flexDirection: 'column', gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon style={{ width: 12, height: 12, color, flexShrink: 0 }} strokeWidth={2} />
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color, textTransform: 'uppercase' }}>
                  {label}
                </span>
              </div>
              <p style={{
                fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', fontWeight: 900,
                color: count > 0 ? color : 'var(--pm2)',
                margin: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
              }}>
                {count}
              </p>
            </div>
          )
        })}
      </div>

      <PatternStatusBar />
    </section>
  )
}

// ── Pattern Status 요약 바 ────────────────────────────────────────────────────

const STATUS_META: { key: PatternStatus; label: string; color: string }[] = [
  { key: 'new',      label: 'New',      color: 'var(--pm2)' },
  { key: 'learning', label: 'Learning', color: '#E67E22' },
  { key: 'review',   label: 'Review',   color: 'var(--pa)' },
  { key: 'mastered', label: 'Mastered', color: '#27AE60' },
]

function PatternStatusBar() {
  const [counts, setCounts] = useState<ReturnType<typeof getStatusCounts> | null>(null)
  useEffect(() => { setCounts(getStatusCounts()) }, [])

  if (!counts) return null
  const total = counts.learning + counts.review + counts.mastered
  if (total === 0) return null

  return (
    <div style={{ marginTop: 18 }}>
      <p style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.16em',
        color: 'var(--pm2)', margin: '0 0 8px', textTransform: 'uppercase',
      }}>
        Pattern Status
      </p>
      {/* 색상 바 */}
      <div style={{ display: 'flex', height: 5, borderRadius: 3, overflow: 'hidden', gap: 2 }}>
        {STATUS_META.map(({ key, color }) => {
          const pct = (counts[key] / total) * 100
          return pct > 0 ? (
            <div
              key={key}
              style={{ width: `${pct}%`, background: color, transition: 'width 1s ease-out' }}
            />
          ) : null
        })}
      </div>
      {/* 레이블 */}
      <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
        {STATUS_META.map(({ key, label, color }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: 'var(--pm2)' }}>{label}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--pt)', fontVariantNumeric: 'tabular-nums' }}>
              {counts[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Day Detail Bottom Sheet ───────────────────────────────────────────────────

function DayDetailSheet({ detail, onClose }: { detail: DayDetail | null; onClose: () => void }) {
  const open = !!detail
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.45)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.25s ease',
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 61,
        background: 'var(--pb)', borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.12)',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
        paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{ padding: '12px 24px 0' }}>
          <div style={{ width: 36, height: 4, background: 'var(--pd)', borderRadius: 2, margin: '0 auto' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 0' }}>
          <p className="font-playfair" style={{
            fontSize: 'clamp(1.4rem, 5.5vw, 1.7rem)', fontWeight: 900,
            color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em',
          }}>
            {detail ? fmtDate(detail.iso) : ''}
          </p>
          <button type="button" onClick={onClose} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--pc)', border: 'none', cursor: 'pointer', flexShrink: 0,
          }}>
            <X style={{ width: 15, height: 15, color: 'var(--pm)' }} strokeWidth={2} />
          </button>
        </div>
        {detail && (
          <div style={{ padding: '20px 24px 0' }}>
            {[
              { icon: BookOpen,  label: 'Story',   value: detail.stories },
              { icon: Layers,    label: 'Pattern',  value: detail.patterns },
              { icon: RotateCcw, label: 'Review',   value: detail.reviews },
            ].map(({ icon: Icon, label, value }, i, arr) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--pd)' : 'none',
              }}>
                <Icon style={{ width: 14, height: 14, color: 'var(--pa)', flexShrink: 0 }} strokeWidth={1.8} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--pt2)' }}>{label}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--pt)', fontVariantNumeric: 'tabular-nums' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

// ── Memory Engine Help Sheet ──────────────────────────────────────────────────

function HelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const items = [
    { emoji: '🟠', status: 'Learning',  desc: 'intervalDays < 7일. 아직 단기 반복 중이에요.' },
    { emoji: '🔵', status: 'Review',    desc: '7 ≤ interval < 30일. 장기 기억으로 굳혀지는 중이에요.' },
    { emoji: '🟢', status: 'Mastered',  desc: 'interval ≥ 30일. 장기 기억 완성! 패턴을 외운 것으로 봐요.' },
  ]

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.45)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.25s ease',
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 61,
        background: 'var(--pb)', borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.12)',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
        paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
        maxHeight: '80dvh', overflowY: 'auto',
      }}>
        <div style={{ padding: '12px 24px 0' }}>
          <div style={{ width: 36, height: 4, background: 'var(--pd)', borderRadius: 2, margin: '0 auto' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 0' }}>
          <p className="font-playfair" style={{
            fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', fontWeight: 900,
            color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em',
          }}>
            Memory Engine
          </p>
          <button type="button" onClick={onClose} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--pc)', border: 'none', cursor: 'pointer', flexShrink: 0,
          }}>
            <X style={{ width: 15, height: 15, color: 'var(--pm)' }} strokeWidth={2} />
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: 13, color: 'var(--pt2)', lineHeight: 1.7, margin: '0 0 24px' }}>
            Patto는 <strong>간격 반복(SRS)</strong>으로 패턴을 장기 기억으로 굳혀요.<br />
            복습을 맞히면 다음 복습 간격이 늘어나고, 틀리면 다시 처음부터 시작해요.
          </p>

          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm)', margin: '0 0 12px', textTransform: 'uppercase' }}>
            복습 간격
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            flexWrap: 'wrap', marginBottom: 24,
          }}>
            {['1일', '3일', '7일', '14일', '30일', '✓ Mastered'].map((step, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: i === arr.length - 1 ? '#27AE60' : 'var(--pt)',
                  background: 'var(--pc)', borderRadius: 6, padding: '4px 8px',
                }}>
                  {step}
                </span>
                {i < arr.length - 1 && (
                  <span style={{ fontSize: 10, color: 'var(--pm2)' }}>→</span>
                )}
              </div>
            ))}
          </div>

          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm)', margin: '0 0 12px', textTransform: 'uppercase' }}>
            패턴 상태
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map(({ emoji, status, desc }) => (
              <div key={status} style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.4 }}>{emoji}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--pt)', margin: '0 0 2px' }}>{status}</p>
                  <p style={{ fontSize: 12, color: 'var(--pm)', margin: 0, lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 24, padding: '14px 16px',
            background: 'var(--pc)', borderRadius: 10,
          }}>
            <p style={{ fontSize: 11, color: 'var(--pm)', lineHeight: 1.6, margin: 0 }}>
              📅 <strong>Memory Calendar</strong>의 작은 점(·)은 미래 복습 예정일을 나타내요.
              밀린 복습이 생겨도 하루 최대 5개만 표시해 부담을 줄여드려요.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const router  = useRouter()
  const t       = useT()
  const [s, setS]               = useState<Stats | null>(null)
  const [dayDetail, setDayDetail]   = useState<DayDetail | null>(null)
  const [selectedIso, setSelectedIso] = useState<string | null>(null)
  const [helpOpen, setHelpOpen]     = useState(false)

  useEffect(() => {
    const dueNow = getDueCount()
    setS({
      studiedTodayStories:    getStudiedTodayStoryCount(),
      practicedTodayPatterns: getPracticedTodayCount(),
      reviewedToday:          getReviewedTodayCount(),
      dueNow,
      learnedStories:   getLearnedStoryCount(),
      learnedPatterns:  getLearnedPatternCount(),
      totalPracticeMs:  getTotalPracticeMs(),
      streak:           getStreak(),
      ctaHref:          computeCtaHref(),
      statusCounts:     getStatusCounts(),
      queue:            getReviewQueue(),
      futureSchedule:   getFutureSchedule(),
    })
  }, [])

  const v = s ?? {
    studiedTodayStories: 0, practicedTodayPatterns: 0, reviewedToday: 0, dueNow: 0,
    learnedStories: 0, learnedPatterns: 0, totalPracticeMs: 0, streak: 0,
    ctaHref: '/stories/1',
    statusCounts: { learning: 0, review: 0, mastered: 0 },
    queue: { overdue: [], dueToday: [], upcoming: [] },
    futureSchedule: {},
  }

  const phase       = getCurrentPhase(v.learnedPatterns)
  const phasePct    = getPhaseProgress(phase, v.learnedPatterns)
  const storyPct    = (v.learnedStories  / phase.storiesCumulative)  * 100
  const patternPct  = (v.learnedPatterns / phase.patternsCumulative) * 100
  const overallPct  = Math.round((storyPct + patternPct) / 2)

  function handleDaySelect(iso: string) {
    if (selectedIso === iso) { setSelectedIso(null); setDayDetail(null); return }
    setSelectedIso(iso)
    setDayDetail({ iso, ...getDailyStats(iso) })
  }

  return (
    <>
      <div style={{ height: '100dvh', overflowY: 'auto', background: 'var(--pb)' }}>
        <TopNav />

        <div style={{
          maxWidth: 480, margin: '0 auto',
          paddingTop: 'calc(var(--pnav-h) + 28px)',
          paddingLeft: 24, paddingRight: 24, paddingBottom: 100,
          boxSizing: 'border-box',
        }}>

          {/* ── Page title ────────────────────────────────────────────── */}
          <div style={{ marginBottom: 44, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p className="font-playfair" style={{
                fontSize: 'clamp(2rem, 9vw, 2.8rem)', fontWeight: 900,
                letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--pt)', margin: 0,
              }}>
                Progress
              </p>
              <p className="font-playfair" style={{
                fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', fontStyle: 'italic',
                fontWeight: 500, color: 'var(--pm)', marginTop: 10, lineHeight: 1.6,
              }}>
                {t('progress_subtitle')}
              </p>
              <div style={{ height: 1.5, background: 'var(--pa)', width: 32, marginTop: 14, borderRadius: 1, opacity: 0.7 }} />
            </div>
            {/* ⓘ 도움말 버튼 */}
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              aria-label="Memory Engine 설명"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--pc)', border: 'none', cursor: 'pointer', flexShrink: 0,
                marginTop: 4,
              }}
            >
              <HelpCircle style={{ width: 15, height: 15, color: 'var(--pm)' }} strokeWidth={1.8} />
            </button>
          </div>

          {/* ── MEMORY CALENDAR (primary) ─────────────────────────────── */}
          <section style={{ marginBottom: 72 }}>
            <SectionLabel
              label="Memory Calendar"
              sub="학습 기록과 미래 복습 일정을 한눈에 확인해요."
            />
            <LearningCalendar
              onDaySelect={handleDaySelect}
              selectedIso={selectedIso}
              futureSchedule={v.futureSchedule}
            />
          </section>

          {/* ── REVIEW QUEUE ──────────────────────────────────────────── */}
          <ReviewQueueSection queue={v.queue} />

          {/* ── TODAY'S MISSION ───────────────────────────────────────── */}
          <section style={{ marginBottom: 72 }}>
            <SectionLabel
              label="Today's Mission"
              sub={t('mission_sub')}
              action={<ActionLink label={t('continue_study')} onClick={() => router.push(v.ctaHref)} />}
            />
            <MissionRow icon={BookOpen}  label={t('mission_story')}   value={v.studiedTodayStories}    total={DAILY.story} />
            <MissionRow icon={Layers}    label={t('mission_pattern')} value={v.practicedTodayPatterns} total={DAILY.pattern} />
            <MissionRow icon={RotateCcw} label={t('mission_review')}  value={v.reviewedToday}          total={v.reviewedToday + v.dueNow} last />
          </section>

          {/* ── OVERALL PROGRESS ──────────────────────────────────────── */}
          <section style={{ marginBottom: 72 }}>
            <SectionLabel
              label="Overall Progress"
              sub={`Phase ${phase.id} · ${phase.name} — ${phase.nameKo}`}
            />
            <ProgressRow
              label="Stories"
              value={v.learnedStories}
              total={phase.storiesCumulative}
              pct={storyPct}
            />
            <ProgressRow
              label="Patterns"
              value={v.learnedPatterns}
              total={phase.patternsCumulative}
              pct={patternPct}
            />
            <div style={{
              marginTop: 20, padding: '16px 20px',
              background: 'var(--pc)', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
                  color: 'var(--pm)', margin: '0 0 4px', textTransform: 'uppercase',
                }}>
                  Phase {phase.id} Progress
                </p>
                <p style={{
                  fontSize: 'clamp(1.5rem, 6vw, 1.9rem)', fontWeight: 900,
                  color: 'var(--pa)', margin: 0, lineHeight: 1, letterSpacing: '-0.02em',
                }}>
                  {phasePct}%
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: 13, fontWeight: 700, color: 'var(--pt)',
                  margin: '0 0 2px', fontVariantNumeric: 'tabular-nums',
                }}>
                  {v.learnedStories + v.learnedPatterns}{' '}
                  <span style={{ color: 'var(--pm2)', fontWeight: 400 }}>
                    / {phase.storiesCumulative + phase.patternsCumulative}
                  </span>
                </p>
                <p style={{ fontSize: 10, color: 'var(--pm)', margin: 0 }}>completed</p>
              </div>
            </div>

            {/* Phase 잠금 상태 미리보기 */}
            {PHASES.filter(p => !p.unlocked).slice(0, 1).map(nextPhase => (
              <div key={nextPhase.id} style={{
                marginTop: 12, padding: '11px 16px',
                border: '1px dashed var(--pd)', borderRadius: 10,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 14 }}>🔒</span>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--pm)', margin: '0 0 1px' }}>
                    Phase {nextPhase.id} · {nextPhase.name}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--pm2)', margin: 0 }}>
                    Phase {phase.id} 완료 후 해금돼요.
                  </p>
                </div>
              </div>
            ))}
          </section>

          {/* ── YOUR JOURNEY ──────────────────────────────────────────── */}
          <section style={{ marginBottom: 72 }}>
            <SectionLabel label="Your Journey" sub={t('journey_sub')} />
            <div style={{ display: 'flex', borderLeft: '1px solid var(--pd)', borderRight: '1px solid var(--pd)' }}>
              <StatCell value={v.learnedStories}                              label="Stories Done"  border />
              <StatCell value={v.learnedPatterns}                             label="Patterns Done" border />
              <StatCell value={`${v.streak > 0 ? '🔥' : ''}${v.streak}`}   label="Day Streak"   border />
              <StatCell value={fmtTime(v.totalPracticeMs)}                   label="Practice" />
            </div>
          </section>

        </div>
      </div>

      <DayDetailSheet
        detail={dayDetail}
        onClose={() => { setDayDetail(null); setSelectedIso(null) }}
      />
      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  )
}
