'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, BookOpen, Layers, RotateCcw, X } from 'lucide-react'

import { TopNav } from '@/components/TopNav'
import { LearningCalendar } from '@/components/LearningCalendar'
import { useT } from '@/hooks/useT'
import { magazineStories } from '@/data/magazine-stories'
import { getBookmarks, type BookmarkedPattern } from '@/lib/bookmarks/storage'
import {
  getDueCount,
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
  const h = Math.floor(min / 60)
  const rem = min % 60
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`
}

// ── Action link ───────────────────────────────────────────────────────────────
function ActionLink({ label, href, onClick }: {
  label: string
  href?: string
  onClick?: () => void
}) {
  const style: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 2,
    fontSize: 11, fontWeight: 600, color: 'var(--pa)',
    textDecoration: 'none', background: 'none', border: 'none',
    padding: 0, cursor: 'pointer', letterSpacing: '0.01em', lineHeight: 1, opacity: 0.9,
  }
  if (href) {
    const Link = require('next/link').default
    return (
      <Link href={href} style={style}>
        {label}<ChevronRight style={{ width: 10, height: 10, marginLeft: 1 }} strokeWidth={2.2} />
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} style={style}>
      {label}<ChevronRight style={{ width: 10, height: 10, marginLeft: 1 }} strokeWidth={2.2} />
    </button>
  )
}

// ── Section label — same Serif design language as PATTERNS page title ─────────
function SectionLabel({ label, sub, action }: { label: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <h2 className="font-playfair" style={{
          fontSize: '1.4rem',
          fontWeight: 900,
          color: 'var(--pa)',
          margin: 0,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}>
          {label}
        </h2>
        {action}
      </div>
      {sub && (
        <p style={{
          fontSize: 11,
          fontWeight: 400,
          color: 'var(--pm)',
          margin: '7px 0 0',
          lineHeight: 1.5,
          letterSpacing: '0.01em',
        }}>
          {sub}
        </p>
      )}
      <div style={{ height: 1, background: 'var(--pd)', marginTop: 14 }} />
    </div>
  )
}

// ── Stat cell ─────────────────────────────────────────────────────────────────
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

// ── My Patterns Bottom Sheet ──────────────────────────────────────────────────
function BookmarkSheet({
  open, onClose, bookmarks,
}: {
  open: boolean
  onClose: () => void
  bookmarks: BookmarkedPattern[]
}) {
  const router = useRouter()
  const t = useT()

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  function goToPattern(bm: BookmarkedPattern) {
    router.push(`/stories/${bm.storyId}?v=p`)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgba(0,0,0,0.45)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 61,
        background: 'var(--pb)',
        borderRadius: '20px 20px 0 0',
        maxHeight: '82dvh',
        display: 'flex',
        flexDirection: 'column',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.12)',
      }}>
        {/* Handle */}
        <div style={{ padding: '12px 24px 0', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, background: 'var(--pd)', borderRadius: 2, margin: '0 auto 0' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 0', flexShrink: 0,
        }}>
          <p className="font-playfair" style={{
            fontSize: 'clamp(1.5rem, 6vw, 1.9rem)', fontWeight: 900,
            color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em',
          }}>
            My Patterns
          </p>
          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--pc)', border: 'none', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <X style={{ width: 15, height: 15, color: 'var(--pm)' }} strokeWidth={2} />
          </button>
        </div>

        {/* Pattern count */}
        <p style={{ fontSize: 11, color: 'var(--pm)', margin: '6px 24px 0', flexShrink: 0 }}>
          {t('bookmarks_count', { n: bookmarks.length })}
        </p>

        {/* Scrollable list */}
        <div style={{ overflowY: 'auto', padding: '16px 24px', paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))' }}>
          {bookmarks.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--pm)', lineHeight: 1.7, paddingTop: 8, whiteSpace: 'pre-line' }}>
              {t('no_bookmarks_sheet')}
            </p>
          ) : (
            bookmarks.map((bm, i) => {
              const story = magazineStories.find(s => s.id === bm.storyId)
              return (
                <button
                  key={bm.patternId}
                  type="button"
                  onClick={() => goToPattern(bm)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    background: 'none', border: 'none', padding: '18px 0',
                    borderTop: i === 0 ? 'none' : '1px solid var(--pd)',
                    cursor: 'pointer',
                  }}
                >
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)', margin: '0 0 4px', lineHeight: 1.3 }}>
                    {bm.pattern}
                  </p>
                  {bm.meaningKo && (
                    <p style={{ fontSize: 11, color: 'var(--pm)', margin: '0 0 8px', lineHeight: 1.5 }}>
                      {bm.meaningKo}
                    </p>
                  )}
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--pm2)', margin: 0, letterSpacing: '0.06em' }}>
                    Story {String(bm.storyId).padStart(2, '0')}
                    {story ? ` · ${story.title}` : ''}
                  </p>
                </button>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const router = useRouter()
  const t = useT()
  const [s, setS] = useState<Stats | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    const dueNow = getDueCount()
    setS({
      studiedTodayStories: getStudiedTodayStoryCount(),
      practicedTodayPatterns: getPracticedTodayCount(),
      reviewedToday: getReviewedTodayCount(),
      dueNow,
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
    learnedStories: 0, learnedPatterns: 0, totalRepeats: 0,
    totalPracticeMs: 0, bookmarks: [], ctaHref: '/stories/1',
  }

  const storyPct   = v.learnedStories / CURRICULUM.stories
  const patternPct = v.learnedPatterns / CURRICULUM.patterns
  const journeyPct = Math.round(((storyPct + patternPct) / 2) * 100)

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
          <div style={{ marginBottom: 44 }}>
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

          {/* ── YOUR JOURNEY ──────────────────────────────────────────── */}
          <section style={{ marginBottom: 72 }}>
            <SectionLabel label="Your Journey" sub={t('journey_sub')} />
            <div style={{ display: 'flex', borderLeft: '1px solid var(--pd)', borderRight: '1px solid var(--pd)' }}>
              <StatCell value={v.learnedStories}           label="Stories"  border />
              <StatCell value={v.learnedPatterns}          label="Patterns" border />
              <StatCell value={v.totalRepeats}             label="Repeats"  border />
              <StatCell value={fmtTime(v.totalPracticeMs)} label="Reading"  />
            </div>
            <div style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <div style={{ flex: 1, height: 3, background: 'var(--pd)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${Math.max(journeyPct, 0.5)}%`,
                    background: 'var(--pa)', borderRadius: 2, transition: 'width 1s ease-out',
                  }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--pa)', letterSpacing: '0.04em', flexShrink: 0 }}>
                  {journeyPct}%
                </span>
              </div>
              <p style={{ fontSize: 10, color: 'var(--pm)', margin: 0 }}>Curriculum Progress</p>
            </div>
          </section>

          {/* ── LEARNING CALENDAR ─────────────────────────────────────── */}
          <section style={{ marginBottom: 72 }}>
            <SectionLabel label="Learning Calendar" sub={t('calendar_sub')} />
            <LearningCalendar />
          </section>

          {/* ── MY PATTERNS ───────────────────────────────────────────── */}
          <section>
            <SectionLabel
              label="My Patterns"
              sub={t('my_patterns_sub')}
              action={<ActionLink label={t('view_all')} onClick={() => setSheetOpen(true)} />}
            />

            {v.bookmarks.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--pm)', lineHeight: 1.7, paddingTop: 4, whiteSpace: 'pre-line' }}>
                {t('no_bookmarks')}
              </p>
            ) : (
              <div>
                {v.bookmarks.slice(0, 3).map((bm, i) => {
                  const story = magazineStories.find(s => s.id === bm.storyId)
                  return (
                    <button
                      key={bm.patternId}
                      type="button"
                      onClick={() => router.push(`/stories/${bm.storyId}?v=p`)}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        background: 'none', border: 'none', padding: '14px 0',
                        borderTop: i === 0 ? 'none' : '1px solid var(--pd)',
                        cursor: 'pointer',
                      }}
                    >
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt2)', margin: '0 0 4px' }}>{bm.pattern}</p>
                      <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--pm2)', margin: 0, letterSpacing: '0.04em' }}>
                        Story {String(bm.storyId).padStart(2, '0')}
                        {story ? ` · ${story.title}` : ''}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

        </div>
      </div>

      {/* Bottom sheet — rendered outside scroll container */}
      <BookmarkSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        bookmarks={v.bookmarks}
      />
    </>
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
