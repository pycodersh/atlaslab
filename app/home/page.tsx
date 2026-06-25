'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, Volume2, BookOpen, Layers, Flame, CheckCheck } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { useSpeech } from '@/hooks/useSpeech'
import {
  getTodayLearningPlan, getFirstIncompleteItem, isTodayComplete,
  getTodayEstimatedMinutes, getPatternOfTheDay, getProgressSummary, getGreeting,
  type LearningItem,
} from '@/lib/review/home'
import { markReviewCompleted } from '@/lib/review/storage'

// ── Label helpers ──────────────────────────────────────────────────────────
function reviewLabel(n: number) { return n === 0 ? 'New' : `Review #${n}` }
function contentTypeLabel(t: LearningItem['contentType']) { return t === 'pattern_set' ? 'Pattern Set' : 'Story' }
function ContentIcon({ type }: { type: LearningItem['contentType'] }) {
  return type === 'pattern_set'
    ? <Layers className="w-3.5 h-3.5 shrink-0" />
    : <BookOpen className="w-3.5 h-3.5 shrink-0" />
}

// ── Complete Banner ────────────────────────────────────────────────────────
function CompleteBanner({ totalMin, router }: { totalMin: number; router: ReturnType<typeof useRouter> }) {
  return (
    <div className="py-8 border-b border-[var(--pd)]">
      <div className="text-center py-2">
        <CheckCheck className="w-8 h-8 text-[var(--pa)] mx-auto mb-4" strokeWidth={1.5} />
        <p className="text-[10px] tracking-[0.26em] text-[var(--pa)] font-bold mb-3">TODAY'S LEARNING COMPLETE</p>
        <p className="font-playfair text-[1.5rem] font-bold text-[var(--pt)] leading-tight mb-2">
          Great work today.
        </p>
        <p className="text-[0.78rem] text-[var(--pm)] mb-6">
          {totalMin}분 학습 완료 · 내일도 복습이 기다리고 있어요.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => router.push('/records')}
            className="px-5 py-2.5 rounded-full bg-[var(--pa)] text-white text-[11px] font-bold tracking-[0.08em] hover:opacity-90 transition-opacity cursor-pointer"
          >
            진행 현황 보기
          </button>
          <button
            type="button"
            onClick={() => router.push('/library')}
            className="px-5 py-2.5 rounded-full border border-[var(--pd)] text-[11px] font-semibold text-[var(--pt2)] tracking-[0.05em] hover:bg-[var(--pc)] transition-colors cursor-pointer"
          >
            패턴 라이브러리
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Today's Learning Card ──────────────────────────────────────────────────
function TodayLearningCard({ item, totalMin, router }: {
  item: LearningItem; totalMin: number; router: ReturnType<typeof useRouter>
}) {
  function go() { router.push(item.href) }

  return (
    <div className="py-8 border-b border-[var(--pd)]">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] tracking-[0.26em] text-[var(--pa)] font-bold">TODAY'S LEARNING</p>
        <p className="text-[10px] text-[var(--pm)]">Estimated {totalMin} min</p>
      </div>

      {/* Main card */}
      <div className="mt-5 border-l-2 border-[var(--pa)] pl-4">
        <p className="text-[10px] tracking-[0.14em] font-bold text-[var(--pm)] mb-1.5">
          {contentTypeLabel(item.contentType)} {item.contentId.padStart(2, '0')} · {reviewLabel(item.reviewNumber)}
        </p>
        <p className="font-playfair text-[1.45rem] font-bold text-[var(--pt)] leading-tight mb-5">
          {item.title}
        </p>

        <button
          type="button"
          onClick={go}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--pa)] text-white text-[12px] font-bold tracking-[0.08em] hover:opacity-90 transition-opacity cursor-pointer"
        >
          Continue Learning
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

