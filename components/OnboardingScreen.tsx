'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Volume2, Sparkles, Bookmark } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

// ── Language detection ────────────────────────────────────────────────────────
type Lang = 'ko' | 'en' | 'ja'

function detectLang(): Lang {
  if (typeof navigator === 'undefined') return 'ko'
  const langs = Array.from(
    (navigator as Navigator & { languages?: readonly string[] }).languages
    ?? [navigator.language ?? 'ko']
  )
  for (const l of langs) {
    const code = l.toLowerCase().split('-')[0]
    if (code === 'ko') return 'ko'
    if (code === 'ja') return 'ja'
  }
  return 'en'
}

// ── Copy ──────────────────────────────────────────────────────────────────────
const STRINGS: Record<Lang, {
  skip: string; back: string; next: string; start: string; langNote: string
  slides: Array<{ label: string; title: string; desc: string }>
}> = {
  ko: {
    skip: '건너뛰기', back: '이전', next: '다음', start: '시작하기',
    langNote: '현재 언어는 기기 설정을 기준으로 표시됩니다. 언제든 Settings에서 변경할 수 있습니다.',
    slides: [
      { label: '',
        title: 'Repeat Patterns.\nBuild Fluency.',
        desc: '읽고, 듣고, 반복하며\n영어를 습관으로 만드세요.' },
      { label: 'STORIES',
        title: '스토리로 시작하세요',
        desc: '실제 영어를 읽고 들으며 자연스럽게 익힐 수 있습니다.' },
      { label: 'REPEAT',
        title: '잊기 전에 다시 만나세요',
        desc: '자주 쓰는 표현을 자연스럽게 반복하도록 도와드립니다.' },
      { label: 'AI ESSAY',
        title: 'AI가 첨삭해드립니다',
        desc: '에세이를 작성하면 손글씨처럼 자연스럽게 첨삭해드립니다.' },
      { label: 'START',
        title: '이제 시작해볼까요?',
        desc: '나만의 영어 학습 루틴을 PATTO와 함께 만들어보세요.' },
    ],
  },
  en: {
    skip: 'Skip', back: 'Back', next: 'Next', start: 'Get Started',
    langNote: 'Display language follows your device settings. You can change it anytime in Settings.',
    slides: [
      { label: '',
        title: 'Repeat Patterns.\nBuild Fluency.',
        desc: 'Read, listen, and repeat —\nbuild English into your daily habit.' },
      { label: 'STORIES',
        title: 'Start with Stories',
        desc: 'Read and listen to real English to naturally pick up the language.' },
      { label: 'REPEAT',
        title: 'Review Before You Forget',
        desc: 'We help you revisit common expressions at just the right moment.' },
      { label: 'AI ESSAY',
        title: 'AI Reviews Your Writing',
        desc: 'Write an essay and receive handcrafted-style corrections from your AI editor.' },
      { label: 'START',
        title: 'Ready to Begin?',
        desc: 'Build your personal English routine\nwith PATTO.' },
    ],
  },
  ja: {
    skip: 'スキップ', back: '戻る', next: '次へ', start: 'はじめる',
    langNote: '表示言語はデバイス設定に従います。Settingsからいつでも変更できます。',
    slides: [
      { label: '',
        title: 'Repeat Patterns.\nBuild Fluency.',
        desc: '読んで、聴いて、繰り返して\n英語を習慣にしましょう。' },
      { label: 'ストーリー',
        title: 'ストーリーから始めよう',
        desc: '本物の英語を読んで聞いて、自然に学べます。' },
      { label: '繰り返し',
        title: '忘れる前に再び',
        desc: 'よく使う表現を自然なリズムで繰り返します。' },
      { label: 'AIエッセイ',
        title: 'AIが添削します',
        desc: 'エッセイを書くと、AI編集者が丁寧に添削します。' },
      { label: 'スタート',
        title: '始める準備はできましたか？',
        desc: 'PATTOと一緒に英語学習ルーティンを作りましょう。' },
    ],
  },
}

// ── Illustrations ─────────────────────────────────────────────────────────────

// Slide 1: PATTO logo only (title text lives in the copy area, no duplication)
function Illus1(_props?: { isDark?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <img src="/patto-logo.png" alt="" width={60} height={58} style={{ display: 'block' }} />
      <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--pt)', lineHeight: 1 }}>
        PATTO
      </span>
    </div>
  )
}

