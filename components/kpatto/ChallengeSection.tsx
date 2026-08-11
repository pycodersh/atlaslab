'use client'

import { useState, useCallback } from 'react'
import { stopAllAudio } from '@/lib/kpatto/audio'

const GREEN  = '#22C55E'
const RED    = '#EF4444'
const ACCENT = '#D4873A'
const T1     = '#111111'
const T2     = '#999999'
const DIV    = '#F2F2F2'

// ── Question types ─────────────────────────────────────────────────────────────

/** Legacy static-pool type */
export type MCQuestion = {
  type: 'mc'
  prompt: string
  choices: string[]
  correctIdx: number
}

/** Legacy static-pool type */
export type BuildQuestion = {
  type: 'build'
  prompt: string
  words: string[]
  answer: string[]
}

/** DB type: show English meaning → choose correct Korean sentence */
export type TranslationQuestion = {
  type: 'translation'
  prompt: string
  choices: string[]
  correctIdx: number
}

/** DB type: Korean sentence with blank → choose the missing word/phrase */
export type FillBlankQuestion = {
  type: 'fill_blank'
  prompt: string
  hint_en?: string
  choices: string[]
  correctIdx: number
}

/** DB type: arrange Korean word chips in the correct order */
export type WordOrderQuestion = {
  type: 'word_order'
  prompt: string
  pieces: string[]
  answer: string[]
}

export type Question = MCQuestion | BuildQuestion | TranslationQuestion | FillBlankQuestion | WordOrderQuestion

// Default fallback questions shown when no pool or DB challenges are available
const QUESTIONS: Question[] = [
  {
    type: 'mc',
    prompt: '"Water, please."',
    choices: ['물 주세요.', '물 뭐예요?', '자리 있어요?', '이거 얼마예요?'],
    correctIdx: 0,
  },
  {
    type: 'mc',
    prompt: '"Is there a seat?"',
    choices: ['물 주세요.', '자리 있어요?', '이거 뭐예요?', '메뉴 주세요.'],
    correctIdx: 1,
  },
  {
    type: 'mc',
    prompt: '"What is this?"',
    choices: ['이거 얼마예요?', '물 주세요.', '이거 뭐예요?', '자리 있어요?'],
    correctIdx: 2,
  },
  {
    type: 'mc',
    prompt: '"How much is this?"',
    choices: ['이거 뭐예요?', '이거 얼마예요?', '자리 있어요?', '물 주세요.'],
    correctIdx: 1,
  },
  {
    type: 'build',
    prompt: '"A café latte, please."',
    words: ['카페라떼', '있어요', '주세요', '뭐예요'],
    answer: ['카페라떼', '주세요'],
  },
]

