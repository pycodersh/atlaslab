'use client'

import { useEffect, useState } from 'react'
import { subscribeSavePopup, closeSavePopup, type PopupItem } from '@/lib/words/popupStore'
import { saveWord, savePhrase, isSavedWord, isSavedPhrase } from '@/lib/words/storage'
import { Btn } from '@/components/ui/Btn'

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
    if (isSavedWord(item.word)) {
      dismiss()
      showToast('Already saved')
      return
    }
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
    if (isSavedPhrase(item.chunk.text)) {
      dismiss()
      showToast('Already saved')
      return
    }
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

  function renderChunkTitle(chunkText: string, tappedWord: string) {
    const lower = tappedWord.toLowerCase()
    return chunkText.split(' ').map((w, i) => {
      const isHighlighted = w.toLowerCase().replace(/[^a-z]/g, '') === lower.replace(/[^a-z]/g, '')
      return (
        <span key={i} style={isHighlighted ? {
          color: '#1E293B',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
        } : { color: '#111827' }}>
          {i > 0 ? ' ' : ''}{w}
        </span>
      )
    })
  }

  const btnBase: React.CSSProperties = {
    width: '100%', borderRadius: 14,
    padding: '11px 20px', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', outline: 'none',
  }

  return (
    <>
      {/* Center popup */}
      {item && (
        <div
          onClick={dismiss}
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: 'rgba(0,0,0,0.28)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            padding: '0 32px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 320,
              background: 'var(--pglass)',
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              border: '1px solid var(--pglass-border)',
              borderRadius: 20,
              padding: '24px 20px 20px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            }}
          >
            {/* Title */}
            <p style={{
              fontSize: 20, fontWeight: 700,
              margin: '0 0 4px', textAlign: 'center', lineHeight: 1.3,
            }}>
              {item.chunk
                ? renderChunkTitle(item.chunk.text, item.word)
                : <span style={{ color: '#111827' }}>{item.word}</span>
              }
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
              {item.chunk && (
                <button
                  type="button"
                  style={{ ...btnBase, background: '#1E293B', color: '#fff', border: '1.5px solid #1E293B' }}
                  onClick={handleSavePhrase}
                >
                  Save phrase
                </button>
              )}
              {item.chunk
                ? (
                  <button
                    type="button"
                    style={{ ...btnBase, background: 'transparent', color: '#1E293B', border: '1.5px solid #1E293B' }}
                    onClick={handleSaveWord}
                  >
                    Save word only
                  </button>
                )
                : (
                  <button
                    type="button"
                    style={{ ...btnBase, background: '#1E293B', color: '#fff', border: '1.5px solid #1E293B' }}
                    onClick={handleSaveWord}
                  >
                    Save
                  </button>
                )
              }
              <button
                type="button"
                style={{ ...btnBase, background: 'transparent', color: '#6B7280', border: '1.5px solid #E5E7EB', fontWeight: 500 }}
                onClick={dismiss}
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
