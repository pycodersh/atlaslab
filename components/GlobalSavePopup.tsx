'use client'

import { useEffect, useRef, useState } from 'react'
import { subscribeSavePopup, closeSavePopup, type PopupItem } from '@/lib/words/popupStore'
import { saveWord, savePhrase } from '@/lib/words/storage'

type Toast = 'hidden' | 'visible' | 'fading'

/**
 * Global singleton Word/Phrase save popup.
 * Mount once (in MagazineEngine). Subscribes to popupStore.
 *
 * - Always centered on screen
 * - Backdrop click closes the popup
 * - When item.chunk is present: shows "추천 표현" + [Save Phrase] [Save Word]
 * - Otherwise: shows word + [Save Word] [Cancel]
 * - Toast notification on save
 */
export function GlobalSavePopup() {
  const [item, setItem]       = useState<PopupItem | null>(null)
  const [toast, setToast]     = useState<Toast>('hidden')
  const [toastMsg, setToastMsg] = useState('Saved to Library')
  const toastTimer            = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => subscribeSavePopup(setItem), [])

  function showToast(msg: string) {
    setToastMsg(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast('visible')
    toastTimer.current = setTimeout(() => {
      setToast('fading')
      toastTimer.current = setTimeout(() => setToast('hidden'), 400)
    }, 1600)
  }

  function handleSaveWord() {
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
    window.getSelection()?.removeAllRanges()
    closeSavePopup()
    showToast('단어 저장됨')
  }

  function handleSavePhrase() {
    if (!item?.chunk) return
    savePhrase({
      phrase:           item.chunk.text,
      phraseType:       item.chunk.type,
      sourceType:       item.sourceType,
      sourceId:         item.sourceId,
      storyId:          item.storyId,
      patternId:        item.patternId,
      paragraphId:      item.paragraphId,
      exampleIndex:     item.exampleIndex,
      originalSentence: item.originalSentence,
    })
    window.getSelection()?.removeAllRanges()
    closeSavePopup()
    showToast('표현 저장됨')
  }

  function handleClose() {
    window.getSelection()?.removeAllRanges()
    closeSavePopup()
  }

  const wordDisplay   = item ? (item.word.length > 40 ? item.word.slice(0, 38) + '…' : item.word) : ''
  const phraseDisplay = item?.chunk
    ? (item.chunk.text.length > 40 ? item.chunk.text.slice(0, 38) + '…' : item.chunk.text)
    : ''

  const BTN: React.CSSProperties = {
    flex: 1,
    padding: '9px 14px',
    borderRadius: 10,
    border: 'none',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  }

  return (
    <>
      {/* ── Backdrop ── */}
      {item && (
        <div
          onClick={handleClose}
          style={{ position: 'fixed', inset: 0, zIndex: 490, background: 'transparent' }}
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
            minWidth:  240,
            maxWidth:  'calc(100vw - 48px)',
          }}
        >
          {item.chunk ? (
            /* ── Phrase recommendation mode ── */
            <>
              {/* Tapped word */}
              <p style={{
                fontSize: 13, color: 'var(--pt2)',
                margin: '0 0 10px', textAlign: 'center',
              }}>
                &ldquo;{wordDisplay}&rdquo;
              </p>

              {/* Recommended phrase */}
              <div style={{
                background: 'rgba(255,200,80,0.15)',
                border: '1px solid rgba(255,200,80,0.4)',
                borderRadius: 10,
                padding: '8px 12px',
                marginBottom: 14,
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 10, color: 'var(--pm)', margin: '0 0 3px', letterSpacing: '0.05em', fontWeight: 600 }}>
                  추천 표현
                </p>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)', margin: 0, wordBreak: 'break-word' }}>
                  {phraseDisplay}
                </p>
              </div>

              {/* Buttons: Save Phrase + Save Word */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button type="button" onClick={handleSavePhrase} style={{ ...BTN, background: 'var(--pc)', color: 'var(--pt2)', flex: 1 }}>
                  표현 저장
                </button>
                <button type="button" onClick={handleSaveWord} style={{ ...BTN, background: 'rgba(200,205,215,0.5)', color: 'var(--pt)', flex: 1 }}>
                  단어만
                </button>
              </div>
              <button type="button" onClick={handleClose} style={{ ...BTN, background: 'transparent', color: 'var(--pm)', width: '100%' }}>
                취소
              </button>
            </>
          ) : (
            /* ── Word-only mode ── */
            <>
              <p style={{
                fontSize: 15, fontWeight: 700,
                color: 'var(--pt)',
                margin: '0 0 14px',
                textAlign: 'center',
                wordBreak: 'break-word',
                lineHeight: 1.4,
              }}>
                &ldquo;{wordDisplay}&rdquo;
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={handleSaveWord} style={{ ...BTN, background: 'var(--pc)', color: 'var(--pt2)' }}>
                  단어 저장
                </button>
                <button type="button" onClick={handleClose} style={{ ...BTN, background: 'var(--pc)', color: 'var(--pt2)' }}>
                  취소
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Saved toast ── */}
      {toast !== 'hidden' && (
        <div style={{
          position:   'fixed',
          bottom:     88,
          left:       '50%',
          transform:  'translateX(-50%)',
          background: 'var(--pc)',
          color:      'var(--pt2)',
          fontSize:   12,
          fontWeight: 600,
          padding:    '8px 22px',
          borderRadius: 20,
          zIndex:     510,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          opacity:    toast === 'fading' ? 0 : 1,
          transition: 'opacity 0.4s ease',
          border:     '1px solid var(--pd)',
        }}>
          {toastMsg}
        </div>
      )}
    </>
  )
}
