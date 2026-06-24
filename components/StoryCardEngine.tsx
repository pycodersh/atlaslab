'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { CompletionScreen } from '@/components/CompletionScreen'
import { MiniStory } from '@/components/MiniStory'
import { PatternCard } from '@/components/PatternCard'
import { StoryJumpSheet } from '@/components/StoryJumpSheet'
import { StoryProgress } from '@/components/StoryProgress'
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
const PAGE_TURN_DURATION = 420
const PAGE_TURN_MIDPOINT = 185
const DRAG_THRESHOLD = 0.30

// page-curl 애니메이션 사용 여부 (성능 문제 시 false로 fallback → slide 사용)
const USE_PAGE_CURL = true

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
  const canGoPrevious = cardIndex > 0 || showMiniStory

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
          setIsFlipped(true)
        } else if (cardIndex > 0) {
          setCardIndex((v) => v - 1)
          setIsFlipped(false)
        }
      }
    }, PAGE_TURN_MIDPOINT)

    window.setTimeout(() => {
      isAnimatingRef.current = false
      setAnimDir(null)
    }, PAGE_TURN_DURATION)
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

  function handleRead() {
    const next = Math.min(readCount + 1, READ_GOAL)
    setReadCount(next)
    onStoryProgress(story.id, next)
  }

  function goNextStory() {
    if (isLastStory) { setShowCompletion(true); return }
    router.push(`/learn/${story.order_index + 1}`)
  }

  if (showCompletion) return <CompletionScreen />

  // ── Page-curl 드래그 스타일 ──
  const cardWidth = cardWrapperRef.current?.offsetWidth ?? 320
  const rawProgress = Math.abs(dragOffset) / (cardWidth * DRAG_THRESHOLD)
  const angle = Math.min(rawProgress, 1) * 55          // 최대 55도
  const shadowAlpha = Math.min(rawProgress, 1) * 0.18  // 최대 18% 어두워짐

  const dragStyle: React.CSSProperties = isDragging || dragOffset !== 0
    ? {
        transformOrigin: dragOffset < 0 ? 'left center' : 'right center',
        transform: `perspective(1200px) rotateY(${dragOffset < 0 ? -angle : angle}deg)`,
        transition: 'none',
        willChange: 'transform',
      }
    : {
        transform: 'perspective(1200px) rotateY(0deg)',
        transition: 'transform 0.40s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }

  const animClass = animDir === 'next'
    ? (USE_PAGE_CURL ? 'animate-page-turn-next' : 'animate-slide-next')
    : animDir === 'prev'
      ? (USE_PAGE_CURL ? 'animate-page-turn-prev' : 'animate-slide-prev')
      : ''

  const miniStoryText = story.mini_stories[difficulty] || story.mini_stories.normal || ''

  // ── Mini Story 화면 ──
  if (showMiniStory) {
    return (
      <>
        <div className="flex min-h-[calc(100dvh-5rem)] flex-col">
          <StoryProgress
            currentCard={totalCards}
            isMiniStory
            onJump={() => setJumpOpen(true)}
            storyNumber={story.order_index}
            title={story.title}
            totalCards={totalCards}
            totalStories={totalStories}
          />
          <div
            className={cn('flex flex-1 flex-col', animClass)}
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
              text={miniStoryText}
            />
          </div>
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
      <div className="flex min-h-[calc(100dvh-5rem)] flex-col pb-12">
        <StoryProgress
          currentCard={cardIndex + 1}
          onJump={() => setJumpOpen(true)}
          storyNumber={story.order_index}
          title={story.title}
          totalCards={totalCards}
          totalStories={totalStories}
        />

        {/* animClass는 section에, drag 스타일은 inner div에 분리 */}
        <section
          aria-label="카드 학습 영역"
          className={cn('flex flex-1 items-center py-4', animClass)}
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
        >
          <div className="relative w-full" ref={cardWrapperRef} style={dragStyle}>
            {/* page-curl edge 그림자 오버레이 */}
            {isDragging && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[28px]"
                style={{
                  background: dragOffset < 0
                    ? `linear-gradient(to left, rgba(0,0,0,${shadowAlpha}), transparent 55%)`
                    : `linear-gradient(to right, rgba(0,0,0,${shadowAlpha}), transparent 55%)`,
                  zIndex: 10,
                }}
              />
            )}
            <PatternCard
              difficulty={difficulty}
              isFavorited={favorites.has(currentPattern.id)}
              isFlipped={isFlipped}
              onFlip={handleFlip}
              onToggleFavorite={() => onToggleFavorite(currentPattern.id)}
              pattern={currentPattern}
            />
          </div>
        </section>

        <p className="pb-2 text-center text-[10px] font-medium text-[#D1D9E6]">
          ← 스와이프로 이동 →
        </p>
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
