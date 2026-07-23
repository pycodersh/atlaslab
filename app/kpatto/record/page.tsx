'use client'

import { useEffect, useRef, useState } from 'react'
import { Bookmark, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { KPATTO_PATTERNS } from '@/data/kpatto/patterns'
import { getDueItems, getAllRecords, localDateStr } from '@/lib/srs/storage'
import { getSavedPatterns, unsavePattern, type SavedPattern } from '@/lib/kpatto/savedPatterns'
import { useAuth } from '@/contexts/AuthContext'

const T1     = '#111111'
const T2     = '#999999'
const DIV    = '#F0EDE8'
const ACCENT = '#D4873A'
const BORDER = '#E8E4DF'
const TOTAL_PATTERNS = 500

const CARD: React.CSSProperties = {
  margin: '0 16px',
  background: '#FFFFFF',
  border: `1px solid ${BORDER}`,
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 16px 10px' }}>

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: T2, textTransform: 'uppercase' }}>
        {text}
      </div>
    </div>
  )
}

function RowDivider() {
  return <div style={{ height: 1, background: DIV, margin: '0 16px' }} />
}

function DonutChart({ mastered, total }: { mastered: number; total: number }) {
  const size = 160
  const strokeWidth = 14
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const progress = total > 0 ? Math.min(mastered / total, 1) : 0
  const dashOffset = circumference * (1 - progress)
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0 24px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0EDE8" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={ACCENT} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: T1, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {mastered} <span style={{ fontSize: 14, fontWeight: 500, color: T2 }}>/ {total}</span>
          </div>
          <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, marginTop: 4 }}>{pct}%</div>
        </div>
      </div>
    </div>
  )
}

export default function KPattoRecordPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [savedPatterns, setSavedPatterns] = useState<SavedPattern[]>([])
  const [bookmarksExpanded, setBookmarksExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const allRecords = typeof window !== 'undefined' ? getAllRecords() : []
  const dueItems   = typeof window !== 'undefined' ? getDueItems() : []
  const kpattoIds = new Set(KPATTO_PATTERNS.map(p => p.id))
  const masteredCount = allRecords.filter(r => r.itemType === 'pattern' && kpattoIds.has(r.itemId)).length

  useEffect(() => {
    if (user) {
      getSavedPatterns().then(setSavedPatterns)
    } else {
      setSavedPatterns([])
    }
  }, [user])

  const nq = query.toLowerCase().trim()

  const filteredSaved = savedPatterns
    .map(s => {
      const pattern = KPATTO_PATTERNS.find(p => p.id === s.pattern_id)
      return pattern ? { saved: s, pattern } : null
    })
    .filter((x): x is { saved: SavedPattern; pattern: typeof KPATTO_PATTERNS[0] } => !!x)
    .filter(({ pattern }) =>
      !nq ||
      pattern.korean.toLowerCase().includes(nq) ||
      pattern.structure?.toLowerCase().includes(nq)
    )

  const handleUnsave = async (patternId: string) => {
    await unsavePattern(patternId)
    setSavedPatterns(prev => prev.filter(s => s.pattern_id !== patternId))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>
      <KPattoHeader />

      {/* ── TODAY'S REVIEW ── */}
      <SectionLabel text="Today's Review" />
      <div style={CARD}>
        {dueItems.length === 0 ? (
          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🎉</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T1 }}>All caught up!</div>
              <div style={{ fontSize: 12, color: T2 }}>No reviews due today</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {dueItems.map((item, i) => {
              const pattern = KPATTO_PATTERNS.find(p => p.id === item.itemId)
              if (!pattern) return null
              const lastDate = item.lastPracticedAt ? localDateStr(new Date(item.lastPracticedAt)) : '—'
              return (
                <div key={item.itemId}>
                  {i > 0 && <RowDivider />}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: T1 }}>{pattern.korean}</div>
                      <div style={{ fontSize: 11, color: T2, marginTop: 2 }}>Last studied {lastDate}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT, flexShrink: 0, marginLeft: 12 }}>Review</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── PATTERNS MASTERED ── */}
      <SectionLabel text="Patterns Mastered" />
      <div style={CARD}>
        <DonutChart mastered={masteredCount} total={TOTAL_PATTERNS} />
      </div>

      {/* ── SEARCH & SAVE ── */}
      <SectionLabel text="Search & Save" />
      <div style={CARD}>
        {/* Search bar */}
        <div style={{ padding: '12px 16px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#F7F7F7', borderRadius: 10, padding: '9px 12px',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search patterns..."
              style={{ flex: 1, border: 'none', background: 'none', fontSize: 14, color: T1, outline: 'none' }}
            />
          </div>
        </div>

        {/* Pattern list */}
        {!user ? (
          <div style={{ padding: '14px 16px', fontSize: 13, color: T2 }}>
            Sign in to save patterns.
          </div>
        ) : filteredSaved.length === 0 ? (
          <div style={{ padding: '14px 16px', fontSize: 13, color: T2 }}>
            {nq ? 'No patterns found.' : '저장한 패턴이 없어요. 패턴카드의 🔖를 눌러보세요!'}
          </div>
        ) : (() => {
          const LIMIT = 3
          const visible = bookmarksExpanded ? filteredSaved : filteredSaved.slice(0, LIMIT)
          const hiddenCount = filteredSaved.length - LIMIT
          return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {visible.map(({ saved, pattern }, i) => {
                const epNum = parseInt(saved.episode_id.replace(/\D/g, ''), 10)
                const href = `/kpatto/story/${saved.episode_id}?pattern=${saved.pattern_id}`
                return (
                  <div key={saved.pattern_id}>
                    {i > 0 && <RowDivider />}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                      <Link href={href} style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: T1 }}>{pattern.korean}</div>
                        {pattern.structure && (
                          <div style={{ fontSize: 12, color: T2, marginTop: 2 }}>{pattern.structure}</div>
                        )}
                      </Link>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#16A34A',
                        background: '#EEF8EC', border: '1px solid #C9EAC4',
                        padding: '2px 8px', borderRadius: 99,
                        letterSpacing: '0.04em', flexShrink: 0,
                      }}>
                        {`EP${String(epNum).padStart(2, '0')}`}
                      </span>
                      <button
                        onClick={() => handleUnsave(saved.pattern_id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                      >
                        <Bookmark size={15} color={ACCENT} fill={ACCENT} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                )
              })}
              {filteredSaved.length > LIMIT && (
                <>
                  <RowDivider />
                  <button
                    onClick={() => setBookmarksExpanded(v => !v)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, color: T2, width: '100%',
                    }}
                  >
                    {bookmarksExpanded
                      ? <><ChevronUp size={14} strokeWidth={2} /> 접기</>
                      : <><ChevronDown size={14} strokeWidth={2} /> {hiddenCount}개 더 보기</>
                    }
                  </button>
                </>
              )}
            </div>
          )
        })()}
      </div>

      <div style={{ height: 16 }} />
    </div>
  )
}
