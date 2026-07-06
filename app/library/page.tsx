'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, BookOpen, Bookmark, RotateCcw, ChevronRight, Sprout, BookMarked } from 'lucide-react'

import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { magazineStories } from '@/data/magazine-stories'
import { getBookmarks, removeBookmark, type BookmarkedPattern } from '@/lib/bookmarks/storage'
import { getSavedWords, type SavedWord } from '@/lib/words/storage'
import { getRecord, getTotalRepeatCount } from '@/lib/srs/storage'
import { useT } from '@/hooks/useT'
import type { MagazinePattern } from '@/types/magazine'

// ── Constants ─────────────────────────────────────────────────────────────────

const RECENT_KEY = 'patto-library-recent-searches'
const MAX_RECENT  = 5

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDifficulty(storyId: number): 'Easy' | 'Medium' | 'Hard' {
  if (storyId <= 33)  return 'Easy'
  if (storyId <= 66)  return 'Medium'
  return 'Hard'
}

const DIFF_STYLE: Record<string, React.CSSProperties> = {
  Easy:   { color: '#3A7A4A', background: 'rgba(80,180,100,0.09)',  border: '1px solid rgba(80,180,100,0.18)'  },
  Medium: { color: '#7A6A20', background: 'rgba(200,175,50,0.09)',  border: '1px solid rgba(200,175,50,0.18)'  },
  Hard:   { color: '#8F234B', background: 'rgba(143,35,75,0.08)',   border: '1px solid rgba(143,35,75,0.16)'   },
}

function relativeTime(iso: string | null): string | null {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30)  return `${days} days ago`
  return `${Math.floor(days / 30)} mo ago`
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

// ── Shared glass card shell ───────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.86)',
  boxShadow: '0 4px 18px rgba(40,50,80,0.07), 0 1px 4px rgba(40,50,80,0.03)',
  overflow: 'hidden',
}

// ── Summary cards ─────────────────────────────────────────────────────────────

