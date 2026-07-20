'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Headphones,
  Layers3,
  Sparkles,
  Trophy,
} from 'lucide-react'

import { usePreferences } from '@/contexts/PreferencesContext'
import { ONBOARDING_COPY } from '@/lib/i18n/onboarding'

const ONBOARDING_DONE_KEY = 'patto_onboarding_done_v1'

export default function PattoOnboardingPage() {
  const router = useRouter()
  const { prefs } = usePreferences()
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const copy = useMemo(() => {
    return ONBOARDING_COPY[prefs.language] ?? ONBOARDING_COPY.en
  }, [prefs.language])

  const slides = useMemo(
    () => [
      {
        eyebrow: '1 / 4',
        title: copy.slide1.title,
        body: copy.slide1.body,
        visual: <PatternVisual />,
      },
      {
        eyebrow: '2 / 4',
        title: copy.slide2.title,
        body: copy.slide2.body,
        visual: <StoriesVisual />,
      },
      {
        eyebrow: '3 / 4',
        title: copy.slide3.title,
        body: copy.slide3.body,
        visual: <RepeatVisual />,
      },
      {
        eyebrow: '4 / 4',
        title: copy.slide4.title,
        body: copy.slide4.body,
        visual: <ChallengeVisual />,
      },
    ],
    [copy],
  )

  const isLast = index === slides.length - 1

  function completeOnboarding() {
    localStorage.setItem(ONBOARDING_DONE_KEY, 'true')
    router.replace('/patto/home')
  }

  function goNext() {
    if (isLast) {
      completeOnboarding()
      return
    }
    setIndex((current) => Math.min(current + 1, slides.length - 1))
  }

  function goPrev() {
    setIndex((current) => Math.max(current - 1, 0))
  }

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current
    const delta = endX - touchStartX.current
    touchStartX.current = null

    if (Math.abs(delta) < 48) return
    if (delta < 0) goNext()
    else goPrev()
  }

  const slide = slides[index]

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
        color: 'var(--pt)',
      }}
    >
      <section
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          width: '100%',
          maxWidth: 480,
          minHeight: 'calc(100dvh - 40px)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 28,
          background: 'var(--pglass)',
          border: '1px solid var(--pglass-border)',
          boxShadow: '0 24px 80px rgba(64, 72, 160, 0.10)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '22px 22px 0',
          }}
        >
          <strong
            style={{
              fontSize: 13,
              letterSpacing: '0.08em',
              color: '#6366F1',
            }}
          >
            {slide.eyebrow}
          </strong>

          <button
            type="button"
            onClick={completeOnboarding}
            aria-label={copy.skip}
            style={{
              border: 0,
              background: 'transparent',
              color: 'var(--pm)',
              fontSize: 14,
              cursor: 'pointer',
              padding: 8,
            }}
          >
            {copy.skip}
          </button>
        </div>

        <div
          style={{
            padding: '28px 28px 0',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -22 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(32px, 8vw, 44px)',
                  lineHeight: 1.12,
                  letterSpacing: '-0.04em',
                  whiteSpace: 'pre-line',
                  maxWidth: 390,
                }}
              >
                {slide.title}
              </h1>

              <p
                style={{
                  margin: '18px 0 0',
                  maxWidth: 360,
                  fontSize: 17,
                  lineHeight: 1.65,
                  color: 'var(--pm)',
                  whiteSpace: 'pre-line',
                }}
              >
                {slide.body}
              </p>

              <div
                style={{
                  flex: 1,
                  minHeight: 310,
                  display: 'grid',
                  placeItems: 'center',
                  padding: '24px 0 8px',
                }}
              >
                {slide.visual}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          style={{
            padding: '0 24px 24px',
            display: 'grid',
            gap: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {slides.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                onClick={() => setIndex(dotIndex)}
                aria-label={`Go to slide ${dotIndex + 1}`}
                style={{
                  width: dotIndex === index ? 24 : 8,
                  height: 8,
                  borderRadius: 999,
                  border: 0,
                  padding: 0,
                  cursor: 'pointer',
                  background:
                    dotIndex === index ? '#6366F1' : 'rgba(99, 102, 241, 0.18)',
                  transition: 'all 180ms ease',
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            style={{
              width: '100%',
              minHeight: 56,
              border: 0,
              borderRadius: 18,
              background: '#6366F1',
              color: '#fff',
              fontSize: 17,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              cursor: 'pointer',
              boxShadow: '0 12px 28px rgba(99, 102, 241, 0.28)',
            }}
          >
            {isLast ? copy.start : copy.next}
            <ArrowRight size={19} strokeWidth={2.2} />
          </button>
        </div>
      </section>
    </main>
  )
}

function Bubble({
  children,
  x,
  y,
}: {
  children: React.ReactNode
  x: string
  y: string
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        padding: '10px 14px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.84)',
        border: '1px solid rgba(99,102,241,0.16)',
        boxShadow: '0 10px 30px rgba(84, 89, 150, 0.10)',
        fontSize: 14,
        fontWeight: 700,
        color: 'var(--pt)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  )
}

function PatternVisual() {
  return (
    <div
      style={{
        width: 330,
        height: 300,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '35px 32px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(99,102,241,0.16) 0%, rgba(99,102,241,0.05) 48%, transparent 72%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '18px 26px',
          borderRadius: 18,
          background: 'rgba(255,255,255,0.94)',
          border: '1px solid rgba(99,102,241,0.18)',
          boxShadow: '0 18px 44px rgba(73, 78, 150, 0.14)',
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          zIndex: 2,
        }}
      >
        I want to
      </div>

      <Bubble x="24%" y="25%">go</Bubble>
      <Bubble x="76%" y="24%">try</Bubble>
      <Bubble x="84%" y="52%">know</Bubble>
      <Bubble x="72%" y="78%">see</Bubble>
      <Bubble x="22%" y="74%">meet</Bubble>

      <svg
        viewBox="0 0 330 300"
        width="330"
        height="300"
        style={{ position: 'absolute', inset: 0 }}
        aria-hidden="true"
      >
        <g
          fill="none"
          stroke="rgba(99,102,241,0.38)"
          strokeWidth="2"
          strokeDasharray="5 8"
        >
          <path d="M165 150 C130 100, 105 85, 82 75" />
          <path d="M165 150 C205 105, 230 84, 251 72" />
          <path d="M165 150 C220 145, 252 148, 278 156" />
          <path d="M165 150 C205 200, 220 220, 238 234" />
          <path d="M165 150 C122 192, 104 210, 74 222" />
        </g>
      </svg>
    </div>
  )
}

function StoriesVisual() {
  return (
    <div
      style={{
        width: 330,
        display: 'grid',
        justifyItems: 'center',
        gap: 18,
      }}
    >
      <div
        style={{
          width: 250,
          height: 150,
          borderRadius: 28,
          border: '1px solid rgba(99,102,241,0.18)',
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,242,255,0.86))',
          boxShadow: '0 18px 46px rgba(70, 75, 150, 0.12)',
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <BookOpen size={76} color="#6366F1" strokeWidth={1.45} />
        <div
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            width: 42,
            height: 42,
            borderRadius: 14,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(99,102,241,0.10)',
          }}
        >
          <Layers3 size={22} color="#6366F1" />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 16,
          width: '100%',
        }}
      >
        <MetricCard value="100" label="Stories" />
        <ArrowRight size={24} color="#6366F1" />
        <MetricCard value="500" label="Patterns" />
      </div>
    </div>
  )
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        borderRadius: 22,
        padding: '18px 14px',
        textAlign: 'center',
        background: 'rgba(99,102,241,0.08)',
        border: '1px solid rgba(99,102,241,0.14)',
      }}
    >
      <div
        style={{
          fontSize: 34,
          lineHeight: 1,
          fontWeight: 850,
          color: '#6366F1',
          letterSpacing: '-0.04em',
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 7,
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--pm)',
        }}
      >
        {label}
      </div>
    </div>
  )
}

