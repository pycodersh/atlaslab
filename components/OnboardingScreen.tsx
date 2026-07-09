'use client'

import { useEffect, useState } from 'react'
import { BookOpen, RefreshCw, Flame, Check, BarChart2, PenLine, ArrowRight } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

const PEXELS_CAFE = 'https://images.pexels.com/photos/10310055/pexels-photo-10310055.jpeg?auto=compress&cs=tinysrgb&h=1600&w=900'
const STORY_THUMB = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&q=80'
const TOTAL = 3

// ── Dots ──────────────────────────────────────────────────────────────────────
function Dots({ current, color }: { current: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      {Array.from({ length: TOTAL }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6, height: 6, borderRadius: 99,
          background: i === current ? color : 'rgba(180,180,200,0.35)',
          transition: 'all 0.3s ease',
        }} />
      ))}
    </div>
  )
}

// ── Screen 1: Welcome ─────────────────────────────────────────────────────────
function Screen1({ isDark, onSkip, onNext }: { isDark: boolean; onSkip: () => void; onNext: () => void }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#111' }}>
      {/* Background photo */}
      <img
        src={PEXELS_CAFE}
        alt=""
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          display: 'block',
        }}
      />
      {/* Gradient overlay — dark at bottom, slight at top */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.88) 100%)',
      }} />

      {/* SKIP — top right */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'flex-end', padding: 'calc(env(safe-area-inset-top,0px) + 10px) 24px 0' }}>
        <button type="button" onClick={onSkip} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '6px 2px',
          fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)',
          fontFamily: 'inherit', letterSpacing: '0.06em',
        }}>SKIP</button>
      </div>

      {/* Center-bottom content */}
      <div style={{
        position: 'relative', zIndex: 2,
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        paddingBottom: 32,
      }}>
        <img
          src="/patto-logo.png"
          alt="PATTO"
          width={52} height={50}
          style={{ display: 'block', filter: 'brightness(0) invert(1)', opacity: 0.97, marginBottom: 10 }}
        />
        <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '0.06em' }}>PATTO</p>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.68)', margin: 0, letterSpacing: '0.03em', fontStyle: 'italic' }}>Read. Listen. Repeat.</p>
      </div>

      {/* Footer */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '0 24px', paddingBottom: 'calc(env(safe-area-inset-bottom,0px) + 28px)',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <button type="button" onClick={onNext} style={{
          width: '100%', minHeight: 54, borderRadius: 99,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.35)',
          cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#fff',
          fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          다음 <ArrowRight style={{ width: 15, height: 15 }} strokeWidth={2.5} />
        </button>
        <Dots current={0} color="rgba(255,255,255,0.9)" />
      </div>
    </div>
  )
}

