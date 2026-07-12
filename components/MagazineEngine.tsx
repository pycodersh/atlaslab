'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useIsDesktop } from '@/hooks/useIsDesktop'

import { PatternsPageV2 } from '@/components/PatternsPageV2'
import { PatternsSectionInline } from '@/components/PatternsSectionInline'
import { StoryPage } from '@/components/StoryPage'
import { StoryCompletionScreen } from '@/components/StoryCompletionScreen'
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
import { getStoryRound, getRecallCount, completeStoryRound, getTodayRecommendedStoryId, type StoryRoundData } from '@/lib/srs/story-round'
import { useTheme } from '@/components/ThemeProvider'

// ── Session progress (resume mid-session) ────────────────────────────────────
type SessionProgress = { phase: 'patterns' | 'hide-recall'; recallRound: number }

function getSessionProgress(storyId: number): SessionProgress | null {
  if (typeof window === 'undefined') return null
  try { const v = localStorage.getItem(`patto-session-${storyId}`); return v ? JSON.parse(v) : null } catch { return null }
}
function saveSessionProgress(storyId: number, phase: SessionProgress['phase'], recallRound: number) {
  try { localStorage.setItem(`patto-session-${storyId}`, JSON.stringify({ phase, recallRound })) } catch {}
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
  const isDark = theme === 'dark'
  const { speakAll, stop, isSpeaking, currentParagraphIdx } = useSpeech()
  const { prefs } = usePreferences()
  const { play: playAmbience, stop: stopAmbience } = useAmbience()
  const { progress, setProgress } = useLearningProgress()

  // 위치 저장 — Continue Learning이 여기로 돌아올 수 있도록
  useEffect(() => { saveLastPosition(story.id, 'story') }, [story.id])
  const [showPicker, setShowPicker] = useState(false)

  // ── Story recommendation dialog ────────────────────────────────────────
  const [recoStoryId, setRecoStoryId] = useState<number | null>(null)

  useEffect(() => {
    const sessionKey = `patto-reco-dismissed-${story.id}`
    if (sessionStorage.getItem(sessionKey)) return
    const ids = allStories.map(s => s.id)
    const recId = getTodayRecommendedStoryId(ids)
    if (recId !== null && recId !== story.id) {
      setRecoStoryId(recId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.id])

  function dismissReco() {
    sessionStorage.setItem(`patto-reco-dismissed-${story.id}`, '1')
    setRecoStoryId(null)
  }

  // ── Study flow state (mobile only) ────────────────────────────────────
  type FlowPhase = 'reading' | 'patterns' | 'hide-recall' | 'complete'
  const [flowPhase,     setFlowPhase]     = useState<FlowPhase>('reading')
  const [scrolledToEnd, setScrolledToEnd] = useState(false)
  const [showSwipeGuide,setShowSwipeGuide]= useState(false)
  const [hideRecallRound,setHideRecallRound] = useState(1)
  const [toast,         setToast]         = useState<string | null>(null)
  const [completionData,setCompletionData]= useState<StoryRoundData | null>(null)
  const [patternIdx,    setPatternIdx]    = useState(0)
  // Exit interception popup
  const [exitPopupVisible,    setExitPopupVisible]    = useState(false)
  const [exitPopupPendingHref,setExitPopupPendingHref]= useState<string | null>(null)
  const shouldBlockNavRef = useRef(false)
  const mobileScrollRef = useRef<HTMLDivElement>(null)
  const patternSectionRef = useRef<HTMLDivElement>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevIsSpeakingRef = useRef(false)

  // SRS round for this story
  const [storyRoundData] = useState<StoryRoundData>(() => getStoryRound(story.id))
  const currentRound   = storyRoundData.round          // completed rounds so far
  const totalRecall    = getRecallCount(currentRound)  // recall rounds this session
  const isFirstRound   = currentRound === 0

  // Reset flow when story changes (restore session progress if available)
  useEffect(() => {
    const saved = getSessionProgress(story.id)
    if (saved) {
      setFlowPhase(saved.phase)
      setHideRecallRound(saved.recallRound)
      setScrolledToEnd(true)
    } else {
      setFlowPhase('reading')
      setScrolledToEnd(false)
      setHideRecallRound(1)
    }
    setShowSwipeGuide(false)
    setToast(null)
    setCompletionData(null)
    setPatternIdx(0)
    setExitPopupVisible(false)
    setExitPopupPendingHref(null)
  }, [story.id])

  function showToast(msg: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(msg)
    toastTimerRef.current = setTimeout(() => setToast(null), 2800)
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
      saveSessionProgress(story.id, 'patterns', 1)
    } else if (scrolledToEnd && !isFirstRound && flowPhase === 'reading') {
      setFlowPhase('patterns')
      saveSessionProgress(story.id, 'patterns', 1)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrolledToEnd])

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
        setExitPopupVisible(true)
        setExitPopupPendingHref(null)
      }
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [story.id])

  // Intercept tab-bar link clicks
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!shouldBlockNavRef.current) return
      const a = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null
      if (!a) return
      const href = a.getAttribute('href') ?? ''
      // Tab destinations: /patto/home, /patto/records, /patto/essays, /patto/library
      if (href.startsWith('/patto/') && !href.startsWith('/patto/stories')) {
        e.preventDefault()
        e.stopPropagation()
        setExitPopupPendingHref(href)
        setExitPopupVisible(true)
      }
    }
    document.addEventListener('click', handler, { capture: true })
    return () => document.removeEventListener('click', handler, { capture: true })
  }, [])

  // All patterns seen → show toast then start hide-recall automatically
  const handleAllPatternsSeen = useCallback(() => {
    if (flowPhase !== 'patterns') return
    saveSessionProgress(story.id, 'hide-recall', 1)
    if (isFirstRound) {
      showToast('이제 직접 따라말해볼게요 💪')
      setTimeout(() => {
        showToast('이제 직접 떠올려볼게요 💪')
        setFlowPhase('hide-recall')
      }, 2000)
    } else {
      setTimeout(() => setFlowPhase('hide-recall'), 600)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowPhase, isFirstRound, story.id])

  // Recall round complete
  const handleRecallRoundComplete = useCallback(() => {
    if (hideRecallRound < totalRecall) {
      const next = hideRecallRound + 1
      saveSessionProgress(story.id, 'hide-recall', next)
      const msgs = ['한 번 더 해볼게요 🔄', '마지막이에요! 끝까지 화이팅 🎯']
      showToast(msgs[next - 2] ?? '계속해봐요!')
      setTimeout(() => setHideRecallRound(next), 1600)
    } else {
      // All recall rounds done → complete
      clearSessionProgress(story.id)
      const data = completeStoryRound(story.id)
      setCompletionData(data)
      setFlowPhase('complete')
      // Also update legacy learning progress
      const patternIds = story.patterns.map(p => p.id)
      setProgress(completeStoryAndScheduleReview(progress, String(story.id), patternIds, 1, 1))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideRecallRound, totalRecall, story.id, story.patterns, progress, setProgress])

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

  function tryNavigate(href: string) {
    if (shouldBlockNavRef.current) {
      setExitPopupPendingHref(href)
      setExitPopupVisible(true)
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
  const isInRecall   = flowPhase === 'hide-recall'
  const isComplete   = flowPhase === 'complete'

  // 4회차+는 패턴 카드 뷰 없이 바로 hide-recall 시작
  const skipPatternView = currentRound >= 3  // round 4+ (0-indexed: completed>=3)

  const inlinePatterns = (
    <div ref={patternSectionRef}>
      {/* Section label */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '24px 16px 12px',
      }}>
        <div style={{ flex: 1, height: 0.5, background: 'rgba(142,167,255,0.2)' }} />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--pm)', textTransform: 'uppercase' }}>
          {isInRecall ? `Hide Recall · Round ${hideRecallRound}/${totalRecall}` : 'Patterns in this story'}
        </span>
        <div style={{ flex: 1, height: 0.5, background: 'rgba(142,167,255,0.2)' }} />
      </div>

      {isComplete && completionData ? (
        <StoryCompletionScreen
          story={story}
          roundData={completionData}
          recallRounds={totalRecall}
        />
      ) : (
        <PatternsSectionInline
          key={isInRecall ? `recall-${hideRecallRound}` : 'view'}
          story={story}
          patternExamples={patternExamples}
          storyIsSpeaking={isSpeaking}
          showNavButtons={false}
          showSwipeGuide={showSwipeGuide && !isInRecall}
          onAllPatternsSeen={!skipPatternView ? handleAllPatternsSeen : undefined}
          hideRecallMode={isInRecall}
          recallRound={hideRecallRound}
          totalRecallRounds={totalRecall}
          onRecallRoundComplete={handleRecallRoundComplete}
          onPatternIndexChange={setPatternIdx}
        />
      )}
    </div>
  )

  // Toast overlay
  const toastEl = toast ? (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      zIndex: 200, pointerEvents: 'none',
      background: 'rgba(26,26,46,0.88)', backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: 20, padding: '9px 18px',
      fontSize: 13, fontWeight: 600, color: '#fff',
      whiteSpace: 'nowrap', letterSpacing: '0.01em',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    }}>
      {toast}
    </div>
  ) : null

  const recoStory = recoStoryId ? allStories.find(s => s.id === recoStoryId) : null
  const recoDialogEl = recoStory ? (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300,
      padding: '0 16px 32px',
      background: 'linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 100%)',
      pointerEvents: 'none',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(30,40,60,0.18)',
        padding: '18px 18px 16px',
        pointerEvents: 'auto',
      }}>
        <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.45 }}>
          오늘 추천 스토리는 <span style={{ fontWeight: 800, color: '#5B7FD4' }}>Story {String(recoStory.id).padStart(2, '0')}</span>이에요!<br />
          <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.5)' }}>그래도 계속할까요?</span>
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => { dismissReco(); router.push(`/patto/stories/${recoStory.id}`) }}
            style={{
              flex: 1, height: 44, borderRadius: 12, cursor: 'pointer',
              background: '#5B7FD4', border: 'none',
              fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'inherit',
            }}
          >
            추천 스토리로 가기
          </button>
          <button
            type="button"
            onClick={dismissReco}
            style={{
              flex: 1, height: 44, borderRadius: 12, cursor: 'pointer',
              background: 'transparent',
              border: '1px solid rgba(0,0,0,0.12)',
              fontSize: 13, fontWeight: 600, color: '#1a1a2e', fontFamily: 'inherit',
            }}
          >
            여기서 계속
          </button>
        </div>
      </div>
    </div>
  ) : null

  // ── Exit popup message by phase ─────────────────────────────────────
  function getExitMsg(): { title: string; sub: string } {
    if (isSpeaking) return {
      title: '듣기가 완료되지 않았어요! 🎧',
      sub: '끝까지 들으면 발음이 훨씬 자연스러워져요',
    }
    if (flowPhase === 'reading') return {
      title: '아직 스토리를 다 읽지 않았어요! 📖',
      sub: '조금만 더 읽으면 패턴 학습으로 넘어가요',
    }
    if (flowPhase === 'patterns') {
      const remaining = story.patterns.length - patternIdx
      return {
        title: `패턴 ${remaining}개 남았어요! 거의 다 왔어요 💪`,
        sub: `${story.patterns.length}개 패턴을 모두 확인해야 다음 단계로 가요`,
      }
    }
    // hide-recall
    const remaining = totalRecall - hideRecallRound + 1
    return {
      title: `${remaining}라운드만 더 하면 오늘 학습 완료예요! 🎯`,
      sub: '조금만 더 힘내요, 거의 다 했어요!',
    }
  }

  const exitMsg = getExitMsg()

  function handleExitConfirm() {
    setExitPopupVisible(false)
    handleStop()
    if (exitPopupPendingHref) {
      router.push(exitPopupPendingHref)
    } else {
      router.push('/patto/home')
    }
  }

  const sheetBg = isDark ? 'rgba(22,18,46,0.97)' : 'rgba(255,255,255,0.94)'
  const textPri = isDark ? 'rgba(255,255,255,0.95)' : '#1a1a2e'
  const textSec = isDark ? 'rgba(255,255,255,0.52)' : 'rgba(60,60,100,0.62)'

  const exitPopupEl = exitPopupVisible ? (
    <>
      <div
        onClick={() => setExitPopupVisible(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(20,16,50,0.50)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 401,
        background: sheetBg,
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        borderRadius: '24px 24px 0 0',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.85)'}`,
        boxShadow: '0 -8px 40px rgba(20,16,50,0.22)',
        padding: `24px 20px calc(36px + env(safe-area-inset-bottom, 0px))`,
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 99,
          background: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(142,167,255,0.22)',
          margin: '0 auto 20px',
        }} />
        <h3 style={{
          margin: '0 0 6px', fontSize: 17, fontWeight: 800,
          color: textPri, lineHeight: 1.3, letterSpacing: '-0.01em',
        }}>
          {exitMsg.title}
        </h3>
        <p style={{
          margin: '0 0 20px', fontSize: 13, lineHeight: 1.6,
          color: textSec, fontWeight: 400,
        }}>
          {exitMsg.sub}
        </p>
        <button
          type="button"
          onClick={() => setExitPopupVisible(false)}
          style={{
            width: '100%', height: 50, borderRadius: 16, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #6B8FFF 0%, #B8A8F0 100%)',
            fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'inherit',
            boxShadow: '0 4px 20px rgba(107,143,255,0.38)',
            marginBottom: 8,
          }}
        >
          계속 학습하기
        </button>
        <button
          type="button"
          onClick={handleExitConfirm}
          style={{
            width: '100%', height: 44, borderRadius: 14, border: 'none', cursor: 'pointer',
            background: 'transparent', fontSize: 14, fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(80,80,120,0.42)',
            fontFamily: 'inherit',
          }}
        >
          나갈게요
        </button>
      </div>
    </>
  ) : null

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
      />
      {toastEl}
      {recoDialogEl}
      {exitPopupEl}
      {sharedPopups}
    </div>
  )
}
