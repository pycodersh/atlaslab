'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { MagazineStory } from '@/types/magazine'
import { usePreferences } from '@/contexts/PreferencesContext'
import { PatternPracticeCard } from '@/components/PatternPracticeCard'
import { getPatternExamples } from '@/data/pattern-examples'

type PatternsPageProps = {
  story: MagazineStory
  totalStories: number
  onPrev: () => void
  onNext: () => void
  hasNext: boolean
  onOpenPicker: () => void
}

export function PatternsPage({ story, onPrev, onNext, hasNext, onOpenPicker }: PatternsPageProps) {
  const { prefs } = usePreferences()
  const voice = story.narratorVoice ?? prefs.voice

  // 한 번에 하나의 카드만 재생되도록 조정
  const [activeId, setActiveId] = useState<string | null>(null)

  return (
    <div className="h-full flex flex-col bg-[var(--pb)]">
      <div className="flex-1 overflow-y-auto">
        <div className="pl-7 pr-6 pt-5 pb-10">

          <div className="mt-2 mb-1">
            <h1 className="font-playfair text-[2.8rem] font-black leading-none text-[var(--pa)] tracking-tight">
              PATTERNS
            </h1>
            <p className="text-[9px] tracking-[0.3em] text-[var(--pa)] font-semibold mt-1">
              FROM THIS STORY
            </p>
          </div>

          <div className="flex items-center justify-between mt-2 mb-6">
            <p className="text-sm text-[var(--pm)]">
              스토리 속에서 만난 {story.patterns.length}가지 패턴
            </p>
            <button
              aria-label="스토리 선택"
              className="text-[9px] tracking-[0.2em] font-semibold text-[var(--pa)] shrink-0 ml-3 cursor-pointer hover:opacity-70 transition-opacity"
              onClick={onOpenPicker}
              type="button"
            >
              Story {String(story.id).padStart(2, '0')}
            </button>
          </div>

          {/* 패턴 5개 — 각 카드에 예문 5개를 처음부터 모두 표시 (클릭/팝업 없이 바로 반복) */}
          <div className="space-y-5">
            {story.patterns.map((pattern, index) => {
              const fromData = getPatternExamples(pattern.id)
              const examples = fromData.length > 0
                ? fromData
                : [
                    { en: pattern.storySentence, ko: pattern.storySentenceKo },
                    { en: pattern.variationSentence, ko: pattern.variationSentenceKo },
                  ]
              return (
                <PatternPracticeCard
                  key={pattern.id}
                  storyId={story.id}
                  storyTitle={story.title}
                  voice={voice}
                  pattern={pattern}
                  examples={examples}
                  index={index + 1}
                  active={activeId === pattern.id}
                  onRequestPlay={() => setActiveId(pattern.id)}
                />
              )
            })}
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--pd)] bg-[var(--pb)] py-3 px-7">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="이전 (스토리)"
            onClick={onPrev}
            className="p-2 rounded-full text-[var(--pm)] hover:text-[var(--pa)] hover:bg-[var(--pal)] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <span className="text-[8px] tracking-[0.3em] text-[var(--pm2)] font-medium">
            {String(story.id).padStart(2, '0')} · PATTERNS
          </span>

          <button
            type="button"
            aria-label="다음 스토리"
            onClick={onNext}
            disabled={!hasNext}
            className={`p-2 rounded-full transition-colors ${
              hasNext
                ? 'text-[var(--pm)] hover:text-[var(--pa)] hover:bg-[var(--pal)] cursor-pointer'
                : 'text-[var(--pd)] cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
