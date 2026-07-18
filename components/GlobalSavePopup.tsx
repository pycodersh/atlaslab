'use client'

import { useEffect, useState } from 'react'
import { subscribeSavePopup, closeSavePopup, type PopupItem } from '@/lib/words/popupStore'
import { saveWord, savePhrase } from '@/lib/words/storage'
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
            {/* Selected text display */}
            <p style={{
              fontSize: 20, fontWeight: 700, color: 'var(--pt)',
              margin: '0 0 4px', textAlign: 'center', lineHeight: 1.25,
            }}>
              {item.chunk ? item.chunk.text : item.word}
            </p>
            {item.chunk && (
              <p style={{
                fontSize: 11, color: 'var(--pm)', margin: '0 0 4px',
                textAlign: 'center', letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {item.chunk.type === 'phrasalVerb' ? 'Phrasal Verb'
                  : item.chunk.type === 'idiom' ? 'Idiom'
                  : item.chunk.type}
              </p>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
              {item.chunk && (
                <Btn variant="primary" onClick={handleSavePhrase}>Save phrase</Btn>
              )}
              {item.chunk
                ? <Btn variant="secondary" onClick={handleSaveWord}>Save word</Btn>
                : <Btn variant="primary" onClick={handleSaveWord}>Save</Btn>
              }
              <Btn variant="ghost" onClick={dismiss}>Cancel</Btn>
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
