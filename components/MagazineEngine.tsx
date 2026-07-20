'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, CheckCircle, Home } from 'lucide-react'
import { useIsDesktop } from '@/hooks/useIsDesktop'

import { PatternsPageV2 } from '@/components/PatternsPageV2'
import { PatternsSectionInline } from '@/components/PatternsSectionInline'
import { StoryPage } from '@/components/StoryPage'
import { WheelPicker } from '@/components/WheelPicker'
import { GlobalSavePopup } from '@/components/GlobalSavePopup'

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
import { getStoryRound, completeStoryRound, type StoryRoundData } from '@/lib/srs/story-round'
import { getStorySessionState, updateStorySessionState } from '@/lib/srs/story-session'
import { useTheme } from '@/components/ThemeProvider'
import { useT } from '@/hooks/useT'
import { StoryProgressTracker } from '@/components/StoryProgressTracker'
import { useTrainerSafe } from '@/contexts/TrainerContext'
import { ChallengeMode } from '@/components/ChallengeMode'

// ── Session progress (resume mid-session) ────────────────────────────────────
type SessionProgress = { phase: 'patterns' }

function getSessionProgress(storyId: number): SessionProgress | null {
  if (typeof window === 'undefined') return null
  try { const v = localStorage.getItem(`patto-session-${storyId}`); return v ? JSON.parse(v) : null } catch { return null }
}
function saveSessionProgress(storyId: number) {
  try { localStorage.setItem(`patto-session-${storyId}`, JSON.stringify({ phase: 'patterns' })) } catch {}
}
function clearSessionProgress(storyId: number) {
  try { localStorage.removeItem(`patto-session-${storyId}`) } catch {}
}

type MagazineEngineProps = {
  story: MagazineStory
  allStories: MagazineStory[]
  initialView?: 'story' | 'patterns'
  patternExamples?: Record<string, PracticeExample[]>
}