// Slide 2: Realistic story card — mirrors the actual home screen card
function Illus2({ isDark }: { isDark: boolean }) {
  return (
    <div style={{
      width: 264,
      background: isDark ? 'rgba(22,32,52,0.95)' : '#fff',
      borderRadius: 20,
      padding: '18px 20px',
      boxShadow: '0 10px 36px rgba(0,0,0,0.13)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
    }}>
      {/* Level badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', color: 'var(--pa)', textTransform: 'uppercase', background: 'rgba(109,141,255,0.12)', borderRadius: 5, padding: '2px 8px' }}>
          BEGINNER · 1
        </span>
      </div>
      {/* Title */}
      <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--pt)', margin: '0 0 9px', letterSpacing: '-0.02em' }}>
        A New Start
      </p>
      {/* Body preview */}
      <p style={{ fontSize: 12.5, color: 'var(--pm)', margin: '0 0 16px', lineHeight: 1.65 }}>
        It was Monday morning. Sarah opened her eyes and looked at the ceiling. Today was different — she had finally decided to change her life...
      </p>
      {/* Bottom row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 12, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(109,141,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Volume2 style={{ width: 14, height: 14, color: 'var(--pa)' }} strokeWidth={1.8} />
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--pm)' }}>Listen</span>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <span style={{ fontSize: 10, color: '#8E8E93', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', borderRadius: 5, padding: '3px 8px' }}>5 min</span>
          <span style={{ fontSize: 10, color: '#8E8E93', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', borderRadius: 5, padding: '3px 8px' }}>6 patterns</span>
        </div>
      </div>
    </div>
  )
}

// Slide 3: Realistic pattern card
function Illus3({ isDark }: { isDark: boolean }) {
  return (
    <div style={{
      width: 264,
      background: isDark ? 'rgba(22,32,52,0.95)' : '#fff',
      borderRadius: 20,
      padding: '18px 20px',
      boxShadow: '0 10px 36px rgba(0,0,0,0.13)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
    }}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: '#8E8E93', textTransform: 'uppercase', margin: '0 0 6px' }}>
        PATTERN
      </p>
      <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--pt)', margin: '0 0 12px', letterSpacing: '-0.01em', fontFamily: 'var(--font-baloo, sans-serif)' }}>
        look forward to
      </p>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: '#8E8E93', textTransform: 'uppercase', margin: '0 0 4px' }}>
        MEANING
      </p>
      <p style={{ fontSize: 12.5, color: 'var(--pm)', margin: '0 0 12px' }}>
        미래의 일을 기대하거나 고대하다
      </p>
      <div style={{
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        borderRadius: 10, padding: '10px 12px', marginBottom: 14,
      }}>
        <p style={{ fontSize: 13, color: 'var(--pt)', margin: 0, lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700 }}>I look forward to</span> seeing you soon.
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(109,141,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Volume2 style={{ width: 15, height: 15, color: 'var(--pa)' }} strokeWidth={1.8} />
        </div>
        <Bookmark style={{ width: 16, height: 16, color: '#C0C0C5' }} strokeWidth={1.8} />
      </div>
    </div>
  )
}

// Slide 4: Essay correction — uses real screenshot if placed at /public/onboarding-essay.jpg
function Illus4({ isDark }: { isDark: boolean }) {
  const [showFallback, setShowFallback] = useState(false)

  if (!showFallback) {
    return (
      <div style={{ width: 240, borderRadius: 18, overflow: 'hidden', boxShadow: '0 10px 36px rgba(0,0,0,0.14)' }}>
        <img
          src="/onboarding-essay.jpg"
          alt="AI essay correction example"
          style={{ width: '100%', display: 'block', objectFit: 'cover', objectPosition: 'top', maxHeight: 300 }}
          onError={() => setShowFallback(true)}
        />
      </div>
    )
  }

  // Fallback: handwritten correction mock
  const corr = '#7B1A1A'
  const sep = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'

  return (
    <div style={{
      width: 264,
      background: isDark ? 'rgba(28,24,20,0.97)' : '#FAFAF7',
      borderRadius: 18,
      padding: '16px 18px',
      boxShadow: '0 10px 36px rgba(0,0,0,0.12)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${sep}` }}>
        <Sparkles style={{ width: 10, height: 10, color: corr }} strokeWidth={2} />
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: corr, textTransform: 'uppercase' }}>
          Editor&apos;s Marks
        </span>
      </div>

      {/* Essay text with corrections */}
      <p style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.85)' : '#1C1C1E', lineHeight: 2.3, margin: 0, fontFamily: 'Georgia, "Times New Roman", serif' }}>
        Last weekend I{' '}
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ textDecoration: 'underline', textDecorationStyle: 'wavy', textDecorationColor: corr }}>go</span>
          <span style={{ position: 'absolute', top: '-1.25em', left: '50%', transform: 'translateX(-50%)', color: corr, fontSize: 11.5, fontStyle: 'italic', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: '"Caveat", cursive, Georgia, serif' }}>went</span>
        </span>
        {' '}to the beach. The weather{' '}
        <span style={{ color: corr, textDecoration: 'line-through', opacity: 0.75 }}>were</span>{' '}
        <span style={{ color: '#1A6B35', fontWeight: 700 }}>was</span>{' '}
        so nice that everyone wanted{' '}
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ outline: `1.5px solid ${corr}`, borderRadius: '40%', padding: '0 3px' }}>staying</span>
          <span style={{ position: 'absolute', top: '-1.25em', left: '50%', transform: 'translateX(-50%)', color: corr, fontSize: 11.5, fontStyle: 'italic', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: '"Caveat", cursive, Georgia, serif' }}>to stay</span>
        </span>
        {' '}outside.
      </p>
    </div>
  )
}