function SummaryCard({
  icon, label, value,
}: {
  icon: React.ReactNode
  label: string
  value: number
  accent: string
}) {
  return (
    <div style={{
      ...glassCard,
      flex: 1, minWidth: 0,
      padding: '14px 12px 12px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }}>
      {icon}
      <span style={{ fontSize: 'clamp(1.15rem, 5vw, 1.45rem)', fontWeight: 800, color: '#1C1C1E', lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', color: '#8E8E93', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.3 }}>
        {label}
      </span>
    </div>
  )
}

// ── Difficulty chip ───────────────────────────────────────────────────────────

function DiffChip({ diff }: { diff: 'Easy' | 'Medium' | 'Hard' }) {
  return (
    <span style={{
      ...DIFF_STYLE[diff],
      fontSize: 9, fontWeight: 700, letterSpacing: '0.10em',
      borderRadius: 6, padding: '2px 7px',
      textTransform: 'uppercase',
    }}>
      {diff}
    </span>
  )
}

// ── Saved Pattern card (horizontal list) ─────────────────────────────────────

function PatternCard({
  bm, onPress, onRemove,
}: {
  bm: BookmarkedPattern
  onPress: () => void
  onRemove: () => void
}) {
  const story = magazineStories.find(s => s.id === bm.storyId)
  const diff  = getDifficulty(bm.storyId)
  const srsRec = getRecord('pattern', bm.patternId)
  const lastRev = relativeTime(srsRec?.lastPracticedAt ?? null)
  const dropChar = bm.pattern.trim()[0]?.toUpperCase() ?? '?'
  const [pressed, setPressed] = useState(false)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPress}
      onKeyDown={e => e.key === 'Enter' && onPress()}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        ...glassCard,
        display: 'flex', alignItems: 'stretch', gap: 0,
        cursor: 'pointer',
        transform: pressed ? 'scale(0.975)' : 'scale(1)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        boxShadow: pressed
          ? '0 2px 8px rgba(40,50,80,0.05)'
          : '0 4px 18px rgba(40,50,80,0.07), 0 1px 4px rgba(40,50,80,0.03)',
      }}
    >
      {/* Drop cap */}
      <div style={{
        width: 52, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(240,243,250,0.65)',
        borderRight: '1px solid rgba(230,233,240,0.70)',
      }}>
        <span style={{
          fontSize: 26, fontWeight: 900, color: '#4A6FA8',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", serif',
          lineHeight: 1, letterSpacing: '-0.03em',
        }}>
          {dropChar}
        </span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0, padding: '12px 12px 10px' }}>
        {/* Top: PATTERN chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <span style={{
            fontSize: 8.5, fontWeight: 700, letterSpacing: '0.12em',
            color: '#8E8E93', textTransform: 'uppercase',
          }}>
            PATTERN
          </span>
        </div>
        {/* Pattern text */}
        <p style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1E', margin: '0 0 2px', lineHeight: 1.3 }}>
          {bm.pattern}
        </p>
        {/* Meaning */}
        {bm.meaningKo && (
          <p style={{ fontSize: 11.5, color: '#8E8E93', margin: '0 0 7px', fontWeight: 400 }}>
            {bm.meaningKo}
          </p>
        )}
        {/* Story */}
        <p style={{ fontSize: 9.5, fontWeight: 600, color: '#B0B0B8', margin: '0 0 6px', letterSpacing: '0.05em' }}>
          Story {String(bm.storyId).padStart(2, '0')}{story ? ` · ${story.title}` : ''}
        </p>
        {/* Bottom row: diff chip + last review */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <DiffChip diff={diff} />
          {lastRev && (
            <span style={{ fontSize: 9, color: '#B0B0B8', fontWeight: 500 }}>
              {lastRev}
            </span>
          )}
        </div>
      </div>

      {/* Right: bookmark remove */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '10px 10px 0 0' }}>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onRemove() }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 7,
          }}
          title="Remove bookmark"
        >
          <Bookmark style={{ width: 14, height: 14, color: '#8F234B' }} strokeWidth={0} fill="#8F234B" />
        </button>
      </div>
    </div>
  )
}

// ── Saved Word card ───────────────────────────────────────────────────────────

