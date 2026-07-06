'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { LearningCalendar } from '@/components/LearningCalendar'
import {
  getAllRecords, getStreak, getTotalPracticeMs,
  getReviewedTodayCount, getStudiedTodayStoryCount, getActivityByDate,
  todayStr, localDateStr,
  type LearningRecord,
} from '@/lib/srs/storage'
import {
  getFutureSchedule, getEnhancedDayDetail, getTodayMission,
  type EnhancedDayDetail, type ScheduledDay,
} from '@/lib/srs/engine'

// ── Calculations ──────────────────────────────────────────────────────────────

function computeMemoryScore(records: LearningRecord[]): number {
  const patternRecords = records.filter(r => r.itemType === 'pattern')
  const storyIds = new Set(patternRecords.map(r => r.storyId).filter(Boolean))
  const patternScore = patternRecords.reduce((sum, r) => sum + Math.min(r.repeatCount, 5) / 5, 0) / 500
  const storyScore = storyIds.size / 100
  return Math.round((patternScore + storyScore) / 2 * 100)
}

// Review Mastery: % of patterns that reached each repeat level
function computeReviewMastery(records: LearningRecord[]): number[] {
  const patterns = records.filter(r => r.itemType === 'pattern' && r.repeatCount > 0)
  const total = patterns.length
  if (total === 0) return [0, 0, 0, 0, 0]
  return [1, 2, 3, 4, 5].map(n =>
    Math.round((patterns.filter(r => r.repeatCount >= n).length / total) * 100)
  )
}

// Best streak from activity log
function getBestStreak(): number {
  const map = getActivityByDate()
  const dates = Object.keys(map).filter(d => (map[d] ?? 0) > 0).sort()
  if (dates.length === 0) return 0
  let best = 1, current = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000)
    if (diff === 1) { current++; best = Math.max(best, current) }
    else current = 1
  }
  return best
}

// Today's practice time from records
function getTodayPracticeMs(records: LearningRecord[]): number {
  const today = todayStr()
  return records
    .filter(r => r.lastPracticedAt?.slice(0, 10) === today)
    .reduce((sum, r) => sum + (r.totalPracticeTime || 0), 0)
}

function fmtTime(ms: number): string {
  const min = Math.floor(ms / 60000)
  if (min < 1) return '<1m'
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60), rem = min % 60
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[m - 1]} ${d}, ${y}`
}

// ── Day detail bottom sheet ───────────────────────────────────────────────────

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
          <p style={{ fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', fontWeight: 900, color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em' }}>
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

// ── Shared styles ─────────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.86)',
  boxShadow: '0 4px 20px rgba(40,50,80,0.07)',
}

// ── Thin progress bar ─────────────────────────────────────────────────────────

function ThinBar({ pct, color = 'rgba(78,118,200,0.85)' }: { pct: number; color?: string }) {
  return (
    <div style={{ height: 4, background: 'rgba(140,150,180,0.14)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${Math.min(pct, 100)}%`,
        background: color, borderRadius: 2,
        transition: 'width 1.1s ease-out',
      }} />
    </div>
  )
}

// ── Page 1: Memory Score ──────────────────────────────────────────────────────