// ── Today's Schedule ───────────────────────────────────────────────────────
function TodaySchedule({
  items, completedIds, onComplete,
}: {
  items: LearningItem[]
  completedIds: Set<string>
  onComplete: (item: LearningItem) => void
}) {
  if (items.length === 0) return null

  return (
    <div className="py-8 border-b border-[var(--pd)]">
      <p className="text-[10px] tracking-[0.26em] text-[var(--pa)] font-bold mb-5">TODAY'S SCHEDULE</p>

      <div className="space-y-0">
        {items.map((item, i) => {
          const done = completedIds.has(item.id)
          return (
            <div key={item.id}>
              {i > 0 && <div className="h-px bg-[var(--pd)]" />}
              <div
                className={`flex items-center gap-3 py-3.5 transition-opacity ${done ? 'opacity-35' : ''}`}
              >
                {/* Check indicator */}
                <button
                  type="button"
                  onClick={() => !done && onComplete(item)}
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    done
                      ? 'bg-[var(--pa)] border-[var(--pa)]'
                      : 'border-[var(--pd2)] hover:border-[var(--pa)]'
                  }`}
                >
                  {done && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={2.5} />}
                </button>

                {/* Content icon */}
                <div className="text-[var(--pm)]">
                  <ContentIcon type={item.contentType} />
                </div>

                {/* Labels */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] tracking-[0.1em] font-bold text-[var(--pm)]">
                    {contentTypeLabel(item.contentType)} {item.contentId.padStart(2, '0')} · {reviewLabel(item.reviewNumber)}
                  </span>
                  <p className={`text-[13px] font-semibold leading-snug mt-0.5 ${done ? 'line-through text-[var(--pm)]' : 'text-[var(--pt)]'}`}>
                    {item.title}
                  </p>
                </div>

                <span className="text-[10px] text-[var(--pm2)] shrink-0">{item.estimatedMin}min</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Pattern of the Day ─────────────────────────────────────────────────────
function PatternOfDay() {
  const pod = getPatternOfTheDay()
  const { speak, stop, isSpeaking } = useSpeech()
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!isSpeaking) setPlaying(false)
  }, [isSpeaking])

  function handleListen() {
    if (playing) { stop(); setPlaying(false) }
    else { speak(pod.example); setPlaying(true) }
  }

  return (
    <div className="py-8 border-b border-[var(--pd)]">
      <p className="text-[10px] tracking-[0.26em] text-[var(--pa)] font-bold mb-5">PATTERN OF THE DAY</p>

      <div className="mb-5">
        <p className="font-playfair text-[1.6rem] font-bold text-[var(--pt)] leading-none mb-2">
          {pod.pattern}
        </p>
        <p className="text-[0.78rem] text-[var(--pm)] italic">{pod.meaningKo}</p>
      </div>

      {/* Example */}
      <div className="border-l-2 border-[var(--pd)] pl-4 mb-6">
        <p className="text-[10px] tracking-[0.14em] text-[var(--pm2)] font-semibold mb-1.5">Example</p>
        <p className="text-[13px] text-[var(--pt2)] leading-relaxed italic">{pod.example}</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleListen}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[11px] font-semibold tracking-[0.05em] transition-colors cursor-pointer ${
            playing
              ? 'bg-[var(--pa)] border-[var(--pa)] text-white'
              : 'border-[var(--pd2)] text-[var(--pt2)] hover:border-[var(--pa)] hover:text-[var(--pa)]'
          }`}
        >
          <Volume2 className="w-3 h-3" strokeWidth={2} />
          {playing ? 'Stop' : 'Listen'}
        </button>
        <button
          type="button"
          onClick={() => { /* TODO: open pattern detail */ }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--pd2)] text-[11px] font-semibold text-[var(--pt2)] tracking-[0.05em] hover:border-[var(--pa)] hover:text-[var(--pa)] transition-colors cursor-pointer"
        >
          View Pattern
          <ArrowRight className="w-3 h-3" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

// ── Progress Summary ───────────────────────────────────────────────────────
function ProgressSummary() {
  const [summary, setSummary] = useState({ storiesCompleted: 0, patternsLearned: 0, streakDays: 0, totalStudyDays: 0 })

  useEffect(() => {
    setSummary(getProgressSummary())
  }, [])

  const stats = [
    { label: 'Stories', value: summary.storiesCompleted, sub: '/ 100' },
    { label: 'Patterns', value: summary.patternsLearned, sub: '/ 500' },
    { label: 'Streak', value: summary.streakDays, sub: 'days', icon: <Flame className="w-3 h-3 text-[var(--pa)]" /> },
    { label: 'Study Days', value: summary.totalStudyDays, sub: 'total' },
  ]

  return (
    <div className="pt-8 pb-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] tracking-[0.26em] text-[var(--pa)] font-bold">YOUR PROGRESS</p>
        <button
          type="button"
          onClick={() => { window.location.href = '/records' }}
          className="flex items-center gap-1 text-[10px] text-[var(--pm)] hover:text-[var(--pa)] transition-colors cursor-pointer"
        >
          View All <ArrowRight className="w-2.5 h-2.5" strokeWidth={2} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {stats.map(stat => (
          <div key={stat.label} className="text-center py-3 px-1 rounded-xl bg-[var(--pc)]">
            <div className="flex items-center justify-center gap-0.5 mb-1">
              {stat.icon}
              <p className="font-playfair text-[1.1rem] font-bold text-[var(--pt)] leading-none">{stat.value}</p>
            </div>
            <p className="text-[9px] text-[var(--pm)] leading-none mb-0.5">{stat.sub}</p>
            <p className="text-[8px] tracking-[0.08em] font-semibold text-[var(--pm2)]">{stat.label.toUpperCase()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────
function EmptyState({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div className="py-8 border-b border-[var(--pd)] text-center">
      <p className="text-[10px] tracking-[0.26em] text-[var(--pa)] font-bold mb-5">TODAY'S LEARNING</p>
      <p className="text-[13.5px] font-semibold text-[var(--pt)] mb-1">오늘은 예정된 학습이 없어요.</p>
      <p className="text-[12px] text-[var(--pm)] mb-6">새로운 Story를 시작해보세요.</p>
      <button
        type="button"
        onClick={() => router.push('/stories/1')}
        className="flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--pa)] text-white text-[12px] font-bold tracking-[0.08em] hover:opacity-90 transition-opacity cursor-pointer mx-auto"
      >
        Start New Story <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
      </button>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const [greeting, setGreeting] = useState('Good Morning.')
  const [plan, setPlan] = useState<LearningItem[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [totalMin, setTotalMin] = useState(0)
  const [complete, setComplete] = useState(false)

  const load = useCallback(() => {
    setGreeting(getGreeting())
    const p = getTodayLearningPlan()
    setPlan(p)
    setTotalMin(getTodayEstimatedMinutes())
    setComplete(isTodayComplete())
  }, [])

  useEffect(() => { load() }, [load])

  function handleComplete(item: LearningItem) {
    if (item.scheduleId) markReviewCompleted(item.scheduleId)
    setCompletedIds(prev => {
      const next = new Set([...prev, item.id])
      const allDone = plan.every(i => next.has(i.id))
      if (allDone) setComplete(true)
      return next
    })
  }

  const firstItem = getFirstIncompleteItem()

  return (
    <div className="min-h-dvh bg-[var(--pb)]">
      <TopNav />

      <div className="px-7 pb-20 max-w-sm mx-auto pt-20">

        {/* Greeting */}
        <div className="pt-6 pb-8 border-b border-[var(--pd)]">
          <p className="font-playfair text-[2rem] font-black leading-none text-[var(--pt)] tracking-tight mb-3">
            {greeting}
          </p>
          <p className="text-[0.82rem] text-[var(--pm)] italic">Speak naturally today.</p>
        </div>

        {/* Today's Learning */}
        {complete ? (
          <CompleteBanner totalMin={totalMin} router={router} />
        ) : firstItem ? (
          <TodayLearningCard item={firstItem} totalMin={totalMin} router={router} />
        ) : (
          <EmptyState router={router} />
        )}

        {/* Today's Schedule */}
        {plan.length > 0 && (
          <TodaySchedule
            items={plan}
            completedIds={completedIds}
            onComplete={handleComplete}
          />
        )}

        {/* Pattern of the Day */}
        <PatternOfDay />

        {/* Progress Summary */}
        <ProgressSummary />

        <p className="text-[10px] tracking-[0.2em] text-[var(--pm2)] text-center pb-6">
          SPEAK NATURALLY. CONNECT DEEPLY.
        </p>
      </div>
    </div>
  )
}
