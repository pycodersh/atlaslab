'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Clock, X } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { LearningCalendar } from '@/components/LearningCalendar'
import { useT } from '@/hooks/useT'
import {
  getAllRecords, getDueCount, getStreak, getTotalPracticeMs,
  getPracticedTodayCount, getReviewedTodayCount, getStudiedTodayStoryCount,
  type LearningRecord,
} from '@/lib/srs/storage'
import {
  getFutureSchedule, getEnhancedDayDetail, getTodayMission,
  type EnhancedDayDetail, type ScheduledDay,
} from '@/lib/srs/engine'

// ── Memory calculations ────────────────────────────────────────────────────────

function computeMemoryScore(records: LearningRecord[]): number {
  const patternRecords = records.filter(r => r.itemType === 'pattern')
  const storyIds = new Set(patternRecords.map(r => r.storyId).filter(Boolean))
  const patternScore = patternRecords.reduce((sum, r) => sum + Math.min(r.repeatCount, 5) / 5, 0) / 500
  const storyScore = storyIds.size / 100
  return Math.round((patternScore + storyScore) / 2 * 100)
}

// ── fmtDate ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[m - 1]} ${d}, ${y}`
}

// ── Day detail bottom sheet (from existing code — unchanged logic) ─────────────

function DayDetailSheet({ detail, onClose }: { detail: EnhancedDayDetail | null; onClose: () => void }) {
  const open = !!detail
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isEmpty = detail &&
    detail.completed.length === 0 &&
    detail.due.length === 0 &&
    detail.upcoming.length === 0

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.42)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.22s',
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 61,
        background: 'rgba(252,250,255,0.95)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderRadius: '24px 24px 0 0',
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.10)',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.30s cubic-bezier(0.4,0,0.2,1)',
        paddingBottom: `calc(24px + env(safe-area-inset-bottom, 0px))`,
        maxHeight: '72dvh', overflowY: 'auto',
      }}>
        <div style={{ padding: '12px 24px 0' }}>
          <div style={{ width: 36, height: 4, background: 'var(--pd)', borderRadius: 2, margin: '0 auto' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px 0' }}>
          <p style={{
            fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', fontWeight: 900,
            color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em',
          }}>
            {detail ? fmtDate(detail.date) : ''}
          </p>
          <button type="button" onClick={onClose} style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--pc)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <X style={{ width: 14, height: 14, color: 'var(--pm)' }} strokeWidth={2} />
          </button>
        </div>
        {detail && (
          <div style={{ padding: '18px 24px' }}>
            {isEmpty && (
              <p style={{ fontSize: 13, color: 'var(--pm2)', textAlign: 'center', paddingTop: 12 }}>
                이 날은 학습 기록이 없어요.
              </p>
            )}
            {detail.completed.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: '#27AE60', textTransform: 'uppercase', margin: '0 0 10px' }}>
                  Completed
                </p>
                {detail.completed.map(item => (
                  <div key={item.storyId} style={{ padding: '10px 0', borderBottom: '1px solid var(--pd)', fontSize: 13, color: 'var(--pt)', fontWeight: 500 }}>
                    Story {String(item.storyId).padStart(2, '0')} · {item.storyTitle}
                  </div>
                ))}
              </div>
            )}
            {detail.due.length > 0 && (
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm2)', textTransform: 'uppercase', margin: '0 0 10px' }}>
                  Due
                </p>
                {detail.due.map(item => (
                  <div key={item.storyId} style={{ padding: '10px 0', borderBottom: '1px solid var(--pd)', fontSize: 13, color: 'var(--pt2)', fontWeight: 500 }}>
                    Story {String(item.storyId).padStart(2, '0')} · {item.storyTitle}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

// ── Card shell ────────────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.86)',
  boxShadow: '0 4px 20px rgba(40,50,80,0.07)',
}

function InfoChip({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{
      ...glassCard,
      flex: 1,
      padding: '12px 14px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    }}>
      <span style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)', fontWeight: 800, color: accent ? '#4A7AC8' : 'var(--pt)', lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--pm2)', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center' }}>
        {label}
      </span>
    </div>
  )
}

// ── Card 1: Memory Calendar ───────────────────────────────────────────────────

function CardCalendar({
  futureSchedule, selectedIso, onDaySelect, todayNew, todayReview, dueNow, estimatedMin, streak,
}: {
  futureSchedule: Record<string, ScheduledDay>
  selectedIso: string | null
  onDaySelect: (iso: string) => void
  todayNew: number
  todayReview: number
  dueNow: number
  estimatedMin: number
  streak: number
}) {
  return (
    <div style={{ padding: '0 20px', boxSizing: 'border-box' }}>

      {/* Section header with Streak */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--pm)', margin: 0 }}>이번 달 학습 기록</p>
        {streak > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(208,96,26,0.08)',
            border: '1px solid rgba(208,96,26,0.16)',
            borderRadius: 999,
            padding: '4px 10px',
          }}>
            <span style={{ fontSize: 12 }}>🔥</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#C0541A', letterSpacing: '-0.01em' }}>
              {streak}
            </span>
            <span style={{ fontSize: 9, fontWeight: 600, color: '#C0541A', letterSpacing: '0.04em' }}>
              DAYS
            </span>
          </div>
        )}
      </div>

      {/* Calendar */}
      <LearningCalendar
        onDaySelect={onDaySelect}
        selectedIso={selectedIso}
        futureSchedule={futureSchedule}
      />

      {/* Today stats */}
      <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
        <InfoChip label="Today New" value={todayNew} accent />
        <InfoChip label="Review Done" value={todayReview} />
        <InfoChip label="Due Now" value={dueNow} />
      </div>

      {estimatedMin > 0 && (
        <div style={{
          ...glassCard,
          marginTop: 10, padding: '11px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Clock style={{ width: 13, height: 13, color: 'var(--pm2)', flexShrink: 0 }} strokeWidth={1.8} />
          <span style={{ fontSize: 12, color: 'var(--pm2)' }}>
            Estimated&nbsp;
            <strong style={{ color: 'var(--pt)' }}>~{estimatedMin} min</strong>
            &nbsp;today
          </span>
        </div>
      )}
    </div>
  )
}

// ── Card 2: Memory Score ──────────────────────────────────────────────────────

function CardScore({
  score, learnedStories, learnedPatterns, totalMs,
}: {
  score: number
  learnedStories: number
  learnedPatterns: number
  totalMs: number
}) {
  const storyPct  = Math.round((learnedStories  / 100)  * 100)
  const patternPct = Math.round((learnedPatterns / 500) * 100)

  function fmtTime(ms: number): string {
    const min = Math.floor(ms / 60000)
    if (min < 60) return `${min}m`
    const h = Math.floor(min / 60), rem = min % 60
    return rem === 0 ? `${h}h` : `${h}h ${rem}m`
  }

  return (
    <div style={{ padding: '0 20px', boxSizing: 'border-box' }}>

      {/* Section header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--pm)', marginTop: 0, marginBottom: 0 }}>전체 장기 기억 지표</p>
      </div>

      {/* Big score */}
      <div style={{ ...glassCard, padding: '28px 24px', marginBottom: 16, textAlign: 'center' }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.20em', color: 'var(--pm2)', margin: '0 0 8px', textTransform: 'uppercase' }}>
          Overall Memory Score
        </p>
        <p style={{
          fontSize: 'clamp(3rem, 16vw, 4.5rem)', fontWeight: 900,
          color: 'var(--pt)', margin: '0 0 4px', lineHeight: 1,
          letterSpacing: '-0.03em',
        }}>
          {score}<span style={{ fontSize: '0.4em', fontWeight: 500, color: 'var(--pm2)' }}>%</span>
        </p>
        <p style={{ fontSize: 11, color: 'var(--pm2)', margin: 0 }}>
          Story + Pattern 기억 평균
        </p>

        {/* Score bar */}
        <div style={{ height: 3, background: 'var(--pd)', borderRadius: 2, overflow: 'hidden', margin: '16px 0 0' }}>
          <div style={{
            height: '100%', width: `${score}%`,
            background: 'linear-gradient(90deg, rgba(78,118,200,0.6), rgba(78,118,200,1))',
            borderRadius: 2, transition: 'width 1.2s ease-out',
          }} />
        </div>
      </div>

      {/* Stories + Patterns */}
      <div style={{ ...glassCard, padding: '18px 20px', marginBottom: 16 }}>
        {/* Stories row */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pt2)', letterSpacing: '0.04em' }}>Stories</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pt)', fontVariantNumeric: 'tabular-nums' }}>
              {learnedStories}
              <span style={{ fontWeight: 400, color: 'var(--pm2)' }}> / 100</span>
            </span>
          </div>
          <div style={{ height: 3, background: 'var(--pd)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
            <div style={{
              height: '100%', width: `${storyPct}%`,
              background: 'rgba(78,118,200,0.70)', borderRadius: 2, transition: 'width 1.2s ease-out',
            }} />
          </div>
          <p style={{ fontSize: 9, color: 'var(--pm2)', margin: 0 }}>5회 반복 완료 = 100%</p>
        </div>

        {/* Patterns row */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pt2)', letterSpacing: '0.04em' }}>Patterns</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pt)', fontVariantNumeric: 'tabular-nums' }}>
              {learnedPatterns}
              <span style={{ fontWeight: 400, color: 'var(--pm2)' }}> / 500</span>
            </span>
          </div>
          <div style={{ height: 3, background: 'var(--pd)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
            <div style={{
              height: '100%', width: `${patternPct}%`,
              background: 'rgba(78,118,200,0.85)', borderRadius: 2, transition: 'width 1.2s ease-out',
            }} />
          </div>
          <p style={{ fontSize: 9, color: 'var(--pm2)', margin: 0 }}>5회 반복 완료 = 100%</p>
        </div>
      </div>

      {/* Practice time */}
      <div style={{ ...glassCard, padding: '14px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: 'clamp(1.1rem, 5vw, 1.4rem)', fontWeight: 800, color: 'var(--pt)', margin: '0 0 4px', lineHeight: 1 }}>
          {fmtTime(totalMs)}
        </p>
        <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--pm2)', margin: 0, textTransform: 'uppercase' }}>
          Total Practice
        </p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const t = useT()

  const railRef = useRef<HTMLDivElement>(null)
  const [activeCard, setActiveCard] = useState(0)

  const [dayDetail, setDayDetail]     = useState<EnhancedDayDetail | null>(null)
  const [selectedIso, setSelectedIso] = useState<string | null>(null)

  // Stats
  const [records, setRecords]             = useState<LearningRecord[]>([])
  const [futureSchedule, setFutureSchedule] = useState<Record<string, ScheduledDay>>({})
  const [todayNew, setTodayNew]           = useState(0)
  const [todayReview, setTodayReview]     = useState(0)
  const [dueNow, setDueNow]               = useState(0)
  const [estimatedMin, setEstimatedMin]   = useState(0)
  const [streak, setStreak]               = useState(0)
  const [totalMs, setTotalMs]             = useState(0)

  useEffect(() => {
    const allRec = getAllRecords()
    setRecords(allRec)
    setFutureSchedule(getFutureSchedule())
    setTodayNew(getStudiedTodayStoryCount())
    setTodayReview(getReviewedTodayCount())
    setDueNow(getDueCount())
    setStreak(getStreak())
    setTotalMs(getTotalPracticeMs())
    const mission = getTodayMission()
    setEstimatedMin(mission.estimatedMinutes)
  }, [])

  const learnedPatterns = records.filter(r => r.itemType === 'pattern').length
  const learnedStories  = records.filter(r => r.itemType === 'story').length
  const memoryScore  = useMemo(() => computeMemoryScore(records), [records])

  // Scroll-snap: track active card
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const handleScroll = () => {
      const idx = Math.round(rail.scrollLeft / rail.clientWidth)
      setActiveCard(Math.min(1, Math.max(0, idx)))
    }
    rail.addEventListener('scroll', handleScroll, { passive: true })
    return () => rail.removeEventListener('scroll', handleScroll)
  }, [])

  function goToCard(idx: number) {
    const rail = railRef.current
    if (!rail) return
    rail.scrollTo({ left: idx * rail.clientWidth, behavior: 'smooth' })
  }

  function handleDaySelect(iso: string) {
    if (selectedIso === iso) { setSelectedIso(null); setDayDetail(null); return }
    setSelectedIso(iso)
    setDayDetail(getEnhancedDayDetail(iso))
  }

  const CARD_LABELS = ['Memory Calendar', 'Memory Score']

  return (
    <>
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopNav />

        {/* ── Dot indicator ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '8px 0 6px',
          flexShrink: 0,
        }}>
          {[0, 1].map(i => (
            <button
              key={i}
              type="button"
              onClick={() => goToCard(i)}
              aria-label={CARD_LABELS[i]}
              style={{
                width: activeCard === i ? 22 : 6,
                height: 6, borderRadius: 3,
                background: activeCard === i ? 'rgba(78,118,200,0.85)' : 'rgba(140,150,180,0.30)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'width 0.25s ease, background 0.25s ease',
              }}
            />
          ))}
        </div>

        {/* Card label */}
        <div style={{
          textAlign: 'center', paddingBottom: 2, flexShrink: 0,
          height: 18, overflow: 'hidden',
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm2)', textTransform: 'uppercase' }}>
            {CARD_LABELS[activeCard]}
          </span>
        </div>

        {/* ── Scroll-snap rail ── */}
        <div
          ref={railRef}
          style={{
            flex: 1,
            display: 'flex',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch' as 'auto',
            // hide scrollbar
            scrollbarWidth: 'none',
          } as React.CSSProperties}
        >
          {/* Card 0: Memory Calendar */}
          <div style={{ flex: '0 0 100%', scrollSnapAlign: 'start', overflowY: 'auto', height: '100%', paddingTop: 10, paddingBottom: TAB_BAR_HEIGHT + 24, boxSizing: 'border-box' }}>
            <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
              <CardCalendar
                futureSchedule={futureSchedule}
                selectedIso={selectedIso}
                onDaySelect={handleDaySelect}
                todayNew={todayNew}
                todayReview={todayReview}
                dueNow={dueNow}
                estimatedMin={estimatedMin}
                streak={streak}
              />
            </div>
          </div>
          {/* Card 1: Memory Score */}
          <div style={{ flex: '0 0 100%', scrollSnapAlign: 'start', overflowY: 'auto', height: '100%', paddingTop: 10, paddingBottom: TAB_BAR_HEIGHT + 24, boxSizing: 'border-box' }}>
            <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
              <CardScore
                score={memoryScore}
                learnedStories={learnedStories}
                learnedPatterns={learnedPatterns}
                totalMs={totalMs}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Day detail sheet (overlays on top) */}
      <DayDetailSheet
        detail={dayDetail}
        onClose={() => { setDayDetail(null); setSelectedIso(null) }}
      />

      <style>{`
        div::-webkit-scrollbar { display: none }
      `}</style>
    </>
  )
}
