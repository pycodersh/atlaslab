'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { ProgressStats } from '@/queries/progress'
import { useT } from '@/hooks/useT'

type Props = {
  stats: ProgressStats
  totalStories: number
}

function getThisMonthDates(): string[] {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1)
    return d.toISOString().slice(0, 10)
  })
}

export function RecordsDashboard({ stats, totalStories }: Props) {
  const monthDates = getThisMonthDates()
  const studiedSet = new Set(stats.studiedDates)
  const t = useT()

  const progressPct =
    totalStories > 0 ? Math.round((stats.completedStories / totalStories) * 100) : 0

  return (
    <div className="space-y-6">
      <header className="space-y-2 pt-1">
        <p className="text-sm font-semibold text-[#6f7895]">Patto</p>
        <h1 className="text-3xl font-bold tracking-normal">{t('records_title')}</h1>
      </header>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold text-[#7a839f]">{t('stat_story_done')}</p>
            <p className="text-3xl font-bold text-[#26315e]">
              {stats.completedStories}
              <span className="text-lg font-normal text-[#9aa0bc]"> / {totalStories}</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold text-[#7a839f]">{t('stat_favorites')}</p>
            <p className="text-3xl font-bold text-[#26315e]">{stats.favoritesCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* 전체 진도율 */}
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#26315e]">{t('stat_total_progress')}</h2>
            <span className="text-xl font-bold text-[#5b6ee1]">{progressPct}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-[#e8ecf8]">
            <div
              className="h-full rounded-full bg-[#5b6ee1] transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#9aa0bc]">
            <span>{t('stat_patterns_count', { n: stats.totalPatternsSeen })}</span>
            <span>{t('stat_reviews_total', { n: stats.totalReviewCount })}</span>
          </div>
        </CardContent>
      </Card>

      {/* 이번 달 기록 */}
      <Card>
        <CardContent className="space-y-5 p-6">
          <h2 className="text-xl font-bold text-[#26315e]">{t('stat_this_month')}</h2>
          <div
            className="grid gap-3 rounded-3xl bg-[#f7f9ff] p-5"
            style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}
          >
            {monthDates.map((date) => {
              const studied = studiedSet.has(date)
              const day = new Date(date).getDate()
              return (
                <div className="flex flex-col items-center gap-1" key={date}>
                  <div
                    aria-label={studied ? t('stat_streak_days', { n: day }) : `${day}`}
                    className={[
                      'h-5 w-5 rounded-full',
                      studied ? 'bg-[#5b6ee1]' : 'bg-[#d8dfef]',
                    ].join(' ')}
                  />
                  <span className="text-[9px] text-[#bcc3d8]">{day}</span>
                </div>
              )
            })}
          </div>
          {stats.studiedDates.length === 0 && (
            <p className="text-center text-sm text-[#aab0c8]">
              {t('no_reviews_desc')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
