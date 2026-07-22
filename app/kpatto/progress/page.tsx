'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { KPATTO_PATTERNS } from '@/data/kpatto/patterns'
import {
  getStreak,
  getDueItems,
  getActivityByDate,
  localDateStr,
  getPracticedTodayCount,
  getAllRecords,
} from '@/lib/srs/storage'
import { getStatusCounts } from '@/lib/srs/engine'
import { getUI } from '@/lib/kpatto/ui-strings'
import { usePreferences } from '@/contexts/PreferencesContext'

// ── Tokens ───────────────────────────────────────────────────────────────────
const AMBER   = '#D4873A'
const BLACK   = '#111111'
const GRAY_1  = '#444444'
const GRAY_2  = '#999999'
const GRAY_3  = '#CCCCCC'
const DIVIDER = '#F2F2F2'
const WHITE   = '#FFFFFF'

// ── Divider line ─────────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: 1, background: DIVIDER, margin: '0 20px' }} />
}

// ── Section header (Read Ease style) ─────────────────────────────────────────
function SectionHead({
  title,
  subtitle,
  action,
  href,
}: {
  title: string
  subtitle?: string
  action?: string
  href?: string
}) {
  return (
    <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, color: BLACK, letterSpacing: '-0.02em' }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 12, color: GRAY_2, marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      {action && (
        href
          ? <Link href={href} style={{ fontSize: 13, fontWeight: 600, color: AMBER, textDecoration: 'none', paddingTop: 2 }}>{action}</Link>
          : <span style={{ fontSize: 13, fontWeight: 600, color: AMBER, paddingTop: 2, cursor: 'pointer' }}>{action}</span>
      )}
    </div>
  )
}

// ── Stat row (horizontal strip) ───────────────────────────────────────────────
function StatStrip({ items }: { items: { value: string | number; label: string; accent?: boolean }[] }) {
  return (
    <div style={{ display: 'flex', padding: '0 20px 4px' }}>
      {items.map(({ value, label, accent }, i) => (
        <div
          key={label}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '14px 0',
            borderRight: i < items.length - 1 ? `1px solid ${DIVIDER}` : 'none',
          }}
        >
          <div style={{
            fontSize: 26,
            fontWeight: 800,
            color: accent ? AMBER : BLACK,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}>
            {value}
          </div>
          <div style={{ fontSize: 11, color: GRAY_2, marginTop: 5, fontWeight: 500 }}>{label}</div>
        </div>
      ))}
    </div>
  )
}

// ── Review list item (My Collections style) ───────────────────────────────────
function ReviewItem({
  emoji,
  title,
  sub,
  badge,
  badgeAccent,
  isLast,
}: {
  emoji: string
  title: string
  sub: string
  badge: string
  badgeAccent: boolean
  isLast: boolean
}) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px' }}>
        {/* Thumbnail */}
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: badgeAccent ? `${AMBER}18` : DIVIDER,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>
          {emoji}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: BLACK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: GRAY_2, marginTop: 3 }}>{sub}</div>
        </div>

        {/* Badge */}
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: badgeAccent ? AMBER : GRAY_2,
          background: badgeAccent ? `${AMBER}15` : DIVIDER,
          padding: '4px 10px', borderRadius: 99,
          flexShrink: 0,
        }}>
          {badge}
        </span>
      </div>
      {!isLast && <Divider />}
    </>
  )
}

