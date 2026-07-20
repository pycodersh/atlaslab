'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowRight, BookOpen, CheckCircle2, Headphones, Heart,
  MapPin, MessageCircle, Puzzle, Sparkles, Star, Volume2
} from 'lucide-react'
import { usePreferences } from '@/contexts/PreferencesContext'
import { ONBOARDING_COPY } from '@/lib/i18n/onboarding'

const DONE_KEY = 'patto_onboarding_done_v1'
const ACCENT = '#6366F1'
const NAVY = '#1F2A3F'

export default function PattoOnboardingPage() {
  const router = useRouter()
  const { prefs } = usePreferences()
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (localStorage.getItem(DONE_KEY) === 'true') router.replace('/patto/home')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const copy = useMemo(
    () => ONBOARDING_COPY[prefs.language] ?? ONBOARDING_COPY.en,
    [prefs.language],
  )

  const slides = [
    { title: copy.slide1.title, body: copy.slide1.body, visual: <PatternScene /> },
    { title: copy.slide2.title, body: copy.slide2.body, visual: <StoryScene /> },
    { title: copy.slide3.title, body: copy.slide3.body, visual: <RepeatScene /> },
    { title: copy.slide4.title, body: copy.slide4.body, visual: <ChallengeScene /> },
  ]

  const complete = () => {
    localStorage.setItem(DONE_KEY, 'true')
    router.replace('/patto/home')
  }

  const next = () => {
    if (index === slides.length - 1) complete()
    else setIndex((v) => Math.min(v + 1, slides.length - 1))
  }

  const prev = () => setIndex((v) => Math.max(v - 1, 0))

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current
    const dx = endX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 48) return
    dx < 0 ? next() : prev()
  }

  const slide = slides[index]
  const isLast = index === slides.length - 1

  return (
    <main style={{ height: '100dvh', overflow: 'hidden', display: 'flex', justifyContent: 'center', padding: 12, color: 'var(--pt)' }}>
      <section
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          width: '100%', maxWidth: 480, height: '100%',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          borderRadius: 30, border: '1px solid var(--pglass-border)',
          background: 'var(--pglass)', backdropFilter: 'blur(18px)',
          boxShadow: '0 24px 80px rgba(64,72,160,.10)',
        }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', padding: '22px 24px 0', color: NAVY }}>
          <strong style={{ fontSize: 18 }}>PATTO</strong>
          <strong style={{ fontSize: 14 }}>{index + 1} / 4</strong>
        </header>

        <div style={{ padding: '30px 28px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: .24, ease: 'easeOut' }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  margin: 0, fontSize: 'clamp(34px,8.8vw,46px)',
                  lineHeight: 1.1, letterSpacing: '-.045em',
                  whiteSpace: 'pre-line', maxWidth: 390,
                }}
              >
                {slide.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: .08 }}
                style={{ margin: '16px 0 0', fontSize: 16, lineHeight: 1.62, color: 'var(--pm)', whiteSpace: 'pre-line' }}
              >
                {slide.body}
              </motion.p>

              <div style={{ flex: 1, minHeight: 0, display: 'grid', placeItems: 'center', padding: '24px 0 8px', overflow: 'hidden' }}>
                {slide.visual}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <footer style={{ padding: '0 24px 24px', display: 'grid', gap: 18 }}>
          {isLast && (
            <motion.button
              type="button"
              onClick={complete}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: .985 }}
              style={{
                width: '100%', minHeight: 58, border: 0, borderRadius: 18,
                background: NAVY, color: '#fff', fontSize: 18, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 14px 32px rgba(31,42,63,.24)', cursor: 'pointer',
              }}
            >
              {copy.start}<ArrowRight size={20} />
            </motion.button>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                style={{
                  width: i === index ? 24 : 8, height: 8, borderRadius: 999, border: 0,
                  background: i === index ? ACCENT : 'rgba(99,102,241,.16)',
                  transition: 'all 180ms ease', padding: 0,
                }}
              />
            ))}
          </div>
        </footer>
      </section>
    </main>
  )
}

