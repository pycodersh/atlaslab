import Link from 'next/link'
import { BookOpen, Flame, Clock, ArrowRight } from 'lucide-react'

import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { CalendarHeatmap } from './CalendarHeatmap'
import { createClient } from '@/lib/supabase/server'
import { getProgressStats } from '@/queries/progress'

export const dynamic = 'force-dynamic'

// Dummy saved patterns (until real saved-pattern DB is wired)
const SAVED_PATTERNS = [
  { id: 1, pattern: 'I want to ~', meaningKo: '~하고 싶어요' },
  { id: 2, pattern: 'I have to ~', meaningKo: '~해야 해요' },
  { id: 3, pattern: 'I just ~', meaningKo: '방금 ~했어요' },
]

// ── Level logic ────────────────────────────────────────────────────────
function getLevel(completedStories: number, total: number) {
  const pct = total > 0 ? completedStories / total : 0
  if (pct < 0.33) return { label: 'Basic', next: 'Intermediate', barPct: Math.round((pct / 0.33) * 100) }
  if (pct < 0.66) return { label: 'Intermediate', next: 'Advanced', barPct: Math.round(((pct - 0.33) / 0.33) * 100) }
  return { label: 'Advanced', next: null, barPct: Math.round(((pct - 0.66) / 0.34) * 100) }
}

// ── Stat row ───────────────────────────────────────────────────────────
function StatRow({
  label,
  labelKo,
  value,
  sub,
  icon: Icon,
  last,
}: {
  label: string
  labelKo: string
  value: string
  sub: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  last?: boolean
}) {
  return (
    <div className={`flex items-center justify-between py-5 ${last ? '' : 'border-b border-[#EDE5DC]'}`}>
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-[#8B2246]/8 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-[#8B2246]" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[#3A3A3A] tracking-wide">{label}</p>
          <p className="text-[10px] text-[#B8AFA8] mt-0.5">{labelKo}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-playfair text-[1.4rem] font-bold text-[#1A1A1A] leading-none">{value}</p>
        <p className="text-[11px] text-[#9B9490] mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────
export default async function RecordsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const stats = user
    ? await getProgressStats(user.id)
    : {
        completedStories: 0,
        totalPatternsSeen: 0,
        totalReviewCount: 0,
        favoritesCount: 0,
        studiedDates: [] as string[],
      }

  const { count: totalStories } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

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

  // Build study-count map from dates array (1 per day for now)
  const studyCounts: Record<string, number> = {}
  for (const iso of stats.studiedDates ?? []) {
    studyCounts[iso] = (studyCounts[iso] ?? 0) + 1
  }

  const level = getLevel(stats.completedStories, total)

  return (
    <div className="min-h-dvh bg-[#FAF8F4]">
      <TopNav />

      <div
        className="px-7 pb-20 max-w-sm mx-auto pt-20"
        
      >
        {/* ── Page title ── */}
        <div className="mb-8 border-b border-[#EDE5DC] pb-6">
          <h1 className="font-playfair text-[1.9rem] font-black leading-none text-[#1A1A1A] tracking-tight">
            PROGRESS
          </h1>
          <p className="text-[0.78rem] text-[#9B9490] mt-2 tracking-wide">나의 학습 기록</p>
        </div>

        {/* ── 1. Learning Calendar ── */}
        <div className="pb-8 border-b border-[#EDE5DC]">
          <p className="text-[10px] tracking-[0.26em] text-[#8B2246] font-bold mb-6">
            LEARNING CALENDAR
          </p>
          <CalendarHeatmap studyCounts={studyCounts} />
        </div>

        {/* ── 2. Current Level ── */}
        <div className="py-8 border-b border-[#EDE5DC]">
          <p className="text-[10px] tracking-[0.26em] text-[#8B2246] font-bold mb-5">
            CURRENT LEVEL
          </p>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="font-playfair text-[2rem] font-bold text-[#1A1A1A] leading-none">
                {level.label}
              </p>
              <p className="text-[11px] text-[#9B9490] mt-1.5 italic">
                You&apos;re doing great. Keep going.
              </p>
            </div>
            <p className="font-playfair text-[2.2rem] font-bold text-[#8B2246] leading-none">
              {level.barPct}%
            </p>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-[#EDE5DC] rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-[#8B2246] rounded-full transition-all"
              style={{ width: `${level.barPct}%` }}
            />
          </div>

          {/* Stage labels */}
          <div className="flex justify-between">
            {['Basic', 'Intermediate', 'Advanced'].map((stage) => (
              <p
                key={stage}
                className={`text-[9px] tracking-[0.12em] font-semibold ${
                  stage === level.label ? 'text-[#8B2246]' : 'text-[#C8BFB5]'
                }`}
              >
                {stage.toUpperCase()}
              </p>
            ))}
          </div>
        </div>

        {/* ── 3. Stats (4 items) ── */}
        <div className="py-2 border-b border-[#EDE5DC]">
          <StatRow
            label="Stories Completed"
            labelKo="완료한 스토리"
            value={String(stats.completedStories)}
            sub={`/ ${total} stories`}
            icon={BookOpen}
          />
          <StatRow
            label="Patterns Learned"
            labelKo="학습한 패턴"
            value={String(stats.totalPatternsSeen)}
            sub={`/ ${totalPatterns} patterns`}
            icon={BookOpen}
          />
          <StatRow
            label="Current Streak"
            labelKo="연속 학습일"
            value={String(streakDays)}
            sub="days"
            icon={Flame}
          />
          <StatRow
            label="Study Time"
            labelKo="총 학습 시간"
            value={studyHours}
            sub="hours"
            icon={Clock}
            last
          />
        </div>

        {/* ── 4. Pattern Library ── */}
        <div className="pt-8 pb-6 border-b border-[#EDE5DC]">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] tracking-[0.26em] text-[#8B2246] font-bold">
              PATTERN LIBRARY
            </p>
            <Link
              href="/records/patterns"
              className="flex items-center gap-1 text-[11px] text-[#8B2246] font-semibold hover:opacity-70 transition-opacity"
            >
              View All
              <ArrowRight className="w-3 h-3" strokeWidth={2} />
            </Link>
          </div>

          <p className="text-[0.75rem] text-[#9B9490] mb-3">저장한 패턴 미리보기</p>

          <div className="space-y-0">
            {SAVED_PATTERNS.map((p, i) => (
              <div key={p.id}>
                {i > 0 && <div className="h-px bg-[#EDE5DC]" />}
                <div className="flex items-center gap-4 py-4">
                  <span className="font-playfair text-[1.1rem] font-bold text-[#8B2246] w-6 shrink-0 leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-[#1A1A1A]">{p.pattern}</p>
                    <p className="text-[11px] text-[#9B9490] mt-0.5">{p.meaningKo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-[10px] tracking-[0.2em] text-[#D8D0C8] text-center pt-10">
          SPEAK NATURALLY. CONNECT DEEPLY.
        </p>
      </div>
    </div>
  )
}
