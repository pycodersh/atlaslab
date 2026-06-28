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
  const total = story.patterns.length

  // 한 번에 하나의 카드만 재생되도록 조정
  const [activeId, setActiveId] = useState<string | null>(null)

  const cover = story.slideImages?.[0]?.url ?? story.imageUrl

  return (
    <div className="h-full flex flex-col bg-[var(--pb)]">
      <div className="flex-1 overflow-y-auto">
        <div className="px-7 pt-6 pb-12">

          {/* ── Story 히어로 ── */}
          <div className="flex gap-4 items-stretch mb-7">
            <div
              className="w-36 rounded-2xl bg-cover bg-center shrink-0 shadow-sm"
              style={{ backgroundImage: `url(${cover})`, minHeight: 100 }}
              aria-label={story.imageAlt}
              role="img"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-[9px] tracking-[0.3em] font-bold text-[var(--pa)] mb-1.5">
                STORY {String(story.id).padStart(2, '0')}
              </p>
              <h2 className="font-playfair text-[1.5rem] font-bold text-[var(--pt)] leading-tight">
                {story.title}
              </h2>
              <p className="text-[0.74rem] text-[var(--pm)] mt-1 leading-snug">{story.subtitleKo}</p>
            </div>
          </div>

          {/* ── PATTERNS 머리말 ── */}
          <div className="border-t border-[var(--pd)] pt-7 mb-2">
            <h1 className="font-playfair text-[2.1rem] font-black leading-none text-[var(--pa)] tracking-tight">
              PATTERNS
            </h1>
            <button
              type="button"
              onClick={onOpenPicker}
              className="mt-2 text-[0.72rem] text-[var(--pm)] hover:text-[var(--pa)] transition-colors cursor-pointer"
            >
              스토리 속에서 만난 {total}가지 패턴 · Story {String(story.id).padStart(2, '0')}
            </button>
          </div>

          {/* ── 패턴 카드 — 사이 구분선 + 넉넉한 여백 ── */}
          <div className="divide-y divide-[var(--pd)]">
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
