'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { ProgressStats } from '@/queries/progress'

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

  const progressPct =
    totalStories > 0 ? Math.round((stats.completedStories / totalStories) * 100) : 0

  return (
    <div className="space-y-6">
      <header className="space-y-2 pt-1">
        <p className="text-sm font-semibold text-[#6f7895]">Patto</p>
        <h1 className="text-3xl font-bold tracking-normal">학습 기록</h1>
      </header>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold text-[#7a839f]">Story 완료</p>
            <p className="text-3xl font-bold text-[#26315e]">
              {stats.completedStories}
              <span className="text-lg font-normal text-[#9aa0bc]"> / {totalStories}</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold text-[#7a839f]">즐겨찾기</p>
            <p className="text-3xl font-bold text-[#26315e]">{stats.favoritesCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* 전체 진도율 */}
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#26315e]">전체 진도율</h2>
            <span className="text-xl font-bold text-[#5b6ee1]">{progressPct}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-[#e8ecf8]">
            <div
              className="h-full rounded-full bg-[#5b6ee1] transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#9aa0bc]">
            <span>패턴 학습 {stats.totalPatternsSeen}개</span>
            <span>총 복습 {stats.totalReviewCount}회</span>
          </div>
        </CardContent>
      </Card>

      {/* 이번 달 기록 */}
      <Card>
        <CardContent className="space-y-5 p-6">
          <h2 className="text-xl font-bold text-[#26315e]">이번 달 기록</h2>
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
                    aria-label={studied ? `${day}일 학습` : `${day}일`}
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
              아직 학습 기록이 없습니다. 패턴 카드를 열어보세요!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
