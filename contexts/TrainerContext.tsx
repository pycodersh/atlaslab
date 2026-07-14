'use client'

import {
  createContext, useContext, useState, useCallback,
  useRef, type ReactNode,
} from 'react'
import { ttsProvider } from '@/lib/tts'
import {
  type TrainerPage, type OrbState, type OrbTapMode,
  type SessionPhase, type TrainerSessionConfig, type GuidanceTier,
  guidanceTier,
} from '@/lib/trainer/types'
import {
  saveSessionProgress, loadSessionProgress, clearSessionProgress,
  waitDurationMs, recordPaceSample,
} from '@/lib/trainer/store'

// ── Card types ────────────────────────────────────────────────────────────────

export type CardSize = 'small' | 'medium' | 'large'

/** Button inside a Conversation Card */
export interface DockButton {
  label:       string
  onClick:     () => void
  primary?:    boolean
  btnVariant?: 'play' | 'done'   // special styled buttons
}

/** Backward-compat alias */
export type BubbleButton = DockButton

/** Message priority: 1 = session flow, 2 = user action, 3 = notification */
export type MsgPriority = 1 | 2 | 3

export interface CardSpec {
  id:       number        // unique key for animation reset
  size:     CardSize
  message:  string
  subtext?: string        // large card subtitle
  buttons?: DockButton[]
  priority: MsgPriority
  ms?:      number        // auto-dismiss after N ms (small/medium); undefined = manual
  isHelp?:  boolean       // help menu card (special rendering)
}

// ── Re-exports ────────────────────────────────────────────────────────────────

export type { TrainerPage, OrbState, OrbTapMode, SessionPhase }

// ── Public Context API ────────────────────────────────────────────────────────

export interface TrainerCtx {
  // ── Card state ───────────────────────────────────────────────────────────
  card:         CardSpec | null

  // Backward-compat derived fields
  message:      string | null
  bubbleButtons:DockButton[] | null
  isActive:     boolean
  isPulsing:    boolean
  page:         TrainerPage

  // ── New card methods ─────────────────────────────────────────────────────
  /** Small card — text only, auto-dismiss */
  say:      (msg: string, ms?: number) => void
  /** Medium card — text + inline buttons */
  ask:      (msg: string, buttons: DockButton[], subtext?: string) => void
  /** Large card — text + subtext + full-width button */
  announce: (msg: string, subtext: string, btnLabel: string, onAction: () => void) => void

  // Backward-compat aliases
  showMessage:  (msg: string, ms?: number) => void
  showAction:   (msg: string, buttons: DockButton[], ms?: number) => void
  clearMessage: () => void
  setSilent:    (v: boolean) => void
  triggerPulse: () => void
  setPage:      (p: TrainerPage) => void

  // ── Orb state ────────────────────────────────────────────────────────────
  orbState:    OrbState
  tapMode:     OrbTapMode
  isMenuOpen:  boolean     // legacy — now replaced by isHelp card

  // ── Session info ─────────────────────────────────────────────────────────
  sessionPhase:      SessionPhase
  currentParaIdx:    number
  currentPatternIdx: number

  // ── Session control ──────────────────────────────────────────────────────
  startSession:   (cfg: TrainerSessionConfig) => void
  endSession:     () => void
  startBrowsing:  () => void
  endBrowsing:    () => void

  // ── Card play state ──────────────────────────────────────────────────────
  restorePendingAsk: () => boolean
  cardIsPlaying:     boolean
  setCardPlaying:    (v: boolean) => void
  showFlow:          (msg: string, buttons: DockButton[]) => void
  setRepeatCallback:    (fn: (() => void) | null) => void
  setResumeCallback:    (fn: (() => void) | null) => void
  setIdleOrbCallback:   (fn: (() => void) | null) => void

