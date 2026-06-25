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
    /* 동일 오버레이: fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6 */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6"
      onClick={() => { onClose(); stop() }}
    >
      <div
        className="rounded-2xl p-5 w-full max-w-[320px] shadow-2xl overflow-y-auto"
        style={{ background: '#FAF8F4', maxHeight: '82dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — PATTERN NOTE + TTS + Close */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-[9px] tracking-[0.25em] text-[#8B2246] font-semibold">PATTERN NOTE</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={isSpeaking ? '정지' : '읽기'}
              onClick={handleAudio}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isSpeaking
                  ? 'bg-[#EDE5DC] text-[#8B2246]'
                  : 'text-[#C8BFB5] hover:bg-[#EDE5DC] hover:text-[#8B2246]'
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

        {/* Pattern + meaning */}
        <p className="font-playfair text-[1.15rem] font-bold text-[#1A1A1A] leading-snug">
          {pattern.pattern}
        </p>
        <p className="text-[0.78rem] text-[#8B2246] mt-0.5 mb-4">{pattern.meaningKo}</p>

        {/* Explanation */}
        {pattern.explanation && (
          <>
            <div className="h-px bg-[#EDE5DC] mb-3" />
            <p className="text-[9px] tracking-[0.2em] text-[#C8BFB5] font-semibold mb-2">해설</p>
            <p className="text-[0.8rem] text-[#3A3A3A] leading-[1.85] whitespace-pre-line mb-4">
              {pattern.explanation}
            </p>
          </>
        )}

        {/* Story sentence */}
        <div className="h-px bg-[#EDE5DC] mb-3" />
        <p className="text-[9px] tracking-[0.2em] text-[#C8BFB5] font-semibold mb-2">스토리 예문</p>
        <p className="font-playfair text-[0.82rem] font-bold text-[#1A1A1A] leading-relaxed">
          {pattern.storySentence}
        </p>
        <p className="text-[0.73rem] text-[#9B9490] mt-0.5 leading-relaxed mb-4">
          {pattern.storySentenceKo}
        </p>

        {/* Additional examples */}
        {pattern.examples && pattern.examples.length > 0 && (
          <>
            <div className="h-px bg-[#EDE5DC] mb-3" />
            <p className="text-[9px] tracking-[0.2em] text-[#C8BFB5] font-semibold mb-3">추가 예문</p>
            <div className="space-y-3 mb-4">
              {pattern.examples.map((ex, i) => (
                <div key={i} className="flex gap-3">
                  <span className="font-playfair text-[11px] font-bold text-[#8B2246] w-4 shrink-0 pt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[0.8rem] font-medium text-[#1A1A1A] leading-relaxed">{ex.en}</p>
                    <p className="text-[0.7rem] text-[#9B9490] mt-0.5">{ex.ko}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Save button */}
        <div className="h-px bg-[#EDE5DC] mb-4" />
        <button
          type="button"
          onClick={() => setSaved(true)}
          disabled={saved}
          className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-[11px] font-bold tracking-[0.08em] transition-colors cursor-pointer ${
            saved
              ? 'bg-[#EDE5DC] text-[#8B2246]'
              : 'bg-[#8B2246] text-white hover:bg-[#7A1D3F]'
          }`}
        >
          {saved ? (
            <><BookmarkCheck className="w-3.5 h-3.5" /> SAVED</>
          ) : (
            <><BookmarkPlus className="w-3.5 h-3.5" /> SAVE PATTERN</>
          )}
        </button>
      </div>
    </div>
  )
}
