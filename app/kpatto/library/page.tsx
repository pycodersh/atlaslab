'use client'

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { ExpressionPopup } from '@/components/kpatto/ExpressionPopup'
import { getSavedFromLocal, getSavedIds, toggleSaved } from '@/lib/kpatto/saved-expressions'
import { fetchAllExpressions } from '@/lib/kpatto/fetch-episode'
import { createClient } from '@/lib/supabase/client'
import type { KPattoExpression } from '@/data/kpatto/types'
import { Check, ChevronRight, Volume2 } from 'lucide-react'

import { KP } from '@/lib/kpatto/theme'
import { episodeEmoji } from '@/lib/kpatto/episode-emoji'
import { tryPlayAudio, stopAllAudio } from '@/lib/kpatto/audio'
import { versionedExpressionAudio } from '@/lib/kpatto/expression-audio'
// ── 토큰 ──────────────────────────────────────────────────────────────────────
const T1     = '#111111'
const T2     = '#888888'
const T3     = '#BBBBBB'
const ACCENT = KP.primary
const BORDER = '#F3F4F6'   // gray-100 — 목록 구분선
const GRAY500 = '#6B7280'  // gray-500 — 영문 뜻·비활성 칩 글자
const PEACH  = '#FFF5F2'   // EP 헤더 카드 살구 틴트
const SKY    = '#EEF6FF'   // EP 헤더 카드 블루 틴트
const BG     = '#FFFFFF'

// 검색창과 동일한 좌우 여백 (padding: '12px 16px 0' 의 16에서 가져옴)
const SIDE_PAD = 16

const TOTAL_EXPRESSIONS = 300  // 활성(is_active) 패턴 수

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

