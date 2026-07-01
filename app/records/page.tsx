'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, ArrowRight, BookOpen, Layers, RotateCcw, CalendarClock, AlarmClock } from 'lucide-react'

import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { LearningCalendar } from '@/components/LearningCalendar'
import { magazineStories } from '@/data/magazine-stories'
import { getBookmarks, type BookmarkedPattern } from '@/lib/bookmarks/storage'
import { EDITOR_NOTES, TOTAL_NOTES } from '@/data/editor-notes'
import { getReadNoteIds } from '@/lib/editor/storage'
import {
  getDueCount, getTodayDueCount, getOverdueCount,
  getLearnedStoryCount, getLearnedPatternCount, getTotalRepeatCount, getTotalPracticeMs,
  getStudiedTodayStoryCount, getPracticedTodayCount, getReviewedTodayCount,
  getPracticedPatternCountByStory,
} from '@/lib/srs/storage'

const CURRICULUM = { stories: 800, patterns: 4000 }
const DAILY = { story: 1, pattern: 5 }

const COACH = [
  '매일 조금씩, 자연스럽게. 반복이 실력을 만듭니다.',
  '오늘의 반복이 내일의 자연스러움이 됩니다.',
  '많이 배우기보다, 깊이 반복하세요.',
  '한 문장씩, 입에 붙을 때까지.',
]

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
  ctaLabel: string
  readNoteIds: number[]
}

function computeCta(dueNow: number): { href: string; label: string } {
  if (dueNow > 0) return { href: '/review', label: '복습 시작하기' }
  const practiced = getPracticedPatternCountByStory()
  const inProgress = magazineStories.find((st) => {
    const c = practiced[st.id] ?? 0
    return c > 0 && c < st.patterns.length
  })
  if (inProgress) return { href: `/stories/${inProgress.id}?v=p`, label: '이어서 학습하기' }
  const newStory = magazineStories.find((st) => !(practiced[st.id] > 0)) ?? magazineStories[0]
  return { href: `/stories/${newStory.id}`, label: '오늘 학습 시작하기' }
}

function fmtTime(ms: number): string {
  const min = Math.floor(ms / 60000)
  if (min < 60) return `${min}m`
  const h = min / 60
  return `${h < 10 ? h.toFixed(1) : Math.round(h)}h`
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <section style={{ marginBottom: last ? 0 : 36 }}>
      {children}
    </section>
  )
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionTitle({ label, sub }: { label: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.26em',
        color: 'var(--pa)',
        margin: 0,
      }}>
        {label}
      </p>
      {sub && (
        <p style={{ fontSize: 11, color: 'var(--pm)', marginTop: 4, lineHeight: 1.6 }}>
          {sub}
        </p>
      )}
      <div style={{ height: 1, background: 'var(--pd)', marginTop: 10 }} />
    </div>
  )
}

