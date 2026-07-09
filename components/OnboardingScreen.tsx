'use client'

import { useEffect, useState } from 'react'
import { BookOpen, RefreshCw, Flame, Check, BarChart2, PenLine, ArrowRight } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

const PEXELS_IMG = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200'
const STORY_IMG  = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80'

const TOTAL = 3

// ── Dots ──────────────────────────────────────────────────────────────────────
function Dots({ current, color }: { current: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      {Array.from({ length: TOTAL }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6, height: 6, borderRadius: 99,
          background: i === current ? color : 'rgba(255,255,255,0.28)',
          transition: 'all 0.3s ease',
        }} />
      ))}
    </div>
  )
}

// ── Slide 1: Brand (full-screen photo) ───────────────────────────────────────
function Slide1({ isDark, onSkip, onNext }: { isDark: boolean; onSkip: () => void; onNext: () => void }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Full-screen image */}
      <img
        src={PEXELS_IMG}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
      />
      {/* Gradient overlay — dark from bottom, slight at top */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.10) 30%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.88) 100%)',
      }} />

      {/* SKIP — top right */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'flex-end', padding: '54px 24px 0' }}>
        <button type="button" onClick={onSkip} style={{
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 99, padding: '6px 16px', cursor: 'pointer',
          fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.9)',
          fontFamily: 'inherit', letterSpacing: '0.04em',
        }}>SKIP</button>
      </div>

      {/* Content — lower center area */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 28px 0' }}>
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <img src="/patto-logo.png" alt="" width={44} height={42} style={{ display: 'block', filter: 'brightness(0) invert(1)', opacity: 0.95 }} />
          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.35)' }} />
          <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>PATTO</span>
        </div>

        <h1 style={{
          fontSize: 38, fontWeight: 800, color: '#fff',
          margin: '0 0 12px', lineHeight: 1.18, letterSpacing: '-0.03em',
          wordBreak: 'keep-all',
          textShadow: '0 2px 16px rgba(0,0,0,0.3)',
        }}>
          영어를<br />매일 자연스럽게.
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', margin: '0 0 36px', letterSpacing: '0.01em', fontWeight: 400 }}>
          Read. Listen. Repeat.
        </p>
      </div>

      {/* Footer */}
      <div style={{ position: 'relative', zIndex: 2, padding: '0 24px', paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button type="button" onClick={onNext} style={{
          width: '100%', minHeight: 54, borderRadius: 16,
          background: '#fff', border: 'none', cursor: 'pointer',
          fontSize: 15.5, fontWeight: 700, color: '#1A1A2E',
          fontFamily: 'inherit', letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          다음 <ArrowRight style={{ width: 15, height: 15 }} strokeWidth={2.5} />
        </button>
        <Dots current={0} color="rgba(255,255,255,0.9)" />
      </div>
    </div>
  )
}

// ── Slide 2: Features ─────────────────────────────────────────────────────────
function Slide2({ isDark, onSkip, onNext }: { isDark: boolean; onSkip: () => void; onNext: () => void }) {
  const bg = isDark ? '#0E0F14' : '#F5F6FA'
  const cardBg = isDark ? '#1A1B22' : '#FFFFFF'
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
  const textDark = isDark ? '#FFFFFF' : '#1A1A2E'
  const textMid = isDark ? 'rgba(255,255,255,0.5)' : '#8E8E9A'
  const storyAccent = '#4A6FA8'
  const patternAccent = '#7B5EA7'
  const aiAccent = '#E07A30'
  const btnColor = storyAccent

  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* SKIP — top right */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '54px 24px 0', flexShrink: 0 }}>
        <button type="button" onClick={onSkip} style={{
          background: 'none', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
          borderRadius: 99, padding: '6px 16px', cursor: 'pointer',
          fontSize: 12.5, fontWeight: 600, color: textMid, fontFamily: 'inherit', letterSpacing: '0.04em',
        }}>SKIP</button>
      </div>

      {/* Header: icon + title side by side */}
      <div style={{ padding: '20px 26px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: isDark ? 'rgba(74,111,168,0.18)' : '#E8EEF8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen style={{ width: 20, height: 20, color: storyAccent }} strokeWidth={1.8} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: textDark, margin: 0, lineHeight: 1.25, letterSpacing: '-0.03em', wordBreak: 'keep-all' }}>
            읽고, 듣고, 반복하세요.
          </h2>
        </div>
        <p style={{ fontSize: 13.5, color: textMid, margin: '0 0 0 52px', lineHeight: 1.6, wordBreak: 'keep-all' }}>
          스토리와 패턴으로 실제 영어를 익혀요.
        </p>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
        {/* Top two cards */}
        <div style={{ display: 'flex', gap: 10, flex: '0 0 auto' }}>
          {/* Story card */}
          <div style={{
            flex: 1, borderRadius: 18, overflow: 'hidden',
            background: cardBg, border: `1px solid ${border}`,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)',
          }}>
            <div style={{ position: 'relative', height: 100 }}>
              <img src={STORY_IMG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', top: 8, left: 10 }}>
                <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase' }}>STORY</span>
              </div>
              <div style={{ position: 'absolute', bottom: 8, left: 10, right: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>An Ordinary Morning</p>
              </div>
            </div>
            <div style={{ padding: '10px 12px 12px' }}>
              <p style={{ fontSize: 11.5, color: textMid, margin: '0 0 8px', lineHeight: 1.55 }}>
                It was an ordinary morning, but something changed.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: 26, height: 26, borderRadius: 99, border: `1.5px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={textMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" /><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Pattern card */}
          <div style={{
            flex: 1, borderRadius: 18, padding: '14px 14px 12px',
            background: cardBg, border: `1px solid ${border}`,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)',
            display: 'flex', flexDirection: 'column',
          }}>
            <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.12em', color: patternAccent, textTransform: 'uppercase', marginBottom: 10, display: 'block' }}>PATTERN</span>
            <p style={{ fontSize: 15.5, fontWeight: 800, color: textDark, margin: '0 0 8px', lineHeight: 1.3 }}>
              I used to ~,<br />but now I ~.
            </p>
            <p style={{ fontSize: 11, color: textMid, margin: 0, lineHeight: 1.55, flex: 1 }}>
              나는 ~하곤 했지만,<br />지금은 ~해.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 99, border: `1.5px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw style={{ width: 12, height: 12, color: patternAccent }} strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* AI Review card */}
        <div style={{
          borderRadius: 18, padding: '14px 16px',
          background: cardBg, border: `1px solid ${border}`,
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'flex-start', gap: 12, flex: '0 0 auto',
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: aiAccent, textTransform: 'uppercase', margin: '0 0 8px' }}>AI REVIEW</p>
            <p style={{ fontSize: 14.5, fontStyle: 'italic', color: textDark, margin: 0, lineHeight: 1.65 }}>
              I used to be shy,<br />
              but now I&#39;m trying to<br />
              be more{' '}
              <span style={{ textDecoration: 'underline', textDecorationColor: aiAccent, textDecorationThickness: 1.5 }}>confident</span>.
            </p>
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: 99, flexShrink: 0,
            background: aiAccent, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 2,
          }}>A</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 20px', paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <button type="button" onClick={onNext} style={{
          width: '100%', minHeight: 52, borderRadius: 16,
          background: btnColor, border: 'none', cursor: 'pointer',
          fontSize: 15.5, fontWeight: 700, color: '#fff',
          fontFamily: 'inherit', letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          다음 <ArrowRight style={{ width: 15, height: 15 }} strokeWidth={2.5} />
        </button>
        <Dots current={1} color={isDark ? '#fff' : btnColor} />
      </div>
    </div>
  )
}

