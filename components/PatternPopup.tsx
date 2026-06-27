'use client'

import { useState, useEffect } from 'react'
import { X, Volume2, BookmarkPlus, BookmarkCheck } from 'lucide-react'
import type { MagazinePattern } from '@/types/magazine'
import { usePreferences } from '@/contexts/PreferencesContext'

type PatternPopupProps = {
  pattern: MagazinePattern
  onClose: () => void
  speak: (text: string) => void
  stop: () => void
  isSpeaking: boolean
}

export function PatternPopup({ pattern, onClose, speak, stop, isSpeaking }: PatternPopupProps) {
  const { prefs } = usePreferences()
  const showTranslation = prefs.translationLang !== 'none'
  const [saved, setSaved] = useState(false)
  const [speakingId, setSpeakingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isSpeaking) setSpeakingId(null)
  }, [isSpeaking])

  function handleSpeak(id: string, text: string) {
    if (speakingId === id && isSpeaking) { stop(); setSpeakingId(null); return }
    stop()
    setSpeakingId(id)
    speak(text)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      onClick={() => { onClose(); stop() }}
    >
      <div
        className="rounded-2xl w-full max-w-[320px] shadow-2xl overflow-y-auto"
        style={{ background: 'var(--pb)', maxHeight: '82dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — sticky so X is always visible when scrolling */}
        <div
          className="flex justify-between items-center px-5 pt-5 pb-3"
          style={{ position: 'sticky', top: 0, background: 'var(--pb)', zIndex: 1 }}
        >
          <span className="text-[9px] tracking-[0.25em] text-[var(--pa)] font-semibold">PATTERN NOTE</span>
          <button
            type="button"
            aria-label="닫기"
            onClick={() => { onClose(); stop() }}
            className="text-[var(--pm2)] hover:text-[var(--pt)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-5">

        {/* Pattern + meaning */}
        <p className="font-playfair text-[1.15rem] font-bold text-[var(--pt)] leading-snug">
          {pattern.pattern}
        </p>
        {showTranslation && <p className="text-[0.78rem] text-[var(--pa)] mt-0.5 mb-4">{pattern.meaningKo}</p>}

        {/* Explanation */}
        {pattern.explanation && (
          <>
            <div className="h-px bg-[var(--pd)] mb-3" />
            <p className="text-[9px] tracking-[0.2em] text-[var(--pm2)] font-semibold mb-2">해설</p>
            <p className="text-[0.8rem] text-[var(--pt2)] leading-[1.85] whitespace-pre-line mb-4">
              {pattern.explanation}
            </p>
          </>
        )}

        {/* Variation sentence */}
        <div className="h-px bg-[var(--pd)] mb-3" />
        <p className="text-[9px] tracking-[0.2em] text-[var(--pm2)] font-semibold mb-2">변형 예문</p>
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-[0.82rem] font-medium text-[var(--pt)] leading-relaxed">
              {pattern.variationSentence}
            </p>
            {showTranslation && (
              <p className="text-[0.73rem] text-[var(--pm)] mt-0.5 leading-relaxed">
                {pattern.variationSentenceKo}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="읽기"
            onClick={() => handleSpeak('variation', pattern.variationSentence)}
            className={`shrink-0 p-1.5 rounded-full transition-colors cursor-pointer mt-0.5 ${
              speakingId === 'variation' && isSpeaking
                ? 'bg-[var(--pd)] text-[var(--pa)]'
                : 'text-[var(--pm2)] hover:bg-[var(--pd)] hover:text-[var(--pa)]'
            }`}
          >
            <Volume2 className="w-3 h-3" />
          </button>
        </div>

        {/* Additional examples */}
        {pattern.examples && pattern.examples.length > 0 && (
          <>
            <div className="h-px bg-[var(--pd)] mb-3" />
            <p className="text-[9px] tracking-[0.2em] text-[var(--pm2)] font-semibold mb-3">추가 예문</p>
            <div className="space-y-3 mb-4">
              {pattern.examples.map((ex, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="font-playfair text-[11px] font-bold text-[var(--pa)] w-4 shrink-0 pt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.8rem] font-medium text-[var(--pt)] leading-relaxed">{ex.en}</p>
                    <p className="text-[0.7rem] text-[var(--pm)] mt-0.5">{ex.ko}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="읽기"
                    onClick={() => handleSpeak(`ex-${i}`, ex.en)}
                    className={`shrink-0 p-1.5 rounded-full transition-colors cursor-pointer mt-0.5 ${
                      speakingId === `ex-${i}` && isSpeaking
                        ? 'bg-[var(--pd)] text-[var(--pa)]'
                        : 'text-[var(--pm2)] hover:bg-[var(--pd)] hover:text-[var(--pa)]'
                    }`}
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Save button */}
        <div className="h-px bg-[var(--pd)] mb-4" />
        <button
          type="button"
          onClick={() => setSaved(true)}
          disabled={saved}
          className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-[11px] font-bold tracking-[0.08em] transition-colors cursor-pointer ${
            saved
              ? 'bg-[var(--pd)] text-[var(--pa)]'
              : 'bg-[var(--pa)] text-white hover:opacity-90'
          }`}
        >
          {saved ? (
            <><BookmarkCheck className="w-3.5 h-3.5" /> SAVED</>
          ) : (
            <><BookmarkPlus className="w-3.5 h-3.5" /> SAVE PATTERN</>
          )}
        </button>
        </div>{/* px-5 pb-5 */}
      </div>
    </div>
  )
}
