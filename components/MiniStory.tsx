'use client'

import { BookOpen, Minus, Plus, Volume2 } from 'lucide-react'
import { useState } from 'react'

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
  const [showTooltip, setShowTooltip] = useState(false)

  function handleSpeakAll(e: React.MouseEvent) {
    e.stopPropagation()
    if (isSpeaking) { stop(); return }
    speakAll(enSentences)
  }

  const isDone = readCount >= goal
  const isZero = readCount <= 0

  return (
    <div className="absolute inset-0 flex flex-col rounded-[28px] border border-[#E8F0FE] bg-white px-5 pb-5 pt-10 shadow-[0_8px_40px_rgba(79,140,255,0.10)]">

      {/* STORY 배지 — absolute top-3 left-3 */}
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

      {/* 구분선 */}
      <div className="my-3 h-px w-full bg-[#F0F5FF]" />

      {/* 낭독 미션 영역 */}
      <div className="relative flex items-center pb-1">

        {/* 📖 아이콘 — 클릭 시 툴팁 */}
        <div className="relative shrink-0">
          <button
            aria-label="낭독 미션 안내"
            className="rounded-full p-1 text-[#4F8CFF] transition-colors hover:bg-[#F0F7FF] active:scale-95"
            onClick={(e) => { e.stopPropagation(); setShowTooltip((v) => !v) }}
            type="button"
          >
            <BookOpen className="h-4 w-4" />
          </button>

          {showTooltip && (
            <div
              className="absolute bottom-full left-0 z-10 mb-2.5 w-52 rounded-2xl bg-[#1F2937] px-3.5 py-2.5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[11.5px] leading-relaxed text-white">
                10번 소리내어 읽으며 패턴을 내 것으로 만드세요.
              </p>
              {/* 말풍선 꼬리 */}
              <div className="absolute -bottom-1.5 left-4 h-3 w-3 rotate-45 rounded-sm bg-[#1F2937]" />
            </div>
          )}
        </div>

        {/* [-] 도트10개 + 카운트 [+] — 절대 가운데 정렬 */}
        <div className="absolute inset-x-0 flex items-center justify-center gap-5">
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
    </div>
  )
}
