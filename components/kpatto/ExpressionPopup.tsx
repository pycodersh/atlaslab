'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Volume2 } from 'lucide-react'
import type { KPattoExpression } from '@/data/kpatto/types'
import { tryPlayAudio, stopAllAudio } from '@/lib/kpatto/audio'

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
}: {
  expression: KPattoExpression
  onClose: () => void
}) {
  const [isSaved, setIsSaved] = useState(() => getSavedExpressionIds().has(expression.id))
  const [exprPlaying, setExprPlaying] = useState(false)
  const exprPlayingRef = useRef(false)  // 연타 가드

  // Sync if expression changes (e.g. opened from library list)
  useEffect(() => {
    setIsSaved(getSavedExpressionIds().has(expression.id))
  }, [expression.id])

  // 표현 교체 시 재생 중이면 정지 + 상태 리셋
  useEffect(() => {
    if (exprPlayingRef.current) {
      exprPlayingRef.current = false
      setExprPlaying(false)
      stopAllAudio()
    }
  }, [expression.id])

  // 팝업 닫힘(언마운트) → 표현 음성 정지
  useEffect(() => {
    return () => {
      if (exprPlayingRef.current) {
        stopAllAudio()
        exprPlayingRef.current = false
      }
    }
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // 팝업 스피커 버튼: 재생/정지 토글
  const handleExprAudio = useCallback(async () => {
    if (exprPlayingRef.current) {
      // 재클릭 → 정지
      exprPlayingRef.current = false
      setExprPlaying(false)
      stopAllAudio()
      return
    }
    if (!expression.audio_url) return
    // 연타 가드: ref 즉시 세우기
    exprPlayingRef.current = true
    setExprPlaying(true)
    stopAllAudio()  // 대사 루프 정지 (동시 재생 금지)
    await tryPlayAudio(expression.audio_url)
    // 자연 완료 또는 외부 정지
    exprPlayingRef.current = false
    setExprPlaying(false)
  }, [expression.audio_url])

  const handleToggleSave = () => {
    const ids = getSavedExpressionIds()
    if (ids.has(expression.id)) { ids.delete(expression.id) } else { ids.add(expression.id) }
    persistSavedIds(ids)
    setIsSaved(!isSaved)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
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
        <div style={{ background: '#D4873A', margin: '8px 16px 0', borderRadius: 14, padding: '16px', position: 'relative' }}>
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{
              position: 'absolute', top: 10, right: 10,
              background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%',
              width: 28, height: 28, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 18, lineHeight: 1, fontFamily: 'inherit',
            }}
          >
            ×
          </button>
          {expression.category && (
            <div style={{
              display: 'inline-block', fontSize: 10, fontWeight: 700,
              color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em',
              textTransform: 'uppercase', marginBottom: 6,
              background: 'rgba(0,0,0,0.15)', borderRadius: 4, padding: '2px 7px',
            }}>
              {expression.category}
            </div>
          )}
          <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: 4, paddingRight: 32 }}>
            {expression.korean}
          </div>
          {expression.audio_url && (
            <button
              onClick={handleExprAudio}
              aria-label={exprPlaying ? '표현 음성 정지' : '표현 듣기'}
              style={{
                position: 'absolute', bottom: 12, right: 10,
                background: exprPlaying ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.2)',
                border: 'none', borderRadius: '50%',
                width: 30, height: 30, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
                transition: 'background 0.15s',
              }}
            >
              <Volume2 size={15} />
            </button>
          )}
          {expression.english && expression.english !== expression.korean && (
            <div style={{ fontSize: 13, color: '#FFF0DC', fontWeight: 600 }}>
              {expression.english}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px 0' }}>
          {expression.description && descriptionBody(expression.description, expression.english !== expression.korean ? expression.english : null).split('\n\n').map((para, i) => (
            <p key={i} style={{ fontSize: 14, color: '#444', lineHeight: 1.6, margin: '0 0 10px' }}>
              {para}
            </p>
          ))}

          {expression.structure && (
            <div style={{ marginBottom: 12 }}>
              <span style={{
                display: 'inline-block',
                background: '#FFF4EA', border: '1px solid #F0C89A', borderRadius: 8,
                padding: '4px 10px', fontSize: 12, color: '#B36A1C', fontWeight: 700,
              }}>
                {expression.structure}
              </span>
            </div>
          )}

          {expression.examples && expression.examples.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
              {expression.examples.slice(0, 3).map((ex, i) => (
                <div key={i} style={{ background: '#F7F7F7', borderRadius: 10, padding: '9px 12px' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{ex.ko}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{ex.en}</div>
                </div>
              ))}
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

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 28px' }}>
          <button
            onClick={handleToggleSave}
            style={{
              flex: 1, padding: '12px', borderRadius: 12,
              border: '1.5px solid ' + (isSaved ? '#D4873A' : '#E0E0E0'),
              background: isSaved ? '#FFF4EA' : 'transparent',
              color: isSaved ? '#D4873A' : '#777',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {isSaved ? 'Saved ✓' : 'Save'}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px', borderRadius: 12,
              border: 'none', background: '#1A1A1A',
              color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
