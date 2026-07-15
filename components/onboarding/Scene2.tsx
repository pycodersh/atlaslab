'use client'
import React, { useEffect, useRef, useState } from 'react'
import { OrbComponent } from './OrbComponent'
import { COLORS, S2 } from './motionConstants'

function calcAssembleRow(screenWidth: number): { x: number; y: number }[] {
  const totalW = (S2.wordWidths as readonly number[]).reduce((a, b) => a + b, 0)
    + S2.assembleGap * (S2.wordWidths.length - 1)
  let x = Math.round((screenWidth - totalW) / 2)
  return (S2.wordWidths as readonly number[]).map((w) => {
    const pos = { x, y: S2.assembleY }
    x += w + S2.assembleGap
    return pos
  })
}

interface WordState {
  opacity: number
  x: number
  y: number
  assembled: boolean
  showBg: boolean
  transitioning: boolean
}

export function Scene2() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [orbVisible, setOrbVisible]   = useState(false)
  const [glowVisible, setGlowVisible] = useState(false)
  const [labelVisible, setLabelVisible] = useState(false)
  const [copyVisible, setCopyVisible] = useState(false)

  const [patternStates, setPatternStates] = useState<WordState[]>(
    S2.patternWords.map((_, i) => ({
      opacity: 0,
      x: S2.scatterPositions[i].x,
      y: S2.scatterPositions[i].y,
      assembled: false,
      showBg: true,
      transitioning: false,
    }))
  )
  const [extraOpacities, setExtraOpacities] = useState<number[]>(
    S2.extraWords.map(() => 0)
  )

  useEffect(() => {
    const W = containerRef.current?.offsetWidth ?? S2.screenWidth
    const assembleRow = calcAssembleRow(W)
    const timers: ReturnType<typeof setTimeout>[] = []

    timers.push(setTimeout(() => setOrbVisible(true), S2.orbFadeIn.start))

    // Extra words appear
    S2.extraWords.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setExtraOpacities(prev => { const n = [...prev]; n[i] = 0.4; return n })
      }, S2.extraFadeInAt + i * 90))
    })

    // Pattern words appear
    S2.patternWords.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setPatternStates(prev => {
          const n = [...prev]; n[i] = { ...n[i], opacity: 1 }; return n
        })
      }, S2.patternFadeInAt + i * 140))
    })

    // Extra words fade out at assemble time
    S2.extraWords.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setExtraOpacities(prev => { const n = [...prev]; n[i] = 0; return n })
      }, S2.assembleAt + Math.round(i * S2.assembleStagger * 0.3)))
    })

    // Pattern words move to assemble row
    S2.patternWords.forEach((_, i) => {
      const moveAt = S2.assembleAt + i * S2.assembleStagger
      timers.push(setTimeout(() => {
        setPatternStates(prev => {
          const n = [...prev]
          n[i] = { ...n[i], x: assembleRow[i].x, y: assembleRow[i].y, transitioning: true }
          return n
        })
      }, moveAt))

      // Color change after transition
      timers.push(setTimeout(() => {
        setPatternStates(prev => {
          const n = [...prev]
          n[i] = { ...n[i], assembled: true, showBg: false }
          return n
        })
      }, moveAt + S2.assembleDuration + S2.colorChangeDelay))
    })

    timers.push(setTimeout(() => { setGlowVisible(true); setLabelVisible(true) }, S2.glowAt))
    timers.push(setTimeout(() => setCopyVisible(true), S2.bottomCopyAt))

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Header */}
      <div style={{ paddingTop: 62, paddingLeft: 32, paddingRight: 32, textAlign: 'center' }}>
        <p style={{ fontSize: 26, fontWeight: 700, color: COLORS.text.primary, margin: 0 }}>PATTO와 함께라면</p>
        <p style={{ fontSize: 14, color: COLORS.text.muted, margin: '6px 0 0' }}>패턴이 자동으로 연결됩니다.</p>
      </div>

      {/* Orb */}
      <div style={{
        position: 'absolute', top: '46%', left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        transform: `translateY(-${S2.orbSize / 2}px)`,
        opacity: orbVisible ? 1 : 0,
        transition: `opacity ${S2.orbFadeIn.duration}ms ease`,
      }}>
        <OrbComponent size={S2.orbSize} showRings />
      </div>

      {/* Extra words */}
      {S2.extraWords.map((text, i) => (
        <div key={`extra-${text}`} style={{
          position: 'absolute',
          left: S2.extraPositions[i].x,
          top: S2.extraPositions[i].y,
          opacity: extraOpacities[i],
          transition: 'opacity 400ms ease',
          padding: '7px 16px',
          borderRadius: 100,
          background: 'rgba(255,255,255,0.65)',
          border: '1px solid rgba(26,115,235,0.14)',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: COLORS.text.accent }}>{text}</span>
        </div>
      ))}

      {/* Pattern words */}
      {S2.patternWords.map((w, i) => {
        const st = patternStates[i]
        const textColor = st.assembled
          ? (w.isPattern ? COLORS.text.pattern : COLORS.text.primary)
          : COLORS.text.accent
        return (
          <div key={`pat-${w.text}-${i}`} style={{
            position: 'absolute',
            left: st.x,
            top: st.y,
            opacity: st.opacity,
            transition: st.transitioning
              ? `left ${S2.assembleDuration}ms cubic-bezier(0.4,0,0.2,1), top ${S2.assembleDuration}ms cubic-bezier(0.4,0,0.2,1), opacity 550ms ease`
              : 'opacity 550ms ease',
            padding: '7px 16px',
            borderRadius: 100,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}>
            {/* Chip bg */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 100,
              background: 'rgba(255,255,255,0.65)',
              border: '1px solid rgba(26,115,235,0.14)',
              opacity: st.showBg ? 1 : 0,
              transition: 'opacity 500ms ease',
            }} />
            <span style={{
              fontSize: 15,
              fontWeight: st.assembled && w.isPattern ? 700 : 500,
              color: textColor,
              position: 'relative',
              zIndex: 1,
              transition: 'color 500ms ease',
            }}>
              {w.text}
            </span>
          </div>
        )
      })}

      {/* PATTERN label */}
      <div style={{
        position: 'absolute', left: 0, right: 0,
        top: S2.assembleY - 22,
        textAlign: 'center',
        fontSize: 10, fontWeight: 500, letterSpacing: '1.2px',
        color: COLORS.text.muted,
        opacity: labelVisible ? 1 : 0,
        transition: 'opacity 500ms ease',
        pointerEvents: 'none',
      }}>
        PATTERN
      </div>

      {/* Glow line */}
      <div style={{
        position: 'absolute', left: 32, right: 32,
        top: S2.assembleY + 44,
        height: 1,
        background: 'rgba(26,115,235,0.18)',
        opacity: glowVisible ? 1 : 0,
        transition: 'opacity 500ms ease',
      }} />

      {/* Bottom copy */}
      <div style={{
        position: 'absolute', bottom: 100, left: 32, right: 32,
        textAlign: 'center',
        opacity: copyVisible ? 1 : 0,
        transition: 'opacity 600ms ease',
      }}>
        <p style={{ fontSize: 20, fontWeight: 700, color: COLORS.text.accent, lineHeight: '30px', margin: 0 }}>
          패턴으로 말이<br />자동으로 나옵니다.
        </p>
      </div>
    </div>
  )
}
