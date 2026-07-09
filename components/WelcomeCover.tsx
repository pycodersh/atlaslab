'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { OnboardingScreen } from '@/components/OnboardingScreen'
import { isOnboardingDone, markOnboardingDone, consumeOnboardingReplay } from '@/lib/onboarding'

const SPLASH_KEY  = 'patto-welcome-shown'
const MIN_SHOW_MS = 2500
const FADEOUT_MS  = 300

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

type Phase =
  | 'checking'        // reading localStorage — render nothing
  | 'onboarding'      // show onboarding slides
  | 'splash'          // show splash (2.5 s)
  | 'splashFadeout'   // fading out
  | 'done'            // completely hidden

export function WelcomeCover() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [phase, setPhase]               = useState<Phase>('checking')
  const [brandVisible, setBrandVisible] = useState(false)
  const [sloganVisible, setSloganVisible] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  // Clear all pending timers on unmount
  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

  useEffect(() => {
    // Replay request from Settings (forced full-page reload)
    const isReplay = consumeOnboardingReplay()
    if (isReplay) { setPhase('onboarding'); return }

    // First-run: onboarding not yet completed
    if (!isOnboardingDone()) { setPhase('onboarding'); return }

    // Regular splash: once per day
    const today = todayStr()
    if (localStorage.getItem(SPLASH_KEY) === today) { setPhase('done'); return }
    localStorage.setItem(SPLASH_KEY, today)
    startSplash()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function startSplash() {
    const startedAt = Date.now()
    setPhase('splash')
    setBrandVisible(false)
    setSloganVisible(false)

    const t1 = setTimeout(() => setBrandVisible(true), 80)
    const t2 = setTimeout(() => setSloganVisible(true), 420)
    const t3 = setTimeout(() => {
      const elapsed  = Date.now() - startedAt
      const remaining = Math.max(0, MIN_SHOW_MS - elapsed)
      const t4 = setTimeout(() => {
        setPhase('splashFadeout')
        const t5 = setTimeout(() => setPhase('done'), FADEOUT_MS)
        timers.current.push(t5)
      }, remaining)
      timers.current.push(t4)
    }, MIN_SHOW_MS)

    timers.current.push(t1, t2, t3)
  }

  function handleOnboardingComplete() {
    markOnboardingDone()
    // Show splash after onboarding (always, on first run)
    const today = todayStr()
    localStorage.setItem(SPLASH_KEY, today)
    startSplash()
  }

  // ── Nothing to show ──────────────────────────────────────────────────────────
  if (phase === 'checking' || phase === 'done') return null

  // ── Onboarding ───────────────────────────────────────────────────────────────
  if (phase === 'onboarding') {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />
  }

  // ── Splash ───────────────────────────────────────────────────────────────────
  const bg          = isDark ? '#0F172A' : '#F7FBFF'
  const c1          = isDark ? 'rgba(30,58,138,0.18)' : 'rgba(195,225,255,0.50)'
  const c2          = isDark ? 'rgba(23,45,110,0.13)' : 'rgba(210,238,255,0.40)'
  const c3          = isDark ? 'rgba(15,30,80,0.10)'  : 'rgba(225,244,255,0.32)'
  const logoFilter  = isDark ? 'invert(1) brightness(1.8)' : 'none'
  const wordColor   = isDark ? '#FFFFFF' : '#0F1923'
  const sloganColor = isDark ? 'rgba(255,255,255,0.88)' : 'rgba(15,40,85,0.78)'
  const transitionIn = 'opacity 680ms cubic-bezier(0.25,0.46,0.45,0.94), transform 680ms cubic-bezier(0.25,0.46,0.45,0.94)'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: bg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: phase === 'splashFadeout' ? 0 : 1,
        transition: phase === 'splashFadeout' ? `opacity ${FADEOUT_MS}ms ease-in-out` : 'none',
        overflow: 'hidden',
      }}
    >
      {/* Drifting background circles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: '72vw', height: '72vw', borderRadius: '50%', background: c1, top: '-22vw', right: '-18vw', animation: 'coverDriftA 15s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: '58vw', height: '58vw', borderRadius: '50%', background: c2, bottom: '-14vw', left: '-12vw', animation: 'coverDriftB 19s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: '38vw', height: '38vw', borderRadius: '50%', background: c3, top: '42%', left: '55%', transform: 'translate(-50%, -50%)', animation: 'coverDriftC 24s ease-in-out infinite' }} />
      </div>

      {/* Brand content */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, opacity: brandVisible ? 1 : 0, transform: brandVisible ? 'translateY(0)' : 'translateY(14px)', transition: transitionIn }}>
          <img src="/patto-logo.png" alt="PATTO" width={76} height={73} style={{ display: 'block', filter: logoFilter }} />
          <p style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.045em', color: wordColor, margin: 0, lineHeight: 1, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>PATTO</p>
        </div>
        <div style={{ marginTop: 20, opacity: sloganVisible ? 1 : 0, transform: sloganVisible ? 'translateY(0)' : 'translateY(9px)', transition: transitionIn, textAlign: 'center' }}>
          <p style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: '0.065em', color: sloganColor, margin: 0, lineHeight: 1.65, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', textTransform: 'uppercase', textAlign: 'center' }}>
            Repeat Patterns.<br />Build Fluency.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes coverDriftA {
          0%,100% { transform: translate(0,0) scale(1); opacity: 1; }
          35%      { transform: translate(-3%,4%) scale(1.04); opacity: 0.85; }
          68%      { transform: translate(4%,-2%) scale(0.97); opacity: 0.95; }
        }
        @keyframes coverDriftB {
          0%,100% { transform: translate(0,0) scale(1); opacity: 1; }
          40%      { transform: translate(4%,-4%) scale(1.05); opacity: 0.88; }
          72%      { transform: translate(-3%,3%) scale(0.96); opacity: 0.92; }
        }
        @keyframes coverDriftC {
          0%,100% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
          50%      { transform: translate(-52%,-53%) scale(1.08); opacity: 0.80; }
        }
      `}</style>
    </div>
  )
}
