'use client'

import { useEffect, useRef, useState } from 'react'
import { Info, X, Headphones, BookOpen } from 'lucide-react'
import { updateStorySessionState } from '@/lib/srs/story-session'
import { useTheme } from '@/components/ThemeProvider'
import { usePreferences } from '@/contexts/PreferencesContext'
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

const INFO: Record<string, string> = {
  ko: '오디오를 끝까지 들으면 Listening이 자동으로 완료됩니다. Story를 읽은 뒤 ✓를 눌러 Reading을 기록하세요. 2회 완료하면 Reading이 완성됩니다.',
  en: 'Listening completes automatically when you finish the audio. Tap ✓ after reading to record each session. Complete twice to finish Reading.',
  ja: 'オーディオを最後まで聞くとListeningが自動完了します。読み終えたら✓をタップしてReadingを記録してください。2回完了でReadingが完成します。',
  zh: '听完音频后Listening自动完成。阅读后点击✓记录，完成两次即完成Reading。',
}

// Keyframes injected once — dot pop-in when it transitions to filled
const DOT_KEYFRAMES = `
@keyframes sptDotPop {
  0%   { transform: scale(0.4); opacity: 0.5; }
  60%  { transform: scale(1.18); }
  100% { transform: scale(1);   opacity: 1;   }
}
`

