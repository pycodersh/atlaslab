'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { MagazineStory } from '@/types/magazine'

type PatternsPageProps = {
  story: MagazineStory
  totalStories: number
  onPrev: () => void       // Patterns → Story (same story)
  onNext: () => void       // Patterns → next Story
  hasNext: boolean
  onOpenPicker: () => void
}

export function PatternsPage({ story, onPrev, onNext, hasNext, onOpenPicker }: PatternsPageProps) {
  return (
    <div className="h-full flex flex-col bg-[#FAF8F4]">
      <div className="flex-1 overflow-y-auto">
        <div className="pl-7 pr-6 pt-5 pb-10">

          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mt-2 mb-1">
            <div>
              <h1 className="font-playfair text-[2.8rem] font-black leading-none text-[#8B2246] tracking-tight">
                PATTERNS
              </h1>
              <p className="text-[9px] tracking-[0.3em] text-[#8B2246] font-semibold mt-1">
                FROM THIS STORY
              </p>
            </div>
            <button
              aria-label="스토리 선택"
              className="text-[9px] tracking-[0.2em] font-semibold text-[#8B2246] flex items-center gap-1 mt-2.5 shrink-0 group cursor-pointer hover:opacity-70 transition-opacity"
              onClick={onOpenPicker}
              type="button"
            >
              Story {String(story.id).padStart(2, '0')}
              <svg width="7" height="5" viewBox="0 0 7 5" fill="none" className="opacity-70">
                <path d="M1 1L3.5 3.5L6 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <p className="text-sm text-[#9B9490] mt-2 mb-6">
            스토리 속에서 만난 {story.patterns.length}가지 패턴
          </p>

          <div className="h-px bg-[#E8E0D8] mb-1" />

          {/* Pattern list */}
          <div>
            {story.patterns.map((pattern, index) => (
              <div key={pattern.id}>
                <div className="flex gap-4 py-6">
                  <div className="shrink-0 w-10 pt-0.5">
                    <span className="font-playfair text-[1.5rem] font-bold text-[#8B2246] leading-none">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-playfair text-[1.1rem] font-bold text-[#1A1A1A] leading-snug">
                      {pattern.pattern}
                    </p>
                    <p className="text-[0.72rem] text-[#8B2246] mt-0.5 mb-4">{pattern.meaningKo}</p>

                    <div className="mb-3">
                      <p className="text-[0.82rem] text-[#1A1A1A] leading-relaxed font-medium">
                        {pattern.storySentence}
                      </p>
                      <p className="text-[0.74rem] text-[#9B9490] leading-relaxed mt-0.5">
                        {pattern.storySentenceKo}
                      </p>
                    </div>

                    <div>
                      <p className="text-[0.82rem] text-[#1A1A1A] leading-relaxed font-medium">
                        {pattern.variationSentence}
                      </p>
                      <p className="text-[0.74rem] text-[#9B9490] leading-relaxed mt-0.5">
                        {pattern.variationSentenceKo}
                      </p>
                    </div>
                  </div>
                </div>
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