function RepeatVisual() {
  return (
    <div
      style={{
        width: 310,
        height: 320,
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <svg
        viewBox="0 0 310 320"
        width="310"
        height="320"
        style={{ position: 'absolute', inset: 0 }}
        aria-hidden="true"
      >
        <path
          d="M78 86 C26 150, 45 234, 120 265"
          fill="none"
          stroke="#6366F1"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M232 86 C284 150, 265 234, 190 265"
          fill="none"
          stroke="rgba(99,102,241,0.42)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          top: 28,
          left: 38,
          width: 112,
          height: 112,
          borderRadius: '50%',
          background: 'rgba(99,102,241,0.10)',
          border: '1px solid rgba(99,102,241,0.18)',
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
        }}
      >
        <div>
          <Headphones size={38} color="#6366F1" />
          <div style={{ fontSize: 27, fontWeight: 850, marginTop: 4 }}>×5</div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 38,
          bottom: 28,
          width: 112,
          height: 112,
          borderRadius: '50%',
          background: 'rgba(99,102,241,0.10)',
          border: '1px solid rgba(99,102,241,0.18)',
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
        }}
      >
        <div>
          <BookOpen size={38} color="#6366F1" />
          <div style={{ fontSize: 27, fontWeight: 850, marginTop: 4 }}>×10</div>
        </div>
      </div>

      <div
        style={{
          width: 92,
          height: 92,
          borderRadius: 28,
          display: 'grid',
          placeItems: 'center',
          background: '#6366F1',
          boxShadow: '0 16px 36px rgba(99,102,241,0.26)',
        }}
      >
        <Sparkles size={42} color="#fff" strokeWidth={1.8} />
      </div>
    </div>
  )
}

