'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, XCircle, Trophy, ChevronRight } from 'lucide-react'
import type { MagazinePattern } from '@/types/magazine'
import { useTheme } from '@/components/ThemeProvider'
import { usePreferences } from '@/contexts/PreferencesContext'

// ── Types ─────────────────────────────────────────────────────────────────────

type FillQuestion = {
  type: 'fill'
  hard: boolean             // true = Q1 (harder distractors)
  pattern: MagazinePattern
  displaySentence: string   // with ___ for the blank
  correctAnswer:   string
  options:         string[] // 4 shuffled choices
}

type BuildQuestion = {
  type: 'build'
  pattern: MagazinePattern
  targetSentence: string
  translation:    string    // shown before word blocks
  words:          string[]  // shuffled source words
}

type ChallengeQuestion = FillQuestion | BuildQuestion

type Props = {
  patterns: MagazinePattern[]
  storyId:  number
  onComplete: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Extract the trigger phrase from pattern text like "I should ~." → "I should" */
function triggerPhrase(patternText: string): string {
  return patternText
    .replace(/\s*~\w*\.?$/, '')
    .replace(/\s*~[^~]*$/, '')
    .trim()
}

/** Get a sentence-start fragment (first 2 words) for harder distractors */
function sentenceFragment(sentence: string): string {
  return sentence.trim().split(/\s+/).slice(0, 2).join(' ')
}

function getTranslation(pat: MagazinePattern, lang: string, usesVariation: boolean): string {
  if (usesVariation) {
    return pat.variationSentenceTranslations?.[lang]
      ?? pat.variationSentenceKo
  }
  return pat.storySentenceTranslations?.[lang]
    ?? pat.storySentenceKo
}

function buildQuestions(patterns: MagazinePattern[], lang: string): ChallengeQuestion[] {
  const pool = shuffle([...patterns])
  const questions: ChallengeQuestion[] = []

  // Q0 — Fill in the Blank (Recognition): clean trigger-phrase distractors
  // Q1 — Fill in the Blank (Recall): harder sentence-fragment distractors
  for (let qi = 0; qi < 2 && qi < pool.length; qi++) {
    const pat     = pool[qi]
    const sentence = pat.storySentence
    const trigger  = triggerPhrase(pat.pattern)
    const hard     = qi === 1

    const escapedTrigger = trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex  = new RegExp(escapedTrigger, 'i')
    const match  = regex.exec(sentence)
    const correctAnswer   = match ? match[0] : trigger
    const displaySentence = match
      ? sentence.slice(0, match.index) + '___' + sentence.slice(match.index + match[0].length)
      : `___ ${sentence}`

    const otherPats = pool.filter((_, i) => i !== qi)
    const distractors = hard
      // Q1: use sentence-start fragments — harder to distinguish from trigger phrases
      ? shuffle(otherPats.map(p => sentenceFragment(p.storySentence))).slice(0, 3)
      // Q0: use clean trigger phrases
      : shuffle(otherPats.map(p => triggerPhrase(p.pattern))).slice(0, 3)

    const options = shuffle([...distractors, correctAnswer])
    questions.push({ type: 'fill', hard, pattern: pat, displaySentence, correctAnswer, options })
  }

  // Q2, Q3 — Build the Sentence (Production): translation shown first
  for (let qi = 2; qi < 4 && qi < pool.length; qi++) {
    const pat          = pool[qi]
    const usesVariation = !!pat.variationSentence
    const sentence     = usesVariation ? pat.variationSentence : pat.storySentence
    const translation  = getTranslation(pat, lang, usesVariation)
    const rawWords     = sentence.trim().split(/\s+/).filter(Boolean)
    const words        = shuffle(rawWords)
    questions.push({ type: 'build', pattern: pat, targetSentence: sentence, translation, words })
  }

  return questions
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ current, total, isDark }: { current: number; total: number; isDark: boolean }) {
  const pct = (current / total) * 100
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
      <div style={{
        flex: 1, height: 4, borderRadius: 99,
        background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}>
        <motion.div
          style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #6B8FFF, #A78BFF)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(60,60,100,0.45)',
        letterSpacing: '0.06em', flexShrink: 0,
        fontFamily: '"SF Mono","Fira Mono","Courier New",monospace',
      }}>
        {current}/{total}
      </span>
    </div>
  )
}

