'use client'

interface ProgressBarProps {
  value: number  // 0–100
  label?: string
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div style={{ padding: '0 20px 12px' }}>
      <div style={{
        height: 4,
        background: 'var(--pb-alt, rgba(0,0,0,0.08))',
        borderRadius: 99,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #FF6B8C, #FF8C6B)',
          borderRadius: 99,
          transition: 'width 0.4s ease',
        }} />
      </div>
      {label && (
        <div style={{ fontSize: 10, color: 'var(--pm)', marginTop: 4, textAlign: 'right' }}>
          {label}
        </div>
      )}
    </div>
  )
}
