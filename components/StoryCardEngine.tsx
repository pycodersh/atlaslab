'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { CompletionScreen } from '@/components/CompletionScreen'
import { MiniStory } from '@/components/MiniStory'
import { PatternCard } from '@/components/PatternCard'
import { StoryProgress } from '@/components/StoryProgress'
import { useLearningProgress } from '@/hooks/useLearningProgress'
import { useProgress } from '@/hooks/useProgress'
import { cn } from '@/lib/utils'
import type { StoryWithPatterns } from '@/types/story'

type StoryCardEngineProps = {
  story: StoryWithPatterns
  totalStories: number
}

const READ_GOAL = 10
const SLIDE_DURATION = 360
const SLIDE_MIDPOINT = 160

export function StoryCardEngine({ story, totalStories }: StoryCardEngineProps) {
  const router = useRouter()
  const totalCards = story.patterns.length
  const { onPatternView, onToggleFavorite, onStoryProgress, favorites } = useProgress()
  const { progress } = useLearningProgress()
  const defaultDifficulty = progress.settings.difficulty

  const [cardIndex, setCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [animDir, setAnimDir] = useState<'next' | 'prev' | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showMiniStory, setShowMiniStory] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [readCount, setReadCount] = useState(0)

  // 스와이프 감지용
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)
  const didSwipe = useRef(false)

  const currentPattern = story.patterns[cardIndex]
  const isLastStory = story.order_index >= totalStories
  const canGoPrevious = cardIndex > 0 || showMiniStory

  // 방향성 카드 전환 (스와이프/버튼 공통)
  function navigate(dir: 'next' | 'prev') {
    if (isAnimating) return
    setIsAnimating(true)
    setAnimDir(dir)

    window.setTimeout(() => {
      if (dir === 'next') {
        if (showMiniStory) {
          // mini story에서 next → 다음 story
          goNextStory()
        } else if (cardIndex < totalCards - 1) {
          setCardIndex((v) => v + 1)
          setIsFlipped(false)
        } else {
          setShowMiniStory(true)
          setIsFlipped(false)
        }
      } else {
        if (showMiniStory) {
          setShowMiniStory(false)
          setCardIndex(totalCards - 1)
          setIsFlipped(true)
        } else if (cardIndex > 0) {
          setCardIndex((v) => v - 1)
          setIsFlipped(false)
        }
      }
    }, SLIDE_MIDPOINT)

    window.setTimeout(() => {
      setIsAnimating(false)
      setAnimDir(null)
    }, SLIDE_DURATION)
  }

  function handleFlip() {
    if (didSwipe.current) {
      didSwipe.current = false
      return
    }
    if (isAnimating) return
    const next = !isFlipped
    setIsFlipped(next)
    if (next) onPatternView(currentPattern.id)
  }

  // 터치 이벤트
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = Date.now()
    didSwipe.current = false
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current
    const elapsed = Date.now() - touchStartTime.current

    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY)
    const isSwipe = Math.abs(deltaX) > 48 && isHorizontal && elapsed < 500

    if (isSwipe) {
      didSwipe.current = true
      if (deltaX < 0) {
        navigate('next')
      } else if (canGoPrevious) {
        navigate('prev')
      }
    }
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

  if (showCompletion) return <CompletionScreen />

  const slideClass = animDir === 'next'
    ? 'animate-slide-next'
    : animDir === 'prev'
      ? 'animate-slide-prev'
      : ''

  if (showMiniStory) {
    return (
      <div className="flex min-h-[calc(100dvh-5rem)] flex-col">
        <StoryProgress
          currentCard={totalCards}
          isMiniStory
          storyNumber={story.order_index}
          totalCards={totalCards}
          totalStories={totalStories}
        />
        <div
          className={cn('flex flex-1 flex-col', slideClass)}
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
        >
          <MiniStory
            isLastStory={isLastStory}
            onComplete={goNextStory}
            onPrevious={() => navigate('prev')}
            onRead={handleRead}
            readCount={readCount}
            readGoal={READ_GOAL}
            text={story.mini_story}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col">
      <StoryProgress
        currentCard={cardIndex + 1}
        storyNumber={story.order_index}
        totalCards={totalCards}
        totalStories={totalStories}
      />

      <p className="mt-3 text-center text-xs font-bold text-[#9EAEC8]">
        {story.title}
      </p>

      {/* 카드 영역 (스와이프 감지) */}
      <section
        className={cn('flex flex-1 items-center py-5', slideClass)}
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
      >
        <PatternCard
          defaultDifficulty={defaultDifficulty}
          isFavorited={favorites.has(currentPattern.id)}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          onToggleFavorite={() => onToggleFavorite(currentPattern.id)}
          pattern={currentPattern}
        />
      </section>

      {/* 외부 네비게이션 바 */}
      <nav
        className="flex items-center justify-between gap-4 pb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="이전 카드"
          className={cn(
            'flex items-center gap-1 rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors',
            canGoPrevious
              ? 'text-[#4F8CFF] hover:bg-[#DCEBFF]'
              : 'cursor-not-allowed text-[#D1D9E6]',
          )}
          disabled={!canGoPrevious}
          onClick={() => navigate('prev')}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
          이전
        </button>

        <span className="text-sm font-bold text-[#6B7280]">
          {cardIndex + 1} / {totalCards}
        </span>

        <button
          aria-label="다음 카드"
          className="flex items-center gap-1 rounded-2xl px-4 py-2.5 text-sm font-bold text-[#4F8CFF] transition-colors hover:bg-[#DCEBFF]"
          onClick={() => navigate('next')}
          type="button"
        >
          {cardIndex === totalCards - 1 ? 'Story' : '다음'}
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  )
}
