'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, X, BookOpen, Bookmark, RotateCcw,
  ChevronRight, ChevronDown, Sprout, BookMarked,
  SlidersHorizontal, Layers,
} from 'lucide-react'

import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { magazineStories } from '@/data/magazine-stories'
import { getBookmarks, removeBookmark, type BookmarkedPattern } from '@/lib/bookmarks/storage'
import { getSavedWords, getSavedPhrases, type SavedWord, type SavedPhrase } from '@/lib/words/storage'
import { getTotalRepeatCount } from '@/lib/srs/storage'
import { useT } from '@/hooks/useT'
import type { MagazinePattern } from '@/types/magazine'

// ── Constants ─────────────────────────────────────────────────────────────────

const RECENT_KEY = 'patto-library-recent-searches'
const MAX_RECENT  = 5

type FilterType = 'all' | 'words' | 'phrases' | 'patterns' | 'stories'

// ── Normalize for search ──────────────────────────────────────────────────────
// Rules: lowercase → strip apostrophes → strip punctuation → collapse spaces → trim

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[.,!?;:"\-–—()\[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string | null): string | null {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30)  return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
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
  if (item.exampleIndex != null) parts.push(`Ex ${item.exampleIndex + 1}`)
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

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 9.5, fontWeight: 700, letterSpacing: '0.16em',
  color: '#8E8E93', margin: '0 0 8px 4px', textTransform: 'uppercase' as const,
}

const ROW_BORDER = '1px solid rgba(230,232,236,0.8)'

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

// ── Story badge ───────────────────────────────────────────────────────────────