export function StoryProgressTracker({
  story, round, listeningCompleted, readingCount, onReadingCheck,
}: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { prefs } = usePreferences()
  const lang = prefs.language ?? 'ko'

  const minReadingMs = calcMinReadingMs(story)

  const sessionStartedAt  = useRef(Date.now())
  const prevListeningRef  = useRef(listeningCompleted)
  const prevReadingRef    = useRef(readingCount)

  const [readyToCheck,  setReadyToCheck]  = useState(false)
  const [processing,    setProcessing]    = useState(false)
  const [showInfo,      setShowInfo]      = useState(false)

  // Dot pop-in animation triggers (true for one animation frame, then cleared)
  const [animListening, setAnimListening] = useState(false)
  const [animReading1,  setAnimReading1]  = useState(false)
  const [animReading2,  setAnimReading2]  = useState(false)

  // Trigger dot pop when listening transitions to completed
  useEffect(() => {
    if (!prevListeningRef.current && listeningCompleted) {
      setAnimListening(true)
      const t = setTimeout(() => setAnimListening(false), 400)
      return () => clearTimeout(t)
    }
    prevListeningRef.current = listeningCompleted
  }, [listeningCompleted])

  // Trigger dot pop when reading count increments
  useEffect(() => {
    const prev = prevReadingRef.current
    if (readingCount > prev) {
      if (prev < 1 && readingCount >= 1) {
        setAnimReading1(true)
        const t = setTimeout(() => setAnimReading1(false), 400)
        setTimeout(() => clearTimeout(t), 450)
      }
      if (prev < 2 && readingCount >= 2) {
        setAnimReading2(true)
        const t = setTimeout(() => setAnimReading2(false), 400)
        setTimeout(() => clearTimeout(t), 450)
      }
    }
    prevReadingRef.current = readingCount
  }, [readingCount])

  // Unlock check after sufficient reading time
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
    sessionStartedAt.current = Date.now()
    setReadyToCheck(false)
    setProcessing(false)
  }

  // ── Colors ──────────────────────────────────────────────────────────────────
  const cardBg     = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.78)'
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(142,167,255,0.18)'
  const labelMuted = isDark ? 'rgba(255,255,255,0.50)' : '#6a6a8a'
  const labelFocus = isDark ? 'rgba(255,255,255,0.92)' : '#2c2c52'  // one level stronger
  const accentOn   = isDark ? '#8FABFF' : '#5B7FD4'
  const accentOff  = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(142,167,255,0.30)'

  const noteBg     = isDark ? 'rgba(255,220,80,0.12)' : '#FFFBEA'
  const noteBorder = isDark ? 'rgba(255,220,80,0.25)' : '#F5E58A'
  const noteText   = isDark ? 'rgba(255,230,120,0.90)' : '#7A6200'

  const infoColor  = showInfo
    ? (isDark ? '#FFE050' : '#C09900')
    : (isDark ? 'rgba(255,255,255,0.28)' : 'rgba(100,100,160,0.38)')

  const readingDone = readingCount >= 2
  const btnActive   = !readingDone && readyToCheck && !processing

  // ── Focus states (which row is currently "active") ──────────────────────────
  // Listening active  = not yet completed (draw user's attention to listen first)
  // Reading active    = listening done but reading not yet complete
  const listeningActive = !listeningCompleted
  const readingActive   = listeningCompleted && !readingDone

  // ── Dot component ────────────────────────────────────────────────────────────
  const dot = (filled: boolean, animate: boolean) => (
    <div style={{
      width: 7, height: 7, borderRadius: '50%',
      background: filled ? accentOn : accentOff,
      flexShrink: 0,
      transition: 'background 0.25s ease-out',
      animation: animate ? 'sptDotPop 360ms ease-out' : 'none',
    }} />
  )

  // Fixed column widths — both rows share same DOTS_W so dots align on same X
  const DOTS_W   = 48
  const ACTION_W = 36

  const infoText = INFO[lang] ?? INFO['en']

  return (
    <div style={{ padding: '0 16px 4px' }}>
      <style>{DOT_KEYFRAMES}</style>

      {/* ── Info button (right-aligned, reads as part of STUDY RECORD header) ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6, paddingRight: 2 }}>
        <button
          type="button"
          onClick={() => setShowInfo(v => !v)}
          aria-label="Study Record 안내"
          style={{
            background: 'none', border: 'none',
            padding: 5, cursor: 'pointer',
            color: infoColor,
            transition: 'color 0.15s',
          }}
        >
          <Info style={{ width: 14, height: 14 }} strokeWidth={1.8} />
        </button>
      </div>

      {/* ── Progress card ────────────────────────────────────────────────────── */}
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

        {/* ── Listening row ── */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1, overflow: 'visible' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13,
              fontWeight: listeningActive ? 700 : 600,
              color: listeningCompleted
                ? accentOn
                : (listeningActive ? labelFocus : labelMuted),
              transform: listeningActive ? 'scale(1.04)' : 'scale(1)',
              transformOrigin: 'left center',
              transition: 'transform 260ms ease-out, color 260ms ease-out',
            }}>
              <Headphones style={{ width: 13, height: 13, flexShrink: 0 }} strokeWidth={1.8} />
              Listening · 1회
            </span>
          </div>
          <div style={{ width: DOTS_W, display: 'flex', alignItems: 'center', gap: 4 }}>
            {dot(listeningCompleted, animListening)}
          </div>
          <div style={{ width: ACTION_W }} />
        </div>

        {/* Divider */}
        <div style={{
          height: 0.5,
          background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(142,167,255,0.15)',
        }} />

        {/* ── Reading row ── */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1, overflow: 'visible' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13,
              fontWeight: readingActive ? 700 : 600,
              color: readingDone
                ? accentOn
                : (readingActive ? labelFocus : labelMuted),
              transform: readingActive ? 'scale(1.04)' : 'scale(1)',
              transformOrigin: 'left center',
              transition: 'transform 260ms ease-out, color 260ms ease-out',
            }}>
              <BookOpen style={{ width: 13, height: 13, flexShrink: 0 }} strokeWidth={1.8} />
              Reading · 2회
            </span>
          </div>
          <div style={{ width: DOTS_W, display: 'flex', alignItems: 'center', gap: 4 }}>
            {dot(readingCount >= 1, animReading1)}
            {dot(readingCount >= 2, animReading2)}
          </div>
          {readingDone ? (
            <div style={{ width: ACTION_W }} />
          ) : (
            <button
              type="button"
              onClick={handleReadingCheck}
              disabled={!btnActive}
              aria-label="Reading 체크"
              style={{
                width: ACTION_W,
                height: 36,
                background: 'none',
                border: 'none',
                cursor: btnActive ? 'pointer' : 'default',
                padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 500, lineHeight: 1,
                color: btnActive ? accentOn : accentOff,
                transition: 'color 0.2s',
                fontFamily: 'inherit',
                flexShrink: 0,
              }}
            >
              ✓
            </button>
          )}
        </div>

      </div>

      {/* ── Inline info panel (Pattern Card note style) ──────────────────────── */}
      {showInfo && (
        <div style={{
          marginTop: 6,
          borderRadius: 8,
          background: noteBg,
          border: `1px solid ${noteBorder}`,
          padding: '8px 10px 8px 12px',
          display: 'flex', alignItems: 'flex-start', gap: 6,
        }}>
          <p style={{
            margin: 0, flex: 1,
            fontSize: 12, color: noteText, lineHeight: 1.6,
          }}>
            {infoText}
          </p>
          <button
            type="button"
            onClick={() => setShowInfo(false)}
            aria-label="닫기"
            style={{
              background: 'none', border: 'none',
              padding: 2, cursor: 'pointer',
              color: noteText, flexShrink: 0, marginTop: 1,
            }}
          >
            <X style={{ width: 11, height: 11 }} strokeWidth={2} />
          </button>
        </div>
      )}

    </div>
  )
}
