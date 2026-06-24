'use client'

import { PatternCardBack } from '@/components/PatternCardBack'
import { PatternCardFront } from '@/components/PatternCardFront'
import { cn } from '@/lib/utils'
import type { Difficulty, PatternWithExamples } from '@/types/pattern'

type PatternCardProps = {
  pattern: PatternWithExamples
  isFlipped: boolean
  canGoPrevious: boolean
  isLastCard: boolean
  isPageTurning: boolean
  isFavorited?: boolean
  defaultDifficulty?: Difficulty
  onFlip: () => void
  onPrevious: () => void
  onNext: () => void
  onToggleFavorite?: () => void
}

export function PatternCard({
  pattern,
  isFlipped,
  canGoPrevious,
  isLastCard,
  isPageTurning,
  isFavorited = false,
  defaultDifficulty = 'normal',
  onFlip,
  onPrevious,
  onNext,
  onToggleFavorite,
}: PatternCardProps) {
  return (
    <section
      aria-label={isFlipped ? '카드 뒷면' : '카드 앞면'}
      aria-pressed={isFlipped}
      className={cn(
        'h-[31rem] w-full cursor-pointer rounded-[28px] text-left [perspective:1400px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8CFF] focus-visible:ring-offset-4',
        isPageTurning && 'animate-card-page-turn pointer-events-none',
      )}
      onClick={onFlip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onFlip()
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div
        className={cn(
          'relative h-full w-full rounded-[28px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] motion-reduce:transition-none',
          isFlipped && '[transform:rotateY(180deg)]',
        )}
      >
        <PatternCardFront
          isFavorited={isFavorited}
          onToggleFavorite={onToggleFavorite}
          pattern={pattern}
        />
        <PatternCardBack
          canGoPrevious={canGoPrevious}
          defaultDifficulty={defaultDifficulty}
          isLastCard={isLastCard}
          onNext={onNext}
          onPrevious={onPrevious}
          pattern={pattern}
        />
      </div>
    </section>
  )
}
