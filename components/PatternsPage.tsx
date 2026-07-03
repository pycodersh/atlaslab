'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Volume2, Square } from 'lucide-react'
import type { MagazineStory } from '@/types/magazine'
import { usePreferences } from '@/contexts/PreferencesContext'
import { resolveTranslation } from '@/lib/i18n/translation'
import { useT } from '@/hooks/useT'
import { PatternIllustrationRow } from '@/components/PatternIllustrationRow'
import { getPatternExamples, type PracticeExample } from '@/data/pattern-examples'

type PatternsPageProps = {
  story: MagazineStory
  totalStories: number
  onPrev: () => void
  onNext: () => void
  hasNext: boolean
  onOpenPicker: () => void
  patternExamples?: Record<string, PracticeExample[]>
}

export function PatternsPage({ story, onPrev, onNext, hasNext, onOpenPicker, patternExamples }: PatternsPageProps) {
  const { prefs } = usePreferences()
  const voice = story.narratorVoice ?? prefs.voice
  const total = story.patterns.length
  const t = useT()

  // 한 번에 하나의 카드만 재생되도록 조정
  const [activeId, setActiveId] = useState<string | null>(null)
  const [playingAll, setPlayingAll] = useState(false)
  const playAllRef = useRef(false)
  const [autoKey, setAutoKey] = useState(0)

  function listenAll() {
    if (playingAll || activeId) {
      playAllRef.current = false
      setPlayingAll(false)
      setActiveId(null)
      return
    }
    playAllRef.current = true
    setPlayingAll(true)
    setActiveId(story.patterns[0].id)
    setAutoKey((k) => k + 1)
  }

  function handleRequestPlay(id: string) {
    playAllRef.current = false
    setPlayingAll(false)
    setActiveId(id)
  }

  function handleFinished(idx: number) {
    if (playAllRef.current && idx + 1 < total) {
      setActiveId(story.patterns[idx + 1].id)
      setAutoKey((k) => k + 1)
    } else {
      playAllRef.current = false
      setPlayingAll(false)
    }
  }

  const cover = story.slideImages?.[0]?.url ?? story.imageUrl

  return (
    <div className="h-full flex flex-col bg-[var(--pb)]">
      <div className="flex-1 overflow-y-auto">
        <div className="pl-7 pr-6 pt-5 pb-10">

          {/* ── Story 히어로: 대표 이미지 + 제목 + 반복 횟수 ── */}
          <div className="flex gap-4 items-stretch mb-5">
            <div
              className="w-36 rounded-2xl bg-cover bg-center shrink-0 shadow-sm"
              style={{ backgroundImage: `url(${cover})`, minHeight: 96 }}
              aria-label={story.imageAlt}
              role="img"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-[9px] tracking-[0.28em] font-bold text-[var(--pa)] mb-1">
                STORY {String(story.id).padStart(2, '0')}
              </p>
              <h2 className="font-playfair text-[1.45rem] font-bold text-[var(--pt)] leading-tight">
                {story.title}
              </h2>
              {resolveTranslation(story.subtitleKo, prefs.language, story.subtitleTranslations) && (
                <p className="text-[0.72rem] text-[var(--pm)] mt-0.5 leading-snug">
                  {resolveTranslation(story.subtitleKo, prefs.language, story.subtitleTranslations)}
                </p>
              )}
            </div>
          </div>

          <div className="h-px bg-[var(--pd)] mt-6" />

          {/* PATTERNS 제목 + 전체 듣기 */}
          <div className="flex items-end justify-between mt-5 mb-5">
            <div>
              <h1 className="font-playfair text-[2.2rem] font-black leading-none text-[var(--pa)] tracking-tight">
                PATTERNS
              </h1>
              <p className="text-[0.72rem] text-[var(--pm)] mt-1.5">{t('patterns_subtitle', { n: total })}</p>
            </div>
            <button
              type="button"
              onClick={listenAll}
              aria-label={playingAll ? t('stop_all') : t('listen_all')}
              className="shrink-0 flex items-center gap-1.5 rounded-full px-2 py-2 text-[11px] font-bold text-[var(--pt2)] hover:text-[var(--pa)] transition-colors cursor-pointer"
            >
              {playingAll ? <Square className="w-3 h-3 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
              {playingAll ? t('stop_all') : t('listen_all')}
            </button>
          </div>

          {/* 패턴 목록 — 전체 스토리 일러스트 행 UI */}
          <div className="mt-2">
            {story.patterns.map((pattern, index) => {
              const examples = patternExamples?.[pattern.id] ?? (() => {
                const fromData = getPatternExamples(pattern.id)
                return fromData.length > 0
                  ? fromData
                  : [
                      { en: pattern.storySentence, ko: pattern.storySentenceKo },
                      { en: pattern.variationSentence, ko: pattern.variationSentenceKo },
                    ]
              })()
              return (
                <PatternIllustrationRow
                  key={pattern.id}
                  storyId={story.id}
                  storyTitle={story.title}
                  voice={voice}
                  pattern={pattern}
                  examples={examples}
                  index={index + 1}
                  active={activeId === pattern.id}
                  onRequestPlay={() => handleRequestPlay(pattern.id)}
                  autoPlayKey={autoKey}
                  onFinished={() => handleFinished(index)}
                  isLast={index === total - 1}
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
