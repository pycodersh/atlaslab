'use client'

import { useEffect, useRef, useState } from 'react'
import { Headphones, BookOpen, CheckCircle2, Info, X } from 'lucide-react'
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

// ── Translations ───────────────────────────────────────────────────────────────

const T = {
  subtitle: {
    ko: '오디오를 끝까지 들으면 Listening 완료. 두 번 읽고 Check하면 Reading 완료.',
    en: 'Listen to the full story to complete Listening. Read twice and check after each reading.',
    ja: 'オーディオを最後まで聞いてListening完了。2回読んでCheckを押してReading完了。',
    zh: '听完整段音频完成Listening。阅读两次并每次Check完成Reading。',
  },
  infoTitle: {
    ko: '학습 방법 안내',
    en: 'How Study Record Works',
    ja: '学習方法について',
    zh: '学习说明',
  },
  rules: {
    ko: [
      '🎧 Story 전체 오디오를 끝까지 들으면 Listening이 자동으로 완료됩니다.',
      '🔁 Listening은 총 1회로 기록됩니다.',
      '📖 Story를 읽은 후 Check 버튼을 눌러 Reading을 기록하세요.',
      '✅ Reading은 총 2회 완료할 수 있습니다.',
      '⏱ Check는 충분히 읽은 시간이 지난 후에만 활성화됩니다.',
    ],
    en: [
      '🎧 Listening is completed automatically when you listen to the full story audio.',
      '🔁 Listening is recorded once in total.',
      '📖 After reading the story, tap Check to record your reading.',
      '✅ Reading can be completed up to 2 times.',
      '⏱ Check becomes available only after sufficient reading time has passed.',
    ],
    ja: [
      '🎧 Story全体のオーディオを最後まで聞くと、Listeningが自動的に完了します。',
      '🔁 Listeningは合計1回記録されます。',
      '📖 Storyを読んだ後、Checkをタップしてリーディングを記録してください。',
      '✅ Readingは最大2回完了できます。',
      '⏱ Checkは十分な読書時間が経過した後にのみ有効になります。',
    ],
    zh: [
      '🎧 听完Story全段音频后，Listening自动完成。',
      '🔁 Listening共记录1次。',
      '📖 阅读Story后，点击Check记录阅读进度。',
      '✅ Reading最多可完成2次。',
      '⏱ 只有经过足够的阅读时间后，Check才会激活。',
    ],
  },
  close: {
    ko: '닫기',
    en: 'Close',
    ja: '閉じる',
    zh: '关闭',
  },
} as const

type LangKey = keyof typeof T.subtitle

function t<K extends keyof typeof T>(key: K, lang: string): (typeof T)[K][LangKey] {
  const map = T[key] as Record<string, unknown>
  return (map[lang] ?? map['en']) as (typeof T)[K][LangKey]
}

export function StoryProgressTracker({
  story, round, listeningCompleted, readingCount, onReadingCheck,
}: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { prefs } = usePreferences()
  const lang = prefs.language ?? 'ko'

  const minReadingMs = calcMinReadingMs(story)

  const sessionStartedAt = useRef(Date.now())
  const [readyToCheck, setReadyToCheck] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

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

  // ── Colors ─────────────────────────────────────────────────────────────────
  const cardBg     = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.78)'
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(142,167,255,0.18)'
  const labelColor = isDark ? 'rgba(255,255,255,0.55)' : '#6a6a8a'
  const accentOn   = isDark ? '#8FABFF' : '#5B7FD4'
  const accentOff  = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(142,167,255,0.30)'

  const listenDone = listeningCompleted
  const listenColor = listenDone ? accentOn : accentOff

  const dot = (filled: boolean) => (
    <div style={{
      width: 7, height: 7, borderRadius: '50%',
      background: filled ? accentOn : accentOff,
      transition: 'background 0.3s',
    }} />
  )

  const readingDone = readingCount >= 2
  const btnActive   = !readingDone && readyToCheck && !processing
  const btnLabel    = readingDone ? 'Complete' : `Reading ${readingCount}/2`

  const infoRules = t('rules', lang) as string[]

  return (
    <div style={{ padding: '0 16px 4px' }}>

      {/* Subtitle + Info row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, paddingLeft: 2, paddingRight: 2 }}>
        <p style={{
          margin: 0, flex: 1,
          fontSize: 11, lineHeight: 1.5,
          color: isDark ? 'rgba(255,255,255,0.32)' : 'rgba(60,60,100,0.40)',
          fontWeight: 400,
          paddingRight: 8,
        }}>
          {t('subtitle', lang) as string}
        </p>
        <button
          type="button"
          onClick={() => setShowInfo(true)}
          aria-label="Study Record 안내"
          style={{
            background: 'none', border: 'none', padding: 2, cursor: 'pointer',
            color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(100,100,160,0.38)',
            flexShrink: 0, marginTop: 1,
          }}
        >
          <Info style={{ width: 14, height: 14 }} strokeWidth={1.8} />
        </button>
      </div>

      {/* Progress card */}
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
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginRight: 8 }}>
            {dot(readingCount >= 1)}
            {dot(readingCount >= 2)}
            <span style={{ fontSize: 11, fontWeight: 700, color: readingDone ? accentOn : accentOff, marginLeft: 3 }}>
              {readingCount} / 2
            </span>
          </div>
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

        {!readingDone && !readyToCheck && (
          <p style={{
            margin: 0, fontSize: 10, color: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.25)',
            textAlign: 'right', lineHeight: 1.4,
          }}>
            Read the story to unlock check
          </p>
        )}
      </div>

      {/* Info bottom sheet overlay */}
      {showInfo && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'flex-end',
          }}
          onClick={() => setShowInfo(false)}
        >
          {/* Backdrop */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          }} />

          {/* Sheet */}
          <div
            style={{
              position: 'relative', width: '100%', zIndex: 1,
              borderRadius: '22px 22px 0 0',
              background: isDark ? 'rgba(22,22,34,0.98)' : 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(200,210,255,0.40)'}`,
              borderBottom: 'none',
              padding: '20px 20px 40px',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{
              width: 36, height: 4, borderRadius: 99,
              background: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)',
              margin: '0 auto 20px',
            }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: isDark ? '#fff' : '#1a1a2e' }}>
                {t('infoTitle', lang) as string}
              </p>
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                aria-label={t('close', lang) as string}
                style={{
                  background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
                  border: 'none', borderRadius: '50%',
                  width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: isDark ? 'rgba(255,255,255,0.55)' : '#6a6a8a',
                }}
              >
                <X style={{ width: 14, height: 14 }} strokeWidth={2} />
              </button>
            </div>

            {/* Rules list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {infoRules.map((rule, i) => (
                <p key={i} style={{
                  margin: 0, fontSize: 13.5, lineHeight: 1.55,
                  color: isDark ? 'rgba(255,255,255,0.78)' : '#2a2a3e',
                  fontWeight: 400,
                }}>
                  {rule}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
