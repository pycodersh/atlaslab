'use client'

import { useRef, useState } from 'react'
import { saveWord, isSavedWord, type WordSourceType } from '@/lib/words/storage'

export type WordSaveSource = {
  sourceType:     WordSourceType
  sourceId:       string
  storyId?:       number
  patternId?:     string
  paragraphId?:   string
  exampleIndex?:  number
  originalSentence: string
}

type Toast = 'hidden' | 'visible' | 'fading'

type Props = {
  text:      string
  source:    WordSaveSource
  className?: string
  style?:    React.CSSProperties
}

/**
 * Renders text as tappable words. Tapping a word shows a confirm popup;
 * confirming saves it to the Saved Words library.
 *
 * Used in:
 *  - Story paragraph popup (sourceType = 'story')
 *  - Pattern example sentences (sourceType = 'example')
 */
export function TappableWordText({ text, source, className, style }: Props) {
  const [activeWord, setActiveWord] = useState<string | null>(null)
  const [toast, setToast]           = useState<Toast>('hidden')
  const toastTimer                  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Split into tokens, preserving whitespace as separate tokens
  const tokens = text.split(/(\s+)/)

  function handleWordTap(e: React.MouseEvent, raw: string) {
    e.stopPropagation()
    const clean = raw.replace(/[^a-zA-Z'-]/g, '')
    if (!clean || clean.length < 2) return
    setActiveWord(prev => (prev === clean ? null : clean))
  }

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation()
    if (!activeWord) return
    saveWord({
      word:             activeWord,
      sourceType:       source.sourceType,
      sourceId:         source.sourceId,
      storyId:          source.storyId,
      patternId:        source.patternId,
      paragraphId:      source.paragraphId,
      exampleIndex:     source.exampleIndex,
      originalSentence: source.originalSentence,
    })
    setActiveWord(null)

    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast('visible')
    toastTimer.current = setTimeout(() => {
      setToast('fading')
      toastTimer.current = setTimeout(() => setToast('hidden'), 400)
    }, 1600)
  }

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation()
    setActiveWord(null)
  }

  return (
    <>
      <span className={className} style={style}>
        {tokens.map((token, i) => {
          if (/^\s+$/.test(token)) return <span key={i}>{token}</span>

          const clean = token.replace(/[^a-zA-Z'-]/g, '')
          if (!clean || clean.length < 2) return <span key={i}>{token}</span>

          const isActive  = activeWord === clean
          const alreadySaved = !isActive && isSavedWord(clean)

          return (
            <span
              key={i}
              onClick={(e) => handleWordTap(e, token)}
              style={{
                cursor:     'pointer',
                borderRadius: 3,
                padding:    isActive ? '1px 3px' : alreadySaved ? '1px 3px' : '0',
                background: isActive
                  ? 'var(--pa)'
                  : alreadySaved
                    ? 'var(--pal)'
                    : 'transparent',
                color: isActive ? '#fff' : 'inherit',
                transition: 'background 0.12s',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
            >
              {token}
            </span>
          )
        })}
      </span>

      {/* ── Confirm popup (fixed, bottom-center) ────────────────────── */}
      {activeWord && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position:  'fixed',
            bottom:    108,
            left:      '50%',
            transform: 'translateX(-50%)',
            zIndex:    400,
            background: 'var(--pb)',
            border:    '1px solid var(--pd)',
            borderRadius: 14,
            padding:   '11px 16px',
            boxShadow: '0 6px 28px rgba(0,0,0,0.22)',
            display:   'flex',
            alignItems: 'center',
            gap:       10,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--pt)' }}>
            Save &ldquo;{activeWord}&rdquo;?
          </span>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '5px 16px', borderRadius: 8,
              background: 'var(--pa)', color: '#fff',
              border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            style={{
              padding: '5px 10px', borderRadius: 8,
              background: 'var(--pc)', color: 'var(--pt2)',
              border: 'none', fontSize: 12, cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Saved toast ─────────────────────────────────────────────── */}
      {toast !== 'hidden' && (
        <div
          style={{
            position:   'fixed',
            bottom:     90,
            left:       '50%',
            transform:  'translateX(-50%)',
            background: 'var(--pa)',
            color:      '#fff',
            fontSize:   12,
            fontWeight: 700,
            padding:    '8px 22px',
            borderRadius: 20,
            zIndex:     400,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            opacity:    toast === 'fading' ? 0 : 1,
            transition: 'opacity 0.4s ease',
          }}
        >
          Saved to Library
        </div>
      )}
    </>
  )
}
