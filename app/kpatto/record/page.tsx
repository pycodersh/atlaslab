'use client'

import { useRef, useState } from 'react'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { KPATTO_PATTERNS } from '@/data/kpatto/patterns'
import { getDueItems, getAllRecords, localDateStr } from '@/lib/srs/storage'
import { getBookmarks } from '@/lib/bookmarks/storage'

const T1     = '#111111'
const T2     = '#999999'
const DIV    = '#F2F2F2'
const ACCENT = '#D4873A'
const TOTAL_PATTERNS = 500

function sectionLabel(text: string) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 16px 10px' }}>
      <div style={{ width: 3, height: 18, borderRadius: 99, background: ACCENT, flexShrink: 0 }} />
      <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.04em', color: T1, textTransform: 'uppercase' }}>
        {text}
      </div>
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: DIV, margin: '0 16px' }} />
}

// ── Donut chart ───────────────────────────────────────────────────────────────
function DonutChart({ mastered, total }: { mastered: number; total: number }) {
  const size = 160
  const strokeWidth = 14
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const progress = total > 0 ? Math.min(mastered / total, 1) : 0
  const dashOffset = circumference * (1 - progress)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 20px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#F0EDE8" strokeWidth={strokeWidth}
          />
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
          <div style={{ fontSize: 22, fontWeight: 800, color: T1, letterSpacing: '-0.02em' }}>
            {mastered} <span style={{ fontSize: 16, fontWeight: 500, color: T2 }}>/ {total}</span>
          </div>
          <div style={{ fontSize: 11, color: T2, marginTop: 2 }}>Patterns Mastered</div>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function KPattoRecordPage() {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const allRecords = typeof window !== 'undefined' ? getAllRecords() : []
  const dueItems   = typeof window !== 'undefined' ? getDueItems() : []
  const bookmarks  = typeof window !== 'undefined' ? getBookmarks() : []

  const masteredCount = allRecords.filter(r => r.itemType === 'pattern').length

  const nq = query.toLowerCase().trim()

  // Bookmarked patterns, filtered by search
  const savedPatternIds = new Set(bookmarks.map(b => b.patternId))
  const savedPatterns = KPATTO_PATTERNS.filter(p => savedPatternIds.has(p.id))
  const filteredPatterns = nq
    ? savedPatterns.filter(p =>
        p.korean.toLowerCase().includes(nq) ||
        p.structure?.toLowerCase().includes(nq)
      )
    : savedPatterns

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>
      <KPattoHeader />

      {/* ── Today's Review ── */}
      {sectionLabel("Today's Review")}
      {dueItems.length === 0 ? (
        <div style={{ padding: '12px 16px 4px', display: 'flex', alignItems: 'center', gap: 12 }}>
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
                {i > 0 && <Divider />}
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

      {/* ── Patterns Mastered donut ── */}
      <DonutChart mastered={masteredCount} total={TOTAL_PATTERNS} />

      <div style={{ height: 1, background: DIV }} />

      {/* ── Patterns (bookmarked) ── */}
      {sectionLabel('Patterns')}

      <div style={{ padding: '0 16px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#F7F7F7', borderRadius: 12, padding: '10px 14px',
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

      {filteredPatterns.length === 0 ? (
        <div style={{ padding: '8px 16px 16px', fontSize: 13, color: T2 }}>
          {nq ? 'No patterns found.' : 'No learned patterns yet.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredPatterns.map((p, i) => {
            const bm = bookmarks.find(b => b.patternId === p.id)
            return (
              <div key={p.id}>
                {i > 0 && <Divider />}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T1 }}>{p.korean}</div>
                    {bm?.meaningKo && (
                      <div style={{ fontSize: 12, color: T2, marginTop: 2 }}>{bm.meaningKo}</div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: T2,
                    background: DIV, padding: '2px 8px', borderRadius: 99, letterSpacing: '0.04em', flexShrink: 0,
                  }}>
                    EP {String(bm?.storyId ?? '').padStart(2, '0')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ height: 16 }} />
    </div>
  )
}
