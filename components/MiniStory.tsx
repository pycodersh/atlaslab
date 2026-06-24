'use client'

import { BookOpen, Minus, Plus, Volume2 } from 'lucide-react'

import { StoryLabel } from '@/components/StoryLabel'
import { useSpeech } from '@/hooks/useSpeech'
import { cn } from '@/lib/utils'
import type { MiniStoryContent } from '@/types/story'

type MiniStoryProps = {
  content: MiniStoryContent
  totalCards: number
  storyNumber: number
  readCount: number
  goal: number
  onJump?: () => void
  onIncrement: () => void
  onDecrement: () => void
}

export function MiniStory({
  content,
  storyNumber,
  readCount,
  goal,
  onJump,
  onIncrement,
  onDecrement,
}: MiniStoryProps) {
  const enParagraphs = content.en.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
  const koParagraphs = content.ko.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
  const enSentences = enParagraphs.flatMap(
    (p) => p.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [p],
  )
  const { speakAll, isSpeaking, stop } = useSpeech()

  function handleSpeakAll(e: React.MouseEvent) {
    e.stopPropagation()
    if (isSpeaking) { stop(); return }
    speakAll(enSentences)
  }

  const isDone = readCount >= goal
  const isZero = readCount <= 0

  return (
    <div className="absolute inset-0 flex flex-col rounded-[28px] border border-[#E8F0FE] bg-white p-5 shadow-[0_8px_40px_rgba(79,140,255,0.10)]">

      <StoryLabel storyNumber={storyNumber} onJump={onJump} />

      {/* 단락형 스토리 텍스트 */}
      <div className="flex-1 space-y-4 overflow-y-auto">
        {enParagraphs.map((enPara, i) => (
          <div key={i} className="space-y-0.5">
            <p className="text-[0.92rem] font-semibold leading-relaxed text-[#1F2937]">
              {enPara}
            </p>
            {koParagraphs[i] && (
              <p className="text-[0.76rem] font-normal leading-relaxed text-[#9EAEC8]">
                {koParagraphs[i]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* 전체 듣기 — 아이콘만, 텍스트 바로 아래 우측 */}
      <div className="flex justify-end pt-2">
        <button
          aria-label={isSpeaking ? '정지' : '전체 듣기'}
          className={cn(
            'rounded-full p-2 transition-colors',
            isSpeaking
              ? 'bg-[#FFE8E8] text-[#FF6B6B]'
              : 'bg-[#DCEBFF] text-[#4F8CFF] hover:bg-[#C8DCFF]',
          )}
          onClick={handleSpeakAll}
          type="button"
        >
          <Volume2 className="h-4 w-4" />
        </button>
      </div>

      {/* 낭독 미션 레이블 — 선 위 */}
      <div className="mt-3 flex items-center gap-1.5">
        <BookOpen className="h-3.5 w-3.5 text-[#4F8CFF]" />
        <span className="text-[10px] font-bold tracking-wide text-[#4F8CFF]">낭독 미션</span>
      </div>

      {/* 구분선 */}
      <div className="my-2 h-px w-full bg-[#F0F5FF]" />

      {/* [-] 도트 [+] — 가운데 정렬 */}
      <div className="flex items-center justify-center gap-3 pb-1">
        <button
          aria-label="낭독 횟수 -1"
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all active:scale-90',
            isZero
              ? 'cursor-not-allowed bg-[#F5F8FF] text-[#D1D9E6]'
              : 'bg-[#F0F7FF] text-[#4F8CFF] hover:bg-[#DCEBFF]',
          )}
          disabled={isZero}
          onClick={(e) => { e.stopPropagation(); if (!isZero) onDecrement() }}
          type="button"
        >
          <Minus className="h-3 w-3" />
        </button>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-[3px]">
            {Array.from({ length: goal }, (_, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full transition-all duration-300',
                  i < readCount ? 'h-1.5 w-1.5 bg-[#4F8CFF]' : 'h-1 w-1 bg-[#D1D9E6]',
                )}
              />
            ))}
          </div>
          <span className="text-[9px] font-semibold tabular-nums text-[#B0BCCE]">
            {readCount} / {goal}
          </span>
        </div>

        <button
          aria-label="낭독 횟수 +1"
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all active:scale-90',
            isDone
              ? 'cursor-not-allowed bg-[#DCFCE7] text-[#22C55E]'
              : 'bg-[#4F8CFF] text-white hover:bg-[#3B7DE8]',
          )}
          disabled={isDone}
          onClick={(e) => { e.stopPropagation(); if (!isDone) onIncrement() }}
          type="button"
        >
          {isDone
            ? <span className="text-[10px] font-bold">✓</span>
            : <Plus className="h-3 w-3" />}
        </button>
      </div>
    </div>
  )
}