function ChallengeVisual() {
  return (
    <div
      style={{
        width: 320,
        display: 'grid',
        justifyItems: 'center',
        gap: 18,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 230,
          height: 230,
          borderRadius: '50%',
          border: '2px solid rgba(99,102,241,0.20)',
          display: 'grid',
          placeItems: 'center',
          background:
            'radial-gradient(circle, rgba(99,102,241,0.12), rgba(99,102,241,0.03) 58%, transparent 70%)',
        }}
      >
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: 30,
            display: 'grid',
            placeItems: 'center',
            background: '#6366F1',
            boxShadow: '0 16px 36px rgba(99,102,241,0.26)',
          }}
        >
          <Trophy size={48} color="#fff" strokeWidth={1.8} />
        </div>

        <IconNode
          style={{ position: 'absolute', left: -12, top: 96 }}
          icon={<Headphones size={26} color="#6366F1" />}
        />
        <IconNode
          style={{ position: 'absolute', right: -12, top: 96 }}
          icon={<BookOpen size={26} color="#6366F1" />}
        />
        <IconNode
          style={{ position: 'absolute', left: 88, bottom: -16 }}
          icon={<CheckCircle2 size={27} color="#6366F1" />}
        />
      </div>

      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#6366F1',
          letterSpacing: '0.02em',
        }}
      >
        Listen · Read · Challenge · Repeat
      </div>
    </div>
  )
}

function IconNode({
  icon,
  style,
}: {
  icon: React.ReactNode
  style: React.CSSProperties
}) {
  return (
    <div
      style={{
        ...style,
        width: 64,
        height: 64,
        borderRadius: 22,
        display: 'grid',
        placeItems: 'center',
        background: 'rgba(255,255,255,0.94)',
        border: '1px solid rgba(99,102,241,0.18)',
        boxShadow: '0 10px 28px rgba(76, 80, 150, 0.12)',
      }}
    >
      {icon}
    </div>
  )
}