export default function ProgressPage() {
  const router = useRouter()
  const [s, setS] = useState<Stats | null>(null)

  useEffect(() => {
    const dueNow = getDueCount()
    const cta = computeCta(dueNow)
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
      ctaHref: cta.href,
      ctaLabel: cta.label,
      readNoteIds: getReadNoteIds(),
    })
  }, [])

  const v = s ?? {
    studiedTodayStories: 0, practicedTodayPatterns: 0, reviewedToday: 0, dueNow: 0,
    todayDue: 0, overdue: 0, learnedStories: 0, learnedPatterns: 0, totalRepeats: 0,
    totalPracticeMs: 0, bookmarks: [], ctaHref: '/stories/1', ctaLabel: '오늘 학습 시작하기',
    readNoteIds: [],
  }

  const reviewTarget = v.reviewedToday + v.dueNow
  const storyPct   = v.learnedStories / CURRICULUM.stories
  const patternPct = v.learnedPatterns / CURRICULUM.patterns
  const journeyPct = Math.round(((storyPct + patternPct) / 2) * 100)
  const coach      = COACH[Math.floor(Date.now() / 86400000) % COACH.length]

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>
      <TopNav />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: `${NAV_HEIGHT + 28}px 22px 80px` }}>

        {/* ── Magazine Header ───────────────────────────────────────────── */}
        <div style={{ marginBottom: 36 }}>
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
            fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
            fontStyle: 'italic',
            fontWeight: 500,
            color: 'var(--pm)',
            marginTop: 10,
            lineHeight: 1.6,
          }}>
            {coach}
          </p>
          <div style={{ height: 1.5, background: 'var(--pa)', width: 32, marginTop: 14, borderRadius: 1, opacity: 0.7 }} />
        </div>

        {/* ── Today's Mission ───────────────────────────────────────────── */}
        <Section>
          <SectionTitle label="TODAY'S MISSION" sub="오늘의 학습 목표입니다." />

          <MissionRow icon={BookOpen} label="Story 학습"  value={v.studiedTodayStories}    total={DAILY.story} />
          <MissionRow icon={Layers}   label="Pattern 학습" value={v.practicedTodayPatterns} total={DAILY.pattern} />
          <MissionRow icon={RotateCcw} label="복습하기"   value={v.reviewedToday}          total={reviewTarget} last />

          {/* Text-link CTA */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => router.push(v.ctaHref)}
            onKeyDown={e => e.key === 'Enter' && router.push(v.ctaHref)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginTop: 20, cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--pa)', letterSpacing: '0.02em' }}>
              {v.ctaLabel}
            </span>
            <ArrowRight style={{ width: 13, height: 13, color: 'var(--pa)' }} strokeWidth={2} />
          </div>
        </Section>

        {/* ── Review ───────────────────────────────────────────────────── */}
        <Section>
          <SectionTitle label="REVIEW" />
          <div style={{ display: 'flex', gap: 0 }}>
            <div style={{ flex: 1, paddingRight: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <CalendarClock style={{ width: 15, height: 15, color: 'var(--pa)', flexShrink: 0 }} strokeWidth={1.7} />
                <p className="font-playfair" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--pt)', margin: 0, lineHeight: 1 }}>
                  {v.todayDue}
                </p>
              </div>
              <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0 }}>오늘 복습</p>
            </div>
            <div style={{ width: 1, background: 'var(--pd)', margin: '0 20px 0 0' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <AlarmClock style={{ width: 15, height: 15, color: 'var(--pa)', flexShrink: 0 }} strokeWidth={1.7} />
                <p className="font-playfair" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--pt)', margin: 0, lineHeight: 1 }}>
                  {v.overdue}
                </p>
              </div>
              <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0 }}>밀린 복습</p>
            </div>
          </div>

          {v.dueNow > 0 && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => router.push('/review')}
              onKeyDown={e => e.key === 'Enter' && router.push('/review')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 18, cursor: 'pointer' }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--pa)' }}>복습하기</span>
              <ArrowRight style={{ width: 13, height: 13, color: 'var(--pa)' }} strokeWidth={2} />
            </div>
          )}
          {v.dueNow === 0 && (
            <p style={{ fontSize: 12, color: 'var(--pm)', marginTop: 14 }}>오늘 복습을 모두 완료했어요.</p>
          )}
        </Section>

        {/* ── PATTO Journey ─────────────────────────────────────────────── */}
        <Section>
          <SectionTitle label="PATTO JOURNEY" sub="여정은 하루 한 문장에서 시작됩니다." />

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 28, marginBottom: 16 }}>
            <div>
              <p className="font-playfair" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--pt)', margin: 0, lineHeight: 1 }}>
                {v.learnedStories}
              </p>
              <p style={{ fontSize: 10, color: 'var(--pm)', marginTop: 4 }}>Story</p>
            </div>
            <div>
              <p className="font-playfair" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--pt)', margin: 0, lineHeight: 1 }}>
                {v.learnedPatterns}
              </p>
              <p style={{ fontSize: 10, color: 'var(--pm)', marginTop: 4 }}>Pattern</p>
            </div>
            <div>
              <p className="font-playfair" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--pt)', margin: 0, lineHeight: 1 }}>
                {fmtTime(v.totalPracticeMs)}
              </p>
              <p style={{ fontSize: 10, color: 'var(--pm)', marginTop: 4 }}>Reading</p>
            </div>
          </div>

          {/* Thin progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
          <p style={{ fontSize: 10, color: 'var(--pm)', marginTop: 6 }}>Curriculum Complete</p>
        </Section>

        {/* ── Learning Calendar ─────────────────────────────────────────── */}
        <Section>
          <SectionTitle label="LEARNING CALENDAR" sub="매일의 기록이 당신의 실력이 됩니다." />
          <LearningCalendar />
        </Section>

        {/* ── Collected Notes ───────────────────────────────────────────── */}
        <Section>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.26em', color: 'var(--pa)', margin: 0 }}>
                COLLECTED NOTES
              </p>
              <p style={{ fontSize: 11, color: 'var(--pm)', marginTop: 4, lineHeight: 1.6 }}>
                당신의 생각, 표현, 문장을 모아보세요.
              </p>
            </div>
            <Link
              href="/editor"
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--pa)', fontWeight: 600, textDecoration: 'none', marginTop: 2 }}
            >
              계속 읽기 <ArrowRight style={{ width: 11, height: 11 }} strokeWidth={2} />
            </Link>
          </div>
          <div style={{ height: 1, background: 'var(--pd)', marginBottom: 16 }} />

          {/* Progress row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1.5, background: 'var(--pd)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.max((v.readNoteIds.length / TOTAL_NOTES) * 100, 0.5)}%`,
                background: 'var(--pa)',
                borderRadius: 2,
                transition: 'width 1s ease-out',
              }} />
            </div>
            <span className="font-playfair" style={{ fontSize: 13, fontWeight: 800, color: 'var(--pa)', flexShrink: 0 }}>
              {v.readNoteIds.length}
              <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--pm)' }}> / {TOTAL_NOTES}</span>
            </span>
          </div>

          {v.readNoteIds.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--pm)', lineHeight: 1.7 }}>
              아직 읽은 노트가 없어요.<br />홈에서 Editor&apos;s Note를 눌러 시작해보세요.
            </p>
          ) : (
            <div>
              {v.readNoteIds.slice(-3).reverse().map((nid, idx) => {
                const note = EDITOR_NOTES.find(n => n.id === nid)
                if (!note) return null
                return (
                  <Link
                    key={nid}
                    href={`/editor/${nid}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 0',
                      borderTop: idx === 0 ? 'none' : '1px solid var(--pd)',
                      textDecoration: 'none',
                    }}
                  >
                    <span className="font-playfair" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--pa)', width: 24, flexShrink: 0, lineHeight: 1 }}>
                      {String(nid).padStart(2, '0')}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--pt)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {note.title}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--pm)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {note.oneThingToRemember}
                      </p>
                    </div>
                    <ArrowRight style={{ width: 12, height: 12, color: 'var(--pm2)', flexShrink: 0 }} strokeWidth={1.8} />
                  </Link>
                )
              })}
            </div>
          )}
        </Section>

        {/* ── My Patterns ───────────────────────────────────────────────── */}
        <Section last>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.26em', color: 'var(--pa)', margin: 0 }}>
              MY PATTERNS
            </p>
            <Link
              href="/records/patterns"
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--pa)', fontWeight: 600, textDecoration: 'none' }}
            >
              전체 보기 <ArrowRight style={{ width: 11, height: 11 }} strokeWidth={2} />
            </Link>
          </div>
          <div style={{ height: 1, background: 'var(--pd)', marginBottom: 4 }} />

          {v.bookmarks.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--pm)', lineHeight: 1.7, paddingTop: 12 }}>
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
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--pt)', margin: 0 }}>{p.pattern}</p>
                    <p style={{ fontSize: 11, color: 'var(--pm)', marginTop: 2 }}>{p.meaningKo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

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
      <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--pt2)', margin: 0 }}>{label}</p>
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