  // ── Orb interaction ──────────────────────────────────────────────────────
  handleOrbTap:      () => void
  handleOrbTapAudio: () => void  // orb tapped while audio is playing
  showHelpMenu:     () => void   // directly show/toggle help menu (for pathname-based detection)
  closeMenu:        () => void
  handleMenuRepeat: () => void
  handleMenuPause:  () => void
  handleMenuExit:   () => void
  resumeFromPause:  () => void
}

// ── Context ───────────────────────────────────────────────────────────────────

export const TrainerContext = createContext<TrainerCtx | null>(null)

export function useTrainer(): TrainerCtx {
  const ctx = useContext(TrainerContext)
  if (!ctx) throw new Error('useTrainer: missing TrainerProvider')
  return ctx
}
export function useTrainerSafe(): TrainerCtx | null {
  return useContext(TrainerContext)
}
// Alias for the new naming
export const useGuideDock  = useTrainerSafe

// ── Provider ──────────────────────────────────────────────────────────────────

let _cardId = 0
const nextId = () => ++_cardId

type QueuedCard = Omit<CardSpec, 'id'>

export function TrainerStateProvider({ children }: { children: ReactNode }) {
  // ── Display ──────────────────────────────────────────────────────────────
  const [card,          setCard]          = useState<CardSpec | null>(null)
  const [isPulsing,     setIsPulsing]     = useState(false)
  const [page,          setPageState]     = useState<TrainerPage>('other')
  const [cardIsPlaying, setCardIsPlaying] = useState(false)

  // ── Session ──────────────────────────────────────────────────────────────
  const [orbState,          setOrbState]          = useState<OrbState>('idle')
  const [tapMode,           setTapMode]           = useState<OrbTapMode>('menu')
  const [sessionPhase,      setSessionPhase]      = useState<SessionPhase>('inactive')
  const sessionPhaseRef = useRef<SessionPhase>('inactive')
  const [currentParaIdx,    setCurrentParaIdx]    = useState(0)
  const [currentPatternIdx, setCurrentPatternIdx] = useState(0)

  // ── Refs ─────────────────────────────────────────────────────────────────
  const pageRef              = useRef<TrainerPage>('other')
  const repeatCallbackRef    = useRef<(() => void) | null>(null)
  const resumeCallbackRef    = useRef<(() => void) | null>(null)
  const idleOrbCallbackRef   = useRef<(() => void) | null>(null)
  const silentRef         = useRef(false)
  const dismissRef        = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pulseRef          = useRef<ReturnType<typeof setTimeout> | null>(null)
  const waitTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const waitFiresRef      = useRef(0)
  const cfgRef            = useRef<TrainerSessionConfig | null>(null)
  const tapStartRef       = useRef<number>(0)
  const activePriorityRef = useRef<MsgPriority | 0>(0)
  const queueRef          = useRef<QueuedCard[]>([])
  // Persistent ask — survives card dismissal so Orb re-tap can restore it
  const currentAskRef     = useRef<QueuedCard | null>(null)

  // ── Helpers ───────────────────────────────────────────────────────────────

  function setPhase(phase: SessionPhase) {
    sessionPhaseRef.current = phase
    setSessionPhase(phase)
  }

  function clearWaitTimer() {
    if (waitTimerRef.current) { clearTimeout(waitTimerRef.current); waitTimerRef.current = null }
    waitFiresRef.current = 0
  }

  const processQueue = useCallback(() => {
    const next = queueRef.current.shift()
    if (!next) { activePriorityRef.current = 0; return }
    const spec: CardSpec = { ...next, id: nextId() }
    activePriorityRef.current = spec.priority
    setCard(spec)
    if (spec.ms) {
      dismissRef.current = setTimeout(() => {
        setCard(null)
        processQueue()
      }, spec.ms)
    }
  }, [])

  const showCard = useCallback((spec: QueuedCard) => {
    if (silentRef.current && spec.priority === 3) return
    if (spec.priority > activePriorityRef.current && activePriorityRef.current !== 0) {
      queueRef.current.push(spec)
      return
    }
    if (dismissRef.current) clearTimeout(dismissRef.current)
    const full: CardSpec = { ...spec, id: nextId() }
    activePriorityRef.current = spec.priority
    setCard(full)
    if (spec.ms) {
      dismissRef.current = setTimeout(() => {
        setCard(null)
        processQueue()
      }, spec.ms)
    }
  }, [processQueue])

  /** Session-flow small card (priority 1, always preempts) */
  const showMsg = useCallback((msg: string, ms = 2500) => {
    if (silentRef.current) return
    if (dismissRef.current) clearTimeout(dismissRef.current)
    const full: CardSpec = { id: nextId(), size: 'small', message: msg, priority: 1, ms }
    activePriorityRef.current = 1
    setCard(full)
    dismissRef.current = setTimeout(() => {
      setCard(null)
      processQueue()
    }, ms)
  }, [processQueue])

  const clearCard = useCallback(() => {
    if (dismissRef.current) clearTimeout(dismissRef.current)
    setCard(null)
    setCardIsPlaying(false)
    activePriorityRef.current = 0
    processQueue()
  }, [processQueue])

  const setSilentFn = useCallback((v: boolean) => {
    silentRef.current = v
    if (v) { clearCard(); queueRef.current = [] }
  }, [clearCard])

  const triggerPulse = useCallback(() => {
    if (pulseRef.current) clearTimeout(pulseRef.current)
    setIsPulsing(true)
    pulseRef.current = setTimeout(() => setIsPulsing(false), 500)
  }, [])

  const setPage = useCallback((p: TrainerPage) => {
    setPageState(p)
    pageRef.current = p
    currentAskRef.current = null
    clearCard()
    silentRef.current = false
  }, [clearCard])

  // ── Play card helpers ────────────────────────────────────────────────────

  const setCardPlaying = useCallback((v: boolean) => {
    setCardIsPlaying(v)
  }, [])

  /** Session-flow medium card with buttons, no auto-dismiss */
  const showFlow = useCallback((msg: string, buttons: DockButton[]) => {
    if (dismissRef.current) clearTimeout(dismissRef.current)
    const full: CardSpec = { id: nextId(), size: 'medium', message: msg, buttons, priority: 1 }
    activePriorityRef.current = 1
    setCard(full)
  }, [])

  const setRepeatCallback = useCallback((fn: (() => void) | null) => {
    repeatCallbackRef.current = fn
  }, [])

  const setResumeCallback = useCallback((fn: (() => void) | null) => {
    resumeCallbackRef.current = fn
  }, [])

  const setIdleOrbCallback = useCallback((fn: (() => void) | null) => {
    idleOrbCallbackRef.current = fn
  }, [])

  // ── New card API ─────────────────────────────────────────────────────────

  const say = useCallback((msg: string, ms = 2000) => {
    showCard({ size: 'small', message: msg, priority: 3, ms })
  }, [showCard])

  const ask = useCallback((msg: string, buttons: DockButton[], subtext?: string) => {
    // Wrap each button onClick to clear currentAsk when user makes a choice
    const wrappedButtons: DockButton[] = buttons.map(b => ({
      ...b,
      onClick: () => { currentAskRef.current = null; b.onClick() },
    }))
    const spec: QueuedCard = { size: 'medium', message: msg, buttons: wrappedButtons, subtext, priority: 2 }
    currentAskRef.current = spec   // save so Orb re-tap can restore it
    showCard(spec)                 // no ms — ask cards never auto-dismiss
  }, [showCard])

  const announce = useCallback((msg: string, subtext: string, btnLabel: string, onAction: () => void) => {
    currentAskRef.current = null   // advancing past any pending ask
    showCard({
      size: 'large', message: msg, subtext, priority: 2,
      buttons: [{ label: btnLabel, primary: true, onClick: () => { clearCard(); onAction() } }],
    })
  }, [showCard, clearCard])

  // ── Backward-compat ──────────────────────────────────────────────────────

  const showMessage = useCallback((msg: string, ms = 2500) => {
    showCard({ size: 'small', message: msg, priority: 3, ms })
  }, [showCard])

  const showAction = useCallback((msg: string, buttons: DockButton[], ms?: number) => {
    showCard({ size: 'medium', message: msg, buttons, priority: 2, ms })
  }, [showCard])

  // ── Session phase helpers ─────────────────────────────────────────────────

  const cfg  = () => cfgRef.current
  const tier = (): GuidanceTier => guidanceTier(cfgRef.current?.round ?? 0)

  const goPhase = useCallback((phase: SessionPhase, paraIdx?: number, patIdx?: number) => {
    setPhase(phase)
    const c = cfgRef.current; if (!c) return
    if (paraIdx  !== undefined) setCurrentParaIdx(paraIdx)
    if (patIdx   !== undefined) setCurrentPatternIdx(patIdx)
    const pi  = paraIdx  ?? currentParaIdx
    const pti = patIdx   ?? currentPatternIdx
    if (phase !== 'inactive' && phase !== 'paused' && phase !== 'session-done') {
      saveSessionProgress({ storyId: c.storyId, phase, paraIdx: pi, patternIdx: pti, savedAt: Date.now() })
    }
  }, [currentParaIdx, currentPatternIdx])

  // ── Para flow ─────────────────────────────────────────────────────────────

  const startParaListen = useCallback((idx: number) => {
    const c = cfg(); if (!c) return
    setCurrentParaIdx(idx)
    setOrbState('guiding')
    setTapMode('menu')
    clearWaitTimer()
    if (tier() !== 'silent') showMsg('Listen.', 3000)
    goPhase('para-listen', idx)
    c.scrollToParagraph(idx)
    setTimeout(() => c.playParagraphAudio(idx, () => startParaYourTurn(idx)), 400)
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
    const waitMs = waitDurationMs(c.storyId)
    const scheduleWait = (fires: number) => {
      waitTimerRef.current = setTimeout(() => {
        if (fires === 0) {
          showMsg('Need another listen?', 3000)
          setTimeout(() => c.playParagraphAudio(idx, () => startParaYourTurn(idx)), 1500)
        } else {
          showMsg('Take your time.', 5000)
        }
        waitFiresRef.current = fires + 1
        if (fires === 0) scheduleWait(1)
      }, waitMs)
    }
    scheduleWait(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goPhase, showMsg])

  const confirmParaDone = useCallback(() => {
    const c = cfg(); if (!c) return
    clearWaitTimer()
    if (tapStartRef.current) recordPaceSample(c.storyId, Date.now() - tapStartRef.current)
    const t = tier()
    if (t === 'full' || t === 'lite') showMsg('Nice.', 900)
    setOrbState('idle'); setTapMode('menu')
    goPhase('para-nice', currentParaIdx)
    const delay = (t === 'full' || t === 'lite') ? 1000 : 300
    setTimeout(() => {
      const paraTotal = cfgRef.current?.paragraphs.length ?? 0
      const nextIdx   = currentParaIdx + 1
      if (nextIdx < paraTotal) {
        startParaListen(nextIdx)
      } else {
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

  // ── Pattern flow ──────────────────────────────────────────────────────────

  const startPatternListen = useCallback((idx: number) => {
    const c = cfg(); if (!c) return
    setCurrentPatternIdx(idx); setOrbState('guiding'); setTapMode('menu'); clearWaitTimer()
    if (tier() !== 'silent') showMsg('Listen.', 3000)
    goPhase('pat-listen', undefined, idx)
    setTimeout(() => c.playPatternAudio(idx, () => startPatternYourTurn1(idx)), 400)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goPhase, showMsg])

  const startPatternYourTurn1 = useCallback((idx: number) => {
    tapStartRef.current = Date.now(); setOrbState('waiting'); setTapMode('done')
    if (tier() !== 'silent') showMsg('Your turn.', 4000)
    goPhase('pat-your-turn-1', undefined, idx)
    const waitMs = waitDurationMs(cfgRef.current?.storyId ?? 0)
    waitTimerRef.current = setTimeout(() => {
      showMsg('Need another listen?', 3000)
      setTimeout(() => cfgRef.current?.playPatternAudio(idx, () => startPatternYourTurn1(idx)), 1500)
    }, waitMs)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goPhase, showMsg])

  const confirmPatternYourTurn1 = useCallback((idx: number) => {
    const c = cfg(); if (!c) return
    clearWaitTimer()
    if (tapStartRef.current) recordPaceSample(c.storyId, Date.now() - tapStartRef.current)
    if (tier() !== 'full') { advanceToNextPattern(idx); return }
    setOrbState('guiding'); setTapMode('menu')
    showMsg('Again.', 2500)
    goPhase('pat-again', undefined, idx)
    setTimeout(() => c.playPatternAudio(idx, () => startPatternYourTurn2(idx)), 600)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goPhase, showMsg])

  const startPatternYourTurn2 = useCallback((idx: number) => {
    tapStartRef.current = Date.now(); setOrbState('waiting'); setTapMode('done')
    showMsg('Your turn.', 4000)
    goPhase('pat-your-turn-2', undefined, idx)
    const waitMs = waitDurationMs(cfgRef.current?.storyId ?? 0)
    waitTimerRef.current = setTimeout(() => {
      showMsg('Need another listen?', 3000)
      setTimeout(() => cfgRef.current?.playPatternAudio(idx, () => startPatternYourTurn2(idx)), 1500)
    }, waitMs)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goPhase, showMsg])

  const advanceToNextPattern = useCallback((idx: number) => {
    const c = cfg(); if (!c) return
    clearWaitTimer()
    const t = tier(); const next = idx + 1; const patTotal = c.patterns.length
    if (t === 'full') showMsg('Next.', 1000)
    setOrbState('idle'); setTapMode('menu')
    goPhase('pat-next', undefined, idx)
    setTimeout(() => {
      if (next < patTotal) {
        c.advancePatternCard(next); setTimeout(() => startPatternListen(next), 500)
      } else {
        goPhase('session-done', undefined, idx)
        showMsg('Done.', 3000)
        setOrbState('idle'); triggerPulse()
        clearSessionProgress(c.storyId)
        setTimeout(() => c.onSessionComplete(), 1500)
      }
    }, t === 'full' ? 800 : 300)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goPhase, showMsg, startPatternListen, triggerPulse])

  // ── startSession ──────────────────────────────────────────────────────────

  const startSession = useCallback((config: TrainerSessionConfig) => {
    cfgRef.current = config; clearWaitTimer()
    const saved = loadSessionProgress(config.storyId)
    if (saved && saved.paraIdx > 0 && saved.phase !== 'inactive' && saved.phase !== 'session-done') {
      setCurrentParaIdx(saved.paraIdx); setCurrentPatternIdx(saved.patternIdx)
      setOrbState('waiting'); setTapMode('menu')
      showMsg('Welcome back. Let\'s continue.', 3000)
      goPhase('ready')
      setTimeout(() => {
        if (saved.phase.startsWith('para')) startParaListen(saved.paraIdx)
        else if (saved.phase.startsWith('pat')) {
          config.scrollToPatterns()
          setTimeout(() => startPatternListen(saved.patternIdx), 600)
        }
      }, 2500)
      return
    }
    const t = guidanceTier(config.round)
    setCurrentParaIdx(0); setCurrentPatternIdx(0)
    setOrbState('waiting'); setTapMode('done')
    goPhase('ready')
    if (t === 'silent') {
      showMsg('Ready.', 1500); setTimeout(() => startParaListen(0), 2000); return
    }
    showMsg('Ready?', 2500)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goPhase, showMsg, startParaListen, startPatternListen])

  // ── endSession ────────────────────────────────────────────────────────────

  const endSession = useCallback(() => {
    cfgRef.current = null; clearWaitTimer()
    currentAskRef.current = null
    setSessionPhase('inactive'); setOrbState('idle'); setTapMode('menu')
    setCurrentParaIdx(0); setCurrentPatternIdx(0)
    clearCard()
  }, [clearCard])

  const startBrowsing = useCallback(() => {
    setSessionPhase('browsing')
  }, [])

  const endBrowsing = useCallback(() => {
    setSessionPhase('inactive')
    clearCard()
  }, [clearCard])

  // ── Orb tap ───────────────────────────────────────────────────────────────

  const handleOrbTap = useCallback(() => {
    // If a card is open (not help), dismiss it (but keep currentAskRef so re-tap restores it)
    if (card && !card.isHelp) { clearCard(); return }
    // If help card is open, close it
    if (card?.isHelp) { clearCard(); return }

    // No card visible — restore a persistent ask if one is pending
    if (currentAskRef.current) {
      showCard(currentAskRef.current)
      return
    }

    if (sessionPhase === 'paused') {
      ask('이어서 할까요?', [{
        label: 'Resume',
        primary: true,
        onClick: () => {
          ttsProvider.resume?.()
          setOrbState('idle'); setTapMode('menu'); setSessionPhase('inactive')
          showMsg("Let's continue.", 2000)
          resumeCallbackRef.current?.()
        },
      }])
      return
    }

    if (tapMode === 'menu') {
      if (sessionPhase !== 'inactive' && pageRef.current !== 'story') {
        // Show help menu card (session pages only, not browse mode)
        setCard({
          id: nextId(), size: 'medium', message: 'Need help?', priority: 1, isHelp: true,
        })
        activePriorityRef.current = 1
      } else {
        // Orb tapped while idle — let the page register a custom handler
        idleOrbCallbackRef.current?.()
      }
      return
    }
    // tapMode === 'done'
    if (sessionPhase === 'ready') {
      const t = tier()
      if (t === 'minimal') { showMsg('Ready.', 800); setTimeout(() => startParaListen(0), 1000) }
      else startParaListen(0)
      setTapMode('menu'); return
    }
    if (sessionPhase === 'para-your-turn')  { confirmParaDone(); return }
    if (sessionPhase === 'pat-your-turn-1') { confirmPatternYourTurn1(currentPatternIdx); return }
    if (sessionPhase === 'pat-your-turn-2') { advanceToNextPattern(currentPatternIdx); return }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, tapMode, sessionPhase, currentPatternIdx, showMsg, showCard, clearCard, ask,
      startParaListen, confirmParaDone, confirmPatternYourTurn1, advanceToNextPattern])

  const closeMenu = useCallback(() => {
    if (card?.isHelp) clearCard()
  }, [card, clearCard])

  const handleMenuRepeat = useCallback(() => {
    clearCard()
    showMsg('Playing again.', 2000)
    const c = cfg()
    if (!c) {
      repeatCallbackRef.current?.()
      return
    }
    if (sessionPhase === 'para-your-turn' || sessionPhase === 'para-listen')
      c.playParagraphAudio(currentParaIdx, () => startParaYourTurn(currentParaIdx))
    else if (sessionPhase.startsWith('pat'))
      c.playPatternAudio(currentPatternIdx, () => startPatternYourTurn1(currentPatternIdx))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, sessionPhase, currentParaIdx, currentPatternIdx, clearCard, showMsg])

  const handleOrbTapAudio = useCallback(() => {
    ttsProvider.pause?.()
    clearWaitTimer()
    setCardIsPlaying(false)
    showCard({
      size: 'medium', message: 'Listen again?', priority: 1,
      buttons: [
        { label: 'Replay', onClick: () => {
          ttsProvider.stop?.()
          repeatCallbackRef.current?.()
        }},
        { label: 'Continue', primary: true, onClick: () => {
          ttsProvider.resume?.()
          setCardIsPlaying(true)
        }},
      ],
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCard])

  const handleMenuPause = useCallback(() => {
    clearCard()
    ttsProvider.pause?.()
    cfg()?.stopAudio?.()
    clearWaitTimer()
    setOrbState('paused'); setTapMode('done'); setSessionPhase('paused')
    showMsg('Paused.', 2000)
  }, [clearCard, showMsg])

  const resumeFromPause = useCallback(() => {
    if (sessionPhase !== 'paused') return
    ttsProvider.resume?.()
    setOrbState('idle'); setTapMode('menu'); setSessionPhase('inactive')
    showMsg("Let's continue.", 2000)
    resumeCallbackRef.current?.()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionPhase, showMsg])

  const handleMenuExit = useCallback(() => {
    const isBrowsing = sessionPhaseRef.current === 'browsing'
    clearCard()
    showCard({
      size: 'medium', message: '세션을 종료할까요?', priority: 1,
      buttons: [
        { label: '계속하기', primary: true, onClick: () => {} },
        {
          label: 'Exit',
          onClick: () => {
            if (isBrowsing) {
              showMsg('See you.', 2000)
              setTimeout(() => endBrowsing(), 1800)
            } else {
              cfg()?.stopAudio()
              showMsg('See you.', 2000)
              setTimeout(() => { cfg()?.onExit(); endSession() }, 1800)
            }
          },
        },
      ],
    })
  }, [clearCard, showCard, showMsg, endSession, endBrowsing])

  // Directly show/toggle help menu — used by GuideDock when on study pages
  // (where startSession() isn't called, so sessionPhase stays 'inactive')
  const showHelpMenu = useCallback(() => {
    // Any open card → close it
    if (card) { clearCard(); return }
    // No card — restore pending ask if one exists
    if (currentAskRef.current) { showCard(currentAskRef.current); return }
    // Paused → resume
    if (sessionPhase === 'paused') {
      setOrbState('waiting'); setTapMode('menu'); setSessionPhase('para-your-turn')
      showMsg("Let's continue.", 2500)
      return
    }
    // Show help menu
    const spec: CardSpec = { id: nextId(), size: 'medium', message: 'Need help?', priority: 1, isHelp: true }
    activePriorityRef.current = 1
    setCard(spec)
  }, [card, sessionPhase, showCard, clearCard, showMsg])

  // ── Context value ─────────────────────────────────────────────────────────

  const value: TrainerCtx = {
    card,
    // Backward-compat derived
    message:       card?.message ?? null,
    bubbleButtons: card?.buttons ?? null,
    isActive:      card !== null,
    isPulsing,
    page,

    say, ask, announce,
    showMessage, showAction,
    clearMessage: clearCard,
    setSilent:    setSilentFn,
    triggerPulse,
    setPage,

    restorePendingAsk: () => {
      if (currentAskRef.current) { showCard(currentAskRef.current); return true }
      if (idleOrbCallbackRef.current) { idleOrbCallbackRef.current(); return true }
      return false
    },
    cardIsPlaying, setCardPlaying, showFlow, setRepeatCallback, setResumeCallback, setIdleOrbCallback,

    orbState, tapMode,
    isMenuOpen: card?.isHelp ?? false,

    sessionPhase, currentParaIdx, currentPatternIdx,
    startSession, endSession, startBrowsing, endBrowsing,
    handleOrbTap, handleOrbTapAudio, showHelpMenu, closeMenu,
    handleMenuRepeat, handleMenuPause, handleMenuExit, resumeFromPause,
  }

  return (
    <TrainerContext.Provider value={value}>
      {children}
    </TrainerContext.Provider>
  )
}
