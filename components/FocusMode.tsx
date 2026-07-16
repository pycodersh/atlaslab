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

const PATTERN_EXAMPLE_WAIT_MS = 2000
const STORY_ADVANCE_DELAY_MS  = 500
const TRANSITION_MS           = 300
const COMPLETE_EXIT_DELAY_MS  = 2500

// ── Language mode ────────────────────────────────────────────────────────────

type LangMode = 'en' | 'en-ko' | 'ko'

// ── Position persistence (sessionStorage) ───────────────────────────────────

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

// ── State machine ────────────────────────────────────────────────────────────

type FocusState =
  | 'loading'
  | 'story-playing'
  | 'paused'
  | 'transition'
  | 'pattern-ready'
  | 'pattern-playing'
  | 'complete'

type ExItem = { en: string; ko: string }

function getExamples(pat: MagazineStory['patterns'][0]): ExItem[] {
  const fromData = getPatternExamples(pat.id)
  if (fromData.length > 0) return fromData.slice(0, 3)
  const r: ExItem[] = []
  if (pat.storySentence)     r.push({ en: pat.storySentence,     ko: pat.storySentenceKo     ?? '' })
  if (pat.variationSentence) r.push({ en: pat.variationSentence, ko: pat.variationSentenceKo ?? '' })
  return r.slice(0, 3)
}

// ── Component ────────────────────────────────────────────────────────────────

export type FocusModeProps = { story: MagazineStory }

