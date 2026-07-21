'use client'

import { usePlayback } from '@/hooks/usePlayback'
import type { KPattoDialogue, KPattoLanguage } from '@/data/kpatto/types'

interface DialogueBubbleProps {
  dialogue: KPattoDialogue
  displayLang: KPattoLanguage
  /** Which side the tail points toward: 'left' = character on left, 'right' = character on right */
  tailSide?: 'left' | 'right'
}

export function DialogueBubble({ dialogue, displayLang, tailSide = 'left' }: DialogueBubbleProps) {
  const { isPlaying, isLoading, toggle } = usePlayback(dialogue.id)
  const translation = dialogue.translations[displayLang]

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: tailSide === 'left' ? 'row' : 'row-reverse',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 8,
      }}
    >
      {/* Character label */}
      <div style={{
        flexShrink: 0,
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'var(--pk, #6B8CFF)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 700,
        color: '#fff',
        marginTop: 4,
      }}>
        {dialogue.character.slice(0, 2)}
      </div>

      {/* Bubble */}
      <div style={{
        position: 'relative',
        background: 'var(--pb, #fff)',
        border: '1.5px solid var(--border, rgba(0,0,0,0.08))',
        borderRadius: tailSide === 'left' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
        padding: '12px 14px',
        flex: 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {/* Korean dialogue — primary */}
        <p style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 600,
          lineHeight: 1.55,
          color: 'var(--pt, #111)',
          wordBreak: 'keep-all',
        }}>
          {dialogue.korean}
        </p>

        {/* Translation */}
        {translation && displayLang !== 'ko' && (
          <p style={{
            margin: '6px 0 0',
            fontSize: 12.5,
            color: 'var(--pm, #666)',
            lineHeight: 1.4,
          }}>
            {translation}
          </p>
        )}

        {/* Audio button */}
        {dialogue.audio_url && (
          <button
            onClick={() => toggle(dialogue.audio_url!)}
            style={{
              marginTop: 8,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px 4px 0',
              color: 'var(--pk, #6B8CFF)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {isLoading ? (
              <span style={{ fontSize: 14 }}>⏳</span>
            ) : isPlaying ? (
              <span style={{ fontSize: 14 }}>⏸</span>
            ) : (
              <span style={{ fontSize: 14 }}>🔊</span>
            )}
            발음 듣기
          </button>
        )}
      </div>
    </div>
  )
}
