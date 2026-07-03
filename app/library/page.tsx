'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, BookOpen, ChevronRight, Bookmark } from 'lucide-react'

import { TopNav } from '@/components/TopNav'
import { magazineStories } from '@/data/magazine-stories'
import { getBookmarks, type BookmarkedPattern } from '@/lib/bookmarks/storage'
import type { MagazinePattern } from '@/types/magazine'

// ── Search index entry ────────────────────────────────────────────────────────
type SearchResult = {
  storyId: number
  storyTitle: string
  pattern: MagazinePattern
}

function buildIndex(): SearchResult[] {
  const out: SearchResult[] = []
  for (const story of magazineStories) {
    for (const pattern of story.patterns) {
      out.push({ storyId: story.id, storyTitle: story.title, pattern })
    }
  }
  return out
}

function search(index: SearchResult[], query: string): SearchResult[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return index.filter(({ pattern }) => {
    return (
      pattern.pattern.toLowerCase().includes(q) ||
      pattern.meaningKo.toLowerCase().includes(q) ||
      (pattern.explanation ?? '').toLowerCase().includes(q) ||
      (pattern.examples ?? []).some(ex => ex.en.toLowerCase().includes(q) || ex.ko.toLowerCase().includes(q)) ||
      pattern.storySentence.toLowerCase().includes(q)
    )
  })
}

// ── Section label (same as Progress/Profile) ──────────────────────────────────
function SectionLabel({ label, sub, action }: { label: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <h2 className="font-playfair" style={{
          fontSize: '1.4rem', fontWeight: 900, color: 'var(--pa)',
          margin: 0, letterSpacing: '-0.02em', lineHeight: 1,
        }}>
          {label}
        </h2>
        {action}
      </div>
      {sub && (
        <p style={{ fontSize: 11, color: 'var(--pm)', margin: '7px 0 0', lineHeight: 1.5 }}>
          {sub}
        </p>
      )}
      <div style={{ height: 1, background: 'var(--pd)', marginTop: 14 }} />
    </div>
  )
}

// ── Pattern result row ────────────────────────────────────────────────────────
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

// ── Saved Pattern row ─────────────────────────────────────────────────────────
function SavedRow({ bm, border, onPress }: { bm: BookmarkedPattern; border?: boolean; onPress: () => void }) {
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LibraryPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [bookmarks, setBookmarks] = useState<BookmarkedPattern[]>([])

  useEffect(() => { setBookmarks(getBookmarks()) }, [])

  const index = useMemo(() => buildIndex(), [])
  const results = useMemo(() => search(index, query), [index, query])
  const isSearching = query.trim().length > 0

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
            패턴을 찾고, 저장하고, 다시 만나세요.
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

          {/* ── Search results (inline) ──────────────────────────── */}
          {isSearching && (
            <div style={{ marginTop: 8 }}>
              {results.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--pm)', padding: '16px 0' }}>
                  검색 결과가 없어요.
                </p>
              ) : (
                <>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm2)', margin: '12px 0 0', textTransform: 'uppercase' }}>
                    {results.length} results
                  </p>
                  {results.map((r, i) => (
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
            </div>
          )}
        </div>

        {/* ── Content sections (hidden while searching) ─────────────── */}
        {!isSearching && (
          <>
            {/* ── SAVED PATTERNS ──────────────────────────────────── */}
            <section style={{ marginBottom: 64 }}>
              <SectionLabel
                label="Saved Patterns"
                sub="북마크한 패턴을 모아봤어요."
                action={
                  bookmarks.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => router.push('/records/patterns')}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 2,
                        fontSize: 11, fontWeight: 600, color: 'var(--pa)',
                        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                      }}
                    >
                      전체 보기<ChevronRight style={{ width: 10, height: 10 }} strokeWidth={2.2} />
                    </button>
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
                  <SavedRow
                    key={bm.patternId}
                    bm={bm}
                    border={i > 0}
                    onPress={() => router.push(`/stories/${bm.storyId}?v=p`)}
                  />
                ))
              )}
            </section>

            {/* ── SAVED WORDS (placeholder) ────────────────────────── */}
            <section style={{ marginBottom: 64 }}>
              <SectionLabel label="Saved Words" sub="저장한 단어를 모아봤어요." />
              <div style={{ padding: '20px 0' }}>
                <BookOpen style={{ width: 24, height: 24, color: 'var(--pd)', marginBottom: 10 }} strokeWidth={1.5} />
                <p style={{ fontSize: 13, color: 'var(--pm2)', lineHeight: 1.7, margin: 0 }}>
                  단어 저장 기능은 곧 추가될 예정이에요.
                </p>
              </div>
            </section>

            {/* ── RECENT (placeholder) ─────────────────────────────── */}
            <section>
              <SectionLabel label="Recent" sub="최근 학습한 스토리와 패턴이 여기에 표시돼요." />
              <div style={{ padding: '20px 0' }}>
                <p style={{ fontSize: 13, color: 'var(--pm2)', lineHeight: 1.7, margin: 0 }}>
                  학습 기록이 쌓이면 최근 항목을 보여드릴게요.
                </p>
              </div>
            </section>
          </>
        )}

      </div>
    </div>
  )
}