// ── Fill Question ─────────────────────────────────────────────────────────────

function FillQuestion({
  q, isDark, onAnswer,
}: { q: FillQuestion; isDark: boolean; onAnswer: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null)

  function handleSelect(opt: string) {
    if (selected !== null) return
    const correct = opt.toLowerCase() === q.correctAnswer.toLowerCase()
    setSelected(opt)
    setTimeout(() => onAnswer(correct), 900)
  }

  const parts = q.displaySentence.split('___')

  return (
    <div>
      {/* Question label — no pattern chip (would reveal the answer) */}
      <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(60,60,100,0.45)' }}>
        {q.hard ? 'Recall the Pattern' : 'Fill in the Blank'}
      </p>

      {/* Sentence */}
      <p style={{
        margin: '0 0 18px',
        fontSize: 15, lineHeight: 1.65,
        color: isDark ? 'rgba(255,255,255,0.88)' : '#1a1a2e',
        fontWeight: 500,
      }}>
        {parts[0]}
        <span style={{
          display: 'inline-block', minWidth: 72, borderBottom: `2px solid ${isDark ? 'rgba(167,139,255,0.60)' : '#6B4EFF'}`,
          marginBottom: -2, verticalAlign: 'bottom',
          textAlign: 'center',
          color: isDark ? '#A78BFF' : '#6B4EFF',
          fontWeight: 700,
          fontSize: 15,
        }}>
          {selected ?? ''}
        </span>
        {parts[1]}
      </p>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {q.options.map(opt => {
          const isSelected  = selected === opt
          const isCorrect   = opt.toLowerCase() === q.correctAnswer.toLowerCase()
          let bg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
          let border = `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`
          let color  = isDark ? 'rgba(255,255,255,0.80)' : '#1a1a2e'
          if (selected !== null) {
            if (isCorrect)  { bg = isDark ? 'rgba(52,199,89,0.18)' : 'rgba(52,199,89,0.12)'; border = '1px solid rgba(52,199,89,0.40)'; color = '#34C759' }
            if (isSelected && !isCorrect) { bg = isDark ? 'rgba(255,59,48,0.18)' : 'rgba(255,59,48,0.10)'; border = '1px solid rgba(255,59,48,0.40)'; color = '#FF3B30' }
          }
          return (
            <motion.button
              key={opt}
              type="button"
              onClick={() => handleSelect(opt)}
              whileTap={selected === null ? { scale: 0.96 } : {}}
              style={{
                padding: '11px 12px',
                borderRadius: 12,
                border, background: bg, color,
                fontSize: 13, fontWeight: 600, lineHeight: 1.3,
                cursor: selected === null ? 'pointer' : 'default',
                textAlign: 'center', fontFamily: 'inherit',
                transition: 'background 0.2s, border 0.2s, color 0.2s',
              }}
            >
              {opt}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ── Build Question ────────────────────────────────────────────────────────────

function BuildQuestion({
  q, isDark, onAnswer,
}: { q: BuildQuestion; isDark: boolean; onAnswer: (correct: boolean) => void }) {
  const [bank,  setBank]  = useState<string[]>(q.words)
  const [built, setBuilt] = useState<string[]>([])
  const [checked, setChecked] = useState<boolean | null>(null)

  const tapWord = useCallback((word: string, from: 'bank' | 'built') => {
    if (checked !== null) return
    if (from === 'bank') {
      setBank(prev => { const i = prev.indexOf(word); return prev.filter((_, idx) => idx !== i) })
      setBuilt(prev => [...prev, word])
    } else {
      setBuilt(prev => { const i = prev.indexOf(word); return prev.filter((_, idx) => idx !== i) })
      setBank(prev => [...prev, word])
    }
  }, [checked])

  function handleCheck() {
    if (built.length === 0 || checked !== null) return
    const userSentence = built.join(' ')
    const targetNorm   = q.targetSentence.replace(/[.,!?;:]+$/, '').toLowerCase()
    const userNorm     = userSentence.replace(/[.,!?;:]+$/, '').toLowerCase()
    const correct = userNorm === targetNorm
    setChecked(correct)
    setTimeout(() => onAnswer(correct), 1000)
  }

  const resultColor  = checked === true ? '#34C759' : '#FF3B30'
  const buildBg      = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
  const buildBorder  = `1px dashed ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)'}`

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(60,60,100,0.45)' }}>
        Build the Sentence
      </p>

      {/* Translation — shown first, no pattern chip */}
      <div style={{
        marginBottom: 14, padding: '10px 14px',
        borderRadius: 12,
        background: isDark ? 'rgba(107,143,255,0.08)' : 'rgba(107,143,255,0.06)',
        border: `1px solid ${isDark ? 'rgba(107,143,255,0.18)' : 'rgba(107,143,255,0.16)'}`,
      }}>
        <p style={{
          margin: 0, fontSize: 14, lineHeight: 1.55,
          color: isDark ? 'rgba(255,255,255,0.75)' : '#2a2a4a',
          fontWeight: 500,
        }}>
          {q.translation}
        </p>
      </div>

      {/* Build area */}
      <div style={{
        minHeight: 60, borderRadius: 12,
        background: buildBg, border: buildBorder,
        padding: '10px 12px', marginBottom: 10,
        display: 'flex', flexWrap: 'wrap', gap: 6, alignContent: 'flex-start',
      }}>
        {built.length === 0 ? (
          <span style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.20)', alignSelf: 'center' }}>
            Tap words below to build the sentence
          </span>
        ) : built.map((w, i) => (
          <motion.button
            key={`${w}-${i}`}
            type="button"
            onClick={() => tapWord(w, 'built')}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '5px 10px', borderRadius: 8, cursor: checked === null ? 'pointer' : 'default',
              background: checked === null
                ? (isDark ? 'rgba(107,143,255,0.22)' : 'rgba(107,143,255,0.14)')
                : (checked ? 'rgba(52,199,89,0.18)' : 'rgba(255,59,48,0.14)'),
              border: `1px solid ${checked === null
                ? (isDark ? 'rgba(107,143,255,0.40)' : 'rgba(107,143,255,0.30)')
                : (checked ? 'rgba(52,199,89,0.40)' : 'rgba(255,59,48,0.35)')}`,
              color: checked === null
                ? (isDark ? '#8FABFF' : '#5B7AD4')
                : resultColor,
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              transition: 'background 0.2s',
            }}
          >
            {w}
          </motion.button>
        ))}
      </div>

      {/* Word bank */}
      {bank.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16, minHeight: 36 }}>
          {bank.map((w, i) => (
            <motion.button
              key={`${w}-${i}`}
              type="button"
              onClick={() => tapWord(w, 'bank')}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '5px 10px', borderRadius: 8,
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)'}`,
                color: isDark ? 'rgba(255,255,255,0.75)' : '#1a1a2e',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
            >
              {w}
            </motion.button>
          ))}
        </div>
      )}

      {/* Result feedback */}
      {checked !== null && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: resultColor }}
        >
          {checked ? '정답! ✓' : `정답: ${q.targetSentence}`}
        </motion.p>
      )}

      {/* Check button */}
      {checked === null && (
        <motion.button
          type="button"
          onClick={handleCheck}
          disabled={built.length === 0}
          whileTap={built.length > 0 ? { scale: 0.97 } : {}}
          transition={{ duration: 0.08, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            width: '100%', height: 48, borderRadius: 14,
            background: built.length > 0
              ? 'linear-gradient(135deg, #6B8FFF, #A78BFF)'
              : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'),
            border: 'none',
            color: built.length > 0 ? '#fff' : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'),
            fontSize: 14, fontWeight: 700, cursor: built.length > 0 ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            transition: 'background 0.2s, color 0.2s',
            boxShadow: built.length > 0
              ? (isDark ? '0 4px 20px rgba(107,143,255,0.30)' : '0 4px 16px rgba(107,143,255,0.24)')
              : 'none',
          }}
        >
          확인
        </motion.button>
      )}
    </div>
  )
}

