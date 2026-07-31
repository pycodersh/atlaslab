'use client'

import { Volume2, Pause, Loader2 } from 'lucide-react'
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
  const iconSize = size === 'sm' ? 13 : 15

  return (
    <button
      onClick={() => audioUrl && toggle(audioUrl)}
      disabled={disabled}
      title={disabled ? 'Audio coming soon' : label ?? 'Play audio'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: disabled ? 'rgba(0,0,0,0.04)' : 'rgba(212,135,58,0.10)',
        border: `1.5px solid ${disabled ? 'rgba(0,0,0,0.08)' : 'rgba(212,135,58,0.30)'}`,
        borderRadius: 99,
        padding: size === 'sm' ? '4px 10px' : '6px 14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? '#AAAAAA' : '#D4873A',
        fontSize: size === 'sm' ? 12 : 13,
        fontWeight: 600,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {isLoading
        ? <Loader2 size={iconSize} strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} />
        : isPlaying
          ? <Pause size={iconSize} strokeWidth={2} />
          : <Volume2 size={iconSize} strokeWidth={2} />
      }
      {label && <span>{label}</span>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  )
}
