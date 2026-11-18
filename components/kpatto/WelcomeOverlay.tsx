'use client'

import { useEffect, useState } from 'react'

// ── 타이밍 상수 ────────────────────────────────────────────────────────────────
const SHOW_DURATION_MS = 2500  // 오버레이가 불투명하게 유지되는 시간
const FADE_DURATION_MS = 600   // 페이드아웃 지속 시간 — 밝은 바탕이라 길게 녹아들게

// 한지 미색 — 딥 네이비는 앱의 흰 바탕과 끊겨 보였다(앱 화면 바탕은 #FFFFFF 라 페이드로 자연스럽게 이어진다)
const BG = '#FAF8F5'
const INK = '#2A2724'        // 딥 차콜 워드마크
const RULE = '#E4DED5'       // 얇은 가로선
const SLOGAN = '#8C8278'     // 웜 그레이 슬로건

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
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position:       'fixed',
          inset:          0,
          minHeight:      '100dvh',
          background:     BG,
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            0,
          zIndex:         9999,
          opacity:        fading ? 0 : 1,
          transition:     fading ? `opacity ${FADE_DURATION_MS}ms ease-out` : 'none',
          pointerEvents:  fading ? 'none' : 'auto',
          padding:        '0 16px',
          textAlign:      'center',
        }}
      >
        {/* 1단 — K-PATTO 워드마크 (코랄 K + 딥 차콜, semibold) */}
        <div style={{
          fontSize:      'clamp(40px, 13vw, 56px)',
          fontWeight:    600,
          letterSpacing: '0.12em',
          lineHeight:    1,
          marginRight:   '-0.12em',  // 마지막 글자 뒤 자간만큼 당겨 시각 중앙을 맞춘다
        }}>
          <span style={{ color: '#FF5A36' }}>K</span>
          <span style={{ color: INK }}>-PATTO</span>
        </div>

        {/* 얇은 가로선 */}
        <div style={{
          width:      40,
          height:     1,
          background: RULE,
          margin:     '22px auto',
        }} />

        {/* 2단 — 슬로건 */}
        <p className="kpatto-su-1" style={{
          fontFamily: 'Georgia, serif',
          fontStyle:  'italic',
          fontSize:   18,
          color:      SLOGAN,
          margin:     0,
        }}>
          Repeat patterns through stories.
        </p>
      </div>
    </>
  )
}
