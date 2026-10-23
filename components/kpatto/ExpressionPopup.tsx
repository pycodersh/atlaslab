'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Square, Volume2 } from 'lucide-react'
import type { KPattoExpression } from '@/data/kpatto/types'
import { tryPlayAudio, stopAllAudio, getAudioGeneration } from '@/lib/kpatto/audio'
import { versionedExpressionAudio } from '@/lib/kpatto/expression-audio'
import { formatPatternTitle } from '@/lib/kpatto/pattern-format'
import { getExpressionNumbering } from '@/lib/kpatto/expression-number'
import { KP } from '@/lib/kpatto/theme'

/** 예문 사이 쉬는 시간(전체 재생) */
const GAP_MS = 800
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

const SAVED_KEY = 'kpatto-saved-expressions'

export function getSavedExpressionIds(): Set<number> {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(SAVED_KEY) : null
    return new Set(raw ? (JSON.parse(raw) as number[]) : [])
  } catch { return new Set() }
}

function persistSavedIds(ids: Set<number>) {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify([...ids])) } catch { /* noop */ }
}

// Strip leading paragraph from description when it duplicates the gloss meaning.
// If gloss is present and there are multiple \n\n-separated paragraphs, skip the first.
function descriptionBody(description: string | null | undefined, gloss: string | null | undefined): string {
  if (!description) return ''
  if (!gloss) return description
  const parts = description.split('\n\n')
  if (parts.length > 1) return parts.slice(1).join('\n\n').trim()
  // Fallback: strip first sentence for single-paragraph descriptions
  const idx = description.indexOf('. ')
  if (idx < 0) return description
  return description.slice(idx + 2).trim()
}

