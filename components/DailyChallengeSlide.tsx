'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTrainerSafe } from '@/contexts/TrainerContext'
import { useAuth } from '@/contexts/AuthContext'
import type { MagazineStory } from '@/types/magazine'
import {
  type ChallengeType,
  type ChallengeData,
  type CompleteChallenge,
  type TranslateChallenge,
  type MakeYourOwnChallenge,
  type StoryRecallChallenge,
  generateChallenge,
  getTodayChallengeType,
  saveChallengeType,
} from '@/lib/challenge/daily-challenge'
import { saveDailyChallengeToSupabase } from '@/lib/challenge/supabase-sync'
import { addMySentence } from '@/lib/sentences/storage'
import { onChallengeResult, recordPatternResult } from '@/lib/adaptive/adaptive-engine'

// ── Types ──────────────────────────────────────────────────────────────────────

type Phase = 'offer' | 'challenge' | 'result'

type Props = {
  story: MagazineStory
  onSkip: () => void
  onDone: () => void
}

// ── Style tokens ───────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '0.5px solid rgba(107,143,255,0.2)',
  borderRadius: 20,
  padding: '24px',
  width: '100%',
}

const optionBase: React.CSSProperties = {
  width: '100%', textAlign: 'left',
  background: 'rgba(107,143,255,0.06)',
  border: '0.5px solid rgba(107,143,255,0.15)',
  borderRadius: 12, padding: '12px 16px',
  fontSize: 14, fontWeight: 500, color: 'var(--pt)',
  cursor: 'pointer', fontFamily: 'inherit',
  transition: 'all 0.18s ease',
}

function optionStyle(state: 'idle' | 'selected' | 'correct' | 'wrong'): React.CSSProperties {
  if (state === 'correct') return { ...optionBase, background: 'rgba(80,200,120,0.12)', border: '0.5px solid rgba(80,200,120,0.4)', color: '#2d9e5f', fontWeight: 600 }
  if (state === 'wrong')   return { ...optionBase, background: 'rgba(255,100,100,0.08)', border: '0.5px solid rgba(255,100,100,0.3)', color: '#e05555' }
  if (state === 'selected') return { ...optionBase, background: 'rgba(107,143,255,0.15)', border: '0.5px solid rgba(107,143,255,0.4)' }
  return optionBase
}

const textInput: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.9)',
  border: '0.5px solid rgba(107,143,255,0.25)',
  borderRadius: 12, padding: '12px 16px',
  fontSize: 15, color: 'var(--pt)', fontFamily: 'inherit',
  outline: 'none', resize: 'none',
}

const submitBtn: React.CSSProperties = {
  marginTop: 14, width: '100%',
  background: '#6B8FFF', color: '#fff',
  border: 'none', borderRadius: 12,
  padding: '13px 0', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
}

// ── Label display ──────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<ChallengeType, string> = {
  complete:      'Complete',
  translate:     'Translate',
  make_your_own: 'Make Your Own',
  story_recall:  'Story Recall',
}

// ── Sub UIs ────────────────────────────────────────────────────────────────────

