'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check, ChevronRight, BookOpen, RotateCcw, X,
  CalendarClock, HelpCircle, Clock,
} from 'lucide-react'

import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { LearningCalendar } from '@/components/LearningCalendar'
import { SectionLabel } from '@/components/SectionLabel'
import { useT } from '@/hooks/useT'
import { magazineStories } from '@/data/magazine-stories'
import {
  getDueCount,
  getLearnedStoryCount, getLearnedPatternCount, getTotalPracticeMs,
  getStudiedTodayStoryCount, getPracticedTodayCount, getReviewedTodayCount,
  getPracticedPatternCountByStory, getStreak,
} from '@/lib/srs/storage'
import {
  getStatusCounts, getFutureSchedule,
  getEnhancedDayDetail, getStoryActivity, getActiveStoryProgress,
  getMissionItems, getTodayMission,
  type PatternStatus, type ScheduledDay,
  type EnhancedDayDetail, type StoryProgressItem, type MissionItem,
} from '@/lib/srs/engine'
import { getCurrentPhase, getPhaseProgress, PHASES } from '@/lib/curriculum/phases'

// ── 타입 ─────────────────────────────────────────────────────────────────────

type Stats = {
  studiedTodayStories:    number
  practicedTodayPatterns: number
  reviewedToday:          number
  dueNow:                 number
  learnedStories:         number
  learnedPatterns:        number
  totalPracticeMs:        number
  streak:                 number
  ctaHref:                string
  statusCounts:           ReturnType<typeof getStatusCounts>
  futureSchedule:         Record<string, ScheduledDay>
  missionItems:           MissionItem[]
  estimatedMinutes:       number
}

// ── 헬퍼 ─────────────────────────────────────────────────────────────────────

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


// ── Pattern Status 바 ─────────────────────────────────────────────────────────

const STATUS_META: { key: PatternStatus; label: string; color: string }[] = [
  { key: 'new',      label: 'New',      color: 'var(--pm2)' },
  { key: 'learning', label: 'Learning', color: '#E67E22' },
  { key: 'review',   label: 'Review',   color: 'var(--pa)' },
  { key: 'mastered', label: 'Mastered', color: '#27AE60' },
]

const STATUS_COLOR: Record<string, string> = {
  new: 'var(--pm2)', learning: '#E67E22', review: 'var(--pa)', mastered: '#27AE60',
}

function PatternStatusBar() {
  const [counts, setCounts] = useState<ReturnType<typeof getStatusCounts> | null>(null)
  useEffect(() => { setCounts(getStatusCounts()) }, [])

  if (!counts) return null
  const total = counts.learning + counts.review + counts.mastered
  if (total === 0) return null

  return (
    <div style={{ marginTop: 20 }}>
      <p style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.16em',
        color: 'var(--pm2)', margin: '0 0 8px', textTransform: 'uppercase',
      }}>
        Pattern Status
      </p>
      <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', gap: 1 }}>
        {STATUS_META.map(({ key, color }) => {
          const pct = (counts[key] / (total + counts.new)) * 100
          return pct > 0 ? (
            <div key={key} style={{ width: `${pct}%`, background: color, transition: 'width 1s ease-out' }} />
          ) : null
        })}
      </div>
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

// ── Story Activity 상세 (확장 시 표시) ────────────────────────────────────────

