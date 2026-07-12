'use client'

import type { MagazineStory } from '@/types/magazine'
import type { StoryRoundData } from '@/lib/srs/story-round'
import { nextReviewLabel } from '@/lib/srs/story-round'
import { useTheme } from '@/components/ThemeProvider'

type Props = {
  story: MagazineStory
  roundData: StoryRoundData
  recallRounds: number
  elapsedMinutes?: number
}

export function StoryCompletionScreen({ story, roundData, recallRounds, elapsedMinutes = 1 }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const isMastered   = roundData.isMastered
  const reviewLabel  = nextReviewLabel(roundData)
  const nextDays     = reviewLabel ? reviewLabel.replace('후', '').trim() : null

  const textPrimary  = isDark ? 'rgba(255,255,255,0.92)' : '#14142a'
  const textMuted    = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(40,40,80,0.42)'
  const cardBg       = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(107,143,255,0.05)'
  const cardBorder   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(107,143,255,0.12)'

  const streak = roundData.round + 1

  return (
    <div style={{
      padding: '40px 20px 56px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 0,
    }}>
      {/* Gold check icon */}
      <div style={{
        width: 64, height: 64, borderRadius: 22,
        background: 'linear-gradient(135deg, rgba(215,181,109,0.2), rgba(215,181,109,0.08))',
        border: '0.5px solid rgba(215,181,109,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
          stroke="#D7B56D" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      {/* Session Complete label */}
      <p style={{ margin: '0 0 6px', fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: textMuted, textTransform: 'uppercase' }}>
        {isMastered ? 'Mastered' : 'Session Complete'}
      </p>

      {/* Story title */}
      <h2 style={{
        margin: '0 0 6px',
        fontFamily: 'var(--font-playfair), Georgia, serif',
        fontSize: 20, fontWeight: 700,
        color: textPrimary, textAlign: 'center', lineHeight: 1.3,
      }}>
        {story.title}
      </h2>

      {/* Meta line */}
      <p style={{ margin: '0 0 28px', fontSize: 10, color: textMuted, letterSpacing: '0.03em' }}>
        Round {roundData.round + 1} · {story.patterns.length} patterns · {elapsedMinutes} min
      </p>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 8, width: '100%', marginBottom: 20 }}>
        <StatCard
          emoji="🔥"
          label="Streak"
          value={String(streak)}
          accent={isDark ? '#D7B56D' : '#C9A84C'}
          bg={isDark ? 'rgba(215,181,109,0.08)' : 'rgba(215,181,109,0.06)'}
          border={isDark ? 'rgba(215,181,109,0.2)' : 'rgba(215,181,109,0.22)'}
          textPrimary={textPrimary}
        />
        <StatCard
          emoji="⚡"
          label="Patterns"
          value={String(story.patterns.length * recallRounds)}
          accent={isDark ? '#8FABFF' : '#6B8FFF'}
          bg={isDark ? 'rgba(107,143,255,0.08)' : 'rgba(107,143,255,0.06)'}
          border={isDark ? 'rgba(107,143,255,0.2)' : 'rgba(107,143,255,0.18)'}
          textPrimary={textPrimary}
        />
        <StatCard
          emoji="⏱"
          label="Time"
          value={`${elapsedMinutes}m`}
          accent={isDark ? '#C4AAFF' : '#9B7FE8'}
          bg={isDark ? 'rgba(164,120,255,0.08)' : 'rgba(164,120,255,0.06)'}
          border={isDark ? 'rgba(164,120,255,0.2)' : 'rgba(164,120,255,0.18)'}
          textPrimary={textPrimary}
        />
      </div>

      {/* Next review */}
      {!isMastered && nextDays && (
        <p style={{ fontSize: 10, color: textMuted, marginBottom: 0 }}>
          Next review in {nextDays}
        </p>
      )}
      {isMastered && (
        <p style={{ fontSize: 10, color: textMuted, marginBottom: 0 }}>
          Fully mastered ·  no review needed
        </p>
      )}

      {/* Bottom padding for trainer card clearance */}
      <div style={{ height: 120 }} />
    </div>
  )
}

function StatCard({
  emoji, label, value, accent, bg, border, textPrimary,
}: {
  emoji: string; label: string; value: string
  accent: string; bg: string; border: string; textPrimary: string
}) {
  return (
    <div style={{
      flex: 1, borderRadius: 14, padding: '14px 10px',
      background: bg, border: `0.5px solid ${border}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    }}>
      <span style={{ fontSize: 18 }}>{emoji}</span>
      <span style={{ fontSize: 16, fontWeight: 700, color: accent, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: textPrimary, opacity: 0.45, textTransform: 'uppercase' }}>{label}</span>
    </div>
  )
}
