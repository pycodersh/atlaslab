'use client'

import { ArrowLeft, ArrowRight, Volume2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useSpeech } from '@/hooks/useSpeech'
import { cn } from '@/lib/utils'
import type { Difficulty, PatternWithExamples } from '@/types/pattern'

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  normal:   'Normal',
  advanced: 'Advanced',
  native:   'Native',
}

const DIFFICULTIES: Difficulty[] = ['normal', 'advanced', 'native']

type PatternCardBackProps = {
  pattern: PatternWithExamples
  defaultDifficulty?: Difficulty
  canGoPrevious: boolean
  isLastCard: boolean
  onPrevious: () => void
  onNext: () => void
}

export function PatternCardBack({
  pattern,
  defaultDifficulty = 'normal',
  canGoPrevious,
  isLastCard,
  onPrevious,
  onNext,
}: PatternCardBackProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>(defaultDifficulty)
  const { speak, speakAll, isSpeaking, stop } = useSpeech()
  const examples = pattern.examples[difficulty] ?? []
  const sentences = examples.map((ex) => ex.sentence)

  function handleSpeakAll(e: React.MouseEvent) {
    e.stopPropagation()
    if (isSpeaking) { stop(); return }
    speakAll(sentences)
  }

  return (
    <div className="absolute inset-0 flex flex-col rounded-[28px] border border-[#E8F0FE] bg-white p-5 shadow-[0_8px_40px_rgba(79,140,255,0.10)] [backface-visibility:hidden] [transform:rotateY(180deg)]">

      {/* 패턴 + 전체 듣기 */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-xl font-extrabold leading-snug tracking-tight text-[#1F2937]">
          {pattern.pattern_text}
        </p>
        <button
          aria-label={isSpeaking ? '정지' : '전체 듣기'}
          className={cn(
            'mt-0.5 shrink-0 rounded-full p-2 transition-colors',
            isSpeaking
              ? 'bg-[#FFE8E8] text-[#FF6B6B]'
              : 'bg-[#DCEBFF] text-[#4F8CFF] hover:bg-[#C8DCFF]',
          )}
          onClick={handleSpeakAll}
          type="button"
        >
          <Volume2 className="h-4 w-4" />
        </button>
      </div>

      {/* 난이도 탭 (임시 변경용) */}
      <div
        className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-[#F5F8FF] p-1"
        onClick={(e) => e.stopPropagation()}
      >
        {DIFFICULTIES.map((d) => (
          <button
            className={cn(
              'rounded-xl py-1.5 text-[11px] font-bold transition-colors',
              difficulty === d
                ? 'bg-white text-[#4F8CFF] shadow-sm'
                : 'text-[#9EAEC8] hover:text-[#4F8CFF]',
            )}
            key={d}
            onClick={() => { stop(); setDifficulty(d) }}
            type="button"
          >
            {DIFFICULTY_LABELS[d]}
          </button>
        ))}
      </div>

      {/* 예문 목록 */}
      <ol className="mt-3 flex-1 space-y-3 overflow-y-auto">
        {examples.length === 0 ? (
          <li className="text-center text-xs text-[#C8D8F0]">예문이 없습니다</li>
        ) : examples.map((ex, index) => (
          <li className="flex items-start gap-2.5" key={ex.id}>
            <span className="min-w-[18px] pt-px text-xs font-bold text-[#4F8CFF]">
              {index + 1}.
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[0.85rem] font-semibold leading-relaxed text-[#1F2937]">
                {ex.sentence}
              </p>
              {ex.translation && (
                <p className="mt-0.5 text-[0.75rem] leading-relaxed text-[#9EAEC8]">
                  {ex.translation}
                </p>
              )}
            </div>
            <button
              aria-label={`${index + 1}번 예문 듣기`}
              className="mt-0.5 shrink-0 rounded-full p-1.5 text-[#C8D8F0] transition-colors hover:bg-[#F0F7FF] hover:text-[#4F8CFF]"
              onClick={(e) => { e.stopPropagation(); speak(ex.sentence) }}
              type="button"
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ol>

      {/* 이전/다음 */}
      <div className="mt-auto grid grid-cols-2 gap-2.5 pt-4" onClick={(e) => e.stopPropagation()}>
        <Button
          className="gap-1.5 rounded-2xl border border-[#E8F0FE] bg-white text-[#6B7280] hover:bg-[#F5F8FF] hover:text-[#1F2937]"
          disabled={!canGoPrevious}
          onClick={onPrevious}
          type="button"
          variant="ghost"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          이전
        </Button>
        <Button
          className="gap-1.5 rounded-2xl bg-[#4F8CFF] text-white hover:bg-[#3D7AEE]"
          onClick={onNext}
          type="button"
        >
          {isLastCard ? 'Mini Story' : '다음'}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
