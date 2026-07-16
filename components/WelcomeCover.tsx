'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { Logo } from '@/components/Logo'

const COVER_KEY    = 'patto_cover_done_v1'
const COVER_REPLAY = 'patto_cover_replay_v1'

export function requestCoverReplay() {
  if (typeof window !== 'undefined') localStorage.setItem(COVER_REPLAY, 'true')
}

function isCoverDone(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(COVER_KEY) === 'true'
}

function consumeCoverReplay(): boolean {
  if (typeof window === 'undefined') return false
  const had = localStorage.getItem(COVER_REPLAY) === 'true'
  if (had) localStorage.removeItem(COVER_REPLAY)
  return had
}

export function WelcomeCover() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [visible, setVisible] = useState(false)
  const [fading, setFading]   = useState(false)
  const [stage, setStage]     = useState(0)

  useEffect(() => {
    const isReplay = consumeCoverReplay()
    if (isReplay || !isCoverDone()) {
      setVisible(true)
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width    = '100%'
      document.body.style.top      = '0'
    }
  }, [])

  useEffect(() => {
    if (!visible) return
    // stage 1: 로고 페이드인 (100ms)
    // stage 2: Repeat Patterns. (700ms)
    // stage 3: Build Fluency. + URL (1200ms)
    // 마지막 1.5초 정지 후 dismiss (2800ms)
    const t1          = setTimeout(() => setStage(1), 100)
    const t2          = setTimeout(() => setStage(2), 700)
    const t3          = setTimeout(() => setStage(3), 1200)
    const autoDismiss = setTimeout(() => dismiss(), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(autoDismiss) }
  }, [visible])

  function dismiss() {
    if (fading) return
    setFading(true)
    localStorage.setItem(COVER_KEY, 'true')
    setTimeout(() => {
      setVisible(false)
      setFading(false)
      document.body.style.overflow  = ''
      document.body.style.position  = ''
      document.body.style.width     = ''
      document.body.style.top       = ''
    }, 400)
  }

  if (!visible) return null

  // ── 배경 ──────────────────────────────────────────────────────────
  const bgGradient = isDark
    ? 'linear-gradient(150deg, #181F38 0%, #1C2645 55%, #19213E 100%)'
    : 'linear-gradient(150deg, #E8EFF9 0%, #D8E6F5 55%, #CFDFF3 100%)'

  // ── 텍스트 색상 ────────────────────────────────────────────────────
  const primaryColor   = isDark ? 'rgba(255,255,255,0.93)' : 'rgba(28,22,58,0.89)'
  const secondaryColor = isDark ? 'rgba(255,255,255,0.36)' : 'rgba(28,22,58,0.40)'
  const urlColor       = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(28,22,58,0.24)'

  // ── 애니메이션 헬퍼 ───────────────────────────────────────────────
  const ease = 'cubic-bezier(0.16, 1, 0.3, 1)'

  const logoAnim: React.CSSProperties = {
    opacity:    stage >= 1 ? 1 : 0,
    transform:  stage >= 1 ? 'scale(1)' : 'scale(0.96)',
    transition: stage >= 1
      ? `opacity 600ms ${ease}, transform 600ms ${ease}`
      : 'none',
  }

  function reveal(active: boolean): React.CSSProperties {
    return {
      opacity:   active ? 1 : 0,
      transform: active ? 'translateY(0px)' : 'translateY(8px)',
      transition: active
        ? `opacity 550ms ${ease}, transform 550ms ${ease}`
        : 'none',
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      overflow: 'hidden', touchAction: 'none',
      background: bgGradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity:    fading ? 0 : 1,
      transition: fading ? 'opacity 400ms cubic-bezier(0.4,0,0.2,1)' : 'none',
    }}>

      {/* ── 배경 Orbs ────────────────────────────────────────────── */}
      {isDark ? (
        <>
          <div style={{
            position: 'absolute', top: -80, right: -100,
            width: 380, height: 380, pointerEvents: 'none',
            background: 'radial-gradient(circle at 60% 40%, rgba(110,155,255,0.16) 0%, transparent 68%)',
            filter: 'blur(2px)',
          }} />
          <div style={{
            position: 'absolute', bottom: -60, left: -80,
            width: 320, height: 320, pointerEvents: 'none',
            background: 'radial-gradient(circle at 40% 60%, rgba(90,120,215,0.13) 0%, transparent 68%)',
            filter: 'blur(2px)',
          }} />
          <div style={{
            position: 'absolute', top: '38%', left: '18%',
            width: 220, height: 220, pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(130,170,255,0.08) 0%, transparent 68%)',
          }} />
        </>
      ) : (
        <>
          <div style={{
            position: 'absolute', top: -80, right: -100,
            width: 380, height: 380, pointerEvents: 'none',
            background: 'radial-gradient(circle at 60% 40%, rgba(255,255,255,0.58) 0%, rgba(195,215,240,0.28) 45%, transparent 70%)',
            filter: 'blur(1px)',
          }} />
          <div style={{
            position: 'absolute', bottom: -60, left: -80,
            width: 320, height: 320, pointerEvents: 'none',
            background: 'radial-gradient(circle at 40% 60%, rgba(255,255,255,0.52) 0%, rgba(185,208,234,0.24) 45%, transparent 70%)',
            filter: 'blur(1px)',
          }} />
          <div style={{
            position: 'absolute', top: '33%', right: '8%',
            width: 200, height: 200, pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(255,255,255,0.40) 0%, rgba(190,212,237,0.18) 45%, transparent 70%)',
          }} />
        </>
      )}

      {/* ── 중앙 콘텐츠 ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        paddingBottom: '15%',
      }}>

        {/* 로고 — /atlas-design-system/components/Logo 동일 스펙 */}
        <div style={{ ...logoAnim, marginBottom: 40 }}>
          <Logo variant="full" width={200} dark={isDark} />
        </div>

        {/* Repeat Patterns. — 브랜드 메시지 중심 */}
        <p style={{
          ...reveal(stage >= 2),
          fontSize: 21.5,      // 기존 20 대비 약 7% 증가
          fontStyle: 'italic',
          fontWeight: 500,     // 기존 400 → 500, 약간 더 진하게
          color: primaryColor,
          margin: '0 0 8px',
          lineHeight: 1.3,
          fontFamily: 'var(--font-playfair), "Playfair Display", "Cormorant Garamond", Georgia, serif',
          letterSpacing: '0.006em',
        }}>
          Repeat Patterns.
        </p>

        {/* Build Fluency. — 보조 메시지 */}
        <p style={{
          ...reveal(stage >= 3),
          fontSize: 11.5,      // 기존 13 대비 약 12% 축소
          fontWeight: 400,
          color: secondaryColor,
          margin: 0,
          letterSpacing: '0.05em',
          lineHeight: 1.5,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, sans-serif',
        }}>
          Build Fluency.
        </p>
      </div>

      {/* ── 하단 URL — 브랜드 정보 수준 ────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 36, left: 0, right: 0,
        textAlign: 'center',
        ...reveal(stage >= 3),
      }}>
        <span style={{
          fontSize: 10,
          fontWeight: 400,
          color: urlColor,
          letterSpacing: '0.07em',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, sans-serif',
        }}>
          atlaslabstudios.com/patto
        </span>
      </div>
    </div>
  )
}
