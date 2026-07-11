'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useIsDesktop } from '@/hooks/useIsDesktop'

import { PatternsPageV2 } from '@/components/PatternsPageV2'
import { PatternsSectionInline } from '@/components/PatternsSectionInline'
import { StoryPage } from '@/components/StoryPage'
import { WheelPicker } from '@/components/WheelPicker'
import { GlobalSavePopup } from '@/components/GlobalSavePopup'
import { TodayMissionPopup } from '@/components/TodayMissionPopup'

import { useSpeech } from '@/hooks/useSpeech'
import { useAmbience } from '@/hooks/useAmbience'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useLearningProgress } from '@/hooks/useLearningProgress'
import type { AmbienceId } from '@/types/magazine'
import { ambienceGain, type VoiceKey } from '@/lib/settings/preferences'
import type { MagazineStory } from '@/types/magazine'
import { saveLastPosition } from '@/lib/last-position'
import { completeStoryAndScheduleReview } from '@/lib/learning-progress'
import type { PracticeExample } from '@/data/pattern-examples'

type MagazineEngineProps = {
  story: MagazineStory
  allStories: MagazineStory[]
  initialView?: 'story' | 'patterns'
  patternExamples?: Record<string, PracticeExample[]>
}

export function MagazineEngine({ story, allStories, patternExamples }: MagazineEngineProps) {
  const router = useRouter()
  const isDesktop = useIsDesktop()
  const { speakAll, stop, isSpeaking, currentParagraphIdx } = useSpeech()
  const { prefs } = usePreferences()
  const { play: playAmbience, stop: stopAmbience } = useAmbience()
  const { progress, setProgress } = useLearningProgress()

  // 위치 저장 — Continue Learning이 여기로 돌아올 수 있도록
  useEffect(() => { saveLastPosition(story.id, 'story') }, [story.id])
  const [showPicker, setShowPicker] = useState(false)

  // Story 변경 시 per-story override 초기화
  const [ambienceOverride, setAmbienceOverride] = useState<boolean | null>(null)
  useEffect(() => {
    setAmbienceOverride(null)
  }, [story.id])  // eslint-disable-line react-hooks/exhaustive-deps

  const effectiveAmbienceOn = ambienceOverride ?? (prefs.ambienceDefault === 'on')
  const userVolume = ambienceGain(prefs.ambienceVolume ?? 50)

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

  // 스토리 음성 완료 처리
  const storyRef = useRef(story)
  useEffect(() => { storyRef.current = story }, [story])
  const progressRef = useRef(progress)
  useEffect(() => { progressRef.current = progress }, [progress])

  const handleStoryComplete = useCallback(() => {
    const s = storyRef.current
    const p = progressRef.current
    const patternIds = s.patterns.map(pat => pat.id)
    setProgress(completeStoryAndScheduleReview(p, String(s.id), patternIds, 1, 1))
  }, [setProgress])

  // 낭독 시작 시 환경음도 같이 시작 (활성화 상태일 때)
  const handleSpeakAll = useCallback((
    texts: string[],
    audioUrls?: (string | null | undefined)[],
    opts?: { voiceKey?: VoiceKey; voiceKeys?: VoiceKey[] },
  ) => {
    if (effectiveAmbienceOn && story.ambienceId && !story.sceneVideo) {
      playAmbience(story.ambienceId as AmbienceId, userVolume)
    }
    speakAll(texts, audioUrls, { ...opts, onEnd: handleStoryComplete })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveAmbienceOn, story.ambienceId, story.sceneVideo, userVolume, speakAll, handleStoryComplete])

  // 낭독 중단 시 환경음도 함께 중단
  const handleStop = useCallback(() => {
    stop()
    stopAmbience()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop])

  // ── Navigation ──────────────────────────────────────────────────────
  const allStoriesRef = useRef(allStories)
  useEffect(() => { allStoriesRef.current = allStories }, [allStories])

  function goToStory(id: number) {
    handleStop()
    router.push(`/patto/stories/${id}`)
  }

  function goNext() {
    const next = allStories.find(s => s.id === story.id + 1)
    if (next) goToStory(next.id)
  }

  function goPrev() {
    const prev = allStories.find(s => s.id === story.id - 1)
    if (prev) goToStory(prev.id)
  }

  const isFirst = story.id <= 1
  const isLast  = story.id >= allStories.length

  // ── Mobile story-zone swipe ──────────────────────────────────────────
  const storyTouchStartX = useRef(0)
  const storyTouchStartY = useRef(0)

  function handleStoryTouchStart(e: React.TouchEvent) {
    storyTouchStartX.current = e.touches[0].clientX
    storyTouchStartY.current = e.touches[0].clientY
  }

  function handleStoryTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - storyTouchStartX.current
    const dy = e.changedTouches[0].clientY - storyTouchStartY.current
    // Only act on clearly horizontal swipes
    if (Math.abs(dy) >= Math.abs(dx) || Math.abs(dx) < 40) return
    const THRESHOLD = (typeof window !== 'undefined' ? window.innerWidth : 375) * 0.2
    if (dx < -THRESHOLD) {
      const next = allStoriesRef.current.find(x => x.id === story.id + 1)
      if (next) { handleStop(); router.push(`/patto/stories/${next.id}`) }
    } else if (dx > THRESHOLD) {
      const prev = allStoriesRef.current.find(x => x.id === story.id - 1)
      if (prev) { handleStop(); router.push(`/patto/stories/${prev.id}`) }
    }
  }

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

  // ── Mobile: single scroll — story then patterns inline ──────────────
  const inlinePatterns = (
    <PatternsSectionInline
      story={story}
      patternExamples={patternExamples}
      storyIsSpeaking={isSpeaking}
      showNavButtons={false}
    />
  )

  return (
    <div style={{ height: '100dvh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' as never }}>
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
        noScroll={true}
        afterContent={inlinePatterns}
        onStoryAreaTouchStart={handleStoryTouchStart}
        onStoryAreaTouchEnd={handleStoryTouchEnd}
      />
      {sharedPopups}
    </div>
  )
}
