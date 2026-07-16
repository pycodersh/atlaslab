'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ttsProvider,
  storyParaAudioUrl,
  patternExampleAudioUrl,
  getPitchForKey,
} from '@/lib/tts'
import { RATE_MAP } from '@/lib/settings/preferences'
import { usePreferences } from '@/contexts/PreferencesContext'
import { getPatternExamples } from '@/data/pattern-examples'
import { shimmerExamples } from '@/data/shimmer-audio-meta'
import { completeStoryRound } from '@/lib/srs/story-round'
import { syncStoryRoundToSupabase } from '@/lib/srs/supabase-sync'
import { completeStoryAndScheduleReview } from '@/lib/learning-progress'
import { useLearningProgress } from '@/hooks/useLearningProgress'
import { useAuth } from '@/contexts/AuthContext'
import type { MagazineStory } from '@/types/magazine'

// ── Constants ────────────────────────────────────────────────────────────────
// All timing values are named constants — no raw magic numbers in logic

const PATTERN_EXAMPLE_WAIT_MS = 2000  // User speaking wait after each example audio
const STORY_ADVANCE_DELAY_MS  = 500   // Wait after story paragraph audio ends before advancing
const TRANSITION_MS           = 300   // Content fade duration (also audio fade-out on swipe-next)
const COMPLETE_EXIT_DELAY_MS  = 2500  // Auto-navigate back after completion screen

// ── Position persistence (sessionStorage) ───────────────────────────────────
// Saves last reached position so abnormal exits can resume from the same point.

type FocusSavedPos = {
  phase:      'story' | 'pattern'
  paraIdx:    number
  patternIdx: number
  exIdx:      number
}

function posKey(storyId: number) { return `fm_pos_${storyId}` }

function loadPos(storyId: number): FocusSavedPos | null {
  try {
    const raw = sessionStorage.getItem(posKey(storyId))
    return raw ? (JSON.parse(raw) as FocusSavedPos) : null
  } catch { return null }
}

function savePos(storyId: number, pos: FocusSavedPos) {
  try { sessionStorage.setItem(posKey(storyId), JSON.stringify(pos)) } catch {}
}

function clearPos(storyId: number) {
  try { sessionStorage.removeItem(posKey(storyId)) } catch {}
}

// ── Types ────────────────────────────────────────────────────────────────────

// State machine — matches the scenario table exactly.
// No extra states beyond what the table specifies.
type FocusState =
  | 'loading'          // Audio loading → all input blocked
  | 'story-playing'    // Story paragraph audio playing
  | 'paused'           // Audio paused, orb menu shown
  | 'transition'       // Content fade in progress → all input blocked
  | 'pattern-ready'    // Pattern displayed, waiting for user tap
  | 'pattern-playing'  // Pattern example audio playing
  | 'complete'         // All content finished

type ExItem = { en: string; ko: string }

function getExamples(pat: MagazineStory['patterns'][0]): ExItem[] {
  const fromData = getPatternExamples(pat.id)
  if (fromData.length > 0) return fromData.slice(0, 3)
  const r: ExItem[] = []
  if (pat.storySentence)    r.push({ en: pat.storySentence,    ko: pat.storySentenceKo    ?? '' })
  if (pat.variationSentence) r.push({ en: pat.variationSentence, ko: pat.variationSentenceKo ?? '' })
  return r.slice(0, 3)
}

// ── Component ────────────────────────────────────────────────────────────────

export type FocusModeProps = { story: MagazineStory }

