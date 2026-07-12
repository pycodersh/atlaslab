'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, BookOpen, EyeOff, RotateCcw, PenLine } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { useTheme } from '@/components/ThemeProvider'
import { useT } from '@/hooks/useT'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'

const GUIDE_STEPS = [
  { step: 'STEP 01', title: 'Read the Story',       icon: BookOpen,  color: 'rgba(142,167,255,0.85)', bodyKey: 'guide_step1_body' },
  { step: 'STEP 02', title: 'Hide & Recall',        icon: EyeOff,   color: 'rgba(220,80,80,0.8)',   bodyKey: 'guide_step2_body' },
  { step: 'STEP 03', title: 'Repeat 5 Times',       icon: RotateCcw, color: 'rgba(60,170,90,0.85)',  bodyKey: 'guide_step3_body' },
  { step: 'STEP 04', title: 'Write & Get Reviewed', icon: PenLine,  color: 'rgba(200,140,60,0.9)',  bodyKey: 'guide_step4_body' },
] as const

export default function GuidePage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const t = useT()

  const TOTAL = GUIDE_STEPS.length
  const [pos, setPos] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [transit, setTransit] = useState(false)
  const [tOffset, setTOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isTransiting = useRef(false)
  const touchStartX = useRef(0)

  function slide(dir: 1 | -1) {
    if (isTransiting.current) return
    const next = pos + dir
    if (next < 0 || next >= TOTAL) return
    isTransiting.current = true
    setTransit(true)
    setTOffset(-dir)
    setTimeout(() => {
      setPos(next)
      setTransit(false)
      setTOffset(0)
      isTransiting.current = false
    }, 300)
  }

  const W = containerRef.current?.offsetWidth ?? 340
  const dragPct = dragX / W * 100
  const railPct = -(pos * 100) + (transit ? tOffset * 100 : dragPct)

  const slideBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(248,246,255,0.85)'
  const slideBorder = isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(200,190,240,0.35)'

  return (
    <div style={{ minHeight: '100dvh' }}>
      <TopNav />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: `14px 20px calc(${TAB_BAR_HEIGHT}px + 24px)`, boxSizing: 'border-box' }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--pa)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}
        >
          <ChevronLeft style={{ width: 16, height: 16 }} strokeWidth={2} />
          About PATTO
        </button>

        <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.20em', color: '#8E8E93', textTransform: 'uppercase', margin: '0 0 12px 2px' }}>
          PATTO GUIDE
        </p>

        {/* Slide rail */}
        <div ref={containerRef} style={{ overflow: 'hidden', borderRadius: 20 }}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
          onTouchMove={e => {
            if (isTransiting.current) return
            setDragX(e.touches[0].clientX - touchStartX.current)
          }}
          onTouchEnd={() => {
            if (isTransiting.current) return
            const cW = containerRef.current?.offsetWidth ?? 340
            if (dragX < -cW * 0.22) slide(1)
            else if (dragX > cW * 0.22) slide(-1)
            else setDragX(0)
          }}
        >
          <div style={{
            display: 'flex', width: `${TOTAL * 100}%`,
            transform: `translateX(${railPct / TOTAL}%)`,
            transition: transit ? 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none',
          }}>
            {GUIDE_STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} style={{ width: `${100 / TOTAL}%`, boxSizing: 'border-box' }}>
                  <div style={{ background: slideBg, border: slideBorder, borderRadius: 20, padding: '28px 24px 24px' }}>
                    <Icon style={{ width: 32, height: 32, color: step.color, marginBottom: 16 }} strokeWidth={1.8} />
                    <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(80,90,130,0.55)', margin: '0 0 6px', textTransform: 'uppercase' }}>
                      {step.step}
                    </p>
                    <p style={{ fontSize: 17, fontWeight: 800, color: isDark ? 'rgba(255,255,255,0.92)' : '#1A1A2E', margin: '0 0 14px', letterSpacing: '-0.01em' }}>
                      {step.title}
                    </p>
                    <p style={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(60,65,100,0.8)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                      {t(step.bodyKey)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
          <button
            type="button" onClick={() => slide(-1)} disabled={pos === 0}
            style={{ width: 40, height: 40, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)', border: 'none', cursor: pos === 0 ? 'default' : 'pointer', opacity: pos === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.15s' }}
          >
            <ChevronLeft style={{ width: 17, height: 17, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)' }} strokeWidth={2} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {Array.from({ length: TOTAL }, (_, i) => (
              <div key={i} style={{ borderRadius: pos === i ? 3 : '50%', transition: 'all 0.28s ease', width: pos === i ? 20 : 5, height: 5, background: pos === i ? (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(142,167,255,0.75)') : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(142,167,255,0.20)') }} />
            ))}
          </div>

          <button
            type="button" onClick={() => slide(1)} disabled={pos === TOTAL - 1}
            style={{ width: 40, height: 40, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)', border: 'none', cursor: pos === TOTAL - 1 ? 'default' : 'pointer', opacity: pos === TOTAL - 1 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.15s' }}
          >
            <ChevronRight style={{ width: 17, height: 17, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)' }} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