export function MagazineEngine({ story, allStories, patternExamples }: MagazineEngineProps) {
  const router = useRouter()
  const isDesktop = useIsDesktop()
  const { theme } = useTheme()
  const t = useT()
  const isDark = theme === 'dark'
  const { speakAll, stop, isSpeaking, currentParagraphIdx } = useSpeech()
  const { prefs } = usePreferences()
  const { play: playAmbience, stop: stopAmbience } = useAmbience()
  const { progress, setProgress } = useLearningProgress()
  const trainer = useTrainerSafe()

  // 위치 저장 — Continue Learning이 여기로 돌아올 수 있도록
  useEffect(() => { saveLastPosition(story.id, 'story') }, [story.id])
  const [showPicker, setShowPicker] = useState(false)

  // ── Study flow state (mobile only) ────────────────────────────────────
  type FlowPhase = 'reading' | 'patterns' | 'complete'
  const [flowPhase,     setFlowPhase]     = useState<FlowPhase>('reading')
  const [scrolledToEnd, setScrolledToEnd] = useState(false)
  const [showSwipeGuide,setShowSwipeGuide]= useState(false)
  const [patternShowKo, setPatternShowKo] = useState(false)
  const [patternShowEn, setPatternShowEn] = useState(true)
  function handleStudyModeChange(mode: 'en' | 'en-ko' | 'ko') {
    setPatternShowKo(mode === 'en-ko' || mode === 'ko')
    setPatternShowEn(mode !== 'ko')
  }
  const [completionData,setCompletionData]= useState<StoryRoundData | null>(null)
  const [patternIdx,    setPatternIdx]    = useState(0)
  const [exitPopupPendingHref,setExitPopupPendingHref]= useState<string | null>(null)
  const shouldBlockNavRef = useRef(false)
  const trainerRef = useRef(trainer)
  const mobileScrollRef = useRef<HTMLDivElement>(null)
  const patternSectionRef = useRef<HTMLDivElement>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevIsSpeakingRef = useRef(false)
  const trainerGreetedRef = useRef(false)

  // SRS round for this story
  const [storyRoundData] = useState<StoryRoundData>(() => getStoryRound(story.id))
  const currentRound   = storyRoundData.round          // completed rounds so far
  const isFirstRound   = currentRound === 0

  // Session-level listening/reading state (persisted per story+round)
  const [sessionState, setSessionState] = useState(() =>
    getStorySessionState(story.id, storyRoundData.round)
  )

  // Reset flow when story changes (restore session progress if available)
  useEffect(() => {
    const saved = getSessionProgress(story.id)
    if (saved) {
      setFlowPhase(saved.phase)
      setScrolledToEnd(true)
    } else {
      setFlowPhase('reading')
      setScrolledToEnd(false)
    }
    setShowSwipeGuide(false)
    setCompletionData(null)
    setPatternIdx(0)
    setExitPopupPendingHref(null)
    storyCompletedRef.current = false
    isStoreDoneEffectRanRef.current = false
    setStoryCelebrated(false)
    trainerGreetedRef.current = false
    trainer?.setPage?.('story')
    trainer?.clearMessage?.()
    setSessionState(getStorySessionState(story.id, getStoryRound(story.id).round))
  }, [story.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Trainer helper — sends message only on mobile (trainer is UI-only, desktop skips)
  function trainerSay(msg: string, ms = 2500) {
    if (!isDesktop) trainer?.showMessage(msg, ms)
  }

  // Scroll-to-end detection (mobile container)
  useEffect(() => {
    const el = mobileScrollRef.current
    if (!el || isDesktop) return
    const onScroll = () => {
      const patEl = patternSectionRef.current
      if (!patEl || scrolledToEnd) return
      const patTop = patEl.getBoundingClientRect().top
      if (patTop < window.innerHeight * 0.75) {
        setScrolledToEnd(true)
      }
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [isDesktop, scrolledToEnd])

  // When patterns section reached → show swipe guide (1회차)
  useEffect(() => {
    if (scrolledToEnd && isFirstRound && flowPhase === 'reading') {
      setFlowPhase('patterns')
      setShowSwipeGuide(true)
      saveSessionProgress(story.id)
    } else if (scrolledToEnd && !isFirstRound && flowPhase === 'reading') {
      setFlowPhase('patterns')
      saveSessionProgress(story.id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrolledToEnd])

  // ── Trainer: "Ready?" on mount, then "Read." hint for 1회차 ──────────────
  useEffect(() => {
    if (isDesktop || trainerGreetedRef.current) return
    trainerGreetedRef.current = true
    const t1 = setTimeout(() => trainerSay('Ready?', 2000), 800)
    // For 1회차: show "Read." after Ready? fades as a scroll hint
    const t2 = isFirstRound
      ? setTimeout(() => trainerSay('Read.', 3000), 3500)
      : null
    return () => { clearTimeout(t1); if (t2) clearTimeout(t2) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.id])

  // ── Trainer: silence while audio plays; "Your turn." / "Listen." on end ──
  useEffect(() => {
    if (isDesktop) return
    if (isSpeaking) {
      trainer?.setSilent(true)
    } else {
      trainer?.setSilent(false)
      if (prevIsSpeakingRef.current) {
        // Audio just finished
        if (currentRound < 3 && flowPhase === 'reading') {
          // Round 1-2: audio finished before scroll → show "Your turn."
          trainerSay('Your turn.', 2000)
        } else if (currentRound < 3 && flowPhase === 'patterns') {
          trainerSay('Your turn.', 2000)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpeaking])

  // ── Trainer: scroll done — show "Listen." for round 1-2 ──────────────────
  useEffect(() => {
    if (isDesktop || !scrolledToEnd) return
    if (!isSpeaking) {
      if (currentRound < 2) {
        trainerSay('Listen.', 2500)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrolledToEnd])

  // ── Trainer: flowPhase changes ────────────────────────────────────────────
  useEffect(() => {
    if (isDesktop) return
    if (flowPhase === 'complete') {
      trainer?.triggerPulse()
      const t1 = setTimeout(() => trainerSay('Great work today.', 2000), 300)
      const t2 = setTimeout(() => trainerSay('Done.', 3000), 2500)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowPhase])

  // Keep shouldBlockNav ref in sync
  useEffect(() => {
    const hasProgress = isSpeaking || scrolledToEnd || flowPhase !== 'reading'
    shouldBlockNavRef.current = hasProgress && flowPhase !== 'complete'
  }, [isSpeaking, scrolledToEnd, flowPhase])

  // 1회차: 오디오 완료 시 패턴 섹션으로 자동 스크롤
  useEffect(() => {
    if (!isDesktop && prevIsSpeakingRef.current && !isSpeaking && isFirstRound && flowPhase === 'reading') {
      setTimeout(() => {
        patternSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 400)
    }
    prevIsSpeakingRef.current = isSpeaking
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpeaking])

  // Intercept browser back button
  useEffect(() => {
    // Push a sentinel so the first back-press fires popstate instead of leaving
    window.history.pushState(null, '', window.location.href)
    const handler = () => {
      if (shouldBlockNavRef.current) {
        window.history.pushState(null, '', window.location.href)
        showExitCard(null)
      }
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [story.id])

  // Keep trainerRef current so the click handler below sees the live value
  useEffect(() => { trainerRef.current = trainer }, [trainer])

  // Intercept tab-bar link clicks
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!shouldBlockNavRef.current) return
      const a = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null
      if (!a) return
      const href = a.getAttribute('href') ?? ''
      // Tab destinations: /patto/home, /patto/records, /patto/essays, /patto/library
      if (href.startsWith('/patto/') && !href.startsWith('/patto/stories')) {
        // TrainerProvider가 없으면 exit dialog를 표시할 수 없으므로 바로 통과
        if (!trainerRef.current) return
        e.preventDefault()
        e.stopPropagation()
        showExitCard(href)
      }
    }
    document.addEventListener('click', handler, { capture: true })
    return () => document.removeEventListener('click', handler, { capture: true })
  }, [])

  // When flowPhase reaches 'patterns', clear session progress (no more auto-advance)
  useEffect(() => {
    if (flowPhase !== 'patterns') return
    clearSessionProgress(story.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowPhase, story.id])

  const handleAllPatternsSeen = useCallback(() => {}, [])

  // L + R×2 + C 모두 완료 시 story round 완료 처리
  const isStoreDone =
    sessionState.listeningCompleted &&
    sessionState.readingCount >= 2 &&
    sessionState.challengeCompleted

  // "Story complete" UI는 이번 세션에서 실제로 완료한 경우에만 표시
  // (localStorage stale 데이터로 인한 마운트 즉시 표시 방지)
  const [storyCelebrated, setStoryCelebrated] = useState(false)
  const storyCompletedRef = useRef(false)
  const isStoreDoneEffectRanRef = useRef(false)
  useEffect(() => {
    // 첫 번째 effect 실행(마운트)은 건너뜀 — stale localStorage 방어
    if (!isStoreDoneEffectRanRef.current) {
      isStoreDoneEffectRanRef.current = true
      return
    }
    if (!isStoreDone || storyCompletedRef.current) return
    storyCompletedRef.current = true
    setStoryCelebrated(true)
    trainerSay('Great work today.', 1500)
    const data = completeStoryRound(story.id)
    setCompletionData(data)
    const patternIds = story.patterns.map(p => p.id)
    setProgress(completeStoryAndScheduleReview(progressRef.current, String(story.id), patternIds, 1, 1))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStoreDone])

  // Challenge complete → mark session; isStoreDone effect가 최종 완료 처리
  const handleChallengeComplete = useCallback(() => {
    const next = updateStorySessionState(story.id, storyRoundData.round, { challengeCompleted: true })
    setSessionState(next)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.id, storyRoundData.round])

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
    // Mark listening completed in session (cap: max 1)
    const roundData = getStoryRound(s.id)
    const next = updateStorySessionState(s.id, roundData.round, { listeningCompleted: true })
    setSessionState(next)
  }, [setProgress])

  // 낭독 시작 시 환경음도 같이 시작 (활성화 상태일 때)
  const handleSpeakAll = useCallback((
    texts: string[],
    audioUrls?: (string | null | undefined)[],
    opts?: { voiceKey?: VoiceKey; voiceKeys?: VoiceKey[]; onEnd?: () => void; fromStart?: boolean },
  ) => {
    if (effectiveAmbienceOn && story.ambienceId && !story.sceneVideo) {
      playAmbience(story.ambienceId as AmbienceId, userVolume)
    }
    const composedOnEnd = opts?.fromStart
      ? () => { opts?.onEnd?.(); handleStoryComplete() }
      : opts?.onEnd
    speakAll(texts, audioUrls, { ...opts, onEnd: composedOnEnd })
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

  function tryNavigate(href: string) {
    if (shouldBlockNavRef.current) {
      showExitCard(href)
    } else {
      handleStop()
      router.push(href)
    }
  }

  function goToStory(id: number) {
    tryNavigate(`/patto/stories/${id}`)
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
      if (next) tryNavigate(`/patto/stories/${next.id}`)
    } else if (dx > THRESHOLD) {
      const prev = allStoriesRef.current.find(x => x.id === story.id - 1)
      if (prev) tryNavigate(`/patto/stories/${prev.id}`)
    }
  }

  const sharedPopups = (
    <>
      <GlobalSavePopup />
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

  // ── Mobile: single scroll — story then patterns + challenge inline ────
  const lrDone = sessionState.listeningCompleted && sessionState.readingCount >= 2

  const sectionDivider = (label: string) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0 16px',
      marginTop: 48, marginBottom: 40,
    }}>
      <div style={{ flex: 1, height: 0.5, background: 'rgba(142,167,255,0.2)' }} />
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--pm)', textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 0.5, background: 'rgba(142,167,255,0.2)' }} />
    </div>
  )

  const inlinePatterns = (
    <div ref={patternSectionRef}>
      {sectionDivider('Patterns in this story')}

      <PatternsSectionInline
        key="view"
        story={story}
        patternExamples={patternExamples}
        storyIsSpeaking={isSpeaking}
        showNavButtons={false}
        showSwipeGuide={showSwipeGuide}
        onAllPatternsSeen={handleAllPatternsSeen}
        onPatternIndexChange={setPatternIdx}
        patternSectionRef={patternSectionRef}
        showKorean={patternShowKo}
        showEnglish={patternShowEn}
      />

      {sectionDivider('Study Record')}

      <StoryProgressTracker
        story={story}
        round={storyRoundData.round}
        listeningCompleted={sessionState.listeningCompleted}
        readingCount={Math.min(2, sessionState.readingCount)}
        onReadingCheck={(newCount) =>
          setSessionState(prev => ({ ...prev, readingCount: Math.min(2, newCount) }))
        }
      />

      {sectionDivider('Challenges in this story')}

      {!lrDone ? (
        <>
          <p style={{
            textAlign: 'center', padding: '16px 0',
            fontSize: 13, color: 'var(--text-muted)',
            margin: 0,
          }}>
            {t('challenge_locked')}
          </p>
          <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
            <ChallengeMode
              patterns={story.patterns}
              storyId={story.id}
              onComplete={handleChallengeComplete}
            />
          </div>
        </>
      ) : (
        <ChallengeMode
          patterns={story.patterns}
          storyId={story.id}
          onComplete={handleChallengeComplete}
        />
      )}

      {/* ── Story Complete section ── */}
      {storyCelebrated && (
        <div style={{
          margin: '32px 16px 40px',
          background: '#F0FDF4',
          border: '1px solid #86EFAC',
          borderRadius: 16,
          padding: '20px 16px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 12,
        }}>
          <CheckCircle style={{ width: 32, height: 32, color: '#22C55E' }} strokeWidth={1.8} />
          <p style={{ margin: 0, fontSize: 17, fontWeight: 500, color: 'var(--text-primary)' }}>
            Story complete
          </p>
          {!isLast ? (
            <button
              type="button"
              onClick={goNext}
              style={{
                width: '100%', background: '#1E293B', color: '#ffffff',
                border: 'none', borderRadius: 14, padding: '11px',
                fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Next story →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => tryNavigate('/patto/home')}
              style={{
                width: '100%', background: '#1E293B', color: '#ffffff',
                border: 'none', borderRadius: 14, padding: '11px',
                fontSize: 14, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              Done for today
              <Home style={{ width: 16, height: 16 }} strokeWidth={2} />
            </button>
          )}
        </div>
      )}
    </div>
  )


  function showExitCard(href: string | null) {
    // ORB/Trainer가 없으면 바로 이동 (trainer 없으면 dialog 표시 불가)
    if (!trainer) {
      handleStop()
      router.push(href ?? '/patto/home')
      return
    }
    setExitPopupPendingHref(href)
    trainer.ask('One more.', [
      {
        label: 'Exit',
        onClick: () => {
          handleStop()
          router.push(href ?? '/patto/home')
        },
      },
      {
        label: 'Keep going',
        primary: true,
        onClick: () => { /* card closes automatically */ },
      },
    ])
  }

  return (
    <div
      ref={mobileScrollRef}
      style={{ height: '100dvh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' as never }}
    >
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
        showReadingGuide={isFirstRound && flowPhase === 'reading' && !scrolledToEnd}
        audioPulse={isFirstRound && !isSpeaking && flowPhase === 'reading'}
        onStudyModeChange={handleStudyModeChange}
        patternSectionRef={patternSectionRef}
      />
      {sharedPopups}
    </div>
  )
}
