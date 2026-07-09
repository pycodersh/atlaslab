'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Volume2, Sparkles, Bookmark, BookOpen } from 'lucide-react'
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

// ── Slide configs ─────────────────────────────────────────────────────────────
const SLIDE_BGS_LIGHT = ['#E8F2FD', '#EEF2FF', '#F2F0FF', '#FDF0EC', '#EDF8F2', '#F5F5F7']
const SLIDE_BGS_DARK  = ['#091525', '#090F20', '#0D0A1E', '#1A0C07', '#071410', '#111113']
const SLIDE_COLORS    = ['#6B8FD7', '#6B7FD7', '#8B6FD7', '#C4705A', '#4CAF7D', '#9B70BE']

// ── Copy ──────────────────────────────────────────────────────────────────────
const STRINGS: Record<Lang, {
  skip: string; back: string; next: string; start: string; langNote: string
  slides: Array<{ badge: string; title: string; desc: string }>
}> = {
  ko: {
    skip: '건너뛰기', back: '이전', next: '다음', start: '시작하기',
    langNote: '현재 언어는 기기 설정을 기준으로 표시됩니다. 언제든 Settings에서 변경할 수 있습니다.',
    slides: [
      { badge: '',         title: 'PATTO에\n오신 것을 환영합니다.',        desc: '영어를 매일 조금씩, 자연스럽게 익혀보세요.' },
      { badge: 'STORIES',  title: '스토리로 시작하세요.',                  desc: '실제 영어를 읽고 들으며 자연스럽게 익힐 수 있습니다.' },
      { badge: 'PATTERNS', title: '패턴을 반복하세요.',                    desc: '자주 쓰는 표현을 반복해서 자연스럽게 익혀보세요.' },
      { badge: 'AI ESSAY', title: 'AI가 첨삭해드립니다.',                  desc: '에세이를 작성하면 손글씨처럼 자연스럽게 첨삭해드립니다.' },
      { badge: 'PROGRESS', title: '성장을 확인하세요.',                    desc: '학습 기록과 통계를 통해 나의 성장을 확인할 수 있습니다.' },
      { badge: 'START',    title: '이제 시작해볼까요?',                    desc: '나만의 영어 학습 루틴을 PATTO와 함께 만들어보세요.' },
    ],
  },
  en: {
    skip: 'Skip', back: 'Back', next: 'Next', start: 'Get Started',
    langNote: 'Display language follows your device settings. You can change it anytime in Settings.',
    slides: [
      { badge: '',         title: 'Welcome to\nPATTO.',                  desc: 'Learn English naturally, a little bit every day.' },
      { badge: 'STORIES',  title: 'Start with Stories.',                 desc: 'Read and listen to real English to naturally pick up the language.' },
      { badge: 'PATTERNS', title: 'Repeat Patterns.',                    desc: 'We help you revisit common expressions at just the right moment.' },
      { badge: 'AI ESSAY', title: 'AI Reviews\nYour Writing.',           desc: 'Write an essay and receive handcrafted-style corrections.' },
      { badge: 'PROGRESS', title: 'Track Your Growth.',                  desc: 'See your learning history and celebrate every milestone.' },
      { badge: 'START',    title: 'Ready to Begin?',                     desc: 'Build your personal English routine with PATTO.' },
    ],
  },
  ja: {
    skip: 'スキップ', back: '戻る', next: '次へ', start: 'はじめる',
    langNote: '表示言語はデバイス設定に従います。Settingsからいつでも変更できます。',
    slides: [
      { badge: '',         title: 'PATTOへ\nようこそ。',                  desc: '毎日少しずつ、自然に英語を身につけましょう。' },
      { badge: 'STORIES',  title: 'ストーリーから始めよう。',              desc: '本物の英語を読んで聞いて、自然に学べます。' },
      { badge: 'PATTERNS', title: 'パターンを繰り返そう。',               desc: 'よく使う表現を自然なリズムで繰り返します。' },
      { badge: 'AIエッセイ', title: 'AIが添削します。',                   desc: 'エッセイを書くと、AI編集者が丁寧に添削します。' },
      { badge: '成長',     title: '成長を確認しよう。',                   desc: '学習記録と統計で自分の成長を確認できます。' },
      { badge: 'スタート', title: '始める準備は\nできましたか？',           desc: 'PATTOと一緒に英語学習ルーティンを作りましょう。' },
    ],
  },
}

