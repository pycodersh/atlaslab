import { BookOpen, Bookmark, Flame, Clock, TrendingUp, Star } from 'lucide-react'

import { BookmarkNav } from '@/components/BookmarkNav'
import { createClient } from '@/lib/supabase/server'
import { getProgressStats } from '@/queries/progress'

export const dynamic = 'force-dynamic'

export default async function RecordsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const stats = user
    ? await getProgressStats(user.id)
    : { completedStories: 0, totalPatternsSeen: 0, totalReviewCount: 0, favoritesCount: 0, studiedDates: [] }

  const { count: totalStories } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const total = totalStories ?? 100
  const completedPct = Math.round((stats.completedStories / total) * 100)
  const totalPatterns = total * 5
  const patternPct = Math.round((stats.totalPatternsSeen / totalPatterns) * 100)

  // Streak: count consecutive recent studiedDates
  const streakDays = (() => {
    const dates = [...(stats.studiedDates ?? [])].sort().reverse()
    if (dates.length === 0) return 0
    let streak = 0
    const today = new Date()
    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i])
      const diff = Math.round((today.getTime() - d.getTime()) / 86400000)
      if (diff === i || diff === i + 1) streak++
      else break
    }
    return streak
  })()

  const studyHours = Math.round((stats.totalReviewCount * 3) / 60)

  return (
    <div className="relative min-h-dvh bg-[#FAF8F4]">
      <BookmarkNav />

      <div className="pl-10 pr-6 pt-10 pb-16 max-w-sm mx-auto">
        {/* Header */}
        <p className="text-[11px] font-bold tracking-[0.3em] text-[#1A1A1A] mb-6">PATTO</p>

        <h1 className="font-playfair text-[3rem] font-black leading-none text-[#1A1A1A] tracking-tight">
          PROGRESS
        </h1>
        <div className="h-px bg-[#8B2246] w-12 mt-4 mb-8" />

        {/* ── Big stat cards ── */}
        <div className="space-y-4 mb-10">
          {/* Stories Completed */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[9px] tracking-[0.3em] text-[#8B2246] font-semibold mb-1">STORIES COMPLETED</p>
                <p className="font-playfair text-[2.2rem] font-bold text-[#1A1A1A] leading-none">
                  {stats.completedStories}
                  <span className="text-[1rem] text-[#C8BFB5] font-normal ml-1">/ {total}</span>
                </p>
              </div>
              <div className="w-10 h-10 bg-[#FDF0F4] rounded-full flex items-center justify-center shrink-0">
                <BookOpen className="w-4.5 h-4.5 text-[#8B2246]" strokeWidth={1.8} />
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-[#F0E8E0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8B2246] rounded-full transition-all"
                style={{ width: `${completedPct}%` }}
              />
            </div>
            <p className="text-[10px] text-[#C8BFB5] mt-1.5">{completedPct}% complete</p>
          </div>

          {/* Patterns Learned */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[9px] tracking-[0.3em] text-[#8B2246] font-semibold mb-1">PATTERNS LEARNED</p>
                <p className="font-playfair text-[2.2rem] font-bold text-[#1A1A1A] leading-none">
                  {stats.totalPatternsSeen}
                  <span className="text-[1rem] text-[#C8BFB5] font-normal ml-1">/ {totalPatterns}</span>
                </p>
              </div>
              <div className="w-10 h-10 bg-[#FDF0F4] rounded-full flex items-center justify-center shrink-0">
                <TrendingUp className="w-4.5 h-4.5 text-[#8B2246]" strokeWidth={1.8} />
              </div>
            </div>
            <div className="h-1 bg-[#F0E8E0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8B2246] rounded-full transition-all"
                style={{ width: `${patternPct}%` }}
              />
            </div>
            <p className="text-[10px] text-[#C8BFB5] mt-1.5">{patternPct}% complete</p>
          </div>
        </div>

        {/* ── Small stat row ── */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <div className="bg-white rounded-xl p-4 shadow-[0_1px_6px_rgba(0,0,0,0.05)] text-center">
            <Flame className="w-4 h-4 text-[#8B2246] mx-auto mb-2" strokeWidth={1.8} />
            <p className="font-playfair text-[1.5rem] font-bold text-[#1A1A1A] leading-none">{streakDays}</p>
            <p className="text-[8px] tracking-[0.15em] text-[#C8BFB5] mt-1 font-semibold">DAYS</p>
            <p className="text-[8px] text-[#9B9490] mt-0.5">streak</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-[0_1px_6px_rgba(0,0,0,0.05)] text-center">
            <Clock className="w-4 h-4 text-[#8B2246] mx-auto mb-2" strokeWidth={1.8} />
            <p className="font-playfair text-[1.5rem] font-bold text-[#1A1A1A] leading-none">{studyHours}</p>
            <p className="text-[8px] tracking-[0.15em] text-[#C8BFB5] mt-1 font-semibold">HRS</p>
            <p className="text-[8px] text-[#9B9490] mt-0.5">studied</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-[0_1px_6px_rgba(0,0,0,0.05)] text-center">
            <Bookmark className="w-4 h-4 text-[#8B2246] mx-auto mb-2" strokeWidth={1.8} />
            <p className="font-playfair text-[1.5rem] font-bold text-[#1A1A1A] leading-none">{stats.favoritesCount}</p>
            <p className="text-[8px] tracking-[0.15em] text-[#C8BFB5] mt-1 font-semibold">SAVED</p>
            <p className="text-[8px] text-[#9B9490] mt-0.5">patterns</p>
          </div>
        </div>

        {/* ── Pattern Library section ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-[#E8E0D8]" />
            <p className="text-[9px] tracking-[0.3em] text-[#C8BFB5] font-semibold">PATTERN LIBRARY</p>
            <div className="h-px flex-1 bg-[#E8E0D8]" />
          </div>
          <div className="bg-white rounded-2xl overflow-hidden shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
            {[
              { label: 'Reviewed', value: stats.totalReviewCount, icon: Star },
              { label: 'Favorites', value: stats.favoritesCount, icon: Bookmark },
            ].map(({ label, value, icon: Icon }, i) => (
              <div key={label} className={`flex items-center justify-between px-5 py-4 ${i > 0 ? 'border-t border-[#F0E8E0]' : ''}`}>
                <div className="flex items-center gap-3">
                  <Icon className="w-3.5 h-3.5 text-[#C8BFB5]" strokeWidth={1.8} />
                  <span className="text-[0.82rem] text-[#1A1A1A]">{label}</span>
                </div>
                <span className="font-playfair text-[1rem] font-bold text-[#8B2246]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-[8px] tracking-[0.2em] text-[#D8D0C8] text-center">
          SPEAK NATURALLY. CONNECT DEEPLY.
        </p>
      </div>
    </div>
  )
}
