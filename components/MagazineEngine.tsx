'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Volume2, X } from 'lucide-react'

import { BookmarkNav } from '@/components/BookmarkNav'
import { PatternsPage } from '@/components/PatternsPage'
import { StoryPage } from '@/components/StoryPage'
import { WheelPicker } from '@/components/WheelPicker'
import { useSpeech } from '@/hooks/useSpeech'
import type { MagazineParagraph, MagazineStory } from '@/types/magazine'

type MagazineEngineProps = {
  story: MagazineStory
  allStories: MagazineStory[]
}

export function MagazineEngine({ story, allStories }: MagazineEngineProps) {
  const router = useRouter()
  const { speak, speakAll, stop, isSpeaking } = useSpeech()

  const [view, setView] = useState<'story' | 'patterns'>('story')
  const [showPicker, setShowPicker] = useState(false)
  const [popup, setPopup] = useState<MagazineParagraph | null>(null)

  // ── Swipe / drag state ──────────────────────────────────────────────
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isHorizontalSwipe = useRef<boolean | null>(null)
  const viewRef = useRef(view)
  const railRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    viewRef.current = view
  }, [view])

  // Non-passive touchmove to allow e.preventDefault() on horizontal swipes
  useEffect(() => {
    const el = railRef.current
    if (!el) return

    function onTouchMove(e: TouchEvent) {
      const dx = e.touches[0].clientX - touchStartX.current
      const dy = e.touches[0].clientY - touchStartY.current

      // Determine swipe direction on first significant movement
      if (isHorizontalSwipe.current === null) {
        if (Math.abs(dx) > Math.abs(dy) + 5) isHorizontalSwipe.current = true
        else if (Math.abs(dy) > Math.abs(dx) + 5) isHorizontalSwipe.current = false
        else return
      }

      if (!isHorizontalSwipe.current) return

      e.preventDefault()

      const v = viewRef.current
      // Hard-constrain: story can only go left, patterns can only go right
      if (v === 'story' && dx > 0) return
      if (v === 'patterns' && dx < 0) return

      setDragOffset(dx)
      setIsDragging(true)
    }

    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => el.removeEventListener('touchmove', onTouchMove)
  }, [])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isHorizontalSwipe.current = null
  }

  function handleTouchEnd() {
    isHorizontalSwipe.current = null
    if (!isDragging) return

    const THRESHOLD = (typeof window !== 'undefined' ? window.innerWidth : 375) * 0.25
    const currentView = viewRef.current

    if (dragOffset < -THRESHOLD && currentView === 'story') {
      stop()
      setPopup(null)
      setView('patterns')
    } else if (dragOffset > THRESHOLD && currentView === 'patterns') {
      stop()
      setPopup(null)
      setView('story')
    }

    setIsDragging(false)
    setDragOffset(0)
  }

  // ── View switching ──────────────────────────────────────────────────
  function switchView(newView: 'story' | 'patterns') {
    stop()
    setPopup(null)
    setView(newView)
  }

  function goToStory(id: number) {
    stop()
    setPopup(null)
    setView('story')
    router.push(`/stories/${id}`)
  }

  function goNextStory() {
    const next = allStories.find((s) => s.id === story.id + 1)
    if (next) goToStory(next.id)
  }

  function goPrevStory() {
    const prev = allStories.find((s) => s.id === story.id - 1)
    if (prev) goToStory(prev.id)
  }

  // ── Rail transform ──────────────────────────────────────────────────
  // Container is 200% wide; -50% = -100vw = one full page left
  const basePercent = view === 'story' ? 0 : -50
  const railTransform = isDragging
    ? `translateX(calc(${basePercent}% + ${dragOffset}px))`
    : `translateX(${basePercent}%)`

  return (
    // Outer clip: 100dvh, hides off-screen page
    <div className="relative overflow-hidden" style={{ height: '100dvh' }}>
      {/* Fixed left bookmark — rendered here (outside rail transform) so it stays in viewport */}
      <BookmarkNav activeTab="STUDY" />

      {/* Sliding rail */}
      <div
        ref={railRef}
        className="flex h-full"
        style={{
          width: '200%',
          transform: railTransform,
          transition: isDragging ? 'none' : 'transform 500ms cubic-bezier(0.4, 0, 0.15, 1)',
          willChange: 'transform',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Story page — left slot */}
        <div className="h-full overflow-hidden" style={{ width: '50%' }}>
          <StoryPage
            story={story}
            totalStories={allStories.length}
            onNext={() => switchView('patterns')}
            onPrevStory={story.id > 1 ? goPrevStory : undefined}
            onOpenPicker={() => setShowPicker(true)}
            onOpenPopup={setPopup}
            speakAll={speakAll}
            stop={stop}
            isSpeaking={isSpeaking}
          />
        </div>

        {/* Patterns page — right slot */}
        <div className="h-full overflow-hidden" style={{ width: '50%' }}>
          <PatternsPage
            story={story}
            totalStories={allStories.length}
            onPrev={() => switchView('story')}
            onNext={goNextStory}
            onOpenPicker={() => setShowPicker(true)}
          />
        </div>
      </div>

      {/* ── Translation popup — outside rail so fixed = viewport ── */}
      {popup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6"
          onClick={() => { setPopup(null); stop() }}
        >
          <div
            className="bg-white rounded-2xl p-5 w-full max-w-[320px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] tracking-[0.25em] text-[#8B2246] font-semibold">
                TRANSLATION
              </span>
              <div className="flex items-center gap-2">
                <button
                  aria-label={isSpeaking ? '정지' : '영어 읽기'}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    isSpeaking
                      ? 'bg-[#FDF0F4] text-[#8B2246]'
                      : 'text-[#C8BFB5] hover:bg-[#FDF0F4] hover:text-[#8B2246]'
                  }`}
                  onClick={() => (isSpeaking ? stop() : speak(popup.english))}
                  type="button"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button
                  aria-label="닫기"
                  className="text-[#C8BFB5] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                  onClick={() => { setPopup(null); stop() }}
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* English (italic) */}
            <p className="font-playfair text-[0.78rem] text-[#9B9490] leading-relaxed mb-2 italic">
              {popup.english}
            </p>

            {/* Korean */}
            <p className="text-[0.9rem] text-[#1A1A1A] leading-relaxed mb-4">
              {popup.koreanTranslation}
            </p>

            {/* Key expressions */}
            {popup.keyExpressions.length > 0 && (
              <>
                <div className="h-px bg-[#F0E8E0] mb-3" />
                <div className="flex flex-wrap gap-2">
                  {popup.keyExpressions.map((expr, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-[#FDF0F4] text-[#8B2246] px-3 py-1 rounded-full"
                    >
                      {expr}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Wheel picker — also outside rail ── */}
      {showPicker && (
        <WheelPicker
          stories={allStories}
          currentId={story.id}
          onSelect={goToStory}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
