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
import { getCurrentPhase, PHASES, type Phase } from '@/lib/curriculum/phases'

// ── Memory calculations ────────────────────────────────────────────────────────

function computeMemoryPoints(records: LearningRecord[], phase: Phase): number {
  const prevPhase = PHASES.find(p => p.id === phase.id - 1)
  const minStoryId = prevPhase ? prevPhase.storiesCumulative + 1 : 1
  const maxStoryId = phase.storiesCumulative
  const phasePatterns = records.filter(r =>
    r.itemType === 'pattern' &&
    r.storyId !== undefined &&
    r.storyId >= minStoryId &&
    r.storyId <= maxStoryId
  )
  const score = phasePatterns.reduce((sum, r) => sum + Math.min(r.repeatCount, 5) / 5, 0)
  return Math.round((score / phase.patternsInPhase) * 100)
}

function computeMemoryScore(records: LearningRecord[]): number {
  const patternRecords = records.filter(r => r.itemType === 'pattern')
  const storyIds = new Set(patternRecords.map(r => r.storyId).filter(Boolean))
  const patternScore = patternRecords.reduce((sum, r) => sum + Math.min(r.repeatCount, 5) / 5, 0) / 500
  const storyScore = storyIds.size / 100
  return Math.round((patternScore + storyScore) / 2 * 100)
}

// ── Camp definitions ──────────────────────────────────────────────────────────

const CAMPS = [
  { pts: 25,  label: 'Camp 1' },
  { pts: 50,  label: 'Camp 2' },
  { pts: 75,  label: 'Camp 3' },
  { pts: 100, label: 'Summit' },
]

function nextCampInfo(pts: number): { label: string; left: number } | null {
  const camp = CAMPS.find(c => c.pts > pts)
  if (!camp) return null
  return { label: camp.label, left: camp.pts - pts }
}

// ── Mountain SVG ──────────────────────────────────────────────────────────────

function MountainSVG({ pts }: { pts: number }) {
  const W = 300, H = 170
  const peak = { x: 150, y: 18 }
  const baseL = { x: 0, y: H }
  const baseR = { x: W, y: H }

  const t = Math.min(pts / 100, 1)
  const hx = baseL.x + t * (peak.x - baseL.x)
  const hy = baseL.y + t * (peak.y - baseL.y)

  // camps on left slope
  const campPts = CAMPS.map(c => {
    const ct = c.pts / 100
    return {
      label: c.label,
      reached: pts >= c.pts,
      x: baseL.x + ct * (peak.x - baseL.x),
      y: baseL.y + ct * (peak.y - baseL.y),
    }
  })

  const startPath = `M ${baseL.x},${baseL.y} L ${hx},${hy}`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden
    >
      {/* Mountain body */}
      <path
        d={`M ${baseL.x},${baseL.y} L ${peak.x},${peak.y} L ${baseR.x},${baseR.y} Z`}
        fill="rgba(200,218,245,0.42)"
        stroke="rgba(150,178,225,0.55)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Snow cap */}
      <path
        d={`M ${peak.x - 22},${peak.y + 30} L ${peak.x},${peak.y} L ${peak.x + 22},${peak.y + 30} Z`}
        fill="rgba(255,255,255,0.90)"
      />
      {/* Full left slope (dotted) */}
      <line
        x1={baseL.x} y1={baseL.y}
        x2={peak.x} y2={peak.y}
        stroke="rgba(150,178,225,0.25)"
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />
      {/* Traveled path */}
      {pts > 0 && (
        <path
          d={startPath}
          stroke="rgba(78,118,200,0.75)"
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
        />
      )}
      {/* Camp markers */}
      {campPts.map((c, i) => (
        <g key={i}>
          <circle
            cx={c.x} cy={c.y} r={4.5}
            fill={c.reached ? 'rgba(78,118,200,0.88)' : 'rgba(240,245,255,0.90)'}
            stroke={c.reached ? 'rgba(55,90,170,0.90)' : 'rgba(150,175,215,0.60)'}
            strokeWidth={1.5}
          />
        </g>
      ))}
      {/* Hiker */}
      {pts > 0 && (
        <g>
          <circle cx={hx} cy={hy} r={7} fill="rgba(60,100,200,0.92)" stroke="white" strokeWidth={2} />
          {/* Flag at peak */}
          {pts >= 100 && (
            <text x={peak.x} y={peak.y - 8} textAnchor="middle" fontSize={14}>🚩</text>
          )}
        </g>
      )}
      {/* Base camp label */}
      <text x={8} y={H - 6} fontSize={9} fill="rgba(100,120,160,0.70)" fontWeight="700">START</text>
    </svg>
  )
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
      <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--pm2)', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center' }}>
        {label}
      </span>
    </div>
  )
}