// ── Week calendar ─────────────────────────────────────────────────────────────
function WeekCalendar({ activityMap }: { activityMap: Record<string, number> }) {
  const days = useMemo(() => {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return {
        label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i],
        key: localDateStr(d),
        isToday: localDateStr(d) === localDateStr(today),
      }
    })
  }, [])

  return (
    <div style={{ display: 'flex', padding: '4px 20px 20px', justifyContent: 'space-between', gap: 6 }}>
      {days.map(({ label, key, isToday }, i) => {
        const done = (activityMap[key] ?? 0) > 0
        return (
          <div key={`${key}-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: isToday ? AMBER : GRAY_2 }}>{label}</span>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: isToday ? AMBER : done ? BLACK : 'transparent',
              border: `2px solid ${isToday ? AMBER : done ? BLACK : GRAY_3}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {done && !isToday && (
                <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                  <path d="M1 4L4.5 7.5L11 1" stroke={WHITE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function Bar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0
  return (
    <div style={{ height: 6, background: DIVIDER, borderRadius: 99, overflow: 'hidden', margin: '0 20px 20px' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: BLACK, borderRadius: 99, transition: 'width 0.6s ease' }} />
    </div>
  )
}

// ── Section card wrapper ──────────────────────────────────────────────────────
function Section({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: WHITE, borderTop: `1px solid ${DIVIDER}` }}>
      {children}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function KPattoProgressPage() {
  const { prefs } = usePreferences()
  const t = getUI(prefs.language)

  const totalPatterns = KPATTO_PATTERNS.length
  const totalEpisodes = 100

  const streak         = typeof window !== 'undefined' ? getStreak() : 0
  const practicedToday = typeof window !== 'undefined' ? getPracticedTodayCount() : 0
  const dueItems       = typeof window !== 'undefined' ? getDueItems().slice(0, 5) : []
  const activityMap    = typeof window !== 'undefined' ? getActivityByDate() : {}
  const allRecords     = typeof window !== 'undefined' ? getAllRecords() : []
  const statusCounts   = typeof window !== 'undefined' ? getStatusCounts() : { new: 0, learning: 0, review: 0, mastered: 0 }

  const masteredCount = statusCounts.mastered + statusCounts.review
  const completedEp   = 1
  const todayDone     = practicedToday > 0

  const weekNewCount = useMemo(() => {
    const cutoff = localDateStr(new Date(Date.now() - 7 * 86400000))
    return allRecords.filter(r => r.itemType === 'pattern' && r.firstLearnedAt >= cutoff).length
  }, [allRecords])

  const badges = [
    { emoji: '🎯', label: t.pg_badge_first,    unlocked: masteredCount > 0 },
    { emoji: '🔥', label: t.pg_badge_streak3,  unlocked: streak >= 3 },
    { emoji: '📚', label: t.pg_badge_ep1,      unlocked: completedEp >= 1 },
    { emoji: '⭐', label: t.pg_badge_p10,      unlocked: masteredCount >= 10 },
    { emoji: '💎', label: t.pg_badge_streak30, unlocked: streak >= 30 },
    { emoji: '🏆', label: t.pg_badge_p50,      unlocked: masteredCount >= 50 },
    { emoji: '🎓', label: t.pg_badge_ep10,     unlocked: completedEp >= 10 },
    { emoji: '👑', label: t.pg_badge_p100,     unlocked: masteredCount >= 100 },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: KPATTO_TAB_BAR_HEIGHT }}>
      <KPattoHeader />

      {/* ── Page title ────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 20px 4px' }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: BLACK, letterSpacing: '-0.03em' }}>
          {t.pg_title}
        </div>
      </div>

      {/* ── Stats strip ───────────────────────────────────────────────── */}
      <Section>
        <StatStrip items={[
          { value: streak,        label: t.pg_streak,       accent: streak > 0 },
          { value: masteredCount, label: t.pg_mastery_title },
          { value: completedEp,   label: t.pg_episode_title },
        ]} />
      </Section>

      {/* ── Today's Review ────────────────────────────────────────────── */}
      <Section>
        <SectionHead
          title={t.pg_review_title}
          subtitle={dueItems.length > 0 ? `${dueItems.length} patterns waiting` : undefined}
        />
        {dueItems.length === 0 ? (
          <div style={{ padding: '8px 20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: DIVIDER,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
            }}>
              🎉
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: BLACK }}>{t.pg_review_empty_heading}</div>
              <div style={{ fontSize: 12, color: GRAY_2, marginTop: 2 }}>{t.pg_review_empty_body}</div>
            </div>
          </div>
        ) : (
          <>
            {dueItems.map((item, i) => {
              const isOverdue = item.nextReviewAt < localDateStr(new Date())
              const lastDate  = (item.lastReviewedAt ?? item.lastPracticedAt ?? '').slice(0, 10) || '—'
              return (
                <ReviewItem
                  key={item.itemId}
                  emoji={isOverdue ? '🔴' : '🔵'}
                  title={item.title}
                  sub={`Last studied ${lastDate}`}
                  badge={isOverdue ? t.pg_review_due : t.pg_review_soon}
                  badgeAccent={isOverdue}
                  isLast={i === dueItems.length - 1}
                />
              )
            })}
            <div style={{ padding: '12px 20px 20px' }}>
              <button style={{
                width: '100%', padding: '15px',
                background: BLACK, color: WHITE,
                border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                letterSpacing: '-0.01em',
              }}>
                {t.pg_review_cta}
              </button>
            </div>
          </>
        )}
      </Section>

      {/* ── Pattern Mastery ───────────────────────────────────────────── */}
      <Section>
        <SectionHead
          title={t.pg_mastery_title}
          subtitle={t.pg_mastery_this_week(weekNewCount)}
        />
        <div style={{ padding: '0 20px 6px', display: 'flex', gap: 24 }}>
          {[
            { label: 'Learning', val: statusCounts.learning },
            { label: 'Review',   val: statusCounts.review },
            { label: 'Mastered', val: statusCounts.mastered },
          ].map(({ label, val }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: BLACK, letterSpacing: '-0.03em' }}>{val}</div>
              <div style={{ fontSize: 11, color: GRAY_2, marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: GRAY_2 }}>{masteredCount} / {totalPatterns} patterns</span>
            <span style={{ fontSize: 12, color: GRAY_2 }}>{Math.round((masteredCount / totalPatterns) * 100)}%</span>
          </div>
        </div>
        <Bar value={masteredCount} total={totalPatterns} />
      </Section>

      {/* ── This Week ─────────────────────────────────────────────────── */}
      <Section>
        <SectionHead title={t.pg_calendar_title} />
        <WeekCalendar activityMap={activityMap} />
      </Section>

      {/* ── Episode Progress ──────────────────────────────────────────── */}
      <Section>
        <SectionHead
          title={t.pg_episode_title}
          action={t.pg_episode_continue}
          href="/kpatto/story"
        />
        <div style={{ padding: '0 20px 6px', display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: BLACK, letterSpacing: '-0.04em' }}>{completedEp}</span>
          <span style={{ fontSize: 14, color: GRAY_2 }}>/ {totalEpisodes} episodes</span>
        </div>
        <Bar value={completedEp} total={totalEpisodes} />
      </Section>

      {/* ── Badges ────────────────────────────────────────────────────── */}
      <Section>
        <SectionHead title={t.pg_badges_title} action={t.pg_badges_view_all} />
        <div style={{ padding: '0 20px 20px' }}>
          {badges.map(({ emoji, label, unlocked }, i) => (
            <div key={label}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 0',
                opacity: unlocked ? 1 : 0.3,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 11, flexShrink: 0,
                  background: unlocked ? `${AMBER}15` : DIVIDER,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: BLACK }}>{label}</div>
                  <div style={{ fontSize: 12, color: GRAY_2, marginTop: 2 }}>
                    {unlocked ? 'Earned' : 'Locked'}
                  </div>
                </div>
                {unlocked && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 12l-4-4 1.4-1.4L6 9.2l6.6-6.6L14 4z" fill={AMBER} />
                  </svg>
                )}
              </div>
              {i < badges.length - 1 && (
                <div style={{ height: 1, background: DIVIDER }} />
              )}
            </div>
          ))}
        </div>
      </Section>

    </div>
  )
}
