'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Volume2, Square } from 'lucide-react'
import type { MagazineStory } from '@/types/magazine'
import { usePreferences } from '@/contexts/PreferencesContext'
import { PatternPracticeCard } from '@/components/PatternPracticeCard'
import { getPatternExamples } from '@/data/pattern-examples'
import { getRecord } from '@/lib/srs/storage'

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
  const [playingAll, setPlayingAll] = useState(false)
  const playAllRef = useRef(false)
  const [autoKey, setAutoKey] = useState(0)

  // SRS 반복 횟수 (헤더 표시) — 재생 완료 시 갱신
  const [statsVersion, setStatsVersion] = useState(0)
  const [repeats, setRepeats] = useState<number[]>([])

  useEffect(() => {
    setRepeats(story.patterns.map((p) => getRecord('pattern', p.id)?.repeatCount ?? 0))
  }, [story.id, story.patterns, statsVersion])

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
    setStatsVersion((v) => v + 1)
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
              className="w-24 rounded-2xl bg-cover bg-center shrink-0 shadow-sm"
              style={{ backgroundImage: `url(${cover})`, minHeight: 96 }}
              aria-label={story.imageAlt}
              role="img"
            />
            <div className="flex-1 min-w-0 flex flex-col">
              <p className="text-[9px] tracking-[0.28em] font-bold text-[var(--pa)] mb-1">
                STORY {String(story.id).padStart(2, '0')}
              </p>
              <h2 className="font-playfair text-[1.45rem] font-bold text-[var(--pt)] leading-tight">
                {story.title}
              </h2>
              <p className="text-[0.72rem] text-[var(--pm)] mt-0.5 leading-snug">{story.subtitleKo}</p>
              {story.storyNote && (
                <p className="text-[0.72rem] text-[var(--pm)] mt-auto pt-1.5 leading-relaxed line-clamp-2">
                  {story.storyNote}
                </p>
              )}
            </div>
          </div>

          {/* 진행 점 */}
          <div className="flex items-center gap-1.5 mb-6">
            {repeats.map((n, i) => (
              <span
                key={i}
                className={`block w-2 h-2 rounded-full ${n > 0 ? 'bg-[var(--pa)]' : 'bg-[var(--pd)]'}`}
              />
            ))}
          </div>

          <div className="h-px bg-[var(--pd)]" />

          {/* PATTERNS 제목 + 전체 듣기 */}
          <div className="flex items-end justify-between mt-5 mb-5">
            <div>
              <h1 className="font-playfair text-[2.2rem] font-black leading-none text-[var(--pa)] tracking-tight">
                PATTERNS
              </h1>
              <p className="text-[0.72rem] text-[var(--pm)] mt-1.5">스토리 속에서 만난 {total}가지 패턴</p>
            </div>
            <button
              type="button"
              onClick={listenAll}
              aria-label={playingAll ? '전체 정지' : '전체 듣기'}
              className="shrink-0 flex items-center gap-1.5 rounded-full border border-[var(--pd)] px-3.5 py-2 text-[11px] font-bold text-[var(--pt2)] hover:border-[var(--pa)] hover:text-[var(--pa)] transition-colors cursor-pointer"
            >
              {playingAll ? <Square className="w-3 h-3 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
              {playingAll ? '정지' : '전체 듣기'}
            </button>
          </div>

          {/* 패턴 5개 — 각 카드에 예문 5개를 처음부터 모두 표시 */}
          <div className="space-y-4">
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
                  onRequestPlay={() => handleRequestPlay(pattern.id)}
                  autoPlayKey={autoKey}
                  onFinished={() => handleFinished(index)}
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
