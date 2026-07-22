'use client'

import { useMemo, useRef, useState } from 'react'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { KPATTO_PATTERNS } from '@/data/kpatto/patterns'
import { ALL_STORIES } from '@/data/kpatto/sample-episode'
import {
  getStreak,
  getDueItems,
  getAllRecords,
  getRecord,
  localDateStr,
} from '@/lib/srs/storage'

const T1    = '#111111'
const T2    = '#999999'
const DIV   = '#F2F2F2'
const ACCENT = '#D4873A'
const MAX_VIEWS = 10

// ── helpers ──────────────────────────────────────────────────────────────────
function sectionLabel(text: string) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: T2, textTransform: 'uppercase', padding: '20px 16px 10px' }}>
      {text}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: DIV, margin: '0 16px' }} />
}

function ViewDots({ views }: { views: number }) {
  if (views >= MAX_VIEWS) {
    return <span style={{ fontSize: 12, color: ACCENT, fontWeight: 700 }}>Mastered! 🏆</span>
  }
  if (views === 0) {
    return <span style={{ fontSize: 12, color: T2 }}>Not started yet</span>
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {Array.from({ length: MAX_VIEWS }, (_, i) => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i < views ? ACCENT : '#E0E0E0' }} />
        ))}
      </div>
      <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600 }}>{views}/{MAX_VIEWS}</span>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function KPattoRecordPage() {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const streak        = typeof window !== 'undefined' ? getStreak() : 0
  const allRecords    = typeof window !== 'undefined' ? getAllRecords() : []
  const dueItems      = typeof window !== 'undefined' ? getDueItems() : []

  const learnedPatterns = allRecords.filter(r => r.itemType === 'pattern')
  const learnedEpisodes = allRecords.filter(r => r.itemType === 'story').length

  const nq = query.toLowerCase().trim()

  const patternEpMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const story of ALL_STORIES) {
      for (const tag of story.tags ?? []) {
        map[tag] = story.episode
      }
    }
    return map
  }, [])

  const filteredPatterns = useMemo(() => {
    const learned = new Set(allRecords.filter(r => r.itemType === 'pattern').map(r => r.itemId))
    const base = KPATTO_PATTERNS.filter(p => learned.has(p.id))
    if (!nq) return base
    return base.filter(p =>
      p.korean.toLowerCase().includes(nq) ||
      p.structure?.toLowerCase().includes(nq) ||
      Object.values(p.translations ?? {}).some(t => t?.toLowerCase().includes(nq))
    )
  }, [allRecords, nq])

  const episodeList = ALL_STORIES.map(s => {
    const rec = typeof window !== 'undefined' ? getRecord('story', String(s.episode)) : null
    return { story: s, views: rec?.repeatCount ?? 0, done: !!(rec?.lastPracticedAt) }
  })

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>
      <KPattoHeader />

      {/* ── Summary strip ── */}
      <div style={{ display: 'flex', padding: '20px 16px 0', gap: 0 }}>
        {[
          { label: 'Day Streak', value: streak },
          { label: 'Episodes', value: learnedEpisodes },
          { label: 'Patterns', value: learnedPatterns.length },
        ].map((item, i, arr) => (
          <div key={item.label} style={{
            flex: 1, textAlign: 'center',
            borderRight: i < arr.length - 1 ? `1px solid ${DIV}` : 'none',
            padding: '0 8px',
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: T1, letterSpacing: '-0.03em' }}>{item.value}</div>
            <div style={{ fontSize: 11, color: T2, marginTop: 2 }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: DIV, margin: '20px 0 0' }} />

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

      <div style={{ height: 1, background: DIV, margin: '4px 0 0' }} />

      {/* ── Patterns ── */}
      {sectionLabel('Patterns')}

      {/* Search bar */}
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
          {filteredPatterns.map((p, i) => (
            <div key={p.id}>
              {i > 0 && <Divider />}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T1 }}>{p.korean}</div>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: T2,
                  background: DIV, padding: '2px 8px', borderRadius: 99, letterSpacing: '0.04em',
                }}>
                  {patternEpMap[p.id] ? `EP ${String(patternEpMap[p.id]).padStart(2, '0')}` : p.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 1, background: DIV, margin: '4px 0 0' }} />

      {/* ── Episodes ── */}
      {sectionLabel('Episodes')}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {episodeList.map((item, i) => (
          <div key={item.story.id}>
            {i > 0 && <Divider />}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T1 }}>
                  <span style={{ color: ACCENT, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', marginRight: 6 }}>
                    EP {String(item.story.episode).padStart(2, '0')}
                  </span>
                  {item.story.title}
                </div>
              </div>
              <div style={{ flexShrink: 0, marginLeft: 12 }}>
                <ViewDots views={item.views} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 16 }} />
    </div>
  )
}
