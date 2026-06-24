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
  storyTitle?: string
  readCount: number
  goal: number
  onJump?: () => void
  onIncrement: () => void
  onDecrement: () => void
}

export function MiniStory({
  content,
  storyNumber,
  storyTitle,
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
    <div className="absolute inset-0 flex flex-col rounded-[28px] border border-[#E8F0FE] bg-white px-5 pb-4 pt-14 shadow-[0_8px_40px_rgba(79,140,255,0.10)]">

      {/* STORY 헤더 + 전체 듣기 */}
      <StoryLabel storyNumber={storyNumber} subtitle={storyTitle} onJump={onJump} />
      <button
        aria-label={isSpeaking ? '정지' : '전체 듣기'}
        className={cn(
          'absolute right-4 top-3.5 z-10 rounded-full p-1.5 transition-colors',
          isSpeaking
            ? 'bg-[#FFE8E8] text-[#FF6B6B]'
            : 'text-[#C8D8F0] hover:bg-[#F0F7FF] hover:text-[#4F8CFF]',
        )}
        onClick={handleSpeakAll}
        type="button"
      >
        <Volume2 className="h-4 w-4" />
      </button>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto">
        {/* 영어 단락 — 메인 */}
        <div className="space-y-3">
          {enParagraphs.map((p, i) => (
            <p key={i} className="text-[0.9rem] font-semibold leading-relaxed text-[#1A2744]">
              {p}
            </p>
          ))}
        </div>

        {/* 구분선 */}
        {koParagraphs.length > 0 && (
          <div className="my-7 h-px w-full bg-[#EEF4FF]" />
        )}

        {/* 한국어 단락 — 보조 */}
        {koParagraphs.length > 0 && (
          <div className="space-y-2.5">
            {koParagraphs.map((p, i) => (
              <p key={i} className="text-[0.78rem] font-normal leading-relaxed text-[#B0BCCE]">
                {p}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* 낭독 미션 */}
      <div className="mt-3 border-t border-[#EEF4FF] pt-3">
        <div className="relative flex items-center">

          {/* 📖 아이콘 */}
          <div className="relative shrink-0">
            <button
              aria-label="낭독 미션 안내"
              className="rounded-full p-1 text-[#4F8CFF] transition-colors hover:bg-[#F0F7FF]"
              onClick={(e) => { e.stopPropagation(); setShowTooltip((v) => !v) }}
              type="button"
            >
              <BookOpen className="h-3.5 w-3.5" />
            </button>
            {showTooltip && (
              <div
                className="absolute bottom-full left-0 z-10 mb-2.5 w-52 rounded-2xl bg-[#1F2937] px-3.5 py-2.5 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-[11.5px] leading-relaxed text-white">
                  10번 소리내어 읽으며 패턴을 내 것으로 만드세요.
                </p>
                <div className="absolute -bottom-1.5 left-4 h-3 w-3 rotate-45 rounded-sm bg-[#1F2937]" />
              </div>
            )}
          </div>

          {/* [-] 도트10개 [+] — 절대 가운데 */}
          <div className="absolute inset-x-0 flex items-center justify-center gap-5">
            <button
              aria-label="낭독 횟수 -1"
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all active:scale-90',
                isZero
                  ? 'cursor-not-allowed bg-transparent text-[#DDE5F0] opacity-40'
                  : 'bg-[#F0F7FF] text-[#4F8CFF] hover:bg-[#DCEBFF]',
              )}
              disabled={isZero}
              onClick={(e) => { e.stopPropagation(); if (!isZero) onDecrement() }}
              type="button"
            >
              <Minus className="h-3 w-3" />
            </button>

            {/* 도트만 — 숫자 제거 */}
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
    </div>
  )
}
