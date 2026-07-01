'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, BookOpen, Layers, RotateCcw } from 'lucide-react'

import { TopNav } from '@/components/TopNav'
import { LearningCalendar } from '@/components/LearningCalendar'
import { magazineStories } from '@/data/magazine-stories'
import { getBookmarks, type BookmarkedPattern } from '@/lib/bookmarks/storage'
import {
  getDueCount, getTodayDueCount, getOverdueCount,
  getLearnedStoryCount, getLearnedPatternCount, getTotalRepeatCount, getTotalPracticeMs,
  getStudiedTodayStoryCount, getPracticedTodayCount, getReviewedTodayCount,
  getPracticedPatternCountByStory,
} from '@/lib/srs/storage'

const CURRICULUM = { stories: 800, patterns: 4000 }
const DAILY = { story: 1, pattern: 5 }

type Stats = {
  studiedTodayStories: number
  practicedTodayPatterns: number
  reviewedToday: number
  dueNow: number
  todayDue: number
  overdue: number
  learnedStories: number
  learnedPatterns: number
  totalRepeats: number
  totalPracticeMs: number
  bookmarks: BookmarkedPattern[]
  ctaHref: string
}

function computeCtaHref(dueNow: number): string {
  if (dueNow > 0) return '/review'
  const practiced = getPracticedPatternCountByStory()
  const inProgress = magazineStories.find((st) => {
    const c = practiced[st.id] ?? 0
    return c > 0 && c < st.patterns.length
  })
  if (inProgress) return `/stories/${inProgress.id}?v=p`
  const newStory = magazineStories.find((st) => !(practiced[st.id] > 0)) ?? magazineStories[0]
  return `/stories/${newStory.id}`
}

function fmtTime(ms: number): string {
  const min = Math.floor(ms / 60000)
  if (min < 60) return `${min}m`
  const h = min / 60
  return `${h < 10 ? h.toFixed(1) : Math.round(h)}h`
}

// ── Action link — shared by all section headers ───────────────────────────────
// Apple HIG–style: small burgundy text + thin chevron, never looks like a button
function ActionLink({ label, href, onClick }: {
  label: string
  href?: string
  onClick?: () => void
}) {
  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--pa)',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    letterSpacing: '0.01em',
    lineHeight: 1,
    opacity: 0.9,
  }
  if (href) {
    return (
      <Link href={href} style={style}>
        {label}
        <ChevronRight style={{ width: 10, height: 10, marginLeft: 1 }} strokeWidth={2.2} />
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} style={style}>
      {label}
      <ChevronRight style={{ width: 10, height: 10, marginLeft: 1 }} strokeWidth={2.2} />
    </button>
  )
}

// ── Section label — short burgundy underline, optional right action link ──────
function SectionLabel({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <p style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.22em',
          color: 'var(--pa)',
          margin: 0,
          textTransform: 'uppercase',
        }}>
          {label}
        </p>
        {action}
      </div>
      {/* Short burgundy decorative rule — replaces full-width gray divider */}
      <div style={{ height: 2, background: 'var(--pa)', width: 48, marginTop: 8, borderRadius: 1, opacity: 0.55 }} />
    </div>
  )
}

