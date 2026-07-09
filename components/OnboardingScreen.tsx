'use client'

import { useRef, useState } from 'react'
import { BookOpen, RefreshCw, Flame, Check, BarChart2, PenLine } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

const BRAND_IMG = 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80'
const STORY_IMG = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80'

const TOTAL = 3

// ── Slide 1: Brand ────────────────────────────────────────────────────────────
function Slide1({ isDark, onSkip, onNext }: { isDark: boolean; onSkip: () => void; onNext: () => void }) {
  const bg = isDark ? '#0A0A0A' : '#F9F6F1'
  const textDark = isDark ? '#FFFFFF' : '#1A1A2E'
  const textMid = isDark ? 'rgba(255,255,255,0.55)' : '#555566'

  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, display: 'flex', flexDirection: 'column' }}>
      {/* Skip button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '56px 24px 0' }}>
        <button type="button" onClick={onSkip} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '8px 4px',
          fontSize: 14, fontWeight: 500, color: textMid, fontFamily: 'inherit',
        }}>건너뛰기</button>
      </div>

      {/* Logo row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 28px 0' }}>
        <img src="/patto-logo.png" alt="" width={48} height={46} style={{ display: 'block', opacity: isDark ? 0.9 : 1 }} />
        <div style={{ width: 1, height: 32, background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }} />
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.04em', color: textDark, lineHeight: 1 }}>PATTO</span>
      </div>

      {/* Hero image */}
      <div style={{ flex: 1, margin: '20px 0 0', position: 'relative', overflow: 'hidden' }}>
        <img
          src={BRAND_IMG}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* Gradient overlay at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
          background: isDark
            ? 'linear-gradient(to top, rgba(10,10,10,0.98) 0%, rgba(10,10,10,0.85) 40%, transparent 100%)'
            : 'linear-gradient(to top, rgba(249,246,241,0.98) 0%, rgba(249,246,241,0.85) 40%, transparent 100%)',
        }} />

        {/* Text over image */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 28px 32px' }}>
          <h1 style={{
            fontSize: 36, fontWeight: 800, color: textDark,
            margin: '0 0 10px', lineHeight: 1.2, letterSpacing: '-0.03em',
            wordBreak: 'keep-all',
          }}>
            영어를<br />매일 자연스럽게.
          </h1>
          <p style={{ fontSize: 15, color: textMid, margin: 0, fontWeight: 400, letterSpacing: '0.01em' }}>
            Read. Listen. Repeat.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '20px 24px', paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))' }}>
        <Dots current={0} total={TOTAL} isDark={isDark} />
      </div>
    </div>
  )
}

// ── Slide 2: Features ─────────────────────────────────────────────────────────
function Slide2({ isDark, onSkip, onNext, onBack }: { isDark: boolean; onSkip: () => void; onNext: () => void; onBack: () => void }) {
  const bg = isDark ? '#0E0F14' : '#F5F6FA'
  const cardBg = isDark ? '#1A1B22' : '#FFFFFF'
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
  const textDark = isDark ? '#FFFFFF' : '#1A1A2E'
  const textMid = isDark ? 'rgba(255,255,255,0.5)' : '#8E8E9A'
  const storyAccent = '#4A6FA8'
  const patternAccent = '#7B5EA7'
  const aiAccent = '#E07A30'

  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, display: 'flex', flexDirection: 'column' }}
      onClick={onNext}
    >
      {/* Skip button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '56px 24px 0', flexShrink: 0 }}>
        <button type="button" onClick={e => { e.stopPropagation(); onSkip() }} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '8px 4px',
          fontSize: 14, fontWeight: 500, color: textMid, fontFamily: 'inherit',
        }}>건너뛰기</button>
      </div>

      {/* Header text */}
      <div style={{ padding: '18px 26px 0', flexShrink: 0 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 14,
          background: isDark ? 'rgba(74,111,168,0.15)' : '#E8EEF8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <BookOpen style={{ width: 22, height: 22, color: storyAccent }} strokeWidth={1.8} />
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: textDark, margin: '0 0 8px', lineHeight: 1.25, letterSpacing: '-0.03em', wordBreak: 'keep-all' }}>
          읽고, 듣고, 반복하세요.
        </h2>
        <p style={{ fontSize: 14, color: textMid, margin: 0, lineHeight: 1.6, wordBreak: 'keep-all' }}>
          스토리와 패턴으로<br />실제 영어를 익혀요.
        </p>
      </div>

      {/* Cards area */}
      <div style={{ flex: 1, padding: '18px 16px 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3, wordBreak: 'keep-all' }}>An Ordinary Morning</p>
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
          borderRadius: 18, padding: '14px 16px 14px',
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
      <div style={{ padding: '16px 24px', paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))', flexShrink: 0 }}>
        <Dots current={1} total={TOTAL} isDark={isDark} />
      </div>
    </div>
  )
}

