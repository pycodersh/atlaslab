'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, X, BookOpen, ChevronRight, ChevronDown,
  BookMarked, Layers,
} from 'lucide-react'

import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { SwipeDeleteRow } from '@/components/SwipeDeleteRow'
import { magazineStories } from '@/data/magazine-stories'
import { getBookmarks, removeBookmark, type BookmarkedPattern } from '@/lib/bookmarks/storage'
import { getSavedWords, getSavedPhrases, removeSavedWord, removeSavedPhrase, type SavedWord, type SavedPhrase } from '@/lib/words/storage'
import { getTotalRepeatCount } from '@/lib/srs/storage'
import { useT } from '@/hooks/useT'
import { useItemTranslation } from '@/hooks/useItemTranslation'
import { lookupPhraseMeaning } from '@/data/patto-phrase-dictionary'
import { lookupMeaning } from '@/data/patto-dictionary'
import type { MagazinePattern } from '@/types/magazine'

// ── Constants ─────────────────────────────────────────────────────────────────

const RECENT_KEY = 'patto-library-recent-searches'
const MAX_RECENT  = 5
const PREVIEW_WORDS    = 5
const PREVIEW_PHRASES  = 5
const PREVIEW_PATTERNS = 3

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
  const next  = [q, ...prev].slice(0, MAX_RECENT)
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
}

function buildPatternIndex() {
  const out: { storyId: number; storyTitle: string; pattern: MagazinePattern }[] = []
  for (const story of magazineStories) {
    for (const pattern of story.patterns) {
      out.push({ storyId: story.id, storyTitle: story.title, pattern })
    }
  }
  return out
}

function sourceLabel(item: SavedWord | SavedPhrase): string {
  const parts: string[] = []
  if (item.storyId) parts.push(`Story ${String(item.storyId).padStart(2, '0')}`)
  if (item.patternId) parts.push(`Pattern ${item.patternId}`)
  if ((item as SavedWord).exampleIndex != null) parts.push(`Ex ${(item as SavedWord).exampleIndex! + 1}`)
  return parts.join(' · ')
}

function formatPhraseType(type: string): string {
  if (type === 'phrasalVerb') return 'Phrasal Verb'
  if (type === 'idiom') return 'Idiom'
  if (type === 'collocation') return 'Collocation'
  return type.charAt(0).toUpperCase() + type.slice(1)
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

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 9.5, fontWeight: 700, letterSpacing: '0.16em',
  color: '#8E8E93', margin: '0 0 8px 4px', textTransform: 'uppercase' as const,
}

const ROW_BORDER = '1px solid var(--pglass-border)'

// ── Summary cards ─────────────────────────────────────────────────────────────