function PatternScene() {
  const chips = [
    ['go there', <MapPin size={15} />, '8%', '10%', .18],
    ['try it', <Star size={15} />, '63%', '8%', .24],
    ['ask you', <MessageCircle size={15} />, '0%', '58%', .30],
    ['tell you', <Heart size={15} />, '68%', '56%', .36],
    ['thank you', <CheckCircle2 size={15} />, '36%', '76%', .42],
  ] as const

  return (
    <div style={{ width: 340, maxWidth: '100%', height: '100%', minHeight: 320, position: 'relative' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', width: 264, height: 264, borderRadius: '50%',
          left: '50%', top: 34, marginLeft: -132,
          border: '1px dashed rgba(99,102,241,.24)',
          background: 'radial-gradient(circle, rgba(99,102,241,.10), rgba(99,102,241,.03) 58%, transparent 74%)',
        }}
      />

      {chips.map(([label, icon, left, top, delay]) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: .84, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay }}
          style={{
            position: 'absolute', left, top, zIndex: 3,
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,.94)',
            border: '1px solid rgba(99,102,241,.15)',
            boxShadow: '0 10px 28px rgba(70,75,150,.10)',
            fontSize: 13, fontWeight: 750, color: NAVY,
          }}
        >
          <span style={{ color: ACCENT, display: 'grid' }}>{icon}</span>{label}
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, scale: .92 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          position: 'absolute', left: '50%', top: 116, marginLeft: -105,
          width: 210, padding: '22px 20px', zIndex: 4,
          borderRadius: 24, background: 'rgba(255,255,255,.96)',
          border: '1px solid rgba(99,102,241,.16)',
          boxShadow: '0 18px 46px rgba(70,75,150,.13)',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: ACCENT, letterSpacing: '.08em' }}>PATTERN 001</div>
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 850 }}>I want to ~.</div>
            <div style={{ marginTop: 5, color: 'var(--pm)', fontSize: 14 }}>~하고 싶어</div>
          </div>
          <Volume2 size={21} color={ACCENT} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: .48 }}
        style={{
          position: 'absolute', left: '6%', right: '6%', bottom: 10,
          padding: 18, borderRadius: 24,
          background: 'rgba(247,248,255,.96)',
          border: '1px solid rgba(99,102,241,.14)',
          boxShadow: '0 16px 36px rgba(70,75,150,.10)',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 850, letterSpacing: '.08em', color: ACCENT }}>
          PATTERNS IN THIS STORY
        </div>
        {[
          'I want to start something new this time.',
          'Do you want to swap shifts this weekend?',
          'She wants to get a window seat on the flight.',
        ].map((t, i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: .56 + i * .08 }}
            style={{ display: 'flex', gap: 10, marginTop: i ? 10 : 14, fontSize: 13, lineHeight: 1.45 }}
          >
            <span style={{ color: ACCENT }}>•</span><span>{t}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

function StoryScene() {
  const cards = [
    ['A New Start', 'STORY 01', 'linear-gradient(135deg,#D9E1F0,#F2E8DE)', 6, 28, -2, 3, .10],
    ['An Old Friend', 'STORY 02', 'linear-gradient(135deg,#2C2B33,#8B5F3D)', 116, 58, 0, 2, .18],
    ['An Ordinary Morning', 'STORY 03', 'linear-gradient(135deg,#9BA7A0,#444C55)', 220, 92, 3, 1, .26],
  ] as const

  return (
    <div style={{ width: 340, maxWidth: '100%', height: '100%', minHeight: 320, position: 'relative' }}>
      <div style={{ position: 'relative', height: 300 }}>
        {cards.map(([title, label, bg, left, top, rotate, z, delay]) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 36, scale: .94 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate }}
            transition={{ delay }}
            style={{
              position: 'absolute', left, top, width: 132, zIndex: z,
              borderRadius: 22, overflow: 'hidden', background: '#fff',
              border: '1px solid rgba(99,102,241,.12)',
              boxShadow: '0 18px 42px rgba(45,55,100,.14)',
            }}
          >
            <div style={{ height: 126, background: bg, position: 'relative' }}>
              <div style={{
                position: 'absolute', left: 10, top: 10, padding: '5px 8px',
                borderRadius: 999, background: 'rgba(255,255,255,.76)',
                fontSize: 10, fontWeight: 750,
              }}>
                {label === 'STORY 01' ? 'Review' : 'New'}
              </div>
            </div>
            <div style={{ padding: '12px 12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.08em', color: 'var(--pm)' }}>{label}</div>
              <div style={{ marginTop: 5, fontSize: 14, fontWeight: 850, lineHeight: 1.25 }}>{title}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Metric icon={<BookOpen size={22} color={ACCENT} />} value="100" label="stories" />
        <Metric icon={<Puzzle size={22} color="#4AAE80" />} value="500" label="patterns" />
      </div>
    </div>
  )
}

function Metric({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: .36 }}
      style={{
        padding: 16, borderRadius: 22,
        border: '1px solid rgba(99,102,241,.12)',
        background: 'rgba(255,255,255,.74)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}
    >
      <div style={{ width: 46, height: 46, borderRadius: 16, display: 'grid', placeItems: 'center', background: 'rgba(99,102,241,.08)' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 28, lineHeight: 1, fontWeight: 850, color: ACCENT }}>{value}</div>
        <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: 'var(--pm)' }}>{label}</div>
      </div>
    </motion.div>
  )
}

