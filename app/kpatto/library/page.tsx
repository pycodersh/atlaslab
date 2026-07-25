'use client'

import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { usePreferences } from '@/contexts/PreferencesContext'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { SAMPLE_VOCABULARY } from '@/data/kpatto/sample-episode'
import { getUI } from '@/lib/kpatto/ui-strings'
import { fetchAllExpressions } from '@/lib/kpatto/fetch-episode'
import { ExpressionPopup, getSavedExpressionIds } from '@/components/kpatto/ExpressionPopup'
import type { KPattoLanguage, KPattoExpression } from '@/data/kpatto/types'

const T1     = '#111111'
const T2     = '#999999'
const DIV    = '#F2F2F2'
const ACCENT = '#D4873A'

const CATEGORIES = ['요청', '질문', '감정', '가능', '희망', '경험', '확인', '자기소개', '기타'] as const

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim()
}

export default function KPattoLibraryPage() {
  const { prefs } = usePreferences()
  const ui   = getUI(prefs.language)
  const lang = (prefs.language ?? 'en') as KPattoLanguage

  const [query, setQuery]       = useState('')
  const [tab, setTab]           = useState<'expressions' | 'vocabulary'>('expressions')
  const [focused, setFocused]   = useState(false)
  const [category, setCategory] = useState<string>('전체')
  const [showSaved, setShowSaved] = useState(false)
  const [expressions, setExpressions] = useState<KPattoExpression[]>([])
  const [exprLoading, setExprLoading] = useState(true)
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set())
  const [popup, setPopup]       = useState<KPattoExpression | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const refreshSaved = useCallback(() => setSavedIds(getSavedExpressionIds()), [])

  useEffect(() => {
    refreshSaved()
    fetchAllExpressions().then(data => {
      setExpressions(data)
      setExprLoading(false)
    })
  }, [refreshSaved])

  const nq = normalize(query)

  const filteredExpressions = useMemo(() => {
    let list = expressions
    if (showSaved) list = list.filter(e => savedIds.has(e.id))
    if (category !== '전체') list = list.filter(e => e.category === category)
    if (nq) list = list.filter(e =>
      normalize(e.korean).includes(nq) ||
      normalize(e.english).includes(nq) ||
      (e.description && normalize(e.description).includes(nq))
    )
    return list
  }, [expressions, nq, category, showSaved, savedIds])

  const filteredVocab = useMemo(() => {
    if (!nq) return SAMPLE_VOCABULARY
    return SAMPLE_VOCABULARY.filter(v =>
      normalize(v.korean).includes(nq) ||
      Object.values(v.translations).some(t => t && normalize(t).includes(nq))
    )
  }, [nq])

  const TABS_DATA = [
    { key: 'expressions' as const, label: '표현 사전', count: filteredExpressions.length },
    { key: 'vocabulary'  as const, label: ui.lb_vocabulary, count: filteredVocab.length },
  ]

  const handlePopupClose = () => {
    setPopup(null)
    refreshSaved()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>
      <KPattoHeader />

      {/* Page title */}
      <div style={{ padding: '20px 20px 0' }}>
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
            placeholder="Search expressions, vocabulary..."
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

      {/* Expressions tab filters */}
      {tab === 'expressions' && (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', padding: '10px 20px', borderBottom: `1px solid ${DIV}`, display: 'flex', gap: 6 } as React.CSSProperties}>
          {/* Saved toggle */}
          <button
            type="button"
            onClick={() => setShowSaved(v => !v)}
            style={{
              flexShrink: 0, padding: '5px 12px', borderRadius: 20,
              border: showSaved ? `1.5px solid ${ACCENT}` : `1px solid ${DIV}`,
              background: showSaved ? '#FFF4EA' : '#fff',
              color: showSaved ? ACCENT : T2,
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            {showSaved ? '저장됨 ✓' : '저장한 것'}
          </button>

          {/* Category divider */}
          <div style={{ width: 1, background: DIV, flexShrink: 0, alignSelf: 'stretch' }} />

          {/* Category chips */}
          {['전체', ...CATEGORIES].map(cat => {
            const active = category === cat && !showSaved
            return (
              <button
                key={cat}
                type="button"
                onClick={() => { setCategory(cat); setShowSaved(false) }}
                style={{
                  flexShrink: 0, padding: '5px 12px', borderRadius: 20,
                  border: active ? `1.5px solid ${T1}` : `1px solid ${DIV}`,
                  background: active ? T1 : '#fff',
                  color: active ? '#fff' : T2,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>
      )}

      {/* Content */}
      <div>
        {tab === 'expressions' && (
          exprLoading ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: T2, fontSize: 14 }}>Loading...</div>
          ) : filteredExpressions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: T2, fontSize: 14 }}>No expressions found.</div>
          ) : filteredExpressions.map((expr, i) => (
            <button
              key={expr.id}
              type="button"
              onClick={() => setPopup(expr)}
              style={{
                width: '100%', textAlign: 'left',
                padding: '16px 20px',
                borderBottom: i < filteredExpressions.length - 1 ? `1px solid ${DIV}` : 'none',
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                display: 'block',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: ACCENT }}>{expr.korean}</div>
                {expr.category && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: T2, letterSpacing: '0.06em', border: `1px solid ${DIV}`, padding: '2px 6px', borderRadius: 4 }}>
                    {expr.category}
                  </span>
                )}
                {savedIds.has(expr.id) && (
                  <span style={{ fontSize: 10, color: ACCENT, fontWeight: 700 }}>✓</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: T1, fontWeight: 500, marginBottom: 2 }}>{expr.english}</div>
              {expr.examples && expr.examples[0] && (
                <div style={{ fontSize: 12, color: T2 }}>{expr.examples[0].ko}</div>
              )}
            </button>
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

      {/* Expression popup */}
      {popup && (
        <ExpressionPopup expression={popup} onClose={handlePopupClose} />
      )}
    </div>
  )
}
