'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePreferences } from '@/contexts/PreferencesContext'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { KPATTO_PATTERNS } from '@/data/kpatto/patterns'
import { SAMPLE_VOCABULARY } from '@/data/kpatto/sample-episode'
import { getUI } from '@/lib/kpatto/ui-strings'
import type { KPattoLanguage } from '@/data/kpatto/types'

const T1     = '#111111'
const T2     = '#999999'
const DIV    = '#F2F2F2'
const ACCENT = '#D4873A'

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim()
}

export default function KPattoLibraryPage() {
  const { prefs } = usePreferences()
  const ui   = getUI(prefs.language)
  const lang = (prefs.language ?? 'en') as KPattoLanguage

  const [query, setQuery]     = useState('')
  const [tab, setTab]         = useState<'patterns' | 'vocabulary'>('patterns')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const nq = normalize(query)

  const filteredPatterns = useMemo(() => {
    if (!nq) return KPATTO_PATTERNS
    return KPATTO_PATTERNS.filter(p =>
      normalize(p.korean).includes(nq) ||
      normalize(p.structure).includes(nq) ||
      Object.values(p.translations).some(t => t && normalize(t).includes(nq))
    )
  }, [nq])

  const filteredVocab = useMemo(() => {
    if (!nq) return SAMPLE_VOCABULARY
    return SAMPLE_VOCABULARY.filter(v =>
      normalize(v.korean).includes(nq) ||
      Object.values(v.translations).some(t => t && normalize(t).includes(nq))
    )
  }, [nq])

  const TABS_DATA = [
    { key: 'patterns'  as const, label: ui.lb_patterns,   count: filteredPatterns.length },
    { key: 'vocabulary'as const, label: ui.lb_vocabulary, count: filteredVocab.length },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>

      {/* Header */}
      <div style={{ padding: '52px 20px 16px' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.10em', color: T2, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
          K-PATTO
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: T1, letterSpacing: '-0.03em', marginBottom: 20 }}>
          Library
        </div>

        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#F7F7F7', borderRadius: 10,
          padding: '11px 14px',
          border: focused ? `1px solid ${T1}` : '1px solid transparent',
          transition: 'border-color 0.15s',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search patterns, vocabulary..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 14, color: T1, fontWeight: 400,
            }}
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus() }}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${DIV}` }}>
        {TABS_DATA.map(({ key, label, count }) => {
          const active = tab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              style={{
                flex: 1, background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                padding: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                border: 'none',
                borderBottom: active ? `2px solid ${ACCENT}` : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 800, color: active ? T1 : T2, letterSpacing: '-0.02em' }}>
                {count}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: active ? T1 : T2 }}>
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div>
        {tab === 'patterns' && (
          filteredPatterns.length === 0
            ? <div style={{ textAlign: 'center', padding: '48px 20px', color: T2, fontSize: 14 }}>No patterns found.</div>
            : filteredPatterns.map((pattern, i) => (
              <div key={pattern.id} style={{ padding: '18px 20px', borderBottom: i < filteredPatterns.length - 1 ? `1px solid ${DIV}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: T1 }}>{pattern.korean}</div>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', color: T2, border: `1px solid ${DIV}`, padding: '2px 6px', borderRadius: 4 }}>
                    {pattern.level.toUpperCase().slice(0, 3)}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: T2, marginBottom: 4 }}>{pattern.structure}</div>
                {pattern.translations[lang] && (
                  <div style={{ fontSize: 13, color: T1, fontWeight: 500 }}>{pattern.translations[lang]}</div>
                )}
                {pattern.examples[0] && (
                  <div style={{ marginTop: 10, padding: '10px 12px', background: '#F7F7F7', borderRadius: 8 }}>
                    <div style={{ fontSize: 13, color: T1 }}>{pattern.examples[0].korean}</div>
                    {pattern.examples[0].translations?.[lang] && (
                      <div style={{ fontSize: 12, color: T2, marginTop: 2 }}>{pattern.examples[0].translations[lang]}</div>
                    )}
                  </div>
                )}
              </div>
            ))
        )}

        {tab === 'vocabulary' && (
          filteredVocab.length === 0
            ? <div style={{ textAlign: 'center', padding: '48px 20px', color: T2, fontSize: 14 }}>No vocabulary found.</div>
            : filteredVocab.map((word, i) => (
              <div key={word.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 20px',
                borderBottom: i < filteredVocab.length - 1 ? `1px solid ${DIV}` : 'none',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T1 }}>{word.korean}</div>
                  {word.translations[lang] && (
                    <div style={{ fontSize: 12, color: T2, marginTop: 2 }}>{word.translations[lang]}</div>
                  )}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: T2, letterSpacing: '0.04em' }}>
                  {word.category}
                </span>
              </div>
            ))
        )}
      </div>

      {/* Browse all link */}
      <div style={{ padding: '20px 20px 0' }}>
        <Link
          href={tab === 'patterns' ? '/kpatto/library/patterns' : '/kpatto/library/vocabulary'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '14px', borderRadius: 10,
            border: `1px solid ${T1}`, background: 'transparent',
            color: T1, fontWeight: 600, fontSize: 13, textDecoration: 'none',
          }}
        >
          {tab === 'patterns' ? ui.lb_pattern_browse : ui.lb_vocab_browse}
        </Link>
      </div>

    </div>
  )
}