function CompleteUI({ data, onResult }: {
  data: CompleteChallenge
  onResult: (answer: string, correct: boolean) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const answered = selected !== null

  function pick(opt: string) {
    if (answered) return
    setSelected(opt)
    onResult(opt, opt.toLowerCase() === data.answer.toLowerCase())
  }

  return (
    <div style={card}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(107,143,255,0.6)', margin: '0 0 14px', textTransform: 'uppercase' }}>
        Pattern hint: {data.patternLabel}
      </p>
      <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--pt)', lineHeight: 1.6, margin: '0 0 20px' }}>
        {data.sentence}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.options.map(opt => {
          const state = !answered ? 'idle'
            : opt.toLowerCase() === data.answer.toLowerCase() ? 'correct'
            : opt === selected ? 'wrong'
            : 'idle'
          return (
            <button key={opt} type="button" style={optionStyle(state)} onClick={() => pick(opt)}>
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TranslateUI({ data, onResult }: {
  data: TranslateChallenge
  onResult: (answer: string) => void
}) {
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function submit() {
    if (!text.trim() || submitted) return
    setSubmitted(true)
    onResult(text.trim())
  }

  return (
    <div style={card}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(107,143,255,0.6)', margin: '0 0 10px', textTransform: 'uppercase' }}>
        한국어 → 영어
      </p>
      <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--pt)', lineHeight: 1.55, margin: '0 0 18px' }}>
        {data.koreanSentence}
      </p>
      {submitted ? (
        <div style={{ background: 'rgba(107,143,255,0.06)', borderRadius: 12, padding: '14px 16px' }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(107,143,255,0.6)', margin: '0 0 6px', textTransform: 'uppercase' }}>
            Natural version
          </p>
          <p style={{ fontSize: 14, color: 'var(--pt)', margin: 0, lineHeight: 1.55 }}>
            {data.naturalAnswer}
          </p>
        </div>
      ) : (
        <>
          <textarea
            style={{ ...textInput, minHeight: 80 }}
            placeholder="영어로 번역해보세요..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
          />
          <button type="button" style={submitBtn} onClick={submit} disabled={!text.trim()}>
            Submit
          </button>
        </>
      )}
    </div>
  )
}

function MakeYourOwnUI({ data, onResult }: {
  data: MakeYourOwnChallenge
  onResult: (answer: string) => void
}) {
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function submit() {
    if (!text.trim() || submitted) return
    setSubmitted(true)
    onResult(text.trim())
  }

  return (
    <div style={card}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(107,143,255,0.6)', margin: '0 0 8px', textTransform: 'uppercase' }}>
        Pattern
      </p>
      <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--pt)', margin: '0 0 4px', lineHeight: 1.3 }}>
        {data.pattern}
      </p>
      <p style={{ fontSize: 13, color: 'var(--pm)', margin: '0 0 18px' }}>
        {data.meaningKo}
      </p>
      {submitted ? (
        <div style={{ background: 'rgba(107,143,255,0.06)', borderRadius: 12, padding: '14px 16px' }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(107,143,255,0.6)', margin: '0 0 6px', textTransform: 'uppercase' }}>
            내 문장
          </p>
          <p style={{ fontSize: 14, color: 'var(--pt)', margin: 0, lineHeight: 1.55 }}>
            {text}
          </p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 12, color: 'var(--pm)', margin: '0 0 10px' }}>
            이 패턴으로 자신만의 문장을 만들어보세요.
          </p>
          <textarea
            style={{ ...textInput, minHeight: 72 }}
            placeholder="예: I want to travel to Japan."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
          />
          <button type="button" style={submitBtn} onClick={submit} disabled={!text.trim()}>
            Submit
          </button>
        </>
      )}
    </div>
  )
}

function StoryRecallUI({ data, onResult }: {
  data: StoryRecallChallenge
  onResult: (answer: string, correct: boolean) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const answered = selected !== null

  function pick(opt: string) {
    if (answered) return
    setSelected(opt)
    onResult(opt, opt.toLowerCase() === data.answer.toLowerCase())
  }

  return (
    <div style={card}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(107,143,255,0.6)', margin: '0 0 14px', textTransform: 'uppercase' }}>
        스토리에서 기억하기
      </p>
      <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--pt)', lineHeight: 1.6, margin: '0 0 20px' }}>
        {data.sentence}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.options.map(opt => {
          const state = !answered ? 'idle'
            : opt.toLowerCase() === data.answer.toLowerCase() ? 'correct'
            : opt === selected ? 'wrong'
            : 'idle'
          return (
            <button key={opt} type="button" style={optionStyle(state)} onClick={() => pick(opt)}>
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function DailyChallengeSlide({ story, onSkip, onDone }: Props) {
  const router = useRouter()
  const trainer = useTrainerSafe()
  const trainerRef = useRef(trainer)
  trainerRef.current = trainer
  const { user } = useAuth()

  const [phase, setPhase] = useState<Phase>('offer')
  const [challengeType] = useState<ChallengeType>(() => getTodayChallengeType(story.id))
  const [challengeData] = useState<ChallengeData | null>(() => generateChallenge(challengeType, story))
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  function addTimer(t: ReturnType<typeof setTimeout>) { timersRef.current.push(t) }
  function clearTimers() { timersRef.current.forEach(clearTimeout); timersRef.current = [] }

  // Offer phase: show ask via trainer on mount
  useEffect(() => {
    const t = trainerRef.current
    if (!t || phase !== 'offer') return

    addTimer(setTimeout(() => {
      t.say("마지막으로 한 가지만요.", 1800)
      addTimer(setTimeout(() => {
        trainerRef.current?.ask("오늘의 챌린지를 해볼까요?", [
          {
            label: "Let's do it",
            primary: true,
            onClick: () => {
              trainerRef.current?.say("잠깐이면 돼요.", 1500)
              addTimer(setTimeout(() => {
                trainerRef.current?.clearMessage()
                setPhase('challenge')
                saveChallengeType(challengeType, story.id)
              }, 1600))
            },
          },
          { label: 'Maybe later', onClick: onSkip },
        ])
      }, 2000))
    }, 400))

    return () => clearTimers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cleanup on unmount
  useEffect(() => () => clearTimers(), [])

  // ── Result handlers ──────────────────────────────────────────────────────────

  function handleMCResult(answer: string, correct: boolean, type: ChallengeType) {
    setPhase('result')

    // Adaptive: update challenge correct rate + weak pattern tracking
    onChallengeResult(correct)
    if (type === 'complete' && challengeData?.type === 'complete') {
      recordPatternResult(challengeData.patternLabel, correct)
    }

    const msg = correct
      ? type === 'story_recall' ? "맞아요! 잘 기억하셨네요." : "정답이에요! ✓"
      : (type === 'story_recall' ? "아쉬워요." : "아쉬워요.")
    const announce = correct
      ? msg
      : `${msg} 정답은 '${type === 'complete'
          ? (challengeData as CompleteChallenge).answer
          : (challengeData as StoryRecallChallenge).answer}'이에요.`

    addTimer(setTimeout(() => {
      trainerRef.current?.ask(announce, [
        { label: 'Done', btnVariant: 'done', onClick: handleDone },
      ])
    }, 300))

    if (user?.id) {
      saveDailyChallengeToSupabase({
        userId: user.id, storyId: story.id,
        challengeType: type, userAnswer: answer, isCorrect: correct,
      }).catch(() => {})
    }
  }

  function handleTextResult(answer: string, type: ChallengeType) {
    setPhase('result')
    const msg = type === 'translate' ? "좋은 시도예요." : "잘하셨어요."

    addTimer(setTimeout(() => {
      trainerRef.current?.ask(msg, [
        { label: 'Done', btnVariant: 'done', onClick: handleDone },
      ])
    }, 300))

    if (answer.trim()) {
      addMySentence({ text: answer.trim(), source: 'challenge', storyId: story.id })
    }

    if (user?.id) {
      saveDailyChallengeToSupabase({
        userId: user.id, storyId: story.id,
        challengeType: type, userAnswer: answer, isCorrect: null,
      }).catch(() => {})
    }
  }

  function handleDone() {
    clearTimers()
    trainerRef.current?.clearMessage()
    addTimer(setTimeout(() => {
      trainerRef.current?.ask("더 써보고 싶으세요?", [
        {
          label: 'Writing Studio 열기',
          primary: true,
          onClick: () => {
            trainerRef.current?.clearMessage()
            onDone()
            router.push('/patto/library?tab=writing-studio')
          },
        },
        {
          label: '괜찮아요',
          onClick: () => {
            trainerRef.current?.say("오늘 챌린지 완료!", 1500)
            addTimer(setTimeout(onDone, 1700))
          },
        },
      ])
    }, 200))
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
      <p style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.16em',
        color: 'var(--pm2)', textTransform: 'uppercase', margin: '24px 0 28px',
      }}>
        Challenge · {TYPE_LABEL[challengeType]}
      </p>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        {/* Offer phase: show a teaser card while trainer handles interaction */}
        {phase === 'offer' && (
          <div style={card}>
            <p style={{ fontSize: 28, margin: '0 0 14px' }}>🎯</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--pt)', margin: '0 0 6px' }}>
              {TYPE_LABEL[challengeType]}
            </p>
            <p style={{ fontSize: 13, color: 'var(--pm)', margin: 0, lineHeight: 1.55 }}>
              오늘 배운 패턴을 직접 사용해보는 마지막 단계예요.
            </p>
          </div>
        )}

        {/* Challenge phase: render the specific type */}
        {(phase === 'challenge' || phase === 'result') && challengeData && (() => {
          switch (challengeData.type) {
            case 'complete':
              return (
                <CompleteUI
                  data={challengeData}
                  onResult={(ans, ok) => handleMCResult(ans, ok, 'complete')}
                />
              )
            case 'translate':
              return (
                <TranslateUI
                  data={challengeData}
                  onResult={ans => handleTextResult(ans, 'translate')}
                />
              )
            case 'make_your_own':
              return (
                <MakeYourOwnUI
                  data={challengeData}
                  onResult={ans => handleTextResult(ans, 'make_your_own')}
                />
              )
            case 'story_recall':
              return (
                <StoryRecallUI
                  data={challengeData}
                  onResult={(ans, ok) => handleMCResult(ans, ok, 'story_recall')}
                />
              )
          }
        })()}

        {/* Fallback: if challenge data couldn't be generated */}
        {(phase === 'challenge' || phase === 'result') && !challengeData && (
          <div style={card}>
            <p style={{ fontSize: 14, color: 'var(--pm)', margin: 0 }}>
              챌린지를 준비하는 중이에요.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
