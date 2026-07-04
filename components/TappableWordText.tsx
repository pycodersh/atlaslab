'use client'

import { isSavedWord } from '@/lib/words/storage'
import { openSavePopup } from '@/lib/words/popupStore'
import type { WordSourceType } from '@/lib/words/storage'

export type WordSaveSource = {
  sourceType:       WordSourceType
  sourceId:         string
  storyId?:         number
  patternId?:       string
  paragraphId?:     string
  exampleIndex?:    number
  originalSentence: string
}

type Props = {
  text:      string
  source:    WordSaveSource
  className?: string
  style?:    React.CSSProperties
}

/**
 * Renders text as tappable words.
 * Tapping a word opens the global singleton save popup (via popupStore).
 * Long-press + drag triggers native text selection; StoryPage detects this
 * via selectionchange for phrase-level saving.
 */
export function TappableWordText({ text, source, className, style }: Props) {
  const tokens = text.split(/(\s+)/)

  function handleWordTap(e: React.MouseEvent, raw: string) {
    e.stopPropagation()
    const clean = raw.replace(/[^a-zA-Z''-]/g, '')
    if (!clean || clean.length < 2) return
    openSavePopup({
      word:             clean,
      originalSentence: source.originalSentence,
      sourceType:       source.sourceType,
      sourceId:         source.sourceId,
      storyId:          source.storyId,
      patternId:        source.patternId,
      paragraphId:      source.paragraphId,
      exampleIndex:     source.exampleIndex,
    })
  }

  return (
    <span className={className} style={style}>
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>

        const clean = token.replace(/[^a-zA-Z''-]/g, '')
        if (!clean || clean.length < 2) return <span key={i}>{token}</span>

        const alreadySaved = isSavedWord(clean)

        return (
          <span
            key={i}
            onClick={(e) => handleWordTap(e, token)}
            style={{
              cursor:       'pointer',
              borderRadius: 3,
              padding:      alreadySaved ? '1px 3px' : '0',
              background:   alreadySaved ? 'var(--pal)' : 'transparent',
              transition:   'background 0.12s',
              userSelect:   'text',
              WebkitUserSelect: 'text',
            }}
          >
            {token}
          </span>
        )
      })}
    </span>
  )
}