/** 칩 하나 — 캡슐 모양. 활성: 코랄 배경 + 흰 글자 + 왼쪽 아이콘 / 비활성: 연회색 배경 + gray-500 글자 */
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
      aria-pressed={active}
      style={{
        flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '7px 14px',
        borderRadius: 9999,
        background: active ? ACCENT : '#F3F4F6',
        border: 'none',
        color: active ? '#FFFFFF' : GRAY500,
        fontSize: 13, fontWeight: active ? 700 : 500,
        cursor: 'pointer', fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        WebkitTapHighlightColor: 'transparent',
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

/** 에피소드 그룹 헤더 (sticky) — 살구/블루 틴트를 번갈아 쓰는 카드 + 상황 이모지 + 우측 꺾쇠 */
function EpGroupHeader({
  epNum, title, titleEn, locked, tint,
}: {
  epNum:   number
  title:   string
  titleEn: string
  locked:  boolean
  tint:    'peach' | 'sky'
}) {
  return (
    <div style={{
      position: 'sticky',
      top: 'calc(56px + env(safe-area-inset-top, 0px))',
      zIndex: 10,
      background: BG,
      padding: `6px ${SIDE_PAD}px`,
      opacity: locked ? 0.6 : 1,
    }}>
      <div style={{
        background: tint === 'peach' ? PEACH : SKY,
        borderRadius: 12,
        padding: `10px ${SIDE_PAD - 4}px 10px 10px`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {/* 상황 이모지 */}
        <div aria-hidden style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: 'rgba(255,255,255,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 19, lineHeight: 1,
        }}>
          {episodeEmoji(epNum, title)}
        </div>

        {/* EP 번호 + 한/영 제목 */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, overflow: 'hidden' }}>
            <span style={{
              fontSize: 12, fontWeight: 800, color: ACCENT,
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              EP {String(epNum).padStart(2, '0')}
            </span>
            {title && (
              <>
                <span style={{ fontSize: 12, color: T3, flexShrink: 0 }}>·</span>
                <span style={{
                  fontSize: 14, fontWeight: 600, color: T1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {title}
                </span>
              </>
            )}
          </div>
          {titleEn && (
            <div style={{
              fontSize: 11, color: GRAY500, marginTop: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {titleEn}
            </div>
          )}
        </div>

        {locked && <LockIcon />}
        {/* 섹션 구분용 꺾쇠(장식) */}
        <ChevronRight size={18} color="#C4C4C4" strokeWidth={2.2} aria-hidden style={{ flexShrink: 0 }} />
      </div>
    </div>
  )
}

/** 패턴 표기의 물결표(~)만 코랄로 */
function PatternText({ text }: { text: string }) {
  const parts = text.split('~')
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <span style={{ color: ACCENT, fontWeight: 700 }}>~</span>}
          {part}
        </Fragment>
      ))}
    </>
  )
}

/** 표현 행 — 구분선은 별도 인셋 div(ExprSep)로 renderRow 에서 그린다 */
function ExprRow({
  expr, locked, saved, playing, onPlayClick, onBookmarkClick, onClick,
}: {
  expr:            KPattoExpression
  locked:          boolean
  saved:           boolean
  playing:         boolean
  onPlayClick:     (e: React.MouseEvent) => void
  onBookmarkClick: (e: React.MouseEvent) => void
  onClick:         () => void
}) {
  const hasAudio = !!(expr.audio_urls?.pattern ?? expr.audio_url)
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: `12px ${SIDE_PAD}px`,
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
      {/* 왼쪽: 한국어 패턴 + 영문 뜻 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 16, fontWeight: 600, color: T1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          <PatternText text={expr.korean} />
        </div>
        <div style={{
          fontSize: 11, color: GRAY500, marginTop: 3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {expr.english}
        </div>
      </div>

      {/* 오른쪽: 대표 발음 재생 + 북마크 */}
      {hasAudio && (
        <button
          type="button"
          onClick={onPlayClick}
          style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            border: 'none', padding: 0, cursor: 'pointer',
            background: playing ? ACCENT : KP.primaryLight,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
            transition: 'background 0.15s',
          }}
          aria-label={playing ? 'Stop pronunciation' : 'Play pronunciation'}
        >
          <Volume2 size={15} strokeWidth={2.2} color={playing ? '#FFFFFF' : ACCENT} />
        </button>
      )}
      <button
        type="button"
        onClick={onBookmarkClick}
        style={{
          background: 'none', border: 'none', padding: 4, flexShrink: 0,
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          WebkitTapHighlightColor: 'transparent',
        }}
        aria-label={saved ? 'Remove bookmark' : 'Add bookmark'}
      >
        <BookmarkIcon filled={saved} />
      </button>
    </div>
  )
}

/** 인셋 구분선 — SIDE_PAD 여백 안에서 시작·종료 */
function ExprSep() {
  return <div style={{ borderBottom: `1px solid ${BORDER}`, margin: `0 ${SIDE_PAD}px` }} />
}

