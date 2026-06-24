'use client'

import { CheckCircle2, Circle, PlayCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { useLearningProgress } from '@/hooks/useLearningProgress'
import { cn } from '@/lib/utils'
import type { StoryListItem } from '@/queries/stories'

type Props = {
  stories: StoryListItem[]
  currentOrderIndex: number
  isOpen: boolean
  onClose: () => void
}

export function StoryJumpSheet({ stories, currentOrderIndex, isOpen, onClose }: Props) {
  const router = useRouter()
  const { progress } = useLearningProgress()
  const listRef = useRef<HTMLDivElement>(null)
  const completedIds = new Set(progress.completedStoryIds)

  // 열릴 때 현재 스토리 위치로 스크롤
  useEffect(() => {
    if (!isOpen || !listRef.current) return
    const current = listRef.current.querySelector('[data-current="true"]')
    current?.scrollIntoView({ block: 'center', behavior: 'instant' })
  }, [isOpen])

  // 뒤로가기 제스처 / Escape 키 닫기
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  function handleSelect(orderIndex: number) {
    onClose()
    if (orderIndex !== currentOrderIndex) {
      router.push(`/learn/${orderIndex}`)
    }
  }

  function getStatus(story: StoryListItem): 'done' | 'active' | 'idle' {
    if (story.order_index === currentOrderIndex) return 'active'
    if (completedIds.has(story.id)) return 'done'
    return 'idle'
  }

  return (
    <>
      {/* 백드롭 */}
      <div
        aria-hidden
        className={cn(
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />

      {/* 시트 */}
      <div
        aria-label="스토리 목록"
        aria-modal="true"
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex max-h-[75dvh] flex-col rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          isOpen ? 'translate-y-0' : 'translate-y-full',
        )}
        role="dialog"
      >
        {/* 핸들 + 헤더 */}
        <div className="flex shrink-0 flex-col items-center px-5 pb-3 pt-3">
          <div className="h-1 w-10 rounded-full bg-[#E8F0FE]" />
          <div className="mt-4 flex w-full items-center justify-between">
            <h2 className="text-base font-bold text-[#1F2937]">학습 목록</h2>
            <button
              aria-label="닫기"
              className="rounded-full p-1.5 text-[#9EAEC8] hover:bg-[#F5F8FF]"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 범례 */}
        <div className="flex shrink-0 items-center gap-4 border-b border-[#F0F5FF] px-5 pb-3">
          <LegendItem color="text-[#22C55E]" label="완료" Icon={CheckCircle2} />
          <LegendItem color="text-[#4F8CFF]" label="진행 중" Icon={PlayCircle} />
          <LegendItem color="text-[#D1D9E6]" label="미학습" Icon={Circle} />
        </div>

        {/* 스토리 목록 */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          ref={listRef}
        >
          {stories.map((story) => {
            const status = getStatus(story)
            return (
              <button
                className={cn(
                  'flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors',
                  status === 'active'
                    ? 'bg-[#F0F7FF]'
                    : 'hover:bg-[#F8FAFF]',
                )}
                data-current={status === 'active'}
                key={story.id}
                onClick={() => handleSelect(story.order_index)}
                type="button"
              >
                {/* 번호 */}
                <span className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                  status === 'active' && 'bg-[#4F8CFF] text-white',
                  status === 'done'   && 'bg-[#DCFCE7] text-[#22C55E]',
                  status === 'idle'   && 'bg-[#F5F8FF] text-[#B0BCCE]',
                )}>
                  {story.order_index}
                </span>

                {/* 제목 */}
                <span className={cn(
                  'flex-1 text-sm font-semibold',
                  status === 'active' && 'text-[#4F8CFF]',
                  status === 'done'   && 'text-[#374151]',
                  status === 'idle'   && 'text-[#9EAEC8]',
                )}>
                  {story.title}
                </span>

                {/* 상태 아이콘 */}
                {status === 'done'   && <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />}
                {status === 'active' && <PlayCircle   className="h-4 w-4 shrink-0 text-[#4F8CFF]" />}
              </button>
            )
          })}
        </div>

        {/* 하단 safe area 여백 */}
        <div className="h-[max(env(safe-area-inset-bottom),16px)] shrink-0" />
      </div>
    </>
  )
}

function LegendItem({
  Icon, color, label,
}: { Icon: React.ElementType; color: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[11px] text-[#9EAEC8]">
      <Icon className={cn('h-3.5 w-3.5', color)} />
      {label}
    </span>
  )
}