// ── Slide 3: Progress + CTA ───────────────────────────────────────────────────
function Slide3({ isDark, onFinish, onBack }: { isDark: boolean; onFinish: () => void; onBack: () => void }) {
  const bg = isDark ? '#0D1610' : '#EEF5F0'
  const cardBg = isDark ? '#14201A' : '#FFFFFF'
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'
  const textDark = isDark ? '#FFFFFF' : '#1A1A2E'
  const textMid = isDark ? 'rgba(255,255,255,0.45)' : '#9EA3AA'
  const green = '#2E7D5E'
  const greenLight = isDark ? '#1E4A35' : '#4CAF7D'

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, display: 'flex', flexDirection: 'column' }}>
      {/* Header space */}
      <div style={{ height: 56, flexShrink: 0 }} />

      {/* Content */}
      <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
        {/* Icon + headline */}
        <div style={{ textAlign: 'center', paddingTop: 10, flexShrink: 0 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: isDark ? 'rgba(46,125,94,0.2)' : 'rgba(46,125,94,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <BarChart2 style={{ width: 26, height: 26, color: green }} strokeWidth={1.8} />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: textDark, margin: '0 0 8px', lineHeight: 1.25, letterSpacing: '-0.03em', wordBreak: 'keep-all' }}>
            AI와 함께<br />계속 성장하세요.
          </h2>
          <p style={{ fontSize: 13.5, color: textMid, margin: 0, lineHeight: 1.6, wordBreak: 'keep-all' }}>
            기록하고, 확인하고,<br />작은 습관이 큰 변화를 만듭니다.
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
          {/* Progress row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <p style={{ fontSize: 32, fontWeight: 800, color: textDark, margin: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              5 <span style={{ fontSize: 18, fontWeight: 500, color: textMid }}>/ 7</span>
            </p>
            <div style={{ flex: 1 }} />
            <Flame style={{ width: 16, height: 16, color: '#FF6B2B' }} strokeWidth={2} />
            <div>
              <span style={{ fontSize: 20, fontWeight: 800, color: textDark, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>12</span>
              <span style={{ fontSize: 11, color: textMid, marginLeft: 3 }}>연속</span>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height: 6, borderRadius: 99, background: isDark ? 'rgba(255,255,255,0.08)' : '#E8EEE9', marginBottom: 14 }}>
            <div style={{ height: '100%', width: '71%', borderRadius: 99, background: `linear-gradient(to right, ${green}, ${greenLight})` }} />
          </div>
          {/* Days */}
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

        {/* Stat cards row */}
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <div style={{
            flex: 1, borderRadius: 20, padding: '14px 16px',
            background: cardBg, border: `1px solid ${border}`,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
          }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', color: textMid, textTransform: 'uppercase', margin: '0 0 6px' }}>STORIES COMPLETED</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 30, fontWeight: 800, color: textDark, margin: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>18</p>
              <BookOpen style={{ width: 20, height: 20, color: green, opacity: 0.7 }} strokeWidth={1.6} />
            </div>
          </div>
          <div style={{
            flex: 1, borderRadius: 20, padding: '14px 16px',
            background: cardBg, border: `1px solid ${border}`,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
          }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', color: textMid, textTransform: 'uppercase', margin: '0 0 6px' }}>AI REVIEWS</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 30, fontWeight: 800, color: textDark, margin: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>7</p>
              <PenLine style={{ width: 20, height: 20, color: green, opacity: 0.7 }} strokeWidth={1.6} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer with CTA */}
      <div style={{ padding: '12px 20px', paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))', flexShrink: 0 }}>
        <button
          type="button"
          onClick={onFinish}
          style={{
            width: '100%', minHeight: 54, borderRadius: 16,
            background: green,
            border: 'none', cursor: 'pointer',
            fontSize: 16, fontWeight: 700, color: '#fff',
            fontFamily: 'inherit', letterSpacing: '-0.01em',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 4,
          }}
        >
          PATTO 시작하기
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <button type="button" onClick={onFinish} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13.5, color: textMid, fontFamily: 'inherit', fontWeight: 500,
          }}>건너뛰기</button>
          <Dots current={2} total={TOTAL} isDark={isDark} color={green} />
        </div>
      </div>
    </div>
  )
}

// ── Dots indicator ────────────────────────────────────────────────────────────
function Dots({ current, total, isDark, color }: { current: number; total: number; isDark: boolean; color?: string }) {
  const activeColor = color ?? (isDark ? '#fff' : '#1A1A2E')
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6, height: 6, borderRadius: 99,
          background: i === current ? activeColor : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'),
          transition: 'all 0.3s ease',
        }} />
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
type Props = { onComplete: () => void }

export function OnboardingScreen({ onComplete }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [slide, setSlide] = useState(0)
  const [fading, setFading] = useState(false)
  const [visible, setVisible] = useState(true)
  const touchX = useRef<number | null>(null)

  function changeSlide(next: number) {
    if (fading || next < 0 || next >= TOTAL) return
    setFading(true)
    setTimeout(() => { setSlide(next); setFading(false) }, 200)
  }

  function finish() {
    setVisible(false)
    setTimeout(onComplete, 260)
  }

  const commonTouch = {
    onTouchStart: (e: React.TouchEvent) => { touchX.current = e.targetTouches[0].clientX },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX.current === null) return
      const delta = e.changedTouches[0].clientX - touchX.current
      touchX.current = null
      if (delta < -48 && slide < TOTAL - 1) changeSlide(slide + 1)
      else if (delta > 48 && slide > 0) changeSlide(slide - 1)
    },
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        opacity: visible ? 1 : 0,
        transition: visible ? 'none' : 'opacity 260ms ease',
        overflow: 'hidden',
      }}
      {...commonTouch}
    >
      <div style={{
        position: 'absolute', inset: 0,
        opacity: fading ? 0 : 1,
        transform: fading ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}>
        {slide === 0 && (
          <Slide1
            isDark={isDark}
            onSkip={finish}
            onNext={() => changeSlide(1)}
          />
        )}
        {slide === 1 && (
          <Slide2
            isDark={isDark}
            onSkip={finish}
            onNext={() => changeSlide(2)}
            onBack={() => changeSlide(0)}
          />
        )}
        {slide === 2 && (
          <Slide3
            isDark={isDark}
            onFinish={finish}
            onBack={() => changeSlide(1)}
          />
        )}
      </div>
    </div>
  )
}