function SummaryCard({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: number; accent: string
}) {
  return (
    <div style={{
      ...glassCard,
      flex: 1, minWidth: 0,
      padding: '14px 12px 12px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }}>
      {icon}
      <span style={{ fontSize: 'clamp(1.1rem, 4.5vw, 1.35rem)', fontWeight: 800, color: 'var(--pt)', lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', color: '#8E8E93', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.3 }}>
        {label}
      </span>
    </div>
  )
}

// ── Dict word list (flat — dictionary style) ──────────────────────────────────

function WordListRow({ w, first, onRemove }: { w: SavedWord; first: boolean; onRemove: () => void }) {
  const meaning = useItemTranslation('word', w.word, w.translations, w.meaning ?? lookupMeaning(w.word))
  return (
    <SwipeDeleteRow
      onDeleteRequest={onRemove}
      containerStyle={{ borderTop: first ? 'none' : ROW_BORDER }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px 12px 18px' }}>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: 'var(--pt)' }}>{w.word}</span>
        <span style={{ fontSize: 12, color: meaning ? 'var(--pm)' : 'var(--pd)', fontWeight: 400, textAlign: 'right', flexShrink: 0 }}>
          {meaning ?? '—'}
        </span>
      </div>
    </SwipeDeleteRow>
  )
}

function DictWordList({ words, onRemove }: { words: SavedWord[]; onRemove: (id: string) => void }) {
  return (
    <div style={glassCard}>
      {words.map((w, i) => (
        <WordListRow key={w.id} w={w} first={i === 0} onRemove={() => onRemove(w.id)} />
      ))}
    </div>
  )
}

// ── Dict phrase list (flat — same style as word list) ────────────────────────

function PhraseListRow({ ph, first, onRemove }: { ph: SavedPhrase; first: boolean; onRemove: () => void }) {
  const dictEntry = lookupPhraseMeaning(ph.phrase)
  const legacyMeaning = dictEntry?.meaning ?? (ph.meaningSource === 'dictionary' ? ph.meaning : undefined)
  const meaning = useItemTranslation('phrase', ph.phrase, ph.translations, legacyMeaning)
  return (
    <SwipeDeleteRow
      onDeleteRequest={onRemove}
      containerStyle={{ borderTop: first ? 'none' : ROW_BORDER }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px 12px 18px' }}>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: 'var(--pt)' }}>{ph.phrase}</span>
        {meaning && (
          <span style={{ fontSize: 12, color: 'var(--pm)', fontWeight: 400, textAlign: 'right', flexShrink: 0 }}>{meaning}</span>
        )}
      </div>
    </SwipeDeleteRow>
  )
}

function DictPhraseList({ phrases, onRemove }: {
  phrases: SavedPhrase[]
  onRemove: (id: string) => void
}) {
  return (
    <div style={glassCard}>
      {phrases.map((ph, i) => (
        <PhraseListRow key={ph.id} ph={ph} first={i === 0} onRemove={() => onRemove(ph.id)} />
      ))}
    </div>
  )
}

// ── Pattern Accordion (story-grouped card view) ───────────────────────────────

function BookmarkedPatternRow({ bm, first, onPress, onRemove }: {
  bm: BookmarkedPattern; first: boolean
  onPress: () => void; onRemove: () => void
}) {
  const meaning = useItemTranslation('pattern', bm.pattern, bm.translations, bm.meaningKo)
  return (
    <SwipeDeleteRow
      onDeleteRequest={onRemove}
      containerStyle={{ borderTop: first ? 'none' : ROW_BORDER }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          type="button"
          onClick={onPress}
          style={{
            flex: 1, textAlign: 'left',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '11px 8px 11px 16px',
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)', margin: '0 0 2px', lineHeight: 1.35 }}>{bm.pattern}</p>
          {meaning && (
            <p style={{ fontSize: 11, color: '#8E8E93', margin: 0, fontWeight: 400 }}>{meaning}</p>
          )}
        </button>
      </div>
    </SwipeDeleteRow>
  )
}

function PatternAccordion({
  storyId, storyTitle, patterns, onPress, onRemove,
}: {
  storyId: number; storyTitle: string; patterns: BookmarkedPattern[]
  onPress: (bm: BookmarkedPattern) => void; onRemove: (patternId: string) => void
}) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ ...glassCard, overflow: 'hidden', marginBottom: 8 }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: open ? ROW_BORDER : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 11, fontWeight: 800, color: '#fff',
            background: '#2C2C32',
            borderRadius: 7, padding: '2px 8px', letterSpacing: '0.04em',
          }}>
            S{String(storyId).padStart(2, '0')}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)' }}>{storyTitle}</span>
          <span style={{ fontSize: 10, color: '#B0B0B8', fontWeight: 500 }}>{patterns.length}</span>
        </div>
        <ChevronDown
          style={{ width: 14, height: 14, color: '#B0B0B8', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div>
          {patterns.map((bm, i) => (
            <BookmarkedPatternRow
              key={bm.patternId}
              bm={bm}
              first={i === 0}
              onPress={() => onPress(bm)}
              onRemove={() => onRemove(bm.patternId)}
            />
          ))}
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
      display: 'block', width: '100%', textAlign: 'left',
      background: 'none', border: 'none', cursor: 'pointer',
      padding: '13px 18px',
      borderTop: border ? ROW_BORDER : 'none',
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
      display: 'block', width: '100%', textAlign: 'left',
      background: 'none', border: 'none', cursor: 'pointer',
      padding: '13px 18px',
      borderTop: border ? ROW_BORDER : 'none',
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
      display: 'block', width: '100%', textAlign: 'left',
      background: 'none', border: 'none',
      padding: '13px 18px',
      borderTop: border ? ROW_BORDER : 'none',
      cursor: 'pointer',
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)', margin: '0 0 2px' }}>{pattern.pattern}</p>
      {meaning && <p style={{ fontSize: 11, color: '#8E8E93', margin: '0 0 3px' }}>{meaning}</p>}
      <p style={{ fontSize: 10, color: '#B0B0B8', margin: 0, letterSpacing: '0.04em' }}>
        Story {String(storyId).padStart(2, '0')} · {storyTitle}
      </p>
    </button>
  )
}

function SearchStoryRow({ story, border, onPress }: {
  story: { id: number; title: string }; border: boolean; onPress: () => void
}) {
  return (
    <button type="button" onClick={onPress} style={{
      display: 'block', width: '100%', textAlign: 'left',
      background: 'none', border: 'none',
      padding: '13px 18px',
      borderTop: border ? ROW_BORDER : 'none',
      cursor: 'pointer',
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#8E8E93', margin: '0 0 2px', letterSpacing: '0.06em' }}>
        STORY {String(story.id).padStart(2, '0')}
      </p>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)', margin: 0 }}>{story.title}</p>
    </button>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ icon, title, body }: { icon: React.ReactNode; iconColor: string; title: string; body: string }) {
  return (
    <div style={{ ...glassCard, padding: '28px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        {icon}
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)', margin: 0, letterSpacing: '-0.01em' }}>{title}</p>
      </div>
      <p style={{ fontSize: 12, color: '#8E8E93', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{body}</p>
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────

function SecLabel({ label, count, unit, onViewAll }: { label: string; count?: number; unit?: string; onViewAll?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#6E6E73', textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {count != null && unit != null && (
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--pm)' }}>
            {count} {unit}
          </span>
        )}
        {onViewAll && (
          <button type="button" onClick={onViewAll} style={{
            display: 'flex', alignItems: 'center', gap: 2,
            fontSize: 11, fontWeight: 600, color: '#8E8E93',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            See all <ChevronRight style={{ width: 10, height: 10 }} strokeWidth={2.2} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const router   = useRouter()
  const t        = useT()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery]               = useState('')
  const [bookmarks, setBookmarks]       = useState<BookmarkedPattern[]>([])
  const [words, setWords]               = useState<SavedWord[]>([])
  const [phrases, setPhrases]           = useState<SavedPhrase[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [focused, setFocused]           = useState(false)
  const [showAllWords, setShowAllWords]       = useState(false)
  const [showAllPhrases, setShowAllPhrases]   = useState(false)
  const [showAllPatterns, setShowAllPatterns] = useState(false)

  useEffect(() => {
    setBookmarks(getBookmarks())
    setWords(getSavedWords())
    setPhrases(getSavedPhrases())
    getTotalRepeatCount()
    setRecentSearches(readRecentSearches())
  }, [])

  const patternIndex = useMemo(() => buildPatternIndex(), [])

  // ── Group bookmarks by storyId (Patterns keep accordion view) ────────────
  const bookmarksByStory = useMemo(() => {
    const map = new Map<number, BookmarkedPattern[]>()
    for (const bm of bookmarks) {
      if (!map.has(bm.storyId)) map.set(bm.storyId, [])
      map.get(bm.storyId)!.push(bm)
    }
    return [...map.entries()].sort(([a], [b]) => a - b)
  }, [bookmarks])

  // ── Search ────────────────────────────────────────────────────────────────
  const isSearching = query.trim().length > 0
  const nq = normalize(query)

  const searchResults = useMemo(() => {
    if (!nq) return { words: [], phrases: [], patterns: [], stories: [] }

    const match = (s: string) => normalize(s).includes(nq)

    const matchedWords = words.filter(w => match(w.word) || match(w.meaning ?? '') || match(w.originalSentence))

    const matchedPhrases = phrases.filter(ph => match(ph.phrase) || match(ph.originalSentence))

    const matchedPatterns = patternIndex.filter(({ pattern }) =>
      match(pattern.pattern) ||
      match(pattern.meaningKo) ||
      match(pattern.explanation ?? '') ||
      match(pattern.storySentence) ||
      match(pattern.variationSentence)
    ).slice(0, 20)

    const matchedStories = magazineStories.filter(s =>
      match(s.title) ||
      normalize(`story ${s.id}`).includes(nq) ||
      normalize(`s${String(s.id).padStart(2, '0')}`).includes(nq)
    ).slice(0, 10)

    return { words: matchedWords, phrases: matchedPhrases, patterns: matchedPatterns, stories: matchedStories }
  }, [patternIndex, words, phrases, nq])

  function submitSearch(q: string) {
    if (!q.trim()) return
    saveRecentSearch(q.trim())
    setRecentSearches(readRecentSearches())
  }

  function handleRemoveBookmark(patternId: string) {
    removeBookmark(patternId)
    setBookmarks(prev => prev.filter(b => b.patternId !== patternId))
  }

  function handleRemoveWord(id: string) {
    removeSavedWord(id)
    setWords(prev => prev.filter(w => w.id !== id))
  }

  function handleRemovePhrase(id: string) {
    removeSavedPhrase(id)
    setPhrases(prev => prev.filter(p => p.id !== id))
  }

  function goToWord(w: SavedWord) {
    if (w.storyId) router.push(`/stories/${w.storyId}`)
  }

  function goToPhrase(ph: SavedPhrase) {
    if (ph.storyId && ph.patternId) router.push(`/stories/${ph.storyId}?v=p`)
    else if (ph.storyId) router.push(`/stories/${ph.storyId}`)
  }

  const showRecent = focused && !isSearching && recentSearches.length > 0
  const hasResults = searchResults.words.length > 0 || searchResults.phrases.length > 0
    || searchResults.patterns.length > 0 || searchResults.stories.length > 0

  const savedItemsPanel = (
    <>
      {/* Saved Words */}
      <section style={{ marginBottom: 28 }}>
        <SecLabel label="Saved Words" count={words.length} unit="Words" />
        {words.length === 0 ? (
          <EmptyState
            icon={<BookOpen style={{ width: 24, height: 24, color: '#3A7A4A' }} strokeWidth={1.6} />}
            iconColor="#3A7A4A"
            title="No saved words yet."
            body={t('sec_saved_words')}
          />
        ) : (
          <>
            <DictWordList
              words={showAllWords ? words : words.slice(0, PREVIEW_WORDS)}
              onRemove={handleRemoveWord}
            />
            {words.length > PREVIEW_WORDS && (
              <button
                type="button"
                onClick={() => setShowAllWords(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  marginTop: 10, padding: 0,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, color: '#8E8E93', fontFamily: 'inherit',
                }}
              >
                {showAllWords ? 'Show less' : `Show all ${words.length} Words`}
                {!showAllWords && <ChevronRight style={{ width: 11, height: 11 }} strokeWidth={2.2} />}
              </button>
            )}
          </>
        )}
      </section>

      {/* Saved Phrases */}
      <section style={{ marginBottom: 28 }}>
        <SecLabel label="Saved Phrases" count={phrases.length} unit="Phrases" />
        {phrases.length === 0 ? (
          <EmptyState
            icon={<Layers style={{ width: 24, height: 24, color: '#C08040' }} strokeWidth={1.6} />}
            iconColor="#C08040"
            title="No saved phrases yet."
            body={t('sec_saved_words')}
          />
        ) : (
          <>
            <DictPhraseList
              phrases={showAllPhrases ? phrases : phrases.slice(0, PREVIEW_PHRASES)}
              onRemove={handleRemovePhrase}
            />
            {phrases.length > PREVIEW_PHRASES && (
              <button
                type="button"
                onClick={() => setShowAllPhrases(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  marginTop: 10, padding: 0,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, color: '#8E8E93', fontFamily: 'inherit',
                }}
              >
                {showAllPhrases ? 'Show less' : `Show all ${phrases.length} Phrases`}
                {!showAllPhrases && <ChevronRight style={{ width: 11, height: 11 }} strokeWidth={2.2} />}
              </button>
            )}
          </>
        )}
      </section>

      {/* Saved Patterns */}
      <section style={{ marginBottom: 28 }}>
        <SecLabel label="Saved Patterns" count={bookmarks.length} unit="Patterns" />
        {bookmarks.length === 0 ? (
          <EmptyState
            icon={<BookMarked style={{ width: 24, height: 24, color: 'var(--pa)' }} strokeWidth={1.6} />}
            iconColor="var(--pa)"
            title="No saved patterns yet."
            body={t('no_bookmarks')}
          />
        ) : showAllPatterns ? (
          <>
            <div>
              {bookmarksByStory.map(([storyId, storyBms]) => {
                const story = magazineStories.find(s => s.id === storyId)
                return (
                  <PatternAccordion
                    key={storyId}
                    storyId={storyId}
                    storyTitle={story ? story.title : `Story ${String(storyId).padStart(2, '0')}`}
                    patterns={storyBms}
                    onPress={bm => router.push(`/stories/${bm.storyId}?v=p`)}
                    onRemove={handleRemoveBookmark}
                  />
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => setShowAllPatterns(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                marginTop: 10, padding: 0,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, color: '#8E8E93', fontFamily: 'inherit',
              }}
            >
              Show less
            </button>
          </>
        ) : (
          <>
            <div style={glassCard}>
              {bookmarks.slice(0, PREVIEW_PATTERNS).map((bm, i) => (
                <BookmarkedPatternRow
                  key={bm.patternId}
                  bm={bm}
                  first={i === 0}
                  onPress={() => router.push(`/stories/${bm.storyId}?v=p`)}
                  onRemove={() => handleRemoveBookmark(bm.patternId)}
                />
              ))}
            </div>
            {bookmarks.length > PREVIEW_PATTERNS && (
              <button
                type="button"
                onClick={() => setShowAllPatterns(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  marginTop: 10, padding: 0,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, color: '#8E8E93', fontFamily: 'inherit',
                }}
              >
                {`Show all ${bookmarks.length} Patterns`}
                <ChevronRight style={{ width: 11, height: 11 }} strokeWidth={2.2} />
              </button>
            )}
          </>
        )}
      </section>
    </>
  )

  const colPad: React.CSSProperties = {
    paddingTop: 7, paddingLeft: 20, paddingRight: 20,
    paddingBottom: TAB_BAR_HEIGHT + 32, boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100dvh', overflowY: 'auto' }}>
      <TopNav />

      <div className="desktop-max">
        <div className="desktop-two-col">

          {/* Left column: search + summary cards */}
          <div style={colPad}>
            {/* ── Search bar ── */}
            <div style={{ marginBottom: isSearching || showRecent ? 0 : 24, position: 'relative' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--pglass)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderRadius: 16,
                padding: '14px 14px 14px 18px',
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
                  placeholder="words, phrases, patterns, stories..."
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    fontSize: 14, color: 'var(--pt)', fontWeight: 400,
                    caretColor: 'var(--pa)',
                  }}
                />
                {query && (
                  <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus() }}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
                    <X style={{ width: 14, height: 14, color: '#8E8E93' }} strokeWidth={2} />
                  </button>
                )}
              </div>

              {/* Recent searches */}
              {showRecent && (
                <div style={{ padding: '12px 4px 16px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.10em', color: '#B0B0B8', textTransform: 'uppercase', alignSelf: 'center', marginRight: 2 }}>
                    Recent
                  </span>
                  {recentSearches.map(s => (
                    <button key={s} type="button"
                      onClick={() => { setQuery(s); submitSearch(s); inputRef.current?.focus() }}
                      style={{
                        fontSize: 12, fontWeight: 500, color: 'var(--pa)',
                        background: 'var(--pal)',
                        border: '1px solid var(--pacb)',
                        borderRadius: 999, padding: '4px 12px',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Search results ── */}
              {isSearching && (
                <div style={{ marginTop: 12, marginBottom: 24 }}>
                  {!hasResults ? (
                    <div style={{ ...glassCard, padding: '30px 22px', textAlign: 'center' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)', margin: '0 0 8px' }}>
                        No matching results found.
                      </p>
                      <p style={{ fontSize: 12, color: '#8E8E93', margin: 0, lineHeight: 1.7 }}>
                        Try a different keyword
                      </p>
                    </div>
                  ) : (
                    <>
                      {searchResults.words.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <p style={SECTION_LABEL}>Words · {searchResults.words.length}</p>
                          <div style={glassCard}>
                            {searchResults.words.map((w, i) => (
                              <SearchWordRow key={w.id} w={w} border={i > 0} onPress={() => goToWord(w)} />
                            ))}
                          </div>
                        </div>
                      )}
                      {searchResults.phrases.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <p style={SECTION_LABEL}>Phrases · {searchResults.phrases.length}</p>
                          <div style={glassCard}>
                            {searchResults.phrases.map((ph, i) => (
                              <SearchPhraseRow key={ph.id} ph={ph} border={i > 0} onPress={() => goToPhrase(ph)} />
                            ))}
                          </div>
                        </div>
                      )}
                      {searchResults.patterns.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <p style={SECTION_LABEL}>Patterns · {searchResults.patterns.length}</p>
                          <div style={glassCard}>
                            {searchResults.patterns.map((r, i) => (
                              <SearchPatternRow
                                key={r.pattern.id}
                                storyId={r.storyId}
                                storyTitle={r.storyTitle}
                                pattern={r.pattern}
                                border={i > 0}
                                onPress={() => router.push(`/stories/${r.storyId}?v=p`)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {searchResults.stories.length > 0 && (
                        <div>
                          <p style={SECTION_LABEL}>Stories · {searchResults.stories.length}</p>
                          <div style={glassCard}>
                            {searchResults.stories.map((s, i) => (
                              <SearchStoryRow
                                key={s.id}
                                story={s}
                                border={i > 0}
                                onPress={() => router.push(`/stories/${s.id}`)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── Summary cards ── */}
            <div style={{ display: 'flex', gap: 9, marginBottom: 24 }}>
              <SummaryCard
                icon={<BookOpen style={{ width: 16, height: 16, color: '#3A7A4A' }} strokeWidth={1.8} />}
                label="Words"
                value={words.length}
                accent="#3A7A4A"
              />
              <SummaryCard
                icon={<Layers style={{ width: 16, height: 16, color: '#C08040' }} strokeWidth={1.8} />}
                label="Phrases"
                value={phrases.length}
                accent="#C08040"
              />
              <SummaryCard
                icon={<BookMarked style={{ width: 16, height: 16, color: 'var(--pa)' }} strokeWidth={1.8} />}
                label="Patterns"
                value={bookmarks.length}
                accent="var(--pa)"
              />
            </div>
          </div>

          {/* Right column: saved items (stacks below on mobile) */}
          <div className="desktop-right-col" style={colPad}>
            {savedItemsPanel}
          </div>

        </div>
      </div>
    </div>
  )
}