function WordCard({ w }: { w: SavedWord }) {
  const story = w.storyId ? magazineStories.find(s => s.id === w.storyId) : null
  const lastSaved = relativeTime(w.savedAt)
  const dropChar = w.word.trim()[0]?.toUpperCase() ?? '?'
  const [pressed, setPressed] = useState(false)

  return (
    <div
      style={{
        ...glassCard,
        display: 'flex', alignItems: 'stretch',
        transform: pressed ? 'scale(0.975)' : 'scale(1)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        boxShadow: pressed
          ? '0 2px 8px rgba(40,50,80,0.05)'
          : '0 4px 18px rgba(40,50,80,0.07), 0 1px 4px rgba(40,50,80,0.03)',
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      {/* Drop cap */}
      <div style={{
        width: 52, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(240,248,244,0.65)',
        borderRight: '1px solid rgba(210,235,220,0.60)',
      }}>
        <span style={{
          fontSize: 26, fontWeight: 900, color: '#3A7A4A',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", serif',
          lineHeight: 1, letterSpacing: '-0.03em',
        }}>
          {dropChar}
        </span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0, padding: '10px 12px 10px' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1E', margin: '0 0 4px', lineHeight: 1.3 }}>
          {w.word}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {story && (
            <span style={{ fontSize: 9.5, fontWeight: 600, color: '#B0B0B8', letterSpacing: '0.05em' }}>
              Story {String(story.id).padStart(2, '0')} · {story.title}
            </span>
          )}
          {lastSaved && (
            <span style={{ fontSize: 9, color: '#C0C0C8', fontWeight: 400 }}>{lastSaved}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Search result rows (compact, inside glass card) ───────────────────────────

function SearchPatternRow({
  storyId, storyTitle, pattern, border, onPress,
}: {
  storyId: number; storyTitle: string; pattern: MagazinePattern; border: boolean; onPress: () => void
}) {
  return (
    <button type="button" onClick={onPress} style={{
      display: 'block', width: '100%', textAlign: 'left',
      background: 'none', border: 'none',
      padding: '14px 18px',
      borderTop: border ? '1px solid rgba(230,232,236,0.8)' : 'none',
      cursor: 'pointer',
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E', margin: '0 0 2px' }}>{pattern.pattern}</p>
      {pattern.meaningKo && <p style={{ fontSize: 11, color: '#8E8E93', margin: '0 0 4px' }}>{pattern.meaningKo}</p>}
      <p style={{ fontSize: 9.5, color: '#B0B0B8', margin: 0, letterSpacing: '0.05em' }}>
        Story {String(storyId).padStart(2, '0')} · {storyTitle}
      </p>
    </button>
  )
}

function SearchWordRow({ w, border }: { w: SavedWord; border: boolean }) {
  const story = w.storyId ? magazineStories.find(s => s.id === w.storyId) : null
  return (
    <div style={{ padding: '14px 18px', borderTop: border ? '1px solid rgba(230,232,236,0.8)' : 'none' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E', margin: '0 0 2px' }}>{w.word}</p>
      {w.meaning && <p style={{ fontSize: 11, color: '#8E8E93', margin: '0 0 4px' }}>{w.meaning}</p>}
      {story && <p style={{ fontSize: 9.5, color: '#B0B0B8', margin: 0, letterSpacing: '0.05em' }}>
        Story {String(story.id).padStart(2, '0')} · {story.title}
      </p>}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ icon, title, body }: { icon: React.ReactNode; iconColor: string; title: string; body: string }) {
  return (
    <div style={{
      ...glassCard,
      padding: '28px 22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        {icon}
        <p style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1E', margin: 0, letterSpacing: '-0.01em' }}>{title}</p>
      </div>
      <p style={{ fontSize: 12, color: '#8E8E93', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{body}</p>
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────

function SecLabel({ label, count, onViewAll }: { label: string; count?: number; onViewAll?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#6E6E73', textTransform: 'uppercase' }}>
          {label}
        </span>
        {count !== undefined && count > 0 && (
          <span style={{
            fontSize: 9, fontWeight: 700, color: '#8E8E93',
            background: 'rgba(140,140,150,0.10)', borderRadius: 999,
            padding: '1px 6px',
          }}>
            {count}
          </span>
        )}
      </div>
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
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const router   = useRouter()
  const t        = useT()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery]         = useState('')
  const [bookmarks, setBookmarks] = useState<BookmarkedPattern[]>([])
  const [words, setWords]         = useState<SavedWord[]>([])
  const [reviews, setReviews]     = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [focused, setFocused]     = useState(false)

  useEffect(() => {
    setBookmarks(getBookmarks())
    setWords(getSavedWords())
    setReviews(getTotalRepeatCount())
    setRecentSearches(readRecentSearches())
  }, [])

  const patternIndex = useMemo(() => buildPatternIndex(), [])

  // Search
  const isSearching = query.trim().length > 0
  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return { patterns: [], words: [] }
    const patterns = patternIndex.filter(({ pattern }) =>
      pattern.pattern.toLowerCase().includes(q) ||
      pattern.meaningKo.toLowerCase().includes(q) ||
      (pattern.explanation ?? '').toLowerCase().includes(q)
    ).slice(0, 20)
    const words2 = words.filter(w =>
      w.word.toLowerCase().includes(q) ||
      (w.meaning ?? '').toLowerCase().includes(q)
    )
    return { patterns, words: words2 }
  }, [patternIndex, words, query])

  function submitSearch(q: string) {
    if (!q.trim()) return
    saveRecentSearch(q.trim())
    setRecentSearches(readRecentSearches())
  }

  function handleRemoveBookmark(patternId: string) {
    removeBookmark(patternId)
    setBookmarks(prev => prev.filter(b => b.patternId !== patternId))
  }

  const showRecent = focused && !isSearching && recentSearches.length > 0

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

        {/* ── Page title ── */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 12, color: '#8E8E93', margin: 0, fontWeight: 400 }}>
            나만의 영어 컬렉션
          </p>
        </div>

        {/* ── Summary cards ── */}
        <div style={{ display: 'flex', gap: 9, marginBottom: 20 }}>
          <SummaryCard
            icon={<Bookmark style={{ width: 16, height: 16, color: '#4A6FA8' }} strokeWidth={1.8} />}
            label="Saved Patterns"
            value={bookmarks.length}
            accent="#4A6FA8"
          />
          <SummaryCard
            icon={<Sprout style={{ width: 16, height: 16, color: '#3A7A4A' }} strokeWidth={1.8} />}
            label="Saved Words"
            value={words.length}
            accent="#3A7A4A"
          />
          <SummaryCard
            icon={<RotateCcw style={{ width: 16, height: 16, color: '#8F234B' }} strokeWidth={1.8} />}
            label="Reviews"
            value={reviews}
            accent="#8F234B"
          />
        </div>

        {/* ── Search bar ── */}
        <div style={{ marginBottom: isSearching || showRecent ? 0 : 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: 16,
            padding: '14px 18px',
            border: focused
              ? '1px solid rgba(74,111,168,0.35)'
              : '1px solid rgba(255,255,255,0.92)',
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
              placeholder="Search patterns, words..."
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontSize: 14, color: '#1C1C1E', fontWeight: 400,
                caretColor: '#4A6FA8',
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
                  onClick={() => { setQuery(s); inputRef.current?.focus() }}
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

          {/* Search results */}
          {isSearching && (
            <div style={{ marginTop: 12, marginBottom: 24 }}>
              {searchResults.patterns.length === 0 && searchResults.words.length === 0 ? (
                <div style={{ ...glassCard, padding: '24px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#8E8E93', margin: 0 }}>검색 결과가 없어요.</p>
                </div>
              ) : (
                <>
                  {searchResults.words.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.16em', color: '#8E8E93', margin: '0 0 8px 4px', textTransform: 'uppercase' }}>
                        Saved Words · {searchResults.words.length}
                      </p>
                      <div style={glassCard}>
                        {searchResults.words.map((w, i) => (
                          <SearchWordRow key={w.id} w={w} border={i > 0} />
                        ))}
                      </div>
                    </div>
                  )}
                  {searchResults.patterns.length > 0 && (
                    <div>
                      <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.16em', color: '#8E8E93', margin: '0 0 8px 4px', textTransform: 'uppercase' }}>
                        Patterns · {searchResults.patterns.length}
                      </p>
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
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Main sections ── */}
        {!isSearching && (
          <>
            {/* Saved Patterns */}
            <section style={{ marginBottom: 28 }}>
              <SecLabel
                label="Saved Patterns"
                count={bookmarks.length}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {bookmarks.slice(0, 5).map(bm => (
                    <PatternCard
                      key={bm.patternId}
                      bm={bm}
                      onPress={() => router.push(`/stories/${bm.storyId}?v=p`)}
                      onRemove={() => handleRemoveBookmark(bm.patternId)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Saved Words */}
            <section>
              <SecLabel
                label="Saved Words"
                count={words.length}
                onViewAll={words.length > 6 ? () => router.push('/library/words') : undefined}
              />
              {words.length === 0 ? (
                <EmptyState
                  icon={<BookOpen style={{ width: 24, height: 24, color: '#3A7A4A' }} strokeWidth={1.6} />}
                  iconColor="#3A7A4A"
                  title="No saved words yet."
                  body={t('sec_saved_words')}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {words.slice(0, 6).map(w => (
                    <WordCard key={w.id} w={w} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