function StoryActivityDetail({ storyId, storyTitle }: { storyId: number; storyTitle: string }) {
  const story = magazineStories.find(s => s.id === storyId)
  const patternIds = story?.patterns.map(p => p.id) ?? []
  const activity = getStoryActivity(storyId, storyTitle, patternIds)

  return (
    <div style={{
      margin: '4px 0 12px', padding: '12px 14px',
      background: 'var(--pc)', borderRadius: 10,
    }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: 'var(--pm2)' }}>
          Viewed <strong style={{ color: 'var(--pt)' }}>{activity.viewCount}×</strong>
        </span>
        <span style={{ fontSize: 11, color: 'var(--pm2)' }}>
          Reviews <strong style={{ color: 'var(--pt)' }}>{activity.reviewsCompleted}/{activity.stages.length}</strong>
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
          color: STATUS_COLOR[activity.status] ?? 'var(--pm2)',
        }}>
          {activity.status}
        </span>
      </div>
      {activity.nextReviewAt && (
        <p style={{ fontSize: 10, color: 'var(--pm)', margin: '0 0 10px' }}>
          Next review: <strong style={{ color: 'var(--pt)' }}>{fmtDate(activity.nextReviewAt.slice(0, 10))}</strong>
        </p>
      )}
      {activity.stages.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {activity.stages.map((stage, i) => (
            <div key={i} style={{
              padding: '3px 7px', borderRadius: 5,
              background: stage.status === 'new' ? 'var(--pd)' : `${STATUS_COLOR[stage.status]}22`,
              border: `1px solid ${STATUS_COLOR[stage.status] ?? 'var(--pd)'}33`,
            }}>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                color: STATUS_COLOR[stage.status] ?? 'var(--pm2)',
              }}>
                P{i + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Story Progress 섹션 (활성 스토리만, 최대 8개) ────────────────────────────

function StoryProgressSection() {
  const router = useRouter()
  const [list, setList] = useState<StoryProgressItem[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => { setList(getActiveStoryProgress(8)) }, [])

  if (list.length === 0) return null

  return (
    <section style={{ marginBottom: 72 }}>
      <SectionLabel
        label="Story Progress"
        sub="현재 진행 중인 Story의 기억 상태입니다."
      />

      {list.map((item) => {
        const isExpanded = expanded === item.storyId
        const isMastered = item.status === 'mastered'

        return (
          <div key={item.storyId}>
            <button
              type="button"
              onClick={() => setExpanded(isExpanded ? null : item.storyId)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '13px 0', borderBottom: '1px solid var(--pd)',
                background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                color: 'var(--pm2)', width: 22, flexShrink: 0,
              }}>
                {String(item.storyId).padStart(2, '0')}
              </span>

              <span style={{
                flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--pt2)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {item.storyTitle}
              </span>

              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <span key={n} style={{
                    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    background: n <= item.dots
                      ? (STATUS_COLOR[item.status] ?? 'var(--pa)')
                      : 'var(--pd)',
                    transition: 'background 0.3s',
                  }} />
                ))}
              </div>

              {isMastered ? (
                <span style={{
                  fontSize: 9, fontWeight: 700, color: '#27AE60',
                  letterSpacing: '0.1em', width: 54, textAlign: 'right', flexShrink: 0,
                }}>
                  MASTERED
                </span>
              ) : (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: 'var(--pm2)',
                  fontVariantNumeric: 'tabular-nums', width: 22, textAlign: 'right', flexShrink: 0,
                }}>
                  {item.dots}/5
                </span>
              )}

              <ChevronRight style={{
                width: 12, height: 12, color: 'var(--pm2)', flexShrink: 0,
                transform: isExpanded ? 'rotate(90deg)' : 'none',
                transition: 'transform 0.2s',
              }} strokeWidth={2} />
            </button>

            {isExpanded && (
              <StoryActivityDetail storyId={item.storyId} storyTitle={item.storyTitle} />
            )}
          </div>
        )
      })}

      {/* View All Stories */}
      <button
        type="button"
        onClick={() => router.push('/stories/progress')}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          width: '100%', marginTop: 16, padding: '11px 0',
          background: 'none', border: '1px solid var(--pd)',
          borderRadius: 10, cursor: 'pointer',
          fontSize: 12, fontWeight: 600, color: 'var(--pm2)',
          letterSpacing: '0.02em',
        }}
      >
        View All Stories
        <ChevronRight style={{ width: 13, height: 13 }} strokeWidth={2} />
      </button>
    </section>
  )
}

