'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowRight, BookOpen, CheckCircle2, Headphones, Heart,
  MapPin, MessageCircle, Puzzle, Star, Volume2
} from 'lucide-react'
import { usePreferences } from '@/contexts/PreferencesContext'
import { ONBOARDING_COPY } from '@/lib/i18n/onboarding'

const DONE_KEY = 'patto_onboarding_done_v1'
const ACCENT = '#6366F1'
const NAVY = '#1F2A3F'
const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&q=80`

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
    <main style={{
      height: '100dvh', overflow: 'hidden', overflowX: 'hidden',
      display: 'flex', justifyContent: 'center',
      padding: 10, color: 'var(--pt)', boxSizing: 'border-box',
    }}>
      <section
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          width: '100%', maxWidth: 480, height: '100%',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          borderRadius: 28, border: '1px solid var(--pglass-border)',
          background: 'var(--pglass)', backdropFilter: 'blur(18px)',
          boxShadow: '0 24px 80px rgba(64,72,160,.10)',
        }}
      >
        {/* Header */}
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: 'clamp(14px,2.5dvh,20px) 22px 0',
          color: NAVY, flexShrink: 0,
        }}>
          <strong style={{ fontSize: 'clamp(15px,4vw,18px)' }}>PATTO</strong>
          <strong style={{ fontSize: 'clamp(12px,3vw,14px)' }}>{index + 1} / 4</strong>
        </header>

        {/* Slide content */}
        <div style={{
          flex: 1, minHeight: 0,
          padding: 'clamp(14px,3dvh,26px) clamp(16px,5vw,26px) 0',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: .24, ease: 'easeOut' }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}
            >
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  margin: 0,
                  fontSize: 'clamp(24px,6.2vw,42px)',
                  lineHeight: 1.08, letterSpacing: '-.04em',
                  whiteSpace: 'pre-line', flexShrink: 0,
                }}
              >
                {slide.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: .08 }}
                style={{
                  margin: 'clamp(8px,1.8dvh,14px) 0 0',
                  fontSize: 'clamp(13px,3.4vw,15px)',
                  lineHeight: 1.58, color: 'var(--pm)',
                  whiteSpace: 'pre-line', flexShrink: 0,
                }}
              >
                {slide.body}
              </motion.p>

              {/* Visual area — takes all remaining space */}
              <div style={{
                flex: 1, minHeight: 0, overflow: 'hidden',
                display: 'flex', alignItems: 'stretch',
                padding: 'clamp(10px,2dvh,18px) 0 0',
              }}>
                {slide.visual}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer style={{
          flexShrink: 0,
          padding: 'clamp(8px,1.5dvh,12px) clamp(16px,5vw,22px) clamp(14px,2.8dvh,22px)',
          display: 'flex', flexDirection: 'column', gap: 'clamp(10px,1.8dvh,16px)',
        }}>
          {isLast && (
            <motion.button
              type="button"
              onClick={complete}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: .985 }}
              style={{
                width: '100%', minHeight: 'clamp(50px,7dvh,58px)',
                border: 0, borderRadius: 16,
                background: NAVY, color: '#fff',
                fontSize: 'clamp(15px,4vw,18px)', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 14px 32px rgba(31,42,63,.24)', cursor: 'pointer',
              }}
            >
              {copy.start}<ArrowRight size={18} />
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
                  width: i === index ? 22 : 7, height: 7, borderRadius: 999, border: 0,
                  background: i === index ? ACCENT : 'rgba(99,102,241,.16)',
                  transition: 'all 180ms ease', padding: 0, cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </footer>
      </section>
    </main>
  )
}

// ─── Scene 1: Pattern ────────────────────────────────────

function PChip({ label, icon, delay = 0 }: { label: string; icon: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: .84, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: 'clamp(6px,1.2dvh,9px) clamp(10px,2.8vw,13px)',
        borderRadius: 999,
        background: 'rgba(255,255,255,.94)',
        border: '1px solid rgba(99,102,241,.15)',
        boxShadow: '0 6px 18px rgba(70,75,150,.10)',
        fontSize: 'clamp(10px,2.6vw,12px)', fontWeight: 700, color: NAVY,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ color: ACCENT, display: 'grid', lineHeight: 0 }}>{icon}</span>
      {label}
    </motion.div>
  )
}

function PatternScene() {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      gap: 'clamp(4px,0.8dvh,8px)',
      overflow: 'hidden',
    }}>
      {/* Top chips */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <PChip label="go there" icon={<MapPin size={12} />} delay={.18} />
        <PChip label="try it"   icon={<Star size={12} />}   delay={.24} />
      </div>

      {/* Center: rotating ring + pattern card */}
      <div style={{
        flex: 1, minHeight: 0,
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: 'min(72%,220px)', aspectRatio: '1',
            borderRadius: '50%',
            border: '1px dashed rgba(99,102,241,.22)',
            background: 'radial-gradient(circle, rgba(99,102,241,.09), rgba(99,102,241,.02) 60%, transparent 76%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: .92 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            position: 'relative', zIndex: 4,
            width: 'min(70%,210px)',
            padding: 'clamp(14px,2.8dvh,20px) clamp(14px,3.8vw,20px)',
            borderRadius: 22, background: 'rgba(255,255,255,.96)',
            border: '1px solid rgba(99,102,241,.16)',
            boxShadow: '0 16px 40px rgba(70,75,150,.14)',
          }}
        >
          <div style={{ fontSize: 'clamp(9px,2.3vw,11px)', fontWeight: 800, color: ACCENT, letterSpacing: '.08em' }}>
            PATTERN 001
          </div>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div>
              <div style={{ fontSize: 'clamp(18px,5vw,24px)', fontWeight: 850 }}>I want to ~.</div>
              <div style={{ marginTop: 4, color: 'var(--pm)', fontSize: 'clamp(11px,2.8vw,13px)' }}>~하고 싶어</div>
            </div>
            <Volume2 size={18} color={ACCENT} style={{ flexShrink: 0 }} />
          </div>
        </motion.div>
      </div>

      {/* Bottom chips */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <PChip label="ask you"  icon={<MessageCircle size={12} />} delay={.30} />
        <PChip label="tell you" icon={<Heart size={12} />}         delay={.36} />
      </div>

      {/* Patterns in this story */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: .44 }}
        style={{
          flexShrink: 0,
          padding: 'clamp(10px,1.8dvh,14px) clamp(12px,3.2vw,16px)',
          borderRadius: 18,
          background: 'rgba(247,248,255,.96)',
          border: '1px solid rgba(99,102,241,.13)',
          boxShadow: '0 10px 24px rgba(70,75,150,.09)',
        }}
      >
        <div style={{ fontSize: 'clamp(8px,2vw,10px)', fontWeight: 850, letterSpacing: '.07em', color: ACCENT }}>
          PATTERNS IN THIS STORY
        </div>
        {[
          'I want to start something new this time.',
          'Do you want to swap shifts this weekend?',
        ].map((t, i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: .52 + i * .07 }}
            style={{
              display: 'flex', gap: 8,
              marginTop: i ? 'clamp(5px,1dvh,8px)' : 'clamp(6px,1.2dvh,10px)',
              fontSize: 'clamp(11px,2.8vw,13px)', lineHeight: 1.4,
            }}
          >
            <span style={{ color: ACCENT, flexShrink: 0 }}>•</span>
            <span>{t}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

// ─── Scene 2: Stories ────────────────────────────────────

function Metric({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: .36 }}
      style={{
        padding: 'clamp(10px,1.8dvh,14px) clamp(12px,3vw,16px)',
        borderRadius: 18,
        border: '1px solid rgba(99,102,241,.12)',
        background: 'rgba(255,255,255,.74)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}
    >
      <div style={{
        width: 'clamp(36px,9vw,44px)', height: 'clamp(36px,9vw,44px)',
        borderRadius: 14, display: 'grid', placeItems: 'center',
        background: 'rgba(99,102,241,.08)', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 'clamp(22px,6vw,28px)', lineHeight: 1, fontWeight: 850, color: ACCENT }}>{value}</div>
        <div style={{ marginTop: 3, fontSize: 'clamp(11px,2.8vw,13px)', fontWeight: 700, color: 'var(--pm)' }}>{label}</div>
      </div>
    </motion.div>
  )
}

function StoryScene() {
  const cards = [
    { title: 'A New Start',         label: 'STORY 01', img: IMG('1506784983877-45594efa4cbe'), chip: 'Review', left: '0%',  top: '0%',  rotate: -2, z: 3, delay: .10 },
    { title: 'An Old Friend',       label: 'STORY 02', img: IMG('1543007630-9710e4a00a20'),   chip: 'New',    left: '28%', top: '10%', rotate: 0,  z: 2, delay: .18 },
    { title: 'An Ordinary Morning', label: 'STORY 03', img: IMG('1525610553991-2bede1a236e2'),chip: 'New',    left: '54%', top: '20%', rotate: 3,  z: 1, delay: .26 },
  ]

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 'clamp(8px,1.5dvh,14px)', overflow: 'hidden' }}>
      {/* Card fan stack */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        {cards.map(({ title, label, img, chip, left, top, rotate, z, delay }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 30, scale: .94 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate }}
            transition={{ delay }}
            style={{
              position: 'absolute', left, top, width: 'min(38%,136px)', zIndex: z,
              borderRadius: 16, overflow: 'hidden', background: '#fff',
              border: '1px solid rgba(0,0,0,.06)',
              boxShadow: '0 8px 24px rgba(0,0,0,.13)',
            }}
          >
            <div style={{ height: 'clamp(78px,13dvh,108px)', overflow: 'hidden', position: 'relative' }}>
              <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{
                position: 'absolute', left: 7, top: 7,
                padding: '3px 7px', borderRadius: 999,
                background: 'rgba(255,255,255,.82)',
                fontSize: 'clamp(8px,2vw,9px)', fontWeight: 700,
                backdropFilter: 'blur(6px)',
              }}>{chip}</div>
            </div>
            <div style={{ padding: 'clamp(8px,1.5dvh,10px)' }}>
              <div style={{ fontSize: 'clamp(8px,2vw,9px)', fontWeight: 800, letterSpacing: '.06em', color: 'var(--pm)', textTransform: 'uppercase' }}>{label}</div>
              <div style={{ marginTop: 3, fontSize: 'clamp(11px,3vw,13px)', fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Metrics */}
      <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(8px,2vw,12px)' }}>
        <Metric icon={<BookOpen size={20} color={ACCENT} />} value="100" label="stories" />
        <Metric icon={<Puzzle size={20} color="#4AAE80" />}  value="500" label="patterns" />
      </div>
    </div>
  )
}

// ─── Scene 3: Repeat ─────────────────────────────────────

function RepeatScene() {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      gap: 'clamp(8px,1.5dvh,14px)', overflow: 'hidden',
    }}>
      {/* Story card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          flex: 1, minHeight: 0, overflow: 'hidden',
          borderRadius: 22, background: 'rgba(255,255,255,.96)',
          border: '1px solid rgba(99,102,241,.14)',
          boxShadow: '0 16px 40px rgba(70,75,150,.12)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{
          flexShrink: 0,
          padding: 'clamp(12px,2dvh,16px) clamp(14px,4vw,18px) clamp(8px,1.2dvh,10px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 'clamp(8px,2vw,10px)', fontWeight: 800, letterSpacing: '.07em', color: 'var(--pm)' }}>STORY 01</div>
            <div style={{ marginTop: 3, fontSize: 'clamp(15px,4vw,18px)', fontWeight: 850 }}>A New Start</div>
          </div>
          <Volume2 size={16} color={ACCENT} />
        </div>

        {/* Image with Listen badge overlaid */}
        <div style={{ flexShrink: 0, height: 'clamp(90px,15dvh,130px)', position: 'relative', overflow: 'hidden' }}>
          <img
            src={IMG('1506784983877-45594efa4cbe')} alt="A New Start"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: .88, x: 12 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: .18 }}
            style={{
              position: 'absolute', right: 10, bottom: 8,
              padding: 'clamp(9px,1.6dvh,13px) clamp(12px,3vw,16px)',
              borderRadius: 14, background: ACCENT, color: '#fff',
              boxShadow: '0 10px 26px rgba(99,102,241,.32)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <Headphones size={18} />
            <div>
              <div style={{ fontSize: 'clamp(10px,2.5vw,12px)' }}>Listen</div>
              <div style={{ fontSize: 'clamp(20px,5.5vw,26px)', fontWeight: 850, lineHeight: 1 }}>×5</div>
            </div>
          </motion.div>
        </div>

        {/* Text body */}
        <div style={{
          flex: 1, overflow: 'hidden',
          padding: 'clamp(10px,1.8dvh,14px) clamp(14px,4vw,18px)',
          fontSize: 'clamp(12px,3vw,13px)', lineHeight: 1.55,
        }}>
          <div style={{ fontSize: 'clamp(8px,2vw,10px)', color: 'var(--pm)' }}>EN &nbsp;&nbsp; EN·KO &nbsp;&nbsp; KO</div>
          <div style={{ marginTop: 8 }}>
            It&rsquo;s Sunday night, and a new week is almost here.<br />
            I <strong style={{ color: '#2C4EB8' }}>want to</strong> start something new this time.
          </div>
        </div>
      </motion.div>

      {/* Read badge below card */}
      <motion.div
        initial={{ opacity: 0, scale: .88, x: -12 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: .30 }}
        style={{
          flexShrink: 0, alignSelf: 'flex-start',
          padding: 'clamp(9px,1.6dvh,13px) clamp(12px,3vw,16px)',
          borderRadius: 14,
          background: 'rgba(221,245,232,.96)', color: '#378463',
          boxShadow: '0 10px 24px rgba(70,130,100,.16)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        <BookOpen size={18} />
        <div>
          <div style={{ fontSize: 'clamp(10px,2.5vw,12px)' }}>Read</div>
          <div style={{ fontSize: 'clamp(20px,5.5vw,26px)', fontWeight: 850, lineHeight: 1 }}>×10</div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Scene 4: Challenge ──────────────────────────────────

function ChallengeScene() {
  const steps = [
    { icon: <Headphones size={22} color={ACCENT} />, label: 'Listening', bg: 'rgba(99,102,241,.09)', delay: .08 },
    { icon: <BookOpen size={22} color="#4AAE80" />,  label: 'Reading',   bg: 'rgba(74,174,128,.10)', delay: .18 },
    { icon: <Puzzle size={22} color={ACCENT} />,     label: 'Challenge', bg: 'rgba(99,102,241,.09)', delay: .28 },
  ]

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      gap: 'clamp(12px,2dvh,20px)', overflow: 'hidden',
    }}>
      {/* Step circles */}
      <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
        {steps.map(({ icon, label, bg, delay }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            style={{ textAlign: 'center' }}
          >
            <div style={{
              width: 'clamp(54px,14vw,68px)', height: 'clamp(54px,14vw,68px)',
              borderRadius: '50%', margin: '0 auto', background: bg,
              display: 'grid', placeItems: 'center', position: 'relative',
            }}>
              {icon}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + .18, type: 'spring' }}
                style={{
                  position: 'absolute', right: -2, top: -2,
                  width: 19, height: 19, borderRadius: '50%',
                  background: i === 1 ? '#4AAE80' : ACCENT,
                  display: 'grid', placeItems: 'center', border: '2px solid #fff',
                }}
              >
                <CheckCircle2 size={12} color="#fff" strokeWidth={2.8} />
              </motion.div>
            </div>
            <div style={{ marginTop: 7, fontSize: 'clamp(10px,2.6vw,13px)', fontWeight: 750, color: 'var(--pm)' }}>
              {label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Challenge card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: .34 }}
        style={{
          flex: 1, minHeight: 0, overflow: 'hidden',
          borderRadius: 22,
          padding: 'clamp(14px,2.5dvh,18px)',
          background: 'rgba(255,255,255,.96)',
          border: '1px solid rgba(99,102,241,.14)',
          boxShadow: '0 16px 36px rgba(70,75,150,.10)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 'clamp(9px,2.3vw,11px)', fontWeight: 850, color: ACCENT, letterSpacing: '.08em' }}>CHALLENGE</div>
          <div style={{ fontSize: 'clamp(9px,2.3vw,11px)', color: 'var(--pm)' }}>1 / 4</div>
        </div>
        <div style={{ marginTop: 6, fontSize: 'clamp(11px,2.8vw,13px)', color: 'var(--pm)' }}>Fill in the blank.</div>
        <div style={{ marginTop: 'clamp(12px,2dvh,16px)', fontSize: 'clamp(13px,3.5vw,16px)', fontWeight: 700 }}>
          I want to ______ something new this time.
        </div>
        <div style={{
          marginTop: 'clamp(10px,1.8dvh,14px)',
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6,
        }}>
          {['start', 'try', 'begin', 'do'].map((word, i) => (
            <motion.div
              key={word}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .42 + i * .05 }}
              style={{
                minHeight: 'clamp(32px,4.5dvh,38px)', borderRadius: 999,
                border: '1px solid rgba(99,102,241,.12)',
                background: i === 0 ? 'rgba(99,102,241,.08)' : '#fff',
                display: 'grid', placeItems: 'center',
                fontSize: 'clamp(10px,2.5vw,12px)', fontWeight: 750,
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
