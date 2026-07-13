'use client'

import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type OrbState = 'idle' | 'speaking' | 'waiting' | 'done'
type Corner   = 'br' | 'bl' | 'tr' | 'tl'
type CardSize = 'small' | 'medium' | 'large'

// ── Static Orb ────────────────────────────────────────────────────────────────
const ORB_GRADIENTS: Record<OrbState, string> = {
  idle:     'radial-gradient(circle at 35% 35%, #C8D4FF 0%, #A6B8FF 50%, #8090F0 100%)',
  speaking: 'radial-gradient(circle at 35% 35%, #B8CCFF 0%, #6B8FFF 50%, #4060E0 100%)',
  waiting:  'radial-gradient(circle at 35% 35%, #C0D8FF 0%, #88A8FF 50%, #5070E8 100%)',
  done:     'radial-gradient(circle at 35% 35%, #E0EAFF 0%, #D7B56D 50%, #B8903A 100%)',
}

function StaticOrb({ state = 'idle' }: { state?: OrbState }) {
  return (
    <div style={{
      width: 52, height: 52, borderRadius: '50%',
      background: ORB_GRADIENTS[state],
      boxShadow: '0 4px 16px rgba(107,143,255,0.35), 0 0 0 1px rgba(255,255,255,0.3) inset',
      flexShrink: 0,
      transition: 'background 0.4s ease',
    }} />
  )
}

// ── Card Shell ────────────────────────────────────────────────────────────────
function CardShell({
  children, corner = 'br', size = 'medium', isDark, animate = true,
}: {
  children: React.ReactNode
  corner?: Corner
  size?: CardSize
  isDark: boolean
  animate?: boolean
}) {
  const isRight  = corner.endsWith('r')
  const isBottom = corner.startsWith('b')
  const n = 4
  const baseR = size === 'small' ? 14 : size === 'medium' ? 16 : 18
  const borderRadius = isRight
    ? `${baseR}px ${baseR}px ${n}px ${baseR}px`
    : `${baseR}px ${baseR}px ${baseR}px ${n}px`
  const padding = size === 'small' ? '10px 14px' : '14px 16px'
  const minWidth = size === 'small' ? 120 : size === 'medium' ? 200 : 240
  const maxWidth = size === 'small' ? 220 : size === 'medium' ? 260 : 280

  const cardBg     = isDark ? 'rgba(28,22,58,0.94)' : 'rgba(255,255,255,0.92)'
  const cardBorder = isDark
    ? '0.5px solid rgba(142,167,255,0.22)'
    : '0.5px solid rgba(200,215,245,0.60)'

  const aniClass = animate
    ? `dock-card-in-b${isRight ? 'r' : 'l'}`
    : undefined

  return (
    <div
      className={aniClass}
      style={{
        minWidth, maxWidth, borderRadius, padding,
        background: cardBg,
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: cardBorder,
        boxShadow: '0 4px 24px rgba(107,143,255,0.10), 0 1px 4px rgba(107,143,255,0.06)',
      }}
    >
      {children}
    </div>
  )
}

// ── Whisper Card Content ──────────────────────────────────────────────────────
function WhisperContent({ message, ms, isDark }: { message: string; ms?: number; isDark: boolean }) {
  const textMain = isDark ? '#e8e0f8' : '#1a1a2e'
  return (
    <>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: textMain, lineHeight: 1.4, letterSpacing: '-0.01em' }}>
        {message}
      </p>
      {ms && (
        <div style={{
          marginTop: 8, height: 2,
          background: isDark ? 'rgba(142,167,255,0.12)' : 'rgba(142,167,255,0.15)',
          borderRadius: 1, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #6B8FFF, #A6B8FF)',
            transformOrigin: 'left center',
            animationName: 'whisperProgress',
            animationDuration: `${ms}ms`,
            animationTimingFunction: 'linear',
            animationFillMode: 'forwards',
            animationIterationCount: 'infinite',
            willChange: 'transform',
          }} />
        </div>
      )}
    </>
  )
}