function StoryBadge({ storyId, color = '#4A6FA8' }: { storyId: number; color?: string }) {
  return (
    <div style={{
      width: 52, flexShrink: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 2,
      background: `${color}10`,
      borderRight: `1px solid ${color}18`,
    }}>
      <span style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.10em', color: `${color}99`, textTransform: 'uppercase' }}>
        STORY
      </span>
      <span style={{ fontSize: 17, fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.02em' }}>
        {String(storyId).padStart(2, '0')}
      </span>
    </div>
  )
}

// ── Pattern Accordion ─────────────────────────────────────────────────────────

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
            background: 'rgba(74,111,168,0.78)',
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
            <button
              key={bm.patternId}
              type="button"
              onClick={() => onPress(bm)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '11px 16px',
                borderTop: i > 0 ? ROW_BORDER : 'none',
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)', margin: '0 0 2px', lineHeight: 1.35 }}>{bm.pattern}</p>
              {bm.meaningKo && (
                <p style={{ fontSize: 11, color: '#8E8E93', margin: 0, fontWeight: 400 }}>{bm.meaningKo}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Phrase Accordion ──────────────────────────────────────────────────────────

function PhraseAccordion({
  storyId, storyTitle, phrases, onPress,
}: {
  storyId: number | null; storyTitle: string; phrases: SavedPhrase[]
  onPress: (ph: SavedPhrase) => void
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
          {storyId !== null ? (
            <span style={{
              fontSize: 11, fontWeight: 800, color: '#fff',
              background: 'rgba(180,120,60,0.75)',
              borderRadius: 7, padding: '2px 8px', letterSpacing: '0.04em',
            }}>
              S{String(storyId).padStart(2, '0')}
            </span>
          ) : (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#8E8E93', background: 'rgba(140,140,150,0.10)', borderRadius: 7, padding: '2px 8px' }}>?</span>
          )}
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)' }}>{storyTitle}</span>
          <span style={{ fontSize: 10, color: '#B0B0B8', fontWeight: 500 }}>{phrases.length}</span>
        </div>
        <ChevronDown
          style={{ width: 14, height: 14, color: '#B0B0B8', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div>
          {phrases.map((ph, i) => (
            <button
              key={ph.id}
              type="button"
              onClick={() => onPress(ph)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '11px 16px',
                borderTop: i > 0 ? ROW_BORDER : 'none',
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)', margin: '0 0 2px', lineHeight: 1.35 }}>{ph.phrase}</p>
              <p style={{ fontSize: 10, color: '#B0B0B8', margin: 0, letterSpacing: '0.04em' }}>
                {ph.phraseType} · {relativeTime(ph.savedAt)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Word Accordion ────────────────────────────────────────────────────────────

function WordAccordion({
  storyId, storyTitle, words, onPress,
}: {
  storyId: number | null; storyTitle: string; words: SavedWord[]
  onPress: (w: SavedWord) => void
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
          {storyId !== null ? (
            <span style={{
              fontSize: 11, fontWeight: 800, color: '#fff',
              background: 'rgba(58,122,74,0.78)',
              borderRadius: 7, padding: '2px 8px', letterSpacing: '0.04em',
            }}>
              S{String(storyId).padStart(2, '0')}
            </span>
          ) : (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#8E8E93', background: 'rgba(140,140,150,0.10)', borderRadius: 7, padding: '2px 8px' }}>?</span>
          )}
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)' }}>{storyTitle}</span>
          <span style={{ fontSize: 10, color: '#B0B0B8', fontWeight: 500 }}>{words.length}</span>
        </div>
        <ChevronDown
          style={{ width: 14, height: 14, color: '#B0B0B8', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div>
          {words.map((w, i) => (
            <button
              key={w.id}
              type="button"
              onClick={() => onPress(w)}
              style={{
                display: 'flex', alignItems: 'center', width: '100%',
                background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                padding: '10px 16px',
                borderTop: i > 0 ? ROW_BORDER : 'none',
              }}
            >
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--pt)' }}>{w.word}</span>
              {w.meaning && (
                <span style={{ fontSize: 11, color: '#8E8E93', fontWeight: 400, marginRight: 8 }}>{w.meaning}</span>
              )}
              <span style={{ fontSize: 9, color: '#C0C0C8', flexShrink: 0 }}>
                {relativeTime(w.savedAt) ?? ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Search result rows ────────────────────────────────────────────────────────

function SearchWordRow({ w, border, onPress }: { w: SavedWord; border: boolean; onPress: () => void }) {
  const src = sourceLabel(w)
  return (
    <button type="button" onClick={onPress} style={{
      display: 'block', width: '100%', textAlign: 'left',
      background: 'none', border: 'none', cursor: 'pointer',
      padding: '13px 18px',
      borderTop: border ? ROW_BORDER : 'none',
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)', margin: '0 0 2px' }}>{w.word}</p>
      {w.meaning && <p style={{ fontSize: 11, color: '#8E8E93', margin: '0 0 3px' }}>{w.meaning}</p>}
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
  return (
    <button type="button" onClick={onPress} style={{
      display: 'block', width: '100%', textAlign: 'left',
      background: 'none', border: 'none',
      padding: '13px 18px',
      borderTop: border ? ROW_BORDER : 'none',
      cursor: 'pointer',
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)', margin: '0 0 2px' }}>{pattern.pattern}</p>
      {pattern.meaningKo && <p style={{ fontSize: 11, color: '#8E8E93', margin: '0 0 3px' }}>{pattern.meaningKo}</p>}
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

// ── Filter dropdown ───────────────────────────────────────────────────────────

const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'words',    label: 'Words'    },
  { key: 'phrases',  label: 'Phrases'  },
  { key: 'patterns', label: 'Patterns' },
  { key: 'stories',  label: 'Stories'  },
]

function FilterDropdown({ filter, onChange, onClose }: {
  filter: FilterType; onChange: (f: FilterType) => void; onClose: () => void
}) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50 }} />
      <div style={{
        position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 51,
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.90)',
        boxShadow: '0 8px 32px rgba(40,50,80,0.12)',
        overflow: 'hidden',
        minWidth: 120,
      }}>
        {FILTER_OPTIONS.map((opt, i) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => { onChange(opt.key); onClose() }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '11px 16px',
              background: filter === opt.key ? 'rgba(74,111,168,0.08)' : 'none',
              border: 'none',
              borderTop: i > 0 ? '1px solid rgba(230,232,240,0.6)' : 'none',
              fontSize: 13, fontWeight: filter === opt.key ? 700 : 500,
              color: filter === opt.key ? '#4A6FA8' : 'var(--pt)',
              cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const router   = useRouter()
  const t        = useT()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery]               = useState('')
  const [filter, setFilter]             = useState<FilterType>('all')
  const [showFilter, setShowFilter]     = useState(false)
  const [bookmarks, setBookmarks]       = useState<BookmarkedPattern[]>([])
  const [words, setWords]               = useState<SavedWord[]>([])
  const [phrases, setPhrases]           = useState<SavedPhrase[]>([])
  const [reviews, setReviews]           = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [focused, setFocused]           = useState(false)

  useEffect(() => {
    setBookmarks(getBookmarks())
    setWords(getSavedWords())
    setPhrases(getSavedPhrases())
    setReviews(getTotalRepeatCount())
    setRecentSearches(readRecentSearches())
  }, [])

  const patternIndex = useMemo(() => buildPatternIndex(), [])

  // ── Group bookmarks by storyId ────────────────────────────────────────────
  const bookmarksByStory = useMemo(() => {
    const map = new Map<number, BookmarkedPattern[]>()
    for (const bm of bookmarks) {
      if (!map.has(bm.storyId)) map.set(bm.storyId, [])
      map.get(bm.storyId)!.push(bm)
    }
    return [...map.entries()].sort(([a], [b]) => a - b)
  }, [bookmarks])

  // ── Group phrases by storyId ──────────────────────────────────────────────
  const phrasesByStory = useMemo(() => {
    const map = new Map<number | null, SavedPhrase[]>()
    for (const ph of phrases) {
      const key = ph.storyId ?? null
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(ph)
    }
    return [...map.entries()].sort(([a], [b]) => {
      if (a === null) return 1
      if (b === null) return -1
      return a - b
    })
  }, [phrases])

  // ── Group words by storyId ────────────────────────────────────────────────
  const wordsByStory = useMemo(() => {
    const map = new Map<number | null, SavedWord[]>()
    for (const w of words) {
      const key = w.storyId ?? null
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(w)
    }
    return [...map.entries()].sort(([a], [b]) => {
      if (a === null) return 1
      if (b === null) return -1
      return a - b
    })
  }, [words])

  // ── Search ────────────────────────────────────────────────────────────────
  const isSearching = query.trim().length > 0
  const nq = normalize(query)

  const searchResults = useMemo(() => {
    if (!nq) return { words: [], phrases: [], patterns: [], stories: [] }

    const match = (s: string) => normalize(s).includes(nq)

    // Words: match word, meaning, originalSentence
    const matchedWords = (filter === 'all' || filter === 'words')
      ? words.filter(w => match(w.word) || match(w.meaning ?? '') || match(w.originalSentence))
      : []

    // Phrases: match phrase text (partial match handles chunk word search automatically)
    // e.g. "forward" matches "look forward to" because normalize("look forward to").includes("forward")
    const matchedPhrases = (filter === 'all' || filter === 'phrases')
      ? phrases.filter(ph => match(ph.phrase) || match(ph.originalSentence))
      : []

    // Patterns: match pattern text, meaningKo, explanation, storySentence, variationSentence
    const matchedPatterns = (filter === 'all' || filter === 'patterns')
      ? patternIndex.filter(({ pattern }) =>
          match(pattern.pattern) ||
          match(pattern.meaningKo) ||
          match(pattern.explanation ?? '') ||
          match(pattern.storySentence) ||
          match(pattern.variationSentence)
        ).slice(0, 20)
      : []

    // Stories: match title or "story N" / "sNN" shorthand
    const matchedStories = (filter === 'all' || filter === 'stories')
      ? magazineStories.filter(s =>
          match(s.title) ||
          normalize(`story ${s.id}`).includes(nq) ||
          normalize(`s${String(s.id).padStart(2, '0')}`).includes(nq)
        ).slice(0, 10)
      : []

    return { words: matchedWords, phrases: matchedPhrases, patterns: matchedPatterns, stories: matchedStories }
  }, [patternIndex, words, phrases, nq, filter])

  function submitSearch(q: string) {
    if (!q.trim()) return
    saveRecentSearch(q.trim())
    setRecentSearches(readRecentSearches())
  }

  function handleRemoveBookmark(patternId: string) {
    removeBookmark(patternId)
    setBookmarks(prev => prev.filter(b => b.patternId !== patternId))
  }

  // ── Navigation helpers ────────────────────────────────────────────────────

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

  return (
    <div style={{ minHeight: '100dvh', overflowY: 'auto' }}>
      <TopNav />

      <div style={{
        maxWidth: 480, margin: '0 auto',
        paddingTop: 14,
        paddingLeft: 20, paddingRight: 20,
        paddingBottom: TAB_BAR_HEIGHT + 32,
        boxSizing: 'border-box',
      }}>

        {/* ── Search bar + Filter ── */}
        <div style={{ marginBottom: isSearching || showRecent ? 0 : 24, position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--pglass)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: 16,
            padding: '14px 14px 14px 18px',
            border: focused
              ? '1px solid rgba(74,111,168,0.35)'
              : '1px solid var(--pglass-border)',
            boxShadow: focused
              ? '0 4px 20px rgba(74,111,168,0.12)'
              : '0 4px 16px rgba(40,50,80,0.07)',
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
              placeholder="words, phrases, patterns, stories…"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontSize: 14, color: 'var(--pt)', fontWeight: 400,
                caretColor: '#4A6FA8',
              }}
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus() }}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
                <X style={{ width: 14, height: 14, color: '#8E8E93' }} strokeWidth={2} />
              </button>
            )}
            {/* Filter button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowFilter(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 30, height: 30, borderRadius: 9,
                  background: filter !== 'all' ? 'rgba(74,111,168,0.12)' : 'rgba(140,140,150,0.08)',
                  border: filter !== 'all' ? '1px solid rgba(74,111,168,0.24)' : '1px solid rgba(140,140,150,0.14)',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                <SlidersHorizontal
                  style={{ width: 13, height: 13, color: filter !== 'all' ? '#4A6FA8' : '#8E8E93' }}
                  strokeWidth={2}
                />
              </button>
              {showFilter && (
                <FilterDropdown
                  filter={filter}
                  onChange={f => setFilter(f)}
                  onClose={() => setShowFilter(false)}
                />
              )}
            </div>
          </div>

          {/* Active filter chip */}
          {filter !== 'all' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <span style={{ fontSize: 10, color: '#8E8E93', fontWeight: 500 }}>Filter:</span>
              <button
                type="button"
                onClick={() => setFilter('all')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 11, fontWeight: 600, color: '#4A6FA8',
                  background: 'rgba(74,111,168,0.08)',
                  border: '1px solid rgba(74,111,168,0.20)',
                  borderRadius: 999, padding: '3px 10px',
                  cursor: 'pointer',
                }}
              >
                {FILTER_OPTIONS.find(f => f.key === filter)?.label}
                <X style={{ width: 10, height: 10 }} strokeWidth={2.5} />
              </button>
            </div>
          )}

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
                    fontSize: 12, fontWeight: 500, color: '#4A6FA8',
                    background: 'rgba(74,111,168,0.07)',
                    border: '1px solid rgba(74,111,168,0.16)',
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
                    Try a different keyword —{'\n'}
                    spelling and capitalization don't matter.
                  </p>
                </div>
              ) : (
                <>
                  {/* WORDS */}
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

                  {/* PHRASES */}
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

                  {/* PATTERNS */}
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

                  {/* STORIES */}
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
            icon={<BookMarked style={{ width: 16, height: 16, color: '#4A6FA8' }} strokeWidth={1.8} />}
            label="Patterns"
            value={bookmarks.length}
            accent="#4A6FA8"
          />
          <SummaryCard
            icon={<Layers style={{ width: 16, height: 16, color: '#C08040' }} strokeWidth={1.8} />}
            label="Phrases"
            value={phrases.length}
            accent="#C08040"
          />
          <SummaryCard
            icon={<BookOpen style={{ width: 16, height: 16, color: '#3A7A4A' }} strokeWidth={1.8} />}
            label="Words"
            value={words.length}
            accent="#3A7A4A"
          />
        </div>

        {/* ── Main sections (non-search) ── */}
        {!isSearching && (
          <>
            {/* Saved Patterns */}
            <section style={{ marginBottom: 28 }}>
              <SecLabel
                label="Saved Patterns"
                count={bookmarks.length}
                unit="Patterns"
                onViewAll={bookmarks.length > 4 ? () => router.push('/records/patterns') : undefined}
              />
              {bookmarks.length === 0 ? (
                <EmptyState
                  icon={<BookMarked style={{ width: 24, height: 24, color: '#4A6FA8' }} strokeWidth={1.6} />}
                  iconColor="#4A6FA8"
                  title="No saved patterns yet."
                  body={t('no_bookmarks')}
                />
              ) : (
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
                  body="문장 속 단어를 탭하면 표현을 저장할 수 있어요."
                />
              ) : (
                <div>
                  {phrasesByStory.map(([storyId, storyPhrases]) => {
                    const story = storyId !== null ? magazineStories.find(s => s.id === storyId) : null
                    return (
                      <PhraseAccordion
                        key={storyId ?? 'unknown'}
                        storyId={storyId}
                        storyTitle={story ? story.title : 'Unknown Story'}
                        phrases={storyPhrases}
                        onPress={goToPhrase}
                      />
                    )
                  })}
                </div>
              )}
            </section>

            {/* Saved Words */}
            <section>
              <SecLabel label="Saved Words" count={words.length} unit="Words" />
              {words.length === 0 ? (
                <EmptyState
                  icon={<BookOpen style={{ width: 24, height: 24, color: '#3A7A4A' }} strokeWidth={1.6} />}
                  iconColor="#3A7A4A"
                  title="No saved words yet."
                  body={t('sec_saved_words')}
                />
              ) : (
                <div>
                  {wordsByStory.map(([storyId, storyWords]) => {
                    const story = storyId !== null ? magazineStories.find(s => s.id === storyId) : null
                    return (
                      <WordAccordion
                        key={storyId ?? 'unknown'}
                        storyId={storyId}
                        storyTitle={story ? story.title : 'Unknown Story'}
                        words={storyWords}
                        onPress={goToWord}
                      />
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