// ── Card 1: Memory Calendar ───────────────────────────────────────────────────

function CardCalendar({
  futureSchedule, selectedIso, onDaySelect, todayNew, todayReview, dueNow, estimatedMin,
}: {
  futureSchedule: Record<string, ScheduledDay>
  selectedIso: string | null
  onDaySelect: (iso: string) => void
  todayNew: number
  todayReview: number
  dueNow: number
  estimatedMin: number
}) {
  return (
    <div style={{ padding: '0 20px', boxSizing: 'border-box' }}>

      {/* Section header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.20em', color: 'var(--pm2)', margin: '0 0 4px', textTransform: 'uppercase' }}>
          CARD 1 OF 3
        </p>
        <p style={{ fontSize: 'clamp(1.4rem, 6vw, 1.9rem)', fontWeight: 900, color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>
          Memory Calendar
        </p>
        <p style={{ fontSize: 11, color: 'var(--pm)', marginTop: 5 }}>이번 달 학습 기록</p>
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

// ── Card 2: Memory Journey ────────────────────────────────────────────────────

function CardJourney({ pts, phase }: { pts: number; phase: Phase }) {
  const nc = nextCampInfo(pts)
  const phasePct = Math.round((pts / 100) * 100)

  // next camp milestone
  const nextCampPts = CAMPS.find(c => c.pts > pts)?.pts ?? 100
  const prevCampPts = [...CAMPS].reverse().find(c => c.pts <= pts)?.pts ?? 0
  const segPct = nextCampPts > prevCampPts
    ? Math.round(((pts - prevCampPts) / (nextCampPts - prevCampPts)) * 100)
    : 100

  return (
    <div style={{ padding: '0 20px', boxSizing: 'border-box' }}>

      {/* Section header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.20em', color: 'var(--pm2)', margin: '0 0 4px', textTransform: 'uppercase' }}>
          CARD 2 OF 3
        </p>
        <p style={{ fontSize: 'clamp(1.4rem, 6vw, 1.9rem)', fontWeight: 900, color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>
          Memory Journey
        </p>
        <p style={{ fontSize: 11, color: 'var(--pm)', marginTop: 5 }}>
          Phase {phase.id} · {phase.name}
        </p>
      </div>

      {/* Points display */}
      <div style={{ ...glassCard, padding: '18px 20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--pm2)', margin: '0 0 4px', textTransform: 'uppercase' }}>
              Memory Points
            </p>
            <p style={{ fontSize: 'clamp(1.8rem, 8vw, 2.4rem)', fontWeight: 900, color: 'var(--pt)', margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {pts}
              <span style={{ fontSize: '0.45em', fontWeight: 500, color: 'var(--pm2)', marginLeft: 4 }}>/ 100</span>
            </p>
          </div>
          {nc && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--pm2)', margin: '0 0 3px', textTransform: 'uppercase' }}>
                Next Camp
              </p>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#4A7AC8', margin: 0 }}>
                {nc.left} pts left
              </p>
            </div>
          )}
        </div>

        {/* Segment progress bar */}
        <div style={{ height: 3, background: 'var(--pd)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{
            height: '100%', width: `${segPct}%`,
            background: 'linear-gradient(90deg, rgba(78,118,200,0.7), rgba(78,118,200,1))',
            borderRadius: 2, transition: 'width 1s ease-out',
          }} />
        </div>
        <p style={{ fontSize: 10, color: 'var(--pm2)', margin: 0 }}>
          {pts === 100 ? '🏔️ Summit reached!' : `${segPct}% to ${CAMPS.find(c => c.pts === nextCampPts)?.label ?? 'Summit'}`}
        </p>
      </div>

      {/* Mountain graphic */}
      <div style={{ ...glassCard, padding: '20px 16px 12px', marginBottom: 18 }}>
        <MountainSVG pts={pts} />
        {/* Camp legend */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 10 }}>
          {CAMPS.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: pts >= c.pts ? 'rgba(78,118,200,0.85)' : 'rgba(180,190,210,0.60)',
              }} />
              <span style={{ fontSize: 9, fontWeight: 600, color: pts >= c.pts ? '#4A7AC8' : 'var(--pm2)' }}>
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase breakdown */}
      <div style={{ ...glassCard, padding: '14px 18px' }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--pm2)', margin: '0 0 10px', textTransform: 'uppercase' }}>
          Phase {phase.id} · {phase.nameKo}
        </p>
        <p style={{ fontSize: 12, color: 'var(--pm)', lineHeight: 1.7, margin: 0 }}>
          패턴 1회 연습 = 20pt · 5회 완성 = 100pt<br />
          현재 Phase의 {phase.patternsInPhase} 패턴 기준으로 계산합니다.
        </p>
      </div>
    </div>
  )
}

