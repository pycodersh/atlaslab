'use client'

import { CheckCircle2, Circle, PlayCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { useLearningProgress } from '@/hooks/useLearningProgress'
import { cn } from '@/lib/utils'
import type { StoryListItem } from '@/queries/stories'
import { useT } from '@/hooks/useT'

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
  const t = useT()

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
          <div className="h-1 w-10 rounded-full bg-black/[0.08]" />
          <div className="mt-4 flex w-full items-center justify-between">
            <h2 className="text-base font-bold text-[var(--pt)]">{t('story_list_title')}</h2>
            <button
              aria-label="닫기"
              className="rounded-full p-1.5 text-[var(--pm2)] hover:bg-[var(--pal)]"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 범례 — 아이콘 색으로만 상태 구분 */}
        <div className="flex shrink-0 items-center gap-4 border-b border-[var(--pd)] px-5 pb-3">
          <LegendItem iconClass="text-[#22C55E]" label={t('status_done')}   Icon={CheckCircle2} />
          <LegendItem iconClass="text-[var(--pa)]" label={t('status_active')} Icon={PlayCircle} />
          <LegendItem iconClass="text-[var(--pm2)]" label={t('status_idle')} Icon={Circle} />
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
                    ? 'bg-[var(--pal)]'
                    : 'hover:bg-[var(--pal)]/50',
                )}
                data-current={status === 'active'}
                key={story.id}
                onClick={() => handleSelect(story.order_index)}
                type="button"
              >
                {/* 번호 — active만 accent, 나머지 동일 중립 */}
                <span className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                  status === 'active'
                    ? 'bg-[var(--pal)] text-[var(--pa)] ring-1 ring-[var(--pacb)]'
                    : 'bg-black/[0.05] text-[var(--pm)]',
                )}>
                  {story.order_index}
                </span>

                {/* 제목 — done/active 동일, idle만 살짝 muted */}
                <span className={cn(
                  'flex-1 text-sm',
                  status === 'idle'
                    ? 'font-medium text-[var(--pm)]'
                    : 'font-semibold text-[var(--pt)]',
                )}>
                  {story.title}
                </span>

                {/* 상태 아이콘 — 색으로만 구분 */}
                {status === 'done'   && <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />}
                {status === 'active' && <PlayCircle   className="h-4 w-4 shrink-0 text-[var(--pa)]" />}
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
  Icon, iconClass, label,
}: { Icon: React.ElementType; iconClass: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[11px] text-[var(--pm2)]">
      <Icon className={cn('h-3.5 w-3.5', iconClass)} />
      {label}
    </span>
  )
}