function RepeatScene() {
  return (
    <div style={{ width: 340, maxWidth: '100%', height: '100%', minHeight: 320, position: 'relative' }}>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'absolute', left: '4%', right: '4%', top: 10,
          borderRadius: 26, overflow: 'hidden', background: 'rgba(255,255,255,.96)',
          border: '1px solid rgba(99,102,241,.14)',
          boxShadow: '0 20px 44px rgba(70,75,150,.12)',
        }}
      >
        <div style={{ padding: '16px 18px 12px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.08em', color: 'var(--pm)' }}>STORY 01</div>
            <div style={{ marginTop: 4, fontSize: 18, fontWeight: 850 }}>A New Start</div>
          </div>
          <Volume2 size={18} color={ACCENT} />
        </div>
        <div style={{ height: 146, background: 'linear-gradient(135deg,#D8E1EF,#EFE9E2 50%,#D8D2C7)' }} />
        <div style={{ padding: '14px 18px 18px', fontSize: 13, lineHeight: 1.6 }}>
          <div style={{ fontSize: 10, color: 'var(--pm)' }}>EN &nbsp;&nbsp; EN·KO &nbsp;&nbsp; KO</div>
          <div style={{ marginTop: 12 }}>
            It's Sunday night, and a new week is almost here.<br />
            I <strong style={{ color: '#2C4EB8' }}>want to</strong> start something new this time.
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: .88, x: 14 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: .18 }}
        style={{
          position: 'absolute', right: -2, top: 118,
          padding: '15px 18px', borderRadius: 20,
          background: ACCENT, color: '#fff',
          boxShadow: '0 14px 32px rgba(99,102,241,.30)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <Headphones size={24} />
        <div><div style={{ fontSize: 12 }}>Listen</div><div style={{ fontSize: 27, fontWeight: 850 }}>×5</div></div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: .88, x: -14 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: .30 }}
        style={{
          position: 'absolute', left: 12, bottom: 24,
          padding: '15px 18px', borderRadius: 20,
          background: 'rgba(221,245,232,.96)', color: '#378463',
          boxShadow: '0 14px 32px rgba(70,130,100,.16)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <BookOpen size={24} />
        <div><div style={{ fontSize: 12 }}>Read</div><div style={{ fontSize: 27, fontWeight: 850 }}>×10</div></div>
      </motion.div>
    </div>
  )
}

function ChallengeScene() {
  const steps = [
    [<Headphones size={28} color={ACCENT} />, 'Listening', 'rgba(99,102,241,.09)', .08],
    [<BookOpen size={28} color="#4AAE80" />, 'Reading', 'rgba(74,174,128,.10)', .18],
    [<Puzzle size={28} color={ACCENT} />, 'Challenge', 'rgba(99,102,241,.09)', .28],
  ] as const

  return (
    <div style={{ width: 340, maxWidth: '100%', height: '100%', minHeight: 320 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginTop: 8 }}>
        {steps.map(([icon, label, bg, delay], i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} style={{ textAlign: 'center' }}>
            <div style={{ width: 74, height: 74, borderRadius: '50%', margin: '0 auto', background: bg, display: 'grid', placeItems: 'center', position: 'relative' }}>
              {icon}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + .18, type: 'spring' }}
                style={{
                  position: 'absolute', right: -2, top: -2, width: 22, height: 22,
                  borderRadius: '50%', background: i === 1 ? '#4AAE80' : ACCENT,
                  display: 'grid', placeItems: 'center', border: '2px solid #fff',
                }}
              >
                <CheckCircle2 size={14} color="#fff" strokeWidth={2.8} />
              </motion.div>
            </div>
            <div style={{ marginTop: 9, fontSize: 13, fontWeight: 750, color: 'var(--pm)' }}>{label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: .34 }}
        style={{
          marginTop: 30, borderRadius: 24, padding: 18,
          background: 'rgba(255,255,255,.96)',
          border: '1px solid rgba(99,102,241,.14)',
          boxShadow: '0 18px 40px rgba(70,75,150,.10)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, fontWeight: 850, color: ACCENT, letterSpacing: '.08em' }}>CHALLENGE</div>
          <div style={{ fontSize: 11, color: 'var(--pm)' }}>1 / 4</div>
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: 'var(--pm)' }}>Fill in the blank.</div>
        <div style={{ marginTop: 18, fontSize: 16, fontWeight: 700 }}>I want to ______ something new this time.</div>
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {['start','try','begin','do'].map((word, i) => (
            <motion.div
              key={word}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .42 + i * .05 }}
              style={{
                minHeight: 38, borderRadius: 999,
                border: '1px solid rgba(99,102,241,.12)',
                background: i === 0 ? 'rgba(99,102,241,.08)' : '#fff',
                display: 'grid', placeItems: 'center',
                fontSize: 12, fontWeight: 750,
              }}
            >
              {word}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
