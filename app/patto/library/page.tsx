'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, X,
} from 'lucide-react'

import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { SwipeDeleteRow } from '@/components/SwipeDeleteRow'
import { magazineStories } from '@/data/magazine-stories'
import { getBookmarks, removeBookmark, type BookmarkedPattern } from '@/lib/bookmarks/storage'
import { getSavedWords, getSavedPhrases, removeSavedWord, removeSavedPhrase, type SavedWord, type SavedPhrase } from '@/lib/words/storage'
import { useItemTranslation } from '@/hooks/useItemTranslation'
import { lookupPhraseMeaning } from '@/data/patto-phrase-dictionary'
import { lookupMeaning } from '@/data/patto-dictionary'
import { WritingStudio } from '@/components/WritingStudio'
import { useTrainerSafe } from '@/contexts/TrainerContext'
import type { MagazinePattern } from '@/types/magazine'

// ── Section label (Progress 화면과 동일) ──────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: '0 0 10px 2px', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', color: '#5C6BC0', textTransform: 'uppercase' }}>
      {children}
    </p>
  )
}

// ── Types ──────────────────────────────────────────────────────────────────────

type AccordionOpen = 'words' | 'phrases' | 'patterns' | null

// ── Constants ──────────────────────────────────────────────────────────────────

const RECENT_KEY = 'patto-library-recent-searches'
const MAX_RECENT = 5

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[.,!?;:"\-–—()\[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function readRecentSearches(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') } catch { return [] }
}

function saveRecentSearch(q: string) {
  const prev = readRecentSearches().filter(s => s !== q)
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, MAX_RECENT)))
}

function sourceLabel(item: SavedWord | SavedPhrase): string {
  const parts: string[] = []
  if (item.storyId) parts.push(`Story ${String(item.storyId).padStart(2, '0')}`)
  if (item.patternId) parts.push(`Pattern ${item.patternId}`)
  return parts.join(' · ')
}

// ── Styles ────────────────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'var(--pglass)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  borderRadius: 20,
  border: '1px solid var(--pglass-border)',
  boxShadow: '0 4px 18px rgba(40,50,80,0.07), 0 1px 4px rgba(40,50,80,0.03)',
  overflow: 'hidden',
}

const ROW_BORDER = '1px solid var(--pglass-border)'

function cardBase(isDark: boolean): React.CSSProperties {
  return {
    background: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: 16,
    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.8)',
    boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.20)' : '0 4px 18px rgba(40,40,60,0.06), 0 1px 4px rgba(40,40,60,0.03)',
  }
}

// ── Accordion item rows (on blue background) ──────────────────────────────────

function AccordionWordRow({ w, onRemove }: { w: SavedWord; onRemove: () => void }) {
  const meaning = useItemTranslation('word', w.word, w.translations, w.meaning ?? lookupMeaning(w.word))
  const src = sourceLabel(w)
  return (
    <SwipeDeleteRow onDeleteRequest={onRemove} containerStyle={{ marginBottom: 5 }} contentBg="rgba(92,107,192,0.07)">
      <div style={{
        background: 'rgba(92,107,192,0.07)', borderRadius: 9, padding: '9px 10px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e', margin: '0 0 1px', lineHeight: 1.3 }}>{w.word}</p>
          {src && <p style={{ fontSize: 13, color: '#8890a4', margin: 0 }}>{src}</p>}
        </div>
        {meaning && (
          <span style={{ fontSize: 12, color: '#5C6BC0', fontWeight: 500, textAlign: 'right', flexShrink: 0 }}>
            {meaning}
          </span>
        )}
      </div>
    </SwipeDeleteRow>
  )
}

