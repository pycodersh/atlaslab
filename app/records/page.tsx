'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { X, Info, BookOpen, Layers } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { LearningCalendar } from '@/components/LearningCalendar'
import {
  getAllRecords, getStreak, getActivityByDate,
  getStudiedTodayStoryCount, getReviewedTodayCount, todayStr,
  type LearningRecord,
} from '@/lib/srs/storage'
import {
  getFutureSchedule, getEnhancedDayDetail,
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

function computeReviewMastery(records: LearningRecord[]): number[] {
  const patterns = records.filter(r => r.itemType === 'pattern' && r.repeatCount > 0)
  const total = patterns.length
  if (total === 0) return [0, 0, 0, 0, 0]
  return [1, 2, 3, 4, 5].map(n =>
    Math.round((patterns.filter(r => r.repeatCount >= n).length / total) * 100)
  )
}

function getBestStreak(): number {
  const map = getActivityByDate()
  const dates = Object.keys(map).filter(d => (map[d] ?? 0) > 0).sort()
  if (dates.length === 0) return 0
  let best = 1, current = 1
  for (let i = 1; i < dates.length; i++) {
    const diff = Math.round(
      (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86400000
    )
    if (diff === 1) { current++; best = Math.max(best, current) }
    else current = 1
  }
  return best
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[m - 1]} ${d}, ${y}`
}

function getScoreGrade(score: number): { grade: string; comment: string; color: string } {
  if (score >= 80) return { grade: 'Excellent!',      comment: '최고예요 🎉 이 루틴을 계속 유지하세요.',          color: '#2A7A3A' }
  if (score >= 60) return { grade: 'Very Good',       comment: '훌륭해요! 장기 기억으로 자리잡고 있어요.',        color: '#4A7AC8' }
  if (score >= 40) return { grade: 'Good',            comment: '잘 하고 있어요. 반복 복습이 기억을 강화시켜요.',   color: '#7A6AC8' }
  if (score >= 20) return { grade: 'Building Up',     comment: '기초가 쌓이고 있어요. 복습 패턴을 유지해보세요.', color: '#C8913A' }
  if (score > 0)   return { grade: 'Getting Started', comment: '좋은 시작이에요! 매일 조금씩 쌓아가면 돼요.',    color: '#C87A3A' }
  return                  { grade: 'Just Starting',   comment: '첫 학습을 시작해보세요. 매일 조금씩이면 충분해요.', color: '#A0A0AA' }
}

// ── Shared ────────────────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.80)',
  backdropFilter: 'blur(28px) saturate(180%)',
  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
  borderRadius: 24,
  border: '1px solid rgba(255,255,255,0.88)',
  boxShadow: '0 2px 24px rgba(40,50,80,0.06), 0 1px 4px rgba(40,50,80,0.03)',
}

// ── Circular Progress Ring ────────────────────────────────────────────────────

function RingProgress({ pct, size = 80, stroke = 5, color = '#4A7AC8' }: {
  pct: number; size?: number; stroke?: number; color?: string
}) {
  const r   = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(pct, 100) / 100)

  return (
    <svg width={size} height={size} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="rgba(140,150,185,0.13)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  )
}

// ── Slim progress bar ─────────────────────────────────────────────────────────

function SlimBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 3, background: 'rgba(140,150,185,0.12)', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${Math.min(pct, 100)}%`,
        background: color, borderRadius: 99,
        transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
  )
}

// ── Mastery ring (small SVG circle with stroke) ───────────────────────────────

function MasteryRing({ pct, label }: { pct: number; label: string }) {
  const size = 44, stroke = 3, r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  const active = pct > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke="rgba(140,150,185,0.14)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={active ? '#4A7AC8' : 'transparent'}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: active ? '#4A7AC8' : 'rgba(140,150,185,0.55)',
            lineHeight: 1,
          }}>
            {pct}%
          </span>
        </div>
      </div>
      <span style={{ fontSize: 9.5, fontWeight: 500, color: 'var(--pm2)', letterSpacing: '0.02em' }}>
        {label}
      </span>
    </div>
  )
}

// ── Score Info Popup ──────────────────────────────────────────────────────────

