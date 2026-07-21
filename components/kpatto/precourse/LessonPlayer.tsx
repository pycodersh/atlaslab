'use client'

import { useState } from 'react'
import type { LessonConfig, LessonStep } from '@/data/kpatto/precourse/types'
import type { KPattoLanguage } from '@/data/kpatto/types'
import { usePreferences } from '@/contexts/PreferencesContext'

import { ProgressBar } from './ProgressBar'
import { LessonCard } from './LessonCard'
import { QuizCard } from './QuizCard'
import { LessonComplete } from './LessonComplete'
import { CombineAnimation } from './CombineAnimation'
import { CardFlipGrid } from './CardFlip'
import { StrokeGrid } from './StrokeAnimation'
import { DiphthongGrid } from './DiphthongCombine'
import { StackAnimation } from './StackAnimation'
import { LiaisonArrow } from './LiaisonArrow'
import { SceneInteractive } from './SceneInteractive'
import { InteractiveCombine } from './InteractiveCombine'

// ── Step content renderers ────────────────────────────────────────────────────

function InfoStepView({ step, lang }: { step: Extract<LessonStep, { type: 'info' }>; lang: KPattoLanguage }) {
  return (
    <div style={{ padding: '0 20px' }}>
      {step.emoji && <div style={{ fontSize: 40, marginBottom: 16 }}>{step.emoji}</div>}
      {step.title && (
        <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 800, color: 'var(--pt)' }}>
          {step.title[lang] ?? step.title.en}
        </h3>
      )}
      {step.highlight && (
        <div style={{
          fontSize: 60,
          fontWeight: 800,
          color: '#FF6B8C',
          margin: '16px 0',
          lineHeight: 1.1,
        }}>
          {step.highlight}
        </div>
      )}
      <p style={{
        margin: 0,
        fontSize: 15,
        lineHeight: 1.7,
        color: 'var(--pt)',
        whiteSpace: 'pre-line',
        wordBreak: 'keep-all',
      }}>
        {step.body[lang] ?? step.body.en}
      </p>
      {step.note && (
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--pm)' }}>
          {step.note[lang] ?? step.note.en}
        </p>
      )}
    </div>
  )
}

function RoadmapStepView({ step, lang }: { step: Extract<LessonStep, { type: 'roadmap' }>; lang: KPattoLanguage }) {
  return (
    <div style={{ padding: '0 20px' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: 'var(--pt)' }}>
        {step.title[lang] ?? step.title.en}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {step.items.map(item => (
          <div key={item.num} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--pb)',
            border: '1.5px solid var(--border, rgba(0,0,0,0.08))',
            borderRadius: 12,
            padding: '10px 14px',
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: item.required ? 'rgba(255,107,140,0.15)' : 'rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 800,
              color: item.required ? '#FF6B8C' : 'var(--pm)',
            }}>
              {item.num}
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--pt)', flex: 1 }}>
              {item.title[lang] ?? item.title.en}
            </span>
            {item.required && (
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                color: '#FF6B8C',
                background: 'rgba(255,107,140,0.1)',
                padding: '2px 6px',
                borderRadius: 99,
                letterSpacing: '0.04em',
              }}>
                REQUIRED
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function WordPracticeView({ step, lang }: { step: Extract<LessonStep, { type: 'word-practice' }>; lang: KPattoLanguage }) {
  const [revealedIdx, setRevealedIdx] = useState<Set<number>>(new Set())
  const toggle = (i: number) => {
    const s = new Set(revealedIdx)
    if (s.has(i)) s.delete(i); else s.add(i)
    setRevealedIdx(s)
  }
  return (
    <div style={{ padding: '0 20px' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: 'var(--pt)' }}>
        {step.title[lang] ?? step.title.en}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {step.words.map((w, i) => {
          const shown = revealedIdx.has(i)
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: shown ? 'rgba(79,140,255,0.06)' : 'var(--pb)',
                border: `1.5px solid ${shown ? 'rgba(79,140,255,0.3)' : 'var(--border, rgba(0,0,0,0.08))'}`,
                borderRadius: 14,
                padding: '14px 16px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--pt)' }}>{w.korean}</span>
              <span style={{
                fontSize: 14,
                color: '#4F8CFF',
                opacity: shown ? 1 : 0,
                fontWeight: 600,
                transition: 'opacity 0.2s',
              }}>
                {w.meaning[lang] ?? w.meaning.en}
              </span>
            </button>
          )
        })}
      </div>
      <p style={{ marginTop: 10, fontSize: 11, color: 'var(--pm)', textAlign: 'center' }}>
        탭해서 뜻 확인
      </p>
    </div>
  )
}

// ── Step router ───────────────────────────────────────────────────────────────

function StepRenderer({ step, lang, onInteract }: { step: LessonStep; lang: KPattoLanguage; onInteract?: () => void }) {
  switch (step.type) {
    case 'info':         return <InfoStepView step={step} lang={lang} />
    case 'roadmap':      return <RoadmapStepView step={step} lang={lang} />
    case 'combine-anim': return <CombineAnimation step={step} lang={lang} />
    case 'card-flip-grid': return <CardFlipGrid step={step} lang={lang} onAllFlipped={onInteract} />
    case 'stroke-grid':  return <StrokeGrid step={step} lang={lang} />
    case 'word-practice': return <WordPracticeView step={step} lang={lang} />
    case 'diphthong-grid': return <DiphthongGrid step={step} lang={lang} />
    case 'stack-anim':   return <StackAnimation step={step} lang={lang} />
    case 'liaison-demo': return <LiaisonArrow step={step} lang={lang} />
    case 'scene':        return <SceneInteractive step={step} lang={lang} />
    case 'interactive-combine':
      return <InteractiveCombine step={step} lang={lang} onMinTrials={onInteract} />
    default:
      return null
  }
}