function AccordionPhraseRow({ ph, onRemove }: { ph: SavedPhrase; onRemove: () => void }) {
  const dictEntry = lookupPhraseMeaning(ph.phrase)
  const legacyMeaning = dictEntry?.meaning ?? (ph.meaningSource === 'dictionary' ? ph.meaning : undefined)
  const meaning = useItemTranslation('phrase', ph.phrase, ph.translations, legacyMeaning)
  const src = sourceLabel(ph)
  return (
    <SwipeDeleteRow onDeleteRequest={onRemove} containerStyle={{ marginBottom: 5 }} contentBg="rgba(149,117,205,0.07)">
      <div style={{
        background: 'rgba(149,117,205,0.07)', borderRadius: 9, padding: '9px 10px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e', margin: '0 0 1px', lineHeight: 1.3 }}>{ph.phrase}</p>
          {src && <p style={{ fontSize: 13, color: '#8890a4', margin: 0 }}>{src}</p>}
        </div>
        {meaning && (
          <span style={{ fontSize: 12, color: '#9575CD', fontWeight: 500, textAlign: 'right', flexShrink: 0 }}>
            {meaning}
          </span>
        )}
      </div>
    </SwipeDeleteRow>
  )
}

function AccordionPatternRow({ bm, onRemove, onPress }: { bm: BookmarkedPattern; onRemove: () => void; onPress: () => void }) {
  const meaning = useItemTranslation('pattern', bm.pattern, bm.translations, bm.meaningKo)
  const storyTitle = magazineStories.find(s => s.id === bm.storyId)?.title
  return (
    <SwipeDeleteRow onDeleteRequest={onRemove} containerStyle={{ marginBottom: 5 }} contentBg="rgba(245,166,35,0.07)">
      <button type="button" onClick={onPress} style={{
        display: 'block', width: '100%', textAlign: 'left', background: 'rgba(245,166,35,0.07)',
        border: 'none', cursor: 'pointer', borderRadius: 9, padding: '9px 10px',
      }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e', margin: '0 0 1px', lineHeight: 1.3 }}>{bm.pattern}</p>
        {meaning && <p style={{ fontSize: 12, color: '#5a5a7a', margin: '0 0 1px', fontWeight: 400 }}>{meaning}</p>}
        {storyTitle && <p style={{ fontSize: 13, color: '#8890a4', margin: 0 }}>
          Story {String(bm.storyId).padStart(2, '0')} · {storyTitle}
        </p>}
      </button>
    </SwipeDeleteRow>
  )
}

// ── Words/Phrases/Patterns Accordion ─────────────────────────────────────────

function WordPhrasePatternsAccordion({
  words, phrases, bookmarks,
  onRemoveWord, onRemovePhrase, onRemoveBookmark,
  onPatternPress,
}: {
  words: SavedWord[]; phrases: SavedPhrase[]; bookmarks: BookmarkedPattern[]
  onRemoveWord: (id: string) => void; onRemovePhrase: (id: string) => void; onRemoveBookmark: (id: string) => void
  onPatternPress: (bm: BookmarkedPattern) => void
}) {
  const [open, setOpen] = useState<AccordionOpen>(null)

  function toggle(tab: AccordionOpen) {
    setOpen(prev => prev === tab ? null : tab)
  }

  // Progress StatChips와 동일한 accent color
  const TABS: { id: Exclude<AccordionOpen, null>; label: string; count: number; accent: string }[] = [
    { id: 'words',    label: 'WORDS',    count: words.length,     accent: '#5C6BC0' },
    { id: 'phrases',  label: 'PHRASES',  count: phrases.length,   accent: '#9575CD' },
    { id: 'patterns', label: 'PATTERNS', count: bookmarks.length, accent: '#F5A623' },
  ]

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 7 }}>
        {TABS.map(tab => {
          const isOpen = open === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => toggle(tab.id)}
              style={{
                flex: 1, borderRadius: 14, padding: '12px 4px',
                background: isOpen ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.60)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: isOpen ? `0.5px solid ${tab.accent}40` : '0.5px solid rgba(255,255,255,0.80)',
                boxShadow: isOpen
                  ? `0 2px 12px ${tab.accent}22`
                  : '0 2px 10px rgba(80,90,160,0.08)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                cursor: 'pointer', transition: 'all 0.18s ease',
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 700, color: tab.accent, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {tab.count}
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.5px', color: tab.accent, opacity: 0.75, textTransform: 'uppercase', textAlign: 'center' }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      {open && (
        <div style={{
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 14,
          marginTop: 6,
          padding: '8px 8px 10px',
          border: '0.5px solid rgba(255,255,255,0.80)',
          boxShadow: '0 2px 12px rgba(80,90,160,0.08)',
        }}>
          {open === 'words' && (
            words.length === 0
              ? <p style={{ fontSize: 12, color: '#8a8aaa', textAlign: 'center', padding: '16px 0', margin: 0 }}>저장된 단어가 없어요.</p>
              : words.map(w => <AccordionWordRow key={w.id} w={w} onRemove={() => onRemoveWord(w.id)} />)
          )}
          {open === 'phrases' && (
            phrases.length === 0
              ? <p style={{ fontSize: 12, color: '#8a8aaa', textAlign: 'center', padding: '16px 0', margin: 0 }}>저장된 구문이 없어요.</p>
              : phrases.map(ph => <AccordionPhraseRow key={ph.id} ph={ph} onRemove={() => onRemovePhrase(ph.id)} />)
          )}
          {open === 'patterns' && (
            bookmarks.length === 0
              ? <p style={{ fontSize: 12, color: '#8a8aaa', textAlign: 'center', padding: '16px 0', margin: 0 }}>저장된 패턴이 없어요.</p>
              : bookmarks.map(bm => (
                  <AccordionPatternRow
                    key={bm.patternId} bm={bm}
                    onRemove={() => onRemoveBookmark(bm.patternId)}
                    onPress={() => onPatternPress(bm)}
                  />
                ))
          )}
        </div>
      )}
    </div>
  )
}

