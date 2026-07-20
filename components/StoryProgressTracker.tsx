'use client'

import { useEffect, useRef, useState } from 'react'
import { Headphones, BookOpen, CheckCircle, Plus } from 'lucide-react'
import { updateStorySessionState } from '@/lib/srs/story-session'
import { useTheme } from '@/components/ThemeProvider'
import type { MagazineStory } from '@/types/magazine'

function calcMinReadingMs(story: MagazineStory): number {
  const text = story.paragraphs.map(p => p.english).join(' ')
  const wordCount = text.split(/\s+/).filter(Boolean).length
  const ms = Math.round((wordCount / 150) * 60 * 1000)
  return Math.max(30_000, Math.min(90_000, ms))
}

type Props = {
  story: MagazineStory
  round: number
  listeningCompleted: boolean
  readingCount: number
  onReadingCheck: (newCount: number) => void
}

const TOOLTIP_KEY = 'patto-spt-intro-seen'

export function StoryProgressTracker({
  story, round, listeningCompleted, readingCount, onReadingCheck,
}: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const minReadingMs = calcMinReadingMs(story)
  const sessionStartedAt = useRef(Date.now())

  const [readyToCheck, setReadyToCheck] = useState(true)
  const [processing,   setProcessing]   = useState(false)
  const [showTooltip,  setShowTooltip]  = useState(false)

  // Show tooltip only on first visit
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!localStorage.getItem(TOOLTIP_KEY)) setShowTooltip(true)
  }, [])

  // Mark tooltip as seen once both tasks complete
  useEffect(() => {
    if (listeningCompleted && readingCount >= 2 && showTooltip) {
      localStorage.setItem(TOOLTIP_KEY, '1')
      setShowTooltip(false)
    }
  }, [listeningCompleted, readingCount, showTooltip])

  // Unlock "Done reading" after minimum reading time
  useEffect(() => {
    if (readingCount >= 2) return
    if (readyToCheck) return
    const iv = setInterval(() => {
      if (Date.now() - sessionStartedAt.current >= minReadingMs) {
        setReadyToCheck(true)
        clearInterval(iv)
      }
    }, 1000)
    return () => clearInterval(iv)
  }, [readingCount, readyToCheck, minReadingMs])

  function handleReadingCheck() {
    if (processing || readingCount >= 2 || !readyToCheck) return
    setProcessing(true)
    const newCount = readingCount + 1
    updateStorySessionState(story.id, round, { readingCount: newCount })
    onReadingCheck(newCount)
    setProcessing(false)
  }

  const readingDone = readingCount >= 2
  const btnActive   = !readingDone && readyToCheck && !processing

  const barBg       = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)'
  const cardBg      = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.78)'
  const cardBorder  = isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(142,167,255,0.18)'
  const labelColor  = isDark ? 'rgba(255,255,255,0.80)' : '#2c2c52'
  const mutedColor  = isDark ? 'rgba(255,255,255,0.40)' : '#9CA3AF'
  const tooltipColor = isDark ? 'rgba(255,255,255,0.45)' : '#9CA3AF'
  const btnColor    = isDark ? 'rgba(255,255,255,0.85)' : '#1a1a2e'

  // Progress bar fill color
  const listeningFill = listeningCompleted ? '#22C55E' : '#6366F1'
  const readingFill   = readingDone        ? '#22C55E' : '#6366F1'

  const tooltipText = !listeningCompleted
    ? 'Listen to the full story to complete'
    : readingCount === 1
      ? 'Read once more to complete'
      : null

  return (
    <div style={{ padding: '0 16px 4px' }}>
      <div style={{
        borderRadius: 18, background: cardBg,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: cardBorder,
        boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.25)' : '0 2px 12px rgba(100,120,200,0.06)',
        padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>

        {/* ── Listening row ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* 고정 너비 레이블 영역 — bar 좌측 정렬 기준 */}
          <div style={{ width: 110, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Headphones style={{ width: 13, height: 13, flexShrink: 0, color: labelColor }} strokeWidth={1.8} />
            <span style={{ fontSize: 13, fontWeight: 700, color: labelColor }}>Listening</span>
          </div>
          <div style={{ flex: 1, height: 4, borderRadius: 999, background: barBg, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              background: listeningFill,
              width: listeningCompleted ? '100%' : '0%',
              transition: 'width 0.4s ease, background 0.3s ease',
            }} />
          </div>
          <div style={{ width: 36, flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            {listeningCompleted
              ? <CheckCircle style={{ width: 15, height: 15, color: '#22C55E' }} strokeWidth={2.5} />
              : <span style={{ fontSize: 12, color: mutedColor, fontVariantNumeric: 'tabular-nums' }}>0 / 1</span>
            }
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 0.5, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(142,167,255,0.15)' }} />

        {/* ── Reading row ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* 고정 너비 레이블 영역 — Listening과 동일 너비로 bar 정렬 */}
          <div style={{ width: 110, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen style={{ width: 13, height: 13, flexShrink: 0, color: labelColor }} strokeWidth={1.8} />
            <span style={{ fontSize: 13, fontWeight: 700, color: labelColor }}>Reading</span>
            {!readingDone && (
              <button
                type="button"
                onClick={handleReadingCheck}
                disabled={!btnActive}
                aria-label="Done reading"
                style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  border: `1.5px solid ${mutedColor}`,
                  background: 'transparent',
                  color: mutedColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: btnActive ? 'pointer' : 'default',
                  opacity: btnActive ? 0.55 : 0.22,
                  transition: 'opacity 0.2s',
                  padding: 0,
                }}
              >
                <Plus style={{ width: 11, height: 11 }} strokeWidth={2.5} />
              </button>
            )}
          </div>
          <div style={{ flex: 1, height: 4, borderRadius: 999, background: barBg, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              background: readingFill,
              width: `${Math.min(readingCount, 2) / 2 * 100}%`,
              transition: 'width 0.4s ease, background 0.3s ease',
            }} />
          </div>
          <div style={{ width: 36, flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            {readingDone
              ? <CheckCircle style={{ width: 15, height: 15, color: '#22C55E' }} strokeWidth={2.5} />
              : <span style={{ fontSize: 12, color: mutedColor, fontVariantNumeric: 'tabular-nums' }}>{readingCount} / 2</span>
            }
          </div>
        </div>

      </div>

      {/* ── First-visit tooltip ── */}
      {showTooltip && tooltipText && (
        <p style={{ margin: '6px 2px 0', fontSize: 11, color: tooltipColor, lineHeight: 1.5 }}>
          {tooltipText}
        </p>
      )}
    </div>
  )
}
