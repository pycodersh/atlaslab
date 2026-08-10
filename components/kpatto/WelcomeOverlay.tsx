'use client'

import { useEffect, useState } from 'react'

// ── 타이밍 상수 ────────────────────────────────────────────────────────────────
const SHOW_DURATION_MS = 2500  // 오버레이가 불투명하게 유지되는 시간
const FADE_DURATION_MS = 400   // 페이드아웃 지속 시간

const BG = '#0d0d1a'

export function WelcomeOverlay() {
  // SSR에서는 false → 서버 HTML에 오버레이 없음 (SEO 목적)
  // 클라이언트 hydration 후 useEffect에서 true로 전환
  const [visible, setVisible] = useState(false)
  const [fading, setFading]   = useState(false)

  useEffect(() => {
    // prefers-reduced-motion: 오버레이 자체를 건너뜀
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // 세션당 한 번만 표시 — 탭 이동 후 홈으로 돌아와도 다시 뜨지 않음
    // sessionStorage는 탭 닫기/새로고침 시 초기화되므로 영구 저장 없음
    const SESSION_KEY = 'kpatto-welcome-shown'
    if (sessionStorage.getItem(SESSION_KEY)) return
    sessionStorage.setItem(SESSION_KEY, '1')

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
    <>
      <style>{`
        @keyframes kpatto-slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .kpatto-su-1 {
          animation: kpatto-slideUp 0.6s ease-out 0.3s forwards;
          opacity: 0;
        }
        .kpatto-su-2 {
          animation: kpatto-slideUp 0.6s ease-out 0.5s forwards;
          opacity: 0;
        }
      `}</style>

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
          gap:            0,
          zIndex:         9999,
          opacity:        fading ? 0 : 1,
          transition:     fading ? `opacity ${FADE_DURATION_MS}ms ease` : 'none',
          pointerEvents:  fading ? 'none' : 'auto',
        }}
      >
        {/* K-PATTO 로고 */}
        <div style={{
          fontSize:      56,
          fontWeight:    900,
          letterSpacing: 8,
          lineHeight:    1,
        }}>
          <span style={{ color: '#D4873A' }}>K</span>
          <span style={{ color: '#ffffff' }}>-PATTO</span>
        </div>

        {/* 구분선 */}
        <div style={{
          width:      40,
          height:     1,
          background: '#333',
          margin:     '20px auto',
        }} />

        {/* Repeat patterns through stories. */}
        <p className="kpatto-su-1" style={{
          fontFamily: 'Georgia, serif',
          fontStyle:  'italic',
          fontSize:   18,
          color:      '#aaa',
          margin:     0,
        }}>
          Repeat patterns through stories.
        </p>

        {/* BUILD FLUENCY */}
        <p className="kpatto-su-2" style={{
          fontFamily:    'sans-serif',
          fontSize:      12,
          fontWeight:    400,
          letterSpacing: 6,
          color:         '#555',
          margin:        0,
          marginTop:     8,
        }}>
          BUILD FLUENCY
        </p>
      </div>
    </>
  )
}
