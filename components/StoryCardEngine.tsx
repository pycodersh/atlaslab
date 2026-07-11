'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { CompletionScreen } from '@/components/CompletionScreen'
import { StoryCompletePopup } from '@/components/StoryCompletePopup'
import { MiniStory } from '@/components/MiniStory'
import { PatternCard } from '@/components/PatternCard'
import { StoryJumpSheet } from '@/components/StoryJumpSheet'
import { useLearningProgress } from '@/hooks/useLearningProgress'
import { useProgress } from '@/hooks/useProgress'
import { cn } from '@/lib/utils'
import type { StoryListItem } from '@/queries/stories'
import type { StoryWithPatterns } from '@/types/story'

type StoryCardEngineProps = {
  story: StoryWithPatterns
  totalStories: number
  allStories: StoryListItem[]
}

const READ_GOAL = 10
const ANIM_DURATION = 300
const ANIM_MIDPOINT = 114
const DRAG_THRESHOLD = 0.30

export function StoryCardEngine({ story, totalStories, allStories }: StoryCardEngineProps) {
  const router = useRouter()
  const totalCards = story.patterns.length
  const { onPatternView, onToggleFavorite, onStoryProgress, favorites } = useProgress()
  const { progress } = useLearningProgress()
  const difficulty = progress.settings.difficulty

  const [cardIndex, setCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [animDir, setAnimDir] = useState<'next' | 'prev' | null>(null)
  const [showMiniStory, setShowMiniStory] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [readCount, setReadCount] = useState(0)
  const [jumpOpen, setJumpOpen] = useState(false)

  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const isAnimatingRef = useRef(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const didSwipe = useRef(false)
  const didDrag = useRef(false)
  const cardWrapperRef = useRef<HTMLDivElement>(null)

  const currentPattern = story.patterns[cardIndex]
  const isLastStory = story.order_index >= totalStories
  const isFirstStory = story.order_index <= 1
  const canGoPrevious = cardIndex > 0 || showMiniStory || !isFirstStory

  useEffect(() => {
    const el = cardWrapperRef.current
    if (!el) return
    const onMove = (e: TouchEvent) => {
      if (isAnimatingRef.current) return
      const dx = e.touches[0].clientX - touchStartX.current
      const dy = e.touches[0].clientY - touchStartY.current
      if (Math.abs(dx) > Math.abs(dy) + 4) {
        e.preventDefault()
        didDrag.current = true
        setDragOffset(dx)
        setIsDragging(true)
      }
    }
    el.addEventListener('touchmove', onMove, { passive: false })
    return () => el.removeEventListener('touchmove', onMove)
  }, [])

  function navigate(dir: 'next' | 'prev') {
    if (isAnimatingRef.current) return
    isAnimatingRef.current = true
    setDragOffset(0)
    setIsDragging(false)
    setAnimDir(dir)

    window.setTimeout(() => {
      if (dir === 'next') {
        if (showMiniStory) {
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
          setIsFlipped(false)
        } else if (cardIndex > 0) {
          setCardIndex((v) => v - 1)
          setIsFlipped(false)
        } else if (!isFirstStory) {
          router.push(`/learn/${story.order_index - 1}`)
        }
      }
    }, ANIM_MIDPOINT)

    window.setTimeout(() => {
      isAnimatingRef.current = false
      setAnimDir(null)
    }, ANIM_DURATION)
  }

  function handleFlip() {
    if (didSwipe.current) { didSwipe.current = false; return }
    if (isAnimatingRef.current) return
    const next = !isFlipped
    setIsFlipped(next)
    if (next) onPatternView(currentPattern.id)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    didSwipe.current = false
    didDrag.current = false
    setIsDragging(false)
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    const cardWidth = cardWrapperRef.current?.offsetWidth ?? 320
    const threshold = cardWidth * DRAG_THRESHOLD

    setIsDragging(false)
    setDragOffset(0)

    if (didDrag.current && Math.abs(dx) > Math.abs(dy)) {
      didSwipe.current = true
      if (Math.abs(dx) >= threshold) {
        if (dx < 0) navigate('next')
        else if (canGoPrevious) navigate('prev')
      }
    }
    didDrag.current = false
  }

  function handleIncrementRead() {
    const next = Math.min(readCount + 1, READ_GOAL)
    setReadCount(next)
    onStoryProgress(story.id, next)
  }

  function handleDecrementRead() {
    const next = Math.max(readCount - 1, 0)
    setReadCount(next)
    onStoryProgress(story.id, next)
  }

  const [showPopup, setShowPopup] = useState(false)

  function goNextStory() {
    if (isLastStory) { setShowCompletion(true); return }
    setShowPopup(true)
  }

  if (showCompletion) return <CompletionScreen />

  if (showPopup) return (
    <StoryCompletePopup
      storyNumber={story.order_index}
      patternsInStory={totalCards}
      onContinue={() => {
        setShowPopup(false)
        router.push(`/learn/${story.order_index + 1}`)
      }}
      onHome={() => router.push('/patto/home')}
    />
  )

  // ── Apple-style 드래그 비주얼 ──
  const cardWidth = cardWrapperRef.current?.offsetWidth ?? 320
  const dragProgress = dragOffset / cardWidth
  const tx = dragOffset * 0.65
  const rz = dragProgress * 4
  const sc = 1 - Math.min(Math.abs(dragProgress) * 0.04, 0.04)
  const shadowIntensity = Math.min(Math.abs(dragProgress) * 0.20, 0.20)

  const dragStyle: React.CSSProperties = isDragging || dragOffset !== 0
    ? {
        transform: `translateX(${tx}px) rotateZ(${rz}deg) scale(${sc})`,
        transition: 'none',
        willChange: 'transform',
        filter: `drop-shadow(0 ${8 + shadowIntensity * 24}px ${20 + shadowIntensity * 40}px rgba(79,140,255,${0.10 + shadowIntensity * 0.15}))`,
      }
    : {
        transform: 'translateX(0) rotateZ(0deg) scale(1)',
        transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }

  const animClass = animDir === 'next'
    ? 'animate-apple-next'
    : animDir === 'prev'
      ? 'animate-apple-prev'
      : ''

  const miniStoryContent = story.mini_stories[difficulty] ?? story.mini_stories.normal

  // ── 공통 네비 버튼 ──
  const navButtons = (
    <div className="flex items-center justify-center gap-5 pb-4 pt-2">
      <button
        aria-label="이전"
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-full',
          'glass-card',
          'shadow-[0_2px_8px_rgba(79,140,255,0.07)]',
          'transition-all duration-200 active:scale-95',
          canGoPrevious
            ? 'text-[#6B7280] hover:border-[#DCEBFF] hover:text-[#4F8CFF]'
            : 'cursor-not-allowed text-[#D1D9E6]',
        )}
        disabled={!canGoPrevious}
        onClick={() => canGoPrevious && navigate('prev')}
        type="button"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        aria-label="다음"
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-full',
          'bg-[#4F8CFF]',
          'shadow-[0_2px_8px_rgba(79,140,255,0.18)]',
          'text-white transition-all duration-200',
          'hover:bg-[#3B7DE8]',
          'active:scale-95',
        )}
        onClick={() => navigate('next')}
        type="button"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )

  // ── Mini Story 화면 ──
  if (showMiniStory) {
    return (
      <>
        <div className="flex min-h-[calc(100dvh-5rem)] flex-col gap-3">
          {/* 낭독 미션은 MiniStory 카드 내부에 포함됨 */}
          <div
            className={cn('relative flex-1', animClass)}
            onTouchEnd={handleTouchEnd}
            onTouchStart={handleTouchStart}
          >
            <MiniStory
              content={miniStoryContent}
              goal={READ_GOAL}
              onDecrement={handleDecrementRead}
              onIncrement={handleIncrementRead}
              onJump={() => setJumpOpen(true)}
              readCount={readCount}
              storyNumber={story.order_index}
              storyTitle={story.title}
              totalCards={totalCards}
            />
          </div>
          {navButtons}
        </div>
        <StoryJumpSheet
          currentOrderIndex={story.order_index}
          isOpen={jumpOpen}
          onClose={() => setJumpOpen(false)}
          stories={allStories}
        />
      </>
    )
  }

  // ── 카드 학습 화면 ──
  return (
    <>
      <div className="flex min-h-[calc(100dvh-5rem)] flex-col gap-3">
        {/* STORY 헤더는 PatternCard 내부에 포함됨 */}
        <section
          aria-label="카드 학습 영역"
          className={cn('flex-1', animClass)}
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
        >
          <div className="h-full w-full" ref={cardWrapperRef} style={dragStyle}>
            <PatternCard
              cardIndex={cardIndex}
              difficulty={difficulty}
              isFavorited={favorites.has(currentPattern.id)}
              isFlipped={isFlipped}
              onFlip={handleFlip}
              onJump={() => setJumpOpen(true)}
              onToggleFavorite={() => onToggleFavorite(currentPattern.id)}
              pattern={currentPattern}
              storyNumber={story.order_index}
              storyTitle={story.title}
              totalCards={totalCards}
            />
          </div>
        </section>
        {navButtons}
      </div>

      <StoryJumpSheet
        currentOrderIndex={story.order_index}
        isOpen={jumpOpen}
        onClose={() => setJumpOpen(false)}
        stories={allStories}
      />
    </>
  )
}
