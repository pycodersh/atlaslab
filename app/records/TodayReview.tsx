'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, BookOpen, Layers } from 'lucide-react'
import type { ReviewSchedule } from '@/lib/review/types'
import { getTodayReviewItems, markReviewCompleted } from '@/lib/review/storage'

function reviewLabel(n: number) {
  return n === 0 ? 'New' : `Review #${n}`
}

function contentHref(item: ReviewSchedule): string {
  if (item.contentType === 'pattern_set') return `/stories/${item.contentId}?v=p`
  return `/stories/${item.contentId}`
}

function ContentIcon({ type }: { type: ReviewSchedule['contentType'] }) {
  return type === 'pattern_set'
    ? <Layers className="w-3.5 h-3.5" />
    : <BookOpen className="w-3.5 h-3.5" />
}

export function TodayReview() {
  const router = useRouter()
  const [items, setItems] = useState<ReviewSchedule[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const load = useCallback(() => {
    setItems(getTodayReviewItems())
  }, [])

  useEffect(() => { load() }, [load])

  function handleComplete(item: ReviewSchedule) {
    markReviewCompleted(item.id)
    setCompletedIds(prev => new Set([...prev, item.id]))
  }

  function handleGo(item: ReviewSchedule) {
    handleComplete(item)
    router.push(contentHref(item))
  }

  const allDone = items.length > 0 && items.every(i => completedIds.has(i.id))

  return (
    <div className="pb-8 border-b border-[var(--pd)]">
      <p className="text-[10px] tracking-[0.26em] text-[var(--pa)] font-bold mb-1">TODAY'S REVIEW</p>
      <p className="text-[0.78rem] text-[var(--pm)] mb-6">
        오늘 복습할 콘텐츠를 확인하고 장기 기억으로 정착시켜보세요.
      </p>

      {items.length === 0 ? (
        /* 복습 항목 없음 */
        <div className="rounded-2xl bg-[var(--pc)] px-5 py-6 text-center">
          <p className="text-[13px] font-semibold text-[var(--pt)] mb-1">오늘 예정된 복습이 없어요.</p>
          <p className="text-[11.5px] text-[var(--pm)] leading-relaxed">
            새로운 Story를 학습하거나<br />저장한 패턴을 복습해보세요.
          </p>
        </div>
      ) : allDone ? (
        /* 전부 완료 */
        <div className="rounded-2xl bg-[var(--pc)] px-5 py-6 text-center">
          <CheckCircle2 className="w-7 h-7 text-[var(--pa)] mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-[13px] font-semibold text-[var(--pt)] mb-1">오늘의 복습 완료!</p>
          <p className="text-[11.5px] text-[var(--pm)]">모든 복습을 마쳤어요. 잘 하셨어요.</p>
        </div>
      ) : (
        <>
          <p className="text-[11px] text-[var(--pm)] mb-4">
            <span className="font-bold text-[var(--pa)]">{items.filter(i => !completedIds.has(i.id)).length}개</span> 복습 예정
          </p>
          <div className="space-y-0">
            {items.map((item, idx) => {
              const done = completedIds.has(item.id)
              return (
                <div key={item.id}>
                  {idx > 0 && <div className="h-px bg-[var(--pd)]" />}
                  <div className={`py-4 flex items-start gap-3 transition-opacity ${done ? 'opacity-40' : ''}`}>
                    {/* Icon */}
                    <div className="w-7 h-7 rounded-full bg-[var(--pa)]/10 flex items-center justify-center shrink-0 mt-0.5 text-[var(--pa)]">
                      <ContentIcon type={item.contentType} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] tracking-[0.12em] font-bold text-[var(--pm)] mb-0.5">
                        {item.contentType === 'story' ? 'Story' : 'Pattern Set'} {String(item.contentId).padStart(2, '0')} · {reviewLabel(item.reviewNumber)}
                      </p>
                      <p className="text-[13px] font-semibold text-[var(--pt)] leading-snug">{item.title}</p>
                    </div>

                    {/* Action */}
                    {done ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-[var(--pa)] shrink-0 mt-0.5" strokeWidth={1.8} style={{ width: 18, height: 18 }} />
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleGo(item)}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-[var(--pa)] text-white text-[11px] font-bold tracking-[0.05em] hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        복습하기
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
