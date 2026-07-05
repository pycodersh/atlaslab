'use client'

import { useEffect, useRef, useState } from 'react'
import { subscribeSavePopup, closeSavePopup, type PopupItem } from '@/lib/words/popupStore'
import { saveWord } from '@/lib/words/storage'

type Toast = 'hidden' | 'visible' | 'fading'

/**
 * Global singleton Word/Phrase save popup.
 * Mount once (in MagazineEngine). Subscribes to popupStore.
 *
 * - Always centered on screen
 * - Backdrop click closes the popup
 * - Shows word or multi-word phrase
 * - Toast notification on save
 */
export function GlobalSavePopup() {
  const [item, setItem]   = useState<PopupItem | null>(null)
  const [toast, setToast] = useState<Toast>('hidden')
  const toastTimer        = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => subscribeSavePopup(setItem), [])

  function handleSave() {
    if (!item) return
    saveWord({
      word:             item.word,
      sourceType:       item.sourceType,
      sourceId:         item.sourceId,
      storyId:          item.storyId,
      patternId:        item.patternId,
      paragraphId:      item.paragraphId,
      exampleIndex:     item.exampleIndex,
      originalSentence: item.originalSentence,
    })
    // Clear any native text selection
    window.getSelection()?.removeAllRanges()
    closeSavePopup()

    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast('visible')
    toastTimer.current = setTimeout(() => {
      setToast('fading')
      toastTimer.current = setTimeout(() => setToast('hidden'), 400)
    }, 1600)
  }

  function handleClose() {
    window.getSelection()?.removeAllRanges()
    closeSavePopup()
  }

  const isPhrase = item ? item.word.includes(' ') : false
  const label    = isPhrase ? 'Save Phrase' : 'Save Word'
  const display  = item ? (item.word.length > 40 ? item.word.slice(0, 38) + '…' : item.word) : ''

  return (
    <>
      {/* ── Backdrop: closes popup on tap outside ── */}
      {item && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed', inset: 0,
            zIndex: 490,
            background: 'transparent',
          }}
        />
      )}

      {/* ── Centered popup ── */}
      {item && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position:  'fixed',
            top:       '50%',
            left:      '50%',
            transform: 'translate(-50%, -50%)',
            zIndex:    500,
            background: 'var(--pb)',
            border:    '1px solid var(--pd)',
            borderRadius: 16,
            padding:   '18px 20px 16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
            minWidth:  220,
            maxWidth:  'calc(100vw - 48px)',
          }}
        >
          {/* Word / Phrase display */}
          <p style={{
            fontSize: 15, fontWeight: 700,
            color: 'var(--pt)',
            margin: '0 0 14px',
            textAlign: 'center',
            wordBreak: 'break-word',
            lineHeight: 1.4,
          }}>
            &ldquo;{display}&rdquo;
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.68)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.82)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)',
                color: 'var(--pa)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.02em',
              }}
            >
              {label}
            </button>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '9px 16px',
                borderRadius: 10,
                background: 'var(--pc)',
                color: 'var(--pt2)',
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Saved toast ── */}
      {toast !== 'hidden' && (
        <div style={{
          position:   'fixed',
          bottom:     88,
          left:       '50%',
          transform:  'translateX(-50%)',
          background: 'var(--pa)',
          color:      '#fff',
          fontSize:   12,
          fontWeight: 700,
          padding:    '8px 22px',
          borderRadius: 20,
          zIndex:     510,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          opacity:    toast === 'fading' ? 0 : 1,
          transition: 'opacity 0.4s ease',
        }}>
          Saved to Library
        </div>
      )}
    </>
  )
}