// ── 메인 페이지 ───────────────────────────────────────────────────────────────
export default function KPattoLibraryPage() {
  const [expressions,      setExpressions]      = useState<KPattoExpression[]>([])
  const [epTitles,         setEpTitles]         = useState<Map<number, string>>(new Map())
  const [epTitlesEn,       setEpTitlesEn]       = useState<Map<number, string>>(new Map())
  const [loading,          setLoading]          = useState(true)
  const [query,            setQuery]            = useState('')
  const [showSaved,        setShowSaved]        = useState(false)
  const [selectedChapter,  setSelectedChapter]  = useState<number | null>(null)
  const [savedIds,         setSavedIds]         = useState<Set<number>>(new Set())
  const [popup,            setPopup]            = useState<KPattoExpression | null>(null)
  const [playingId,        setPlayingId]        = useState<number | null>(null)

  const inputRef    = useRef<HTMLInputElement | null>(null)
  const tabScrollRef = useRef<HTMLDivElement | null>(null)

  // 칩 줄 스크롤 힌트 상태
  const [tabCanScrollLeft,  setTabCanScrollLeft]  = useState(false)
  const [tabCanScrollRight, setTabCanScrollRight] = useState(true)

  // 동기 초기화 (hydration): localStorage에서 즉시 로드
  const refreshSaved = useCallback(() => {
    setSavedIds(getSavedFromLocal())
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

  // 칩 줄 스크롤 위치에 따라 힌트 표시 여부 갱신
  const handleTabScroll = useCallback(() => {
    const el = tabScrollRef.current
    if (!el) return
    setTabCanScrollLeft(el.scrollLeft > 4)
    setTabCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  // 초기 렌더 후 스크롤 가능 여부 체크
  useEffect(() => {
    const id = requestAnimationFrame(handleTabScroll)
    return () => cancelAnimationFrame(id)
  }, [handleTabScroll])

  // 칩 줄 한 화면씩 스크롤
  const scrollTabs = useCallback((dir: 'left' | 'right') => {
    const el = tabScrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'right' ? el.clientWidth * 0.75 : -el.clientWidth * 0.75, behavior: 'smooth' })
  }, [])

  const nq          = normalize(query)
  const isSearching = nq.length > 0

  // ── 에피소드별 그룹 ──────────────────────────────────────────────────────
  const groups = useMemo<EpGroup[]>(() => {
    let src = expressions
    if (showSaved) src = src.filter(e => savedIds.has(e.id))
    if (selectedChapter !== null) {
      const s = chapterStart(selectedChapter)
      src = src.filter(e => {
        const ep = e.first_episode ?? 0
        return ep >= s && ep <= s + 9
      })
    }

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
        locked:  false,
        exprs,
      }))
  }, [expressions, savedIds, showSaved, selectedChapter, epTitles, epTitlesEn])

  // ── 검색 결과 ────────────────────────────────────────────────────────────
  const searchResults = useMemo(
    () => isSearching ? expressions.filter(e => matchesQuery(e, nq)) : [],
    [expressions, nq, isSearching],
  )

  // ── 표시 건수 ────────────────────────────────────────────────────────────
  const visibleCount = isSearching
    ? searchResults.length
    : groups.reduce((sum, g) => sum + g.exprs.length, 0)

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

  // ── 패턴 대표 발음 재생 (다시 누르면 정지) ──────────────────────────────
  const playPattern = useCallback(async (e: React.MouseEvent, expr: KPattoExpression) => {
    e.stopPropagation()
    const url = expr.audio_urls?.pattern ?? expr.audio_url
    if (!url) return
    if (playingId === expr.id) { stopAllAudio(); setPlayingId(null); return }
    stopAllAudio()
    setPlayingId(expr.id)
    try { await tryPlayAudio(versionedExpressionAudio(url)) } finally {
      setPlayingId(prev => (prev === expr.id ? null : prev))
    }
  }, [playingId])

  // ── 행 탭 → 팝업 ────────────────────────────────────────────────────────
  const handleRowClick = useCallback((expr: KPattoExpression) => {
    setPopup(expr)
  }, [])

  // ── 공통 행 렌더 — Fragment로 행 + 인셋 구분선 묶음 ─────────────────────
  const renderRow = (expr: KPattoExpression, locked: boolean) => (
    <Fragment key={expr.id}>
      <ExprRow
        expr={expr}
        locked={locked}
        saved={savedIds.has(expr.id)}
        playing={playingId === expr.id}
        onPlayClick={e => playPattern(e, expr)}
        onBookmarkClick={e => toggleSave(e, expr.id)}
        onClick={() => handleRowClick(expr)}
      />
      <ExprSep />
    </Fragment>
  )

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingBottom: `calc(${KPATTO_TAB_BAR_HEIGHT + 16}px + env(safe-area-inset-bottom, 0px))` }}>
      <KPattoHeader />

      {/* ── 상단: 건수 + 검색 (SIDE_PAD 여백) ────────────────────────────── */}
      <div style={{ padding: `12px ${SIDE_PAD}px 0` }}>
        {/* 건수 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: T2 }}>
            <span style={{ fontWeight: 700, color: loading ? T3 : T1 }}>0</span>
            {' '}of {loading ? '…' : visibleCount}
          </span>
        </div>
        {/* 검색 */}
        <SearchBar value={query} onChange={setQuery} inputRef={inputRef} />
      </div>

      {/* ── 칩 줄 (검색 중 숨김) ——————————————————————————————————————————
           · 첫/마지막 칩에 SIDE_PAD 여백: paddingLeft + trailing spacer
           · 우측/좌측 그라데이션 힌트 + 클릭 가능 chevron
      ───────────────────────────────────────────────────────────────────── */}
      {!isSearching && (
        <div style={{ position: 'relative' }}>
          {/* ← 왼쪽 힌트 (왼쪽으로 스크롤 가능할 때) */}
          {tabCanScrollLeft && (
            <button
              type="button"
              onClick={() => scrollTabs('left')}
              style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 44,
                background: `linear-gradient(to right, ${BG} 55%, transparent)`,
                zIndex: 2, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', paddingLeft: 4,
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-label="Scroll filters left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={T2} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          )}

          {/* 스크롤 컨테이너 */}
          <div
            ref={tabScrollRef}
            onScroll={handleTabScroll}
            style={{
              overflowX: 'auto',
              display: 'flex', gap: 8,
              // paddingLeft만 설정; padding-right는 overflow 시 씹히므로 trailing spacer 사용
              padding: `12px 0 10px ${SIDE_PAD}px`,
              scrollbarWidth: 'none' as const,
            } as React.CSSProperties}
          >
            {/* Saved 칩 */}
            <Chip
              label="Saved"
              active={showSaved}
              onClick={() => {
                setShowSaved(v => !v)
                setSelectedChapter(null)
              }}
              icon={
                <svg width="13" height="13" viewBox="0 0 24 24"
                  fill={showSaved ? '#FFFFFF' : 'none'}
                  stroke={showSaved ? '#FFFFFF' : GRAY500}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              }
            />
            {/* 챕터 칩 × 10 */}
            {Array.from({ length: 10 }, (_, i) => i + 1).map(ch => (
              <Chip
                key={ch}
                label={chapterLabel(ch)}
                active={selectedChapter === ch}
                icon={selectedChapter === ch ? <Check size={13} strokeWidth={3} color="#FFFFFF" /> : undefined}
                onClick={() => {
                  setShowSaved(false)
                  setSelectedChapter(prev => prev === ch ? null : ch)
                }}
              />
            ))}
            {/* 오른쪽 여백 확보 spacer (overflow-x에서 padding-right가 씹히는 문제 대응) */}
            <div style={{ minWidth: SIDE_PAD, flexShrink: 0 }} aria-hidden />
          </div>

          {/* → 오른쪽 힌트 (오른쪽으로 스크롤 가능할 때) */}
          {tabCanScrollRight && (
            <button
              type="button"
              onClick={() => scrollTabs('right')}
              style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: 44,
                background: `linear-gradient(to left, ${BG} 55%, transparent)`,
                zIndex: 2, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                paddingRight: 4,
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-label="Scroll filters right"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={T2} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          )}
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
          <div style={{ textAlign: 'center', padding: `48px ${SIDE_PAD}px`, color: T2, fontSize: 14 }}>
            No results for &ldquo;{query}&rdquo;
          </div>
        ) : (
          <div>
            {searchResults.map(expr => renderRow(expr, false))}
          </div>
        )
      ) : (
        /* 에피소드 순 그룹 */
        <div>
          {groups.map((group, gi) => (
            <div key={group.epNum}>
              <EpGroupHeader
                epNum={group.epNum}
                title={group.title}
                titleEn={group.titleEn}
                locked={group.locked}
                tint={gi % 2 === 0 ? 'peach' : 'sky'}
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
