'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, BookOpen, ChevronRight, Bookmark } from 'lucide-react'

import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { SectionLabel } from '@/components/SectionLabel'
import { magazineStories } from '@/data/magazine-stories'
import { getBookmarks, type BookmarkedPattern } from '@/lib/bookmarks/storage'
import { getSavedWords, type SavedWord } from '@/lib/words/storage'
import { useT } from '@/hooks/useT'
import type { MagazinePattern } from '@/types/magazine'

type PatternResult = {
  kind:       'pattern'
  storyId:    number
  storyTitle: string
  pattern:    MagazinePattern
}
type WordResult = {
  kind: 'word'
  word: SavedWord
}
type SearchResult = PatternResult | WordResult

function buildPatternIndex(): PatternResult[] {
  const out: PatternResult[] = []
  for (const story of magazineStories) {
    for (const pattern of story.patterns) {
      out.push({ kind: 'pattern', storyId: story.id, storyTitle: story.title, pattern })
    }
  }
  return out
}

function searchAll(
  patternIndex: PatternResult[],
  savedWords: SavedWord[],
  query: string,
): SearchResult[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  const patterns: PatternResult[] = patternIndex.filter(({ pattern }) =>
    pattern.pattern.toLowerCase().includes(q) ||
    pattern.meaningKo.toLowerCase().includes(q) ||
    (pattern.explanation ?? '').toLowerCase().includes(q) ||
    (pattern.examples ?? []).some(ex => ex.en.toLowerCase().includes(q) || ex.ko.toLowerCase().includes(q)) ||
    pattern.storySentence.toLowerCase().includes(q)
  )

  const words: WordResult[] = savedWords
    .filter(w =>
      w.word.toLowerCase().includes(q) ||
      (w.meaning ?? '').toLowerCase().includes(q) ||
      w.originalSentence.toLowerCase().includes(q)
    )
    .map(w => ({ kind: 'word' as const, word: w }))

  return [...words, ...patterns]
}

function ViewAllLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 2,
        fontSize: 11, fontWeight: 600, color: '#6E6E73',
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        letterSpacing: '0.01em', lineHeight: 1,
      }}
    >
      {label}<ChevronRight style={{ width: 10, height: 10, marginLeft: 1 }} strokeWidth={2.2} />
    </button>
  )
}

function PatternRow({
  pattern, storyId, storyTitle, border, onPress,
}: {
  pattern: MagazinePattern
  storyId: number
  storyTitle: string
  border?: boolean
  onPress: () => void
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        background: 'none', border: 'none',
        padding: '18px 24px',
        borderTop: border ? '1px solid rgba(230,232,236,0.9)' : 'none',
        cursor: 'pointer',
        transition: 'filter 0.12s, transform 0.12s',
      }}
      onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.97)' }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)' }}
    >
      <p style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1E', margin: '0 0 3px', lineHeight: 1.4 }}>
        {pattern.pattern}
      </p>
      {pattern.meaningKo && (
        <p style={{ fontSize: 12, color: '#6E6E73', margin: '0 0 6px', fontWeight: 500 }}>{pattern.meaningKo}</p>
      )}
      <p style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', margin: 0, letterSpacing: '0.06em' }}>
        Story {String(storyId).padStart(2, '0')} · {storyTitle}
      </p>
    </button>
  )
}

function SavedPatternCard({ bm, border, onPress }: { bm: BookmarkedPattern; border?: boolean; onPress: () => void }) {
  const story = magazineStories.find(s => s.id === bm.storyId)
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        background: 'none', border: 'none',
        padding: '18px 24px',
        borderTop: border ? '1px solid rgba(230,232,236,0.9)' : 'none',
        cursor: 'pointer',
        transition: 'filter 0.12s',
      }}
      onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.97)' }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)' }}
    >
      {/* PATTERN chip */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        marginBottom: 8,
        background: 'rgba(240,243,248,0.9)',
        border: '1px solid rgba(220,228,240,0.6)',
        borderRadius: 7, padding: '2px 8px',
      }}>
        <Bookmark style={{ width: 8, height: 8, color: '#8F234B' }} strokeWidth={2.5} />
        <span style={{ fontSize: 9.5, fontWeight: 700, color: '#6E6E73', letterSpacing: '0.08em' }}>
          PATTERN
        </span>
      </div>
      <p style={{ fontSize: 15, fontWeight: 700, color: '#1C1C1E', margin: '0 0 4px', lineHeight: 1.35 }}>
        {bm.pattern}
      </p>
      {bm.meaningKo && (
        <p style={{ fontSize: 12.5, color: '#6E6E73', margin: '0 0 6px', fontWeight: 500 }}>{bm.meaningKo}</p>
      )}
      <p style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', margin: 0, letterSpacing: '0.05em' }}>
        Story {String(bm.storyId).padStart(2, '0')}{story ? ` · ${story.title}` : ''}
      </p>
    </button>
  )
}

