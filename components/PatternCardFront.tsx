'use client'

import { Heart, ImageIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Pattern } from '@/types/pattern'

type PatternCardFrontProps = {
  pattern: Pattern
  cardLabel?: string
  isFavorited?: boolean
  onToggleFavorite?: () => void
}

export function PatternCardFront({
  pattern,
  cardLabel,
  isFavorited = false,
  onToggleFavorite,
}: PatternCardFrontProps) {
  return (
    <div className="absolute inset-0 flex flex-col rounded-[28px] border border-[#E8F0FE] bg-white p-6 shadow-[0_8px_40px_rgba(79,140,255,0.10)] [backface-visibility:hidden]">

      {/* 상단: Card X/Y 배지 + Heart */}
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-[#DCEBFF] px-3 py-1 text-[11px] font-bold tracking-wide text-[#4F8CFF]">
          {cardLabel ?? `Level ${pattern.level}`}
        </span>
        {onToggleFavorite && (
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
        )}
      </div>

      {/* 이미지 영역 */}
      <div className="mt-4 flex h-40 w-full items-center justify-center overflow-hidden rounded-[20px] bg-[#DCEBFF]">
        {pattern.image_url ? (
          <img
            alt={pattern.pattern_text}
            className="h-full w-full object-cover"
            src={pattern.image_url}
          />
        ) : (
          <div className="flex flex-col items-center text-[#4F8CFF]/50">
            <ImageIcon className="h-10 w-10" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* 패턴 텍스트 (최대 강조) */}
      <div className="mt-5 flex-1 text-center">
        <p className="text-[2.1rem] font-extrabold leading-tight tracking-tight text-[#1F2937]">
          {pattern.pattern_text}
        </p>
        <p className="mt-2 text-[0.95rem] font-semibold text-[#6B7280]">
          {pattern.meaning}
        </p>
      </div>

    </div>
  )
}
