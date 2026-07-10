'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useIsDesktop } from '@/hooks/useIsDesktop'

import { PatternsPageV2 } from '@/components/PatternsPageV2'
import { StoryPage } from '@/components/StoryPage'
import { WheelPicker } from '@/components/WheelPicker'
import { GlobalSavePopup } from '@/components/GlobalSavePopup'
import { TodayMissionPopup } from '@/components/TodayMissionPopup'

import { useSpeech } from '@/hooks/useSpeech'
import { useAmbience } from '@/hooks/useAmbience'
import { usePreferences } from '@/contexts/PreferencesContext'
import type { AmbienceId } from '@/types/magazine'
import { ambienceGain, type VoiceKey } from '@/lib/settings/preferences'
import type { MagazineStory } from '@/types/magazine'
import { saveLastPosition } from '@/lib/last-position'
import type { PracticeExample } from '@/data/pattern-examples'

type MagazineEngineProps = {
  story: MagazineStory
  allStories: MagazineStory[]
  initialView?: 'story' | 'patterns'
  patternExamples?: Record<string, PracticeExample[]>
}

export function MagazineEngine({ story, allStories, initialView = 'story', patternExamples }: MagazineEngineProps) {
  const router = useRouter()
  const isDesktop = useIsDesktop()
  const { speakAll, stop, isSpeaking, currentParagraphIdx } = useSpeech()
  const { prefs } = usePreferences()
  const { play: playAmbience, stop: stopAmbience } = useAmbience()

  const [view, setView] = useState<'story' | 'patterns'>(initialView)
  // null = follow Settings default; true/false = per-story override
  const [ambienceOverride, setAmbienceOverride] = useState<boolean | null>(null)

  // 위치 저장 — Continue Learning이 여기로 돌아올 수 있도록
  useEffect(() => { saveLastPosition(story.id, view) }, [story.id, view])
  const [showPicker, setShowPicker] = useState(false)

  // ── Swipe / drag state ──────────────────────────────────────────────
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isHorizontalSwipe = useRef<boolean | null>(null)
  const viewRef = useRef(view)
  const storyRef = useRef(story)
  const allStoriesRef = useRef(allStories)
  const railRef = useRef<HTMLDivElement>(null)

  useEffect(() => { viewRef.current = view }, [view])
  useEffect(() => { storyRef.current = story }, [story])
  useEffect(() => { allStoriesRef.current = allStories }, [allStories])

  // Passive touchmove — touch-action: pan-y on the rail prevents horizontal scroll
  // natively so we don't need preventDefault(). Passive = browser scrolls immediately
  // without waiting for JS, which fixes the iOS "null content below initial viewport" bug.
  useEffect(() => {
    const el = railRef.current
    if (!el) return

    function onTouchMove(e: TouchEvent) {
      const dx = e.touches[0].clientX - touchStartX.current
      const dy = e.touches[0].clientY - touchStartY.current

      if (isHorizontalSwipe.current === null) {
        if (Math.abs(dx) > Math.abs(dy) + 5) isHorizontalSwipe.current = true
        else if (Math.abs(dy) > Math.abs(dx) + 5) isHorizontalSwipe.current = false
        else return
      }
      if (!isHorizontalSwipe.current) return

      // No e.preventDefault() — touch-action: pan-y handles it at CSS level

      const v = viewRef.current
      const s = storyRef.current
      const all = allStoriesRef.current
      // Block left-drag when on last page (Patterns of last story)
      if (v === 'patterns' && dx < 0 && s.id >= all.length) return
      // Block right-drag when on first page (Story of first story)
      if (v === 'story' && dx > 0 && s.id <= 1) return

      setDragOffset(dx)
      setIsDragging(true)
    }

    el.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => el.removeEventListener('touchmove', onTouchMove)
  }, [])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isHorizontalSwipe.current = null
  }

  // Linear swipe: Story01 → Patterns01 → Story02 → Patterns02 …
  function handleTouchEnd() {
    isHorizontalSwipe.current = null
    if (!isDragging) { setDragOffset(0); return }

    const THRESHOLD = (typeof window !== 'undefined' ? window.innerWidth : 375) * 0.25
    const v = viewRef.current
    const s = storyRef.current

    if (dragOffset < -THRESHOLD) {
      // Swipe LEFT → forward
      if (v === 'story') {
        // Story → Patterns (same story)
        handleStop(); setView('patterns')
      } else {
        // Patterns → next Story
        const next = allStoriesRef.current.find(x => x.id === s.id + 1)
        if (next) { handleStop(); router.push(`/stories/${next.id}`) }
      }
    } else if (dragOffset > THRESHOLD) {
      // Swipe RIGHT → backward
      if (v === 'patterns') {
        // Patterns → Story (same story)
        handleStop(); setView('story')
      } else {
        // Story → prev story's Patterns
        const prev = allStoriesRef.current.find(x => x.id === s.id - 1)
        if (prev) { handleStop(); router.push(`/stories/${prev.id}?v=p`) }
      }
    }

    setIsDragging(false)
    setDragOffset(0)
  }

  // Story 변경 시 per-story override 초기화
  useEffect(() => {
    setAmbienceOverride(null)
  }, [story.id])  // eslint-disable-line react-hooks/exhaustive-deps

  const effectiveAmbienceOn = ambienceOverride ?? (prefs.ambienceDefault === 'on')
  const userVolume = ambienceGain(prefs.ambienceVolume ?? 50)

  // 환경음 toggle: 낭독 중이면 즉시 재생/중단
  const toggleAmbience = useCallback(() => {
    const next = !effectiveAmbienceOn
    setAmbienceOverride(next)
    if (isSpeaking && story.ambienceId && !story.sceneVideo) {
      if (next) playAmbience(story.ambienceId as AmbienceId, userVolume)
      else stopAmbience()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveAmbienceOn, isSpeaking, story.ambienceId, story.sceneVideo, userVolume])

  // 낭독이 끝나거나 중단되면 환경음도 함께 중단
  useEffect(() => {
    if (!isSpeaking) stopAmbience()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpeaking])

  // 페이지 이탈(언마운트) 시 환경음 정리
  useEffect(() => {
    return () => stopAmbience()
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // 낭독 시작 시 환경음도 같이 시작 (활성화 상태일 때)
  const handleSpeakAll = useCallback((
    texts: string[],
    audioUrls?: (string | null | undefined)[],
    opts?: { voiceKey?: VoiceKey; voiceKeys?: VoiceKey[] },
  ) => {
    if (effectiveAmbienceOn && story.ambienceId && !story.sceneVideo) {
      playAmbience(story.ambienceId as AmbienceId, userVolume)
    }
    speakAll(texts, audioUrls, opts)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveAmbienceOn, story.ambienceId, story.sceneVideo, userVolume, speakAll])

  // 낭독 중단 시 환경음도 함께 중단
  const handleStop = useCallback(() => {
    stop()
    stopAmbience()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop])

  // ── Navigation ──────────────────────────────────────────────────────
  function switchView(newView: 'story' | 'patterns') {
    handleStop(); setView(newView)
  }

  function goToStory(id: number, startView: 'story' | 'patterns' = 'story') {
    handleStop()
    const suffix = startView === 'patterns' ? '?v=p' : ''
    router.push(`/stories/${id}${suffix}`)
  }

  // Linear next: Story → Patterns, Patterns → next Story
  // Desktop: skip the Story↔Patterns toggle — go directly to next story
  function goNext() {
    if (isDesktop) {
      const next = allStories.find(s => s.id === story.id + 1)
      if (next) goToStory(next.id, 'story')
    } else if (view === 'story') {
      switchView('patterns')
    } else {
      const next = allStories.find(s => s.id === story.id + 1)
      if (next) goToStory(next.id, 'story')
    }
  }

  // Linear prev: Patterns → Story, Story → prev Story's Patterns
  // Desktop: go directly to prev story
  function goPrev() {
    if (isDesktop) {
      const prev = allStories.find(s => s.id === story.id - 1)
      if (prev) goToStory(prev.id, 'story')
    } else if (view === 'patterns') {
      switchView('story')
    } else {
      const prev = allStories.find(s => s.id === story.id - 1)
      if (prev) goToStory(prev.id, 'patterns')
    }
  }

  const isFirst = isDesktop ? story.id <= 1 : (story.id <= 1 && view === 'story')
  const isLast  = isDesktop ? story.id >= allStories.length : (story.id >= allStories.length && view === 'patterns')

  // ── Rail transform ──────────────────────────────────────────────────
  const basePercent = view === 'story' ? 0 : -50
  const railTransform = isDragging
    ? `translateX(calc(${basePercent}% + ${dragOffset}px))`
    : `translateX(${basePercent}%)`

  const sharedPopups = (
    <>
      <GlobalSavePopup />
      <TodayMissionPopup />
      {showPicker && (
        <WheelPicker
          stories={allStories}
          currentId={story.id}
          onSelect={(id) => goToStory(id)}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  )

  // ── Desktop: side-by-side layout ────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="h-screen-stable flex overflow-hidden" style={{ position: 'relative' }}>
        {/* Story panel — left 55% */}
        <div style={{ flex: '0 0 55%', overflow: 'clip', height: '100%', borderRight: '1px solid var(--pd)' }}>
          <StoryPage
            story={story}
            totalStories={allStories.length}
            onNext={goNext}
            onPrev={goPrev}
            hasPrev={!isFirst}
            onOpenPicker={() => setShowPicker(true)}
            speakAll={handleSpeakAll}
            stop={handleStop}
            isSpeaking={isSpeaking}
            currentParagraphIdx={currentParagraphIdx}
            ambienceOn={effectiveAmbienceOn}
            onAmbienceToggle={toggleAmbience}
          />
        </div>

        {/* Patterns panel — right 45% */}
        <div style={{ flex: '0 0 45%', overflow: 'clip', height: '100%' }}>
          <PatternsPageV2
            story={story}
            totalStories={allStories.length}
            onPrev={goPrev}
            onNext={goNext}
            hasNext={!isLast}
            onOpenPicker={() => setShowPicker(true)}
            patternExamples={patternExamples}
            isActive={true}
          />
        </div>

        {/* Desktop story nav arrows */}
        {!isFirst && (
          <button
            type="button"
            aria-label="Previous story"
            onClick={goPrev}
            style={{
              position: 'fixed', left: 12, top: '50%', transform: 'translateY(-50%)',
              zIndex: 20, width: 36, height: 36, borderRadius: '50%',
              background: 'var(--pglass)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--pglass-border)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--pm)',
              transition: 'opacity 0.15s',
              opacity: 0.6,
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.6' }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} strokeWidth={2} />
          </button>
        )}
        {!isLast && (
          <button
            type="button"
            aria-label="Next story"
            onClick={goNext}
            style={{
              position: 'fixed', right: 12, top: '50%', transform: 'translateY(-50%)',
              zIndex: 20, width: 36, height: 36, borderRadius: '50%',
              background: 'var(--pglass)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--pglass-border)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--pm)',
              transition: 'opacity 0.15s',
              opacity: 0.6,
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.6' }}
          >
            <ChevronRight style={{ width: 16, height: 16 }} strokeWidth={2} />
          </button>
        )}

        {sharedPopups}
      </div>
    )
  }

  // ── Mobile: swipe rail layout ────────────────────────────────────────
  return (
    <div className="h-screen-stable flex flex-col overflow-hidden">

      {/* Sliding rail */}
      <div
        ref={railRef}
        className="flex flex-1 min-h-0"
        style={{
          width: '200%',
          transform: railTransform,
          transition: isDragging ? 'none' : 'transform 340ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: isDragging ? 'transform' : 'auto',
          touchAction: 'pan-y',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="h-full" style={{ width: '50%', overflow: 'clip' }}>
          <StoryPage
            story={story}
            totalStories={allStories.length}
            onNext={goNext}
            onPrev={goPrev}
            hasPrev={!isFirst}
            onOpenPicker={() => setShowPicker(true)}
            speakAll={handleSpeakAll}
            stop={handleStop}
            isSpeaking={isSpeaking}
            currentParagraphIdx={currentParagraphIdx}
            ambienceOn={effectiveAmbienceOn}
            onAmbienceToggle={toggleAmbience}
          />
        </div>

        <div className="h-full" style={{ width: '50%', overflow: 'clip' }}>
          <PatternsPageV2
            story={story}
            totalStories={allStories.length}
            onPrev={goPrev}
            onNext={goNext}
            hasNext={!isLast}
            onOpenPicker={() => setShowPicker(true)}
            patternExamples={patternExamples}
            isActive={view === 'patterns'}
          />
        </div>
      </div>

      {sharedPopups}
    </div>
  )
}
