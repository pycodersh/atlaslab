'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, BookOpen, Layers, RotateCcw, X } from 'lucide-react'

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

const CURRICULUM = { stories: 100, patterns: 500 }
const DAILY = { story: 1, pattern: 5 }

type DayDetail = { iso: string; stories: number; patterns: number; reviews: number }

type Stats = {
  studiedTodayStories: number
  practicedTodayPatterns: number
  reviewedToday: number
  dueNow: number
  learnedStories: number
  learnedPatterns: number
  totalPracticeMs: number
  streak: number
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

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[m - 1]} ${d}, ${y}`
}

// ── Action link ───────────────────────────────────────────────────────────────
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

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ label, sub, action }: { label: string; sub?: string; action?: React.ReactNode }) {
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

// ── Overall Progress Row ──────────────────────────────────────────────────────
function ProgressRow({ label, value, total, pct }: { label: string; value: number; total: number; pct: number }) {
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
          height: '100%', width: `${Math.max(pct, pct > 0 ? 0.8 : 0)}%`,
          background: 'var(--pa)', borderRadius: 2, transition: 'width 1s ease-out',
        }} />
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
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 0',
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const router = useRouter()
  const t = useT()
  const [s, setS] = useState<Stats | null>(null)
  const [dayDetail, setDayDetail] = useState<DayDetail | null>(null)
  const [selectedIso, setSelectedIso] = useState<string | null>(null)

  useEffect(() => {
    const dueNow = getDueCount()
    setS({
      studiedTodayStories: getStudiedTodayStoryCount(),
      practicedTodayPatterns: getPracticedTodayCount(),
      reviewedToday: getReviewedTodayCount(),
      dueNow,
      learnedStories: getLearnedStoryCount(),
      learnedPatterns: getLearnedPatternCount(),
      totalPracticeMs: getTotalPracticeMs(),
      streak: getStreak(),
      ctaHref: computeCtaHref(dueNow),
    })
  }, [])

  const v = s ?? {
    studiedTodayStories: 0, practicedTodayPatterns: 0, reviewedToday: 0, dueNow: 0,
    learnedStories: 0, learnedPatterns: 0,
    totalPracticeMs: 0, streak: 0, ctaHref: '/stories/1',
  }

  const storyPct   = (v.learnedStories / CURRICULUM.stories) * 100
  const patternPct = (v.learnedPatterns / CURRICULUM.patterns) * 100
  const overallPct = Math.round((storyPct + patternPct) / 2)

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

          {/* ── OVERALL PROGRESS ──────────────────────────────────────── */}
          <section style={{ marginBottom: 72 }}>
            <SectionLabel label="Overall Progress" sub="전체 커리큘럼 기준 학습 진행 현황" />
            <ProgressRow label="Stories"  value={v.learnedStories}  total={CURRICULUM.stories}  pct={storyPct} />
            <ProgressRow label="Patterns" value={v.learnedPatterns} total={CURRICULUM.patterns} pct={patternPct} />
            <div style={{
              marginTop: 20, padding: '16px 20px',
              background: 'var(--pc)', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm)', margin: '0 0 4px', textTransform: 'uppercase' }}>
                  Overall Curriculum
                </p>
                <p style={{ fontSize: 'clamp(1.5rem, 6vw, 1.9rem)', fontWeight: 900, color: 'var(--pa)', margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {overallPct}%
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--pt)', margin: '0 0 2px', fontVariantNumeric: 'tabular-nums' }}>
                  {v.learnedStories + v.learnedPatterns} <span style={{ color: 'var(--pm2)', fontWeight: 400 }}>/ 600</span>
                </p>
                <p style={{ fontSize: 10, color: 'var(--pm)', margin: 0 }}>completed</p>
              </div>
            </div>
          </section>

          {/* ── YOUR JOURNEY ──────────────────────────────────────────── */}
          <section style={{ marginBottom: 72 }}>
            <SectionLabel label="Your Journey" sub={t('journey_sub')} />
            <div style={{ display: 'flex', borderLeft: '1px solid var(--pd)', borderRight: '1px solid var(--pd)' }}>
              <StatCell value={v.learnedStories}           label="Stories Done"  border />
              <StatCell value={v.learnedPatterns}          label="Patterns Done" border />
              <StatCell value={`${v.streak > 0 ? '🔥' : ''}${v.streak}`} label="Day Streak" border />
              <StatCell value={fmtTime(v.totalPracticeMs)} label="Practice" />
            </div>
          </section>

          {/* ── LEARNING CALENDAR ─────────────────────────────────────── */}
          <section style={{ marginBottom: 72 }}>
            <SectionLabel label="Learning Calendar" sub={t('calendar_sub')} />
            <LearningCalendar onDaySelect={handleDaySelect} selectedIso={selectedIso} />
          </section>

        </div>
      </div>

      <DayDetailSheet
        detail={dayDetail}
        onClose={() => { setDayDetail(null); setSelectedIso(null) }}
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
