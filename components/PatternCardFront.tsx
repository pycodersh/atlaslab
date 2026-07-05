'use client'

import { Heart, ImageIcon } from 'lucide-react'

import { StoryLabel } from '@/components/StoryLabel'
import { cn } from '@/lib/utils'
import type { Pattern } from '@/types/pattern'

type PatternCardFrontProps = {
  pattern: Pattern
  cardIndex: number
  totalCards: number
  storyNumber: number
  storyTitle?: string
  isFavorited?: boolean
  onJump?: () => void
  onToggleFavorite?: () => void
}

export function PatternCardFront({
  pattern,
  cardIndex,
  totalCards,
  storyNumber,
  storyTitle,
  isFavorited = false,
  onJump,
  onToggleFavorite,
}: PatternCardFrontProps) {
  return (
    <div className="absolute inset-0 flex flex-col rounded-[28px] border border-[#E8F0FE] bg-white px-5 pb-4 pt-14 shadow-[0_8px_40px_rgba(79,140,255,0.10)] [backface-visibility:hidden]">

      <StoryLabel storyNumber={storyNumber} subtitle={storyTitle} onJump={onJump} />

      {/* 도트 인디케이터 */}
      <div className="mb-3 flex items-center justify-center gap-1.5">
        {Array.from({ length: totalCards }, (_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-full transition-all duration-300',
              i === cardIndex ? 'h-2 w-2 bg-[#4F8CFF]' : 'h-1.5 w-1.5 bg-[#D1D9E6]',
            )}
          />
        ))}
      </div>

      {/* 이미지 */}
      <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-[18px] bg-[#DCEBFF]">
        {pattern.image_url ? (
          <img alt={pattern.pattern_text} className="h-full w-full object-cover" src={pattern.image_url} />
        ) : (
          <div className="flex flex-col items-center text-[#4F8CFF]/50">
            <ImageIcon className="h-9 w-9" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* 패턴 텍스트 — 이미지 바로 아래 */}
      <div className="mt-3 flex-1 text-center">
        <p className="text-[2rem] font-extrabold leading-tight tracking-tight text-[#1C1C1E]">
          {pattern.pattern_text}
        </p>
        <p className="mt-1 text-[0.9rem] font-semibold text-[#8D234C]">
          {pattern.meaning}
        </p>
      </div>

      {/* 하트 — 우측 하단 */}
      {onToggleFavorite && (
        <div className="flex justify-end">
          <button
            aria-label={isFavorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            className="rounded-full p-1.5 transition-colors hover:bg-[#F0F7FF]"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
            type="button"
          >
            <Heart
              className={cn(
                'h-5 w-5 transition-colors',
                isFavorited ? 'fill-[#FF6B6B] text-[#FF6B6B]' : 'text-[#D1D9E6]',
              )}
            />
          </button>
        </div>
      )}
    </div>
  )
}
