'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { ExpressionPopup } from '@/components/kpatto/ExpressionPopup'
import { getSavedFromLocal, getSavedIds, toggleSaved } from '@/lib/kpatto/saved-expressions'
import { fetchAllExpressions } from '@/lib/kpatto/fetch-episode'
import { useKPattoSubscription } from '@/lib/kpatto/subscription'
import { FREE_EPISODES } from '@/lib/kpatto/config'
import { createClient } from '@/lib/supabase/client'
import type { KPattoExpression } from '@/data/kpatto/types'

// ── 토큰 ──────────────────────────────────────────────────────────────────────
const T1      = '#111111'
const T2      = '#888888'
const T3      = '#BBBBBB'
const ACCENT  = '#D4873A'
const BORDER  = '#EBEBEB'
const BG      = '#FFFFFF'
const GREEN   = '#3B6D11'   // 20/20 달성 색

const TOTAL_EXPRESSIONS = 325
const REPEAT_MAX        = 20   // 반복 학습 목표 (미구현 → 현재는 0)
const HEADER_H          = 56   // KPattoHeader sticky height (px)

// ── 유틸 ─────────────────────────────────────────────────────────────────────
function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim()
}

function matchesQuery(expr: KPattoExpression, nq: string): boolean {
  if (!nq) return true
  const n = normalize
  return (
    n(expr.korean).includes(nq)  ||
    n(expr.english).includes(nq) ||
    !!(expr.description && n(expr.description).includes(nq)) ||
    !!(expr.examples?.some(ex => n(ex.ko).includes(nq) || n(ex.en).includes(nq)))
  )
}

function chapterOf(ep: number)    { return Math.ceil(ep / 10) }
function chapterStart(ch: number) { return (ch - 1) * 10 + 1  }
function chapterLabel(ch: number) {
  const s = chapterStart(ch)
  return `${s}–${s + 9}`
}

// ── 타입 ─────────────────────────────────────────────────────────────────────
type EpGroup = {
  epNum:   number
  title:   string
  titleEn: string
  locked:  boolean
  exprs:   KPattoExpression[]
}

// ── 서브 컴포넌트 ─────────────────────────────────────────────────────────────

/** 검색 바 */
function SearchBar({
  value, onChange, inputRef,
}: {
  value: string
  onChange: (v: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: '#F7F7F7',
      borderRadius: 10,
      padding: '10px 12px',
      border: focused ? `1px solid ${T1}` : '1px solid transparent',
      transition: 'border-color 0.15s',
    }}>
      {/* Search icon */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search in English or Korean"
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          fontSize: 14, color: T1,
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(''); (inputRef as React.RefObject<HTMLInputElement>).current?.focus() }}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  )
}

