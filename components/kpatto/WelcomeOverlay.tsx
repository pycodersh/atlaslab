'use client'

import { useEffect, useState } from 'react'

// ── 타이밍 상수 ────────────────────────────────────────────────────────────────
const SHOW_DURATION_MS = 2500  // 오버레이가 불투명하게 유지되는 시간
const FADE_DURATION_MS = 400   // 페이드아웃 지속 시간

const BG = '#0F1117'

export function WelcomeOverlay() {
  // SSR에서는 false → 서버 HTML에 오버레이 없음 (SEO 목적)
  // 클라이언트 hydration 후 useEffect에서 true로 전환
  const [visible, setVisible] = useState(false)
  const [fading, setFading]   = useState(false)

  useEffect(() => {
    // prefers-reduced-motion: 오버레이 자체를 건너뜀
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // 클라이언트에서만 오버레이 활성화
    setVisible(true)

    const fadeTimer = setTimeout(() => setFading(true), SHOW_DURATION_MS)
    const hideTimer = setTimeout(() => setVisible(false), SHOW_DURATION_MS + FADE_DURATION_MS)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position:       'fixed',
        inset:          0,
        background:     BG,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            16,
        zIndex:         9999,
        padding:        '0 28px',
        opacity:        fading ? 0 : 1,
        transition:     fading ? `opacity ${FADE_DURATION_MS}ms ease` : 'none',
        pointerEvents:  fading ? 'none' : 'auto',
      }}
    >
      <p style={{
        fontSize:    40,
        fontWeight:  700,
        color:       '#FFFFFF',
        margin:      0,
        textAlign:   'center',
        lineHeight:  1.2,
      }}>
        Korean looks difficult?
      </p>
      <p style={{
        fontSize:  22,
        color:     '#888888',
        margin:    0,
        textAlign: 'center',
      }}>
        {"Let's change that."}
      </p>
    </div>
  )
}
