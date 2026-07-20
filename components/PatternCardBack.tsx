'use client'

import { Heart, Volume2 } from 'lucide-react'

import { StoryLabel } from '@/components/StoryLabel'
import { TappableWordText } from '@/components/TappableWordText'
import { patternExamplesFull } from '@/data/pattern-examples-full'
import { useSpeech } from '@/hooks/useSpeech'
import { cn } from '@/lib/utils'
import type { Difficulty, PatternWithExamples } from '@/types/pattern'
import { useT } from '@/hooks/useT'

type PatternCardBackProps = {
  pattern: PatternWithExamples
  difficulty: Difficulty
  cardIndex: number
  totalCards: number
  storyNumber: number
  storyTitle?: string
  isFavorited?: boolean
  onJump?: () => void
  onToggleFavorite?: () => void
}

export function PatternCardBack({
  pattern,
  difficulty,
  cardIndex,
  totalCards,
  storyNumber,
  storyTitle,
  isFavorited = false,
  onJump,
  onToggleFavorite,
}: PatternCardBackProps) {
  const { speak, speakAll, isSpeaking, stop } = useSpeech()
  const examples = pattern.examples[difficulty] ?? []
  const sentences = examples.map((ex) => ex.sentence)
  const t = useT()

  // patternExamplesFull keys: pt{storyNumber}-{story_position (1~5)}
  const legacyKey = `pt${storyNumber}-${pattern.story_position}`
  const fullExamples = patternExamplesFull[legacyKey] ?? []

  function handleSpeakAll(e: React.MouseEvent) {
    e.stopPropagation()
    if (isSpeaking) { stop(); return }
    speakAll(sentences)
  }

  return (
    <div className="pattern-card-glass absolute inset-0 flex flex-col rounded-[28px] px-5 pb-4 pt-14 [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-[0_8px_40px_rgba(79,140,255,0.10)]">

      <StoryLabel storyNumber={storyNumber} subtitle={storyTitle} onJump={onJump} />

      {/* 도트 — 가운데 */}
      <div className="mb-4 flex items-center justify-center gap-1.5">
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

      {/* 예문 목록 — 행 전체 클릭 = TTS */}
      <ol className="flex-1 space-y-[10px] overflow-y-auto">
        {examples.length === 0 ? (
          <li className="flex h-full items-center justify-center text-xs text-[#C7C7CC]">
            {t('no_examples')}
          </li>
        ) : (
          examples.map((ex) => {
            const fullEx = fullExamples.find(f => f.example === ex.order_index)
            return (
              <li
                key={ex.id}
                className="cursor-pointer rounded-xl px-2 py-1 transition-colors hover:bg-white/20 active:bg-white/30"
                style={{ borderBottom: '0.5px solid rgba(255,255,255,0.3)' }}
                onClick={(e) => { e.stopPropagation(); speak(ex.sentence.trim()) }}
              >
                <TappableWordText
                  text={ex.sentence}
                  source={{
                    sourceType: 'pattern',
                    sourceId: ex.id,
                    storyId: storyNumber,
                    patternId: pattern.id,
                    exampleIndex: ex.order_index,
                    originalSentence: ex.sentence,
                    koreanSentence: ex.translation ?? undefined,
                  }}
                  saveCandidates={fullEx?.saveCandidates}
                  className="text-[0.88rem] font-semibold leading-relaxed text-[#1C1C1E] dark:text-[#F2F2F5]"
                  style={{ display: 'block' }}
                />
                {ex.translation && (
                  <p className="mt-[5px] text-[0.75rem] font-normal leading-relaxed text-[#6E6E73] dark:text-[#9090AA]">
                    {ex.translation}
                  </p>
                )}
              </li>
            )
          })
        )}
      </ol>

      {/* 전체 듣기 + 하트 — 하단 행 */}
      <div className="flex items-center justify-between pt-2">
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
        <button
          aria-label={isSpeaking ? '정지' : '전체 듣기'}
          className={cn(
            'ml-auto rounded-full p-2 transition-colors',
            isSpeaking
              ? 'bg-[#FFE8E8] text-[#FF6B6B]'
              : 'bg-[#DCEBFF] text-[#4F8CFF] hover:bg-[#C8DCFF]',
          )}
          onClick={handleSpeakAll}
          type="button"
        >
          <Volume2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