// ── Screen 2: Learn ───────────────────────────────────────────────────────────
function Screen2({ isDark, onSkip, onNext }: { isDark: boolean; onSkip: () => void; onNext: () => void }) {
  const bg      = isDark ? '#0E0F14' : '#F8F8FC'
  const card    = isDark ? '#1A1B23' : '#FFFFFF'
  const border  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
  const title   = isDark ? '#FFFFFF' : '#1A1A2E'
  const sub     = isDark ? 'rgba(255,255,255,0.48)' : '#9095A0'
  const accent  = '#4A6FA8'
  const shadow  = isDark ? '0 4px 18px rgba(0,0,0,0.32)' : '0 4px 18px rgba(0,0,0,0.07)'

  const cards = [
    {
      id: 'story',
      label: 'STORY',
      desc: '실제 이야기를\n읽고 들어요.',
      visual: (
        <img
          src={STORY_THUMB}
          alt=""
          style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 12, display: 'block' }}
        />
      ),
    },
    {
      id: 'pattern',
      label: 'PATTERN',
      desc: '자주 쓰는 표현을\n반복해요.',
      visual: (
        <div style={{
          width: '100%', aspectRatio: '1/1', borderRadius: 12,
          background: isDark ? 'rgba(123,94,167,0.12)' : '#F0EBF8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <RefreshCw style={{ width: 32, height: 32, color: '#7B5EA7', opacity: 0.85 }} strokeWidth={1.6} />
        </div>
      ),
    },
    {
      id: 'ai',
      label: 'AI REVIEW',
      desc: 'AI가 자연스럽게\n첨삭해요.',
      visual: (
        <div style={{
          width: '100%', aspectRatio: '1/1', borderRadius: 12,
          background: isDark ? 'rgba(46,125,94,0.12)' : '#EDFAF3',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <PenLine style={{ width: 32, height: 32, color: '#2E7D5E', opacity: 0.85 }} strokeWidth={1.6} />
        </div>
      ),
    },
  ]

  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, display: 'flex', flexDirection: 'column' }}>
      {/* SKIP */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 'calc(env(safe-area-inset-top,0px) + 10px) 24px 0', flexShrink: 0 }}>
        <button type="button" onClick={onSkip} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '6px 2px',
          fontSize: 13, fontWeight: 600, color: sub, fontFamily: 'inherit', letterSpacing: '0.06em',
        }}>SKIP</button>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '20px 28px 0', flexShrink: 0 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 20, margin: '0 auto 18px',
          background: isDark ? 'rgba(74,111,168,0.16)' : '#E8EFF8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BookOpen style={{ width: 28, height: 28, color: accent }} strokeWidth={1.7} />
        </div>
        <h2 style={{
          fontSize: 26, fontWeight: 800, color: title,
          margin: '0 0 10px', lineHeight: 1.25, letterSpacing: '-0.03em', wordBreak: 'keep-all',
        }}>읽고, 듣고, 반복하세요.</h2>
        <p style={{ fontSize: 14, color: sub, margin: 0, lineHeight: 1.6, wordBreak: 'keep-all' }}>
          스토리와 패턴으로 실제 영어를 익혀요.
        </p>
      </div>

      {/* 3 cards */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          {cards.map(c => (
            <div key={c.id} style={{
              flex: 1, borderRadius: 18, overflow: 'hidden',
              background: card, border: `1px solid ${border}`, boxShadow: shadow,
              display: 'flex', flexDirection: 'column', padding: '12px 10px 14px', gap: 10,
            }}>
              {c.visual}
              <div>
                <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.10em', color: sub, textTransform: 'uppercase', margin: '0 0 4px' }}>{c.label}</p>
                <p style={{ fontSize: 11, color: title, margin: 0, lineHeight: 1.55, fontWeight: 500, whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '20px 24px', paddingBottom: 'calc(env(safe-area-inset-bottom,0px) + 28px)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button type="button" onClick={onNext} style={{
          width: '100%', minHeight: 52, borderRadius: 16,
          background: accent, border: 'none', cursor: 'pointer',
          fontSize: 15.5, fontWeight: 700, color: '#fff',
          fontFamily: 'inherit', letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          다음 <ArrowRight style={{ width: 15, height: 15 }} strokeWidth={2.5} />
        </button>
        <Dots current={1} color={isDark ? '#fff' : accent} />
      </div>
    </div>
  )
}

// ── Screen 3: Grow ────────────────────────────────────────────────────────────
function Screen3({ isDark, onFinish }: { isDark: boolean; onFinish: () => void }) {
  const bg      = isDark ? '#0D1610' : '#EEF5F0'
  const card    = isDark ? '#14201A' : '#FFFFFF'
  const border  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'
  const title   = isDark ? '#FFFFFF' : '#1A1A2E'
  const sub     = isDark ? 'rgba(255,255,255,0.45)' : '#9095A0'
  const green   = '#2E7D5E'
  const greenG  = isDark ? '#3DA876' : '#4CAF7D'
  const shadow  = isDark ? '0 4px 18px rgba(0,0,0,0.32)' : '0 4px 18px rgba(0,0,0,0.06)'
  const days    = ['MON','TUE','WED','THU','FRI','SAT','SUN']

  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: 'calc(env(safe-area-inset-top,0px) + 28px) 28px 0', flexShrink: 0 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 20, margin: '0 auto 18px',
          background: isDark ? 'rgba(46,125,94,0.18)' : 'rgba(46,125,94,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BarChart2 style={{ width: 28, height: 28, color: green }} strokeWidth={1.7} />
        </div>
        <h2 style={{
          fontSize: 26, fontWeight: 800, color: title,
          margin: '0 0 10px', lineHeight: 1.25, letterSpacing: '-0.03em', wordBreak: 'keep-all',
        }}>AI와 함께<br />계속 성장하세요.</h2>
        <p style={{ fontSize: 14, color: sub, margin: 0, lineHeight: 1.6, wordBreak: 'keep-all' }}>
          기록하고, 확인하고,<br />작은 습관이 큰 변화를 만듭니다.
        </p>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, padding: '22px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Progress card */}
        <div style={{ borderRadius: 20, padding: '18px 18px', background: card, border: `1px solid ${border}`, boxShadow: shadow, flexShrink: 0 }}>
          <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', color: sub, textTransform: 'uppercase', margin: '0 0 12px' }}>TODAY'S PROGRESS</p>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 30, fontWeight: 800, color: title, margin: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              5 <span style={{ fontSize: 17, fontWeight: 500, color: sub }}>/  7</span>
            </p>
            <div style={{ flex: 1 }} />
            <Flame style={{ width: 15, height: 15, color: '#FF6B2B', marginRight: 5 }} strokeWidth={2} />
            <span style={{ fontSize: 20, fontWeight: 800, color: title, fontVariantNumeric: 'tabular-nums' }}>12</span>
            <span style={{ fontSize: 11, color: sub, marginLeft: 3 }}>연속</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: isDark ? 'rgba(255,255,255,0.08)' : '#DFF0E7', marginBottom: 16 }}>
            <div style={{ height: '100%', width: '71%', borderRadius: 99, background: `linear-gradient(to right, ${green}, ${greenG})` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {days.map((d, i) => (
              <div key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 8, fontWeight: 600, color: sub, letterSpacing: '0.03em' }}>{d}</span>
                <div style={{
                  width: 26, height: 26, borderRadius: 99,
                  background: i < 5 ? green : (isDark ? 'rgba(255,255,255,0.07)' : '#DFF0E7'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {i < 5
                    ? <Check style={{ width: 12, height: 12, color: '#fff' }} strokeWidth={2.5} />
                    : <div style={{ width: 5, height: 5, borderRadius: 99, background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }} />
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'flex', gap: 12, flex: 1 }}>
          {[
            { label: 'STORIES COMPLETED', value: '18', Icon: BookOpen },
            { label: 'AI REVIEWS', value: '7', Icon: PenLine },
          ].map(({ label, value, Icon }) => (
            <div key={label} style={{
              flex: 1, borderRadius: 20, padding: '18px 18px',
              background: card, border: `1px solid ${border}`, boxShadow: shadow,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', color: sub, textTransform: 'uppercase', margin: 0 }}>{label}</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 34, fontWeight: 800, color: title, margin: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
                <Icon style={{ width: 22, height: 22, color: green, opacity: 0.72 }} strokeWidth={1.6} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 20px', paddingBottom: 'calc(env(safe-area-inset-bottom,0px) + 28px)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <button type="button" onClick={onFinish} style={{
          width: '100%', minHeight: 54, borderRadius: 16,
          background: green, border: 'none', cursor: 'pointer',
          fontSize: 16, fontWeight: 700, color: '#fff',
          fontFamily: 'inherit', letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 6px 24px ${green}44`,
        }}>
          PATTO 시작하기
        </button>
        <Dots current={2} color={isDark ? '#fff' : green} />
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
type Props = { onComplete: () => void }

export function OnboardingScreen({ onComplete }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [slide, setSlide] = useState(0)
  const [outgoing, setOutgoing] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const prev = document.body.style.cssText
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.top = '0'
    return () => { document.body.style.cssText = prev }
  }, [])

  function goTo(next: number) {
    if (animating) return
    setAnimating(true)
    setOutgoing(slide)
    setTimeout(() => { setSlide(next); setOutgoing(null); setAnimating(false) }, 320)
  }

  function finish() {
    setVisible(false)
    setTimeout(onComplete, 300)
  }

  function render(idx: number) {
    if (idx === 0) return <Screen1 isDark={isDark} onSkip={finish} onNext={() => goTo(1)} />
    if (idx === 1) return <Screen2 isDark={isDark} onSkip={finish} onNext={() => goTo(2)} />
    return <Screen3 isDark={isDark} onFinish={finish} />
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998, overflow: 'hidden',
      opacity: visible ? 1 : 0, transition: 'opacity 300ms ease',
      touchAction: 'none', overscrollBehavior: 'none',
    } as React.CSSProperties}>
      {outgoing !== null && (
        <div key={`out-${outgoing}`} style={{ position: 'absolute', inset: 0, zIndex: 1, animation: 'ob-out 320ms ease forwards' }}>
          {render(outgoing)}
        </div>
      )}
      <div key={`in-${slide}`} style={{ position: 'absolute', inset: 0, zIndex: 2, animation: outgoing !== null ? 'ob-in 320ms ease forwards' : 'none' }}>
        {render(slide)}
      </div>
      <style>{`
        @keyframes ob-out { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(-28px) scale(0.96)} }
        @keyframes ob-in  { from{opacity:0;transform:translateY(28px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>
    </div>
  )
}