// ── Card 3: Memory Score ──────────────────────────────────────────────────────

function CardScore({
  score, learnedStories, learnedPatterns, streak, totalMs,
}: {
  score: number
  learnedStories: number
  learnedPatterns: number
  streak: number
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
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.20em', color: 'var(--pm2)', margin: '0 0 4px', textTransform: 'uppercase' }}>
          CARD 3 OF 3
        </p>
        <p style={{ fontSize: 'clamp(1.4rem, 6vw, 1.9rem)', fontWeight: 900, color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>
          Memory Score
        </p>
        <p style={{ fontSize: 11, color: 'var(--pm)', marginTop: 5 }}>전체 장기 기억 지표</p>
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

      {/* Streak + Practice time */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ ...glassCard, flex: 1, padding: '14px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: 'clamp(1.1rem, 5vw, 1.4rem)', fontWeight: 800, color: 'var(--pt)', margin: '0 0 4px', lineHeight: 1 }}>
            {streak > 0 ? `🔥 ${streak}` : streak}
          </p>
          <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--pm2)', margin: 0, textTransform: 'uppercase' }}>
            Day Streak
          </p>
        </div>
        <div style={{ ...glassCard, flex: 1, padding: '14px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: 'clamp(1.1rem, 5vw, 1.4rem)', fontWeight: 800, color: 'var(--pt)', margin: '0 0 4px', lineHeight: 1 }}>
            {fmtTime(totalMs)}
          </p>
          <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--pm2)', margin: 0, textTransform: 'uppercase' }}>
            Total Practice
          </p>
        </div>
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
  const phase = getCurrentPhase(learnedPatterns)
  const memoryPoints = useMemo(() => computeMemoryPoints(records, phase), [records, phase])
  const memoryScore  = useMemo(() => computeMemoryScore(records), [records])

  // Scroll-snap: track active card
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const handleScroll = () => {
      const idx = Math.round(rail.scrollLeft / rail.clientWidth)
      setActiveCard(Math.min(2, Math.max(0, idx)))
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

  const CARD_LABELS = ['Memory Calendar', 'Memory Journey', 'Memory Score']

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
          {[0, 1, 2].map(i => (
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
          {/* Each card: full-width, scrollable vertically */}
          {[0, 1, 2].map(cardIdx => (
            <div
              key={cardIdx}
              style={{
                flex: '0 0 100%',
                scrollSnapAlign: 'start',
                overflowY: 'auto',
                height: '100%',
                paddingTop: 10,
                paddingBottom: TAB_BAR_HEIGHT + 24,
                boxSizing: 'border-box',
              }}
            >
              {/* Center content */}
              <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
                {cardIdx === 0 && (
                  <CardCalendar
                    futureSchedule={futureSchedule}
                    selectedIso={selectedIso}
                    onDaySelect={handleDaySelect}
                    todayNew={todayNew}
                    todayReview={todayReview}
                    dueNow={dueNow}
                    estimatedMin={estimatedMin}
                  />
                )}
                {cardIdx === 1 && (
                  <CardJourney pts={memoryPoints} phase={phase} />
                )}
                {cardIdx === 2 && (
                  <CardScore
                    score={memoryScore}
                    learnedStories={learnedStories}
                    learnedPatterns={learnedPatterns}
                    streak={streak}
                    totalMs={totalMs}
                  />
                )}
              </div>
            </div>
          ))}
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
