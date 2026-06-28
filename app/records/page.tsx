'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, ArrowRight, BookOpen, Layers, RotateCcw, CalendarClock, AlarmClock } from 'lucide-react'

import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { LearningCalendar } from '@/components/LearningCalendar'
import { magazineStories } from '@/data/magazine-stories'
import { getBookmarks, type BookmarkedPattern } from '@/lib/bookmarks/storage'
import {
  getAllRecords, getDueCount, getTodayDueCount, getOverdueCount,
  getLearnedStoryCount, getLearnedPatternCount, getTotalRepeatCount, getTotalPracticeMs,
  getStudiedTodayStoryCount, getPracticedTodayCount, getReviewedTodayCount,
} from '@/lib/srs/storage'

// PATTO 전체 커리큘럼 규모 (커리큘럼 기준 진행률)
const CURRICULUM = { stories: 800, patterns: 4000 }
// 오늘의 미션 일일 목표
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
  nextStoryId: number
}

function fmtTime(ms: number): string {
  const min = Math.floor(ms / 60000)
  if (min < 60) return `${min}m`
  const h = min / 60
  return `${h < 10 ? h.toFixed(1) : Math.round(h)}h`
}

export default function ProgressPage() {
  const router = useRouter()
  const [s, setS] = useState<Stats | null>(null)

  useEffect(() => {
    const learnedStoryIds = new Set(
      getAllRecords().filter((r) => r.itemType === 'story').map((r) => r.itemId),
    )
    const nextStory = magazineStories.find((st) => !learnedStoryIds.has(String(st.id))) ?? magazineStories[0]
    setS({
      studiedTodayStories: getStudiedTodayStoryCount(),
      practicedTodayPatterns: getPracticedTodayCount(),
      reviewedToday: getReviewedTodayCount(),
      dueNow: getDueCount(),
      todayDue: getTodayDueCount(),
      overdue: getOverdueCount(),
      learnedStories: getLearnedStoryCount(),
      learnedPatterns: getLearnedPatternCount(),
      totalRepeats: getTotalRepeatCount(),
      totalPracticeMs: getTotalPracticeMs(),
      bookmarks: getBookmarks(),
      nextStoryId: nextStory.id,
    })
  }, [])

  const v = s ?? {
    studiedTodayStories: 0, practicedTodayPatterns: 0, reviewedToday: 0, dueNow: 0,
    todayDue: 0, overdue: 0, learnedStories: 0, learnedPatterns: 0, totalRepeats: 0,
    totalPracticeMs: 0, bookmarks: [], nextStoryId: 1,
  }

  const reviewTarget = v.reviewedToday + v.dueNow
  const hasDue = v.dueNow > 0
  const ctaHref = hasDue ? '/review' : `/stories/${v.nextStoryId}`

  const storyPct = v.learnedStories / CURRICULUM.stories
  const patternPct = v.learnedPatterns / CURRICULUM.patterns
  const journeyPct = Math.round(((storyPct + patternPct) / 2) * 100)

  const coach = COACH[Math.floor(Date.now() / 86400000) % COACH.length]

  return (
    <div className="min-h-dvh bg-[var(--pb)]">
      <TopNav />

      <div className="px-5 pb-24 max-w-md mx-auto" style={{ paddingTop: NAV_HEIGHT + 18 }}>

        {/* 2. Coach message */}
        <p className="font-playfair text-[1.05rem] italic text-[var(--pt)] leading-relaxed mb-6">
          {coach}
        </p>

        {/* 3. Today's Mission */}
        <section className="rounded-3xl bg-[var(--pc)] p-6 shadow-sm mb-5">
          <p className="text-[10px] tracking-[0.26em] text-[var(--pa)] font-bold mb-5">TODAY&apos;S MISSION</p>

          <MissionRow icon={BookOpen} label="Story 학습" value={v.studiedTodayStories} total={DAILY.story} />
          <MissionRow icon={Layers} label="Pattern 학습" value={v.practicedTodayPatterns} total={DAILY.pattern} />
          <MissionRow icon={RotateCcw} label="복습하기" value={v.reviewedToday} total={reviewTarget} last />

          <button
            type="button"
            onClick={() => router.push(ctaHref)}
            className="mt-6 w-full rounded-2xl bg-[var(--pa)] text-white py-4 text-[14px] font-bold tracking-[0.03em] hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
          >
            {hasDue ? '복습 시작하기' : '오늘 학습 시작하기'}
            <ArrowRight className="w-4 h-4" strokeWidth={2.4} />
          </button>
        </section>

        {/* 4. Review */}
        <section className="rounded-3xl border border-[var(--pd)] bg-[var(--pb)] p-6 mb-5">
          <p className="text-[10px] tracking-[0.26em] text-[var(--pa)] font-bold mb-4">REVIEW</p>
          <div className="flex gap-4">
            <div className="flex-1 flex items-center gap-3">
              <CalendarClock className="w-5 h-5 text-[var(--pa)]" strokeWidth={1.7} />
              <div>
                <p className="font-playfair text-[1.5rem] font-bold text-[var(--pt)] leading-none">{v.todayDue}</p>
                <p className="text-[11px] text-[var(--pm)] mt-1">오늘 복습</p>
              </div>
            </div>
            <div className="w-px bg-[var(--pd)]" />
            <div className="flex-1 flex items-center gap-3">
              <AlarmClock className="w-5 h-5 text-[var(--pa)]" strokeWidth={1.7} />
              <div>
                <p className="font-playfair text-[1.5rem] font-bold text-[var(--pt)] leading-none">{v.overdue}</p>
                <p className="text-[11px] text-[var(--pm)] mt-1">밀린 복습</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. PATTO Journey */}
        <section className="rounded-3xl border border-[var(--pd)] bg-[var(--pb)] p-6 mb-5">
          <div className="flex items-end justify-between mb-1">
            <p className="text-[10px] tracking-[0.26em] text-[var(--pa)] font-bold">PATTO JOURNEY</p>
            <p className="font-playfair text-[1.8rem] font-bold text-[var(--pa)] leading-none">{journeyPct}%</p>
          </div>
          <p className="text-[11px] text-[var(--pm)] mb-4">Curriculum Complete</p>

          <div className="h-1.5 bg-[var(--pd)] rounded-full overflow-hidden mb-5">
            <div className="h-full bg-[var(--pa)] rounded-full transition-all" style={{ width: `${Math.max(journeyPct, 1)}%` }} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <JourneyStat value={`${v.learnedStories}`} total={`/ ${CURRICULUM.stories}`} label="Story" />
            <JourneyStat value={`${v.learnedPatterns}`} total={`/ ${CURRICULUM.patterns}`} label="Pattern" />
            <JourneyStat value={fmtTime(v.totalPracticeMs)} total="총 낭독" label="시간" />
          </div>
        </section>

        {/* 6. Learning Calendar */}
        <section className="rounded-3xl border border-[var(--pd)] bg-[var(--pb)] p-6 mb-5">
          <p className="text-[10px] tracking-[0.26em] text-[var(--pa)] font-bold mb-5">LEARNING CALENDAR</p>
          <LearningCalendar />
        </section>

        {/* 7. My Patterns */}
        <section className="rounded-3xl border border-[var(--pd)] bg-[var(--pb)] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] tracking-[0.26em] text-[var(--pa)] font-bold">MY PATTERNS</p>
            <Link href="/records/patterns" className="flex items-center gap-1 text-[11px] text-[var(--pa)] font-semibold hover:opacity-70 transition-opacity">
              전체 보기 <ArrowRight className="w-3 h-3" strokeWidth={2} />
            </Link>
          </div>

          {v.bookmarks.length === 0 ? (
            <p className="text-[0.78rem] text-[var(--pm)] leading-relaxed">
              아직 저장한 패턴이 없어요.<br />패턴 옆 북마크를 눌러 자주 쓰는 패턴을 모아보세요.
            </p>
          ) : (
            <div className="divide-y divide-[var(--pd)]">
              {v.bookmarks.slice(0, 3).map((p, i) => (
                <div key={p.patternId} className="flex items-center gap-4 py-3.5">
                  <span className="font-playfair text-[1.05rem] font-bold text-[var(--pa)] w-6 shrink-0 leading-none tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[var(--pt)]">{p.pattern}</p>
                    <p className="text-[11px] text-[var(--pm)] mt-0.5">{p.meaningKo}</p>
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

function MissionRow({
  icon: Icon, label, value, total, last,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string; value: number; total: number; last?: boolean
}) {
  const done = total > 0 && value >= total
  return (
    <div className={`flex items-center gap-3 py-3.5 ${last ? '' : 'border-b border-[var(--pd)]'}`}>
      <Icon className="w-4 h-4 text-[var(--pa)] shrink-0" strokeWidth={1.8} />
      <p className="flex-1 text-[13px] font-semibold text-[var(--pt2)]">{label}</p>
      <p className="text-[13px] font-bold text-[var(--pt)] tabular-nums">
        {value} <span className="text-[var(--pm2)] font-medium">/ {total}</span>
      </p>
      <span className={[
        'w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors',
        done ? 'bg-[var(--pa)] text-white' : 'border border-[var(--pd)] text-transparent',
      ].join(' ')}>
        <Check className="w-3.5 h-3.5" strokeWidth={3} />
      </span>
    </div>
  )
}

function JourneyStat({ value, total, label }: { value: string; total: string; label: string }) {
  return (
    <div className="rounded-xl bg-[var(--pc)] px-3 py-3 text-center">
      <p className="font-playfair text-[1.25rem] font-bold text-[var(--pt)] leading-none">{value}</p>
      <p className="text-[9px] text-[var(--pm)] mt-1.5">{total}</p>
      <p className="text-[9px] text-[var(--pm2)] mt-0.5">{label}</p>
    </div>
  )
}