// ── Shared button styles ──────────────────────────────────────────────────────
const BTN_BASE: React.CSSProperties = {
  flex: 1,
  height: 36,
  borderRadius: 18,
  fontSize: 13,
  fontFamily: 'inherit',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 5,
  border: 'none',
}
const BTN_PRIMARY: React.CSSProperties = {
  ...BTN_BASE,
  background: '#6B8FFF',
  color: '#ffffff',
  fontWeight: 600,
}
const BTN_SECONDARY: React.CSSProperties = {
  ...BTN_BASE,
  background: '#ffffff',
  border: '1px solid #D0D5F0',
  color: '#6B8FFF',
  fontWeight: 500,
}

// ── Action Card Content ───────────────────────────────────────────────────────
type ActionBtn = {
  label: string
  variant?: 'primary' | 'secondary' | 'play' | 'done'
}

function ActionContent({
  message, subtext, buttons, isDark,
}: { message: string; subtext?: string; buttons?: ActionBtn[]; isDark: boolean }) {
  const textMain = isDark ? '#e8e0f8' : '#1a1a2e'
  const textSub  = isDark ? 'rgba(232,224,248,0.55)' : '#7a7a9a'
  const count = buttons?.length ?? 0

  // Sort: secondary left, primary right when 2 buttons
  const sorted = count === 2
    ? [...(buttons ?? [])].sort((a, b) => {
        const aP = a.variant === 'primary' || a.variant === 'done' || a.variant === 'play'
        const bP = b.variant === 'primary' || b.variant === 'done' || b.variant === 'play'
        return Number(aP) - Number(bP)
      })
    : (buttons ?? [])

  return (
    <>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: textMain, lineHeight: 1.4, letterSpacing: '-0.01em', whiteSpace: 'nowrap', marginBottom: (subtext || count) ? 4 : 0 }}>
        {message}
      </p>
      {subtext && (
        <p style={{ margin: 0, marginBottom: count ? 10 : 0, fontSize: 12, color: textSub, lineHeight: 1.5 }}>
          {subtext}
        </p>
      )}
      {count > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: count === 1 ? 'center' : 'space-between' }}>
          {sorted.map((btn, i) => {
            if (btn.variant === 'play') return (
              <button key={i} style={BTN_PRIMARY}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21"/></svg>
                {btn.label}
              </button>
            )
            if (btn.variant === 'done') return (
              <button key={i} style={BTN_PRIMARY}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {btn.label}
              </button>
            )
            const isPrimary = btn.variant === 'primary'
            return (
              <button key={i} style={isPrimary ? BTN_PRIMARY : BTN_SECONDARY}>
                {btn.label}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

// ── Session Card Content ──────────────────────────────────────────────────────
function SessionContent({
  label, title, subtext, primaryBtns, ghostBtns, isDark,
}: { label: string; title: string; subtext?: string; primaryBtns: string[]; ghostBtns: string[]; isDark: boolean }) {
  const textMain = isDark ? '#e8e0f8' : '#1a1a2e'
  const textSub  = isDark ? 'rgba(232,224,248,0.55)' : '#7a7a9a'
  const divider  = isDark ? 'rgba(142,167,255,0.15)' : 'rgba(142,167,255,0.12)'

  // Merge: ghost (secondary) first, primary last → secondary left / primary right
  const allBtns = [
    ...ghostBtns.map(lbl => ({ lbl, isPrimary: false })),
    ...primaryBtns.map(lbl => ({ lbl, isPrimary: true })),
  ]
  const count = allBtns.length

  return (
    <>
      <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#8EA7FF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: textMain, lineHeight: 1.35, letterSpacing: '-0.01em', fontFamily: 'var(--font-playfair, serif)', marginBottom: subtext ? 4 : 0 }}>
        {title}
      </p>
      {subtext && (
        <p style={{ margin: 0, fontSize: 12, color: textSub, lineHeight: 1.5 }}>
          {subtext}
        </p>
      )}
      <div style={{ height: 0, borderTop: `0.5px solid ${divider}`, margin: '12px 0' }} />
      <div style={{ display: 'flex', gap: 8, justifyContent: count === 1 ? 'center' : 'space-between' }}>
        {allBtns.map(({ lbl, isPrimary }, i) => (
          <button key={i} style={{
            ...(isPrimary ? BTN_PRIMARY : BTN_SECONDARY),
            boxShadow: 'none',
          }}>
            {lbl}
          </button>
        ))}
      </div>
    </>
  )
}

// ── Help Card Content ─────────────────────────────────────────────────────────
function HelpContent({ isDark }: { isDark: boolean }) {
  const textColor  = isDark ? '#e8e0f8' : '#1a1a2e'
  const textExit   = isDark ? '#E05C5C' : '#D04040'
  const iconBg     = isDark ? 'rgba(142,167,255,0.12)' : 'rgba(107,143,255,0.08)'
  const iconBgExit = isDark ? 'rgba(224,92,92,0.12)'   : 'rgba(208,64,64,0.08)'
  const divider    = isDark ? 'rgba(142,167,255,0.10)' : 'rgba(142,167,255,0.12)'

  const items = [
    { label: 'Repeat', icon: 'repeat', exit: false },
    { label: 'Pause',  icon: 'pause',  exit: false },
    { label: 'Exit',   icon: 'exit',   exit: true  },
  ]

  return (
    <div style={{ minWidth: 150 }}>
      <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8EA7FF' }}>
        도움이 필요하세요?
      </p>
      {items.map((item, i) => (
        <div key={item.icon}>
          {i > 0 && <div style={{ height: 0, borderTop: `0.5px solid ${divider}` }} />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: item.exit ? iconBgExit : iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.icon === 'repeat' && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#A6B8FF' : '#6B8FFF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
              )}
              {item.icon === 'pause' && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#A6B8FF' : '#6B8FFF'} strokeWidth="2.5" strokeLinecap="round"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
              )}
              {item.icon === 'exit' && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={textExit} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              )}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: item.exit ? textExit : textColor }}>
              {item.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Orb + Card Row ────────────────────────────────────────────────────────────
function OrbWithCard({ corner, size, isDark, orbState, children }: {
  corner: Corner; size: CardSize; isDark: boolean; orbState: OrbState; children: React.ReactNode
}) {
  const isRight  = corner.endsWith('r')
  const isBottom = corner.startsWith('b')
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: isBottom ? 'flex-end' : 'flex-start', gap: 8, flexDirection: isRight ? 'row-reverse' : 'row' }}>
      <StaticOrb state={orbState} />
      <div style={{ [isBottom ? 'alignSelf' : 'alignSelf']: isBottom ? 'flex-end' : 'flex-start' }}>
        <CardShell corner={corner} size={size} isDark={isDark} animate={false}>
          {children}
        </CardShell>
      </div>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children, isDark }: { title: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <p style={{
        margin: '0 0 16px',
        fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
        color: '#8EA7FF', textTransform: 'uppercase',
      }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
      {children}
    </div>
  )
}

// ── SlideSession Mock Layout ───────────────────────────────────────────────────
function SlideSessionMock({ isDark, orbState }: { isDark: boolean; orbState: OrbState }) {
  const bg = isDark ? 'rgba(12,12,20,0.95)' : 'rgba(255,255,255,0.65)'
  const textColor = isDark ? '#e8e0f8' : '#1a1a2e'
  const subColor  = isDark ? 'rgba(232,224,248,0.45)' : '#5a5a7a'

  return (
    <div style={{
      position: 'relative', width: '100%', maxWidth: 375, height: 560,
      background: isDark ? '#1a1525' : 'var(--pb)',
      backgroundImage: isDark ? undefined : "url('/bg-light.svg')",
      backgroundSize: 'cover', backgroundPosition: 'center',
      borderRadius: 24, overflow: 'hidden',
      border: isDark ? '1px solid rgba(142,167,255,0.15)' : '1px solid rgba(200,215,245,0.5)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '14px 20px 10px' }}>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.10em',
          color: '#8EA7FF', textTransform: 'uppercase',
          background: 'rgba(142,167,255,0.1)',
          border: '0.5px solid rgba(142,167,255,0.2)',
          borderRadius: 20, padding: '3px 10px',
        }}>
          Session 1
        </span>
      </div>
      {/* Progress bar */}
      <div style={{ height: 2, background: isDark ? 'rgba(142,167,255,0.12)' : 'rgba(142,167,255,0.15)', margin: '0 20px' }}>
        <div style={{ width: '35%', height: '100%', background: '#6B8FFF', borderRadius: 1 }} />
      </div>

      {/* Story slide content */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 8px' }}>
        <span style={{ fontSize: 9, fontWeight: 600, color: '#6B8FFF', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
          Story · Round 1
        </span>
        <div style={{ display: 'inline-flex', borderRadius: 10, background: 'rgba(255,255,255,0.5)', border: '0.5px solid rgba(107,143,255,0.18)', padding: 2 }}>
          {['EN', 'EN·KO', 'KO'].map((m, i) => (
            <span key={m} style={{
              padding: '4px 7px', borderRadius: 8, fontSize: 9, fontWeight: 600,
              background: i === 1 ? '#6B8FFF' : 'transparent',
              color: i === 1 ? '#fff' : '#8EA7FF',
            }}>{m}</span>
          ))}
        </div>
      </div>

      {/* Glass text card */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '0 16px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(24px)',
          border: '0.5px solid rgba(255,255,255,0.9)', borderRadius: 20, padding: 16,
        }}>
          {[
            "It's Sunday night, and a new week is almost here.",
            '일요일 밤이고, 새로운 한 주가 거의 다 왔다.',
            'I want to start something new this time.',
            '이번엔 새로운 걸 시작하고 싶다.',
          ].map((t, i) => (
            <p key={i} style={{
              margin: i < 3 ? '0 0 8px' : 0,
              fontSize: i % 2 === 0 ? 15 : 12,
              color: i % 2 === 0 ? '#1a1a2e' : '#5a5a7a',
              lineHeight: i % 2 === 0 ? 1.7 : 1.6,
            }}>
              {t}
            </p>
          ))}
        </div>
      </div>

      {/* Audio control bar */}
      <div style={{ padding: '8px 16px 16px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)',
          border: '0.5px solid rgba(255,255,255,0.85)', borderRadius: 20, padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', background: '#6B8FFF',
            boxShadow: '0 4px 12px rgba(107,143,255,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><polygon points="5,3 19,12 5,21"/></svg>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(107,143,255,0.1)', border: '0.5px solid rgba(107,143,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#6B8FFF"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
          </div>
          <span style={{ fontSize: 12, color: '#8a8aaa', flex: 1 }}>A New Start</span>
        </div>
      </div>

      {/* Orb + Card overlay */}
      <div style={{ position: 'absolute', bottom: 80, right: 20 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: 62, right: 0 }}>
            <CardShell corner="br" size="medium" isDark={isDark} animate={false}>
              <ActionContent
                message="들어보세요."
                buttons={[{ label: '▶ Play', variant: 'play' }]}
                isDark={isDark}
              />
            </CardShell>
          </div>
          <StaticOrb state={orbState} />
        </div>
      </div>
    </div>
  )
}

// ── Corner Position Demo ──────────────────────────────────────────────────────
function CornerDemo({ corner, isDark, orbState }: { corner: Corner; isDark: boolean; orbState: OrbState }) {
  const isRight  = corner.endsWith('r')
  const isBottom = corner.startsWith('b')
  const cornerLabel = { br: '우측 하단', bl: '좌측 하단', tr: '우측 상단', tl: '좌측 상단' }[corner]

  return (
    <div style={{
      position: 'relative', width: 280, height: 160,
      background: isDark ? 'rgba(28,22,58,0.4)' : 'rgba(255,255,255,0.4)',
      backdropFilter: 'blur(12px)',
      border: isDark ? '0.5px solid rgba(142,167,255,0.15)' : '0.5px solid rgba(200,215,245,0.6)',
      borderRadius: 16, overflow: 'hidden',
    }}>
      <span style={{
        position: 'absolute', top: 8, left: 10,
        fontSize: 9, fontWeight: 700, color: '#8EA7FF', letterSpacing: '0.08em',
      }}>
        {cornerLabel}
      </span>

      <div style={{
        position: 'absolute',
        [isBottom ? 'bottom' : 'top']: 12,
        [isRight  ? 'right'  : 'left']: 12,
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            [isBottom ? 'bottom' : 'top']: 62,
            [isRight  ? 'right'  : 'left']: 0,
          }}>
            <CardShell corner={corner} size="small" isDark={isDark} animate={false}>
              <ActionContent
                message="준비됐나요?"
                buttons={[{ label: 'Start', variant: 'primary' }]}
                isDark={isDark}
              />
            </CardShell>
          </div>
          <StaticOrb state={orbState} />
        </div>
      </div>
    </div>
  )
}

// ── Main Playground ───────────────────────────────────────────────────────────
export function TrainerUIPlayground() {
  const [isDark, setIsDark] = useState(false)
  const [orbState, setOrbState] = useState<OrbState>('idle')

  const bg = isDark ? '#0C0C14' : undefined
  const bgImage = isDark ? 'linear-gradient(160deg, #2a2040 0%, #1e2a40 50%, #251830 100%)' : "url('/bg-light.svg')"
  const titleColor = isDark ? '#e8e0f8' : '#1a1a2e'
  const subColor   = isDark ? 'rgba(232,224,248,0.45)' : '#5a5a7a'

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: isDark ? '#0C0C14' : '#FAFAFC',
      backgroundImage: bgImage,
      backgroundSize: 'cover', backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      padding: '0 0 80px',
    }}>
      {/* ── Header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: isDark ? 'rgba(12,12,20,0.9)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isDark ? '0.5px solid rgba(142,167,255,0.12)' : '0.5px solid rgba(200,215,245,0.6)',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#8EA7FF', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Dev Only
          </p>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: titleColor, lineHeight: 1.2 }}>
            Trainer UI Playground
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Orb state */}
          {(['idle', 'speaking', 'waiting', 'done'] as OrbState[]).map(s => (
            <button key={s} onClick={() => setOrbState(s)} style={{
              padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
              background: orbState === s ? '#6B8FFF' : (isDark ? 'rgba(142,167,255,0.1)' : 'rgba(107,143,255,0.1)'),
              color: orbState === s ? '#fff' : '#8EA7FF',
              textTransform: 'capitalize',
            }}>
              {s}
            </button>
          ))}
          {/* Dark toggle */}
          <button onClick={() => setIsDark(!isDark)} style={{
            padding: '5px 14px', borderRadius: 20, border: '0.5px solid rgba(142,167,255,0.3)',
            cursor: 'pointer', fontSize: 11, fontWeight: 600,
            background: isDark ? 'rgba(142,167,255,0.15)' : 'rgba(255,255,255,0.8)',
            color: isDark ? '#A6B8FF' : '#6B8FFF',
          }}>
            {isDark ? '☀ Light' : '◐ Dark'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── Section 1: Whisper Cards ── */}
        <Section title="1. Whisper Card (say() 타입)" isDark={isDark}>
          <Row>
            {[
              { msg: '준비됐나요?',    ms: 3000 },
              { msg: '들어보세요.',    ms: 3000 },
              { msg: '따라해보세요.',  ms: 3000 },
              { msg: '좋아요.',        ms: 2000 },
              { msg: '완료됐어요.',    ms: 2000 },
              { msg: '내일 또 만나요.', ms: 2500 },
              { msg: '저장됐어요.',    ms: 2000 },
              { msg: '오늘도 잘하셨어요.', ms: 3000 },
            ].map(({ msg, ms }) => (
              <OrbWithCard key={msg} corner="br" size="small" isDark={isDark} orbState={orbState}>
                <WhisperContent message={msg} ms={ms} isDark={isDark} />
              </OrbWithCard>
            ))}
          </Row>
        </Section>

        {/* ── Section 2: Action Cards ── */}
        <Section title="2. Action Card (ask() 타입)" isDark={isDark}>
          {[
            { msg: '학습을 시작할까요?', btns: [{ label: 'Skip', variant: 'secondary' as const }, { label: 'Start', variant: 'primary' as const }] },
            { msg: "'actually' 저장할까요?", btns: [{ label: 'Later', variant: 'secondary' as const }, { label: 'Save', variant: 'primary' as const }] },
            { msg: '들어보세요.', btns: [{ label: '▶ Play', variant: 'play' as const }] },
            { msg: '따라해보세요.', btns: [{ label: '✓ Done', variant: 'done' as const }] },
            { msg: '삭제할까요?', btns: [{ label: 'Cancel', variant: 'secondary' as const }, { label: 'Remove', variant: 'primary' as const }] },
            { msg: '세션을 종료할까요?', btns: [{ label: 'Stay', variant: 'secondary' as const }, { label: 'Exit', variant: 'primary' as const }] },
            { msg: '오늘의 챌린지를 해볼까요?', btns: [{ label: 'Maybe later', variant: 'secondary' as const }, { label: "Let's do it", variant: 'primary' as const }] },
            { msg: '다시 들어볼까요?', btns: [{ label: '▶ Play', variant: 'play' as const }, { label: '✓ Done', variant: 'done' as const }] },
          ].map(({ msg, btns }) => (
            <OrbWithCard key={msg} corner="br" size="medium" isDark={isDark} orbState={orbState}>
              <ActionContent message={msg} buttons={btns} isDark={isDark} />
            </OrbWithCard>
          ))}
        </Section>

        {/* ── Section 3: Session Cards ── */}
        <Section title="3. Session Card" isDark={isDark}>
          <Row>
            <OrbWithCard corner="br" size="large" isDark={isDark} orbState={orbState}>
              <SessionContent
                label="오늘의 세션"
                title="A New Start"
                subtext="5 patterns · Round 1 · ~6분"
                primaryBtns={['Start']}
                ghostBtns={['Later']}
                isDark={isDark}
              />
            </OrbWithCard>
            <OrbWithCard corner="br" size="large" isDark={isDark} orbState={orbState}>
              <SessionContent
                label="Session Complete"
                title="A New Start"
                subtext="Round 1 · 5 patterns · 6분"
                primaryBtns={['Finish']}
                ghostBtns={['다음 스토리 →']}
                isDark={isDark}
              />
            </OrbWithCard>
          </Row>
        </Section>

        {/* ── Section 4: Help Card ── */}
        <Section title="4. Help Card" isDark={isDark}>
          <OrbWithCard corner="br" size="medium" isDark={isDark} orbState={orbState}>
            <HelpContent isDark={isDark} />
          </OrbWithCard>
        </Section>

        {/* ── Section 5: Orb 위치별 ── */}
        <Section title="5. Orb 위치별 Card 방향 테스트" isDark={isDark}>
          <Row>
            {(['br', 'bl', 'tr', 'tl'] as Corner[]).map(c => (
              <CornerDemo key={c} corner={c} isDark={isDark} orbState={orbState} />
            ))}
          </Row>
        </Section>

        {/* ── Section 6: SlideSession 내 Card ── */}
        <Section title="6. SlideSession 내 Card 위치" isDark={isDark}>
          <SlideSessionMock isDark={isDark} orbState={orbState} />
        </Section>

      </div>
    </div>
  )
}
