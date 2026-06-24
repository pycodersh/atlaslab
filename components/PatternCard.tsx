'use client'

import { PatternCardBack } from '@/components/PatternCardBack'
import { PatternCardFront } from '@/components/PatternCardFront'
import { cn } from '@/lib/utils'
import type { Difficulty, PatternWithExamples } from '@/types/pattern'

type PatternCardProps = {
  pattern: PatternWithExamples
  isFlipped: boolean
  isFavorited?: boolean
  difficulty?: Difficulty
  cardIndex: number
  totalCards: number
  storyNumber: number
  onFlip: () => void
  onJump?: () => void
  onToggleFavorite?: () => void
}

export function PatternCard({
  pattern,
  isFlipped,
  isFavorited = false,
  difficulty = 'normal',
  cardIndex,
  totalCards,
  storyNumber,
  onFlip,
  onJump,
  onToggleFavorite,
}: PatternCardProps) {
  return (
    <section
      aria-label={isFlipped ? '카드 뒷면' : '카드 앞면'}
      aria-pressed={isFlipped}
      className="h-[31rem] w-full cursor-pointer rounded-[28px] text-left [perspective:1200px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8CFF] focus-visible:ring-offset-4"
      onClick={onFlip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onFlip() }
      }}
      role="button"
      tabIndex={0}
    >
      <div
        className={cn(
          'relative h-full w-full rounded-[28px] [transform-style:preserve-3d] motion-reduce:transition-none',
          'transition-transform duration-[560ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
          isFlipped && '[transform:rotateY(180deg)]',
        )}
      >
        <PatternCardFront
          cardIndex={cardIndex}
          isFavorited={isFavorited}
          onJump={onJump}
          onToggleFavorite={onToggleFavorite}
          pattern={pattern}
          storyNumber={storyNumber}
          totalCards={totalCards}
        />
        <PatternCardBack
          cardIndex={cardIndex}
          difficulty={difficulty}
          isFavorited={isFavorited}
          onJump={onJump}
          onToggleFavorite={onToggleFavorite}
          pattern={pattern}
          storyNumber={storyNumber}
          totalCards={totalCards}
        />
      </div>
    </section>
  )
}
