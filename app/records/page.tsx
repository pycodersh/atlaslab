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

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ label, sub }: { label: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.26em', color: 'var(--pa)', margin: 0 }}>
        {label}
      </p>
      {sub && (
        <p style={{ fontSize: 11, color: 'var(--pm)', marginTop: 4, lineHeight: 1.6 }}>{sub}</p>
      )}
      <div style={{ height: 1, background: 'var(--pd)', marginTop: 10 }} />
    </div>
  )
}

// ── Chapter heading ───────────────────────────────────────────────────────────
function ChapterHeading({ roman, title, sub }: { roman: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 32, paddingBottom: 22, borderBottom: '2px solid var(--pd)' }}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.26em', color: 'var(--pm)', margin: '0 0 8px' }}>
        {roman}
      </p>
      <h2 className="font-playfair" style={{
        fontSize: 'clamp(2.6rem, 12vw, 3.6rem)',
        fontWeight: 900,
        lineHeight: 1,
        color: 'var(--pt)',
        margin: 0,
        letterSpacing: '-0.02em',
      }}>
        {title}
      </h2>
      {sub && (
        <p className="font-playfair" style={{
          fontSize: 'clamp(0.85rem, 3.5vw, 1rem)',
          fontStyle: 'italic',
          fontWeight: 500,
          color: 'var(--pm)',
          marginTop: 10,
          lineHeight: 1.5,
        }}>
          {sub}
        </p>
      )}
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
    <div style={{ height: '100dvh', overflowY: 'auto', background: 'var(--pb)' }}>
      <TopNav />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: `${NAV_HEIGHT + 28}px 22px 100px` }}>

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div style={{ marginBottom: 52 }}>
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

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* CHAPTER I — TODAY                                               */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <ChapterHeading roman="CHAPTER I" title="Today" sub={coach} />

        {/* ── Today's Mission ──────────────────────────────────────────── */}
        <section style={{ marginBottom: 28 }}>
          <SectionLabel label="TODAY'S MISSION" />
          <MissionRow icon={BookOpen}  label="Story 학습"   value={v.studiedTodayStories}    total={DAILY.story} />
          <MissionRow icon={Layers}    label="Pattern 학습" value={v.practicedTodayPatterns} total={DAILY.pattern} />
          <MissionRow icon={RotateCcw} label="복습하기"     value={v.reviewedToday}          total={reviewTarget} last />
        </section>

        {/* ── Primary CTA ──────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => router.push(v.ctaHref)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '16px 20px',
            background: 'var(--pa)',
            color: '#fff',
            border: 'none',
            borderRadius: 3,
            cursor: 'pointer',
            marginBottom: 44,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.02em' }}>
            {v.ctaLabel}
          </span>
          <ArrowRight style={{ width: 17, height: 17, flexShrink: 0 }} strokeWidth={2.5} />
        </button>

        {/* ── Review ───────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 0 }}>
          <SectionLabel label="REVIEW" />
          <div style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
            <div style={{ flex: 1, paddingRight: 24 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <p className="font-playfair" style={{ fontSize: 'clamp(2.6rem, 12vw, 3.4rem)', fontWeight: 900, color: 'var(--pt)', margin: 0, lineHeight: 1 }}>
                  {v.todayDue}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalendarClock style={{ width: 12, height: 12, color: 'var(--pm)' }} strokeWidth={1.7} />
                <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0 }}>오늘 복습</p>
              </div>
            </div>
            <div style={{ width: 1, background: 'var(--pd)' }} />
            <div style={{ flex: 1, paddingLeft: 24 }}>
              <p className="font-playfair" style={{ fontSize: 'clamp(2.6rem, 12vw, 3.4rem)', fontWeight: 900, color: 'var(--pt)', margin: 0, lineHeight: 1, marginBottom: 4 }}>
                {v.overdue}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlarmClock style={{ width: 12, height: 12, color: 'var(--pm)' }} strokeWidth={1.7} />
                <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0 }}>밀린 복습</p>
              </div>
            </div>
          </div>
          {v.dueNow === 0 && (
            <p style={{ fontSize: 12, color: 'var(--pm)' }}>오늘 복습을 모두 완료했어요.</p>
          )}
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* CHAPTER II — YOUR JOURNEY                                       */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div style={{ marginTop: 64 }}>
          <ChapterHeading
            roman="CHAPTER II"
            title="Your Journey"
            sub={`Curriculum ${journeyPct}% complete`}
          />
        </div>

        {/* ── Hero stats grid ──────────────────────────────────────────── */}
        <section style={{ marginBottom: 44 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {/* Story */}
            <div style={{ paddingRight: 24, paddingBottom: 28, borderRight: '1px solid var(--pd)', borderBottom: '1px solid var(--pd)' }}>
              <p className="font-playfair" style={{ fontSize: 'clamp(2.8rem, 13vw, 4rem)', fontWeight: 900, lineHeight: 1, color: 'var(--pt)', margin: '0 0 8px' }}>
                {v.learnedStories}
              </p>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm)', margin: 0 }}>STORIES</p>
            </div>
            {/* Pattern */}
            <div style={{ paddingLeft: 24, paddingBottom: 28, borderBottom: '1px solid var(--pd)' }}>
              <p className="font-playfair" style={{ fontSize: 'clamp(2.8rem, 13vw, 4rem)', fontWeight: 900, lineHeight: 1, color: 'var(--pt)', margin: '0 0 8px' }}>
                {v.learnedPatterns}
              </p>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm)', margin: 0 }}>PATTERNS</p>
            </div>
            {/* Repeats */}
            <div style={{ paddingRight: 24, paddingTop: 24, borderRight: '1px solid var(--pd)' }}>
              <p className="font-playfair" style={{ fontSize: 'clamp(2.8rem, 13vw, 4rem)', fontWeight: 900, lineHeight: 1, color: 'var(--pt)', margin: '0 0 8px' }}>
                {v.totalRepeats}
              </p>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm)', margin: 0 }}>REPEATS</p>
            </div>
            {/* Reading time */}
            <div style={{ paddingLeft: 24, paddingTop: 24 }}>
              <p className="font-playfair" style={{ fontSize: 'clamp(2.8rem, 13vw, 4rem)', fontWeight: 900, lineHeight: 1, color: 'var(--pt)', margin: '0 0 8px' }}>
                {fmtTime(v.totalPracticeMs)}
              </p>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm)', margin: 0 }}>READING</p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 32 }}>
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
            <p style={{ fontSize: 10, color: 'var(--pm)', margin: 0 }}>Curriculum Complete</p>
          </div>
        </section>

        {/* ── Learning Calendar ─────────────────────────────────────────── */}
        <section style={{ marginBottom: 44 }}>
          <SectionLabel label="LEARNING CALENDAR" sub="매일의 기록이 당신의 실력이 됩니다." />
          <LearningCalendar />
        </section>

        {/* ── Collected Notes ───────────────────────────────────────────── */}
        <section style={{ marginBottom: 44 }}>
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
        </section>

        {/* ── My Patterns ───────────────────────────────────────────────── */}
        <section>
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