export function ExpressionPopup({
  expression,
  onClose,
  onAudioPlay,
}: {
  expression: KPattoExpression
  onClose: () => void
  /** 음성 재생을 시작할 때 호출 — Listening 판정에 사용 */
  onAudioPlay?: (expressionId: number) => void
}) {
  const [isSaved, setIsSaved] = useState(() => getSavedExpressionIds().has(expression.id))
  // 재생 상태: playAll = 상단 버튼의 전체 재생 중, playingIdx = 지금 소리 나는 예문(0~2)
  const [playAll, setPlayAll] = useState(false)
  const [playingIdx, setPlayingIdx] = useState<number | null>(null)
  const runRef = useRef(0)           // 재생 요청 번호 — 새 요청이 오면 이전 루프는 스스로 빠진다
  const activeRef = useRef(false)    // 팝업이 소리를 내고 있는지(언마운트 정리용)

  // 표현 순번 (#052 / 300)
  const [num, setNum] = useState<{ n: number; total: number } | null>(null)
  useEffect(() => {
    let alive = true
    getExpressionNumbering().then(({ numberOf, total }) => {
      const n = numberOf.get(expression.id)
      if (alive) setNum(n ? { n, total } : null)
    })
    return () => { alive = false }
  }, [expression.id])

  // Sync if expression changes (e.g. opened from library list)
  useEffect(() => {
    setIsSaved(getSavedExpressionIds().has(expression.id))
  }, [expression.id])

  // 재생 중단 (상태 리셋 포함)
  const stopPlayback = useCallback(() => {
    runRef.current++
    if (activeRef.current) stopAllAudio()
    activeRef.current = false
    setPlayAll(false)
    setPlayingIdx(null)
  }, [])

  // 표현 교체 시 재생 중이면 정지
  useEffect(() => { stopPlayback() }, [expression.id, stopPlayback])

  // 팝업 닫힘(언마운트) → 표현 음성 정지
  useEffect(() => () => {
    runRef.current++
    if (activeRef.current) stopAllAudio()
    activeRef.current = false
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // 재생 대상: 예문 ex1~ex3 음성만 (패턴 표제어 단독 발음은 쓰지 않는다)
  const exampleUrls = useMemo(() => {
    const au = expression.audio_urls
    return [au?.ex1, au?.ex2, au?.ex3].map(u => (u ? versionedExpressionAudio(u) : null))
  }, [expression.id, expression.audio_urls])
  const hasAnyExampleAudio = exampleUrls.some(Boolean)

  // 상단 스피커: 예문 1→2→3 을 0.8초 간격으로 이어서 재생 / 재생 중 다시 누르면 정지
  const handlePlayAll = useCallback(async () => {
    if (activeRef.current && playAll) { stopPlayback(); return }
    const urls = exampleUrls
      .map((url, idx) => ({ url, idx }))
      .filter((x): x is { url: string; idx: number } => !!x.url)
    if (!urls.length) return
    const run = ++runRef.current
    stopAllAudio()                      // 대사 루프 정지(동시 재생 금지), generation 증가
    const gen = getAudioGeneration()
    activeRef.current = true
    setPlayAll(true)
    onAudioPlay?.(expression.id)        // Listening 판정
    for (let i = 0; i < urls.length; i++) {
      if (runRef.current !== run || getAudioGeneration() !== gen) return
      setPlayingIdx(urls[i].idx)
      await tryPlayAudio(urls[i].url)
      if (runRef.current !== run || getAudioGeneration() !== gen) return
      setPlayingIdx(null)
      if (i < urls.length - 1) await sleep(GAP_MS)
    }
    if (runRef.current === run) { activeRef.current = false; setPlayAll(false); setPlayingIdx(null) }
  }, [exampleUrls, expression.id, onAudioPlay, playAll, stopPlayback])

  // 예문 카드 탭: 연속 재생을 멈추고 그 문장 하나만 바로 재생
  const handlePlayOne = useCallback(async (idx: number) => {
    const url = exampleUrls[idx]
    if (!url) return
    const run = ++runRef.current
    stopAllAudio()
    const gen = getAudioGeneration()
    activeRef.current = true
    setPlayAll(false)
    setPlayingIdx(idx)
    onAudioPlay?.(expression.id)
    await tryPlayAudio(url)
    if (runRef.current === run && getAudioGeneration() === gen) {
      activeRef.current = false
      setPlayingIdx(null)
    }
  }, [exampleUrls, expression.id, onAudioPlay])

  const handleToggleSave = () => {
    const ids = getSavedExpressionIds()
    if (ids.has(expression.id)) { ids.delete(expression.id) } else { ids.add(expression.id) }
    persistSavedIds(ids)
    setIsSaved(!isSaved)
  }

  return (
    <div
      role="presentation"
      aria-label="Close dialog"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={formatPatternTitle(expression.korean)}
        style={{
          width: '100%', maxWidth: 430, margin: '0 auto',
          background: '#FFFFFF', borderRadius: '20px 20px 0 0',
          maxHeight: '80vh', overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.12)' }} />
        </div>

        {/* Header — orange */}
        <div style={{ background: '#FF5A36', margin: '8px 16px 0', borderRadius: 14, padding: '16px' }}>

          {/* Row 1: EP badge (left) + bookmark icon (right, no circular background) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            {num ? (
              <div style={{
                display: 'inline-flex', alignItems: 'baseline', gap: 4,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 6,
                padding: '2px 8px',
                fontSize: 11,
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '0.06em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {`#${String(num.n).padStart(3, '0')}`}
                <span style={{ fontWeight: 500, opacity: 0.8 }}>{`/ ${num.total}`}</span>
              </div>
            ) : <div />}
            {/* 44×44px touch area via padding+negative-margin; no circular chip */}
            <button
              onClick={handleToggleSave}
              aria-label={isSaved ? 'Remove from saved' : 'Save expression'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#fff', WebkitTapHighlightColor: 'transparent',
                padding: 14, margin: -14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, lineHeight: 0,
              }}
            >
              {isSaved ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              )}
            </button>
          </div>

          {/* Korean title */}
          <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: 4 }}>
            {formatPatternTitle(expression.korean)}
          </div>

          {/* Row 3: English subtitle (left) + 전체 재생 스피커 (right) */}
          {(hasAnyExampleAudio || (expression.english && expression.english !== expression.korean)) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {expression.english && expression.english !== expression.korean ? (
                <div style={{ fontSize: 13, color: '#FFF3F0', fontWeight: 600, flex: 1 }}>
                  {expression.english}
                </div>
              ) : <div />}
              {hasAnyExampleAudio && (
                <button
                  onClick={handlePlayAll}
                  aria-label={playAll ? 'Stop playing examples' : 'Play all examples'}
                  style={{
                    background: playAll ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.18)',
                    border: 'none', cursor: 'pointer',
                    color: '#fff', WebkitTapHighlightColor: 'transparent',
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, lineHeight: 0,
                    transition: 'background 0.15s',
                  }}
                >
                  {playAll ? <Square size={12} fill="currentColor" /> : <Volume2 size={16} />}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px 28px' }}>
          {expression.description && descriptionBody(expression.description, expression.english !== expression.korean ? expression.english : null).split('\n\n').map((para, i) => (
            <p key={i} style={{ fontSize: 14, color: '#444', lineHeight: 1.6, margin: '0 0 10px' }}>
              {para}
            </p>
          ))}

          {expression.structure && (
            <div style={{ marginBottom: 12 }}>
              <span style={{
                display: 'inline-block',
                background: '#FFF3F0', border: '1px solid #FFD6CC', borderRadius: 8,
                padding: '4px 10px', fontSize: 12, color: '#B36A1C', fontWeight: 700,
              }}>
                {expression.structure}
              </span>
            </div>
          )}

          {expression.examples && expression.examples.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
              {expression.examples.slice(0, 3).map((ex, i) => {
                const playable = !!exampleUrls[i]
                const on = playingIdx === i
                return (
                  <div
                    key={i}
                    role={playable ? 'button' : undefined}
                    tabIndex={playable ? 0 : undefined}
                    aria-label={playable ? `Play example ${i + 1}` : undefined}
                    onClick={playable ? () => handlePlayOne(i) : undefined}
                    onKeyDown={playable ? (e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePlayOne(i) } }) : undefined}
                    style={{
                      background: on ? KP.primaryLight : '#F7F7F7',
                      border: `1.5px solid ${on ? KP.primary : 'transparent'}`,
                      borderRadius: 10, padding: '8px 11px',
                      cursor: playable ? 'pointer' : 'default',
                      WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.15s, border-color 0.15s',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{ex.ko}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{ex.en}</div>
                  </div>
                )
              })}
            </div>
          )}

          {expression.tip && (
            <div style={{
              background: '#FFFBF2', border: '1px solid #F0D9A8', borderRadius: 10,
              padding: '9px 12px', marginBottom: 14,
            }}>
              <span style={{ fontSize: 13, color: '#8B6914' }}>💡 {expression.tip}</span>
            </div>
          )}
        </div>

        {/* Buttons removed — close via overlay tap or Esc */}
      </div>
    </div>
  )
}
