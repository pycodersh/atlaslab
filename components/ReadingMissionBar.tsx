'use client'

import { Minus, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

type ReadingMissionBarProps = {
  count: number
  goal: number
  onIncrement: () => void
  onDecrement: () => void
}

export function ReadingMissionBar({ count, goal, onIncrement, onDecrement }: ReadingMissionBarProps) {
  const isDone = count >= goal
  const isZero = count <= 0

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-[0_2px_12px_rgba(79,140,255,0.08)] ring-1 ring-[#E8F0FE] backdrop-blur-sm">

      {/* - 버튼 */}
      <button
        aria-label="낭독 횟수 -1"
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all active:scale-90',
          isZero
            ? 'cursor-not-allowed bg-[#F5F8FF] text-[#D1D9E6]'
            : 'bg-[#F0F7FF] text-[#4F8CFF] hover:bg-[#DCEBFF]',
        )}
        disabled={isZero}
        onClick={(e) => { e.stopPropagation(); if (!isZero) onDecrement() }}
        type="button"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      {/* 도트 + 텍스트 */}
      <div className="flex flex-1 flex-col items-center gap-1.5">
        <div className="flex items-center gap-1">
          {Array.from({ length: goal }, (_, i) => (
            <div
              key={i}
              className={cn(
                'rounded-full transition-all duration-300',
                i < count ? 'h-2 w-2 bg-[#4F8CFF]' : 'h-1.5 w-1.5 bg-[#D1D9E6]',
              )}
            />
          ))}
        </div>
        <span className="text-[10px] font-semibold tabular-nums text-[#B0BCCE]">
          {count} / {goal}
        </span>
      </div>

      {/* + 버튼 */}
      <button
        aria-label="낭독 횟수 +1"
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all active:scale-90',
          isDone
            ? 'cursor-not-allowed bg-[#DCFCE7] text-[#22C55E]'
            : 'bg-[#4F8CFF] text-white shadow-[0_2px_8px_rgba(79,140,255,0.30)] hover:bg-[#3B7DE8]',
        )}
        disabled={isDone}
        onClick={(e) => { e.stopPropagation(); if (!isDone) onIncrement() }}
        type="button"
      >
        {isDone
          ? <span className="text-sm font-bold">✓</span>
          : <Plus className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
