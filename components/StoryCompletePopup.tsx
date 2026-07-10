'use client'

import { Star } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { magazineStories } from '@/data/magazine-stories'
import { getLearnedPatternCount } from '@/lib/srs/storage'

const TOTAL_PATTERNS = magazineStories.reduce((sum, s) => sum + s.patterns.length, 0)

type Props = {
  storyNumber: number
  patternsInStory: number
  onContinue: () => void
  onHome: () => void
}

export function StoryCompletePopup({ storyNumber, patternsInStory, onContinue, onHome }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const learnedPatterns = getLearnedPatternCount()
  const pct = Math.min(Math.round((learnedPatterns / TOTAL_PATTERNS) * 100), 100)

  const cardBg     = isDark ? 'rgba(28,20,48,0.96)' : 'rgba(255,255,255,0.96)'
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.13)' : 'none'
  const mutedColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.38)'
  const titleColor = isDark ? 'rgba(255,255,255,0.95)' : '#1A1A2E'
  const subColor   = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(60,65,100,0.8)'
  const divColor   = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)'
  const secBorder  = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.18)'

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
          background: 'rgba(107,122,232,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <Star style={{ width: 32, height: 32, color: '#6B7AE8' }} strokeWidth={1.8} />
        </div>

        {/* Title */}
        <p style={{ fontSize: 22, fontWeight: 800, color: titleColor, margin: '0 0 6px', letterSpacing: '-0.02em', textAlign: 'center' }}>
          Story {storyNumber} complete!
        </p>

        {/* Subtitle */}
        <p style={{ fontSize: 13.5, color: subColor, margin: '0 0 20px', textAlign: 'center' }}>
          {patternsInStory} new patterns learned today
        </p>

        {/* Badge */}
        <div style={{
          background: 'rgba(107,122,232,0.12)',
          border: '1px solid rgba(107,122,232,0.28)',
          borderRadius: 20, padding: '5px 14px',
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#6B7AE8', letterSpacing: '0.02em' }}>
            Level 1 · {pct}% complete
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', marginBottom: 8 }}>
          <div style={{ height: 7, borderRadius: 99, background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(107,122,232,0.12)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: '#6B7AE8', borderRadius: 99, transition: 'width 0.6s cubic-bezier(0.25,0.46,0.45,0.94)' }} />
          </div>
        </div>

        {/* Progress text */}
        <p style={{ fontSize: 12, color: mutedColor, margin: '0 0 20px', textAlign: 'center' }}>
          {learnedPatterns} / {TOTAL_PATTERNS} patterns
        </p>

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
            Continue learning
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
