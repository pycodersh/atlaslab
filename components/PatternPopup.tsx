'use client'

import { useState } from 'react'
import { X, Volume2, BookmarkPlus, BookmarkCheck } from 'lucide-react'
import type { MagazinePattern } from '@/types/magazine'

type PatternPopupProps = {
  pattern: MagazinePattern
  onClose: () => void
  speak: (text: string) => void
  stop: () => void
  isSpeaking: boolean
}

export function PatternPopup({ pattern, onClose, speak, stop, isSpeaking }: PatternPopupProps) {
  const [saved, setSaved] = useState(false)

  function handleAudio() {
    if (isSpeaking) { stop(); return }
    speak(pattern.storySentence)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-0 pb-0"
      onClick={() => { onClose(); stop() }}
    >
      <div
        className="bg-white w-full max-w-sm rounded-t-3xl shadow-2xl overflow-y-auto"
        style={{ maxHeight: '88dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#EDE5DC]" />
        </div>

        <div className="px-6 pt-2 pb-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-[9px] tracking-[0.25em] text-[#8B2246] font-bold">PATTERN NOTE</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={isSpeaking ? '정지' : '읽기'}
                onClick={handleAudio}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isSpeaking
                    ? 'bg-[#FDF0F4] text-[#8B2246]'
                    : 'text-[#C8BFB5] hover:bg-[#FDF0F4] hover:text-[#8B2246]'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="닫기"
                onClick={() => { onClose(); stop() }}
                className="text-[#C8BFB5] hover:text-[#1A1A1A] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pattern + Meaning */}
          <div className="mb-5 pb-5 border-b border-[#F0E8E0]">
            <p className="font-playfair text-[1.3rem] font-bold text-[#1A1A1A] leading-snug">
              {pattern.pattern}
            </p>
            <p className="text-[0.78rem] text-[#8B2246] mt-1 font-medium">{pattern.meaningKo}</p>
          </div>

          {/* Natural explanation */}
          {pattern.explanation && (
            <div className="mb-5 pb-5 border-b border-[#F0E8E0]">
              <p className="text-[9px] tracking-[0.2em] text-[#C8BFB5] font-semibold mb-2">해설</p>
              <p className="text-[0.82rem] text-[#3A3A3A] leading-[1.9] whitespace-pre-line">
                {pattern.explanation}
              </p>
            </div>
          )}

          {/* Story sentence */}
          <div className="mb-5 pb-5 border-b border-[#F0E8E0]">
            <p className="text-[9px] tracking-[0.2em] text-[#C8BFB5] font-semibold mb-2">스토리 예문</p>
            <p className="text-[0.85rem] font-playfair font-bold text-[#1A1A1A] leading-relaxed">
              {pattern.storySentence}
            </p>
            <p className="text-[0.75rem] text-[#9B9490] mt-1 leading-relaxed">
              {pattern.storySentenceKo}
            </p>
          </div>

          {/* Additional examples */}
          {pattern.examples && pattern.examples.length > 0 && (
            <div className="mb-6">
              <p className="text-[9px] tracking-[0.2em] text-[#C8BFB5] font-semibold mb-3">추가 예문</p>
              <div className="space-y-3.5">
                {pattern.examples.map((ex, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="font-playfair text-[11px] font-bold text-[#8B2246] w-4 shrink-0 pt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-[0.82rem] font-medium text-[#1A1A1A] leading-relaxed">{ex.en}</p>
                      <p className="text-[0.72rem] text-[#9B9490] mt-0.5">{ex.ko}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save button */}
          <button
            type="button"
            onClick={() => setSaved(true)}
            disabled={saved}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-[12px] font-bold tracking-[0.08em] transition-colors cursor-pointer ${
              saved
                ? 'bg-[#F0EAE2] text-[#8B2246]'
                : 'bg-[#8B2246] text-white hover:bg-[#7A1D3F]'
            }`}
          >
            {saved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5" />
                SAVED
              </>
            ) : (
              <>
                <BookmarkPlus className="w-3.5 h-3.5" />
                SAVE PATTERN
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