const MAX_WRONG = 3

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{ flex: 1, height: 4, background: DIV, borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${(current / total) * 100}%`,
          background: ACCENT,
          borderRadius: 99,
          transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: T2, flexShrink: 0 }}>
        {current} / {total}
      </span>
    </div>
  )
}

// ── MC card — handles mc, translation, fill_blank ─────────────────────────────
function MCCard({ q, onCorrect, onAdvance }: {
  q: MCQuestion | TranslationQuestion | FillBlankQuestion
  onCorrect: () => void
  onAdvance: () => void
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [wrongCount, setWrongCount] = useState(0)
  const [state, setState] = useState<'idle' | 'wrong' | 'correct' | 'revealed'>('idle')

  const label = q.type === 'fill_blank' ? 'Fill in the blank.' : 'What does this mean?'
  const hintEn = q.type === 'fill_blank' ? (q as FillBlankQuestion).hint_en : undefined

  const handleChoice = useCallback((idx: number) => {
    if (state === 'correct' || state === 'revealed') return
    stopAllAudio()  // 챌린지 상호작용 → 대사 재생 정지

    if (idx === q.correctIdx) {
      setSelected(idx)
      setState('correct')
      setTimeout(onCorrect, 900)
    } else {
      const next = wrongCount + 1
      setSelected(idx)
      setWrongCount(next)
      if (next >= MAX_WRONG) {
        setState('revealed')
      } else {
        setState('wrong')
      }
    }
  }, [state, wrongCount, q.correctIdx, onCorrect])

  const handleTryAgain = useCallback(() => {
    setSelected(null)
    setState('idle')
  }, [])

  const getBorder = (idx: number): string => {
    if (state === 'correct' && idx === q.correctIdx) return `2px solid ${GREEN}`
    if (state === 'revealed' && idx === q.correctIdx) return `2px solid ${GREEN}`
    if ((state === 'wrong' || state === 'revealed') && idx === selected) return `2px solid ${RED}`
    return '1.5px solid #E0E0E0'
  }

  const getBg = (idx: number): string => {
    if (state === 'correct' && idx === q.correctIdx) return '#DCFCE7'
    if (state === 'revealed' && idx === q.correctIdx) return '#DCFCE7'
    if ((state === 'wrong' || state === 'revealed') && idx === selected) return '#FEE2E2'
    return '#FFFFFF'
  }

  const getColor = (idx: number): string => {
    if (state === 'correct' && idx === q.correctIdx) return '#15803D'
    if (state === 'revealed' && idx === q.correctIdx) return '#15803D'
    if ((state === 'wrong' || state === 'revealed') && idx === selected) return '#B91C1C'
    if (state !== 'idle' && idx !== selected && idx !== q.correctIdx) return '#BBBBBB'
    return T1
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#999999', marginBottom: 6 }}>{label}</div>
        {hintEn && (
          <div style={{ fontSize: 14, color: '#666666', marginBottom: 6, fontStyle: 'italic' }}>{hintEn}</div>
        )}
        <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', lineHeight: 1.4 }}>{q.prompt}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.choices.map((c, i) => (
          <button
            key={i}
            onClick={() => handleChoice(i)}
            style={{
              width: '100%',
              padding: '13px 16px',
              borderRadius: 12,
              border: getBorder(i),
              background: getBg(i),
              fontSize: 15,
              fontWeight: 600,
              color: getColor(i),
              cursor: (state === 'correct' || state === 'revealed') ? 'default' : 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s, border-color 0.15s',
              // flex layout for hanging indent: number fixed, text wraps independently
              display: 'flex',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ flexShrink: 0, width: 22, marginRight: 8, opacity: 0.4 }}>{'①②③④'[i]}</span>
            <span style={{ flex: 1 }}>{c}</span>
          </button>
        ))}
      </div>

      {state === 'correct' && (
        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 14, fontWeight: 700, color: GREEN }}>
          ✓ Correct!
        </div>
      )}
      {state === 'wrong' && (
        <button
          onClick={handleTryAgain}
          style={{
            display: 'block', width: '100%', marginTop: 16,
            padding: 13, borderRadius: 12,
            border: `1.5px solid ${RED}`,
            background: '#FFFFFF',
            color: RED,
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Try again
        </button>
      )}
      {state === 'revealed' && (
        <button
          onClick={onAdvance}
          style={{
            display: 'block', width: '100%', marginTop: 16,
            padding: 13, borderRadius: 12,
            border: 'none',
            background: T1,
            color: '#FFFFFF',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Next →
        </button>
      )}
    </div>
  )
}

// ── Word-order card — handles build and word_order ────────────────────────────
function WordOrderCard({ q, onCorrect }: {
  q: BuildQuestion | WordOrderQuestion
  onCorrect: () => void
}) {
  const allWords = q.type === 'word_order' ? q.pieces : q.words
  const [assembled, setAssembled] = useState<string[]>([])
  const [shakeWord, setShakeWord] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const addWord = useCallback((word: string) => {
    if (done || assembled.includes(word)) return
    stopAllAudio()  // 챌린지 상호작용 → 대사 재생 정지
    const next = [...assembled, word]
    const isWrong = next.some((w, i) => w !== q.answer[i])
    if (isWrong) {
      setShakeWord(word)
      setTimeout(() => setShakeWord(null), 500)
      return
    }
    setAssembled(next)
    if (next.length === q.answer.length) {
      setDone(true)
      setTimeout(onCorrect, 900)
    }
  }, [assembled, done, q.answer, onCorrect])

  const removeWord = useCallback((idx: number) => {
    if (done) return
    setAssembled(prev => prev.filter((_, i) => i !== idx))
  }, [done])

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#999999', marginBottom: 6 }}>Put the words in order.</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', lineHeight: 1.4 }}>{q.prompt}</div>
      </div>

      {/* Assembly area */}
      <div style={{
        minHeight: 52,
        border: `2px dashed ${done ? GREEN : '#D0D0D0'}`,
        borderRadius: 12,
        padding: '10px 12px',
        display: 'flex', flexWrap: 'wrap', gap: 8,
        marginBottom: 20,
        background: done ? '#DCFCE7' : '#FAFAFA',
        transition: 'background 0.2s, border-color 0.2s',
        alignItems: 'center',
      }}>
        {assembled.length === 0 && (
          <span style={{ fontSize: 13, color: '#CCCCCC' }}>Tap words to build the sentence</span>
        )}
        {assembled.map((w, i) => (
          <button key={i} onClick={() => removeWord(i)} style={{
            padding: '6px 14px', borderRadius: 99,
            border: `1.5px solid ${done ? GREEN : ACCENT}`,
            background: '#FFFFFF',
            fontSize: 15, fontWeight: 700,
            color: done ? '#15803D' : ACCENT,
            cursor: done ? 'default' : 'pointer',
          }}>
            {w}
          </button>
        ))}
      </div>

      {/* Word chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {allWords.map(w => {
          const used = assembled.includes(w)
          const shaking = shakeWord === w
          return (
            <button key={w} onClick={() => addWord(w)} style={{
              padding: '8px 18px', borderRadius: 99,
              border: `1.5px solid ${used ? DIV : ACCENT}`,
              background: used ? DIV : '#FFFFFF',
              fontSize: 15, fontWeight: 700,
              color: used ? '#CCCCCC' : T1,
              cursor: used ? 'default' : 'pointer',
              animation: shaking ? 'shake 0.4s ease' : 'none',
            }}>
              {w}
            </button>
          )
        })}
      </div>

      {done && (
        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 14, fontWeight: 700, color: GREEN }}>
          ✓ Correct!
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function ChallengeSection({ onComplete, questions: customQuestions }: {
  onComplete: () => void
  questions?: Question[]
}) {
  const questions = customQuestions ?? QUESTIONS
  const [qIdx, setQIdx] = useState(0)
  const [cardKey, setCardKey] = useState(0)

  const advance = useCallback(() => {
    if (qIdx + 1 >= questions.length) {
      onComplete()
    } else {
      setQIdx(i => i + 1)
      setCardKey(k => k + 1)
    }
  }, [qIdx, questions.length, onComplete])

  const q = questions[qIdx]
  const isMC = q.type === 'mc' || q.type === 'translation' || q.type === 'fill_blank'

  return (
    <div style={{ margin: '40px 0 0', padding: '0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#999999', textTransform: 'uppercase' }}>
          Challenge what you've learned
        </div>
      </div>

      <div style={{
        border: '1px solid #E0E0E0',
        borderRadius: 20,
        padding: '22px 20px 20px',
        background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <ProgressBar current={qIdx} total={questions.length} />

        {isMC ? (
          <MCCard
            key={cardKey}
            q={q as MCQuestion | TranslationQuestion | FillBlankQuestion}
            onCorrect={advance}
            onAdvance={advance}
          />
        ) : (
          <WordOrderCard
            key={cardKey}
            q={q as BuildQuestion | WordOrderQuestion}
            onCorrect={advance}
          />
        )}
      </div>
    </div>
  )
}
