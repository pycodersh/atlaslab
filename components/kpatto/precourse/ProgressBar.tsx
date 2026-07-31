'use client'

interface ProgressBarProps {
  value: number  // 0–100
  label?: string
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div style={{ padding: '0 20px 10px' }}>
      <div style={{
        height: 5,
        background: 'rgba(212,135,58,0.12)',
        borderRadius: 99,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: '#D4873A',
          borderRadius: 99,
          transition: 'width 0.4s ease',
        }} />
      </div>
      {label && (
        <div style={{ fontSize: 11, color: '#AAAAAA', marginTop: 5, textAlign: 'right', fontWeight: 500 }}>
          {label}
        </div>
      )}
    </div>
  )
}
