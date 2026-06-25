import Link from 'next/link'
import { BookOpen, Flame, Clock, ArrowRight } from 'lucide-react'

import { TopNav } from '@/components/TopNav'
import { CalendarHeatmap } from './CalendarHeatmap'
import { TodayReview } from './TodayReview'
import { createClient } from '@/lib/supabase/server'
import { getProgressStats } from '@/queries/progress'

export const dynamic = 'force-dynamic'

const SAVED_PATTERNS = [
  { id: 1, pattern: 'I want to ~', meaningKo: '~하고 싶어요' },
  { id: 2, pattern: 'I have to ~', meaningKo: '~해야 해요' },
  { id: 3, pattern: 'I just ~', meaningKo: '방금 ~했어요' },
]

function getLevel(completedStories: number, total: number) {
  const pct = total > 0 ? completedStories / total : 0
  if (pct < 0.33) return { label: 'Basic', barPct: Math.round((pct / 0.33) * 100) }
  if (pct < 0.66) return { label: 'Intermediate', barPct: Math.round(((pct - 0.33) / 0.33) * 100) }
  return { label: 'Advanced', barPct: Math.round(((pct - 0.66) / 0.34) * 100) }
}

function StatRow({
  label, labelKo, value, sub, icon: Icon, last,
}: {
  label: string; labelKo: string; value: string; sub: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  last?: boolean
}) {
  return (
    <div className={`flex items-center justify-between py-4 ${last ? '' : 'border-b border-[var(--pd)]'}`}>
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-[var(--pa)]/8 flex items-center justify-center shrink-0">
          <Icon className="w-3 h-3 text-[var(--pa)]" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-[12px] font-semibold text-[var(--pt2)]">{label}</p>
          <p className="text-[10px] text-[var(--pm)] mt-0.5">{labelKo}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-playfair text-[1.2rem] font-bold text-[var(--pt)] leading-none">{value}</p>
        <p className="text-[10px] text-[var(--pm)] mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

export default async function RecordsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const stats = user
    ? await getProgressStats(user.id)
    : { completedStories: 0, totalPatternsSeen: 0, totalReviewCount: 0, favoritesCount: 0, studiedDates: [] as string[] }

  const { count: totalStories } = await supabase
    .from('stories').select('*', { count: 'exact', head: true }).eq('is_published', true)

  const total = totalStories ?? 100
  const totalPatterns = total * 5
  const studyHours = ((stats.totalReviewCount * 3) / 60).toFixed(1)

  const streakDays = (() => {
    const dates = [...(stats.studiedDates ?? [])].sort().reverse()
    if (!dates.length) return 0
    let streak = 0
    const today = new Date()
    for (let i = 0; i < dates.length; i++) {
      const diff = Math.round((today.getTime() - new Date(dates[i]).getTime()) / 86400000)
      if (diff === i || diff === i + 1) streak++
      else break
    }
    return streak
  })()

  // Server-side study counts (Supabase) — merged with localStorage on client
  const studyCounts: Record<string, number> = {}
  for (const iso of stats.studiedDates ?? []) {
    studyCounts[iso] = (studyCounts[iso] ?? 0) + 1
  }

  const level = getLevel(stats.completedStories, total)
  const totalPatternsLearned = total * 5

  return (
    <div className="min-h-dvh bg-[var(--pb)]">
      <TopNav />

      <div className="px-7 pb-20 max-w-sm mx-auto pt-20">

        {/* Title */}
        <div className="mb-8 border-b border-[var(--pd)] pb-6">
          <h1 className="font-playfair text-[1.9rem] font-black leading-none text-[var(--pt)] tracking-tight">PROGRESS</h1>
          <p className="text-[0.78rem] text-[var(--pm)] mt-2 tracking-wide">반복학습 관리</p>
        </div>

        {/* 1. TODAY'S REVIEW */}
        <TodayReview />

        {/* 2. LEARNING CALENDAR */}
        <div className="py-8 border-b border-[var(--pd)]">
          <p className="text-[10px] tracking-[0.26em] text-[var(--pa)] font-bold mb-1">LEARNING CALENDAR</p>
          <p className="text-[0.78rem] text-[var(--pm)] mb-6">날짜를 누르면 그날의 학습 상세를 확인할 수 있어요.</p>
          <CalendarHeatmap studyCounts={studyCounts} />
        </div>

        {/* 3. CURRENT LEVEL */}
        <div className="py-8 border-b border-[var(--pd)]">
          <p className="text-[10px] tracking-[0.26em] text-[var(--pa)] font-bold mb-5">CURRENT LEVEL</p>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="font-playfair text-[2rem] font-bold text-[var(--pt)] leading-none">{level.label}</p>
              <p className="text-[11px] text-[var(--pm)] mt-1.5 italic">You&apos;re doing great. Keep going.</p>
            </div>
            <p className="font-playfair text-[2.2rem] font-bold text-[var(--pa)] leading-none">{level.barPct}%</p>
          </div>

          <div className="h-1.5 bg-[var(--pd)] rounded-full overflow-hidden mb-3">
            <div className="h-full bg-[var(--pa)] rounded-full transition-all" style={{ width: `${level.barPct}%` }} />
          </div>

          <div className="flex justify-between mb-4">
            {['Basic', 'Intermediate', 'Advanced'].map((stage) => (
              <p key={stage} className={`text-[9px] tracking-[0.12em] font-semibold ${stage === level.label ? 'text-[var(--pa)]' : 'text-[var(--pm2)]'}`}>
                {stage.toUpperCase()}
              </p>
            ))}
          </div>

          <div className="flex gap-4">
            <div className="flex-1 rounded-xl bg-[var(--pc)] px-4 py-3 text-center">
              <p className="font-playfair text-[1.3rem] font-bold text-[var(--pt)] leading-none">{stats.totalPatternsSeen}</p>
              <p className="text-[10px] text-[var(--pm)] mt-1">/ {totalPatternsLearned} patterns</p>
            </div>
            <div className="flex-1 rounded-xl bg-[var(--pc)] px-4 py-3 text-center">
              <p className="font-playfair text-[1.3rem] font-bold text-[var(--pt)] leading-none">{stats.completedStories}</p>
              <p className="text-[10px] text-[var(--pm)] mt-1">/ {total} stories</p>
            </div>
          </div>
        </div>

        {/* 4. STUDY STATS */}
        <div className="py-2 border-b border-[var(--pd)]">
          <p className="text-[10px] tracking-[0.26em] text-[var(--pa)] font-bold pt-6 mb-2">STUDY STATS</p>
          <StatRow label="Stories Completed" labelKo="완료한 스토리" value={String(stats.completedStories)} sub={`/ ${total}`} icon={BookOpen} />
          <StatRow label="Patterns Learned" labelKo="학습한 패턴" value={String(stats.totalPatternsSeen)} sub={`/ ${totalPatterns}`} icon={BookOpen} />
          <StatRow label="Current Streak" labelKo="연속 학습일" value={String(streakDays)} sub="days" icon={Flame} />
          <StatRow label="Study Time" labelKo="총 학습 시간" value={studyHours} sub="hours" icon={Clock} last />
        </div>

        {/* 5. PATTERN LIBRARY */}
        <div className="pt-8 pb-6 border-b border-[var(--pd)]">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] tracking-[0.26em] text-[var(--pa)] font-bold">PATTERN LIBRARY</p>
            <Link href="/records/patterns" className="flex items-center gap-1 text-[11px] text-[var(--pa)] font-semibold hover:opacity-70 transition-opacity">
              View All <ArrowRight className="w-3 h-3" strokeWidth={2} />
            </Link>
          </div>
          <p className="text-[0.75rem] text-[var(--pm)] mb-3">저장한 패턴 미리보기</p>
          <div className="space-y-0">
            {SAVED_PATTERNS.map((p, i) => (
              <div key={p.id}>
                {i > 0 && <div className="h-px bg-[var(--pd)]" />}
                <div className="flex items-center gap-4 py-4">
                  <span className="font-playfair text-[1.1rem] font-bold text-[var(--pa)] w-6 shrink-0 leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-[var(--pt)]">{p.pattern}</p>
                    <p className="text-[11px] text-[var(--pm)] mt-0.5">{p.meaningKo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] tracking-[0.2em] text-[var(--pm2)] text-center pt-10">
          SPEAK NATURALLY. CONNECT DEEPLY.
        </p>
      </div>
    </div>
  )
}
