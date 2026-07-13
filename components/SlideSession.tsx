'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { useTrainerSafe } from '@/contexts/TrainerContext'
import { useAuth } from '@/contexts/AuthContext'
import { useSpeech } from '@/hooks/useSpeech'
import { usePreferences } from '@/contexts/PreferencesContext'
import { storyParaAudioUrl } from '@/lib/tts'
import { DailyChallengeSlide } from '@/components/DailyChallengeSlide'
import {
  getStoryRound,
  getRecallCount,
  completeStoryRound,
  nextReviewLabel,
  type StoryRoundData,
} from '@/lib/srs/story-round'
import { syncStoryRoundToSupabase } from '@/lib/srs/supabase-sync'
import { completeStoryAndScheduleReview } from '@/lib/learning-progress'
import { useLearningProgress } from '@/hooks/useLearningProgress'
import type { MagazineStory } from '@/types/magazine'
import {
  getLearnerLevel,
  getTrainerIntensity,
  getSlideDelay,
  loadStats,
  onSessionStart,
  onSessionComplete,
  onDoneTap,
  recordSessionSignal,
  getSessionAdaptAction,
  loadSessionAdapt,
} from '@/lib/adaptive/adaptive-engine'
import { syncStatsToSupabase } from '@/lib/adaptive/supabase-sync'

// ── Types ─────────────────────────────────────────────────────────────────────

type Slide =
  | { kind: 'intro' }
  | { kind: 'paragraph'; idx: number }
  | { kind: 'pattern'; idx: number }
  | { kind: 'hide-recall'; round: number; patIdx: number }
  | { kind: 'daily-challenge' }
  | { kind: 'complete' }

export type SlideSessionProps = {
  story: MagazineStory
  isGuided: boolean
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PATTERN_PROGRESS = ['', '계속해요.', '절반 왔어요.', '거의 다 왔어요.', '마지막이에요.']
const RECALL_ROUND_MSGS = ['한 번 더 해볼게요.', '한 번 더요.', '마지막이에요.']

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ emoji, label, value, accent }: {
  emoji: string; label: string; value: string; accent: string
}) {
  return (
    <div style={{
      flex: 1, borderRadius: 14, padding: '14px 10px',
      background: `${accent}14`,
      border: `0.5px solid ${accent}38`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    }}>
      <span style={{ fontSize: 18 }}>{emoji}</span>
      <span style={{ fontSize: 16, fontWeight: 700, color: accent, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--pt)', opacity: 0.45, textTransform: 'uppercase' }}>{label}</span>
    </div>
  )
}

function IntroSlide({ story, currentRound }: { story: MagazineStory; currentRound: number }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={story.imageUrl} alt={story.imageAlt}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{ position: 'relative', textAlign: 'center', padding: '0 32px' }}>
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
          color: 'rgba(255,255,255,0.5)', margin: '0 0 12px', textTransform: 'uppercase',
        }}>
          STORY {String(story.id).padStart(2, '0')}
          {currentRound > 0 && ` · ROUND ${currentRound + 1}`}
        </p>
        <h1 style={{
          fontSize: 'clamp(22px, 5.5vw, 34px)', fontWeight: 900,
          color: '#fff', margin: 0, lineHeight: 1.15,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          letterSpacing: '-0.02em',
        }}>
          {story.title}
        </h1>
      </div>
    </div>
  )
}

function ParagraphSlide({ story, idx }: { story: MagazineStory; idx: number }) {
  const para = story.paragraphs[idx]
  const total = story.paragraphs.length
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
      <p style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.16em',
        color: 'var(--pm2)', textTransform: 'uppercase', margin: '24px 0 32px',
      }}>
        Story · 문단 {idx + 1}/{total}
      </p>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <p style={{
          fontSize: 'clamp(17px, 4.5vw, 24px)', fontWeight: 500,
          color: 'var(--pt)', lineHeight: 1.65, margin: 0,
        }}>
          {para.english}
        </p>
      </div>
    </div>
  )
}