export function FocusMode({ story }: FocusModeProps) {
  const router              = useRouter()
  const { user }            = useAuth()
  const { prefs }           = usePreferences()
  const { setProgress }     = useLearningProgress()
  const voice               = story.narratorVoice ?? prefs.voice

  // ── UI state ────────────────────────────────────────────────────────────

  const [focusState,     setFocusState]     = useState<FocusState>('loading')
  const [phase,          setPhase]          = useState<'story' | 'pattern'>('story')
  const [paraIdx,        setParaIdx]        = useState(0)
  const [patternIdx,     setPatternIdx]     = useState(0)
  const [exIdx,          setExIdx]          = useState(0)
  const [showOrbMenu,    setShowOrbMenu]    = useState(false)
  const [contentVisible, setContentVisible] = useState(true)
  const [langMode,       setLangMode]       = useState<LangMode>('en-ko')

  // ── Refs ─────────────────────────────────────────────────────────────────

  const focusStateRef       = useRef<FocusState>('loading')
  const phaseRef            = useRef<'story' | 'pattern'>('story')
  const paraIdxRef          = useRef(0)
  const patternIdxRef       = useRef(0)
  const exIdxRef            = useRef(0)
  const stateBeforePauseRef = useRef<'story-playing' | 'pattern-playing'>('story-playing')
  const timerRef            = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressSavedRef    = useRef(false)
  const inTransitionRef     = useRef(false)

  // ── Sync helpers ─────────────────────────────────────────────────────────

  function setFocusStateSync(s: FocusState) { focusStateRef.current = s; setFocusState(s) }
  function setPhaseSync(p: 'story' | 'pattern') { phaseRef.current = p; setPhase(p) }
  function clearTimer() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }

  // ── Progress save ─────────────────────────────────────────────────────────

  function saveProgress() {
    if (progressSavedRef.current) return
    progressSavedRef.current = true
    const data       = completeStoryRound(story.id)
    const patternIds = story.patterns.map(p => p.id)
    setProgress(prev => completeStoryAndScheduleReview(prev, String(story.id), patternIds, 1, 1))
    if (user?.id) syncStoryRoundToSupabase(user.id, data)
  }

  // ── Transition ────────────────────────────────────────────────────────────

  function doTransitionTo(cb: () => void) {
    if (inTransitionRef.current) return
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
        if (focusStateRef.current === 'loading') setFocusStateSync('story-playing')
      },
      onEnd: () => {
        if (focusStateRef.current !== 'story-playing') return
        clearTimer()
        timerRef.current = setTimeout(() => {
          const next = paraIdxRef.current + 1
          if (next >= story.paragraphs.length) {
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
        timerRef.current = setTimeout(() => {
          const p        = story.patterns[patternIdxRef.current]
          const exs      = getExamples(p)
          const nextEx   = exIdxRef.current + 1
          if (nextEx >= exs.length) {
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
    saveProgress()
    clearPos(story.id)
    setFocusStateSync('complete')
  }

  // ── Entry ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const saved = loadPos(story.id)
    if (saved) {
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
        progressSavedRef.current = true
        setPhaseSync('pattern')
        setFocusStateSync('pattern-ready')
      }
    } else {
      playStoryPara(0)
    }
    return () => { ttsProvider.stop(); clearTimer() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Background → pause ────────────────────────────────────────────────────

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        const s = focusStateRef.current
        if (s === 'story-playing' || s === 'pattern-playing') {
          stateBeforePauseRef.current = s
          clearTimer()
          ttsProvider.pause?.()
          setFocusStateSync('paused')
        }
      }
      // Foreground: no auto-resume (spec)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // ── Complete auto-navigate ────────────────────────────────────────────────

  useEffect(() => {
    if (focusState !== 'complete') return
    const t = setTimeout(() => router.push('/patto/home'), COMPLETE_EXIT_DELAY_MS)
    return () => clearTimeout(t)
  }, [focusState, router])

  // ── Touch swipe (story phase) ─────────────────────────────────────────────

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
    if (s === 'loading' || s === 'transition' || s === 'paused') return
    if (phaseRef.current !== 'story') return
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx) * 0.8) return

    if (dx < 0) {
      const next = paraIdxRef.current + 1
      if (next >= story.paragraphs.length) return
      ttsProvider.fadeOut?.(TRANSITION_MS)
      clearTimer()
      doTransitionTo(() => playStoryPara(next))
    } else {
      ttsProvider.stop()
      clearTimer()
      doTransitionTo(() => playStoryPara(Math.max(0, paraIdxRef.current - 1)))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.paragraphs.length])

  // ── Content tap (pattern-ready) ───────────────────────────────────────────

  function handleContentTap() {
    if (focusStateRef.current !== 'pattern-ready') return
    playPatternExample(patternIdxRef.current, exIdxRef.current)
  }

  // ── Orb ──────────────────────────────────────────────────────────────────

  function handleOrbClick(e: React.MouseEvent) {
    const s = focusStateRef.current
    if (s === 'loading' || s === 'transition') return
    if (s === 'story-playing' || s === 'pattern-playing') {
      e.stopPropagation()
      stateBeforePauseRef.current = s
      clearTimer()
      ttsProvider.pause?.()
      setFocusStateSync('paused')
      setShowOrbMenu(true)
    }
  }

  function handleMenuContinue() {
    setShowOrbMenu(false)
    ttsProvider.resume?.()
    setFocusStateSync(stateBeforePauseRef.current)
  }

  function handleMenuRestart() {
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
    ttsProvider.stop()
    clearTimer()
    router.push('/patto/home')
  }

  // ── Progress bar ──────────────────────────────────────────────────────────

  const totalSteps  = story.paragraphs.length + story.patterns.length
  const currentStep = phase === 'story'
    ? paraIdx
    : story.paragraphs.length + patternIdx
  const progressPct = totalSteps > 0 ? Math.min(100, (currentStep / totalSteps) * 100) : 0

  // ── Derived ───────────────────────────────────────────────────────────────

  const currentPara     = story.paragraphs[paraIdx]
  const currentPattern  = story.patterns[patternIdx]
  const currentExamples = currentPattern ? getExamples(currentPattern) : []
  const currentEx       = currentExamples[exIdx]
  const isBlocked       = focusState === 'loading' || focusState === 'transition'
  const isPatternPhase  = phase === 'pattern'
  const isPatternReady  = focusState === 'pattern-ready'
  const isPlaying       = focusState === 'story-playing' || focusState === 'pattern-playing'

  // ── Complete screen ───────────────────────────────────────────────────────

  if (focusState === 'complete') {
    return (
      <div style={S.root}>
        <div style={S.completeWrap}>
          <div style={S.completeIcon}>✓</div>
          <p style={S.completeTitle}>완료했어요</p>
          <p style={S.completeSub}>{story.title}</p>
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
      {/* Progress bar */}
      <div style={S.progressTrack}>
        <div style={{ ...S.progressFill, width: `${progressPct}%` }} />
      </div>

      {/* Header: phase label + lang switcher */}
      <div style={S.header}>
        <span style={S.phaseLabel}>
          {isPatternPhase
            ? `PATTERN ${patternIdx + 1} / ${story.patterns.length}`
            : `STORY  ${paraIdx + 1} / ${story.paragraphs.length}`}
        </span>
        <div style={S.langGroup}>
          {(['en', 'en-ko', 'ko'] as LangMode[]).map(m => (
            <button
              key={m}
              type="button"
              style={{ ...S.langBtn, ...(langMode === m ? S.langBtnActive : {}) }}
              onClick={e => { e.stopPropagation(); setLangMode(m) }}
            >
              {m === 'en' ? 'EN' : m === 'en-ko' ? 'EN·KO' : 'KO'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          ...S.content,
          opacity:    contentVisible ? 1 : 0,
          transition: `opacity ${TRANSITION_MS}ms ease`,
        }}
      >
        {!isPatternPhase ? (
          // ── Story paragraph ──────────────────────────────────────────────
          <div style={S.paraWrap}>
            {(langMode === 'en' || langMode === 'en-ko') && (
              <p style={S.paraEn}>{currentPara?.english}</p>
            )}
            {(langMode === 'ko' || langMode === 'en-ko') && currentPara?.koreanTranslation && (
              <p style={S.paraKo}>{currentPara.koreanTranslation}</p>
            )}
            {focusState === 'loading' && <p style={S.loadingDots}>· · ·</p>}
          </div>
        ) : (
          // ── Pattern + example ────────────────────────────────────────────
          <div style={S.patternWrap}>
            <div style={S.patternHeader}>
              <p style={S.patternText}>{currentPattern?.pattern}</p>
              {currentPattern?.meaningKo && (
                <p style={S.patternMeaning}>{currentPattern.meaningKo}</p>
              )}
            </div>

            {currentEx && (
              <div style={S.exWrap}>
                {(langMode === 'en' || langMode === 'en-ko') && (
                  <p style={S.exEn}>{currentEx.en}</p>
                )}
                {(langMode === 'ko' || langMode === 'en-ko') && currentEx.ko && (
                  <p style={S.exKo}>{currentEx.ko}</p>
                )}
              </div>
            )}

            {isPatternReady && <p style={S.tapHint}>탭하여 시작</p>}
            {focusState === 'loading' && <p style={S.loadingDots}>· · ·</p>}
          </div>
        )}
      </div>

      {/* Orb — sole control, fixed bottom */}
      <div style={S.orbContainer}>
        <button
          type="button"
          style={{
            ...S.orb,
            opacity:   isBlocked ? 0.4 : 1,
            ...(isPatternReady ? { animation: 'fmOrbPulse 2s ease-in-out infinite' } : {}),
          }}
          onClick={handleOrbClick}
        >
          {focusState === 'loading' ? (
            <div style={S.spinner} />
          ) : focusState === 'paused' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          ) : isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Orb menu */}
      {showOrbMenu && (
        <div style={S.menuOverlay} onClick={e => e.stopPropagation()}>
          <div style={S.menuBox}>
            <button type="button" style={S.menuBtn} onClick={handleMenuContinue}>계속</button>
            <div style={S.menuDivider} />
            <button type="button" style={S.menuBtn} onClick={handleMenuRestart}>처음부터</button>
            <div style={S.menuDivider} />
            <button type="button" style={{ ...S.menuBtn, color: '#E05252' }} onClick={handleMenuExit}>나가기</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fmOrbPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(107,143,255,0.35), 0 2px 12px rgba(107,143,255,0.18); }
          50%      { box-shadow: 0 0 0 10px rgba(107,143,255,0), 0 2px 20px rgba(107,143,255,0.32); }
        }
        @keyframes fmSpin { to { transform: rotate(360deg); } }
        @keyframes fmFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
// Light mode: #F2F7FF background, dark text — matches app theme

const S = {
  root: {
    position:        'fixed' as const,
    inset:           0,
    backgroundColor: '#F2F7FF',
    display:         'flex',
    flexDirection:   'column' as const,
    paddingTop:      'env(safe-area-inset-top, 0px)',
    paddingBottom:   'env(safe-area-inset-bottom, 0px)',
    overflow:        'hidden',
    userSelect:      'none' as const,
    animation:       'fmFadeIn 0.25s ease-out both',
  },
  progressTrack: {
    height:     3,
    background: 'rgba(107,143,255,0.12)',
    flexShrink: 0,
  },
  progressFill: {
    height:       '100%',
    background:   'linear-gradient(90deg, #6B8FFF, #A78BFA)',
    borderRadius: 2,
    transition:   'width 0.45s ease',
  },
  header: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '12px 20px 8px',
    flexShrink:     0,
  },
  phaseLabel: {
    fontSize:      10,
    fontWeight:    700,
    letterSpacing: '0.13em',
    color:         'rgba(107,143,255,0.7)',
    textTransform: 'uppercase' as const,
    margin:        0,
  },
  langGroup: {
    display:       'flex',
    gap:           4,
    background:    'rgba(107,143,255,0.07)',
    borderRadius:  20,
    padding:       '3px 4px',
  },
  langBtn: {
    background:    'transparent',
    border:        'none',
    borderRadius:  16,
    padding:       '3px 9px',
    fontSize:      10,
    fontWeight:    600,
    color:         'rgba(80,100,160,0.55)',
    cursor:        'pointer',
    letterSpacing: '0.04em',
    transition:    'all 0.15s',
  },
  langBtnActive: {
    background: '#fff',
    color:      '#5C72B0',
    boxShadow:  '0 1px 4px rgba(107,143,255,0.18)',
  },
  content: {
    flex:           1,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '0 28px',
    overflow:       'hidden',
  },
  // ── Story ──────────────────────────────────────────────────────────────
  paraWrap: {
    maxWidth:  480,
    width:     '100%',
    textAlign: 'left' as const,
  },
  paraEn: {
    fontSize:      28,
    fontWeight:    500,
    lineHeight:    1.65,
    color:         '#1A1F36',
    margin:        '0 0 14px',
    letterSpacing: '-0.2px',
  },
  paraKo: {
    fontSize:   18,
    fontWeight: 400,
    lineHeight: 1.65,
    color:      'rgba(80,100,160,0.55)',
    margin:     0,
  },
  loadingDots: {
    color:         'rgba(107,143,255,0.35)',
    fontSize:      20,
    letterSpacing: '0.3em',
    margin:        '14px 0 0',
  },
  // ── Pattern ────────────────────────────────────────────────────────────
  patternWrap: {
    maxWidth:      480,
    width:         '100%',
    display:       'flex',
    flexDirection: 'column' as const,
    gap:           24,
  },
  patternHeader: {
    paddingBottom: 18,
    borderBottom:  '1px solid rgba(107,143,255,0.12)',
  },
  patternText: {
    fontSize:   20,
    fontWeight: 700,
    color:      '#5C72B0',
    margin:     '0 0 4px',
    lineHeight: 1.3,
  },
  patternMeaning: {
    fontSize:   14,
    color:      'rgba(80,100,160,0.5)',
    margin:     0,
    lineHeight: 1.4,
  },
  exWrap: {
    display:       'flex',
    flexDirection: 'column' as const,
    gap:           10,
  },
  exEn: {
    fontSize:      26,
    fontWeight:    500,
    color:         '#1A1F36',
    margin:        0,
    lineHeight:    1.5,
    letterSpacing: '-0.2px',
  },
  exKo: {
    fontSize:   18,
    color:      'rgba(80,100,160,0.5)',
    margin:     0,
    lineHeight: 1.5,
  },
  tapHint: {
    fontSize:      13,
    color:         'rgba(107,143,255,0.6)',
    margin:        0,
    letterSpacing: '0.04em',
  },
  // ── Orb ────────────────────────────────────────────────────────────────
  orbContainer: {
    display:        'flex',
    justifyContent: 'center',
    paddingBottom:  44,
    flexShrink:     0,
  },
  orb: {
    width:          56,
    height:         56,
    borderRadius:   '50%',
    background:     'linear-gradient(135deg, #6B8FFF, #A78BFA)',
    border:         'none',
    boxShadow:      '0 2px 12px rgba(107,143,255,0.30)',
    cursor:         'pointer',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    color:          '#fff',
    transition:     'opacity 0.2s, transform 0.15s',
    touchAction:    'manipulation' as const,
  },
  spinner: {
    width:          18,
    height:         18,
    borderRadius:   '50%',
    border:         '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    animation:      'fmSpin 0.8s linear infinite',
  },
  // ── Orb menu ───────────────────────────────────────────────────────────
  menuOverlay: {
    position:             'absolute' as const,
    inset:                0,
    background:           'rgba(242,247,255,0.75)',
    backdropFilter:       'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display:              'flex',
    alignItems:           'center',
    justifyContent:       'center',
  },
  menuBox: {
    background:   '#fff',
    border:       '1px solid rgba(107,143,255,0.14)',
    borderRadius: 20,
    overflow:     'hidden',
    width:        240,
    boxShadow:    '0 8px 32px rgba(80,100,160,0.12)',
  },
  menuBtn: {
    width:         '100%',
    padding:       '18px 24px',
    background:    'transparent',
    border:        'none',
    color:         '#1A1F36',
    fontSize:      17,
    fontWeight:    500,
    cursor:        'pointer',
    display:       'block',
    textAlign:     'center' as const,
    letterSpacing: '0.01em',
  },
  menuDivider: {
    height:     1,
    background: 'rgba(107,143,255,0.08)',
    margin:     '0 12px',
  },
  // ── Complete ────────────────────────────────────────────────────────────
  completeWrap: {
    flex:           1,
    display:        'flex',
    flexDirection:  'column' as const,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            12,
    animation:      'fmFadeIn 0.35s ease-out both',
    backgroundColor: '#F2F7FF',
  },
  completeIcon: {
    width:          64,
    height:         64,
    borderRadius:   22,
    background:     'linear-gradient(135deg, #6B8FFF, #A78BFA)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       28,
    color:          '#fff',
    marginBottom:   8,
  },
  completeTitle: {
    fontSize:   22,
    fontWeight: 700,
    color:      '#1A1F36',
    margin:     0,
  },
  completeSub: {
    fontSize: 14,
    color:    'rgba(80,100,160,0.55)',
    margin:   0,
  },
} as const
