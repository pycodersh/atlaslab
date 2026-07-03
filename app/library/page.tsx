'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, BookOpen, ChevronRight, Bookmark } from 'lucide-react'

import { TopNav } from '@/components/TopNav'
import { SectionLabel } from '@/components/SectionLabel'
import { magazineStories } from '@/data/magazine-stories'
import { getBookmarks, type BookmarkedPattern } from '@/lib/bookmarks/storage'
import { getSavedWords, type SavedWord } from '@/lib/words/storage'
import { useT } from '@/hooks/useT'
import type { MagazinePattern } from '@/types/magazine'

// ── 타입 ─────────────────────────────────────────────────────────────────────

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

// ── 검색 인덱스 ──────────────────────────────────────────────────────────────

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

// ── 공통 UI ───────────────────────────────────────────────────────────────────

function ViewAllLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 2,
        fontSize: 11, fontWeight: 600, color: 'var(--pa)',
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        letterSpacing: '0.01em', lineHeight: 1,
      }}
    >
      {label}<ChevronRight style={{ width: 10, height: 10, marginLeft: 1 }} strokeWidth={2.2} />
    </button>
  )
}

// ── Pattern Row ───────────────────────────────────────────────────────────────

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
        padding: '16px 0',
        borderTop: border ? '1px solid var(--pd)' : 'none',
        cursor: 'pointer',
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)', margin: '0 0 3px', lineHeight: 1.4 }}>
        {pattern.pattern}
      </p>
      {pattern.meaningKo && (
        <p style={{ fontSize: 12, color: 'var(--pm)', margin: '0 0 6px' }}>{pattern.meaningKo}</p>
      )}
      <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--pm2)', margin: 0, letterSpacing: '0.06em' }}>
        Story {String(storyId).padStart(2, '0')} · {storyTitle}
      </p>
    </button>
  )
}

// ── Saved Pattern Row ─────────────────────────────────────────────────────────

function SavedPatternRow({ bm, border, onPress }: { bm: BookmarkedPattern; border?: boolean; onPress: () => void }) {
  const story = magazineStories.find(s => s.id === bm.storyId)
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        background: 'none', border: 'none',
        padding: '16px 0',
        borderTop: border ? '1px solid var(--pd)' : 'none',
        cursor: 'pointer',
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)', margin: '0 0 3px', lineHeight: 1.4 }}>
        {bm.pattern}
      </p>
      {bm.meaningKo && (
        <p style={{ fontSize: 12, color: 'var(--pm)', margin: '0 0 6px' }}>{bm.meaningKo}</p>
      )}
      <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--pm2)', margin: 0, letterSpacing: '0.06em' }}>
        Story {String(bm.storyId).padStart(2, '0')}{story ? ` · ${story.title}` : ''}
      </p>
    </button>
  )
}

// ── Saved Word Row ────────────────────────────────────────────────────────────

