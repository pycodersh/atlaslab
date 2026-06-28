'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { MagazinePattern } from '@/types/magazine'
import type { PracticeExample } from '@/data/pattern-examples'
import { usePreferences } from '@/contexts/PreferencesContext'
import { type VoiceKey } from '@/lib/settings/preferences'
import { PatternPracticeCard } from '@/components/PatternPracticeCard'

type Props = {
  storyId: number
  storyTitle: string
  narratorVoice?: VoiceKey
  pattern: MagazinePattern
  examples: PracticeExample[]
  patternIndex: number   // 1-based
  patternTotal: number
  prevPid: string | null
  nextPid: string | null
}

export function PatternDetail({
  storyId, storyTitle, narratorVoice, pattern, examples,
  patternIndex, patternTotal, prevPid, nextPid,
}: Props) {
  const router = useRouter()
  const { prefs } = usePreferences()
  const voice: VoiceKey = narratorVoice ?? prefs.voice

  return (
    <div className="min-h-dvh bg-[var(--pb)] flex flex-col">
      {/* 상단 바 */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-1">
        <button
          type="button"
          aria-label="패턴 목록"
          onClick={() => router.push(`/stories/${storyId}?v=p`)}
          className="p-2 -ml-2 rounded-full text-[var(--pm)] hover:text-[var(--pa)] hover:bg-[var(--pal)] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={1.6} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-7 pb-10">
        {/* ── 학습 흐름 헤더 ── */}
        <div className="pt-2 pb-6">
          <p className="text-[10px] tracking-[0.28em] font-bold text-[var(--pa)] mb-1.5">
            STORY {String(storyId).padStart(2, '0')}
          </p>
          <h1 className="font-playfair text-[1.9rem] font-bold text-[var(--pt)] leading-tight mb-3">
            {storyTitle}
          </h1>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold tracking-[0.05em] text-[var(--pm)]">
              Pattern {patternIndex} / {patternTotal}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: patternTotal }).map((_, i) => (
                <span
                  key={i}
                  className={[
                    'block rounded-full transition-colors',
                    i + 1 === patternIndex ? 'w-4 h-1.5 bg-[var(--pa)]' : 'w-1.5 h-1.5 bg-[var(--pd)]',
                  ].join(' ')}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 단일 Pattern 카드 (예문 5개 인라인) */}
        <PatternPracticeCard
          storyId={storyId}
          storyTitle={storyTitle}
          voice={voice}
          pattern={pattern}
          examples={examples}
          index={patternIndex}
          active
          onRequestPlay={() => {}}
        />
      </div>

      {/* ── 하단: 이전 / 다음 Pattern ── */}
      <div className="shrink-0 border-t border-[var(--pd)] bg-[var(--pb)] py-3 px-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="이전 패턴"
            onClick={() => prevPid && router.push(`/stories/${storyId}/patterns/${prevPid}`)}
            disabled={!prevPid}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-bold transition-colors ${
              prevPid ? 'text-[var(--pm)] hover:text-[var(--pa)] hover:bg-[var(--pal)] cursor-pointer' : 'text-[var(--pd)] cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.8} /> 이전 패턴
          </button>

          <span className="text-[10px] tracking-[0.15em] text-[var(--pm2)] font-semibold">
            {patternIndex} / {patternTotal}
          </span>

          <button
            type="button"
            aria-label="다음 패턴"
            onClick={() => nextPid && router.push(`/stories/${storyId}/patterns/${nextPid}`)}
            disabled={!nextPid}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-bold transition-colors ${
              nextPid ? 'text-[var(--pm)] hover:text-[var(--pa)] hover:bg-[var(--pal)] cursor-pointer' : 'text-[var(--pd)] cursor-not-allowed'
            }`}
          >
            다음 패턴 <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  )
}
