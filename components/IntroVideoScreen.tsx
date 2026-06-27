'use client'

import { useEffect, useRef, useState } from 'react'
import type { IntroVideo, MagazineStory } from '@/types/magazine'

type Props = {
  story: MagazineStory
  intro: IntroVideo
  onComplete: () => void
}

const LOAD_TIMEOUT_MS  = 4000
const MIN_DURATION_SEC = 4

export function IntroVideoScreen({ story, intro, onComplete }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const doneRef   = useRef(false)
  const shownRef  = useRef(false)   // play 이벤트 발생 여부

  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  const exit = () => {
    if (doneRef.current) return
    doneRef.current = true
    videoRef.current?.pause()
    setExiting(true)
    setTimeout(onComplete, 380)
  }

  const silentFail = () => {
    if (doneRef.current) return
    doneRef.current = true
    onComplete()
  }

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    // 일정 시간 안에 재생 안 되면 조용히 포기
    const timeout = setTimeout(silentFail, LOAD_TIMEOUT_MS)

    const onPlay = () => {
      clearTimeout(timeout)
      shownRef.current = true
      setVisible(true)
    }

    const onCanPlay = () => {
      const dur = el.duration
      if (!isNaN(dur) && dur < MIN_DURATION_SEC) {
        clearTimeout(timeout)
        silentFail()
        return
      }
      el.play().catch(silentFail)
    }

    const onEnded = () => exit()
    const onError = () => { shownRef.current ? exit() : silentFail() }

    el.addEventListener('canplay', onCanPlay)
    el.addEventListener('play',    onPlay)
    el.addEventListener('ended',   onEnded)
    el.addEventListener('error',   onError)

    // readyState가 이미 충분하면 canplay가 다시 오지 않음
    if (el.readyState >= 3) {
      onCanPlay()
    }

    return () => {
      clearTimeout(timeout)
      el.removeEventListener('canplay', onCanPlay)
      el.removeEventListener('play',    onPlay)
      el.removeEventListener('ended',   onEnded)
      el.removeEventListener('error',   onError)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        60,
        background:    '#000',
        opacity:       visible && !exiting ? 1 : 0,
        transition:    visible
          ? exiting ? 'opacity 0.38s ease-in' : 'opacity 0.4s ease-out'
          : 'none',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
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

      <div
        style={{
          position:      'absolute',
          inset:         0,
          background:    'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.72) 100%)',
          pointerEvents: 'none',
        }}
      />

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