// ── Mockup: Slide 1 — Brand ───────────────────────────────────────────────────
function BrandMockup({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src="/patto-logo.png" alt="" width={64} height={62} style={{ display: 'block' }} />
        <span style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.04em', color: isDark ? '#fff' : '#1C1C1E', lineHeight: 1 }}>PATTO</span>
      </div>
      <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)', textTransform: 'uppercase', margin: 0, textAlign: 'center' }}>
        Repeat Patterns · Build Fluency
      </p>
    </div>
  )
}

// ── Mockup: Slide 2 — Story Card ─────────────────────────────────────────────
function StoryMockup({ isDark }: { isDark: boolean }) {
  const sep = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
  return (
    <div style={{
      width: '100%', maxWidth: 340,
      borderRadius: 22, overflow: 'hidden',
      background: isDark ? '#1A2235' : '#fff',
      boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}`,
    }}>
      {/* Image area */}
      <div style={{
        height: 148,
        background: 'linear-gradient(140deg, #8BA8D4 0%, #B6C9E8 45%, #C8D4E0 70%, #BFC4B8 100%)',
        position: 'relative',
        display: 'flex', alignItems: 'flex-end',
        padding: '0 18px 16px',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.52) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', margin: '0 0 4px' }}>STORY 03</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>An Ordinary<br/>Morning</p>
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '16px 18px 18px' }}>
        <p style={{ fontSize: 13.5, color: isDark ? 'rgba(255,255,255,0.88)' : '#1C1C1E', margin: '0 0 5px', lineHeight: 1.55 }}>
          It was an ordinary morning,<br />but something changed.
        </p>
        <p style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.38)' : '#AEAEB2', margin: '0 0 14px' }}>
          평범한 아침이었지만, 무언가가 달라졌습니다.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingTop: 12, borderTop: `1px solid ${sep}` }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(107,127,215,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Volume2 style={{ width: 14, height: 14, color: '#6B7FD7' }} strokeWidth={1.8} />
          </div>
          <BookOpen style={{ width: 17, height: 17, color: isDark ? 'rgba(255,255,255,0.25)' : '#C7C7CC' }} strokeWidth={1.6} />
          <Bookmark style={{ width: 17, height: 17, color: isDark ? 'rgba(255,255,255,0.25)' : '#C7C7CC' }} strokeWidth={1.6} />
        </div>
      </div>
    </div>
  )
}

// ── Mockup: Slide 3 — Pattern Card ───────────────────────────────────────────
function PatternMockup({ isDark }: { isDark: boolean }) {
  const sep = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
  const examples = [
    'I used to worry a lot, but now I try to enjoy things.',
    'I used to get up late, but now I wake up early.',
  ]
  return (
    <div style={{
      width: '100%', maxWidth: 340,
      background: isDark ? '#1A2235' : '#fff',
      borderRadius: 22, padding: '20px 20px 18px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}`,
    }}>
      <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', color: '#8E8E93', textTransform: 'uppercase', margin: '0 0 10px' }}>PATTERN 127</p>
      <p style={{ fontSize: 22, fontWeight: 800, color: isDark ? '#fff' : '#1C1C1E', margin: '0 0 6px', letterSpacing: '-0.01em', lineHeight: 1.25, fontFamily: 'var(--font-baloo, sans-serif)' }}>
        I used to ~,<br />but now I ~.
      </p>
      <p style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.42)' : '#AEAEB2', margin: '0 0 16px' }}>나는 ~하곤 했지만, 지금은 ~해.</p>
      {examples.map((ex, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          paddingBottom: i === 0 ? 13 : 0, marginBottom: i === 0 ? 13 : 0,
          borderBottom: i === 0 ? `1px solid ${sep}` : 'none',
        }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(139,111,215,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
            <Volume2 style={{ width: 12, height: 12, color: '#8B6FD7' }} strokeWidth={1.8} />
          </div>
          <p style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.75)' : '#3A3A3C', margin: 0, lineHeight: 1.55 }}>{ex}</p>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
        <Bookmark style={{ width: 16, height: 16, color: isDark ? 'rgba(255,255,255,0.22)' : '#C7C7CC' }} strokeWidth={1.6} />
      </div>
    </div>
  )
}