// ── Day Detail Bottom Sheet ───────────────────────────────────────────────────

function DayDetailSheet({ detail, onClose }: { detail: EnhancedDayDetail | null; onClose: () => void }) {
  const open = !!detail
  const [expandedStoryId, setExpandedStoryId] = useState<number | null>(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => { if (!open) setExpandedStoryId(null) }, [open])

  const isEmpty = detail && detail.completed.length === 0 && detail.due.length === 0 && detail.upcoming.length === 0

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.45)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.25s ease',
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 61,
        background: 'rgba(252,250,255,0.94)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderRadius: '24px 24px 0 0',
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.10)',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
        paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
        maxHeight: '80dvh', overflowY: 'auto',
      }}>
        <div style={{ padding: '12px 24px 0' }}>
          <div style={{ width: 36, height: 4, background: 'var(--pd)', borderRadius: 2, margin: '0 auto' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 0' }}>
          <p style={{
            fontSize: 'clamp(1.4rem, 5.5vw, 1.7rem)', fontWeight: 900,
            color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          }}>
            {detail ? fmtDate(detail.date) : ''}
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
          <div style={{ padding: '20px 24px' }}>
            {isEmpty && (
              <p style={{ fontSize: 13, color: 'var(--pm2)', textAlign: 'center', paddingTop: 16 }}>
                이 날은 학습 기록이 없어요.
              </p>
            )}

            {/* ── Completed ── */}
            {detail.completed.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
                  color: '#27AE60', textTransform: 'uppercase', margin: '0 0 10px',
                }}>
                  Completed
                  {detail.totalPracticeMs > 0 && (
                    <span style={{ fontWeight: 400, color: 'var(--pm2)', marginLeft: 8 }}>
                      · {fmtTime(detail.totalPracticeMs)}
                    </span>
                  )}
                </p>
                {detail.completed.map((item, i) => {
                  const isExp = expandedStoryId === item.storyId
                  return (
                    <div key={item.storyId}>
                      <button type="button" onClick={() => setExpandedStoryId(isExp ? null : item.storyId)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                          padding: '12px 0', borderBottom: '1px solid var(--pd)',
                          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <Check style={{ width: 13, height: 13, color: '#27AE60', flexShrink: 0 }} strokeWidth={2.5} />
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--pt)' }}>
                          Story {String(item.storyId).padStart(2, '0')} · {item.storyTitle}
                        </span>
                        {item.practiceMins > 0 && (
                          <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--pm2)', flexShrink: 0 }}>
                            {item.practiceMins}m
                          </span>
                        )}
                        <ChevronRight style={{
                          width: 12, height: 12, color: 'var(--pm2)', flexShrink: 0,
                          transform: isExp ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s',
                        }} strokeWidth={2} />
                      </button>
                      {isExp && <StoryActivityDetail storyId={item.storyId} storyTitle={item.storyTitle} />}
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── Due ── */}
            {detail.due.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
                  color: 'var(--pa)', textTransform: 'uppercase', margin: '0 0 10px',
                }}>
                  Due
                </p>
                {detail.due.map((item, i) => (
                  <div key={item.storyId} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0',
                    borderBottom: i < detail.due.length - 1 ? '1px solid var(--pd)' : 'none',
                  }}>
                    <RotateCcw style={{ width: 13, height: 13, color: 'var(--pa)', flexShrink: 0 }} strokeWidth={2} />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--pt2)' }}>
                      Story {String(item.storyId).padStart(2, '0')} · {item.storyTitle} Review
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Upcoming ── */}
            {detail.upcoming.length > 0 && (
              <div>
                <p style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
                  color: 'var(--pm2)', textTransform: 'uppercase', margin: '0 0 10px',
                }}>
                  Upcoming
                </p>
                {detail.upcoming.map((item, i) => (
                  <div key={`${item.storyId}-${i}`} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0',
                    borderBottom: i < detail.upcoming.length - 1 ? '1px solid var(--pd)' : 'none',
                  }}>
                    <CalendarClock style={{ width: 13, height: 13, color: 'var(--pm2)', flexShrink: 0 }} strokeWidth={1.8} />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--pt2)' }}>
                      Story {String(item.storyId).padStart(2, '0')} · {item.storyTitle}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--pm2)', flexShrink: 0 }}>
                      {fmtDate(item.date.slice(0, 10))}
                    </span>
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