function PatternSlide({ story, idx }: { story: MagazineStory; idx: number }) {
  const pat = story.patterns[idx]
  const total = story.patterns.length
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
      <p style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.16em',
        color: 'var(--pm2)', textTransform: 'uppercase', margin: '24px 0 32px',
      }}>
        Pattern {idx + 1} / {total}
      </p>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div style={{
          background: 'var(--pglass)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--pglass-border)',
          borderRadius: 20, padding: '24px 22px', width: '100%',
        }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--pt)', margin: '0 0 5px', lineHeight: 1.3 }}>
            {pat.pattern}
          </p>
          <p style={{ fontSize: 13, color: 'var(--pm)', margin: '0 0 18px' }}>
            {pat.meaningKo}
          </p>
          <div style={{ borderTop: '1px solid var(--pd)', paddingTop: 14 }}>
            <p style={{ fontSize: 14, color: 'var(--pt)', margin: '0 0 4px', lineHeight: 1.55, fontWeight: 500 }}>
              {pat.storySentence}
            </p>
            <p style={{ fontSize: 12, color: 'var(--pm)', margin: 0, lineHeight: 1.55 }}>
              {pat.storySentenceKo}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function HideRecallSlide({ story, patIdx, revealed, onReveal }: {
  story: MagazineStory; patIdx: number; revealed: boolean; onReveal: () => void
}) {
  const pat = story.patterns[patIdx]
  const total = story.patterns.length
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
      <p style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.16em',
        color: 'var(--pm2)', textTransform: 'uppercase', margin: '24px 0 32px',
      }}>
        Recall · {patIdx + 1} / {total}
      </p>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onReveal}
          style={{
            background: revealed ? 'var(--pglass)' : 'rgba(107,143,255,0.05)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: revealed ? '1px solid var(--pglass-border)' : '1.5px dashed rgba(107,143,255,0.22)',
            borderRadius: 20, padding: '24px 22px', width: '100%',
            textAlign: 'left', cursor: revealed ? 'default' : 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Pattern — hidden until revealed */}
          <div style={{ marginBottom: 8, minHeight: 32 }}>
            {revealed ? (
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--pt)', margin: 0, lineHeight: 1.3 }}>
                {pat.pattern}
              </p>
            ) : (
              <div style={{
                height: 32, borderRadius: 8,
                background: 'rgba(107,143,255,0.08)',
                display: 'flex', alignItems: 'center', paddingLeft: 12,
              }}>
                <p style={{ fontSize: 12, color: 'rgba(107,143,255,0.55)', margin: 0, fontWeight: 500 }}>
                  탭해서 보기
                </p>
              </div>
            )}
          </div>
          {/* Korean — always visible */}
          <p style={{ fontSize: 13, color: 'var(--pm)', margin: '0 0 18px' }}>
            {pat.meaningKo}
          </p>
          <div style={{ borderTop: '1px solid var(--pd)', paddingTop: 14 }}>
            <p style={{ fontSize: 12, color: 'var(--pm)', margin: 0, lineHeight: 1.55 }}>
              {pat.storySentenceKo}
            </p>
            {revealed && (
              <p style={{
                fontSize: 14, color: 'var(--pt)', margin: '8px 0 0', lineHeight: 1.55, fontWeight: 500,
                animation: 'ssReveal 0.25s ease-out both',
              }}>
                {pat.storySentence}
              </p>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}


function CompleteSlide({ story, completionData, elapsedMin, isGuided }: {
  story: MagazineStory; completionData: StoryRoundData | null; elapsedMin: number; isGuided: boolean
}) {
  if (!completionData) return null
  const reviewLbl = nextReviewLabel(completionData)
  return (
    <div style={{
      padding: '40px 24px 140px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflowY: 'auto',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 22,
        background: 'linear-gradient(135deg, rgba(215,181,109,0.2), rgba(215,181,109,0.08))',
        border: '0.5px solid rgba(215,181,109,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
      }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
          stroke="#D7B56D" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <p style={{ margin: '0 0 6px', fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--pm2)', textTransform: 'uppercase' }}>
        {completionData.isMastered ? 'Mastered' : 'Session Complete'}
      </p>
      <h2 style={{
        margin: '0 0 6px', fontSize: 20, fontWeight: 700, color: 'var(--pt)',
        textAlign: 'center', lineHeight: 1.3,
        fontFamily: 'var(--font-playfair), Georgia, serif',
      }}>
        {story.title}
      </h2>
      <p style={{ margin: '0 0 28px', fontSize: 10, color: 'var(--pm2)' }}>
        Round {completionData.round} · {story.patterns.length} patterns · {elapsedMin} min
      </p>
      <div style={{ display: 'flex', gap: 8, width: '100%', marginBottom: 20 }}>
        <StatCard emoji="🔥" label="Streak" value={String(completionData.round)} accent="#D7B56D" />
        <StatCard emoji="⚡" label="Patterns" value={String(story.patterns.length)} accent="#6B8FFF" />
        <StatCard emoji="⏱" label="Time" value={`${elapsedMin}m`} accent="#9B7FE8" />
      </div>
      {!completionData.isMastered && reviewLbl && (
        <p style={{ fontSize: 10, color: 'var(--pm2)', marginBottom: 0 }}>
          다음 복습: {reviewLbl}
        </p>
      )}
      {isGuided && (
        <p style={{ fontSize: 11, color: 'var(--pm)', marginTop: 8, textAlign: 'center', lineHeight: 1.5 }}>
          첫 세션을 완료했어요.{'\n'}내일 다시 만나요!
        </p>
      )}
    </div>
  )
}

// ── sessionStorage helpers ─────────────────────────────────────────────────────

type SavedSlide = { kind: string; idx?: number; round?: number; patIdx?: number }

function ssKey(storyId: number) { return `patto_session_${storyId}` }

function saveSlide(storyId: number, s: Slide) {
  try { sessionStorage.setItem(ssKey(storyId), JSON.stringify(s)) } catch {}
}

function loadSlide(storyId: number): Slide | null {
  try {
    const raw = sessionStorage.getItem(ssKey(storyId))
    if (!raw) return null
    const s = JSON.parse(raw) as SavedSlide
    // Don't restore complete — always restart from intro if somehow saved
    if (s.kind === 'complete') return null
    return s as Slide
  } catch { return null }
}

function clearSavedSlide(storyId: number) {
  try { sessionStorage.removeItem(ssKey(storyId)) } catch {}
}

// ── Main SlideSession ──────────────────────────────────────────────────────────

export function SlideSession({ story, isGuided }: SlideSessionProps) {
  const router = useRouter()
  const trainer = useTrainerSafe()
  const trainerRef = useRef(trainer)
  trainerRef.current = trainer

  const { user } = useAuth()
  const { speakAll, stop: stopSpeech } = useSpeech()
  const { prefs } = usePreferences()
  const { setProgress } = useLearningProgress()

  const narrator = story.narratorVoice ?? prefs.voice
  const currentRound = getStoryRound(story.id).round
  const totalRecallRounds = getRecallCount(currentRound)

  const [slide, setSlide] = useState<Slide>(() => loadSlide(story.id) ?? { kind: 'intro' })
  const [animKey, setAnimKey] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [completionData, setCompletionData] = useState<StoryRoundData | null>(null)
  const [elapsedMin, setElapsedMin] = useState(1)

  const sessionStartRef = useRef(Date.now())
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const completedRef = useRef(false)
  const slideRef = useRef<Slide>(slide)
  slideRef.current = slide

  // ── Adaptive engine state ──────────────────────────────────────────────────
  const adaptStats = loadStats()
  const level = getLearnerLevel(adaptStats)
  const intensity = getTrainerIntensity(level)
  const slideDelay = getSlideDelay(adaptStats)
  // isSilent: goes true mid-session if user taps Done 3× fast
  const isSilentRef = useRef(intensity === 'silent')
  // timestamp of last card presentation (for response time tracking)
  const cardShownAtRef = useRef<number | null>(null)

  // ── Adaptive: call onSessionStart once on mount ────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onSessionStart() }, [])

  // ── Timer helpers ──────────────────────────────────────────────────────────

  function addTimer(t: ReturnType<typeof setTimeout>) {
    timersRef.current.push(t)
  }
  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  // ── Navigation primitive ───────────────────────────────────────────────────

  function goTo(next: Slide) {
    clearTimers()
    stopSpeech()
    trainerRef.current?.clearMessage()
    setRevealed(false)
    saveSlide(story.id, next)
    setSlide(next)
    setAnimKey(k => k + 1)
  }

  // ── After-done transitions ─────────────────────────────────────────────────

  function afterDone(next: Slide, bridgeMsg?: string, bridgeMs = 1500) {
    clearTimers()
    trainerRef.current?.clearMessage()
    if (bridgeMsg) {
      if (!isSilentRef.current) trainerRef.current?.say(bridgeMsg, bridgeMs)
      addTimer(setTimeout(() => goTo(next), isSilentRef.current ? slideDelay : bridgeMs + 200))
    } else {
      if (!isSilentRef.current) trainerRef.current?.say("좋아요.", 1000)
      addTimer(setTimeout(() => goTo(next), isSilentRef.current ? slideDelay : 1200))
    }
  }

  // ── Slide-specific done handlers ───────────────────────────────────────────

  function handleParaDone(idx: number) {
    const isLast = idx === story.paragraphs.length - 1
    if (isLast) afterDone({ kind: 'pattern', idx: 0 }, "이제 패턴을 연습해볼게요.", 1800)
    else         afterDone({ kind: 'paragraph', idx: idx + 1 })
  }

  function handlePatternDone(idx: number) {
    const isLast = idx === story.patterns.length - 1
    if (isLast) afterDone({ kind: 'hide-recall', round: 1, patIdx: 0 }, "잘하셨어요.", 1800)
    else        afterDone({ kind: 'pattern', idx: idx + 1 })
  }

  function handleRecallDone(round: number, patIdx: number) {
    const isLastPat   = patIdx === story.patterns.length - 1
    const isLastRound = round >= totalRecallRounds
    if (!isLastPat) {
      afterDone({ kind: 'hide-recall', round, patIdx: patIdx + 1 })
    } else if (!isLastRound) {
      const msg = RECALL_ROUND_MSGS[Math.min(round - 1, 2)]
      trainerRef.current?.say(msg, 1500)
      addTimer(setTimeout(() => goTo({ kind: 'hide-recall', round: round + 1, patIdx: 0 }), 1700))
    } else {
      afterDone({ kind: 'daily-challenge' })
    }
  }

  // ── Audio end → show "따라해보세요." + Done ────────────────────────────────

  function makeOnEnd(doneHandler: () => void): () => void {
    return () => {
      trainerRef.current?.setCardPlaying(false)
      trainerRef.current?.clearMessage()
      cardShownAtRef.current = Date.now()

      const wrappedDone = () => {
        // Track response time
        if (cardShownAtRef.current !== null) {
          const rt = Date.now() - cardShownAtRef.current
          onDoneTap(rt)
          const signal = rt < 3000 ? 'fast' : rt > 7000 ? 'slow' : null
          if (signal) {
            const adaptState = recordSessionSignal(signal)
            const action = getSessionAdaptAction(adaptState)
            if (action.type === 'go_silent') {
              isSilentRef.current = true
              trainerRef.current?.setSilent?.(true)
            } else if (action.type === 'encourage_slow') {
              trainerRef.current?.say("천천히 해도 괜찮아요.", 2000)
            }
          }
          cardShownAtRef.current = null
        }
        doneHandler()
      }

      addTimer(setTimeout(() => {
        if (isSilentRef.current) {
          // silent: show Done button without verbal prompt
          trainerRef.current?.ask("", [{
            label: 'Done', btnVariant: 'done', onClick: wrappedDone,
          }])
        } else {
          trainerRef.current?.ask("따라해보세요.", [{
            label: 'Done', btnVariant: 'done', onClick: wrappedDone,
          }])
        }
      }, 200))
    }
  }

  // ── Reveal (hide-recall tap) ───────────────────────────────────────────────

  function handleReveal() {
    if (revealed) return
    stopSpeech()
    setRevealed(true)
  }

  useEffect(() => {
    if (slide.kind !== 'hide-recall' || !revealed) return
    const s = slide
    clearTimers()
    addTimer(setTimeout(() => {
      trainerRef.current?.ask("따라해보세요.", [{
        label: 'Done', btnVariant: 'done',
        onClick: () => handleRecallDone(s.round, s.patIdx),
      }])
    }, 400))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed])

  // ── Slide init on each advance ─────────────────────────────────────────────

  useEffect(() => {
    trainer?.setPage('session')
    clearTimers()
    const t = trainerRef.current
    const s = slideRef.current

    switch (s.kind) {
      case 'intro': {
        const msg = isGuided
          ? "첫 번째 스토리예요. 먼저 들어보고 따라해볼게요."
          : intensity === 'silent' ? "시작할까요?" : "준비됐나요?"
        if (isGuided) {
          t?.say("안녕하세요! 함께 시작해볼게요.", 2500)
          addTimer(setTimeout(() => {
            trainerRef.current?.ask(msg, [
              { label: 'Start', primary: true, onClick: () => goTo({ kind: 'paragraph', idx: 0 }) },
            ])
          }, 3000))
        } else {
          addTimer(setTimeout(() => {
            trainerRef.current?.ask(msg, [
              { label: 'Start', primary: true, onClick: () => goTo({ kind: 'paragraph', idx: 0 }) },
            ])
          }, 800))
        }
        break
      }

      case 'paragraph': {
        const { idx } = s
        const para = story.paragraphs[idx]
        const msg = idx === 0 && isGuided
          ? "첫 번째 문단이에요. 먼저 들어보세요."
          : "들어보세요."
        addTimer(setTimeout(() => {
          trainerRef.current?.ask(msg, [{
            label: 'Play', btnVariant: 'play',
            onClick: () => {
              trainerRef.current?.setCardPlaying(true)
              speakAll(
                [para.english],
                [storyParaAudioUrl(narrator, story.id, para.id, para.english)],
                { voiceKey: narrator, onEnd: makeOnEnd(() => handleParaDone(idx)) },
              )
            },
          }])
        }, 400))
        break
      }

      case 'pattern': {
        const { idx } = s
        const pat = story.patterns[idx]
        const progressMsg = PATTERN_PROGRESS[idx]
        const msg = idx === 0 && isGuided
          ? "스토리에서 나온 패턴이에요. 먼저 들어보세요."
          : "들어보세요."

        const showCard = () => {
          trainerRef.current?.ask(msg, [{
            label: 'Play', btnVariant: 'play',
            onClick: () => {
              trainerRef.current?.setCardPlaying(true)
              speakAll(
                [pat.storySentence],
                undefined,
                { voiceKey: narrator, onEnd: makeOnEnd(() => handlePatternDone(idx)) },
              )
            },
          }])
        }

        // Show encouragement messages only for full/moderate intensity
        if (progressMsg && intensity !== 'minimal' && intensity !== 'silent') {
          t?.say(progressMsg, 1500)
          addTimer(setTimeout(showCard, 1800))
        } else {
          addTimer(setTimeout(showCard, 400))
        }
        break
      }

      case 'hide-recall': {
        const { round, patIdx } = s
        const showRecallPrompt = intensity !== 'silent'
        if (patIdx === 0 && round > 1 && intensity === 'full') {
          const msg = RECALL_ROUND_MSGS[Math.min(round - 2, 2)]
          t?.say(msg, 1500)
          addTimer(setTimeout(() => showRecallPrompt && trainerRef.current?.say("떠올려보세요.", 2000), 1700))
        } else {
          addTimer(setTimeout(() => showRecallPrompt && trainerRef.current?.say("떠올려보세요.", 2000), 400))
        }
        break
      }

      case 'daily-challenge': {
        // DailyChallengeSlide handles all trainer interactions internally
        break
      }

      case 'complete': {
        clearSavedSlide(story.id)
        if (!completedRef.current) {
          completedRef.current = true
          const elapsed = Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 60000))
          setElapsedMin(elapsed)
          const data = completeStoryRound(story.id)
          setCompletionData(data)
          const patternIds = story.patterns.map(p => p.id)
          setProgress(prev => completeStoryAndScheduleReview(prev, String(story.id), patternIds, 1, 1))
          if (user?.id) syncStoryRoundToSupabase(user.id, data)
          onSessionComplete(story.patterns.length)
          if (user?.id) syncStatsToSupabase(user.id)
          if (isGuided) {
            try {
              localStorage.setItem('is_guided_session', 'false')
              localStorage.setItem('is_onboarding_complete', 'true')
            } catch {}
          }
        }
        // silent mode: skip completion message
        const completionMsg = isSilentRef.current
          ? ''
          : isGuided ? "첫 번째 세션을 완료했어요!" : "오늘도 잘하셨어요."
        addTimer(setTimeout(() => {
          trainerRef.current?.announce(completionMsg, '', 'Finish', () => router.push('/patto/home'))
        }, 800))
        break
      }
    }

    return () => clearTimers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animKey])

  // Cleanup on unmount
  useEffect(() => {
    return () => { clearTimers(); stopSpeech() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Progress bar ───────────────────────────────────────────────────────────

  const P     = story.paragraphs.length
  const PATS  = story.patterns.length
  const total = 1 + P + PATS + PATS * totalRecallRounds + 2

  function slideNum(): number {
    switch (slide.kind) {
      case 'intro':           return 1
      case 'paragraph':       return 2 + slide.idx
      case 'pattern':         return 2 + P + slide.idx
      case 'hide-recall':     return 2 + P + PATS + (slide.round - 1) * PATS + slide.patIdx
      case 'daily-challenge': return 2 + P + PATS * (1 + totalRecallRounds)
      case 'complete':        return total
    }
  }

  const progressPct = (slideNum() / total) * 100
  const isComplete = slide.kind === 'complete'

  // ── Exit ───────────────────────────────────────────────────────────────────

  function handleExit() {
    clearTimers()
    stopSpeech()
    trainerRef.current?.ask("세션을 종료할까요?", [
      { label: 'Stay', primary: true, onClick: () => trainerRef.current?.clearMessage() },
      { label: 'Exit', onClick: () => router.push('/patto/home') },
    ])
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  function renderSlide() {
    switch (slide.kind) {
      case 'intro':           return <IntroSlide story={story} currentRound={currentRound} />
      case 'paragraph':       return <ParagraphSlide story={story} idx={slide.idx} />
      case 'pattern':         return <PatternSlide story={story} idx={slide.idx} />
      case 'hide-recall':     return <HideRecallSlide story={story} patIdx={slide.patIdx} revealed={revealed} onReveal={handleReveal} />
      case 'daily-challenge': return (
        <DailyChallengeSlide
          story={story}
          onSkip={() => goTo({ kind: 'complete' })}
          onDone={() => goTo({ kind: 'complete' })}
        />
      )
      case 'complete':        return <CompleteSlide story={story} completionData={completionData} elapsedMin={elapsedMin} isGuided={isGuided} />
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--pb)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      {!isComplete && (
        <div style={{ flexShrink: 0, paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px 10px',
          }}>
            <button type="button" onClick={handleExit} style={{
              display: 'flex', alignItems: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--pm)', padding: '4px 0',
            }}>
              <ChevronLeft style={{ width: 20, height: 20 }} strokeWidth={2} />
            </button>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.10em',
              color: 'var(--pm2)', textTransform: 'uppercase',
            }}>
              Session {currentRound + 1}
              {slide.kind === 'hide-recall' && ` · Round ${slide.round}`}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ height: 2, background: 'rgba(107,143,255,0.12)', margin: '0 20px' }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #6B8FFF, #B8A8F0)',
              borderRadius: 1,
              transition: 'width 0.45s ease',
            }} />
          </div>
        </div>
      )}

      {/* Slide content */}
      <div
        key={animKey}
        style={{
          flex: 1, overflow: 'hidden',
          animation: 'ssSlideIn 0.3s ease-out both',
        }}
      >
        {renderSlide()}
      </div>

      <style>{`
        @keyframes ssSlideIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ssReveal {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