function ScoreInfoPopup({ score, onClose }: { score: number; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'rgba(20,20,40,0.38)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }} />
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 81,
        width: 'calc(100vw - 48px)',
        maxWidth: 320,
        background: 'rgba(252,251,255,0.97)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.92)',
        boxShadow: '0 12px 48px rgba(40,50,80,0.18), 0 2px 8px rgba(40,50,80,0.08)',
        padding: '24px 22px 22px',
      }}>
        {/* Close */}
        <button type="button" onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          width: 26, height: 26, borderRadius: '50%',
          background: 'rgba(140,150,185,0.10)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <X style={{ width: 11, height: 11, color: 'var(--pm2)' }} strokeWidth={2} />
        </button>

        {/* Title */}
        <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--pt)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          장기 기억 점수
        </p>
        <p style={{ fontSize: 11, color: 'var(--pm2)', margin: '0 0 18px', lineHeight: 1.5 }}>
          현재 점수: <strong style={{ color: '#4A7AC8' }}>{score}%</strong>
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(140,150,185,0.10)', marginBottom: 16 }} />

        {/* Explanation */}
        <p style={{ fontSize: 12, color: 'var(--pt2)', lineHeight: 1.75, margin: '0 0 14px', fontWeight: 500 }}>
          Story와 Pattern을 얼마나 반복 학습했는지 측정한 지수예요.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { range: '0 – 19', label: 'Getting Started', color: '#C87A3A' },
            { range: '20 – 39', label: 'Building Up',    color: '#C8913A' },
            { range: '40 – 59', label: 'Good',           color: '#7A6AC8' },
            { range: '60 – 79', label: 'Very Good',      color: '#4A7AC8' },
            { range: '80+',     label: 'Excellent',      color: '#2A7A3A' },
          ].map(({ range, label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--pm2)', width: 46, flexShrink: 0 }}>{range}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, color,
                background: `${color}12`,
                border: `1px solid ${color}28`,
                borderRadius: 6, padding: '2px 8px',
              }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
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
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.36)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.22s',
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 61,
        background: 'rgba(252,250,255,0.96)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        borderRadius: '24px 24px 0 0',
        border: '1px solid rgba(255,255,255,0.92)',
        boxShadow: '0 -6px 32px rgba(0,0,0,0.08)',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.30s cubic-bezier(0.4,0,0.2,1)',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        maxHeight: '72dvh', overflowY: 'auto',
      }}>
        <div style={{ padding: '12px 24px 0' }}>
          <div style={{ width: 32, height: 3, background: 'rgba(140,150,185,0.22)', borderRadius: 99, margin: '0 auto' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 0' }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em' }}>
            {detail ? fmtDate(detail.date) : ''}
          </p>
          <button type="button" onClick={onClose} style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(140,150,185,0.10)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X style={{ width: 12, height: 12, color: 'var(--pm2)' }} strokeWidth={2} />
          </button>
        </div>
        {detail && (
          <div style={{ padding: '16px 24px' }}>
            {isEmpty && (
              <p style={{ fontSize: 13, color: 'var(--pm2)', textAlign: 'center', paddingTop: 8 }}>
                이 날은 학습 기록이 없어요.
              </p>
            )}
            {detail.completed.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: '#27AE60', textTransform: 'uppercase', margin: '0 0 10px' }}>
                  Completed
                </p>
                {detail.completed.map(item => (
                  <div key={item.storyId} style={{ padding: '10px 0', borderBottom: '1px solid rgba(140,150,185,0.10)', fontSize: 13, color: 'var(--pt)', fontWeight: 500 }}>
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
                  <div key={item.storyId} style={{ padding: '10px 0', borderBottom: '1px solid rgba(140,150,185,0.10)', fontSize: 13, color: 'var(--pt2)', fontWeight: 500 }}>
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

// ── Page 1: Memory Score ──────────────────────────────────────────────────────

function PageScore({ score, learnedStories, learnedPatterns, mastery }: {
  score: number
  learnedStories: number
  learnedPatterns: number
  mastery: number[]
}) {
  const storyPct   = Math.min(Math.round((learnedStories  / 100)  * 100), 100)
  const patternPct = Math.min(Math.round((learnedPatterns / 500) * 100), 100)
  const { grade, comment, color } = getScoreGrade(score)
  const [showInfo, setShowInfo] = useState(false)

  return (
    <>
      <div style={{ padding: '4px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ── Memory Score hero ── */}
        <div style={{ ...glassCard, padding: '24px 24px 22px' }}>

          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', color: '#3A3A4A', margin: 0, textTransform: 'uppercase', flex: 1 }}>
              Memory Score
            </p>
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Info style={{ width: 14, height: 14, color: 'rgba(140,150,185,0.55)' }} strokeWidth={1.8} />
            </button>
          </div>

          {/* Ring + grade row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 24 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <RingProgress pct={score} size={80} stroke={5} color={color} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 1,
              }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--pt)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                  {score}
                </span>
                <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--pm2)' }}>%</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 16, fontWeight: 800, color, margin: '0 0 5px', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                {grade}
              </p>
              <p style={{ fontSize: 11.5, fontWeight: 400, color: 'var(--pm2)', margin: 0, lineHeight: 1.55 }}>
                {comment}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(140,150,185,0.10)', marginBottom: 20 }} />

          {/* Story Progress */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen style={{ width: 13, height: 13, color: '#4A7AC8', flexShrink: 0 }} strokeWidth={2.2} />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#2A2A3A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Story Progress
                </span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pt)', fontVariantNumeric: 'tabular-nums' }}>
                {learnedStories}
                <span style={{ fontWeight: 400, color: 'var(--pm2)', fontSize: 11 }}> / 100</span>
              </span>
            </div>
            <SlimBar pct={storyPct} color="#4A7AC8" />
          </div>

          {/* Pattern Progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers style={{ width: 13, height: 13, color: '#7A6AC8', flexShrink: 0 }} strokeWidth={2.2} />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#2A2A3A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Pattern Progress
                </span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pt)', fontVariantNumeric: 'tabular-nums' }}>
                {learnedPatterns}
                <span style={{ fontWeight: 400, color: 'var(--pm2)', fontSize: 11 }}> / 500</span>
              </span>
            </div>
            <SlimBar pct={patternPct} color="#7A6AC8" />
          </div>
        </div>

        {/* ── Review Mastery ── */}
        <div style={{ ...glassCard, padding: '22px 20px 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', color: '#3A3A4A', margin: '0 0 18px', textTransform: 'uppercase' }}>
            Review Mastery
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {mastery.map((pct, i) => (
              <MasteryRing key={i} pct={pct} label={`${i + 1}회`} />
            ))}
          </div>
          <p style={{ fontSize: 10, color: 'rgba(140,150,185,0.65)', margin: '16px 0 0', textAlign: 'center', fontWeight: 400 }}>
            전체 학습 패턴 중 각 회차 도달 비율
          </p>
        </div>
      </div>

      {showInfo && <ScoreInfoPopup score={score} onClose={() => setShowInfo(false)} />}
    </>
  )
}

// ── Page 2: Memory Calendar ───────────────────────────────────────────────────

function PageCalendar({ futureSchedule, selectedIso, onDaySelect, streak }: {
  futureSchedule: Record<string, ScheduledDay>
  selectedIso: string | null
  onDaySelect: (iso: string) => void
  streak: number
}) {
  return (
    <div style={{ padding: '4px 20px 0', display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Calendar card ── */}
      <div style={{ ...glassCard, padding: '22px 18px 18px' }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', color: '#3A3A4A', margin: '0 0 16px', textTransform: 'uppercase' }}>
          Memory Calendar
        </p>
        <LearningCalendar
          onDaySelect={onDaySelect}
          selectedIso={selectedIso}
          futureSchedule={futureSchedule}
          streak={streak}
        />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const railRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)

  const [dayDetail, setDayDetail]     = useState<EnhancedDayDetail | null>(null)
  const [selectedIso, setSelectedIso] = useState<string | null>(null)
  const [futureSchedule, setFutureSchedule] = useState<Record<string, ScheduledDay>>({})

  const [records, setRecords] = useState<LearningRecord[]>([])
  const [streak, setStreak]   = useState(0)

  useEffect(() => {
    const allRec = getAllRecords()
    setRecords(allRec)
    setFutureSchedule(getFutureSchedule())
    setStreak(getStreak())
  }, [])

  const learnedPatterns = records.filter(r => r.itemType === 'pattern').length
  const learnedStories  = records.filter(r => r.itemType === 'story').length
  const memoryScore     = useMemo(() => computeMemoryScore(records), [records])
  const mastery         = useMemo(() => computeReviewMastery(records), [records])

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const onScroll = () =>
      setPage(Math.min(1, Math.max(0, Math.round(rail.scrollLeft / rail.clientWidth))))
    rail.addEventListener('scroll', onScroll, { passive: true })
    return () => rail.removeEventListener('scroll', onScroll)
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

        {/* ── Page indicator ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          padding: '8px 0 6px', flexShrink: 0,
        }}>
          {[0, 1].map(i => (
            <button
              key={i} type="button" onClick={() => goToPage(i)}
              style={{
                width: page === i ? 20 : 5, height: 5, borderRadius: 99,
                background: page === i ? 'rgba(74,122,200,0.80)' : 'rgba(140,150,185,0.22)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'width 0.28s ease, background 0.28s ease',
              }}
            />
          ))}
        </div>

        {/* ── Scroll rail ── */}
        <div
          ref={railRef}
          style={{
            flex: 1, display: 'flex',
            overflowX: 'auto', overflowY: 'hidden',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
          } as React.CSSProperties}
        >
          {/* Page 0 */}
          <div style={{
            flex: '0 0 100%', scrollSnapAlign: 'start',
            overflowY: 'auto', height: '100%',
            paddingBottom: TAB_BAR_HEIGHT + 24, boxSizing: 'border-box',
          }}>
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              <PageScore
                score={memoryScore}
                learnedStories={learnedStories}
                learnedPatterns={learnedPatterns}
                mastery={mastery}
              />
            </div>
          </div>

          {/* Page 1 */}
          <div style={{
            flex: '0 0 100%', scrollSnapAlign: 'start',
            overflowY: 'auto', height: '100%',
            paddingBottom: TAB_BAR_HEIGHT + 24, boxSizing: 'border-box',
          }}>
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              <PageCalendar
                futureSchedule={futureSchedule}
                selectedIso={selectedIso}
                onDaySelect={handleDaySelect}
                streak={streak}
              />
            </div>
          </div>
        </div>
      </div>

      <DayDetailSheet
        detail={dayDetail}
        onClose={() => { setDayDetail(null); setSelectedIso(null) }}
      />

      <style>{`div::-webkit-scrollbar{display:none}`}</style>
    </>
  )
}