// ── Memory Engine Help Sheet ──────────────────────────────────────────────────

function HelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
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
        background: 'rgba(252,250,255,0.94)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderRadius: '24px 24px 0 0',
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.10)',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
        paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
        maxHeight: '80dvh', overflowY: 'auto',
      }}>
        <div style={{ padding: '12px 24px 0' }}>
          <div style={{ width: 36, height: 4, background: 'var(--pd)', borderRadius: 2, margin: '0 auto' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 0' }}>
          <p style={{
            fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', fontWeight: 900,
            color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
            {['1일', '3일', '7일', '14일', '30일', '✓ Mastered'].map((step, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: i === arr.length - 1 ? '#27AE60' : 'var(--pt)',
                  background: 'var(--pc)', borderRadius: 6, padding: '4px 8px',
                }}>
                  {step}
                </span>
                {i < arr.length - 1 && <span style={{ fontSize: 10, color: 'var(--pm2)' }}>→</span>}
              </div>
            ))}
          </div>

          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm)', margin: '0 0 12px', textTransform: 'uppercase' }}>
            Story Progress 도트
          </p>
          <p style={{ fontSize: 12, color: 'var(--pm)', lineHeight: 1.6, margin: '0 0 24px' }}>
            ● 도트는 해당 Story의 기억 강도를 나타내요.<br />
            5개 모두 채워지면 Mastered — 장기 기억 완성이에요.
          </p>

          <div style={{ padding: '14px 16px', background: 'var(--pc)', borderRadius: 10 }}>
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
  const router   = useRouter()
  const t        = useT()
  const [s, setS]                   = useState<Stats | null>(null)
  const [dayDetail, setDayDetail]   = useState<EnhancedDayDetail | null>(null)
  const [selectedIso, setSelectedIso] = useState<string | null>(null)
  const [helpOpen, setHelpOpen]     = useState(false)

  useEffect(() => {
    const mission = getTodayMission()
    setS({
      studiedTodayStories:    getStudiedTodayStoryCount(),
      practicedTodayPatterns: getPracticedTodayCount(),
      reviewedToday:          getReviewedTodayCount(),
      dueNow:                 getDueCount(),
      learnedStories:         getLearnedStoryCount(),
      learnedPatterns:        getLearnedPatternCount(),
      totalPracticeMs:        getTotalPracticeMs(),
      streak:                 getStreak(),
      ctaHref:                computeCtaHref(),
      statusCounts:           getStatusCounts(),
      futureSchedule:         getFutureSchedule(),
      missionItems:           getMissionItems(),
      estimatedMinutes:       mission.estimatedMinutes,
    })
  }, [])

  const v = s ?? {
    studiedTodayStories: 0, practicedTodayPatterns: 0, reviewedToday: 0, dueNow: 0,
    learnedStories: 0, learnedPatterns: 0, totalPracticeMs: 0, streak: 0,
    ctaHref: '/stories/1',
    statusCounts: { new: 0, learning: 0, review: 0, mastered: 0 },
    futureSchedule: {},
    missionItems: [],
    estimatedMinutes: 0,
  }

  const phase      = getCurrentPhase(v.learnedPatterns)
  const phasePct   = getPhaseProgress(phase, v.learnedPatterns)
  const storyPct   = (v.learnedStories  / phase.storiesCumulative)  * 100
  const patternPct = (v.learnedPatterns / phase.patternsCumulative) * 100

  function handleDaySelect(iso: string) {
    if (selectedIso === iso) { setSelectedIso(null); setDayDetail(null); return }
    setSelectedIso(iso)
    setDayDetail(getEnhancedDayDetail(iso))
  }

  return (
    <>
      <div style={{ height: '100dvh', overflowY: 'auto' }}>
        <TopNav />

        <div style={{
          maxWidth: 480, margin: '0 auto',
          paddingTop: 'calc(var(--pnav-h) + 28px)',
          paddingLeft: 24, paddingRight: 24, paddingBottom: TAB_BAR_HEIGHT + 24,
          boxSizing: 'border-box',
        }}>

          {/* ── Page title ─────────────────────────────────────────────── */}
          <div style={{ marginBottom: 44, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{
                fontSize: 'clamp(2rem, 9vw, 2.8rem)', fontWeight: 900,
                letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--pt)', margin: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}>
                Progress
              </p>
              <p style={{
                fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',
                fontWeight: 400, color: 'var(--pm)', marginTop: 10, lineHeight: 1.6,
              }}>
                {t('progress_subtitle')}
              </p>
              <div style={{ height: 1.5, background: 'var(--pa)', width: 32, marginTop: 14, borderRadius: 1, opacity: 0.7 }} />
            </div>
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

          {/* ── 1. TODAY'S MISSION ─────────────────────────────────────── */}
          <section style={{ marginBottom: 72 }}>
            <SectionLabel label="Today's Mission" sub={t('mission_sub')} />

            {v.missionItems.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--pm2)', padding: '16px 0' }}>
                No missions for today. See you tomorrow!
              </p>
            ) : (() => {
              const newItems     = v.missionItems.filter(i => i.type === 'new_story' || i.type === 'in_progress_story')
              const reviewItems  = v.missionItems.filter(i => i.type === 'review_pattern')
              const firstPending = v.missionItems.find(i => !i.done)
              const allDone      = v.missionItems.every(i => i.done)

              const secLabel: React.CSSProperties = {
                fontSize: 11, fontWeight: 800, letterSpacing: '0.12em',
                color: 'var(--pt)', textTransform: 'uppercase', margin: '0 0 10px',
                display: 'flex', alignItems: 'center', gap: 6,
              }

              return (
                <>
                  {/* New Learning */}
                  {newItems.length > 0 && (
                    <div style={{ marginBottom: 18 }}>
                      <p style={secLabel}>
                        <BookOpen style={{ width: 11, height: 11 }} strokeWidth={2.5} />
                        New Learning
                      </p>
                      {newItems.map(item => (
                        <div key={item.storyId} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '11px 0', borderBottom: '1px solid var(--pd)',
                        }}>
                          <span style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                            color: 'var(--pm2)', width: 22, flexShrink: 0,
                          }}>
                            {String(item.storyId).padStart(2, '0')}
                          </span>
                          <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--pt2)' }}>
                            {item.storyTitle}
                          </span>
                          <span style={{
                            fontSize: 11, fontWeight: 700,
                            color: item.done ? '#27AE60' : 'var(--pa)',
                          }}>
                            {item.done ? '✓' : '▶'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Review */}
                  {reviewItems.length > 0 && (
                    <div style={{ marginBottom: 18 }}>
                      <p style={secLabel}>
                        <RotateCcw style={{ width: 11, height: 11 }} strokeWidth={2.5} />
                        Review — {reviewItems.length} {reviewItems.length === 1 ? 'Story' : 'Stories'}
                      </p>
                      {reviewItems.map(item => (
                        <div key={item.storyId} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '11px 0', borderBottom: '1px solid var(--pd)',
                        }}>
                          <span style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                            color: 'var(--pm2)', width: 22, flexShrink: 0,
                          }}>
                            {String(item.storyId).padStart(2, '0')}
                          </span>
                          <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--pt2)' }}>
                            {item.storyTitle}
                          </span>
                          <span style={{
                            fontSize: 11, fontWeight: 700,
                            color: item.done ? '#27AE60' : 'var(--pm2)',
                          }}>
                            {item.done ? '✓' : '○'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Estimated time */}
                  {v.estimatedMinutes > 0 && !allDone && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      marginBottom: 16, padding: '10px 13px',
                      background: 'var(--pc)', borderRadius: 10,
                    }}>
                      <Clock style={{ width: 13, height: 13, color: 'var(--pm2)', flexShrink: 0 }} strokeWidth={1.8} />
                      <span style={{ fontSize: 12, color: 'var(--pm2)' }}>
                        Estimated time&nbsp;
                        <strong style={{ color: 'var(--pt)', fontVariantNumeric: 'tabular-nums' }}>
                          ~{v.estimatedMinutes} min
                        </strong>
                      </span>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={() => router.push(firstPending ? firstPending.href : v.ctaHref)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      width: '100%', marginTop: 4, padding: '14px 0',
                      background: 'rgba(255,255,255,0.68)',
                      backdropFilter: 'blur(24px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                      border: '1px solid rgba(255,255,255,0.82)',
                      boxShadow: '0 2px 14px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.95)',
                      borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                      color: 'var(--pa)', letterSpacing: '0.02em',
                      transition: 'all 0.15s',
                    }}
                  >
                    {allDone ? 'All done today!' : 'Continue Learning'}
                    {!allDone && <ChevronRight style={{ width: 14, height: 14 }} strokeWidth={2.5} />}
                  </button>
                </>
              )
            })()}
          </section>

          {/* ── 2. MEMORY CALENDAR ─────────────────────────────────────── */}
          <section style={{ marginBottom: 72 }}>
            <SectionLabel
              label="Memory Calendar"
              sub={t('calendar_sub')}
            />
            <LearningCalendar
              onDaySelect={handleDaySelect}
              selectedIso={selectedIso}
              futureSchedule={v.futureSchedule}
            />
          </section>

          {/* ── 3. STORY PROGRESS ──────────────────────────────────────── */}
          <StoryProgressSection />

          {/* ── 4. OVERALL PROGRESS ────────────────────────────────────── */}
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

            {/* Phase % + next phase hint */}
            <div style={{
              marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 0', borderTop: '1px solid var(--pd)',
            }}>
              <div>
                <p style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.16em',
                  color: 'var(--pm2)', margin: '0 0 4px', textTransform: 'uppercase',
                }}>
                  Phase {phase.id} Completion
                </p>
                <p style={{
                  fontSize: 'clamp(1.4rem, 6vw, 1.8rem)', fontWeight: 900,
                  color: 'var(--pa)', margin: 0, lineHeight: 1, letterSpacing: '-0.02em',
                }}>
                  {phasePct}%
                </p>
              </div>
              {PHASES.filter(p => !p.unlocked).slice(0, 1).map(next => (
                <div key={next.id} style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 10, color: 'var(--pm2)', margin: '0 0 2px' }}>🔒 Next</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--pm)', margin: 0 }}>
                    Phase {next.id} · {next.name}
                  </p>
                </div>
              ))}
            </div>

            <PatternStatusBar />
          </section>

          {/* ── 5. LEARNING JOURNEY ────────────────────────────────────── */}
          <section style={{ marginBottom: 72 }}>
            <SectionLabel label="Learning Journey" sub={t('journey_sub')} />
            <div className="glass-card" style={{ display: 'flex', overflow: 'hidden' }}>
              <StatCell value={fmtTime(v.totalPracticeMs)}                  label="Practice"     border />
              <StatCell value={`${v.streak > 0 ? '🔥' : ''}${v.streak}`} label="Day Streak"   border />
              <StatCell value={v.learnedStories}                            label="Stories Done" border />
              <StatCell value={v.learnedPatterns}                           label="Patterns" />
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