// ── Slide 3: Progress + CTA ───────────────────────────────────────────────────
function Slide3({ isDark, onFinish }: { isDark: boolean; onFinish: () => void }) {
  const bg = isDark ? '#0D1610' : '#EEF5F0'
  const cardBg = isDark ? '#14201A' : '#FFFFFF'
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'
  const textDark = isDark ? '#FFFFFF' : '#1A1A2E'
  const textMid = isDark ? 'rgba(255,255,255,0.45)' : '#9EA3AA'
  const green = '#2E7D5E'
  const greenLight = isDark ? '#1E4A35' : '#4CAF7D'
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top spacer */}
      <div style={{ height: 54, flexShrink: 0 }} />

      {/* Content */}
      <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
        {/* Icon + title side by side */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: isDark ? 'rgba(46,125,94,0.2)' : 'rgba(46,125,94,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BarChart2 style={{ width: 20, height: 20, color: green }} strokeWidth={1.8} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: textDark, margin: 0, lineHeight: 1.25, letterSpacing: '-0.03em', wordBreak: 'keep-all' }}>
              AI와 함께 계속 성장하세요.
            </h2>
          </div>
          <p style={{ fontSize: 13.5, color: textMid, margin: '0 0 0 52px', lineHeight: 1.6, wordBreak: 'keep-all' }}>
            기록하고, 확인하고, 작은 습관이 큰 변화를 만듭니다.
          </p>
        </div>

        {/* Today's Progress card */}
        <div style={{
          borderRadius: 20, padding: '16px 18px',
          background: cardBg, border: `1px solid ${border}`,
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
          flexShrink: 0,
        }}>
          <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', color: textMid, textTransform: 'uppercase', margin: '0 0 10px' }}>TODAY&#39;S PROGRESS</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <p style={{ fontSize: 32, fontWeight: 800, color: textDark, margin: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              5 <span style={{ fontSize: 18, fontWeight: 500, color: textMid }}>/ 7</span>
            </p>
            <div style={{ flex: 1 }} />
            <Flame style={{ width: 16, height: 16, color: '#FF6B2B' }} strokeWidth={2} />
            <span style={{ fontSize: 20, fontWeight: 800, color: textDark, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>12</span>
            <span style={{ fontSize: 11, color: textMid }}>연속</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: isDark ? 'rgba(255,255,255,0.08)' : '#E8EEE9', marginBottom: 14 }}>
            <div style={{ height: '100%', width: '71%', borderRadius: 99, background: `linear-gradient(to right, ${green}, ${greenLight})` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {days.map((d, i) => (
              <div key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 8.5, fontWeight: 600, color: textMid, letterSpacing: '0.04em' }}>{d}</span>
                <div style={{
                  width: 24, height: 24, borderRadius: 99,
                  background: i < 5 ? green : (isDark ? 'rgba(255,255,255,0.06)' : '#E8EEE9'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {i < 5
                    ? <Check style={{ width: 11, height: 11, color: '#fff' }} strokeWidth={2.5} />
                    : <div style={{ width: 5, height: 5, borderRadius: 99, background: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)' }} />
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          {[
            { label: 'STORIES COMPLETED', value: '18', Icon: BookOpen },
            { label: 'AI REVIEWS',         value: '7',  Icon: PenLine  },
          ].map(({ label, value, Icon }) => (
            <div key={label} style={{
              flex: 1, borderRadius: 20, padding: '14px 16px',
              background: cardBg, border: `1px solid ${border}`,
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
            }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', color: textMid, textTransform: 'uppercase', margin: '0 0 6px' }}>{label}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 30, fontWeight: 800, color: textDark, margin: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
                <Icon style={{ width: 20, height: 20, color: green, opacity: 0.7 }} strokeWidth={1.6} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with CTA */}
      <div style={{ padding: '16px 20px', paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button type="button" onClick={onFinish} style={{
          width: '100%', minHeight: 54, borderRadius: 16,
          background: green, border: 'none', cursor: 'pointer',
          fontSize: 16, fontWeight: 700, color: '#fff',
          fontFamily: 'inherit', letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          PATTO 시작하기
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingTop: 2 }}>
          <button type="button" onClick={onFinish} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13.5, color: textMid, fontFamily: 'inherit', fontWeight: 500,
          }}>건너뛰기</button>
          <Dots current={2} color={isDark ? '#fff' : green} />
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
type Props = { onComplete: () => void }

export function OnboardingScreen({ onComplete }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [slide, setSlide] = useState(0)
  const [outgoing, setOutgoing] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)
  const [visible, setVisible] = useState(true)

  // Lock body scroll while onboarding is shown
  useEffect(() => {
    const prev = document.body.style.cssText
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.top = '0'
    return () => {
      document.body.style.cssText = prev
    }
  }, [])

  function goTo(next: number) {
    if (animating) return
    setAnimating(true)
    setOutgoing(slide)
    setTimeout(() => {
      setSlide(next)
      setOutgoing(null)
      setAnimating(false)
    }, 320)
  }

  function finish() {
    setVisible(false)
    setTimeout(onComplete, 300)
  }

  function renderSlide(idx: number) {
    if (idx === 0) return <Slide1 isDark={isDark} onSkip={finish} onNext={() => goTo(1)} />
    if (idx === 1) return <Slide2 isDark={isDark} onSkip={finish} onNext={() => goTo(2)} />
    return <Slide3 isDark={isDark} onFinish={finish} />
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      overflow: 'hidden',
      opacity: visible ? 1 : 0,
      transition: 'opacity 300ms ease',
      touchAction: 'none',
      overscrollBehavior: 'none',
    }}>
      {/* Outgoing slide — fades out + slides up slightly */}
      {outgoing !== null && (
        <div key={`out-${outgoing}`} style={{
          position: 'absolute', inset: 0,
          animation: 'slide-out 320ms ease forwards',
          zIndex: 1,
        }}>
          {renderSlide(outgoing)}
        </div>
      )}

      {/* Current slide — fades in */}
      <div key={`in-${slide}`} style={{
        position: 'absolute', inset: 0,
        animation: outgoing !== null ? 'slide-in 320ms ease forwards' : 'none',
        zIndex: 2,
      }}>
        {renderSlide(slide)}
      </div>

      <style>{`
        @keyframes slide-out {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(-24px) scale(0.97); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