// ── Stat cell — centered, shared by Review and Your Journey ───────────────────
function StatCell({ value, label, border }: { value: React.ReactNode; label: string; border?: boolean }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '18px 4px',
      borderRight: border ? '1px solid var(--pd)' : 'none',
    }}>
      <p className="font-playfair" style={{
        fontSize: 'clamp(1.5rem, 6vw, 1.9rem)',
        fontWeight: 900,
        lineHeight: 1,
        color: 'var(--pt)',
        margin: '0 0 6px',
      }}>
        {value}
      </p>
      <p style={{
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: '0.16em',
        color: 'var(--pm)',
        margin: 0,
        textTransform: 'uppercase',
        textAlign: 'center',
      }}>
        {label}
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const router = useRouter()
  const [s, setS] = useState<Stats | null>(null)

  useEffect(() => {
    const dueNow = getDueCount()
    setS({
      studiedTodayStories: getStudiedTodayStoryCount(),
      practicedTodayPatterns: getPracticedTodayCount(),
      reviewedToday: getReviewedTodayCount(),
      dueNow,
      todayDue: getTodayDueCount(),
      overdue: getOverdueCount(),
      learnedStories: getLearnedStoryCount(),
      learnedPatterns: getLearnedPatternCount(),
      totalRepeats: getTotalRepeatCount(),
      totalPracticeMs: getTotalPracticeMs(),
      bookmarks: getBookmarks(),
      ctaHref: computeCtaHref(dueNow),
    })
  }, [])

  const v = s ?? {
    studiedTodayStories: 0, practicedTodayPatterns: 0, reviewedToday: 0, dueNow: 0,
    todayDue: 0, overdue: 0, learnedStories: 0, learnedPatterns: 0, totalRepeats: 0,
    totalPracticeMs: 0, bookmarks: [],
    ctaHref: '/stories/1',
  }

  const reviewTarget = v.reviewedToday + v.dueNow
  const storyPct   = v.learnedStories / CURRICULUM.stories
  const patternPct = v.learnedPatterns / CURRICULUM.patterns
  const journeyPct = Math.round(((storyPct + patternPct) / 2) * 100)

  return (
    <div style={{ height: '100dvh', overflowY: 'auto', background: 'var(--pb)' }}>
      <TopNav />

      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        paddingTop: 'calc(var(--pnav-h) + 28px)',
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 100,
        boxSizing: 'border-box',
      }}>

        {/* ── Page title ────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 44 }}>
          <p className="font-playfair" style={{
            fontSize: 'clamp(2rem, 9vw, 2.8rem)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: 'var(--pt)',
            margin: 0,
          }}>
            Progress
          </p>
          <p className="font-playfair" style={{
            fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',
            fontStyle: 'italic',
            fontWeight: 500,
            color: 'var(--pm)',
            marginTop: 10,
            lineHeight: 1.6,
          }}>
            한 문장씩, 입에 붙을 때까지.
          </p>
          <div style={{ height: 1.5, background: 'var(--pa)', width: 32, marginTop: 14, borderRadius: 1, opacity: 0.7 }} />
        </div>

        {/* ── TODAY'S MISSION ───────────────────────────────────────────── */}
        <section style={{ marginBottom: 72 }}>
          <SectionLabel
            label="Today's Mission"
            action={
              <ActionLink
                label="이어서 학습"
                onClick={() => router.push(v.ctaHref)}
              />
            }
          />
          <MissionRow icon={BookOpen}  label="Story 학습"   value={v.studiedTodayStories}    total={DAILY.story} />
          <MissionRow icon={Layers}    label="Pattern 학습" value={v.practicedTodayPatterns} total={DAILY.pattern} />
          <MissionRow icon={RotateCcw} label="복습하기"     value={v.reviewedToday}          total={reviewTarget} last />
        </section>

        {/* ── YOUR JOURNEY ──────────────────────────────────────────────── */}
        <section style={{ marginBottom: 72 }}>
          <SectionLabel label="Your Journey" />
          <div style={{ display: 'flex', border: '1px solid var(--pd)', borderRadius: 3 }}>
            <StatCell value={v.learnedStories}           label="Stories"  border />
            <StatCell value={v.learnedPatterns}          label="Patterns" border />
            <StatCell value={v.totalRepeats}             label="Repeats"  border />
            <StatCell value={fmtTime(v.totalPracticeMs)} label="Reading"  />
          </div>
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{ flex: 1, height: 1.5, background: 'var(--pd)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.max(journeyPct, 0.5)}%`,
                  background: 'var(--pa)',
                  borderRadius: 2,
                  transition: 'width 1s ease-out',
                }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--pa)', letterSpacing: '0.04em', flexShrink: 0 }}>
                {journeyPct}%
              </span>
            </div>
            <p style={{ fontSize: 10, color: 'var(--pm)', margin: 0 }}>Curriculum Progress</p>
          </div>
        </section>

        {/* ── LEARNING CALENDAR ─────────────────────────────────────────── */}
        <section style={{ marginBottom: 72 }}>
          <SectionLabel label="Learning Calendar" />
          <LearningCalendar />
        </section>

        {/* ── MY PATTERNS ───────────────────────────────────────────────── */}
        <section>
          <SectionLabel
            label="My Patterns"
            action={<ActionLink label="전체 보기" href="/records/patterns" />}
          />

          {v.bookmarks.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--pm)', lineHeight: 1.7, paddingTop: 4 }}>
              아직 저장한 패턴이 없어요.<br />패턴 옆 북마크를 눌러 자주 쓰는 패턴을 모아보세요.
            </p>
          ) : (
            <div>
              {v.bookmarks.slice(0, 3).map((p, i) => (
                <div
                  key={p.patternId}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 0',
                    borderTop: i === 0 ? 'none' : '1px solid var(--pd)',
                  }}
                >
                  <span className="font-playfair" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--pa)', width: 24, flexShrink: 0, lineHeight: 1 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt2)', margin: 0 }}>{p.pattern}</p>
                    <p style={{ fontSize: 11, color: 'var(--pm)', marginTop: 2 }}>{p.meaningKo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}

// ── MissionRow ────────────────────────────────────────────────────────────────
function MissionRow({
  icon: Icon, label, value, total, last,
}: {
  icon: React.ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }>
  label: string; value: number; total: number; last?: boolean
}) {
  const done = total > 0 && value >= total
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 0',
      borderBottom: last ? 'none' : '1px solid var(--pd)',
    }}>
      <Icon style={{ width: 14, height: 14, color: 'var(--pa)', flexShrink: 0 }} strokeWidth={1.8} />
      <p style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--pt2)', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--pt)', margin: 0 }}>
        {value} <span style={{ color: 'var(--pm2)', fontWeight: 400 }}>/ {total}</span>
      </p>
      <span style={{
        width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: done ? 'var(--pa)' : 'transparent',
        border: done ? 'none' : '1px solid var(--pd)',
        transition: 'background 0.3s',
      }}>
        <Check style={{ width: 12, height: 12, color: done ? '#fff' : 'transparent' }} strokeWidth={3} />
      </span>
    </div>
  )
}
