'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { MagazinePattern, MagazineStory } from '@/types/magazine'
import { usePreferences } from '@/contexts/PreferencesContext'

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
  const { prefs } = usePreferences()
  const showTranslation = prefs.translationLang !== 'none'

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

          <div className="h-px bg-[var(--pd)]" />

          <div>
            {story.patterns.map((pattern, index) => (
              <div key={pattern.id}>
                <button
                  type="button"
                  onClick={() => onOpenPattern(pattern)}
                  className="w-full text-left flex gap-4 py-6 group cursor-pointer active:bg-[var(--pc2)] rounded-xl -mx-1 px-1 transition-colors"
                >
                  <div className="shrink-0 w-8 pt-0.5">
                    <span className="font-playfair text-[1.4rem] font-bold text-[var(--pa)] leading-none group-hover:opacity-70 transition-opacity">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-playfair text-[1.05rem] font-bold text-[var(--pt)] leading-snug group-hover:text-[var(--pa)] transition-colors">
                      {pattern.pattern}
                    </p>
                    {showTranslation && <p className="text-[0.72rem] text-[var(--pa)]/70 mt-0.5 mb-3">{pattern.meaningKo}</p>}
                    <p className="text-[0.8rem] text-[var(--pt)] leading-relaxed font-medium">
                      {pattern.storySentence}
                    </p>
                    {showTranslation && (
                      <p className="text-[0.72rem] text-[var(--pm)] mt-0.5 leading-relaxed">
                        {pattern.storySentenceKo}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 pt-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--pm2)] group-hover:text-[var(--pa)] transition-colors" strokeWidth={1.5} />
                  </div>
                </button>
                {index < story.patterns.length - 1 && (
                  <div className="h-px bg-[var(--pd)]" />
                )}
              </div>
            ))}
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
