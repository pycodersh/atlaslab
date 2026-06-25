'use client'

import type { MagazineStory } from '@/types/magazine'

type PatternsPageProps = {
  story: MagazineStory
  totalStories: number
  onPrev: () => void
  onNext: () => void
  onOpenPicker: () => void
}

export function PatternsPage({ story, onOpenPicker }: PatternsPageProps) {
  return (
    <div className="h-full flex flex-col bg-[#FAF8F4]">
      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between pl-8 pr-6 pt-10 pb-2">
          <span className="text-[11px] font-bold tracking-[0.3em] text-[#1A1A1A]">PATTO</span>
          <button
            aria-label="스토리 선택"
            className="text-[9px] tracking-[0.25em] text-[#C8BFB5] cursor-pointer hover:text-[#8B2246] transition-colors"
            onClick={onOpenPicker}
            type="button"
          >
            {String(story.id).padStart(2, '0')} / 100
          </button>
        </header>

        <div className="pl-8 pr-6 pb-12">
          {/* Big heading */}
          <h1 className="font-playfair text-[3.2rem] font-black leading-none text-[#8B2246] mt-3 tracking-tight">
            PATTERNS
          </h1>
          <p className="text-[9px] tracking-[0.35em] text-[#8B2246] mt-1.5 font-semibold">
            FROM THIS STORY
          </p>
          <p className="text-[0.8rem] text-[#9B9490] mt-2 mb-5">
            스토리 속에서 만난 {story.patterns.length}가지 패턴을 정리했어요.
          </p>

          {/* Top divider */}
          <div className="h-px bg-[#E8E0D8] mb-1" />

          {/* Pattern list */}
          <div>
            {story.patterns.map((pattern, index) => (
              <div key={pattern.id}>
                <div className="flex gap-4 py-6">
                  {/* Number */}
                  <div className="shrink-0 w-12 pt-0.5">
                    <span className="font-playfair text-[1.6rem] font-bold text-[#8B2246] leading-none">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-playfair text-[1.15rem] font-bold text-[#1A1A1A] leading-snug">
                      {pattern.pattern}
                    </p>
                    <p className="text-[0.72rem] text-[#8B2246] mt-0.5 mb-4">
                      {pattern.meaningKo}
                    </p>

                    {/* Story sentence */}
                    <div className="mb-3">
                      <p className="text-[0.82rem] text-[#1A1A1A] leading-relaxed font-medium">
                        {pattern.storySentence}
                      </p>
                      <p className="text-[0.74rem] text-[#9B9490] leading-relaxed mt-0.5">
                        {pattern.storySentenceKo}
                      </p>
                    </div>

                    {/* Variation sentence */}
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

      {/* Bottom — brand only */}
      <div className="shrink-0 pb-8 pt-3">
        <p className="text-[8px] tracking-[0.2em] text-[#D8D0C8] text-center">
          SPEAK NATURALLY. CONNECT DEEPLY.
        </p>
      </div>
    </div>
  )
}
