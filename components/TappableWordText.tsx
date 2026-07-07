'use client'

import { isSavedWord, isSavedPhrase } from '@/lib/words/storage'
import { openSavePopup } from '@/lib/words/popupStore'
import type { WordSourceType } from '@/lib/words/storage'
import type { SaveCandidate } from '@/data/pattern-examples-full'

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
  text:             string
  source:           WordSaveSource
  saveCandidates?:  SaveCandidate[]
  className?:       string
  style?:           React.CSSProperties
  highlightPhrases?: string[]
}

/**
 * Renders text as tappable words.
 * Tapping a word opens the global singleton save popup (via popupStore).
 * If saveCandidates is provided, tapping a word that belongs to a chunk
 * also surfaces a "Save Phrase" option.
 */
export function TappableWordText({ text, source, saveCandidates, className, style, highlightPhrases }: Props) {
  const tokens = text.split(/(\s+)/)

  // Precompute character offsets for each token
  let charOffset = 0
  const tokenData = tokens.map(token => {
    const start = charOffset
    charOffset += token.length
    return { token, start, end: charOffset }
  })

  // Build char ranges for pattern phrase highlighting
  const hlRanges: Array<[number, number]> = []
  if (highlightPhrases?.length) {
    const lower = text.toLowerCase()
    for (const phrase of highlightPhrases) {
      if (!phrase) continue
      const idx = lower.indexOf(phrase.toLowerCase())
      if (idx !== -1) hlRanges.push([idx, idx + phrase.length])
    }
  }

  function findChunk(wordStart: number, wordEnd: number): SaveCandidate | undefined {
    if (!saveCandidates?.length) return undefined
    // Priority: phrasalVerb > idiom > fixedExpression > collocation > chunk > prepPhrase
    const PRIORITY: Record<string, number> = {
      phrasalVerb: 6, idiom: 5, fixedExpression: 4, collocation: 3, chunk: 2, prepPhrase: 1,
    }
    const overlapping = saveCandidates.filter(c => c.start < wordEnd && c.end > wordStart)
    if (!overlapping.length) return undefined
    return overlapping.sort((a, b) => (PRIORITY[b.type] ?? 0) - (PRIORITY[a.type] ?? 0))[0]
  }

  function handleWordTap(e: React.MouseEvent, token: string, wordStart: number, wordEnd: number) {
    e.stopPropagation()
    const clean = token.replace(/[^a-zA-Z''-]/g, '')
    if (!clean || clean.length < 2) return
    const chunk = findChunk(wordStart, wordEnd)
    openSavePopup({
      word:             clean,
      originalSentence: source.originalSentence,
      sourceType:       source.sourceType,
      sourceId:         source.sourceId,
      storyId:          source.storyId,
      patternId:        source.patternId,
      paragraphId:      source.paragraphId,
      exampleIndex:     source.exampleIndex,
      chunk:            chunk ? { text: chunk.text, type: chunk.type } : undefined,
    })
  }

  return (
    <span className={className} style={style}>
      {tokenData.map(({ token, start, end }, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>

        const clean = token.replace(/[^a-zA-Z''-]/g, '')
        if (!clean || clean.length < 2) return <span key={i}>{token}</span>

        const alreadySaved = isSavedWord(clean)
        const chunk = findChunk(start, end)
        const phraseHighlight = chunk ? isSavedPhrase(chunk.text) : false
        const isPatternWord = hlRanges.some(([s, e]) => start < e && end > s)

        return (
          <span
            key={i}
            onClick={(e) => handleWordTap(e, token, start, end)}
            style={{
              cursor:       'pointer',
              borderRadius: 3,
              padding:      (alreadySaved || phraseHighlight) ? '1px 3px' : '0',
              background:   phraseHighlight
                ? 'var(--pal-phrase, rgba(255,200,80,0.25))'
                : alreadySaved
                  ? 'var(--pal)'
                  : 'transparent',
              color:        isPatternWord ? 'var(--pattern-hl)' : undefined,
              fontWeight:   isPatternWord ? 600 : undefined,
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