// Slide 5: Finish
function Illus5({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 76, height: 76, borderRadius: 26,
        background: isDark ? 'rgba(143,171,255,0.12)' : 'rgba(109,141,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isDark ? '0 0 36px rgba(143,171,255,0.14)' : '0 0 36px rgba(109,141,255,0.12)',
      }}>
        <svg width={38} height={38} viewBox="0 0 38 38" fill="none">
          <polyline points="8,20 15,27 30,12" stroke="var(--pa)" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ display: 'flex', gap: 7, marginTop: 6 }}>
        {[1, 0.4, 0.7, 0.25, 0.5].map((op, i) => (
          <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--pa)', opacity: op }} />
        ))}
      </div>
    </div>
  )
}

const ILLUSTRATIONS = [Illus1, Illus2, Illus3, Illus4, Illus5]

// ── Main component ────────────────────────────────────────────────────────────
const TOTAL = 5

type Props = { onComplete: () => void }

export function OnboardingScreen({ onComplete }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [lang] = useState<Lang>(() => detectLang())
  const [slide, setSlide] = useState(0)
  const [visible, setVisible] = useState(true)

  const s = STRINGS[lang]
  const current = s.slides[slide]
  const isLast = slide === TOTAL - 1

  const touchX = useRef<number | null>(null)

  function goNext() {
    if (slide < TOTAL - 1) setSlide(v => v + 1)
  }
  function goBack() {
    if (slide > 0) setSlide(v => v - 1)
  }
  function finish() {
    setVisible(false)
    setTimeout(onComplete, 260)
  }

  const bg = isDark ? '#0F172A' : '#F7FBFF'
  const c1 = isDark ? 'rgba(30,58,138,0.18)' : 'rgba(195,225,255,0.50)'
  const c2 = isDark ? 'rgba(23,45,110,0.13)' : 'rgba(210,238,255,0.40)'
  const c3 = isDark ? 'rgba(15,30,80,0.10)'  : 'rgba(225,244,255,0.32)'

  const IllusComp = ILLUSTRATIONS[slide]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: bg,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transition: visible ? 'none' : 'opacity 260ms ease',
      }}
      onTouchStart={e => { touchX.current = e.targetTouches[0].clientX }}
      onTouchEnd={e => {
        if (touchX.current === null) return
        const delta = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (delta < -48) goNext()
        else if (delta > 48) goBack()
      }}
    >
      {/* Background circles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: '72vw', height: '72vw', borderRadius: '50%', background: c1, top: '-22vw', right: '-18vw', animation: 'obDriftA 15s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: '58vw', height: '58vw', borderRadius: '50%', background: c2, bottom: '-14vw', left: '-12vw', animation: 'obDriftB 19s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: '38vw', height: '38vw', borderRadius: '50%', background: c3, top: '42%', left: '55%', transform: 'translate(-50%,-50%)', animation: 'obDriftC 24s ease-in-out infinite' }} />
      </div>

      {/* Header: skip + page number */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 0' }}>
        <button
          type="button"
          onClick={finish}
          style={{ minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', fontSize: 13.5, fontWeight: 600, color: 'var(--pm)', fontFamily: 'inherit', opacity: isLast ? 0 : 1, pointerEvents: isLast ? 'none' : 'auto', transition: 'opacity 0.2s' }}
        >
          {s.skip}
        </button>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--pm2)', letterSpacing: '0.04em' }}>
          {slide + 1} / {TOTAL}
        </span>
      </div>

      {/* Slide area */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            width: `${TOTAL * 100}%`,
            height: '100%',
            transform: `translateX(-${(slide / TOTAL) * 100}%)`,
            transition: 'transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {s.slides.map((sl, i) => {
            const Illus = ILLUSTRATIONS[i]
            return (
              <div
                key={i}
                style={{
                  width: `${100 / TOTAL}%`,
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 28px',
                  gap: 0,
                }}
              >
                {/* Illustration */}
                <div style={{ marginBottom: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160 }}>
                  <Illus isDark={isDark} />
                </div>

                {/* Text */}
                <div style={{ textAlign: 'center', maxWidth: 340, width: '100%' }}>
                  {sl.label && (
                    <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm2)', textTransform: 'uppercase', margin: '0 0 14px' }}>
                      {sl.label}
                    </p>
                  )}
                  <h2 style={{ fontSize: 'clamp(22px, 6vw, 28px)', fontWeight: 800, color: 'var(--pt)', margin: '0 0 14px', lineHeight: 1.22, letterSpacing: '-0.02em', whiteSpace: 'pre-line' }}>
                    {sl.title}
                  </h2>
                  <p style={{ fontSize: 15, color: 'var(--pm)', margin: 0, lineHeight: 1.65, fontWeight: 400, whiteSpace: 'pre-line', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                    {sl.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer: dots + nav */}
      <div style={{ position: 'relative', padding: '0 24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
        {/* Language note on last slide */}
        {isLast && (
          <p style={{ fontSize: 11, color: 'var(--pm2)', textAlign: 'center', margin: '0 0 16px', lineHeight: 1.6 }}>
            {s.langNote}
          </p>
        )}

        {/* Dot indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginBottom: 20 }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlide(i)}
              style={{ width: i === slide ? 20 : 7, height: 7, borderRadius: 99, background: i === slide ? 'var(--pa)' : (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'), transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', padding: 0 }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={goBack}
            style={{ minHeight: 52, minWidth: 52, borderRadius: 16, background: 'var(--pglass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--pglass-border)', cursor: slide === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: slide === 0 ? 0 : 1, transition: 'opacity 0.2s', pointerEvents: slide === 0 ? 'none' : 'auto' }}
            aria-label={s.back}
          >
            <ChevronLeft style={{ width: 18, height: 18, color: 'var(--pm)' }} strokeWidth={2} />
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={finish}
              style={{ flex: 1, minHeight: 52, borderRadius: 16, background: 'var(--pa)', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'inherit', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isDark ? '0 4px 20px rgba(143,171,255,0.25)' : '0 4px 20px rgba(109,141,255,0.25)' }}
            >
              {s.start}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              style={{ flex: 1, minHeight: 52, borderRadius: 16, background: 'var(--pglass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--pglass-border)', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: 'var(--pt)', fontFamily: 'inherit', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {s.next}
              <ChevronRight style={{ width: 16, height: 16 }} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes obDriftA {
          0%,100% { transform: translate(0,0) scale(1); }
          35%      { transform: translate(-3%,4%) scale(1.04); opacity: 0.85; }
          68%      { transform: translate(4%,-2%) scale(0.97); opacity: 0.95; }
        }
        @keyframes obDriftB {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(4%,-4%) scale(1.05); opacity: 0.88; }
          72%      { transform: translate(-3%,3%) scale(0.96); opacity: 0.92; }
        }
        @keyframes obDriftC {
          0%,100% { transform: translate(-50%,-50%) scale(1); }
          50%      { transform: translate(-52%,-53%) scale(1.08); opacity: 0.80; }
        }
      `}</style>
    </div>
  )
}
