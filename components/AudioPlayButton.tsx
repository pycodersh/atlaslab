'use client'

import { Loader2, Pause, Play } from 'lucide-react'
import { usePlayback } from '@/hooks/usePlayback'

type Size = 'sm' | 'md'

const SIZE: Record<Size, { btn: number; icon: number }> = {
  sm: { btn: 26, icon: 11 },
  md: { btn: 28, icon: 12 },
}

type Props = {
  id:            string
  url:           string | null | undefined
  size?:         Size
  /** Called before play starts — use to stop ttsProvider sequential playback */
  onBeforePlay?: () => void
}

/**
 * Reusable ▶ / ⏸ button for Shimmer TTS audio.
 * Subscribes to playbackController via usePlayback.
 *
 * - Disabled when url is null/undefined
 * - Shows spinner while loading, pause icon while playing, play icon otherwise
 * - onBeforePlay: call ttsProvider.stop() here to prevent simultaneous playback
 */
export function AudioPlayButton({ id, url, size = 'md', onBeforePlay }: Props) {
  const { isPlaying, isLoading, toggle } = usePlayback(id)
  const { btn, icon } = SIZE[size]
  const disabled = !url

  function handlePress() {
    if (disabled) return
    onBeforePlay?.()
    toggle(url)
  }

  return (
    <button
      type="button"
      onClick={handlePress}
      disabled={disabled}
      aria-label={isPlaying ? '정지' : '재생'}
      title={disabled ? '음성 준비 중' : undefined}
      style={{
        flexShrink:     0,
        width:          btn,
        height:         btn,
        borderRadius:   '50%',
        border:         'none',
        background:     isPlaying
          ? 'var(--pc)'
          : 'rgba(180,185,195,0.25)',
        color:          isPlaying ? 'var(--pt2)' : 'var(--pt2)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        cursor:         disabled ? 'default' : 'pointer',
        opacity:        disabled ? 0.35 : 1,
        transition:     'background 0.15s, opacity 0.15s',
        marginTop:      1,
      }}
    >
      {isLoading ? (
        <Loader2 size={icon} className="animate-spin" />
      ) : isPlaying ? (
        <Pause size={icon} fill="currentColor" strokeWidth={0} />
      ) : (
        <Play size={icon} fill="currentColor" strokeWidth={0} />
      )}
    </button>
  )
}