function PageScore({
  score, learnedStories, learnedPatterns, mastery,
}: {
  score: number
  learnedStories: number
  learnedPatterns: number
  mastery: number[]
}) {
  const storyPct   = Math.min(Math.round((learnedStories  / 100)  * 100), 100)
  const patternPct = Math.min(Math.round((learnedPatterns / 500) * 100), 100)

  return (
    <div style={{ padding: '0 20px', boxSizing: 'border-box' }}>

      {/* ── Memory Score ── */}
      <div style={{ ...glassCard, padding: '24px 22px 20px', marginBottom: 12 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm2)', margin: '0 0 12px', textTransform: 'uppercase' }}>
          Memory Score
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 6 }}>
          <span style={{
            fontSize: 'clamp(3rem, 16vw, 4rem)', fontWeight: 900,
            color: 'var(--pt)', lineHeight: 1, letterSpacing: '-0.04em',
          }}>
            {score}
          </span>
          <span style={{ fontSize: 20, fontWeight: 500, color: 'var(--pm2)', lineHeight: 1, marginBottom: 6 }}>%</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--pm2)', margin: '0 0 14px', fontWeight: 400 }}>
          Story + Pattern 장기 기억 평균
        </p>
        <ThinBar pct={score} color="linear-gradient(90deg, rgba(78,118,200,0.7) 0%, rgba(78,118,200,1) 100%)" />
      </div>

      {/* ── Story & Pattern Progress ── */}
      <div style={{ ...glassCard, padding: '18px 20px', marginBottom: 12 }}>

        {/* Story Progress */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pt2)', letterSpacing: '0.01em' }}>Story Progress</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--pt)', fontVariantNumeric: 'tabular-nums' }}>
              {learnedStories}
              <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--pm2)' }}> / 100</span>
            </span>
          </div>
          <ThinBar pct={storyPct} color="rgba(78,118,200,0.80)" />
          <p style={{ fontSize: 9.5, color: 'var(--pm2)', margin: '5px 0 0', fontWeight: 400 }}>5회 반복 완료 기준 100%</p>
        </div>

        {/* Pattern Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pt2)', letterSpacing: '0.01em' }}>Pattern Progress</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--pt)', fontVariantNumeric: 'tabular-nums' }}>
              {learnedPatterns}
              <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--pm2)' }}> / 500</span>
            </span>
          </div>
          <ThinBar pct={patternPct} color="rgba(90,78,200,0.75)" />
          <p style={{ fontSize: 9.5, color: 'var(--pm2)', margin: '5px 0 0', fontWeight: 400 }}>5회 반복 완료 기준 100%</p>
        </div>
      </div>

      {/* ── Review Mastery ── */}
      <div style={{ ...glassCard, padding: '18px 20px' }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm2)', margin: '0 0 16px', textTransform: 'uppercase' }}>
          Review Mastery
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
          {mastery.map((pct, i) => {
            const active = pct > 0
            const circleColor = active
              ? `rgba(78,118,200,${0.25 + (pct / 100) * 0.65})`
              : 'rgba(180,190,215,0.25)'
            const textColor = active ? '#4A7AC8' : 'var(--pm2)'
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                {/* Step circle */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: circleColor,
                  border: `1.5px solid ${active ? 'rgba(78,118,200,0.30)' : 'rgba(180,190,215,0.30)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 1,
                }}>
                  <span style={{ fontSize: 8.5, fontWeight: 700, color: textColor, letterSpacing: '0.04em' }}>
                    {i + 1}회
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: textColor, lineHeight: 1 }}>
                    {pct}%
                  </span>
                </div>
                {/* Bar under circle */}
                <div style={{ width: '100%', height: 3, background: 'rgba(140,150,180,0.14)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: active ? `rgba(78,118,200,${0.4 + (pct / 100) * 0.5})` : 'transparent',
                    borderRadius: 2, transition: 'width 1.2s ease-out',
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Page 2: Memory Calendar ───────────────────────────────────────────────────

function PageCalendar({
  futureSchedule, selectedIso, onDaySelect,
  streak, bestStreak, todayNew, todayReview, todayMs,
}: {
  futureSchedule: Record<string, ScheduledDay>
  selectedIso: string | null
  onDaySelect: (iso: string) => void
  streak: number
  bestStreak: number
  todayNew: number
  todayReview: number
  todayMs: number
}) {
  return (
    <div style={{ padding: '0 20px', boxSizing: 'border-box' }}>

      {/* ── Calendar ── */}
      <div style={{ ...glassCard, padding: '18px 16px 14px', marginBottom: 12 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm2)', margin: '0 0 14px', textTransform: 'uppercase' }}>
          Memory Calendar
        </p>
        <LearningCalendar
          onDaySelect={onDaySelect}
          selectedIso={selectedIso}
          futureSchedule={futureSchedule}
        />
      </div>

      {/* ── Current Streak ── */}
      <div style={{ ...glassCard, padding: '16px 20px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>🔥</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--pm2)', margin: '0 0 2px', textTransform: 'uppercase' }}>
              Current Streak
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 'clamp(1.6rem, 7vw, 2rem)', fontWeight: 900, color: '#C0541A', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {streak}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#C0541A' }}>Days</span>
            </div>
          </div>
          {bestStreak > 0 && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--pm2)', margin: '0 0 2px', letterSpacing: '0.06em' }}>BEST</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--pt)', margin: 0 }}>{bestStreak} Days</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Today stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {([
          { label: 'Today New',    value: todayNew },
          { label: 'Review Done',  value: todayReview },
          { label: 'Study Time',   value: fmtTime(todayMs) },
        ] as const).map(({ label, value }) => (
          <div key={label} style={{
            ...glassCard,
            padding: '13px 10px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
          }}>
            <span style={{
              fontSize: typeof value === 'number' ? 'clamp(1.1rem,5vw,1.35rem)' : 'clamp(0.95rem,4vw,1.1rem)',
              fontWeight: 800, color: 'var(--pt)', lineHeight: 1,
            }}>
              {value}
            </span>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--pm2)', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.3 }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const railRef  = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)

  const [dayDetail, setDayDetail]       = useState<EnhancedDayDetail | null>(null)
  const [selectedIso, setSelectedIso]   = useState<string | null>(null)
  const [futureSchedule, setFutureSchedule] = useState<Record<string, ScheduledDay>>({})

  const [records, setRecords]       = useState<LearningRecord[]>([])
  const [streak, setStreak]         = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [todayNew, setTodayNew]     = useState(0)
  const [todayReview, setTodayReview] = useState(0)
  const [todayMs, setTodayMs]       = useState(0)

  useEffect(() => {
    const allRec = getAllRecords()
    setRecords(allRec)
    setFutureSchedule(getFutureSchedule())
    setStreak(getStreak())
    setBestStreak(getBestStreak())
    setTodayNew(getStudiedTodayStoryCount())
    setTodayReview(getReviewedTodayCount())
    setTodayMs(getTodayPracticeMs(allRec))
  }, [])

  const learnedPatterns = records.filter(r => r.itemType === 'pattern').length
  const learnedStories  = records.filter(r => r.itemType === 'story').length
  const memoryScore     = useMemo(() => computeMemoryScore(records), [records])
  const mastery         = useMemo(() => computeReviewMastery(records), [records])

  // Scroll-snap: track active page
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const handleScroll = () => {
      setPage(Math.min(1, Math.max(0, Math.round(rail.scrollLeft / rail.clientWidth))))
    }
    rail.addEventListener('scroll', handleScroll, { passive: true })
    return () => rail.removeEventListener('scroll', handleScroll)
  }, [])

  function goToPage(idx: number) {
    railRef.current?.scrollTo({ left: idx * (railRef.current.clientWidth), behavior: 'smooth' })
  }

  function handleDaySelect(iso: string) {
    if (selectedIso === iso) { setSelectedIso(null); setDayDetail(null); return }
    setSelectedIso(iso)
    setDayDetail(getEnhancedDayDetail(iso))
  }

  return (
    <>
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopNav />

        {/* ── Page indicator dots ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '10px 0 8px', flexShrink: 0,
        }}>
          {[0, 1].map(i => (
            <button
              key={i}
              type="button"
              onClick={() => goToPage(i)}
              style={{
                width: page === i ? 22 : 6, height: 6, borderRadius: 3,
                background: page === i ? 'rgba(78,118,200,0.85)' : 'rgba(140,150,180,0.28)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'width 0.25s ease, background 0.25s ease',
              }}
            />
          ))}
        </div>

        {/* ── Horizontal scroll-snap rail ── */}
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
            scrollbarWidth: 'none',
          } as React.CSSProperties}
        >
          {/* Page 0: Memory Score */}
          <div style={{
            flex: '0 0 100%', scrollSnapAlign: 'start',
            overflowY: 'auto', height: '100%',
            paddingTop: 10, paddingBottom: TAB_BAR_HEIGHT + 24, boxSizing: 'border-box',
          }}>
            <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
              <PageScore
                score={memoryScore}
                learnedStories={learnedStories}
                learnedPatterns={learnedPatterns}
                mastery={mastery}
              />
            </div>
          </div>

          {/* Page 1: Memory Calendar */}
          <div style={{
            flex: '0 0 100%', scrollSnapAlign: 'start',
            overflowY: 'auto', height: '100%',
            paddingTop: 10, paddingBottom: TAB_BAR_HEIGHT + 24, boxSizing: 'border-box',
          }}>
            <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
              <PageCalendar
                futureSchedule={futureSchedule}
                selectedIso={selectedIso}
                onDaySelect={handleDaySelect}
                streak={streak}
                bestStreak={bestStreak}
                todayNew={todayNew}
                todayReview={todayReview}
                todayMs={todayMs}
              />
            </div>
          </div>
        </div>
      </div>

      <DayDetailSheet
        detail={dayDetail}
        onClose={() => { setDayDetail(null); setSelectedIso(null) }}
      />

      <style>{`div::-webkit-scrollbar { display: none }`}</style>
    </>
  )
}
