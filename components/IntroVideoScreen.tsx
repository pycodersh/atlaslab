'use client'

import { useEffect, useRef, useState } from 'react'
import type { IntroVideo, MagazineStory } from '@/types/magazine'

type Props = {
  story: MagazineStory
  intro: IntroVideo
  onComplete: () => void
}

export function IntroVideoScreen({ story, intro, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const doneRef  = useRef(false)
  const [exiting, setExiting] = useState(false)

  console.log('[IntroVideoScreen] mounted', story.id)
  console.log('[IntroVideoScreen] video url', intro.url)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const onCanPlay = () => {
      console.log('[IntroVideoScreen] canplay fired, duration:', el.duration)
      el.play().catch(e => console.log('[IntroVideoScreen] play() failed:', e))
    }
    const onPlay   = () => console.log('[IntroVideoScreen] play event fired')
    const onEnded  = () => { console.log('[IntroVideoScreen] ended'); exit() }
    const onError  = () => console.log('[IntroVideoScreen] video error — staying on screen')

    el.addEventListener('canplay', onCanPlay)
    el.addEventListener('play',    onPlay)
    el.addEventListener('ended',   onEnded)
    el.addEventListener('error',   onError)

    if (el.readyState >= 3) onCanPlay()

    return () => {
      el.removeEventListener('canplay', onCanPlay)
      el.removeEventListener('play',    onPlay)
      el.removeEventListener('ended',   onEnded)
      el.removeEventListener('error',   onError)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function exit() {
    if (doneRef.current) return
    doneRef.current = true
    videoRef.current?.pause()
    setExiting(true)
    setTimeout(onComplete, 380)
  }

  return (
    <div
      style={{
        position:   'fixed',
        inset:      0,
        zIndex:     60,
        background: '#000',
        opacity:    exiting ? 0 : 1,
        transition: exiting ? 'opacity 0.38s ease-in' : 'none',
      }}
    >
      {/* 배경 영상 */}
      <video
        ref={videoRef}
        src={intro.url}
        poster={intro.poster}
        muted
        playsInline
        autoPlay
        preload="auto"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* 그라데이션 */}
      <div
        style={{
          position:      'absolute',
          inset:         0,
          background:    'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.72) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* 디버그 텍스트 — 화면에 보이면 라우팅 성공 */}
      <div
        style={{
          position:   'absolute',
          top:        60,
          left:       0,
          right:      0,
          textAlign:  'center',
          color:      'rgba(255,255,255,0.6)',
          fontSize:   11,
          fontFamily: 'monospace',
          letterSpacing: '0.1em',
          pointerEvents: 'none',
        }}
      >
        INTRO VIDEO SCREEN - STORY {story.id}
      </div>

      {/* Skip */}
      <button
        type="button"
        onClick={exit}
        style={{
          position: 'absolute', top: 20, right: 20,
          padding: '5px 14px',
          border: '1px solid rgba(255,255,255,0.30)',
          borderRadius: 20,
          background: 'rgba(0,0,0,0.22)',
          color: 'rgba(255,255,255,0.70)',
          fontSize: 10, letterSpacing: '0.14em', fontWeight: 600,
          cursor: 'pointer', backdropFilter: 'blur(6px)',
        }}
      >
        SKIP
      </button>

      {/* 하단 스토리 정보 */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 28px 44px' }}>
        <p style={{ margin: '0 0 6px', fontSize: 9, letterSpacing: '0.24em', fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
          Cinematic Intro · Story {String(story.id).padStart(2, '0')}
        </p>
        <h1
          className="font-playfair"
          style={{ margin: '0 0 5px', fontSize: 'clamp(1.55rem, 6vw, 2.1rem)', fontWeight: 800, lineHeight: 1.15, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.01em' }}
        >
          {story.title}
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.50)', letterSpacing: '0.03em' }}>
          {story.subtitleKo}
        </p>
        {intro.credit && (
          <p style={{ margin: '16px 0 0', fontSize: 8.5, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.06em' }}>
            {intro.credit}
          </p>
        )}
      </div>
    </div>
  )
}