/** 북마크 아이콘 SVG */
function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? ACCENT : 'none'}
      stroke={filled ? ACCENT : T3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

/** 자물쇠 아이콘 SVG */
function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

/** 칩 하나 */
function Chip({
  label, active, onClick, icon,
}: {
  label: string
  active: boolean
  onClick: () => void
  icon?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '5px 11px',
        borderRadius: 20,
        border: active ? 'none' : `0.5px solid ${BORDER}`,
        background: active ? ACCENT : BG,
        color: active ? '#fff' : T2,
        fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

/** 에피소드 그룹 헤더 (sticky) */
function EpGroupHeader({
  epNum, title, titleEn, count, locked,
}: {
  epNum:   number
  title:   string
  titleEn: string
  count:   number
  locked:  boolean
}) {
  const barColor = locked ? T3 : '#BA7517'

  return (
    <div style={{
      position: 'sticky',
      top: 'calc(56px + env(safe-area-inset-top, 0px))',
      zIndex: 10,
      background: '#F5F5F5',
      borderTop:    `0.5px solid ${BORDER}`,
      borderBottom: `0.5px solid ${BORDER}`,
      opacity: locked ? 0.6 : 1,
      display: 'flex',
      alignItems: 'stretch',
    }}>
      {/* 왼쪽 악센트 바 */}
      <div style={{ width: 3, background: barColor, flexShrink: 0 }} />

      {/* 본문 영역 */}
      <div style={{
        flex: 1, minWidth: 0,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        gap: 8,
      }}>
        {/* 왼쪽: EP 번호 + 한/영 제목 */}
        <div style={{ minWidth: 0, flex: 1 }}>
          {/* 1행 */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, overflow: 'hidden' }}>
            <span style={{
              fontSize: 12, fontWeight: 600, color: barColor,
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              EP {String(epNum).padStart(2, '0')}
            </span>
            {title && (
              <>
                <span style={{ fontSize: 12, color: T3, flexShrink: 0 }}>·</span>
                <span style={{
                  fontSize: 13, fontWeight: 500, color: T1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {title}
                </span>
              </>
            )}
          </div>
          {/* 2행: 영어 제목 */}
          {titleEn && (
            <div style={{
              fontSize: 11, color: T2, marginTop: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {titleEn}
            </div>
          )}
        </div>

        {/* 우측: 개수 + 잠금 아이콘 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: T2 }}>{count}</span>
          {locked && <LockIcon />}
        </div>
      </div>
    </div>
  )
}

/** 표현 행 */
function ExprRow({
  expr, locked, saved, onBookmarkClick, onClick,
}: {
  expr:            KPattoExpression
  locked:          boolean
  saved:           boolean
  onBookmarkClick: (e: React.MouseEvent) => void
  onClick:         () => void
}) {
  const repeatCount = 0  // 반복 학습 미구현

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 16px',
        borderBottom: `1px solid ${BORDER}`,
        background: BG,
        opacity: locked ? 0.4 : 1,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {/* 왼쪽: 한국어 + 영어 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 500, color: T1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {expr.korean}
        </div>
        <div style={{
          fontSize: 12, color: T2, marginTop: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {expr.english}
        </div>
      </div>

      {/* 오른쪽: 반복 횟수 + 북마크 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{
          fontSize: 11,
          color: repeatCount >= REPEAT_MAX ? GREEN : T3,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {repeatCount}/{REPEAT_MAX}
        </span>
        <button
          type="button"
          onClick={onBookmarkClick}
          style={{
            background: 'none', border: 'none', padding: 2,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            WebkitTapHighlightColor: 'transparent',
          }}
          aria-label={saved ? '북마크 해제' : '북마크 추가'}
        >
          <BookmarkIcon filled={saved} />
        </button>
      </div>
    </div>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────────────────────
export default function KPattoLibraryPage() {
  const router       = useRouter()
  const { isPro }    = useKPattoSubscription()

  const [expressions, setExpressions] = useState<KPattoExpression[]>([])
  const [epTitles,    setEpTitles]    = useState<Map<number, string>>(new Map())
  const [epTitlesEn,  setEpTitlesEn]  = useState<Map<number, string>>(new Map())
  const [loading,     setLoading]     = useState(true)
  const [query,       setQuery]       = useState('')
  const [showSaved,   setShowSaved]   = useState(false)
  const [savedIds,    setSavedIds]    = useState<Set<number>>(new Set())
  const [popup,       setPopup]       = useState<KPattoExpression | null>(null)

  const epGroupRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const inputRef    = useRef<HTMLInputElement | null>(null)

  // 동기 초기화 (hydration): localStorage에서 즉시 로드
  const refreshSaved = useCallback(() => {
    setSavedIds(getSavedFromLocal())
    // 로그인 여부 무관 — getSavedIds()로 DB 합집합 병합 후 갱신
    getSavedIds().then(ids => setSavedIds(ids)).catch(() => { /* noop */ })
  }, [])

  useEffect(() => {
    refreshSaved()
    const sb = createClient()
    Promise.all([
      fetchAllExpressions(),
      sb.from('kp_episodes').select('episode_num, title, title_en').order('episode_num').then(r => r.data ?? []),
    ]).then(([exprs, eps]) => {
      const epRows = eps as { episode_num: number; title: string; title_en: string | null }[]
      setExpressions(exprs)
      setEpTitles(new Map(epRows.map(e => [e.episode_num, e.title])))
      setEpTitlesEn(new Map(epRows.map(e => [e.episode_num, e.title_en ?? ''])))
      setLoading(false)
    })
  }, [refreshSaved])

  const nq          = normalize(query)
  const isSearching = nq.length > 0

  // ── 에피소드별 그룹 ──────────────────────────────────────────────────────
  const groups = useMemo<EpGroup[]>(() => {
    let src = expressions
    if (showSaved) src = src.filter(e => savedIds.has(e.id))

    const map = new Map<number, KPattoExpression[]>()
    for (const expr of src) {
      const ep  = expr.first_episode ?? 0
      const arr = map.get(ep) ?? []
      arr.push(expr)
      map.set(ep, arr)
    }

    return [...map.entries()]
      .sort(([a], [b]) => a - b)
      .map(([epNum, exprs]) => ({
        epNum,
        title:   epTitles.get(epNum) ?? '',
        titleEn: epTitlesEn.get(epNum) ?? '',
        locked:  epNum > FREE_EPISODES && !isPro,
        exprs,
      }))
  }, [expressions, savedIds, showSaved, epTitles, epTitlesEn, isPro])

  // ── 검색 결과 ────────────────────────────────────────────────────────────
  const searchResults = useMemo(
    () => isSearching ? expressions.filter(e => matchesQuery(e, nq)) : [],
    [expressions, nq, isSearching],
  )

  // ── 표시 건수 ────────────────────────────────────────────────────────────
  const visibleCount = isSearching
    ? searchResults.length
    : showSaved
      ? expressions.filter(e => savedIds.has(e.id)).length
      : expressions.length

  // ── 챕터 점프 ────────────────────────────────────────────────────────────
  const jumpToChapter = (ch: number) => {
    const ep = chapterStart(ch)
    for (let e = ep; e <= ep + 9; e++) {
      const el = epGroupRefs.current[e]
      if (el) {
        // 헤더 실제 높이 동적 읽기 (safe-area-inset-top 포함)
        const headerEl = document.querySelector('[data-kpatto-header]') as HTMLElement | null
        const headerH  = headerEl ? headerEl.getBoundingClientRect().height : HEADER_H
        const top = el.getBoundingClientRect().top + window.scrollY - headerH
        window.scrollTo({ top, behavior: 'smooth' })
        return
      }
    }
  }

  // ── 북마크 토글 (localStorage + DB 합집합) ───────────────────────────────
  const toggleSave = useCallback((e: React.MouseEvent, exprId: number) => {
    e.stopPropagation()
    toggleSaved(exprId).then(({ saved }) => {
      setSavedIds(prev => {
        const next = new Set(prev)
        if (saved) next.add(exprId); else next.delete(exprId)
        return next
      })
    }).catch(() => { /* noop */ })
  }, [])

  // ── 잠긴 행 탭 → 페이월 ─────────────────────────────────────────────────
  const handleRowClick = useCallback((expr: KPattoExpression) => {
    const locked = (expr.first_episode ?? 0) > FREE_EPISODES && !isPro
    if (locked) { router.push('/kpatto/subscription'); return }
    setPopup(expr)
  }, [isPro, router])

  // ── 공통 행 렌더 ─────────────────────────────────────────────────────────
  const renderRow = (expr: KPattoExpression, locked: boolean) => (
    <ExprRow
      key={expr.id}
      expr={expr}
      locked={locked}
      saved={savedIds.has(expr.id)}
      onBookmarkClick={e => {
        if (locked) { router.push('/kpatto/subscription'); return }
        toggleSave(e, expr.id)
      }}
      onClick={() => handleRowClick(expr)}
    />
  )

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingBottom: `calc(${KPATTO_TAB_BAR_HEIGHT + 16}px + env(safe-area-inset-bottom, 0px))` }}>
      <KPattoHeader />

      {/* ── 상단: 건수 + 검색 ──────────────────────────────────────────────── */}
      <div style={{ padding: '12px 16px 0' }}>
        {/* 건수 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: T2 }}>
            <span style={{ fontWeight: 700, color: loading ? T3 : T1 }}>{visibleCount}</span>
            {' '}of {TOTAL_EXPRESSIONS}
          </span>
        </div>
        {/* 검색 */}
        <SearchBar value={query} onChange={setQuery} inputRef={inputRef} />
      </div>

      {/* ── 칩 줄 (검색 중 숨김) ──────────────────────────────────────────── */}
      {!isSearching && (
        <div style={{
          overflowX: 'auto',
          display: 'flex', gap: 6,
          padding: '10px 16px 8px',
          // hide scrollbar: Firefox
          scrollbarWidth: 'none' as const,
        } as React.CSSProperties}>
          {/* Saved 칩 */}
          <Chip
            label="Saved"
            active={showSaved}
            onClick={() => setShowSaved(v => !v)}
            icon={
              <svg width="11" height="11" viewBox="0 0 24 24" fill={showSaved ? '#fff' : 'none'}
                stroke={showSaved ? '#fff' : T2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            }
          />
          {/* 챕터 칩 × 10 */}
          {Array.from({ length: 10 }, (_, i) => i + 1).map(ch => (
            <Chip
              key={ch}
              label={chapterLabel(ch)}
              active={false}
              onClick={() => {
                setShowSaved(false)
                jumpToChapter(ch)
              }}
            />
          ))}
        </div>
      )}

      {/* ── 목록 ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: T2, fontSize: 14 }}>
          Loading…
        </div>
      ) : isSearching ? (
        /* 검색 결과 — 평평하게 */
        searchResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: T2, fontSize: 14 }}>
            No results for &ldquo;{query}&rdquo;
          </div>
        ) : (
          <div>
            {searchResults.map(expr => {
              const locked = (expr.first_episode ?? 0) > FREE_EPISODES && !isPro
              return renderRow(expr, locked)
            })}
          </div>
        )
      ) : (
        /* 에피소드 순 그룹 */
        <div>
          {groups.map(group => (
            <div
              key={group.epNum}
              ref={el => { epGroupRefs.current[group.epNum] = el }}
            >
              <EpGroupHeader
                epNum={group.epNum}
                title={group.title}
                titleEn={group.titleEn}
                count={group.exprs.length}
                locked={group.locked}
              />
              {group.exprs.map(expr => renderRow(expr, group.locked))}
            </div>
          ))}
        </div>
      )}

      {/* 팝업 */}
      {popup && (
        <ExpressionPopup
          expression={popup}
          onClose={() => { setPopup(null); refreshSaved() }}
        />
      )}
    </div>
  )
}