// ── Mockup: Slide 4 — Essay / Editor's Marks ─────────────────────────────────
function EssayMockup({ isDark }: { isDark: boolean }) {
  const [showFallback, setShowFallback] = useState(false)
  const corr = '#7B1A1A'

  if (!showFallback) {
    return (
      <div style={{ width: '100%', maxWidth: 320, borderRadius: 18, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
        <img
          src="/onboarding-essay.jpg"
          alt="AI essay correction example"
          style={{ width: '100%', display: 'block', objectFit: 'cover', objectPosition: 'top', maxHeight: 340 }}
          onError={() => setShowFallback(true)}
        />
      </div>
    )
  }

  const sep = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
  return (
    <div style={{
      width: '100%', maxWidth: 340,
      background: isDark ? '#1E1810' : '#FAFAF7',
      borderRadius: 22, padding: '18px 20px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.14)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, paddingBottom: 13, borderBottom: `1px solid ${sep}` }}>
        <Sparkles style={{ width: 10, height: 10, color: corr }} strokeWidth={2} />
        <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', color: corr, textTransform: 'uppercase' }}>Editor&apos;s Marks</span>
      </div>
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#8E8E93', textTransform: 'uppercase', margin: '0 0 8px' }}>MY ESSAY</p>
        <p style={{ fontSize: 13.5, color: isDark ? 'rgba(255,255,255,0.82)' : '#1C1C1E', lineHeight: 2.2, margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          I used to be shy,<br />but now I&apos;m trying to<br />be more confident.
        </p>
      </div>
      <div style={{ paddingTop: 13, borderTop: `1px solid ${sep}` }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: corr, textTransform: 'uppercase', margin: '0 0 8px' }}>AI REVIEW</p>
        <p style={{ fontSize: 13, color: corr, lineHeight: 1.7, margin: '0 0 6px', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
          Great start!<br />Try to add more details<br />and use more natural<br />expressions.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${corr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: corr, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>A</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Mockup: Slide 5 — Progress ────────────────────────────────────────────────
function ProgressMockup({ isDark }: { isDark: boolean }) {
  const green = '#4CAF7D'
  const days = ['MON','TUE','WED','THU','FRI','SAT','SUN']
  const done = [true, true, true, true, true, false, false]
  return (
    <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Top stats */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{
          flex: 1, borderRadius: 18, padding: '16px 14px',
          background: isDark ? '#0E2018' : '#EDF8F2',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: green, textTransform: 'uppercase', margin: '0 0 6px' }}>STREAK</p>
          <p style={{ fontSize: 30, fontWeight: 800, color: isDark ? '#fff' : '#1C1C1E', margin: '0 0 2px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>12</p>
          <span style={{ fontSize: 18 }}>🔥</span>
        </div>
        <div style={{
          flex: 1, borderRadius: 18, padding: '16px 14px',
          background: isDark ? '#101828' : '#EEF2FF',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', color: '#6B7FD7', textTransform: 'uppercase', margin: '0 0 2px' }}>STORIES</p>
          <p style={{ fontSize: 10, fontWeight: 500, color: '#8E8E93', margin: '0 0 6px', letterSpacing: '0.04em' }}>COMPLETED</p>
          <p style={{ fontSize: 30, fontWeight: 800, color: isDark ? '#fff' : '#1C1C1E', margin: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>18</p>
        </div>
      </div>
      {/* Weekly goal */}
      <div style={{
        borderRadius: 18, padding: '16px 18px',
        background: isDark ? '#1A2235' : '#fff',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: '#8E8E93', textTransform: 'uppercase', margin: 0 }}>WEEKLY GOAL</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: isDark ? '#fff' : '#1C1C1E', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
            5 <span style={{ fontSize: 13, fontWeight: 400, color: '#8E8E93' }}>/ 7</span>
          </p>
        </div>
        <div style={{ height: 6, background: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)', borderRadius: 3, marginBottom: 14 }}>
          <div style={{ height: '100%', width: '71%', background: green, borderRadius: 3 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {days.map((d, i) => (
            <div key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <p style={{ fontSize: 9.5, color: '#8E8E93', margin: 0, fontWeight: 600 }}>{d.slice(0,1)}</p>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: done[i] ? green : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {done[i] && <span style={{ fontSize: 12, color: '#fff', fontWeight: 700, lineHeight: 1 }}>✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Mockup: Slide 6 — Start (mini home preview) ───────────────────────────────
function StartMockup({ isDark }: { isDark: boolean }) {
  return (
    <div style={{
      width: '100%', maxWidth: 300,
      background: isDark ? '#1A2235' : '#fff',
      borderRadius: 22, overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.16)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}`,
      opacity: 0.92,
    }}>
      {/* Mini top nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <img src="/patto-logo.png" alt="" width={20} height={19} style={{ display: 'block' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#fff' : '#1C1C1E', letterSpacing: '-0.02em' }}>PATTO</span>
        </div>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)' }} />
        </div>
      </div>
      {/* Mini story card */}
      <div style={{
        margin: '12px 14px', borderRadius: 14,
        background: 'linear-gradient(140deg, #8BA8D4 0%, #B6C9E8 50%, #C8D4E0 100%)',
        height: 90, display: 'flex', alignItems: 'flex-end', padding: '0 14px 12px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.5) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', margin: '0 0 2px', textTransform: 'uppercase' }}>STORY 01</p>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>A New Start</p>
        </div>
      </div>
      {/* Mini tab bar */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 0 14px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}`, marginTop: 8 }}>
        {['STORIES','PATTERNS','ESSAYS','PROGRESS'].map((tab, i) => (
          <div key={tab} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: i === 0 ? '#6B7FD7' : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)' }} />
            <p style={{ fontSize: 7, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? '#6B7FD7' : '#8E8E93', margin: 0 }}>{tab}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const MOCKUPS = [BrandMockup, StoryMockup, PatternMockup, EssayMockup, ProgressMockup, StartMockup]

// ── Main component ────────────────────────────────────────────────────────────
const TOTAL = 6

type Props = { onComplete: () => void }

export function OnboardingScreen({ onComplete }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [lang] = useState<Lang>(() => detectLang())
  const [slide, setSlide] = useState(0)
  const [fading, setFading] = useState(false)
  const [visible, setVisible] = useState(true)
  const touchX = useRef<number | null>(null)

  const s = STRINGS[lang]
  const isLast = slide === TOTAL - 1

  function changeSlide(next: number) {
    if (fading || next < 0 || next >= TOTAL) return
    setFading(true)
    setTimeout(() => {
      setSlide(next)
      setFading(false)
    }, 220)
  }

  function goNext() { changeSlide(slide + 1) }
  function goBack() { changeSlide(slide - 1) }

  function finish() {
    setVisible(false)
    setTimeout(onComplete, 260)
  }

  const bgLight = SLIDE_BGS_LIGHT[slide]
  const bgDark  = SLIDE_BGS_DARK[slide]
  const accentColor = SLIDE_COLORS[slide]

  const sl = s.slides[slide]
  const Mockup = MOCKUPS[slide]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: isDark ? bgDark : bgLight,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transition: visible
          ? `background 0.5s ease`
          : 'opacity 260ms ease',
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
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 0', flexShrink: 0 }}>
        {/* Back */}
        <button
          type="button"
          onClick={goBack}
          style={{
            minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
            background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px',
            opacity: slide === 0 ? 0 : 1, pointerEvents: slide === 0 ? 'none' : 'auto',
            transition: 'opacity 0.2s',
          }}
          aria-label={s.back}
        >
          <ChevronLeft style={{ width: 20, height: 20, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} strokeWidth={2} />
        </button>
        {/* Skip */}
        <button
          type="button"
          onClick={finish}
          style={{
            minHeight: 44, display: 'flex', alignItems: 'center',
            background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px',
            fontSize: 13.5, fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.38)',
            fontFamily: 'inherit',
            opacity: isLast ? 0 : 1, pointerEvents: isLast ? 'none' : 'auto',
            transition: 'opacity 0.2s',
          }}
        >
          {s.skip}
        </button>
      </div>

      {/* ── Content: text + mockup (transitions on slide change) ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        opacity: fading ? 0 : 1,
        transform: fading ? 'translateY(10px)' : 'translateY(0)',
        transition: 'opacity 0.22s ease, transform 0.22s ease',
        overflow: 'hidden',
      }}>
        {/* Text block */}
        <div style={{ padding: '20px 28px 16px', flexShrink: 0 }}>
          {sl.badge && (
            <span style={{
              display: 'inline-block',
              fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em',
              color: accentColor,
              background: `${accentColor}1A`,
              borderRadius: 20, padding: '3px 10px',
              textTransform: 'uppercase', marginBottom: 12,
            }}>
              {sl.badge}
            </span>
          )}
          <h2 style={{
            fontSize: 'clamp(26px, 7vw, 32px)', fontWeight: 800,
            color: isDark ? '#fff' : '#1C1C1E',
            margin: '0 0 10px', lineHeight: 1.18,
            letterSpacing: '-0.03em', whiteSpace: 'pre-line',
          }}>
            {sl.title}
          </h2>
          <p style={{
            fontSize: 14.5, color: isDark ? 'rgba(255,255,255,0.52)' : 'rgba(0,0,0,0.45)',
            margin: 0, lineHeight: 1.6, fontWeight: 400,
            wordBreak: 'keep-all', overflowWrap: 'break-word',
          }}>
            {sl.desc}
          </p>
        </div>

        {/* Mockup block */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '8px 24px 12px', overflow: 'hidden',
        }}>
          <Mockup isDark={isDark} />
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ flexShrink: 0, padding: '0 22px', paddingBottom: 'calc(18px + env(safe-area-inset-bottom, 0px))' }}>
        {/* Language note on last slide */}
        {isLast && (
          <p style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.32)', textAlign: 'center', margin: '0 0 12px', lineHeight: 1.6 }}>
            {s.langNote}
          </p>
        )}

        {/* Dots + page */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => changeSlide(i)}
              style={{
                width: i === slide ? 20 : 6, height: 6, borderRadius: 99,
                background: i === slide ? accentColor : (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'),
                transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', padding: 0,
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          {isLast ? (
            <button
              type="button"
              onClick={finish}
              style={{
                flex: 1, minHeight: 54, borderRadius: 18,
                background: accentColor,
                border: 'none', cursor: 'pointer',
                fontSize: 16, fontWeight: 700, color: '#fff',
                fontFamily: 'inherit', letterSpacing: '-0.01em',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 6px 24px ${accentColor}40`,
              }}
            >
              {s.start}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              style={{
                flex: 1, minHeight: 54, borderRadius: 18,
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                border: 'none', cursor: 'pointer',
                fontSize: 15, fontWeight: 700,
                color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)',
                fontFamily: 'inherit', letterSpacing: '-0.01em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.7' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              {s.next}
              <ChevronRight style={{ width: 16, height: 16 }} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