function SavedWordRow({ w, border }: { w: SavedWord; border?: boolean }) {
  const story = w.storyId ? magazineStories.find(s => s.id === w.storyId) : null
  return (
    <div style={{
      padding: '18px 24px',
      borderTop: border ? '1px solid rgba(230,232,236,0.9)' : 'none',
    }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: '#1C1C1E', margin: '0 0 4px', lineHeight: 1.3 }}>
        {w.word}
      </p>
      {w.originalSentence && (
        <p style={{
          fontSize: 12, color: '#6E6E73', margin: '0 0 5px',
          lineHeight: 1.6, fontStyle: 'italic', fontWeight: 400,
          display: '-webkit-box', WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {w.originalSentence}
        </p>
      )}
      {story && (
        <p style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', margin: 0, letterSpacing: '0.06em' }}>
          Story {String(story.id).padStart(2, '0')} · {story.title}
        </p>
      )}
    </div>
  )
}

const CARD_STYLE = {
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  borderRadius: 30,
  border: '1px solid rgba(255,255,255,0.85)',
  boxShadow: '0 12px 36px rgba(40,40,60,0.08), 0 2px 8px rgba(40,40,60,0.04)',
  overflow: 'hidden',
} as const

export default function LibraryPage() {
  const router    = useRouter()
  const t         = useT()
  const inputRef  = useRef<HTMLInputElement>(null)
  const [query, setQuery]         = useState('')
  const [bookmarks, setBookmarks] = useState<BookmarkedPattern[]>([])
  const [words, setWords]         = useState<SavedWord[]>([])

  useEffect(() => {
    setBookmarks(getBookmarks())
    setWords(getSavedWords())
  }, [])

  const patternIndex = useMemo(() => buildPatternIndex(), [])
  const results      = useMemo(() => searchAll(patternIndex, words, query), [patternIndex, words, query])
  const isSearching  = query.trim().length > 0

  const patternResults = results.filter((r): r is PatternResult => r.kind === 'pattern')
  const wordResults    = results.filter((r): r is WordResult    => r.kind === 'word')

  function goToPattern(storyId: number) {
    router.push(`/stories/${storyId}?v=p`)
  }

  return (
    <div style={{ minHeight: '100dvh', overflowY: 'auto' }}>
      <TopNav />

      <div style={{
        maxWidth: 480, margin: '0 auto',
        paddingTop: 'calc(var(--pnav-h) + 28px)',
        paddingLeft: 24, paddingRight: 24,
        paddingBottom: TAB_BAR_HEIGHT + 32,
        boxSizing: 'border-box',
      }}>

        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <p style={{
            fontSize: 38, fontWeight: 900,
            letterSpacing: '-0.04em', lineHeight: 1,
            color: '#1C1C1E', margin: 0,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          }}>
            Library
          </p>
          <p style={{
            fontSize: 14, color: '#6E6E73',
            margin: '8px 0 0', lineHeight: 1.5,
            fontWeight: 400, letterSpacing: '-0.01em',
          }}>
            패턴을 찾고, 단어를 모으세요.
          </p>
        </div>

        {/* Search bar */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: 24,
            padding: '13px 18px',
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: '0 4px 16px rgba(40,40,60,0.06)',
          }}>
            <Search style={{ width: 15, height: 15, color: '#8E8E93', flexShrink: 0 }} strokeWidth={2} />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search patterns, words..."
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontSize: 14, color: '#1C1C1E', fontWeight: 400,
                caretColor: '#5A9CF0',
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); inputRef.current?.focus() }}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X style={{ width: 14, height: 14, color: '#8E8E93' }} strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Search results */}
          {isSearching && (
            <div style={{ marginTop: 12 }}>
              {results.length === 0 ? (
                <div style={{ ...CARD_STYLE, padding: '24px' }}>
                  <p style={{ fontSize: 13, color: '#6E6E73', margin: 0, textAlign: 'center' }}>
                    검색 결과가 없어요.
                  </p>
                </div>
              ) : (
                <>
                  {wordResults.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <p style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
                        color: '#8E8E93', margin: '0 0 8px', textTransform: 'uppercase',
                        paddingLeft: 4,
                      }}>
                        Saved Words · {wordResults.length}
                      </p>
                      <div style={CARD_STYLE}>
                        {wordResults.map((r, i) => (
                          <SavedWordRow key={r.word.id} w={r.word} border={i > 0} />
                        ))}
                      </div>
                    </div>
                  )}
                  {patternResults.length > 0 && (
                    <div>
                      <p style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
                        color: '#8E8E93', margin: '0 0 8px', textTransform: 'uppercase',
                        paddingLeft: 4,
                      }}>
                        Patterns · {patternResults.length}
                      </p>
                      <div style={CARD_STYLE}>
                        {patternResults.map((r, i) => (
                          <PatternRow
                            key={r.pattern.id}
                            pattern={r.pattern}
                            storyId={r.storyId}
                            storyTitle={r.storyTitle}
                            border={i > 0}
                            onPress={() => goToPattern(r.storyId)}
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

        {/* Content sections */}
        {!isSearching && (
          <>
            {/* Saved Patterns */}
            <section style={{ marginBottom: 40 }}>
              <SectionLabel
                label="Saved Patterns"
                sub={t('sec_saved_patterns')}
                action={
                  bookmarks.length > 0 ? (
                    <ViewAllLink label="전체 보기" onClick={() => router.push('/records/patterns')} />
                  ) : undefined
                }
              />
              <div style={CARD_STYLE}>
                {bookmarks.length === 0 ? (
                  <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 16,
                      background: 'rgba(240,243,248,0.9)',
                      border: '1px solid rgba(220,228,240,0.6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 14px',
                    }}>
                      <Bookmark style={{ width: 22, height: 22, color: '#8F234B' }} strokeWidth={1.5} />
                    </div>
                    <p style={{
                      fontSize: 13.5, fontWeight: 600, color: '#1C1C1E',
                      margin: '0 0 6px',
                    }}>
                      저장된 패턴이 없습니다.
                    </p>
                    <p style={{ fontSize: 12, color: '#8E8E93', lineHeight: 1.6, margin: 0 }}>
                      패턴 옆 북마크를 눌러{'\n'}자주 쓰는 패턴을 모아보세요.
                    </p>
                  </div>
                ) : (
                  bookmarks.slice(0, 5).map((bm, i) => (
                    <SavedPatternCard
                      key={bm.patternId}
                      bm={bm}
                      border={i > 0}
                      onPress={() => router.push(`/stories/${bm.storyId}?v=p`)}
                    />
                  ))
                )}
              </div>
            </section>

            {/* Saved Words */}
            <section style={{ marginBottom: 40 }}>
              <SectionLabel
                label="Saved Words"
                sub={t('sec_saved_words')}
                action={
                  words.length > 0 ? (
                    <ViewAllLink label="전체 보기" onClick={() => router.push('/library/words')} />
                  ) : undefined
                }
              />
              <div style={CARD_STYLE}>
                {words.length === 0 ? (
                  <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 16,
                      background: 'rgba(240,243,248,0.9)',
                      border: '1px solid rgba(220,228,240,0.6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 14px',
                    }}>
                      <BookOpen style={{ width: 22, height: 22, color: '#6E6E73' }} strokeWidth={1.5} />
                    </div>
                    <p style={{
                      fontSize: 13.5, fontWeight: 600, color: '#1C1C1E',
                      margin: '0 0 6px',
                    }}>
                      아직 저장된 단어가 없습니다.
                    </p>
                    <p style={{ fontSize: 12, color: '#8E8E93', lineHeight: 1.6, margin: 0 }}>
                      Story에서 단어를 길게 눌러{'\n'}저장해보세요.
                    </p>
                  </div>
                ) : (
                  words.slice(0, 8).map((w, i) => (
                    <SavedWordRow key={w.id} w={w} border={i > 0} />
                  ))
                )}
              </div>
            </section>
          </>
        )}

      </div>
    </div>
  )
}