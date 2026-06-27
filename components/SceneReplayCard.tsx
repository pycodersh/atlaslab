'use client'

import { useRef, useState } from 'react'
import type { MagazineStory } from '@/types/magazine'

type Props = {
  story: MagazineStory
}

export function SceneReplayCard({ story }: Props) {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying]   = useState(false)
  const [started, setStarted]   = useState(false)

  const intro = story.introVideo
  if (!intro?.url) return null

  // 스토리 각 단락의 첫 문장만 추출 (마침표 기준)
  const keyLines = story.paragraphs.map(p => {
    const first = p.english.split(/(?<=[.!?])\s+/)[0]
    return first ?? p.english
  })

  function handleReplay() {
    const el = videoRef.current
    if (!el) return
    el.currentTime = 0
    el.play().then(() => { setPlaying(true); setStarted(true) }).catch(() => {})
  }

  function handleEnded() {
    setPlaying(false)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm border border-[var(--pd)]"
      style={{ background: 'var(--pb)' }}
    >
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[9px] tracking-[0.28em] font-semibold text-[var(--pa)] mb-0.5">
          SCENE REPLAY
        </p>
        <p className="text-[0.72rem] text-[var(--pm)] leading-relaxed">
          Watch the scene again and review today's story.
        </p>
      </div>

      {/* 영상 카드 */}
      <div className="relative mx-4 rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          src={intro.url}
          poster={intro.poster}
          muted
          playsInline
          controls={started}
          preload="none"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onEnded={handleEnded}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
        />

        {/* Replay 오버레이 — 재생 전 또는 정지 시 */}
        {!playing && (
          <button
            type="button"
            onClick={handleReplay}
            aria-label="Replay"
            style={{
              position:       'absolute',
              inset:          0,
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            8,
              background:     started ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.30)',
              cursor:         'pointer',
              border:         'none',
            }}
          >
            {/* 포스터가 있을 때 배경처럼 보이도록 img fallback */}
            {!started && intro.poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={intro.poster}
                alt=""
                aria-hidden
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
              />
            )}
            <div
              style={{
                position:       'relative',
                zIndex:         1,
                width:          48,
                height:         48,
                borderRadius:   '50%',
                background:     'rgba(255,255,255,0.18)',
                border:         '1.5px solid rgba(255,255,255,0.55)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span
              style={{
                position:      'relative',
                zIndex:        1,
                fontSize:      10,
                letterSpacing: '0.18em',
                fontWeight:    700,
                color:         'rgba(255,255,255,0.85)',
              }}
            >
              {started ? 'REPLAY' : 'PLAY'}
            </span>
          </button>
        )}
      </div>

      {/* 핵심 문장 */}
      <div className="px-4 pt-4 pb-5">
        <p className="text-[9px] tracking-[0.22em] font-semibold text-[var(--pm2)] mb-3">
          KEY LINES
        </p>
        <div className="space-y-2.5">
          {keyLines.map((line, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span
                className="font-playfair font-bold text-[var(--pa)] shrink-0"
                style={{ fontSize: 11, lineHeight: '1.6', minWidth: 16 }}
              >
                {i + 1}
              </span>
              <p className="text-[0.8rem] text-[var(--pt)] leading-[1.75] font-medium">
                {line}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
