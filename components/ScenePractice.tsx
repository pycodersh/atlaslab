'use client'

import { useRef, useState } from 'react'
import type { ScenePractice as ScenePracticeType } from '@/types/magazine'

type SubtitleMode = 'en' | 'ko' | 'both' | 'off'

type Props = {
  scenePractice: ScenePracticeType
}

const MODES: { value: SubtitleMode; label: string }[] = [
  { value: 'en',   label: 'English' },
  { value: 'ko',   label: 'Korean'  },
  { value: 'both', label: 'Both'    },
  { value: 'off',  label: 'Off'     },
]

export function ScenePractice({ scenePractice }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mode, setMode] = useState<SubtitleMode>('en')

  function handleReplay() {
    const el = videoRef.current
    if (!el) return
    el.currentTime = 0
    el.play().catch(() => {})
  }

  return (
    <div
      style={{
        borderRadius: 18,
        border: '1px solid var(--pd)',
        background: 'var(--pb)',
        overflow: 'hidden',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}
    >
      {/* 헤더 */}
      <div style={{ padding: '16px 18px 12px' }}>
        <p style={{ margin: '0 0 3px', fontSize: 9, letterSpacing: '0.28em', fontWeight: 700, color: 'var(--pa)' }}>
          SCENE PRACTICE
        </p>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--pm)', lineHeight: 1.5 }}>
          {scenePractice.description}
        </p>
      </div>

      {/* 영상 */}
      <div style={{ margin: '0 14px', borderRadius: 14, overflow: 'hidden', background: '#000', aspectRatio: '16/9', position: 'relative' }}>
        <video
          ref={videoRef}
          src={scenePractice.videoUrl}
          poster={scenePractice.poster}
          playsInline
          muted
          preload="metadata"
          controls
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* Replay + 자막 모드 */}
      <div style={{ padding: '12px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {/* 자막 모드 Pills */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {MODES.map(m => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              style={{
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: mode === m.value ? 'var(--pa)' : 'var(--pd)',
                background: mode === m.value ? 'var(--pa)' : 'transparent',
                color: mode === m.value ? '#fff' : 'var(--pm)',
                transition: 'all 0.15s',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Replay */}
        <button
          type="button"
          onClick={handleReplay}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 12px',
            borderRadius: 20,
            border: '1px solid var(--pd)',
            background: 'transparent',
            color: 'var(--pm)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
          REPLAY
        </button>
      </div>

      {/* Script */}
      <div style={{ padding: '14px 18px 18px' }}>
        <p style={{ margin: '0 0 10px', fontSize: 9, letterSpacing: '0.22em', fontWeight: 600, color: 'var(--pm2)' }}>
          SCRIPT
        </p>

        {mode === 'off' ? (
          <p style={{ fontSize: 12, color: 'var(--pm2)', fontStyle: 'italic' }}>
            Subtitles are hidden.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {scenePractice.subtitles.map((sub) => (
              <div key={sub.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                {/* 패턴 강조 dot */}
                <div style={{ flexShrink: 0, width: 5, height: 5, borderRadius: '50%', marginTop: 6, background: sub.patternId ? 'var(--pa)' : 'var(--pd)' }} />
                <div style={{ flex: 1 }}>
                  {(mode === 'en' || mode === 'both') && (
                    <p style={{
                      margin: 0,
                      fontSize: 13,
                      lineHeight: 1.7,
                      fontWeight: sub.patternId ? 600 : 400,
                      color: sub.patternId ? 'var(--pt)' : 'var(--pt)',
                    }}>
                      {sub.en}
                      {sub.patternId && (
                        <span style={{ marginLeft: 6, fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--pa)', verticalAlign: 'middle' }}>
                          PATTERN
                        </span>
                      )}
                    </p>
                  )}
                  {(mode === 'ko' || mode === 'both') && (
                    <p style={{ margin: mode === 'both' ? '2px 0 0' : 0, fontSize: 11, color: 'var(--pm)', lineHeight: 1.6 }}>
                      {sub.ko}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
