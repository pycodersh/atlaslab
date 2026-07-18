'use client'

import { useEffect, useState } from 'react'
import { subscribeSavePopup, closeSavePopup, type PopupItem } from '@/lib/words/popupStore'
import { saveWord, savePhrase } from '@/lib/words/storage'

export function GlobalSavePopup() {
  const [item, setItem] = useState<PopupItem | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    return subscribeSavePopup(setItem)
  }, [])

  function dismiss() {
    window.getSelection()?.removeAllRanges()
    closeSavePopup()
    setItem(null)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 1800)
  }

  function handleSaveWord() {
    if (!item) return
    saveWord({
      word: item.word,
      sourceType: item.sourceType,
      sourceId: item.sourceId,
      storyId: item.storyId,
      patternId: item.patternId,
      paragraphId: item.paragraphId,
      exampleIndex: item.exampleIndex,
      originalSentence: item.originalSentence,
    })
    dismiss()
    showToast('Saved to Library')
  }

  function handleSavePhrase() {
    if (!item?.chunk) return
    savePhrase({
      phrase: item.chunk.text,
      phraseType: item.chunk.type,
      sourceType: item.sourceType,
      sourceId: item.sourceId,
      storyId: item.storyId,
      patternId: item.patternId,
      paragraphId: item.paragraphId,
      exampleIndex: item.exampleIndex,
      originalSentence: item.originalSentence,
      meaning: item.koreanSentence,
    })
    dismiss()
    showToast('Saved to Library')
  }

  return (
    <>
      {/* Bottom sheet */}
      {item && (
        <div
          onClick={dismiss}
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: 'rgba(0,0,0,0.28)',
            display: 'flex', alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 480,
              background: 'var(--pglass)',
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              border: '1px solid var(--pglass-border)',
              borderRadius: '20px 20px 0 0',
              padding: `20px 20px calc(20px + env(safe-area-inset-bottom, 0px))`,
            }}
          >
            {/* Handle */}
            <div style={{
              width: 36, height: 4, borderRadius: 2,
              background: 'var(--pglass-border)',
              margin: '0 auto 20px',
            }} />

            {/* Selected text display */}
            <p style={{
              fontSize: 19, fontWeight: 700, color: 'var(--pt)',
              margin: '0 0 4px', textAlign: 'center', lineHeight: 1.25,
            }}>
              {item.chunk ? item.chunk.text : item.word}
            </p>
            {item.chunk && (
              <p style={{
                fontSize: 11, color: 'var(--pm)', margin: '0 0 20px',
                textAlign: 'center', letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {item.chunk.type === 'phrasalVerb' ? 'Phrasal Verb'
                  : item.chunk.type === 'idiom' ? 'Idiom'
                  : item.chunk.type}
              </p>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: item.chunk ? 0 : 20 }}>
              {item.chunk && (
                <button
                  type="button"
                  onClick={handleSavePhrase}
                  style={{
                    width: '100%', padding: '13px 0', borderRadius: 14,
                    background: 'var(--pa)', color: '#fff',
                    fontWeight: 700, fontSize: 15, border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Save phrase
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveWord}
                style={{
                  width: '100%', padding: '13px 0', borderRadius: 14,
                  background: item.chunk ? 'transparent' : 'var(--pa)',
                  color: item.chunk ? 'var(--pt)' : '#fff',
                  fontWeight: item.chunk ? 600 : 700,
                  fontSize: 15,
                  border: item.chunk ? '1px solid var(--pglass-border)' : 'none',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {item.chunk ? `Save word "${item.word}"` : `Save "${item.word}"`}
              </button>
              <button
                type="button"
                onClick={dismiss}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 14,
                  background: 'transparent', color: 'var(--pm)',
                  fontWeight: 500, fontSize: 14, border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', marginTop: 2,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 96, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9100,
          background: 'rgba(20,20,40,0.88)',
          backdropFilter: 'blur(12px)',
          color: '#fff', fontSize: 13, fontWeight: 600,
          padding: '8px 18px', borderRadius: 99,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}
    </>
  )
}