// ── Complete Screen ───────────────────────────────────────────────────────────

function CompleteScreen({ isDark, score, total, onNext }: {
  isDark: boolean; score: number; total: number; onNext: () => void
}) {
  const allCorrect = score === total
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center', padding: '8px 0 16px' }}
    >
      <div style={{
        width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
        background: allCorrect
          ? 'linear-gradient(135deg, rgba(215,181,109,0.28), rgba(215,181,109,0.12))'
          : 'linear-gradient(135deg, rgba(107,143,255,0.24), rgba(107,143,255,0.08))',
        border: `2px solid ${allCorrect ? 'rgba(215,181,109,0.50)' : 'rgba(107,143,255,0.35)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Trophy style={{ width: 32, height: 32, color: allCorrect ? '#D7B56D' : '#8FABFF' }} strokeWidth={1.6} />
      </div>

      <p style={{
        margin: '0 0 6px', fontSize: 20, fontWeight: 800,
        letterSpacing: '-0.03em',
        color: isDark ? '#fff' : '#1a1a2e',
      }}>
        {allCorrect ? 'Perfect!' : 'Challenge Complete!'}
      </p>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(60,60,100,0.55)' }}>
        {score}/{total} 정답
      </p>

      <motion.button
        type="button"
        onClick={onNext}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.08, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '0 32px', height: 52, borderRadius: 16,
          background: 'linear-gradient(135deg, #6B8FFF, #A78BFF)',
          border: 'none', cursor: 'pointer',
          color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
          boxShadow: '0 6px 24px rgba(107,143,255,0.34)',
        }}
      >
        스토리 완료
        <ChevronRight style={{ width: 17, height: 17 }} strokeWidth={2.2} />
      </motion.button>
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function ChallengeMode({ patterns, storyId, onComplete }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { prefs } = usePreferences()
  const lang = prefs.language ?? 'ko'

  const [questions] = useState<ChallengeQuestion[]>(() => buildQuestions(patterns, lang))
  const [qIdx,    setQIdx]    = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [done,    setDone]    = useState(false)

  useEffect(() => {
    if (answers.length === 0) return
    if (answers.length >= questions.length) {
      setDone(true)
    } else {
      setQIdx(answers.length)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers.length])

  const handleAnswer = useCallback((correct: boolean) => {
    setAnswers(prev => [...prev, correct])
  }, [])

  const totalScore = answers.filter(Boolean).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ padding: '0 16px 32px' }}
    >
      {/* Card — no redundant "Challenge" header; section title comes from sectionDivider above */}
      <div style={{
        borderRadius: 22,
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.85)'}`,
        padding: '18px 18px 20px',
        boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.35)' : '0 8px 32px rgba(60,60,100,0.08)',
      }}>
        {done ? (
          <CompleteScreen
            isDark={isDark}
            score={totalScore}
            total={questions.length}
            onNext={onComplete}
          />
        ) : (
          <>
            <ProgressBar current={qIdx + 1} total={questions.length} isDark={isDark} />

            <AnimatePresence mode="wait">
              <motion.div
                key={qIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {questions[qIdx].type === 'fill' ? (
                  <FillQuestion
                    q={questions[qIdx] as FillQuestion}
                    isDark={isDark}
                    onAnswer={handleAnswer}
                  />
                ) : (
                  <BuildQuestion
                    q={questions[qIdx] as BuildQuestion}
                    isDark={isDark}
                    onAnswer={handleAnswer}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  )
}
