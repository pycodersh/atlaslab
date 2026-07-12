'use client'

import {
  createContext, useContext, useState, useCallback,
  useRef, useEffect, type ReactNode,
} from 'react'
import {
  type TrainerPage, type OrbState, type OrbTapMode,
  type SessionPhase, type TrainerSessionConfig, type GuidanceTier,
  guidanceTier,
} from '@/lib/trainer/types'
import {
  saveSessionProgress, loadSessionProgress, clearSessionProgress,
  waitDurationMs, recordPaceSample,
} from '@/lib/trainer/store'

// ── Public API ────────────────────────────────────────────────────────────────

export type { TrainerPage, OrbState, OrbTapMode, SessionPhase }

/** A button rendered inside the trainer bubble */
export interface BubbleButton { label: string; onClick: () => void; primary?: boolean }

/** Message priority: 1=session flow, 2=user action confirm, 3=notification */
export type MsgPriority = 1 | 2 | 3

interface QueuedMsg { msg: string; ms: number; priority: MsgPriority; buttons?: BubbleButton[] }

export interface TrainerCtx {
  // ── Display (unchanged API for non-story pages) ──────────────────────────
  message: string | null
  bubbleButtons: BubbleButton[] | null
  isActive: boolean
  isPulsing: boolean
  page: TrainerPage

  showMessage: (msg: string, ms?: number) => void
  showAction:  (msg: string, buttons: BubbleButton[], ms?: number) => void
  clearMessage: () => void
  setSilent:    (v: boolean) => void
  triggerPulse: () => void
  setPage:      (p: TrainerPage) => void

  // ── Orb visual & interaction state ──────────────────────────────────────
  orbState:    OrbState
  tapMode:     OrbTapMode
  isMenuOpen:  boolean

  // ── Session info (read-only, for TrainerButton) ──────────────────────────
  sessionPhase:      SessionPhase
  currentParaIdx:    number
  currentPatternIdx: number

  // ── Session control (called from MagazineEngine) ──────────────────────────
  startSession:    (cfg: TrainerSessionConfig) => void
  endSession:      () => void

  // ── Orb tap + menu (called from TrainerButton) ───────────────────────────
  handleOrbTap:     () => void
  closeMenu:        () => void
  handleMenuRepeat: () => void
  handleMenuSkip:   () => void
  handleMenuPause:  () => void
  handleMenuExit:   () => void
}

// ── Context object ────────────────────────────────────────────────────────────

export const TrainerContext = createContext<TrainerCtx | null>(null)

export function useTrainer(): TrainerCtx {
  const ctx = useContext(TrainerContext)
  if (!ctx) throw new Error('useTrainer: missing TrainerProvider')
  return ctx
}

export function useTrainerSafe(): TrainerCtx | null {
  return useContext(TrainerContext)
}

// ── Provider + state machine ──────────────────────────────────────────────────

