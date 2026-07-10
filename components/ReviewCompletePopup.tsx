'use client'

import { CheckCircle } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

type Props = {
  storyNumber: number
  storyTitle: string
  reviewCount: number   // 이 아이템의 누적 리뷰 횟수 (1~5)
  nextReviewDays: number
  onContinue: () => void
  onHome: () => void
}

const MAX_REVIEWS = 5

export function ReviewCompletePopup({
  storyNumber, storyTitle, reviewCount, nextReviewDays, onContinue, onHome,
}: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const cardBg     = isDark ? 'rgba(28,20,48,0.96)' : 'rgba(255,255,255,0.96)'
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.13)' : 'none'
  const mutedColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.38)'
  const titleColor = isDark ? 'rgba(255,255,255,0.95)' : '#1A1A2E'
  const subColor   = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(60,65,100,0.8)'
  const divColor   = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)'
  const secBorder  = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.18)'
  const dotInactive = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'

  const filled = Math.min(reviewCount, MAX_REVIEWS)
  const ordinal = filled === 1 ? '1st' : filled === 2 ? '2nd' : filled === 3 ? '3rd' : `${filled}th`

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 20px',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 400,
        background: cardBg,
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: cardBorder,
        borderRadius: 24,
        padding: '32px 24px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(45,160,100,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <CheckCircle style={{ width: 32, height: 32, color: '#2DA064' }} strokeWidth={1.8} />
        </div>

        {/* Title */}
        <p style={{ fontSize: 22, fontWeight: 800, color: titleColor, margin: '0 0 6px', letterSpacing: '-0.02em', textAlign: 'center' }}>
          Review done!
        </p>

        {/* Subtitle */}
        <p style={{ fontSize: 13.5, color: subColor, margin: '0 0 20px', textAlign: 'center' }}>
          Story {storyNumber} · {storyTitle}
        </p>

        {/* Mastery dots */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
          {Array.from({ length: MAX_REVIEWS }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i < filled ? '#2DA064' : dotInactive,
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Dot label */}
        <p style={{ fontSize: 12, color: mutedColor, margin: '0 0 16px', textAlign: 'center' }}>
          {ordinal} review complete
        </p>

        {/* Badge */}
        <div style={{
          background: 'rgba(45,160,100,0.10)',
          border: '1px solid rgba(45,160,100,0.25)',
          borderRadius: 20, padding: '5px 14px',
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#2DA064', letterSpacing: '0.02em' }}>
            Memory getting stronger
          </span>
        </div>

        {/* Stats */}
        <div style={{ width: '100%', display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{
            flex: 1, borderRadius: 14, padding: '14px 0',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(45,160,100,0.06)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(45,160,100,0.14)'}`,
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#2DA064', margin: '0 0 3px', letterSpacing: '-0.02em' }}>
              {filled} / {MAX_REVIEWS}
            </p>
            <p style={{ fontSize: 11, color: mutedColor, margin: 0 }}>Reviews done</p>
          </div>
          <div style={{
            flex: 1, borderRadius: 14, padding: '14px 0',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,122,232,0.06)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(107,122,232,0.14)'}`,
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#6B7AE8', margin: '0 0 3px', letterSpacing: '-0.02em' }}>
              {nextReviewDays}d
            </p>
            <p style={{ fontSize: 11, color: mutedColor, margin: 0 }}>Next review</p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: 1, background: divColor, marginBottom: 16 }} />

        {/* Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={onContinue}
            style={{
              height: 52, borderRadius: 16, fontSize: 14, fontWeight: 600,
              background: '#2C2C32', color: '#fff', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', width: '100%',
            }}
          >
            Continue
          </button>
          <button
            type="button"
            onClick={onHome}
            style={{
              height: 52, borderRadius: 16, fontSize: 14, fontWeight: 600,
              background: 'transparent', color: mutedColor,
              border: `0.5px solid ${secBorder}`,
              cursor: 'pointer', fontFamily: 'inherit', width: '100%',
            }}
          >
            Go to home
          </button>
        </div>
      </div>
    </div>
  )
}
