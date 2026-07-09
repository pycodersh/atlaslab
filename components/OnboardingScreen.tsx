'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, Volume2, Sparkles } from 'lucide-react'
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
    // en and everything else falls through to default
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
      { label: 'WELCOME',
        title: 'Repeat Patterns.\nBuild Fluency.',
        desc: '영어를 매일 조금씩, 자연스럽게 익혀보세요.' },
      { label: 'STORIES',
        title: '스토리로 시작하세요',
        desc: '실제 영어를 읽고 들으며 자연스럽게 익힐 수 있습니다.' },
      { label: 'REPEAT',
        title: '잊기 전에 다시 만나세요',
        desc: '자주 쓰는 표현을 자연스럽게 반복하도록 도와드립니다.' },
      { label: 'ESSAYS',
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
      { label: 'WELCOME',
        title: 'Repeat Patterns.\nBuild Fluency.',
        desc: 'Learn English naturally, a little bit every day.' },
      { label: 'STORIES',
        title: 'Start with Stories',
        desc: 'Read and listen to real English to naturally pick up the language.' },
      { label: 'REPEAT',
        title: 'Review Before You Forget',
        desc: 'We help you revisit common expressions at just the right moment.' },
      { label: 'ESSAYS',
        title: 'AI Reviews Your Writing',
        desc: 'Write an essay and receive handcrafted-style corrections from your AI editor.' },
      { label: 'START',
        title: 'Ready to Begin?',
        desc: 'Build your personal English routine with PATTO.' },
    ],
  },
  ja: {
    skip: 'スキップ', back: '戻る', next: '次へ', start: 'はじめる',
    langNote: '表示言語はデバイス設定に従います。Settingsからいつでも変更できます。',
    slides: [
      { label: 'WELCOME',
        title: 'Repeat Patterns.\nBuild Fluency.',
        desc: '毎日少しずつ、自然に英語を身につけましょう。' },
      { label: 'ストーリー',
        title: 'ストーリーから始めよう',
        desc: '本物の英語を読んで聞いて、自然に学べます。' },
      { label: '繰り返し',
        title: '忘れる前に再び',
        desc: 'よく使う表現を自然なリズムで繰り返します。' },
      { label: 'エッセイ',
        title: 'AIが添削します',
        desc: 'エッセイを書くと、AI編集者が丁寧に添削します。' },
      { label: 'スタート',
        title: '始める準備はできましたか？',
        desc: 'PATTOと一緒に英語学習ルーティンを作りましょう。' },
    ],
  },
}

// ── Illustrations ─────────────────────────────────────────────────────────────
function Illus1() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/patto-logo.png" alt="" width={56} height={54} style={{ display: 'block' }} />
        <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--pt)', lineHeight: 1 }}>PATTO</span>
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--pm)', textTransform: 'uppercase', margin: 0, textAlign: 'center', lineHeight: 1.8 }}>
        Repeat Patterns.<br />Build Fluency.
      </p>
    </div>
  )
}

