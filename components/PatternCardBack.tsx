'use client'

import { Heart, Volume2 } from 'lucide-react'

import { useSpeech } from '@/hooks/useSpeech'
import { cn } from '@/lib/utils'
import type { Difficulty, PatternWithExamples } from '@/types/pattern'

type PatternCardBackProps = {
  pattern: PatternWithExamples
  difficulty: Difficulty
  cardIndex: number
  totalCards: number
  storyNumber: number
  isFavorited?: boolean
  onJump?: () => void
  onToggleFavorite?: () => void
}

export function PatternCardBack({
  pattern,
  difficulty,
  cardIndex,
  totalCards,
  storyNumber,
  isFavorited = false,
  onJump,
  onToggleFavorite,
}: PatternCardBackProps) {
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

      {/* STORY 섹션 헤더 */}
      <button
        className="self-start transition-opacity hover:opacity-60 active:opacity-40"
        onClick={(e) => { e.stopPropagation(); onJump?.() }}
        style={{
          fontFamily: 'var(--font-jakarta), -apple-system, sans-serif',
          fontWeight: 800,
          fontSize: '0.68rem',
          textTransform: 'uppercase',
          letterSpacing: '0.10em',
          color: '#4F8CFF',
        }}
        type="button"
      >
        Story {storyNumber}
      </button>
      {/* 얇은 블루 라인 */}
      <div className="mb-3 mt-1 h-px w-full bg-[#4F8CFF]/20" />

      {/* 도트 — 가운데 */}
      <div className="mb-3 flex items-center justify-center gap-1.5">
        {Array.from({ length: totalCards }, (_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-full transition-all duration-300',
              i === cardIndex ? 'h-2 w-2 bg-[#4F8CFF]' : 'h-1.5 w-1.5 bg-[#D1D9E6]',
            )}
          />
        ))}
      </div>

      {/* 예문 레이블 */}
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9EAEC8]">예문</p>

      {/* 예문 목록 */}
      <ol className="flex-1 space-y-2.5 overflow-y-auto">
        {examples.length === 0 ? (
          <li className="flex h-full items-center justify-center text-xs text-[#C8D8F0]">
            예문이 없습니다
          </li>
        ) : (
          examples.map((ex, index) => (
            <li className="flex items-start gap-2" key={ex.id}>
              <div className="min-w-0 flex-1">
                <p className="text-[0.84rem] font-semibold leading-relaxed text-[#1F2937]">
                  {ex.sentence}
                </p>
                {ex.translation && (
                  <p className="mt-0.5 text-[0.73rem] leading-relaxed text-[#9EAEC8]">
                    {ex.translation}
                  </p>
                )}
              </div>
              <button
                aria-label={`${index + 1}번 예문 듣기`}
                className="mt-0.5 shrink-0 rounded-full p-1.5 text-[#C8D8F0] transition-colors hover:bg-[#F0F7FF] hover:text-[#4F8CFF]"
                onClick={(e) => { e.stopPropagation(); speak(ex.sentence.trim()) }}
                type="button"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))
        )}
      </ol>

      {/* 전체 듣기 — 예문 스피커 아래 우측 정렬 */}
      <div className="flex items-center justify-end pt-2">
        <button
          aria-label={isSpeaking ? '정지' : '전체 듣기'}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors',
            isSpeaking
              ? 'bg-[#FFE8E8] text-[#FF6B6B]'
              : 'bg-[#DCEBFF] text-[#4F8CFF] hover:bg-[#C8DCFF]',
          )}
          onClick={handleSpeakAll}
          type="button"
        >
          <Volume2 className="h-3.5 w-3.5" />
          {isSpeaking ? '정지' : '전체 듣기'}
        </button>
      </div>

      {/* 하트 — 좌하단 */}
      <div className="flex justify-start pt-1">
        {onToggleFavorite && (
          <button
            aria-label={isFavorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            className="rounded-full p-1.5 transition-colors hover:bg-[#F0F7FF]"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
            type="button"
          >
            <Heart
              className={cn(
                'h-5 w-5 transition-colors',
                isFavorited ? 'fill-[#FF6B6B] text-[#FF6B6B]' : 'text-[#D1D9E6]',
              )}
            />
          </button>
        )}
      </div>
    </div>
  )
}
