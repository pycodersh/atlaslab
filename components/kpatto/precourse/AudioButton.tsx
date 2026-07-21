'use client'

import { usePlayback } from '@/hooks/usePlayback'

interface AudioButtonProps {
  id: string
  audioUrl?: string
  label?: string
  size?: 'sm' | 'md'
}

export function AudioButton({ id, audioUrl, label, size = 'md' }: AudioButtonProps) {
  const { isPlaying, isLoading, toggle } = usePlayback(id)
  const disabled = !audioUrl

  return (
    <button
      onClick={() => audioUrl && toggle(audioUrl)}
      disabled={disabled}
      title={disabled ? 'Audio coming soon' : label ?? 'Play audio'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: disabled ? 'rgba(0,0,0,0.04)' : 'rgba(255,107,140,0.1)',
        border: `1.5px solid ${disabled ? 'rgba(0,0,0,0.08)' : 'rgba(255,107,140,0.3)'}`,
        borderRadius: 99,
        padding: size === 'sm' ? '4px 10px' : '6px 14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? 'var(--pm)' : '#FF6B8C',
        fontSize: size === 'sm' ? 12 : 13,
        fontWeight: 600,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{ fontSize: size === 'sm' ? 13 : 15 }}>
        {isLoading ? '⏳' : isPlaying ? '⏸' : '🔊'}
      </span>
      {label && <span>{label}</span>}
    </button>
  )
}