export function TrainerStateProvider({ children }: { children: ReactNode }) {
  // ── Display state ────────────────────────────────────────────────────────
  const [message,       setMessage]       = useState<string | null>(null)
  const [bubbleButtons, setBubbleButtons] = useState<BubbleButton[] | null>(null)
  const [isActive,      setIsActive]      = useState(false)
  const [isPulsing,     setIsPulsing]     = useState(false)
  const [page,          setPageState]     = useState<TrainerPage>('other')

  // ── Session state ────────────────────────────────────────────────────────
  const [orbState,          setOrbState]          = useState<OrbState>('idle')
  const [tapMode,           setTapMode]           = useState<OrbTapMode>('menu')
  const [isMenuOpen,        setMenuOpen]          = useState(false)
  const [sessionPhase,      setSessionPhase]      = useState<SessionPhase>('inactive')
  const [currentParaIdx,    setCurrentParaIdx]    = useState(0)
  const [currentPatternIdx, setCurrentPatternIdx] = useState(0)

  // ── Internal refs ────────────────────────────────────────────────────────
  const silentRef         = useRef(false)
  const dismissRef        = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pulseRef          = useRef<ReturnType<typeof setTimeout> | null>(null)
  const waitTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const waitFiresRef      = useRef(0)
  const cfgRef            = useRef<TrainerSessionConfig | null>(null)
  const tapStartRef       = useRef<number>(0)
  const activePriorityRef = useRef<MsgPriority | 0>(0)   // 0 = nothing active
  const msgQueueRef       = useRef<QueuedMsg[]>([])

  // ── Helpers ──────────────────────────────────────────────────────────────

  function clearWaitTimer() {
    if (waitTimerRef.current) { clearTimeout(waitTimerRef.current); waitTimerRef.current = null }
    waitFiresRef.current = 0
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const processQueue = useCallback(() => {
    const next = msgQueueRef.current.shift()
    if (!next) return
    activePriorityRef.current = next.priority
    setMessage(next.msg)
    setBubbleButtons(next.buttons ?? null)
    setIsActive(true)
    dismissRef.current = setTimeout(() => {
      setMessage(null); setBubbleButtons(null); setIsActive(false)
      activePriorityRef.current = 0
      processQueue()
    }, next.ms)
  }, [])

  /** Internal: session-flow messages (priority 1). Always preempts lower priority. */
  const showMsg = useCallback((msg: string, ms = 2500) => {
    if (silentRef.current) return
    if (dismissRef.current) clearTimeout(dismissRef.current)
    activePriorityRef.current = 1
    setMessage(msg)
    setBubbleButtons(null)
    setIsActive(true)
    dismissRef.current = setTimeout(() => {
      setMessage(null); setBubbleButtons(null); setIsActive(false)
      activePriorityRef.current = 0
      processQueue()
    }, ms)
  }, [processQueue])

  const clearMsg = useCallback(() => {
    if (dismissRef.current) clearTimeout(dismissRef.current)
    setMessage(null); setBubbleButtons(null); setIsActive(false)
    activePriorityRef.current = 0
    processQueue()
  }, [processQueue])

  const setSilentFn = useCallback((v: boolean) => {
    silentRef.current = v
    if (v) { clearMsg(); msgQueueRef.current = [] }
  }, [clearMsg])

  const triggerPulse = useCallback(() => {
    if (pulseRef.current) clearTimeout(pulseRef.current)
    setIsPulsing(true)
    pulseRef.current = setTimeout(() => setIsPulsing(false), 500)
  }, [])

  const setPage = useCallback((p: TrainerPage) => {
    setPageState(p)
    clearMsg()
    silentRef.current = false
  }, [clearMsg])

  // ── Session phase helpers ─────────────────────────────────────────────────

  const cfg      = () => cfgRef.current
  const tier     = (): GuidanceTier => guidanceTier(cfgRef.current?.round ?? 0)

  /** Go to a specific phase and update persisted progress */
  const goPhase = useCallback((phase: SessionPhase, paraIdx?: number, patIdx?: number) => {
    setSessionPhase(phase)
    const c = cfgRef.current
    if (!c) return
    const pi  = paraIdx    ?? currentParaIdx
    const pti = patIdx     ?? currentPatternIdx
    if (paraIdx    !== undefined) setCurrentParaIdx(paraIdx)
    if (patIdx     !== undefined) setCurrentPatternIdx(patIdx)
    if (phase !== 'inactive' && phase !== 'paused' && phase !== 'session-done') {
      saveSessionProgress({ storyId: c.storyId, phase, paraIdx: pi, patternIdx: pti, savedAt: Date.now() })
    }
  }, [currentParaIdx, currentPatternIdx])

  // ── Core flow transitions ─────────────────────────────────────────────────

  /** Start listening to paragraph `idx` */
  const startParaListen = useCallback((idx: number) => {
    const c = cfg(); if (!c) return
    setCurrentParaIdx(idx)
    setOrbState('guiding')
    setTapMode('menu')
    clearWaitTimer()

    const t = tier()
    if (t !== 'silent') showMsg('Listen.', 3000)

    goPhase('para-listen', idx)
    c.scrollToParagraph(idx)

    // Small delay so scroll settles, then play
    setTimeout(() => {
      c.playParagraphAudio(idx, () => {
        // Audio ended → "Your turn."
        startParaYourTurn(idx)
      })
    }, 400)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goPhase, showMsg])

  const startParaYourTurn = useCallback((idx: number) => {
    const c = cfg(); if (!c) return
    const t = tier()
    tapStartRef.current = Date.now()
    setOrbState('waiting')
    setTapMode('done')
    clearWaitTimer()

    if (t === 'full' || t === 'lite') showMsg('Your turn.', 4000)
    goPhase('para-your-turn', idx)

    // 5-second no-action timer
    const waitMs = waitDurationMs(c.storyId)
    const scheduleWait = (fires: number) => {
      waitTimerRef.current = setTimeout(() => {
        if (fires === 0) {
          showMsg('Need another listen?', 3000)
          // Re-play after message
          setTimeout(() => {
            c.playParagraphAudio(idx, () => startParaYourTurn(idx))
          }, 1500)
        } else {
          showMsg('Take your time.', 5000)
          // Stay in waiting forever — user must tap
        }
        waitFiresRef.current = fires + 1
        if (fires === 0) scheduleWait(1)
      }, waitMs)
    }
    scheduleWait(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goPhase, showMsg])

  /** User tapped Orb to confirm para spoken */
  const confirmParaDone = useCallback(() => {
    const c = cfg(); if (!c) return
    clearWaitTimer()
    // Record pace
    if (tapStartRef.current) {
      recordPaceSample(c.storyId, Date.now() - tapStartRef.current)
    }
    const t = tier()
    if (t === 'full' || t === 'lite') showMsg('Nice.', 900)
    setOrbState('idle')
    setTapMode('menu')
    goPhase('para-nice', currentParaIdx)

    // Auto-advance to next para or story-done
    const delay = (t === 'full' || t === 'lite') ? 1000 : 300
    setTimeout(() => {
      const paraTotal = cfgRef.current?.paragraphs.length ?? 0
      const nextIdx   = currentParaIdx + 1
      if (nextIdx < paraTotal) {
        startParaListen(nextIdx)
      } else {
        // All paragraphs done
        setOrbState('guiding')
        showMsg('Great.', 2000)
        goPhase('story-done')
        triggerPulse()
        setTimeout(() => {
          cfgRef.current?.scrollToPatterns()
          setTimeout(() => startPatternListen(0), 800)
        }, 1200)
      }
    }, delay)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentParaIdx, goPhase, showMsg, startParaListen, triggerPulse])

  /** Start pattern phrase listen at `idx` */
  const startPatternListen = useCallback((idx: number) => {
    const c = cfg(); if (!c) return
    setCurrentPatternIdx(idx)
    setOrbState('guiding')
    setTapMode('menu')
    clearWaitTimer()
    const t = tier()
    if (t !== 'silent') showMsg('Listen.', 3000)
    goPhase('pat-listen', undefined, idx)

    setTimeout(() => {
      c.playPatternAudio(idx, () => {
        startPatternYourTurn1(idx)
      })
    }, 400)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goPhase, showMsg])

  const startPatternYourTurn1 = useCallback((idx: number) => {
    tapStartRef.current = Date.now()
    setOrbState('waiting')
    setTapMode('done')
    const t = tier()
    if (t !== 'silent') showMsg('Your turn.', 4000)
    goPhase('pat-your-turn-1', undefined, idx)

    // Wait timer
    const waitMs = waitDurationMs(cfgRef.current?.storyId ?? 0)
    waitTimerRef.current = setTimeout(() => {
      showMsg('Need another listen?', 3000)
      setTimeout(() => {
        cfgRef.current?.playPatternAudio(idx, () => startPatternYourTurn1(idx))
      }, 1500)
    }, waitMs)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goPhase, showMsg])

  const confirmPatternYourTurn1 = useCallback((idx: number) => {
    const c = cfg(); if (!c) return
    clearWaitTimer()
    if (tapStartRef.current) recordPaceSample(c.storyId, Date.now() - tapStartRef.current)

    const t = tier()
    // Round 2+ (lite/minimal/silent): skip "Again." step
    if (t !== 'full') {
      advanceToNextPattern(idx)
      return
    }
    setOrbState('guiding')
    setTapMode('menu')
    showMsg('Again.', 2500)
    goPhase('pat-again', undefined, idx)
    setTimeout(() => {
      c.playPatternAudio(idx, () => startPatternYourTurn2(idx))
    }, 600)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goPhase, showMsg])

  const startPatternYourTurn2 = useCallback((idx: number) => {
    tapStartRef.current = Date.now()
    setOrbState('waiting')
    setTapMode('done')
    showMsg('Your turn.', 4000)
    goPhase('pat-your-turn-2', undefined, idx)

    const waitMs = waitDurationMs(cfgRef.current?.storyId ?? 0)
    waitTimerRef.current = setTimeout(() => {
      showMsg('Need another listen?', 3000)
      setTimeout(() => {
        cfgRef.current?.playPatternAudio(idx, () => startPatternYourTurn2(idx))
      }, 1500)
    }, waitMs)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goPhase, showMsg])

  const advanceToNextPattern = useCallback((idx: number) => {
    const c = cfg(); if (!c) return
    clearWaitTimer()
    const t = tier()
    const patTotal = c.patterns.length
    const next     = idx + 1

    if (t === 'full') showMsg('Next.', 1000)
    setOrbState('idle')
    setTapMode('menu')
    goPhase('pat-next', undefined, idx)

    setTimeout(() => {
      if (next < patTotal) {
        c.advancePatternCard(next)
        setTimeout(() => startPatternListen(next), 500)
      } else {
        // All patterns done
        goPhase('session-done', undefined, idx)
        showMsg('Done.', 3000)
        setOrbState('idle')
        triggerPulse()
        clearSessionProgress(c.storyId)
        setTimeout(() => c.onSessionComplete(), 1500)
      }
    }, t === 'full' ? 800 : 300)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goPhase, showMsg, startPatternListen, triggerPulse])

  // ── startSession ──────────────────────────────────────────────────────────

  const startSession = useCallback((config: TrainerSessionConfig) => {
    cfgRef.current = config
    clearWaitTimer()

    // Check for saved mid-session progress
    const saved = loadSessionProgress(config.storyId)
    if (saved && saved.paraIdx > 0 && (saved.phase !== 'inactive' && saved.phase !== 'session-done')) {
      setCurrentParaIdx(saved.paraIdx)
      setCurrentPatternIdx(saved.patternIdx)
      setOrbState('waiting')
      setTapMode('menu')
      showMsg('Welcome back. Let\'s continue.', 3000)
      goPhase('ready')
      // Restore to saved position after greeting
      setTimeout(() => {
        const restoredPhase = saved.phase
        if (restoredPhase.startsWith('para')) {
          startParaListen(saved.paraIdx)
        } else if (restoredPhase.startsWith('pat')) {
          config.scrollToPatterns()
          setTimeout(() => startPatternListen(saved.patternIdx), 600)
        }
      }, 2500)
      return
    }

    // Fresh session
    const t = guidanceTier(config.round)
    setCurrentParaIdx(0)
    setCurrentPatternIdx(0)
    setOrbState('waiting')
    setTapMode('done')  // first tap starts session
    goPhase('ready')

    if (t === 'silent') {
      // 5회차+: skip the whole ceremony
      showMsg('Ready.', 1500)
      setTimeout(() => {
        startParaListen(0)
      }, 2000)
      return
    }

    showMsg('Ready?', 2500)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goPhase, showMsg, startParaListen, startPatternListen])

  // ── endSession ────────────────────────────────────────────────────────────

  const endSession = useCallback(() => {
    cfgRef.current = null
    clearWaitTimer()
    setSessionPhase('inactive')
    setOrbState('idle')
    setTapMode('menu')
    setMenuOpen(false)
    setCurrentParaIdx(0)
    setCurrentPatternIdx(0)
    clearMsg()
  }, [clearMsg])

  // ── Orb tap handler ───────────────────────────────────────────────────────

  const handleOrbTap = useCallback(() => {
    if (isMenuOpen) { setMenuOpen(false); return }

    if (tapMode === 'menu') {
      // Open help menu (only when in active session)
      if (sessionPhase !== 'inactive') setMenuOpen(true)
      return
    }

    // tapMode === 'done': completion signal
    if (sessionPhase === 'ready') {
      // First tap starts session
      const t = tier()
      if (t === 'minimal') {
        // 4회차: just start, minimal messages
        showMsg('Ready.', 800)
        setTimeout(() => startParaListen(0), 1000)
      } else {
        startParaListen(0)
      }
      setTapMode('menu')
      return
    }
    if (sessionPhase === 'para-your-turn') { confirmParaDone(); return }
    if (sessionPhase === 'pat-your-turn-1') { confirmPatternYourTurn1(currentPatternIdx); return }
    if (sessionPhase === 'pat-your-turn-2') { advanceToNextPattern(currentPatternIdx); return }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMenuOpen, tapMode, sessionPhase, currentPatternIdx,
      showMsg, startParaListen, confirmParaDone,
      confirmPatternYourTurn1, advanceToNextPattern])

  // ── Menu actions ──────────────────────────────────────────────────────────

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const handleMenuRepeat = useCallback(() => {
    setMenuOpen(false)
    const c = cfg(); if (!c) return
    if (sessionPhase === 'para-your-turn' || sessionPhase === 'para-listen') {
      c.playParagraphAudio(currentParaIdx, () => startParaYourTurn(currentParaIdx))
    } else if (sessionPhase.startsWith('pat')) {
      c.playPatternAudio(currentPatternIdx, () => startPatternYourTurn1(currentPatternIdx))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionPhase, currentParaIdx, currentPatternIdx])

  const handleMenuSkip = useCallback(() => {
    setMenuOpen(false)
    clearWaitTimer()
    if (sessionPhase === 'para-your-turn' || sessionPhase === 'para-listen' || sessionPhase === 'para-nice') {
      const paraTotal = cfgRef.current?.paragraphs.length ?? 0
      const next = currentParaIdx + 1
      if (next < paraTotal) startParaListen(next)
      else {
        showMsg('Great.', 2000)
        setTimeout(() => { cfgRef.current?.scrollToPatterns(); setTimeout(() => startPatternListen(0), 800) }, 1200)
      }
    } else if (sessionPhase.startsWith('pat')) {
      advanceToNextPattern(currentPatternIdx)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionPhase, currentParaIdx, currentPatternIdx])

  const handleMenuPause = useCallback(() => {
    setMenuOpen(false)
    cfg()?.stopAudio()
    clearWaitTimer()
    setOrbState('paused')
    setTapMode('done')
    setSessionPhase('paused')
    showMsg('Paused.', 99999)
  }, [showMsg])

  const handleMenuExit = useCallback(() => {
    setMenuOpen(false)
    cfg()?.stopAudio()
    cfg()?.onExit()
    endSession()
  }, [endSession])

  /** Public: action confirmation bubble (priority 2). Shows [buttons]. */
  const showAction = useCallback((msg: string, buttons: BubbleButton[], ms = 10000) => {
    if (silentRef.current) return
    const p: MsgPriority = 2
    if (activePriorityRef.current === 1) {
      // Session message active — queue
      msgQueueRef.current.push({ msg, ms, priority: p, buttons })
      return
    }
    if (dismissRef.current) clearTimeout(dismissRef.current)
    activePriorityRef.current = p
    setMessage(msg)
    setBubbleButtons(buttons)
    setIsActive(true)
    dismissRef.current = setTimeout(() => {
      setMessage(null); setBubbleButtons(null); setIsActive(false)
      activePriorityRef.current = 0
      processQueue()
    }, ms)
  }, [processQueue])

  /** Public: showMessage — notification (priority 3). Queues if higher-priority active. */
  const showMessagePub = useCallback((msg: string, ms = 2500) => {
    if (silentRef.current) return
    const p: MsgPriority = 3
    if (activePriorityRef.current <= 2 && activePriorityRef.current !== 0) {
      msgQueueRef.current.push({ msg, ms, priority: p })
      return
    }
    if (dismissRef.current) clearTimeout(dismissRef.current)
    activePriorityRef.current = p
    setMessage(msg)
    setBubbleButtons(null)
    setIsActive(true)
    dismissRef.current = setTimeout(() => {
      setMessage(null); setBubbleButtons(null); setIsActive(false)
      activePriorityRef.current = 0
      processQueue()
    }, ms)
  }, [processQueue])

  // ── Public context value ──────────────────────────────────────────────────

  const value: TrainerCtx = {
    message,
    bubbleButtons,
    isActive,
    isPulsing,
    page,
    showMessage:  showMessagePub,
    showAction,
    clearMessage: clearMsg,
    setSilent:    setSilentFn,
    triggerPulse,
    setPage,

    orbState,
    tapMode,
    isMenuOpen,

    sessionPhase,
    currentParaIdx,
    currentPatternIdx,

    startSession,
    endSession,

    handleOrbTap,
    closeMenu,
    handleMenuRepeat,
    handleMenuSkip,
    handleMenuPause,
    handleMenuExit,
  }

  return (
    <TrainerContext.Provider value={value}>
      {children}
    </TrainerContext.Provider>
  )
}
