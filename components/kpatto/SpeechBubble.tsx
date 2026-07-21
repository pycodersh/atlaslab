'use client'

import type { SpeechBubbleConfig, TailDirection } from '@/data/kpatto/types'

// Estimated bubble height as % of panel height — used only for tail anchor computation.
// Panels are 720:220 ≈ 3.27:1. At 375px mobile width, panel height ≈ 113px.
// A typical 1-line bubble (~12px font + 14px padding) ≈ 26px = ~23% of panel height.
const BUBBLE_H_PCT = 22

// Slightly irregular border-radii per bubble index for a hand-drawn manga feel
const RADII = [
  '18px 22px 20px 16px / 20px 18px 16px 22px',
  '22px 16px 18px 20px / 16px 22px 20px 18px',
  '20px 18px 22px 16px / 22px 16px 18px 20px',
  '16px 22px 16px 20px / 20px 16px 22px 18px',
]

function buildTailPath(b: SpeechBubbleConfig, bh: number): string {
  const { x, y, width: w, tailDirection: dir, tailTarget: tip } = b
  // 4px base half-width in SVG % units
  switch (dir) {
    case 'bottom-right':
      return `M ${x + w - 5} ${y + bh} L ${tip.x} ${tip.y} L ${x + w} ${y + bh - 5} Z`
    case 'bottom-left':
      return `M ${x} ${y + bh - 5} L ${tip.x} ${tip.y} L ${x + 5} ${y + bh} Z`
    case 'top-right':
      return `M ${x + w - 5} ${y} L ${tip.x} ${tip.y} L ${x + w} ${y + 5} Z`
    case 'top-left':
      return `M ${x} ${y + 5} L ${tip.x} ${tip.y} L ${x + 5} ${y} Z`
  }
}

interface Props {
  bubbles: SpeechBubbleConfig[]
}

export function SpeechBubbleLayer({ bubbles }: Props) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* Full-panel SVG overlay draws all tails */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {bubbles.map((b, i) => (
          <path
            key={i}
            d={buildTailPath(b, BUBBLE_H_PCT)}
            fill="rgba(255,255,255,0.96)"
            stroke="rgba(40,32,24,0.10)"
            strokeWidth="0.35"
            strokeLinejoin="round"
          />
        ))}
      </svg>

      {/* Bubble text boxes — positioned in % space on top of the SVG */}
      {bubbles.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.width}%`,
            padding: '6px 10px',
            borderRadius: RADII[i % RADII.length],
            background: 'rgba(255,255,255,0.96)',
            color: '#202020',
            border: '1px solid rgba(40,32,24,0.10)',
            boxShadow: '0 4px 14px rgba(42,30,18,0.12)',
            fontWeight: 700,
            fontSize: 'clamp(9px, 2.8vw, 13px)',
            lineHeight: 1.35,
            textAlign: 'center',
            wordBreak: 'keep-all',
            whiteSpace: 'normal',
          }}
        >
          {b.korean}
        </div>
      ))}
    </div>
  )
}