function Illus2({ isDark }: { isDark: boolean }) {
  const lineColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'
  const accentLine = isDark ? 'rgba(143,171,255,0.35)' : 'rgba(109,141,255,0.30)'
  return (
    <div style={{ width: 240, background: 'var(--pglass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--pglass-border)', borderRadius: 20, padding: '20px 20px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
      {/* Story tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--pa)', opacity: 0.7 }} />
        <div style={{ height: 7, width: 80, background: accentLine, borderRadius: 4 }} />
      </div>
      {/* Text lines */}
      {[85, 70, 90, 60].map((w, i) => (
        <div key={i} style={{ height: 7, width: `${w}%`, background: lineColor, borderRadius: 4, marginBottom: 10 }} />
      ))}
      {/* Audio row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: isDark ? 'rgba(143,171,255,0.14)' : 'rgba(109,141,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Volume2 style={{ width: 14, height: 14, color: 'var(--pa)' }} strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 6, width: '70%', background: lineColor, borderRadius: 4, marginBottom: 6 }} />
          <div style={{ height: 5, width: '45%', background: lineColor, borderRadius: 4, opacity: 0.6 }} />
        </div>
      </div>
    </div>
  )
}

function Illus3({ isDark }: { isDark: boolean }) {
  const chips = [
    { text: 'I was about to...', rotate: '-4deg', top: 0,   opacity: 0.45, scale: 0.95 },
    { text: "I'm used to...",    rotate: '2.5deg', top: 18,  opacity: 0.70, scale: 0.97 },
    { text: 'look forward to', rotate: '-1deg', top: 36,  opacity: 1,    scale: 1 },
  ]
  return (
    <div style={{ position: 'relative', width: 220, height: 120 }}>
      {chips.map((c, i) => (
        <div key={i} style={{ position: 'absolute', top: c.top, left: '50%', transform: `translateX(-50%) rotate(${c.rotate}) scale(${c.scale})`, opacity: c.opacity, background: 'var(--pglass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--pglass-border)', borderRadius: 40, padding: '10px 20px', whiteSpace: 'nowrap', boxShadow: i === 2 ? '0 6px 20px rgba(0,0,0,0.10)' : 'none' }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--pt)', fontFamily: 'var(--font-baloo, sans-serif)', letterSpacing: '-0.01em' }}>{c.text}</span>
        </div>
      ))}
      <div style={{ position: 'absolute', bottom: -8, right: 10, width: 28, height: 28, borderRadius: '50%', background: isDark ? 'rgba(143,171,255,0.15)' : 'rgba(109,141,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw style={{ width: 12, height: 12, color: 'var(--pa)' }} strokeWidth={2.2} />
      </div>
    </div>
  )
}

function Illus4({ isDark }: { isDark: boolean }) {
  const rows = [
    { wrong: 'I have went', right: 'I have gone', tag: 'Verb Form', tagBg: 'rgba(255,59,48,0.10)', tagColor: '#C0392B' },
    { wrong: 'since 2 year', right: 'for 2 years', tag: 'Preposition', tagBg: 'rgba(255,149,0,0.12)', tagColor: '#B36200' },
  ]
  const redFade = isDark ? 'rgba(220,100,100,0.65)' : 'rgba(180,60,60,0.55)'
  return (
    <div style={{ width: 260, background: 'var(--pglass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--pglass-border)', borderRadius: 18, padding: '16px 18px', boxShadow: '0 8px 28px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
        <Sparkles style={{ width: 11, height: 11, color: 'var(--pa)' }} strokeWidth={2} />
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--pm2)', textTransform: 'uppercase' }}>Editor&apos;s Marks</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, paddingBottom: i < rows.length - 1 ? 12 : 0, marginBottom: i < rows.length - 1 ? 12 : 0, borderBottom: i < rows.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` : 'none' }}>
          <span style={{ fontSize: 12, color: redFade, textDecoration: 'line-through' }}>{r.wrong}</span>
          <span style={{ fontSize: 11, color: 'var(--pm2)' }}>→</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1A7A35' }}>{r.right}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: r.tagColor, background: r.tagBg, borderRadius: 6, padding: '2px 7px', whiteSpace: 'nowrap' }}>{r.tag}</span>
        </div>
      ))}
    </div>
  )
}

function Illus5({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 72, height: 72, borderRadius: 24, background: isDark ? 'rgba(143,171,255,0.12)' : 'rgba(109,141,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isDark ? '0 0 32px rgba(143,171,255,0.12)' : '0 0 32px rgba(109,141,255,0.10)' }}>
        <svg width={36} height={36} viewBox="0 0 36 36" fill="none">
          <polyline points="7,19 14,26 29,11" stroke="var(--pa)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* Dot constellation */}
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        {[1,0.4,0.7,0.25,0.5].map((op, i) => (
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

  // Touch swipe
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

  const bg          = isDark ? '#0F172A' : '#F7FBFF'
  const c1          = isDark ? 'rgba(30,58,138,0.18)' : 'rgba(195,225,255,0.50)'
  const c2          = isDark ? 'rgba(23,45,110,0.13)' : 'rgba(210,238,255,0.40)'
  const c3          = isDark ? 'rgba(15,30,80,0.10)'  : 'rgba(225,244,255,0.32)'

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

      {/* Slide area — horizontal scroll via transform */}
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
                  padding: '0 32px',
                  gap: 0,
                }}
              >
                {/* Illustration */}
                <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160 }}>
                  {i === 0 ? <Illus /> : <Illus isDark={isDark} />}
                </div>

                {/* Text */}
                <div style={{ textAlign: 'center', maxWidth: 320 }}>
                  <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm2)', textTransform: 'uppercase', margin: '0 0 14px' }}>
                    {sl.label}
                  </p>
                  <h2 style={{ fontSize: 'clamp(22px, 6vw, 28px)', fontWeight: 800, color: 'var(--pt)', margin: '0 0 14px', lineHeight: 1.22, letterSpacing: '-0.02em', whiteSpace: 'pre-line' }}>
                    {sl.title}
                  </h2>
                  <p style={{ fontSize: 15, color: 'var(--pm)', margin: 0, lineHeight: 1.65, fontWeight: 400 }}>
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
          {/* Back */}
          <button
            type="button"
            onClick={goBack}
            style={{ minHeight: 52, minWidth: 52, borderRadius: 16, background: 'var(--pglass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--pglass-border)', cursor: slide === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: slide === 0 ? 0 : 1, transition: 'opacity 0.2s', pointerEvents: slide === 0 ? 'none' : 'auto' }}
            aria-label={s.back}
          >
            <ChevronLeft style={{ width: 18, height: 18, color: 'var(--pm)' }} strokeWidth={2} />
          </button>

          {/* Next / Start */}
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
