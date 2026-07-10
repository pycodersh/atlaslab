'use client'

import { useEffect, useRef, useState } from 'react'
import { subscribeSavePopup, closeSavePopup, type PopupItem } from '@/lib/words/popupStore'
import { saveWord, savePhrase } from '@/lib/words/storage'
import { useT } from '@/hooks/useT'

type Toast = 'hidden' | 'visible' | 'fading'

/**
 * Global singleton Word/Phrase save popup.
 * Mount once (in MagazineEngine). Subscribes to popupStore.
 *
 * - Always centered on screen
 * - Backdrop click closes the popup
 * - When item.chunk is present: shows "추천 표현" + [Save Phrase] [Word Only] + text Cancel
 * - Otherwise: shows word + [Save Word] + text Cancel
 * - Toast notification on save
 */
export function GlobalSavePopup() {
  const [item, setItem]         = useState<PopupItem | null>(null)
  const [toast, setToast]       = useState<Toast>('hidden')
  const [toastMsg, setToastMsg] = useState('')
  const toastTimer              = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t = useT()

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
    showToast(t('toast_word_saved'))
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
      meaning:          item.koreanSentence,
    })
    window.getSelection()?.removeAllRanges()
    closeSavePopup()
    showToast(t('toast_phrase_saved'))
  }

  function handleClose() {
    window.getSelection()?.removeAllRanges()
    closeSavePopup()
  }

  const wordDisplay   = item ? (item.word.length > 40 ? item.word.slice(0, 38) + '…' : item.word) : ''
  const phraseDisplay = item?.chunk
    ? (item.chunk.text.length > 40 ? item.chunk.text.slice(0, 38) + '…' : item.chunk.text)
    : ''

  // Button style constants
  const PRIMARY_BTN: React.CSSProperties = {
    flex: 1,
    padding: '11px 14px',
    borderRadius: 12,
    border: 'none',
    background: '#2C2C32',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    color: '#FFFFFF',
    fontFamily: 'inherit',
  }

  const SECONDARY_BTN: React.CSSProperties = {
    flex: 1,
    padding: '11px 14px',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.10)',
    background: 'rgba(0,0,0,0.03)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    color: 'var(--pm)',
    fontFamily: 'inherit',
  }

  const CANCEL_BTN: React.CSSProperties = {
    width: '100%',
    padding: '8px 0 2px',
    border: 'none',
    background: 'transparent',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    color: 'var(--pm2)',
    fontFamily: 'inherit',
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
            background: 'var(--pglass)',
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            border:    '1px solid var(--pglass-border)',
            borderRadius: 20,
            padding:   '20px 20px 16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            minWidth:  260,
            maxWidth:  'calc(100vw - 48px)',
          }}
        >
          {item.chunk ? (
            /* ── Phrase recommendation mode ── */
            <>
              {/* Tapped word — small muted label */}
              <p style={{
                fontSize: 12, color: 'var(--pm2)',
                margin: '0 0 12px', textAlign: 'center',
              }}>
                &ldquo;{wordDisplay}&rdquo;
              </p>

              {/* Recommended phrase card — warm neutral tint */}
              <div style={{
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 14,
                padding: '12px 16px',
                marginBottom: 16,
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 10, color: 'var(--pm)', margin: '0 0 6px', letterSpacing: '0.10em', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('save_recommended')}
                </p>
                <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--pt)', margin: 0, wordBreak: 'break-word', lineHeight: 1.35 }}>
                  {phraseDisplay}
                </p>
              </div>

              {/* Primary + Secondary */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <button type="button" onClick={handleSavePhrase} style={PRIMARY_BTN}>
                  {t('save_phrase_btn')}
                </button>
                <button type="button" onClick={handleSaveWord} style={SECONDARY_BTN}>
                  {t('save_word_only')}
                </button>
              </div>

              {/* Text Cancel */}
              <button type="button" onClick={handleClose} style={CANCEL_BTN}>
                {t('picker_cancel')}
              </button>
            </>
          ) : (
            /* ── Word-only mode ── */
            <>
              <p style={{
                fontSize: 16, fontWeight: 700,
                color: 'var(--pt)',
                margin: '0 0 16px',
                textAlign: 'center',
                wordBreak: 'break-word',
                lineHeight: 1.4,
              }}>
                &ldquo;{wordDisplay}&rdquo;
              </p>

              {/* Primary */}
              <button type="button" onClick={handleSaveWord} style={{ ...PRIMARY_BTN, flex: 'none', width: '100%', marginBottom: 4 }}>
                {t('save_word_btn')}
              </button>

              {/* Text Cancel */}
              <button type="button" onClick={handleClose} style={CANCEL_BTN}>
                {t('picker_cancel')}
              </button>
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