// ── Quiz runner ───────────────────────────────────────────────────────────────

function QuizRunner({ lesson, lang, onDone }: {
  lesson: LessonConfig
  lang: KPattoLanguage
  onDone: (score: number) => void
}) {
  const [qIdx, setQIdx] = useState(0)
  const [score, setScore] = useState(0)
  const questions = lesson.quiz!.questions

  const handleAnswer = (correct: boolean) => {
    const nextScore = correct ? score + 1 : score
    if (qIdx + 1 >= questions.length) {
      onDone(nextScore)
    } else {
      setScore(nextScore)
      setQIdx(i => i + 1)
    }
  }

  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ padding: '0 20px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#FF6B8C', letterSpacing: '0.06em', marginBottom: 4 }}>
          QUIZ
        </div>
        <ProgressBar value={((qIdx) / questions.length) * 100} />
      </div>
      <LessonCard stepKey={qIdx}>
        <QuizCard
          question={questions[qIdx]}
          questionNumber={qIdx + 1}
          total={questions.length}
          lang={lang}
          onAnswer={handleAnswer}
        />
      </LessonCard>
    </div>
  )
}

// ── Main player ───────────────────────────────────────────────────────────────

interface LessonPlayerProps {
  lesson: LessonConfig
  onComplete: (quizPassed: boolean) => void
}

export function LessonPlayer({ lesson, onComplete }: LessonPlayerProps) {
  const { prefs } = usePreferences()
  const lang = (prefs.language ?? 'en') as KPattoLanguage

  const [stepIdx, setStepIdx] = useState(0)
  const [quizActive, setQuizActive] = useState(false)
  const [quizDone, setQuizDone] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [interacted, setInteracted] = useState(false)

  const totalSteps = lesson.steps.length
  const hasQuiz = !!lesson.quiz
  const currentStep = lesson.steps[stepIdx]
  const isLastStep = stepIdx === totalSteps - 1
  const needsInteract = currentStep?.type === 'interactive-combine'

  // Progress bar value
  const baseProgress = quizActive
    ? 90
    : quizDone
      ? 100
      : Math.round((stepIdx / (totalSteps + (hasQuiz ? 1 : 0))) * (hasQuiz ? 90 : 100))

  const handleNext = () => {
    setInteracted(false)
    if (!isLastStep) {
      setStepIdx(i => i + 1)
    } else if (hasQuiz) {
      setQuizActive(true)
    } else {
      onComplete(true)
    }
  }

  const handleQuizDone = (score: number) => {
    setQuizScore(score)
    setQuizDone(true)
    setQuizActive(false)
  }

  const handleComplete = () => {
    const passed = lesson.quiz ? quizScore >= lesson.quiz.passingScore : true
    onComplete(passed)
  }

  const handleRetry = () => {
    setQuizDone(false)
    setQuizActive(true)
    setQuizScore(0)
  }

  // Completion screen
  if (quizDone || (!hasQuiz && isLastStep && quizActive === false && stepIdx === totalSteps)) {
    const passed = lesson.quiz ? quizScore >= lesson.quiz.passingScore : true
    return (
      <LessonComplete
        lessonId={lesson.id}
        passed={passed}
        score={hasQuiz ? quizScore : undefined}
        total={lesson.quiz?.questions.length}
        onContinue={handleComplete}
        onRetry={!passed ? handleRetry : undefined}
      />
    )
  }

  // Quiz runner
  if (quizActive && lesson.quiz) {
    return <QuizRunner lesson={lesson} lang={lang} onDone={handleQuizDone} />
  }

  return (
    <div>
      {/* Progress */}
      <ProgressBar
        value={baseProgress}
        label={`${stepIdx + 1} / ${totalSteps}${hasQuiz ? ' + 퀴즈' : ''}`}
      />

      {/* Step content */}
      <LessonCard stepKey={stepIdx}>
        <StepRenderer
          step={currentStep}
          lang={lang}
          onInteract={() => setInteracted(true)}
        />
      </LessonCard>

      {/* Navigation */}
      <div style={{ padding: '24px 20px 0' }}>
        <button
          onClick={handleNext}
          disabled={needsInteract && !interacted}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 14,
            border: 'none',
            background: needsInteract && !interacted
              ? 'rgba(0,0,0,0.08)'
              : 'linear-gradient(135deg, #FF6B8C, #FF8C6B)',
            color: needsInteract && !interacted ? 'var(--pm)' : '#fff',
            fontWeight: 800,
            fontSize: 16,
            cursor: needsInteract && !interacted ? 'not-allowed' : 'pointer',
            transition: 'background 0.3s',
          }}
        >
          {isLastStep
            ? hasQuiz ? '퀴즈 시작하기 →' : '완료!'
            : '다음 →'}
        </button>
        {needsInteract && !interacted && (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--pm)', marginTop: 8 }}>
            3회 이상 시도해야 다음으로 진행할 수 있어요
          </p>
        )}
      </div>
    </div>
  )
}
