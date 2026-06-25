'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { MagazinePattern, MagazineStory } from '@/types/magazine'

type PatternsPageProps = {
  story: MagazineStory
  totalStories: number
  onPrev: () => void
  onNext: () => void
  hasNext: boolean
  onOpenPicker: () => void
  onOpenPattern: (pattern: MagazinePattern) => void
}

export function PatternsPage({ story, onPrev, onNext, hasNext, onOpenPicker, onOpenPattern }: PatternsPageProps) {
  return (
    <div className="h-full flex flex-col bg-[#FAF8F4]">
      <div className="flex-1 overflow-y-auto">
        <div className="pl-7 pr-6 pt-5 pb-10">

          {/* Header */}
          <div className="mt-2 mb-1">
            <h1 className="font-playfair text-[2.8rem] font-black leading-none text-[#8B2246] tracking-tight">
              PATTERNS
            </h1>
            <p className="text-[9px] tracking-[0.3em] text-[#8B2246] font-semibold mt-1">
              FROM THIS STORY
            </p>
          </div>

          {/* Subtitle + Story picker on same line */}
          <div className="flex items-center justify-between mt-2 mb-6">
            <p className="text-sm text-[#9B9490]">
              스토리 속에서 만난 {story.patterns.length}가지 패턴
            </p>
            <button
              aria-label="스토리 선택"
              className="text-[9px] tracking-[0.2em] font-semibold text-[#8B2246] shrink-0 ml-3 cursor-pointer hover:opacity-70 transition-opacity"
              onClick={onOpenPicker}
              type="button"
            >
              Story {String(story.id).padStart(2, '0')}
            </button>
          </div>

          <div className="h-px bg-[#E8E0D8]" />

          {/* Pattern list — tap to open popup */}
          <div>
            {story.patterns.map((pattern, index) => (
              <div key={pattern.id}>
                <button
                  type="button"
                  onClick={() => onOpenPattern(pattern)}
                  className="w-full text-left flex gap-4 py-6 group cursor-pointer active:bg-[#F5EDE8]/50 rounded-xl -mx-1 px-1 transition-colors"
                >
                  <div className="shrink-0 w-8 pt-0.5">
                    <span className="font-playfair text-[1.4rem] font-bold text-[#8B2246] leading-none group-hover:opacity-70 transition-opacity">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-playfair text-[1.05rem] font-bold text-[#1A1A1A] leading-snug group-hover:text-[#8B2246] transition-colors">
                      {pattern.pattern}
                    </p>
                    <p className="text-[0.72rem] text-[#8B2246]/70 mt-0.5 mb-3">{pattern.meaningKo}</p>
                    <p className="text-[0.8rem] text-[#1A1A1A] leading-relaxed font-medium">
                      {pattern.storySentence}
                    </p>
                    <p className="text-[0.72rem] text-[#9B9490] mt-0.5 leading-relaxed">
                      {pattern.storySentenceKo}
                    </p>
                    <p className="text-[0.8rem] text-[#1A1A1A] leading-relaxed font-medium mt-2">
                      {pattern.variationSentence}
                    </p>
                    <p className="text-[0.72rem] text-[#9B9490] mt-0.5 leading-relaxed">
                      {pattern.variationSentenceKo}
                    </p>
                  </div>
                  <div className="shrink-0 pt-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-[#D8D0C8] group-hover:text-[#8B2246] transition-colors" strokeWidth={1.5} />
                  </div>
                </button>
                {index < story.patterns.length - 1 && (
                  <div className="h-px bg-[#EEE8E0]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom — ‹ and › only */}
      <div className="shrink-0 border-t border-[#EDE5DC] bg-[#FAF8F4] py-3 px-7">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="이전 (스토리)"
            onClick={onPrev}
            className="p-2 rounded-full text-[#9B9490] hover:text-[#8B2246] hover:bg-[#FDF0F4] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <span className="text-[8px] tracking-[0.3em] text-[#D8D0C8] font-medium">
            {String(story.id).padStart(2, '0')} · PATTERNS
          </span>

          <button
            type="button"
            aria-label="다음 스토리"
            onClick={onNext}
            disabled={!hasNext}
            className={`p-2 rounded-full transition-colors ${
              hasNext
                ? 'text-[#9B9490] hover:text-[#8B2246] hover:bg-[#FDF0F4] cursor-pointer'
                : 'text-[#E0D8D2] cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
