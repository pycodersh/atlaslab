'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { CompletionScreen } from '@/components/CompletionScreen'
import { MiniStory } from '@/components/MiniStory'
import { PatternCard } from '@/components/PatternCard'
import { StoryProgress } from '@/components/StoryProgress'
import { useLearningProgress } from '@/hooks/useLearningProgress'
import { useProgress } from '@/hooks/useProgress'
import type { StoryWithPatterns } from '@/types/story'

type StoryCardEngineProps = {
  story: StoryWithPatterns
  totalStories: number
}

const READ_GOAL = 10
const PAGE_TURN_DURATION = 460

export function StoryCardEngine({ story, totalStories }: StoryCardEngineProps) {
  const router = useRouter()
  const totalCards = story.patterns.length
  const { onPatternView, onToggleFavorite, onStoryProgress, favorites } = useProgress()
  const { progress } = useLearningProgress()
  const defaultDifficulty = progress.settings.difficulty

  const [cardIndex, setCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isPageTurning, setIsPageTurning] = useState(false)
  const [showMiniStory, setShowMiniStory] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [readCount, setReadCount] = useState(0)

  const currentPattern = story.patterns[cardIndex]
  const isLastStory = story.order_index >= totalStories

  function handleFlip() {
    const next = !isFlipped
    setIsFlipped(next)
    if (next) {
      onPatternView(currentPattern.id)
    }
  }

  function goPrevious() {
    if (showMiniStory) {
      setShowMiniStory(false)
      setCardIndex(totalCards - 1)
      setIsFlipped(true)
      return
    }
    if (cardIndex > 0) {
      setCardIndex((v) => v - 1)
      setIsFlipped(false)
    }
  }

  function goNext() {
    if (isPageTurning) return
    setIsPageTurning(true)

    if (cardIndex < totalCards - 1) {
      window.setTimeout(() => {
        setCardIndex((v) => v + 1)
        setIsFlipped(false)
        setIsPageTurning(false)
      }, PAGE_TURN_DURATION)
      return
    }

    window.setTimeout(() => {
      setShowMiniStory(true)
      setIsFlipped(false)
      setIsPageTurning(false)
    }, PAGE_TURN_DURATION)
  }

  function handleRead() {
    const next = Math.min(readCount + 1, READ_GOAL)
    setReadCount(next)
    onStoryProgress(story.id, next)
  }

  function goNextStory() {
    if (isLastStory) {
      setShowCompletion(true)
      return
    }
    router.push(`/learn/${story.order_index + 1}`)
  }

  if (showCompletion) {
    return <CompletionScreen />
  }

  if (showMiniStory) {
    return (
      <div className="flex min-h-[calc(100dvh-8.5rem)] flex-col">
        <StoryProgress
          currentCard={totalCards}
          isMiniStory
          storyNumber={story.order_index}
          totalCards={totalCards}
          totalStories={totalStories}
        />
        <MiniStory
          isLastStory={isLastStory}
          onComplete={goNextStory}
          onPrevious={goPrevious}
          onRead={handleRead}
          readCount={readCount}
          readGoal={READ_GOAL}
          text={story.mini_story}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100dvh-8.5rem)] flex-col">
      <StoryProgress
        currentCard={cardIndex + 1}
        storyNumber={story.order_index}
        totalCards={totalCards}
        totalStories={totalStories}
      />

      <p className="mt-3 text-center text-xs font-bold text-[#9EAEC8]">
        {story.title}
      </p>

      <section className="flex flex-1 items-center py-7">
        <PatternCard
          canGoPrevious={cardIndex > 0}
          defaultDifficulty={defaultDifficulty}
          isFavorited={favorites.has(currentPattern.id)}
          isFlipped={isFlipped}
          isLastCard={cardIndex === totalCards - 1}
          isPageTurning={isPageTurning}
          onFlip={handleFlip}
          onNext={goNext}
          onPrevious={goPrevious}
          onToggleFavorite={() => onToggleFavorite(currentPattern.id)}
          pattern={currentPattern}
        />
      </section>
    </div>
  )
}
