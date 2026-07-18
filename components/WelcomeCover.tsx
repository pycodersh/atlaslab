'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useTheme } from '@/components/ThemeProvider'

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

function AnimatedLetters({ text, delay = 0, style }: { text: string; delay?: number; style?: React.CSSProperties }) {
  return (
    <span style={{ display: 'inline-flex', ...style }}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block' }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            delay: delay + i * 0.07,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  )
}

export function WelcomeCover() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [visible, setVisible] = useState(false)
  const [dismissing, setDismissing] = useState(false)

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
    const t = setTimeout(dismiss, 3000)
    return () => clearTimeout(t)
  }, [visible])

  function dismiss() {
    if (dismissing) return
    setDismissing(true)
    localStorage.setItem(COVER_KEY, 'true')
    setTimeout(() => {
      setVisible(false)
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width    = ''
      document.body.style.top      = ''
    }, 600)
  }

  if (!visible) return null

  const bg   = isDark ? '#0A0A0F' : '#FAFAFA'
  const text = isDark ? '#FFFFFF' : '#0A0A0F'
  const muted = isDark ? 'rgba(255,255,255,0.30)' : 'rgba(10,10,15,0.32)'
  const rule  = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(10,10,15,0.12)'

  return (
    <motion.div
      onClick={dismiss}
      initial={{ opacity: 1 }}
      animate={{ opacity: dismissing ? 0 : 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        touchAction: 'none', overflow: 'hidden',
        background: bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Center content */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        marginBottom: '10%',
      }}>

        {/* PATTO */}
        <div style={{
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: '0.22em',
          color: text,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif',
          marginBottom: 20,
        }}>
          <AnimatedLetters text="PATTO" delay={0.1} />
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
          style={{
            width: 28, height: 1,
            background: rule,
            marginBottom: 20,
            borderRadius: 1,
          }}
        />

        {/* Slogan */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{
            margin: '0 0 7px',
            fontSize: 18,
            fontStyle: 'italic',
            fontWeight: 400,
            color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(10,10,15,0.75)',
            letterSpacing: '0.01em',
            lineHeight: 1.3,
            fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
          }}
        >
          Repeat Patterns.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.05, ease: 'easeOut' }}
          style={{
            margin: 0,
            fontSize: 10.5,
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: muted,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, sans-serif',
          }}
        >
          Build Fluency
        </motion.p>
      </div>

      {/* Bottom hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.5 }}
        style={{
          position: 'absolute', bottom: 52,
          margin: 0,
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: muted,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, sans-serif',
        }}
      >
        Tap to continue
      </motion.p>
    </motion.div>
  )
}
