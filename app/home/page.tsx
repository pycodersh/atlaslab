'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { getFirstIncompleteItem } from '@/lib/review/home'
import { getTodayReviewItems } from '@/lib/review/storage'

// ── Curated cover images (Unsplash) ────────────────────────────────────────
const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1473496169904-658ba7574f19?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1463320726281-696a3cc57e01?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490750967868-88df5691cc00?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1499678329028-101435549a4e?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507281549113-040fcb6c1ef1?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1416169607655-0c2b3ce2e1cc?q=80&w=900&auto=format&fit=crop',
]

// ── Daily quotes ────────────────────────────────────────────────────────────
const DAILY_QUOTES = [
  'Small progress every day.',
  'One story at a time.',
  'Speak naturally.',
  'Every review matters.',
  'Read. Repeat. Remember.',
  'Patterns become habits.',
  'Consistency wins.',
  'Trust your voice.',
  'Stories make language memorable.',
  'Fluency comes from repetition.',
  'One sentence changes everything.',
  'Listen more. Speak better.',
  "Today's practice is tomorrow's fluency.",
  'Language lives in stories.',
  'The best time to learn is now.',
  'Every word is a small victory.',
  'Make it a habit.',
  'Your voice matters.',
  'Progress, not perfection.',
  'One pattern at a time.',
  'Read it. Feel it. Say it.',
  'Stories connect us.',
  'Daily practice builds fluency.',
  'Words are bridges.',
  'Begin again, every day.',
  'Language is alive — keep it moving.',
  'A little every day goes far.',
  'The story continues.',
  'Speak with confidence.',
  'Every day, a little closer.',
]

function byDayOfYear(arr: string[]): string {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const day = Math.floor((Date.now() - start.getTime()) / 86_400_000)
  return arr[day % arr.length]
}

function getNotice(reviewCount: number, hasNewStory: boolean): string {
  if (reviewCount >= 2) return `${reviewCount} reviews are ready.`
  if (reviewCount === 1) return '1 review is waiting.'
  if (hasNewStory) return 'A new story is waiting.'
  return "Today's learning is ready."
}

function getDateLabel(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase()
}

const T = 'transition: opacity 0.7s ease-out'

function fade(show: boolean): React.CSSProperties {
  return { opacity: show ? 1 : 0, transition: 'opacity 0.7s ease-out' }
}

export default function HomePage() {
  const router = useRouter()
  const [notice,     setNotice]     = useState('')
  const [firstHref,  setFirstHref]  = useState('/stories/1')
  const [showImg,    setShowImg]    = useState(false)
  const [showQuote,  setShowQuote]  = useState(false)
  const [showLine,   setShowLine]   = useState(false)
  const [showNotice, setShowNotice] = useState(false)
  const [showBtn,    setShowBtn]    = useState(false)

  const coverUrl  = byDayOfYear(COVER_IMAGES)
  const quote     = byDayOfYear(DAILY_QUOTES)
  const dateLabel = getDateLabel()

  useEffect(() => {
    const reviews = getTodayReviewItems()
    const first   = getFirstIncompleteItem()
    setNotice(getNotice(reviews.length, !!first))
    if (first) setFirstHref(first.href)

    const t = [
      setTimeout(() => setShowImg(true),     60),
      setTimeout(() => setShowQuote(true),   380),
      setTimeout(() => setShowLine(true),    600),
      setTimeout(() => setShowNotice(true),  700),
      setTimeout(() => setShowBtn(true),     860),
    ]
    return () => t.forEach(clearTimeout)
  }, [])

  // suppress TS unused-var warning for T
  void T

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>
      <TopNav />

      {/* ── Hero Image ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '52vh',
          marginTop: NAV_HEIGHT,
          overflow: 'hidden',
          ...fade(showImg),
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt="Daily cover"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        />
        {/* Bottom vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 'auto 0 0 0',
            height: '45%',
            background: 'linear-gradient(to bottom, transparent, var(--pb))',
            pointerEvents: 'none',
          }}
        />
        {/* Masthead — top left */}
        <p
          style={{
            position: 'absolute',
            top: 20,
            left: 24,
            margin: 0,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.28em',
            color: 'rgba(255,255,255,0.72)',
            textShadow: '0 1px 6px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
          }}
        >
          PATTO
        </p>
        {/* Date — top right */}
        <p
          style={{
            position: 'absolute',
            top: 20,
            right: 24,
            margin: 0,
            fontSize: 10,
            letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.6)',
            textShadow: '0 1px 6px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
          }}
        >
          {dateLabel}
        </p>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div style={{ padding: '0 28px 96px', maxWidth: 384, margin: '0 auto' }}>

        {/* Quote */}
        <div style={{ paddingTop: 24, marginBottom: 28, ...fade(showQuote) }}>
          <p
            className="font-playfair"
            style={{
              fontSize: 'clamp(1.35rem, 5vw, 1.65rem)',
              fontWeight: 700,
              fontStyle: 'italic',
              lineHeight: 1.35,
              color: 'var(--pt)',
              margin: 0,
            }}
          >
            {quote}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--pd)', marginBottom: 24, ...fade(showLine) }} />

        {/* Notice */}
        <div style={{ marginBottom: 32, ...fade(showNotice) }}>
          <p style={{ fontSize: 12.5, color: 'var(--pm)', letterSpacing: '0.04em', margin: 0 }}>
            {notice || ' '}
          </p>
        </div>

        {/* Continue Learning — text style */}
        <div style={fade(showBtn)}>
          <button
            type="button"
            onClick={() => router.push(firstHref)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              opacity: 1,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.55')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: 'var(--pa)',
              }}
            >
              Continue Learning
            </span>
            <ArrowRight style={{ width: 13, height: 13, color: 'var(--pa)', strokeWidth: 2.5 }} />
          </button>
        </div>

      </div>
    </div>
  )
}
