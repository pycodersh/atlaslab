'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock, AlarmClock, Repeat, ArrowRight } from 'lucide-react'

import { magazineStories } from '@/data/magazine-stories'
import {
  getTodayDueCount,
  getOverdueCount,
  getDueCount,
  getLearnedStoryCount,
  getLearnedPatternCount,
  getTotalRepeatCount,
  getLast7Days,
} from '@/lib/srs/storage'

const TOTAL_STORIES = magazineStories.length
const TOTAL_PATTERNS = magazineStories.reduce((s, st) => s + st.patterns.length, 0)

type Stats = {
  todayDue: number
  overdue: number
  dueTotal: number
  learnedStories: number
  learnedPatterns: number
  totalRepeats: number
  last7: { date: string; label: string; count: number }[]
}

export function ReviewOverview() {
  const router = useRouter()
  const [s, setS] = useState<Stats | null>(null)

  useEffect(() => {
    setS({
      todayDue: getTodayDueCount(),
      overdue: getOverdueCount(),
      dueTotal: getDueCount(),
      learnedStories: getLearnedStoryCount(),
      learnedPatterns: getLearnedPatternCount(),
      totalRepeats: getTotalRepeatCount(),
      last7: getLast7Days(),
    })
  }, [])

  const storyPct = s ? Math.round((s.learnedStories / TOTAL_STORIES) * 100) : 0
  const patternPct = s ? Math.round((s.learnedPatterns / TOTAL_PATTERNS) * 100) : 0
  const maxDay = s ? Math.max(1, ...s.last7.map((d) => d.count)) : 1

  return (
    <div className="pb-8 border-b border-[var(--pd)]">
      <p className="text-[10px] tracking-[0.26em] text-[var(--pa)] font-bold mb-1">REVIEW</p>
      <p className="text-[0.78rem] text-[var(--pm)] mb-5">오늘의 복습 현황을 확인하고 바로 시작하세요.</p>

      {/* 복습 대기 */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 rounded-xl bg-[var(--pc)] px-4 py-4 text-center">
          <CalendarClock className="w-4 h-4 text-[var(--pa)] mx-auto mb-2" strokeWidth={1.8} />
          <p className="font-playfair text-[1.6rem] font-bold text-[var(--pt)] leading-none">{s?.todayDue ?? 0}</p>
          <p className="text-[10px] text-[var(--pm)] mt-1.5">오늘 복습할 항목</p>
        </div>
        <div className="flex-1 rounded-xl bg-[var(--pc)] px-4 py-4 text-center">
          <AlarmClock className="w-4 h-4 text-[var(--pa)] mx-auto mb-2" strokeWidth={1.8} />
          <p className="font-playfair text-[1.6rem] font-bold text-[var(--pt)] leading-none">{s?.overdue ?? 0}</p>
          <p className="text-[10px] text-[var(--pm)] mt-1.5">밀린 복습 항목</p>
        </div>
      </div>

      {/* 복습하기 버튼 */}
      <button
        type="button"
        onClick={() => router.push('/review')}
        className="w-full rounded-2xl py-3.5 mb-6 bg-[var(--pa)] text-white text-[13px] font-bold tracking-[0.04em] hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
      >
        복습하기{(s?.dueTotal ?? 0) > 0 ? ` (${s?.dueTotal})` : ''}
        <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
      </button>

      {/* 진행률 */}
      <div className="space-y-4 mb-6">
        <ProgressBar label="전체 Story 진행률" value={s?.learnedStories ?? 0} total={TOTAL_STORIES} pct={storyPct} />
        <ProgressBar label="전체 Pattern 반복률" value={s?.learnedPatterns ?? 0} total={TOTAL_PATTERNS} pct={patternPct} />
      </div>

      {/* 누적 반복 횟수 */}
      <div className="flex items-center justify-between rounded-xl bg-[var(--pc)] px-4 py-3.5 mb-6">
        <div className="flex items-center gap-2.5">
          <Repeat className="w-4 h-4 text-[var(--pa)]" strokeWidth={1.8} />
          <p className="text-[12px] font-semibold text-[var(--pt2)]">누적 반복 횟수</p>
        </div>
        <p className="font-playfair text-[1.3rem] font-bold text-[var(--pt)] leading-none">{s?.totalRepeats ?? 0}</p>
      </div>

      {/* 최근 7일 학습 기록 */}
      <div>
        <p className="text-[11px] font-semibold text-[var(--pm)] mb-3">최근 7일 학습 기록</p>
        <div className="flex items-end justify-between gap-2 h-20">
          {(s?.last7 ?? []).map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-md transition-all ${d.count > 0 ? 'bg-[var(--pa)]' : 'bg-[var(--pd)]'}`}
                  style={{ height: `${d.count > 0 ? Math.max(12, (d.count / maxDay) * 100) : 6}%` }}
                  title={`${d.date}: ${d.count}`}
                />
              </div>
              <span className="text-[9px] text-[var(--pm2)]">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProgressBar({ label, value, total, pct }: { label: string; value: number; total: number; pct: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[12px] font-semibold text-[var(--pt2)]">{label}</p>
        <p className="text-[11px] text-[var(--pm)]"><span className="font-bold text-[var(--pa)]">{value}</span> / {total} · {pct}%</p>
      </div>
      <div className="h-1.5 bg-[var(--pd)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--pa)] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
