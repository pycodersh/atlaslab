'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { useTheme } from '@/components/ThemeProvider'
import { usePreferences } from '@/contexts/PreferencesContext'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { EDITOR_NOTES } from '@/data/editor-notes'
import { editorTipTranslations, type TipLang } from '@/data/editor-tips-translations'

const TOTAL = EDITOR_NOTES.length

function toTipLang(lang: string): TipLang {
  const m: Record<string, TipLang> = { 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW' }
  return (m[lang] ?? lang) as TipLang
}

function getTipEntry(noteId: number, lang: string) {
  if (lang === 'ko') return null
  const tip = editorTipTranslations.find(t => t.noteId === noteId)
  if (!tip) return null
  const l = toTipLang(lang)
  return tip.translations[l] ?? tip.translations['en']
}

function shuffleIndices(total: number, avoidFirst?: number): number[] {
  const arr = [...Array(total).keys()]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  if (avoidFirst !== undefined && arr[0] === avoidFirst && arr.length > 1) {
    ;[arr[0], arr[1]] = [arr[1], arr[0]]
  }
  return arr
}

function DotIndicator({ total, pos }: { total: number; pos: number }) {
  const MAX = 7
  const half = Math.floor(MAX / 2)
  const count = Math.min(total, MAX)
  const start = total <= MAX ? 0 : Math.max(0, Math.min(pos - half, total - MAX))
  const dots = Array.from({ length: count }, (_, i) => start + i)
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'center' }}>
      {dots.map(di => {
        const dist = Math.abs(di - pos)
        const active = di === pos
        const size = active ? 7 : dist <= 1 ? 4.5 : 3.5
        const alpha = active ? 1 : dist <= 1 ? 0.35 : 0.18
        return <span key={di} style={{ display: 'block', width: size, height: size, borderRadius: '50%', background: `rgba(60,60,70,${alpha})`, transition: 'all 0.22s' }} />
      })}
    </div>
  )
}

export default function TipsPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { prefs } = usePreferences()

  const initialIndex = Math.floor((Date.now() / 86400000)) % TOTAL
  const [deck, setDeck] = useState<number[]>(() => {
    const rest = shuffleIndices(TOTAL, initialIndex).filter(i => i !== initialIndex)
    return [initialIndex, ...rest]
  })
  const [pos, setPos] = useState(0)

  useEffect(() => {
    if (pos >= deck.length - 2) {
      const last = deck[deck.length - 1]
      setDeck(d => [...d, ...shuffleIndices(TOTAL, last)])
    }
  }, [pos, deck])

  const [dragX, setDragX] = useState(0)
  const [transit, setTransit] = useState(false)
  const [tOffset, setTOffset] = useState(0)
  const touchStartX = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isTransiting = useRef(false)

  const prevIdx = deck[Math.max(0, pos - 1)]
  const currIdx = deck[pos]
  const nextIdx = deck[pos + 1] ?? deck[0]

  function slide(dir: -1 | 1) {
    if (isTransiting.current) return
    if (dir === 1 && pos === 0) return
    isTransiting.current = true
    setTransit(true)
    setTOffset(dir)
    setDragX(0)
    setTimeout(() => {
      setPos(p => p + (dir === -1 ? 1 : -1))
      setTransit(false)
      setTOffset(0)
      isTransiting.current = false
    }, 330)
  }

  const W = containerRef.current?.offsetWidth ?? 340
  const dragPct = dragX / W * 100
  const basePct = -100 + (transit ? tOffset * 100 : dragPct)

  function TipContent({ idx }: { idx: number }) {
    const tip = EDITOR_NOTES[idx]
    if (!tip) return null
    const entry = getTipEntry(tip.id, prefs.language)
    const title    = entry?.title ?? (tip.title as Record<string, string>)?.ko ?? ''
    const body     = entry?.body ?? (tip.body as Record<string, string[]>)?.ko ?? []
    const remember = entry?.oneThingToRemember ?? (tip.oneThingToRemember as Record<string, string>)?.ko ?? ''
    return (
      <>
        <p style={{ fontSize: 18, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.88)', margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
          {title}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 18 }}>
          {body.map((para, i) => (
            <p key={i} style={{ fontSize: 14, lineHeight: 1.65, color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.65)', margin: 0, fontWeight: i === 0 ? 500 : 400 }}>
              {para}
            </p>
          ))}
        </div>
        {remember && (
          <div style={{ padding: '12px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', borderLeft: `3px solid ${isDark ? 'rgba(255,100,100,0.7)' : 'rgba(200,80,80,0.6)'}`, borderRadius: '0 8px 8px 0' }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)', margin: '0 0 5px', textTransform: 'uppercase' }}>
              One thing to remember
            </p>
            <p style={{ fontSize: 13, fontWeight: 700, color: isDark ? 'rgba(255,180,180,0.9)' : '#8D234C', margin: 0, lineHeight: 1.5 }}>
              {remember}
            </p>
          </div>
        )}
      </>
    )
  }

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

        <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.20em', color: '#8E8E93', textTransform: 'uppercase', margin: '0 0 4px 2px' }}>
          Editor Tips
        </p>
        <p style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.38)', margin: '0 0 16px 2px' }}>
          {EDITOR_NOTES[currIdx]?.partTitle ?? ''}
        </p>

        {/* 3-panel swipe */}
        <div
          ref={containerRef}
          style={{ overflow: 'hidden', borderRadius: 20, background: isDark ? 'rgba(20,18,35,0.92)' : 'rgba(255,255,255,0.75)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.8)' }}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
          onTouchMove={e => {
            if (isTransiting.current) return
            setDragX(e.touches[0].clientX - touchStartX.current)
          }}
          onTouchEnd={() => {
            if (isTransiting.current) return
            const cW = containerRef.current?.offsetWidth ?? 340
            if (dragX < -cW * 0.22) slide(-1)
            else if (dragX > cW * 0.22) slide(1)
            else setDragX(0)
          }}
        >
          <div style={{ display: 'flex', width: '300%', transform: `translateX(${basePct / 3}%)`, transition: transit ? 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none', willChange: 'transform' }}>
            <div style={{ width: '33.333%', padding: '24px', boxSizing: 'border-box' }}><TipContent idx={prevIdx} /></div>
            <div style={{ width: '33.333%', padding: '24px', boxSizing: 'border-box' }}><TipContent idx={currIdx} /></div>
            <div style={{ width: '33.333%', padding: '24px', boxSizing: 'border-box' }}><TipContent idx={nextIdx} /></div>
          </div>
        </div>

        {/* Nav + dots */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
          <button
            type="button" onClick={() => slide(1)} disabled={pos === 0}
            style={{ width: 40, height: 40, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)', border: 'none', cursor: pos === 0 ? 'default' : 'pointer', opacity: pos === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.15s' }}
          >
            <ChevronLeft style={{ width: 17, height: 17, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)' }} strokeWidth={2} />
          </button>
          <DotIndicator total={TOTAL} pos={pos % TOTAL} />
          <button
            type="button" onClick={() => slide(-1)}
            style={{ width: 40, height: 40, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronRight style={{ width: 17, height: 17, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)' }} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