export function FocusMode({ story }: FocusModeProps) {
  const router       = useRouter()
  const { user }     = useAuth()
  const { prefs }    = usePreferences()
  const { setProgress } = useLearningProgress()
  const voice        = story.narratorVoice ?? prefs.voice

  // ── UI state ────────────────────────────────────────────────────────────

  const [focusState,    setFocusState]    = useState<FocusState>('loading')
  const [phase,         setPhase]         = useState<'story' | 'pattern'>('story')
  const [paraIdx,       setParaIdx]       = useState(0)
  const [patternIdx,    setPatternIdx]    = useState(0)
  const [exIdx,         setExIdx]         = useState(0)
  const [showOrbMenu,   setShowOrbMenu]   = useState(false)
  const [contentVisible, setContentVisible] = useState(true)

  // ── Refs (stable across renders for use inside async callbacks) ──────────

  const focusStateRef        = useRef<FocusState>('loading')
  const phaseRef             = useRef<'story' | 'pattern'>('story')
  const paraIdxRef           = useRef(0)
  const patternIdxRef        = useRef(0)
  const exIdxRef             = useRef(0)
  const stateBeforePauseRef  = useRef<'story-playing' | 'pattern-playing'>('story-playing')
  const timerRef             = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressSavedRef     = useRef(false)
  // Transition guard: blocks repeated inputs — only first triggers, rest ignored
  const inTransitionRef      = useRef(false)

  // ── Sync helpers ─────────────────────────────────────────────────────────

  function setFocusStateSync(s: FocusState) {
    focusStateRef.current = s
    setFocusState(s)
  }

  function setPhaseSync(p: 'story' | 'pattern') {
    phaseRef.current = p
    setPhase(p)
  }

  function clearTimer() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }

  // ── Progress save ─────────────────────────────────────────────────────────
  // completeStoryRound is idempotent (guards on lastCompletedAt === today),
  // so calling it twice on the same day (e.g. after a restored session) is safe.

  function saveProgress() {
    if (progressSavedRef.current) return
    progressSavedRef.current = true
    const data       = completeStoryRound(story.id)
    const patternIds = story.patterns.map(p => p.id)
    setProgress(prev => completeStoryAndScheduleReview(prev, String(story.id), patternIds, 1, 1))
    if (user?.id) syncStoryRoundToSupabase(user.id, data)
  }

  // ── Transition (0.3s content fade) ───────────────────────────────────────
  // Spec: Transition 연속 입력 시 첫 번째만 처리, 나머지 무시
  // Enforced by inTransitionRef: the ref is set before the timeout and cleared
  // inside the callback — any concurrent call sees inTransitionRef.current = true
  // and returns immediately.

  function doTransitionTo(cb: () => void) {
    if (inTransitionRef.current) return   // Consecutive input: ignore (spec: 무시)
    inTransitionRef.current = true
    setFocusStateSync('transition')
    setContentVisible(false)
    clearTimer()
    timerRef.current = setTimeout(() => {
      inTransitionRef.current = false
      cb()
      setContentVisible(true)
    }, TRANSITION_MS)
  }

  // ── Story playback ────────────────────────────────────────────────────────

  function playStoryPara(idx: number) {
    const para = story.paragraphs[idx]
    if (!para) return
    paraIdxRef.current = idx
    setParaIdx(idx)
    setFocusStateSync('loading')
    // Save position immediately — if user exits here, we resume at this paragraph
    savePos(story.id, { phase: 'story', paraIdx: idx, patternIdx: 0, exIdx: 0 })

    const url = storyParaAudioUrl(voice, story.id, para.id, para.english)
    ttsProvider.speak({
      texts:     [para.english],
      audioUrls: url ? [url] : undefined,
      voiceKey:  voice,
      voiceKeys: [voice],
      rate:      RATE_MAP[prefs.speechRate],
      pitch:     getPitchForKey(voice),
      volume:    1.0,
      onStart: () => {
        // loading → story-playing once audio actually starts
        if (focusStateRef.current === 'loading') setFocusStateSync('story-playing')
      },
      onEnd: () => {
        if (focusStateRef.current !== 'story-playing') return
        clearTimer()
        timerRef.current = setTimeout(() => {
          const next = paraIdxRef.current + 1
          if (next >= story.paragraphs.length) {
            // Story complete → save progress immediately (spec: Progress 즉시 저장)
            saveProgress()
            doTransitionTo(() => {
              patternIdxRef.current = 0
              exIdxRef.current      = 0
              setPatternIdx(0)
              setExIdx(0)
              setPhaseSync('pattern')
              setFocusStateSync('pattern-ready')
              savePos(story.id, { phase: 'pattern', paraIdx: paraIdxRef.current, patternIdx: 0, exIdx: 0 })
            })
          } else {
            doTransitionTo(() => playStoryPara(next))
          }
        }, STORY_ADVANCE_DELAY_MS)
      },
      // ttsProvider handles DB→TTS fallback internally; onError fires only if both fail
      onError: () => {
        if (focusStateRef.current === 'loading') setFocusStateSync('story-playing')
      },
    })
  }

  // ── Pattern playback ──────────────────────────────────────────────────────

  function playPatternExample(pIdx: number, eIdx: number) {
    const pat = story.patterns[pIdx]
    if (!pat) { finishFocusMode(); return }
    const examples = getExamples(pat)
    const ex       = examples[eIdx]
    if (!ex)  { advancePattern(pIdx); return }

    patternIdxRef.current = pIdx
    exIdxRef.current      = eIdx
    setPatternIdx(pIdx)
    setExIdx(eIdx)
    setFocusStateSync('loading')
    // Save position so resume starts at this exact example
    savePos(story.id, { phase: 'pattern', paraIdx: paraIdxRef.current, patternIdx: pIdx, exIdx: eIdx })

    const shimmerEx = shimmerExamples[`${pat.id}-ex${eIdx + 1}`]
    const url       = shimmerEx?.url ?? patternExampleAudioUrl(voice, pat.id, eIdx, ex.en)
    ttsProvider.speak({
      texts:     [ex.en],
      audioUrls: url ? [url] : undefined,
      voiceKey:  voice,
      voiceKeys: [voice],
      rate:      RATE_MAP[prefs.speechRate],
      pitch:     getPitchForKey(voice),
      volume:    1.0,
      onStart: () => {
        if (focusStateRef.current === 'loading') setFocusStateSync('pattern-playing')
      },
      onEnd: () => {
        if (focusStateRef.current !== 'pattern-playing') return
        clearTimer()
        // Spec: 설정된 사용자 발화 대기 시간 후 → 다음 예문으로 Transition
        timerRef.current = setTimeout(() => {
          const pat      = story.patterns[patternIdxRef.current]
          const examples = getExamples(pat)
          const nextEx   = exIdxRef.current + 1
          if (nextEx >= examples.length) {
            advancePattern(patternIdxRef.current)
          } else {
            doTransitionTo(() => playPatternExample(patternIdxRef.current, nextEx))
          }
        }, PATTERN_EXAMPLE_WAIT_MS)
      },
      onError: () => {
        if (focusStateRef.current === 'loading') setFocusStateSync('pattern-playing')
      },
    })
  }

  function advancePattern(pIdx: number) {
    const next = pIdx + 1
    if (next >= story.patterns.length) {
      finishFocusMode()
    } else {
      doTransitionTo(() => {
        patternIdxRef.current = next
        exIdxRef.current      = 0
        setPatternIdx(next)
        setExIdx(0)
        setFocusStateSync('pattern-ready')
        savePos(story.id, { phase: 'pattern', paraIdx: paraIdxRef.current, patternIdx: next, exIdx: 0 })
      })
    }
  }

  function finishFocusMode() {
    // Pattern Set complete → save immediately (spec: Progress 즉시 저장)
    saveProgress()
    clearPos(story.id)  // Position no longer needed — fully completed
    setFocusStateSync('complete')
  }

  // ── Entry: restore saved position or start from beginning ─────────────────

  useEffect(() => {
    const saved = loadPos(story.id)

    if (saved) {
      // Restore refs and state first
      paraIdxRef.current    = saved.paraIdx
      patternIdxRef.current = saved.patternIdx
      exIdxRef.current      = saved.exIdx
      setParaIdx(saved.paraIdx)
      setPatternIdx(saved.patternIdx)
      setExIdx(saved.exIdx)

      if (saved.phase === 'story') {
        setPhaseSync('story')
        playStoryPara(saved.paraIdx)
      } else {
        // Story was already completed in a previous session; mark saved
        progressSavedRef.current = true
        setPhaseSync('pattern')
        // Show pattern-ready — user taps to play from the saved example
        setFocusStateSync('pattern-ready')
      }
    } else {
      playStoryPara(0)
    }

    return () => {
      ttsProvider.stop()
      clearTimer()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Background → pause; foreground → no auto-resume ───────────────────────
  // Spec: 앱 백그라운드 이동 → 오디오 즉시 Pause → Paused 상태 유지
  //       앱 포그라운드 복귀 → 자동 재생 없음. Paused 유지.

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        const s = focusStateRef.current
        if (s === 'story-playing' || s === 'pattern-playing') {
          stateBeforePauseRef.current = s
          clearTimer()
          ttsProvider.pause?.()
          setFocusStateSync('paused')
        }
      }
      // Foreground return: intentionally no action (spec: 자동 재생 없음)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  // ── Complete: show completion screen, then auto-navigate back ─────────────

  useEffect(() => {
    if (focusState !== 'complete') return
    const t = setTimeout(() => router.back(), COMPLETE_EXIT_DELAY_MS)
    return () => clearTimeout(t)
  }, [focusState, router])

  // ── Touch: swipe detection (story phase only) ─────────────────────────────

  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    touchStartRef.current = null

    const s = focusStateRef.current
    // Spec: Loading/Transition 상태에서 모든 입력 무시
    if (s === 'loading' || s === 'transition' || s === 'paused') return
    // Swipe only in story phase
    if (phaseRef.current !== 'story') return
    // Must be a clear horizontal gesture
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx) * 0.8) return

    if (dx < 0) {
      // Spec: 스와이프 Next → Transition 시작 → 오디오 페이드아웃(0.3s) → 다음 단락 표시
      const next = paraIdxRef.current + 1
      if (next >= story.paragraphs.length) return
      // Audio fade-out runs concurrently with the content transition (both 0.3s)
      ttsProvider.fadeOut?.(TRANSITION_MS)
      clearTimer()
      doTransitionTo(() => playStoryPara(next))
    } else {
      // Spec: 스와이프 Prev → 오디오 즉시 중단 → 이전 단락 표시 → 이전 오디오 처음부터 재생
      ttsProvider.stop()
      clearTimer()
      doTransitionTo(() => playStoryPara(Math.max(0, paraIdxRef.current - 1)))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.paragraphs.length])

  // ── Content tap (pattern-ready → start playing) ───────────────────────────
  // Spec: PatternReady | 화면 탭 | 예문 오디오 재생 → PatternPlaying 상태

  function handleContentTap() {
    if (focusStateRef.current !== 'pattern-ready') return
    // exIdxRef holds the restored/current position — resume from there
    playPatternExample(patternIdxRef.current, exIdxRef.current)
  }

  // ── Orb tap ───────────────────────────────────────────────────────────────
  // Spec: Playing (any) | 오브 탭 → 오디오 즉시 일시정지 → 오브 메뉴 표시 → Paused

  function handleOrbClick(e: React.MouseEvent) {
    const s = focusStateRef.current
    if (s === 'loading' || s === 'transition') return   // Spec: 무시
    if (s === 'story-playing' || s === 'pattern-playing') {
      e.stopPropagation()
      stateBeforePauseRef.current = s
      clearTimer()
      ttsProvider.pause?.()
      setFocusStateSync('paused')
      setShowOrbMenu(true)
    }
  }

  // ── Orb menu actions ──────────────────────────────────────────────────────
  // Spec: 오브 메뉴 3개만 — 계속 / 처음부터 / 나가기

  function handleMenuContinue() {
    // Spec: 일시정지된 정확한 위치부터 Resume (처음부터 재생 아님)
    setShowOrbMenu(false)
    ttsProvider.resume?.()
    setFocusStateSync(stateBeforePauseRef.current)
  }

  function handleMenuRestart() {
    // Spec: 현재 단락/예문 오디오 처음부터 재시작
    setShowOrbMenu(false)
    ttsProvider.stop()
    clearTimer()
    if (stateBeforePauseRef.current === 'story-playing') {
      playStoryPara(paraIdxRef.current)
    } else {
      playPatternExample(patternIdxRef.current, exIdxRef.current)
    }
  }

  function handleMenuExit() {
    // Spec: 오디오 중단 → 포커스 모드 종료 → 이전 화면으로 이동
    ttsProvider.stop()
    clearTimer()
    router.back()
  }

  // ── Progress bar ──────────────────────────────────────────────────────────
  // Spec: 스토리 단위 / 예문 세트 단위로만 증가 (예문 하나하나 쪼개지 않음)
  // → one step per paragraph, one step per pattern (not per individual example)

  const totalSteps  = story.paragraphs.length + story.patterns.length
  const currentStep = phase === 'story'
    ? paraIdx
    : story.paragraphs.length + patternIdx
  const progressPct = totalSteps > 0 ? Math.min(100, (currentStep / totalSteps) * 100) : 0

  // ── Derived render values ─────────────────────────────────────────────────

  const currentPara     = story.paragraphs[paraIdx]
  const currentPattern  = story.patterns[patternIdx]
  const currentExamples = currentPattern ? getExamples(currentPattern) : []
  const currentEx       = currentExamples[exIdx]
  const isBlocked       = focusState === 'loading' || focusState === 'transition'
  const isPatternPhase  = phase === 'pattern'
  const isPatternReady  = focusState === 'pattern-ready'

  // ── Complete screen ───────────────────────────────────────────────────────

  if (focusState === 'complete') {
    return (
      <div style={S.root}>
        <div style={S.completeWrap}>
          <div style={S.completeIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="rgba(215,181,109,0.9)" strokeWidth={2.5}
              strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p style={S.completeTitle}>완료했어요</p>
          <p style={S.completeSubtitle}>{story.title}</p>
        </div>
      </div>
    )
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div
      style={S.root}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={isPatternPhase ? handleContentTap : undefined}
    >
      {/* Progress bar — fixed at top */}
      <div style={S.progressTrack}>
        <div style={{ ...S.progressFill, width: `${progressPct}%` }} />
      </div>

      {/* Phase + position label */}
      <p style={S.phaseLabel}>
        {isPatternPhase
          ? `PATTERN ${patternIdx + 1} / ${story.patterns.length}`
          : `STORY · ${paraIdx + 1} / ${story.paragraphs.length}`}
      </p>

      {/* Content — fades during transition */}
      <div
        style={{
          ...S.content,
          opacity:    contentVisible ? 1 : 0,
          transition: `opacity ${TRANSITION_MS}ms ease`,
        }}
      >
        {!isPatternPhase ? (
          // ── Story: one paragraph, centered, large ──────────────────────
          <div style={S.storyWrap}>
            <p style={S.storyText}>{currentPara?.english}</p>
            {focusState === 'loading' && <p style={S.loadingDots}>· · ·</p>}
          </div>
        ) : (
          // ── Pattern: pattern fixed at top (20px), example large (36px) ─
          <div style={S.patternWrap}>
            <div style={S.patternHeader}>
              <p style={S.patternText}>{currentPattern?.pattern}</p>
              {currentPattern?.meaningKo && (
                <p style={S.patternMeaning}>{currentPattern.meaningKo}</p>
              )}
            </div>

            {currentEx && (
              <div>
                <p style={S.exampleText}>{currentEx.en}</p>
                {currentEx.ko && <p style={S.exampleKo}>{currentEx.ko}</p>}
              </div>
            )}

            {isPatternReady && <p style={S.tapHint}>탭하여 시작</p>}
            {focusState === 'loading' && <p style={S.loadingDots}>· · ·</p>}
          </div>
        )}
      </div>

      {/* Orb button */}
      <div style={S.orbContainer}>
        <button
          type="button"
          style={{
            ...S.orb,
            opacity:   isBlocked ? 0.35 : 1,
            ...(isPatternReady ? { animation: 'orbPulse 2s ease-in-out infinite' } : {}),
          }}
          onClick={handleOrbClick}
        >
          {focusState === 'loading' ? (
            <div style={S.spinner} />
          ) : focusState === 'paused' ? (
            // Pause state: show play icon (not used as click target — menu overlays everything)
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          )}
        </button>
      </div>

      {/* Orb menu overlay — Spec: 계속 / 처음부터 / 나가기 3개만 */}
      {showOrbMenu && (
        <div style={S.menuOverlay}>
          <div style={S.menuBox}>
            <button type="button" style={S.menuBtn} onClick={handleMenuContinue}>계속</button>
            <div style={S.menuDivider} />
            <button type="button" style={S.menuBtn} onClick={handleMenuRestart}>처음부터</button>
            <div style={S.menuDivider} />
            <button type="button" style={{ ...S.menuBtn, color: 'rgba(255,100,100,0.85)' }} onClick={handleMenuExit}>나가기</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes orbPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(107,143,255,0.5), 0 0 20px rgba(107,143,255,0.3); }
          50%       { box-shadow: 0 0 0 12px rgba(107,143,255,0), 0 0 32px rgba(107,143,255,0.5); }
        }
        @keyframes fmSpin   { to { transform: rotate(360deg); } }
        @keyframes fmFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
// Spec: 배경 #0A0F1E (dark immersive), 카드 UI 완전 제거
// Spec: 스토리 32px+, 패턴 20px (fixed top), 예문 36px

const BG = '#0A0F1E'

const S = {
  root: {
    position:         'fixed'  as const,
    inset:            0,
    backgroundColor:  BG,
    display:          'flex',
    flexDirection:    'column' as const,
    paddingTop:       'env(safe-area-inset-top, 0px)',
    paddingBottom:    'env(safe-area-inset-bottom, 0px)',
    overflow:         'hidden',
    userSelect:       'none'   as const,
    animation:        'fmFadeIn 0.3s ease-out both',
  },
  progressTrack: {
    height:     2,
    background: 'rgba(255,255,255,0.07)',
    flexShrink: 0,
  },
  progressFill: {
    height:     '100%',
    background: 'linear-gradient(90deg, #6B8FFF, #B8A8F0)',
    borderRadius: 1,
    transition: 'width 0.45s ease',
  },
  phaseLabel: {
    margin:        '12px 24px 0',
    fontSize:      10,
    fontWeight:    700,
    letterSpacing: '0.14em',
    color:         'rgba(107,143,255,0.55)',
    textTransform: 'uppercase' as const,
    flexShrink:    0,
  },
  content: {
    flex:            1,
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    padding:         '0 28px',
    overflow:        'hidden',
  },
  // ── Story ──────────────────────────────────────────────────────────────
  storyWrap: {
    maxWidth:  420,
    width:     '100%',
    textAlign: 'center' as const,
  },
  storyText: {
    fontSize:    32,           // Spec: 32px 이상
    fontWeight:  500,
    lineHeight:  1.65,
    color:       'rgba(255,255,255,0.93)',
    margin:      0,
    fontFamily:  'var(--font-playfair, "Playfair Display", Georgia, serif)',
    letterSpacing: '-0.3px',
  },
  loadingDots: {
    textAlign:     'center' as const,
    color:         'rgba(255,255,255,0.18)',
    fontSize:      22,
    margin:        '16px 0 0',
    letterSpacing: '0.3em',
  },
  // ── Pattern ────────────────────────────────────────────────────────────
  patternWrap: {
    maxWidth:       420,
    width:          '100%',
    display:        'flex',
    flexDirection:  'column' as const,
    gap:            28,
  },
  patternHeader: {
    paddingBottom: 20,
    borderBottom:  '1px solid rgba(255,255,255,0.08)',
  },
  patternText: {
    fontSize:    20,           // Spec: 패턴 20px (상단 고정)
    fontWeight:  700,
    color:       '#8EA7FF',
    margin:      '0 0 6px',
    lineHeight:  1.3,
    fontFamily:  'var(--font-playfair, "Playfair Display", Georgia, serif)',
  },
  patternMeaning: {
    fontSize:   14,
    color:      'rgba(255,255,255,0.4)',
    margin:     0,
    lineHeight: 1.4,
  },
  exampleText: {
    fontSize:      36,         // Spec: 예문 36px
    fontWeight:    500,
    color:         'rgba(255,255,255,0.93)',
    margin:        '0 0 10px',
    lineHeight:    1.45,
    letterSpacing: '-0.4px',
  },
  exampleKo: {
    fontSize:   17,
    color:      'rgba(255,255,255,0.30)',
    margin:     0,
    lineHeight: 1.5,
  },
  tapHint: {
    fontSize:      13,
    color:         'rgba(107,143,255,0.5)',
    margin:        0,
    letterSpacing: '0.05em',
  },
  // ── Orb ────────────────────────────────────────────────────────────────
  orbContainer: {
    display:       'flex',
    justifyContent: 'center',
    paddingBottom: 40,
    flexShrink:    0,
  },
  orb: {
    width:        56,
    height:       56,
    borderRadius: '50%',
    background:   'linear-gradient(135deg, #5C6BC0, #7E57C2)',
    border:       '1px solid rgba(142,167,255,0.25)',
    boxShadow:    '0 0 20px rgba(107,143,255,0.25)',
    cursor:       'pointer',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    transition:   'opacity 0.2s',
    touchAction:  'manipulation' as const,
  },
  spinner: {
    width:        18,
    height:       18,
    borderRadius: '50%',
    border:       '2px solid rgba(255,255,255,0.25)',
    borderTopColor: 'white',
    animation:    'fmSpin 0.8s linear infinite',
  },
  // ── Orb menu ───────────────────────────────────────────────────────────
  menuOverlay: {
    position:             'absolute' as const,
    inset:                0,
    background:           'rgba(0,0,0,0.72)',
    backdropFilter:       'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    display:              'flex',
    alignItems:           'center',
    justifyContent:       'center',
  },
  menuBox: {
    background:   'rgba(18,16,38,0.97)',
    border:       '1px solid rgba(255,255,255,0.10)',
    borderRadius: 20,
    overflow:     'hidden',
    width:        240,
  },
  menuBtn: {
    width:         '100%',
    padding:       '18px 24px',
    background:    'transparent',
    border:        'none',
    color:         'rgba(255,255,255,0.90)',
    fontSize:      17,
    fontWeight:    500,
    cursor:        'pointer',
    display:       'block',
    letterSpacing: '0.01em',
  },
  menuDivider: {
    height:     1,
    background: 'rgba(255,255,255,0.07)',
    margin:     '0 12px',
  },
  // ── Complete screen ─────────────────────────────────────────────────────
  completeWrap: {
    flex:           1,
    display:        'flex',
    flexDirection:  'column' as const,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            14,
    animation:      'fmFadeIn 0.4s ease-out both',
  },
  completeIcon: {
    width:        64,
    height:       64,
    borderRadius: 22,
    background:   'linear-gradient(135deg, rgba(215,181,109,0.18), rgba(215,181,109,0.06))',
    border:       '0.5px solid rgba(215,181,109,0.3)',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  completeTitle: {
    fontSize:   22,
    fontWeight: 700,
    color:      'rgba(255,255,255,0.90)',
    margin:     0,
    fontFamily: 'var(--font-playfair, "Playfair Display", Georgia, serif)',
  },
  completeSubtitle: {
    fontSize: 14,
    color:    'rgba(255,255,255,0.35)',
    margin:   0,
  },
} as const