function SavedWordRow({ w, border }: { w: SavedWord; border?: boolean }) {
  const story = w.storyId ? magazineStories.find(s => s.id === w.storyId) : null
  return (
    <div style={{
      padding: '14px 0',
      borderTop: border ? '1px solid var(--pd)' : 'none',
    }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)', margin: '0 0 4px', lineHeight: 1.3 }}>
        {w.word}
      </p>
      {w.originalSentence && (
        <p style={{
          fontSize: 12, color: 'var(--pt2)', margin: '0 0 5px',
          lineHeight: 1.6, fontStyle: 'italic',
          display: '-webkit-box', WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {w.originalSentence}
        </p>
      )}
      {story && (
        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--pm2)', margin: 0, letterSpacing: '0.06em' }}>
          Story {String(story.id).padStart(2, '0')} · {story.title}
        </p>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
    <div style={{ height: '100dvh', overflowY: 'auto', background: 'var(--pb)' }}>
      <TopNav />

      <div style={{
        maxWidth: 480, margin: '0 auto',
        paddingTop: 'calc(var(--pnav-h) + 28px)',
        paddingLeft: 24, paddingRight: 24, paddingBottom: 100,
        boxSizing: 'border-box',
      }}>

        {/* ── Page title ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <p className="font-playfair" style={{
            fontSize: 'clamp(2rem, 9vw, 2.8rem)', fontWeight: 900,
            letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--pt)', margin: 0,
          }}>
            Library
          </p>
          <p className="font-playfair" style={{
            fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', fontStyle: 'italic',
            fontWeight: 500, color: 'var(--pm)', marginTop: 10, lineHeight: 1.6,
          }}>
            패턴을 찾고, 단어를 모으세요.
          </p>
          <div style={{ height: 1.5, background: 'var(--pa)', width: 32, marginTop: 14, borderRadius: 1, opacity: 0.7 }} />
        </div>

        {/* ── Search bar ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 44 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--pc)', borderRadius: 12,
            padding: '12px 16px',
            border: '1px solid var(--pd)',
          }}>
            <Search style={{ width: 15, height: 15, color: 'var(--pm2)', flexShrink: 0 }} strokeWidth={2} />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search patterns, words..."
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontSize: 14, color: 'var(--pt)',
                caretColor: 'var(--pa)',
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); inputRef.current?.focus() }}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X style={{ width: 14, height: 14, color: 'var(--pm2)' }} strokeWidth={2} />
              </button>
            )}
          </div>

          {/* ── Search results ──────────────────────────────────────── */}
          {isSearching && (
            <div style={{ marginTop: 8 }}>
              {results.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--pm)', padding: '16px 0' }}>
                  검색 결과가 없어요.
                </p>
              ) : (
                <>
                  {/* Saved Words 결과 */}
                  {wordResults.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <p style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
                        color: 'var(--pm2)', margin: '12px 0 0', textTransform: 'uppercase',
                      }}>
                        Saved Words · {wordResults.length}
                      </p>
                      {wordResults.map((r, i) => (
                        <SavedWordRow key={r.word.id} w={r.word} border={i > 0} />
                      ))}
                    </div>
                  )}

                  {/* Pattern 결과 */}
                  {patternResults.length > 0 && (
                    <>
                      <p style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
                        color: 'var(--pm2)', margin: '0 0 0', textTransform: 'uppercase',
                      }}>
                        Patterns · {patternResults.length}
                      </p>
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
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Content sections (검색 중에는 숨김) ──────────────────── */}
        {!isSearching && (
          <>
            {/* ── SAVED PATTERNS ──────────────────────────────────── */}
            <section style={{ marginBottom: 64 }}>
              <SectionLabel
                label="Saved Patterns"
                sub={t('sec_saved_patterns')}
                action={
                  bookmarks.length > 0 ? (
                    <ViewAllLink label="전체 보기" onClick={() => router.push('/records/patterns')} />
                  ) : undefined
                }
              />
              {bookmarks.length === 0 ? (
                <div style={{ padding: '20px 0' }}>
                  <Bookmark style={{ width: 24, height: 24, color: 'var(--pd)', marginBottom: 10 }} strokeWidth={1.5} />
                  <p style={{ fontSize: 13, color: 'var(--pm)', lineHeight: 1.7, margin: 0 }}>
                    아직 저장한 패턴이 없어요.<br />
                    패턴 옆 북마크를 눌러 자주 쓰는 패턴을 모아보세요.
                  </p>
                </div>
              ) : (
                bookmarks.slice(0, 5).map((bm, i) => (
                  <SavedPatternRow
                    key={bm.patternId}
                    bm={bm}
                    border={i > 0}
                    onPress={() => router.push(`/stories/${bm.storyId}?v=p`)}
                  />
                ))
              )}
            </section>

            {/* ── SAVED WORDS ─────────────────────────────────────── */}
            <section style={{ marginBottom: 64 }}>
              <SectionLabel
                label="Saved Words"
                sub={t('sec_saved_words')}
                action={
                  words.length > 0 ? (
                    <ViewAllLink label="전체 보기" onClick={() => router.push('/library/words')} />
                  ) : undefined
                }
              />
              {words.length === 0 ? (
                <div style={{ padding: '20px 0' }}>
                  <BookOpen style={{ width: 24, height: 24, color: 'var(--pd)', marginBottom: 10 }} strokeWidth={1.5} />
                  <p style={{ fontSize: 13, color: 'var(--pm)', lineHeight: 1.7, margin: 0 }}>
                    아직 저장한 단어가 없어요.<br />
                    Story에서 단어를 길게 누르면 저장할 수 있어요.
                  </p>
                </div>
              ) : (
                words.slice(0, 8).map((w, i) => (
                  <SavedWordRow key={w.id} w={w} border={i > 0} />
                ))
              )}
            </section>
          </>
        )}

      </div>
    </div>
  )
}
