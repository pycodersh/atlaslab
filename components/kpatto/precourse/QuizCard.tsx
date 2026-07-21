'use client'

import { useEffect, useState } from 'react'
import type { QuizQuestion } from '@/data/kpatto/precourse/types'
import type { KPattoLanguage } from '@/data/kpatto/types'

interface QuizCardProps {
  question: QuizQuestion
  questionNumber: number
  total: number
  lang: KPattoLanguage
  onAnswer: (correct: boolean) => void
}

export function QuizCard({ question, questionNumber, total, lang, onAnswer }: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)

  // Reset on new question
  useEffect(() => {
    setSelected(null)
    setLocked(false)
  }, [question])

  const handleSelect = (idx: number) => {
    if (locked) return
    setSelected(idx)
    setLocked(true)
    const correct = idx === question.correct
    // Advance after short delay
    setTimeout(() => onAnswer(correct), 900)
  }

  const qText = question.question[lang] ?? question.question.en ?? ''

  return (
    <div style={{ padding: '0 20px' }}>
      {/* Progress */}
      <div style={{ fontSize: 11, color: 'var(--pm)', marginBottom: 12, fontWeight: 600 }}>
        {questionNumber} / {total}
      </div>

      {/* Question */}
      <div style={{
        fontSize: 17,
        fontWeight: 700,
        color: 'var(--pt)',
        lineHeight: 1.5,
        marginBottom: 20,
        wordBreak: 'keep-all',
      }}>
        {qText}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {question.options.map((opt, idx) => {
          const isSelected = selected === idx
          const isCorrect = idx === question.correct
          let bg = 'var(--pb)'
          let border = '2px solid var(--border, rgba(0,0,0,0.1))'
          let color = 'var(--pt)'
          let animation = 'none'

          if (locked) {
            if (isCorrect) {
              bg = '#E8F5E9'
              border = '2px solid #4CAF50'
              color = '#2E7D32'
            } else if (isSelected) {
              bg = '#FFEBEE'
              border = '2px solid #EF5350'
              color = '#C62828'
              animation = 'kp-shake 0.4s ease'
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              style={{
                background: bg,
                border,
                borderRadius: 14,
                padding: '14px 16px',
                cursor: locked ? 'default' : 'pointer',
                textAlign: 'left',
                fontSize: 16,
                fontWeight: 600,
                color,
                transition: 'background 0.2s, border 0.2s',
                animation,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: locked && isCorrect ? '#4CAF50' : locked && isSelected ? '#EF5350' : 'rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: locked && (isCorrect || isSelected) ? '#fff' : 'var(--pm)',
                flexShrink: 0,
              }}>
                {locked && isCorrect ? '✓' : locked && isSelected ? '✗' : String.fromCharCode(65 + idx)}
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {locked && question.explanation && (
        <div style={{
          marginTop: 14,
          padding: '10px 14px',
          background: 'rgba(107,140,255,0.08)',
          borderRadius: 10,
          fontSize: 13,
          color: 'var(--pm)',
        }}>
          {question.explanation[lang] ?? question.explanation.en}
        </div>
      )}

      <style>{`
        @keyframes kp-shake {
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
