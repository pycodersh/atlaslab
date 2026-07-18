'use client'

import { useEffect, useRef, useState } from 'react'
import { Headphones, BookOpen, CheckCircle2 } from 'lucide-react'
import { updateStorySessionState } from '@/lib/srs/story-session'
import { useTheme } from '@/components/ThemeProvider'
import type { MagazineStory } from '@/types/magazine'

// 스토리 본문 단어 수 기반 최소 Reading 시간 계산 (ms)
// ESL 학습자 기준 150 WPM, 최소 30초, 최대 90초
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
  readingCount: number           // 0, 1, or 2
  onReadingCheck: (newCount: number) => void
}

export function StoryProgressTracker({
  story, round, listeningCompleted, readingCount, onReadingCheck,
}: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const minReadingMs = calcMinReadingMs(story)

  // Reading session timer — resets on mount and after each successful check
  const sessionStartedAt = useRef(Date.now())
  // Tracks if enough reading time has passed for the next check
  const [readyToCheck, setReadyToCheck] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Poll every second to flip readyToCheck when time threshold is met
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
    const newCount = Math.min(2, readingCount + 1)
    updateStorySessionState(story.id, round, { readingCount: newCount })
    onReadingCheck(newCount)
    // Reset session timer for the next reading round
    sessionStartedAt.current = Date.now()
    setReadyToCheck(false)
    setProcessing(false)
  }

  // ── Colors ────────────────────────────────────────────────────────────────
  const cardBg     = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.78)'
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(142,167,255,0.18)'
  const labelColor = isDark ? 'rgba(255,255,255,0.55)' : '#6a6a8a'
  const accentOn   = isDark ? '#8FABFF' : '#5B7FD4'
  const accentOff  = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(142,167,255,0.30)'

  // Listening row
  const listenDone = listeningCompleted
  const listenColor = listenDone ? accentOn : accentOff

  // Reading dots
  const dot = (filled: boolean) => (
    <div style={{
      width: 7, height: 7, borderRadius: '50%',
      background: filled ? accentOn : accentOff,
      transition: 'background 0.3s',
    }} />
  )

  // Reading button state
  const readingDone = readingCount >= 2
  const btnActive   = !readingDone && readyToCheck && !processing
  const btnLabel    = readingDone ? 'Complete' : `Reading ${readingCount}/2`

  return (
    <div style={{ padding: '0 16px 4px' }}>
      <div style={{
        borderRadius: 18, background: cardBg,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: cardBorder,
        boxShadow: isDark
          ? '0 2px 16px rgba(0,0,0,0.25)'
          : '0 2px 12px rgba(100,120,200,0.06)',
        padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>

        {/* Listening row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Headphones style={{ width: 15, height: 15, color: listenColor, flexShrink: 0 }} strokeWidth={1.8} />
          <span style={{ fontSize: 12, fontWeight: 600, color: labelColor, flex: 1 }}>Listening</span>
          {listenDone ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 style={{ width: 14, height: 14, color: accentOn }} strokeWidth={2} />
              <span style={{ fontSize: 11, fontWeight: 700, color: accentOn }}>1 / 1</span>
            </div>
          ) : (
            <span style={{ fontSize: 11, fontWeight: 500, color: accentOff }}>0 / 1</span>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 0.5, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(142,167,255,0.15)' }} />

        {/* Reading row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOpen style={{ width: 15, height: 15, color: readingDone ? accentOn : accentOff, flexShrink: 0 }} strokeWidth={1.8} />
          <span style={{ fontSize: 12, fontWeight: 600, color: labelColor, flex: 1 }}>Reading</span>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginRight: 8 }}>
            {dot(readingCount >= 1)}
            {dot(readingCount >= 2)}
            <span style={{ fontSize: 11, fontWeight: 700, color: readingDone ? accentOn : accentOff, marginLeft: 3 }}>
              {readingCount} / 2
            </span>
          </div>
          {/* Check button */}
          {!readingDone && (
            <button
              type="button"
              onClick={handleReadingCheck}
              disabled={!btnActive}
              style={{
                height: 30, paddingLeft: 12, paddingRight: 12,
                borderRadius: 8, cursor: btnActive ? 'pointer' : 'default',
                background: btnActive
                  ? (isDark ? 'rgba(143,171,255,0.22)' : 'rgba(91,127,212,0.12)')
                  : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                border: btnActive
                  ? `1px solid ${isDark ? 'rgba(143,171,255,0.45)' : 'rgba(91,127,212,0.35)'}`
                  : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
                fontSize: 11, fontWeight: 700,
                color: btnActive
                  ? (isDark ? '#8FABFF' : '#5B7FD4')
                  : (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)'),
                transition: 'all 0.2s', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
              }}
            >
              {btnActive
                ? <><CheckCircle2 style={{ width: 10, height: 10 }} strokeWidth={2.5} /> Check</>
                : btnLabel
              }
            </button>
          )}
          {readingDone && (
            <CheckCircle2 style={{ width: 14, height: 14, color: accentOn }} strokeWidth={2} />
          )}
        </div>

        {/* Hint: reading time not yet met */}
        {!readingDone && !readyToCheck && (
          <p style={{
            margin: 0, fontSize: 10, color: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.25)',
            textAlign: 'right', lineHeight: 1.4,
          }}>
            Read the story to unlock check
          </p>
        )}
      </div>
    </div>
  )
}