// ── Search result rows ────────────────────────────────────────────────────────

function SearchWordRow({ w, border, onPress }: { w: SavedWord; border: boolean; onPress: () => void }) {
  const src = sourceLabel(w)
  const meaning = useItemTranslation('word', w.word, w.translations, w.meaning ?? lookupMeaning(w.word))
  return (
    <button type="button" onClick={onPress} style={{
      display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
      padding: '13px 18px', borderTop: border ? ROW_BORDER : 'none',
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)', margin: '0 0 2px' }}>{w.word}</p>
      {meaning && <p style={{ fontSize: 11, color: '#8E8E93', margin: '0 0 3px' }}>{meaning}</p>}
      <p style={{ fontSize: 10, color: '#B0B0B8', margin: 0, letterSpacing: '0.04em' }}>
        {src || w.originalSentence.slice(0, 50)}
      </p>
    </button>
  )
}

function SearchPhraseRow({ ph, border, onPress }: { ph: SavedPhrase; border: boolean; onPress: () => void }) {
  const src = sourceLabel(ph)
  return (
    <button type="button" onClick={onPress} style={{
      display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
      padding: '13px 18px', borderTop: border ? ROW_BORDER : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)', margin: 0 }}>{ph.phrase}</p>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#C08040', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {ph.phraseType === 'phrasalVerb' ? 'PHRASAL' : ph.phraseType === 'idiom' ? 'IDIOM' : ph.phraseType.toUpperCase()}
        </span>
      </div>
      <p style={{ fontSize: 10, color: '#B0B0B8', margin: 0, letterSpacing: '0.04em' }}>{src}</p>
    </button>
  )
}

function SearchPatternRow({ storyId, storyTitle, pattern, border, onPress }: {
  storyId: number; storyTitle: string; pattern: MagazinePattern; border: boolean; onPress: () => void
}) {
  const meaning = useItemTranslation('pattern', pattern.pattern, undefined, pattern.meaningKo)
  return (
    <button type="button" onClick={onPress} style={{
      display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none',
      padding: '13px 18px', borderTop: border ? ROW_BORDER : 'none', cursor: 'pointer',
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)', margin: '0 0 2px' }}>{pattern.pattern}</p>
      {meaning && <p style={{ fontSize: 11, color: '#8E8E93', margin: '0 0 3px' }}>{meaning}</p>}
      <p style={{ fontSize: 10, color: '#B0B0B8', margin: 0, letterSpacing: '0.04em' }}>
        Story {String(storyId).padStart(2, '0')} · {storyTitle}
      </p>
    </button>
  )
}

function SearchStoryRow({ story, border, onPress }: { story: { id: number; title: string }; border: boolean; onPress: () => void }) {
  return (
    <button type="button" onClick={onPress} style={{
      display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none',
      padding: '13px 18px', borderTop: border ? ROW_BORDER : 'none', cursor: 'pointer',
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#8E8E93', margin: '0 0 2px', letterSpacing: '0.06em' }}>
        STORY {String(story.id).padStart(2, '0')}
      </p>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)', margin: 0 }}>{story.title}</p>
    </button>
  )
}


// ── Inner page ────────────────────────────────────────────────────────────────

function buildPatternIndex() {
  const out: { storyId: number; storyTitle: string; pattern: MagazinePattern }[] = []
  for (const story of magazineStories) {
    for (const pattern of story.patterns) {
      out.push({ storyId: story.id, storyTitle: story.title, pattern })
    }
  }
  return out
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 9.5, fontWeight: 700, letterSpacing: '0.16em',
  color: '#8E8E93', margin: '0 0 8px 4px', textTransform: 'uppercase' as const,
}

function LibraryPageInner() {
  const router       = useRouter()
  const inputRef     = useRef<HTMLInputElement>(null)
  const trainer      = useTrainerSafe()

  const [bookmarks, setBookmarks] = useState<BookmarkedPattern[]>([])
  const [words, setWords]         = useState<SavedWord[]>([])
  const [phrases, setPhrases]     = useState<SavedPhrase[]>([])
  const [query, setQuery]         = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [focused, setFocused]     = useState(false)

  useEffect(() => { trainer?.setPage('library') }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setBookmarks(getBookmarks())
    setWords(getSavedWords())
    setPhrases(getSavedPhrases())
    setRecentSearches(readRecentSearches())
  }, [])

  const patternIndex = useMemo(() => buildPatternIndex(), [])

  const isSearching = query.trim().length > 0
  const nq = normalize(query)
  const showRecent = focused && !isSearching && recentSearches.length > 0

  const searchResults = useMemo(() => {
    if (!nq) return { words: [], phrases: [], patterns: [], stories: [] }
    const match = (s: string) => normalize(s).includes(nq)
    return {
      words: words.filter(w => match(w.word) || match(w.meaning ?? '') || match(w.originalSentence)),
      phrases: phrases.filter(ph => match(ph.phrase) || match(ph.originalSentence)),
      patterns: patternIndex.filter(({ pattern }) =>
        match(pattern.pattern) || match(pattern.meaningKo) || match(pattern.explanation ?? '') || match(pattern.storySentence) || match(pattern.variationSentence)
      ).slice(0, 20),
      stories: magazineStories.filter(s =>
        match(s.title) || normalize(`story ${s.id}`).includes(nq) || normalize(`s${String(s.id).padStart(2, '0')}`).includes(nq)
      ).slice(0, 10),
    }
  }, [patternIndex, words, phrases, nq])

  const hasResults = searchResults.words.length > 0 || searchResults.phrases.length > 0
    || searchResults.patterns.length > 0 || searchResults.stories.length > 0

  function submitSearch(q: string) {
    if (!q.trim()) return
    saveRecentSearch(q.trim())
    setRecentSearches(readRecentSearches())
  }

  function handleRemoveBookmark(patternId: string) {
    removeBookmark(patternId)
    setBookmarks(prev => prev.filter(b => b.patternId !== patternId))
    trainer?.showMessage('Removed.', 1800)
  }

  function handleRemoveWord(id: string) {
    removeSavedWord(id)
    setWords(prev => prev.filter(w => w.id !== id))
    trainer?.showMessage('Removed.', 1800)
  }

  function handleRemovePhrase(id: string) {
    removeSavedPhrase(id)
    setPhrases(prev => prev.filter(p => p.id !== id))
    trainer?.showMessage('Removed.', 1800)
  }

  const colPad: React.CSSProperties = {
    paddingTop: 7, paddingLeft: 20, paddingRight: 20,
    paddingBottom: TAB_BAR_HEIGHT + 32, boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100dvh', overflowY: 'auto' }}>
      <TopNav />
      <div className="desktop-max">
        <div style={colPad}>

          {/* Search & Save section label */}
          {!isSearching && <SectionLabel>Search &amp; Save</SectionLabel>}

          {/* Search bar */}
          <div style={{ marginBottom: isSearching || showRecent ? 0 : 16 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--pglass)', backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderRadius: 16, padding: '14px 14px 14px 18px',
              border: focused ? '1px solid var(--pacb)' : '1px solid var(--pglass-border)',
              boxShadow: focused ? '0 4px 20px rgba(109,141,255,0.10)' : '0 4px 16px rgba(40,50,80,0.07)',
              transition: 'border 0.2s, box-shadow 0.2s',
            }}>
              <Search style={{ width: 16, height: 16, color: '#8E8E93', flexShrink: 0 }} strokeWidth={2} />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                onKeyDown={e => { if (e.key === 'Enter') submitSearch(query) }}
                placeholder="검색..."
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--pt)', fontWeight: 400, caretColor: 'var(--pa)' }}
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus() }}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
                  <X style={{ width: 14, height: 14, color: '#8E8E93' }} strokeWidth={2} />
                </button>
              )}
            </div>

            {showRecent && (
              <div style={{ padding: '12px 4px 16px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.10em', color: '#B0B0B8', textTransform: 'uppercase', alignSelf: 'center', marginRight: 2 }}>Recent</span>
                {recentSearches.map(s => (
                  <button key={s} type="button"
                    onClick={() => { setQuery(s); submitSearch(s); inputRef.current?.focus() }}
                    style={{ fontSize: 12, fontWeight: 500, color: 'var(--pa)', background: 'var(--pal)', border: '1px solid var(--pacb)', borderRadius: 999, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search results */}
          {isSearching && (
            <div style={{ marginTop: 12, marginBottom: 24 }}>
              {!hasResults ? (
                <div style={{ ...glassCard, padding: '30px 22px', textAlign: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)', margin: '0 0 8px' }}>No matching results found.</p>
                  <p style={{ fontSize: 12, color: '#8E8E93', margin: 0, lineHeight: 1.7 }}>Try a different keyword</p>
                </div>
              ) : (
                <>
                  {searchResults.words.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <p style={SECTION_LABEL}>Words · {searchResults.words.length}</p>
                      <div style={glassCard}>
                        {searchResults.words.map((w, i) => <SearchWordRow key={w.id} w={w} border={i > 0} onPress={() => { if (w.storyId) router.push(`/patto/stories/${w.storyId}`) }} />)}
                      </div>
                    </div>
                  )}
                  {searchResults.phrases.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <p style={SECTION_LABEL}>Phrases · {searchResults.phrases.length}</p>
                      <div style={glassCard}>
                        {searchResults.phrases.map((ph, i) => <SearchPhraseRow key={ph.id} ph={ph} border={i > 0} onPress={() => { if (ph.storyId && ph.patternId) router.push(`/patto/stories/${ph.storyId}?v=p`); else if (ph.storyId) router.push(`/patto/stories/${ph.storyId}`) }} />)}
                      </div>
                    </div>
                  )}
                  {searchResults.patterns.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <p style={SECTION_LABEL}>Patterns · {searchResults.patterns.length}</p>
                      <div style={glassCard}>
                        {searchResults.patterns.map((r, i) => <SearchPatternRow key={r.pattern.id} storyId={r.storyId} storyTitle={r.storyTitle} pattern={r.pattern} border={i > 0} onPress={() => router.push(`/patto/stories/${r.storyId}?v=p`)} />)}
                      </div>
                    </div>
                  )}
                  {searchResults.stories.length > 0 && (
                    <div>
                      <p style={SECTION_LABEL}>Stories · {searchResults.stories.length}</p>
                      <div style={glassCard}>
                        {searchResults.stories.map((s, i) => <SearchStoryRow key={s.id} story={s} border={i > 0} onPress={() => router.push(`/patto/stories/${s.id}`)} />)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Words / Phrases / Patterns accordion (hidden while searching) */}
          {!isSearching && (
            <WordPhrasePatternsAccordion
              words={words}
              phrases={phrases}
              bookmarks={bookmarks}
              onRemoveWord={handleRemoveWord}
              onRemovePhrase={handleRemovePhrase}
              onRemoveBookmark={handleRemoveBookmark}
              onPatternPress={bm => router.push(`/patto/stories/${bm.storyId}?v=p`)}
            />
          )}

          {/* Writing Studio */}
          {!isSearching && (
            <>
              <div style={{ marginTop: 24 }} />
              <SectionLabel>Writing Studio</SectionLabel>
              <WritingStudio />
            </>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function LibraryPage() {
  return (
    <Suspense fallback={null}>
      <LibraryPageInner />
    </Suspense>
  )
}
