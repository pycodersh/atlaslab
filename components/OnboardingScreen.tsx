'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Volume2, Bookmark, Waves, Sparkles, Check, Flame, BookOpen, RefreshCw, PenLine, BarChart2 } from 'lucide-react'
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
const TOTAL = 6
const SLIDE_BGS_LIGHT = ['#E8F2FD', '#EEF2FF', '#EEF0FF', '#FDF0EC', '#EDF8F2', '#F0EBF8']
const SLIDE_BGS_DARK  = ['#091525', '#090F20', '#0C0A1E', '#1A0C07', '#071410', '#0E0A18']
const SLIDE_COLORS    = ['#4A8CFF', '#6B7FD7', '#8B6FD7', '#B84040', '#4CAF7D', '#9B70BE']

// ── Copy ──────────────────────────────────────────────────────────────────────
const STRINGS: Record<Lang, {
  skip: string; back: string; next: string; start: string; langNote: string
  slides: Array<{ badge: string; title: string; desc: string }>
}> = {
  ko: {
    skip: '건너뛰기', back: '이전', next: '다음', start: '시작하기',
    langNote: '현재 언어는 기기 설정을 기준으로 표시됩니다.\n언제든 Settings에서 변경할 수 있습니다.',
    slides: [
      { badge: 'Welcome',   title: 'PATTO와 함께\n영어를 매일 조금씩,\n자연스럽게 익혀보세요.',  desc: '' },
      { badge: 'STORIES',   title: '스토리로 시작하세요.',   desc: '실제 영어를 읽고 들으며\n자연스럽게 익혀보세요.' },
      { badge: 'PATTERNS',  title: '패턴을 반복하세요.',     desc: '자주 사용하는 표현을\n반복해서 자연스럽게 익혀보세요.' },
      { badge: 'AI ESSAY',  title: 'AI가 첨삭해드립니다.',   desc: '손글씨처럼 자연스러운 첨삭으로\n영어 실력을 빠르게 개선하세요.' },
      { badge: 'PROGRESS',  title: '성장을 확인하세요.',     desc: '매일의 학습 기록과\n꾸준한 성장을 확인하세요.' },
      { badge: 'START',     title: '이제 시작해볼까요?',     desc: 'PATTO와 함께\n매일 조금씩,\n영어를 자연스럽게 익혀보세요.' },
    ],
  },
  en: {
    skip: 'Skip', back: 'Back', next: 'Next', start: 'Get Started',
    langNote: 'Display language follows your device settings.\nYou can change it anytime in Settings.',
    slides: [
      { badge: 'Welcome',   title: 'Learn English\nnaturally, every day\nwith PATTO.',            desc: '' },
      { badge: 'STORIES',   title: 'Start with Stories.',   desc: 'Read and listen to real English\nto naturally pick up the language.' },
      { badge: 'PATTERNS',  title: 'Repeat Patterns.',      desc: 'Revisit common expressions\nat just the right moment.' },
      { badge: 'AI ESSAY',  title: 'AI Reviews\nYour Writing.',            desc: 'Write an essay and receive\nhandcrafted-style corrections.' },
      { badge: 'PROGRESS',  title: 'Track Your Growth.',    desc: 'See your learning history\nand celebrate every milestone.' },
      { badge: 'START',     title: 'Ready to Begin?',       desc: 'Build your personal\nEnglish routine with PATTO.' },
    ],
  },
  ja: {
    skip: 'スキップ', back: '戻る', next: '次へ', start: 'はじめる',
    langNote: '表示言語はデバイス設定に従います。\nSettingsからいつでも変更できます。',
    slides: [
      { badge: 'Welcome',   title: 'PATTOで\n毎日少しずつ\n自然に英語を。',                       desc: '' },
      { badge: 'STORIES',   title: 'ストーリーから始めよう。', desc: '本物の英語を読んで聞いて\n自然に学べます。' },
      { badge: 'PATTERNS',  title: 'パターンを繰り返そう。',  desc: 'よく使う表現を自然な\nリズムで繰り返します。' },
      { badge: 'AIエッセイ', title: 'AIが添削します。',       desc: 'エッセイを書くと、AI編集者が\n丁寧に添削します。' },
      { badge: '成長',      title: '成長を確認しよう。',      desc: '学習記録と統計で\n自分の成長を確認できます。' },
      { badge: 'スタート',  title: '始める準備は\nできましたか？',                                  desc: 'PATTOと一緒に\n英語学習ルーティンを作りましょう。' },
    ],
  },
}

// ── Shared helpers ────────────────────────────────────────────────────────────
const patternBlue = '#4A8CFF'
const corrRed = '#9B1C1C'

// ── Mockup: Slide 1 — Brand / Hero ───────────────────────────────────────────
const STORY3_IMG = 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=800&q=80'
const BRAND_IMG  = 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80'

function BrandMockup({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ width: '100%', maxWidth: 320 }}>
      <div style={{
        borderRadius: 28, overflow: 'hidden',
        boxShadow: isDark
          ? '0 28px 72px rgba(0,0,0,0.6)'
          : '0 28px 72px rgba(0,0,0,0.14)',
      }}>
        <img
          src={BRAND_IMG}
          alt="A planner and coffee on a desk"
          style={{ width: '100%', height: 310, objectFit: 'cover', display: 'block' }}
        />
      </div>
    </div>
  )
}

// ── Mockup: Slide 2 — Story reader ───────────────────────────────────────────
function StoryMockup({ isDark }: { isDark: boolean }) {
  const cardBg = isDark ? '#0D1623' : '#fff'
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  const textBody = isDark ? 'rgba(255,255,255,0.88)' : '#1C1C1E'
  return (
    <div style={{
      width: '100%', maxWidth: 360,
      borderRadius: 24, overflow: 'hidden',
      background: cardBg,
      boxShadow: isDark ? '0 28px 72px rgba(0,0,0,0.5)' : '0 28px 72px rgba(0,0,0,0.18)',
      border: `1px solid ${border}`,
    }}>
      {/* Cover photo */}
      <div style={{ height: 210, position: 'relative' }}>
        <img
          src={STORY3_IMG}
          alt="A bright kitchen in the morning"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.70) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 20px 16px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', margin: '0 0 5px' }}>STORY 03</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.025em', lineHeight: 1.15 }}>An Ordinary Morning</p>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.52)', margin: '0 0 14px' }}>평범한 아침의 풍경</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {[0,1,2,3].map(i => <div key={i} style={{ width: i === 0 ? 20 : 6, height: 6, borderRadius: 3, background: i === 0 ? '#fff' : 'rgba(255,255,255,0.3)' }} />)}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[Waves, Volume2].map((Icon, i) => (
                <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.9)' }} strokeWidth={1.8} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Language tabs */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 3, padding: '12px 18px 8px', background: cardBg }}>
        {['EN', 'EN·KO', 'KO'].map((tab, i) => (
          <div key={tab} style={{
            padding: '4px 11px', borderRadius: 7,
            fontSize: 11.5, fontWeight: 700,
            background: i === 0 ? patternBlue : 'transparent',
            color: i === 0 ? '#fff' : isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
          }}>{tab}</div>
        ))}
      </div>

      {/* Body text */}
      <div style={{ padding: '4px 20px 22px', background: cardBg }}>
        <p style={{ fontSize: 15.5, color: textBody, lineHeight: 1.75, margin: '0 0 18px' }}>
          It's seven in the morning, and the kitchen is busy. I{' '}
          <span style={{ color: patternBlue, fontWeight: 700 }}>have to</span>
          {' '}leave by eight today. So I move a little faster than usual.
        </p>
        <p style={{ fontSize: 15.5, color: textBody, lineHeight: 1.75, margin: 0 }}>
          I{' '}
          <span style={{ color: patternBlue, fontWeight: 700 }}>don't</span>
          {' '}drink coffee in the morning. I prefer warm tea instead.
        </p>
      </div>
    </div>
  )
}

// ── Mockup: Slide 3 — Pattern card ───────────────────────────────────────────
function PatternMockup({ isDark }: { isDark: boolean }) {
  const cardBg = isDark ? '#0D1623' : '#fff'
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  const textBody = isDark ? 'rgba(255,255,255,0.85)' : '#3A3A3C'
  const sep = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const accent = '#8B6FD7'
  const examples = [
    { en: 'I used to worry a lot, but now I try to enjoy things.', ko: '예전엔 걱정이 많았는데, 지금은 즐기려 해.' },
    { en: 'I used to get up late, but now I wake up at six.', ko: '예전엔 늦게 일어났는데, 지금은 6시에 일어나.' },
  ]
  return (
    <div style={{
      width: '100%', maxWidth: 360,
      background: cardBg,
      borderRadius: 24, padding: '22px 22px 20px',
      boxShadow: '0 28px 72px rgba(0,0,0,0.22)',
      border: `1px solid ${border}`,
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#8E8E93', textTransform: 'uppercase', margin: '0 0 12px' }}>PATTERN 127</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: isDark ? '#fff' : '#1C1C1E', margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.2, fontFamily: 'var(--font-baloo, var(--font-jakarta, sans-serif))' }}>
        I used to ~,<br />but now I ~.
      </p>
      <p style={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.38)' : '#AEAEB2', margin: '0 0 20px' }}>나는 ~하곤 했지만, 지금은 ~해.</p>

      {examples.map((ex, i) => (
        <div key={i} style={{
          paddingBottom: i === 0 ? 16 : 0, marginBottom: i === 0 ? 16 : 0,
          borderBottom: i === 0 ? `1px solid ${sep}` : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <Volume2 style={{ width: 14, height: 14, color: accent }} strokeWidth={1.8} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, color: textBody, margin: '0 0 3px', lineHeight: 1.6 }}>{ex.en}</p>
              <p style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.3)' : '#AEAEB2', margin: 0, lineHeight: 1.4 }}>{ex.ko}</p>
            </div>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingTop: 16, borderTop: `1px solid ${sep}` }}>
        <Bookmark style={{ width: 18, height: 18, color: isDark ? 'rgba(255,255,255,0.22)' : '#C7C7CC' }} strokeWidth={1.6} />
      </div>
    </div>
  )
}

// ── Mockup: Slide 4 — Editor's Marks (handwriting corrections) ────────────────
function EssayMockup({ isDark }: { isDark: boolean }) {
  const bg = isDark ? '#18120C' : '#FDFCF8'
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'
  const textColor = isDark ? 'rgba(255,255,255,0.82)' : '#1C1C1E'
  const corrColor = corrRed
  const strikeStyle: React.CSSProperties = { textDecoration: 'line-through', textDecorationColor: corrColor, textDecorationThickness: '1.5px' }
  const circleStyle: React.CSSProperties = { border: `1.5px solid ${corrColor}`, borderRadius: 4, padding: '0 2px', display: 'inline-block' }
  const insertStyle: React.CSSProperties = { color: corrColor, fontStyle: 'italic', fontFamily: 'Georgia, serif', fontSize: 12 }

  return (
    <div style={{
      width: '100%', maxWidth: 360,
      background: bg,
      borderRadius: 22, padding: '20px 22px 22px',
      boxShadow: '0 28px 72px rgba(0,0,0,0.18)',
      border: `1px solid ${border}`,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${border}` }}>
        <Sparkles style={{ width: 12, height: 12, color: corrColor }} strokeWidth={2} />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', color: corrColor, textTransform: 'uppercase' }}>Editor&apos;s Marks</span>
      </div>

      {/* Essay with corrections */}
      <div style={{
        fontSize: 15.5, color: textColor, lineHeight: 2.4,
        fontFamily: 'Georgia, "Times New Roman", serif',
        wordBreak: 'keep-all', overflowWrap: 'break-word',
      }}>
        {/* Line 1 */}
        <div style={{ position: 'relative', marginBottom: 2 }}>
          <span style={{ ...insertStyle, position: 'absolute', top: -18, left: 102 }}>went</span>
          <span>Last weekend I </span>
          <span style={strikeStyle}>go</span>
          <span> to the beach with </span>
          <span style={circleStyle}>my</span>
        </div>
        {/* Line 2 */}
        <div style={{ position: 'relative', marginBottom: 2 }}>
          <span style={{ ...insertStyle, position: 'absolute', top: -18, right: 0 }}>taking &nbsp; my friends</span>
          <span style={circleStyle}>friends</span>
          <span> because we needed </span>
          <span style={strikeStyle}>take</span>
          <span> a break</span>
        </div>
        {/* Line 3 */}
        <div style={{ position: 'relative', marginBottom: 2 }}>
          <span>from our busy life. The weather </span>
          <span style={strikeStyle}>were</span>
          <span style={{ color: corrColor, fontStyle: 'italic', fontFamily: 'Georgia, serif', fontWeight: 600 }}> was</span>
        </div>
        {/* Line 4 */}
        <div style={{ position: 'relative', marginBottom: 2 }}>
          <span style={{ ...insertStyle, position: 'absolute', top: -18, left: 188 }}>to stay</span>
          <span>so nice that everyone wanted </span>
          <span style={circleStyle}>staying</span>
        </div>
        {/* Line 5 */}
        <div style={{ position: 'relative', marginBottom: 2 }}>
          <span>outside for the whole day. We</span>
        </div>
        {/* Line 6 */}
        <div style={{ position: 'relative', marginBottom: 2 }}>
          <span style={strikeStyle}>bring</span>
          <span style={{ color: corrColor, fontStyle: 'italic', fontFamily: 'Georgia, serif', fontWeight: 700 }}> brought</span>
          <span> many foods, but we forgot</span>
        </div>
        {/* Line 7 */}
        <div style={{ position: 'relative' }}>
          <span style={{ ...insertStyle, position: 'absolute', top: -18, right: 0, fontSize: 11.5 }}>forgot to bring</span>
          <span style={{ borderBottom: `1.5px solid ${corrColor}` }}>bringing</span>
          <span> enough water to drink.</span>
        </div>
      </div>
    </div>
  )
}

// ── Mockup: Slide 5 — Progress ────────────────────────────────────────────────
function ProgressMockup({ isDark }: { isDark: boolean }) {
  const green = '#4CAF7D'
  const cardBg = isDark ? '#0D1623' : '#fff'
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  const days = ['M','T','W','T','F','S','S']
  const done = [true, true, true, true, true, false, false]

  return (
    <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Top stats row */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{
          flex: 1, borderRadius: 20, padding: '18px 16px 16px',
          background: isDark ? '#0A1E12' : '#EDF8F2',
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, margin: '0 0 8px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: green, textTransform: 'uppercase', margin: 0 }}>STREAK</p>
            <Flame style={{ width: 13, height: 13, color: '#FF6B2B' }} strokeWidth={2} />
          </div>
          <p style={{ fontSize: 38, fontWeight: 800, color: isDark ? '#fff' : '#1C1C1E', margin: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>12</p>
        </div>
        <div style={{
          flex: 1, borderRadius: 20, padding: '18px 16px 16px',
          background: isDark ? '#09112A' : '#EEF2FF',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', color: '#6B7FD7', textTransform: 'uppercase', margin: '0 0 2px' }}>STORIES</p>
          <p style={{ fontSize: 10, fontWeight: 500, color: '#8E8E93', margin: '0 0 8px', letterSpacing: '0.04em' }}>COMPLETED</p>
          <p style={{ fontSize: 38, fontWeight: 800, color: isDark ? '#fff' : '#1C1C1E', margin: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>18</p>
        </div>
      </div>

      {/* Weekly goal */}
      <div style={{
        borderRadius: 20, padding: '18px 20px',
        background: cardBg,
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        border: `1px solid ${border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: '#8E8E93', textTransform: 'uppercase', margin: 0 }}>WEEKLY GOAL</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: isDark ? '#fff' : '#1C1C1E', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
            5 <span style={{ fontSize: 14, fontWeight: 400, color: '#8E8E93' }}>/ 7</span>
          </p>
        </div>
        <div style={{ height: 7, background: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)', borderRadius: 99, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '71%', background: green, borderRadius: 99 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {days.map((d, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <p style={{ fontSize: 10, color: '#8E8E93', margin: 0, fontWeight: 600 }}>{d}</p>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: done[i] ? green : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {done[i] && <Check style={{ width: 14, height: 14, color: '#fff' }} strokeWidth={2.5} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Mockup: Slide 6 — Start / Motivation ─────────────────────────────────────
function StartMockup({ isDark }: { isDark: boolean }) {
  const accent = '#9B70BE'
  const cardBg = isDark ? '#130E1C' : '#F8F4FF'
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(155,112,190,0.15)'
  return (
    <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Hero motivation card */}
      <div style={{
        borderRadius: 24, padding: '32px 28px',
        background: isDark
          ? 'linear-gradient(140deg, #130E1C 0%, #1A1028 50%, #221535 100%)'
          : 'linear-gradient(140deg, #F0EAF8 0%, #E8DEFF 50%, #DDD0F5 100%)',
        border: `1px solid ${border}`,
        boxShadow: `0 24px 64px ${accent}22`,
        position: 'relative', overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* Background glow orbs */}
        <div style={{ position: 'absolute', top: -30, left: -30, width: 160, height: 160, borderRadius: '50%', background: `${accent}18`, filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: `${accent}14`, filter: 'blur(30px)' }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <img src="/patto-logo.png" alt="" width={44} height={42} style={{ display: 'block', opacity: isDark ? 1 : 0.85 }} />
            <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', color: isDark ? '#fff' : '#2C1A4A', lineHeight: 1 }}>PATTO</span>
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: isDark ? `${accent}CC` : accent, textTransform: 'uppercase', margin: 0 }}>
            Repeat Patterns · Build Fluency
          </p>

          {/* Mini feature pills */}
          <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {([
              { Icon: BookOpen,  label: 'Stories'  },
              { Icon: RefreshCw, label: 'Patterns' },
              { Icon: PenLine,   label: 'Essays'   },
            ] as const).map(({ Icon, label }) => (
              <span key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 600,
                padding: '6px 14px', borderRadius: 99,
                background: isDark ? 'rgba(155,112,190,0.18)' : 'rgba(155,112,190,0.12)',
                color: isDark ? `${accent}EE` : accent,
                border: `1px solid ${isDark ? `${accent}30` : `${accent}25`}`,
              }}>
                <Icon style={{ width: 12, height: 12 }} strokeWidth={2} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Small stat cards */}
      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { num: '100', label: 'Stories', color: '#6B7FD7' },
          { num: '500', label: 'Patterns', color: '#8B6FD7' },
          { num: '2,500', label: 'Examples', color: '#4CAF7D' },
        ].map(item => (
          <div key={item.label} style={{
            flex: 1, borderRadius: 16, padding: '14px 10px',
            background: isDark ? '#0D1623' : '#fff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: item.color, margin: '0 0 3px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{item.num}</p>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const MOCKUPS = [BrandMockup, StoryMockup, PatternMockup, EssayMockup, ProgressMockup, StartMockup]

// ── Main component ────────────────────────────────────────────────────────────
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
    setTimeout(() => { setSlide(next); setFading(false) }, 220)
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
        transition: visible ? 'background 0.5s ease' : 'opacity 260ms ease',
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

      {/* ── Animated content ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        opacity: fading ? 0 : 1,
        transform: fading ? 'translateY(10px)' : 'translateY(0)',
        transition: 'opacity 0.22s ease, transform 0.22s ease',
        overflow: 'hidden',
      }}>
        {/* Text block — compact */}
        <div style={{ padding: '16px 28px 14px', flexShrink: 0 }}>
          {/* Slide 0: horizontal logo */}
          {slide === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <img src="/patto-logo.png" alt="" width={28} height={27} style={{ display: 'block', opacity: isDark ? 0.95 : 1 }} />
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.04em', color: isDark ? '#fff' : '#1C1C1E', lineHeight: 1 }}>PATTO</span>
            </div>
          )}
          {sl.badge && slide !== 0 && (
            <span style={{
              display: 'inline-block',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
              color: accentColor,
              background: `${accentColor}1A`,
              borderRadius: 20, padding: '3px 11px',
              textTransform: 'uppercase', marginBottom: 10,
            }}>
              {sl.badge}
            </span>
          )}
          <h2 style={{
            fontSize: 'clamp(22px, 6.5vw, 30px)', fontWeight: 800,
            color: isDark ? '#fff' : '#1C1C1E',
            margin: '0 0 8px', lineHeight: 1.22,
            letterSpacing: '-0.03em', whiteSpace: 'pre-line',
            wordBreak: 'keep-all',
          }}>
            {sl.title}
          </h2>
          {sl.desc && (
            <p style={{
              fontSize: 14, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.44)',
              margin: 0, lineHeight: 1.65, fontWeight: 400,
              wordBreak: 'keep-all', overflowWrap: 'break-word',
              whiteSpace: 'pre-line',
            }}>
              {sl.desc}
            </p>
          )}
        </div>

        {/* Mockup block — takes up 60%+ of remaining space */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '4px 22px 10px', overflow: 'hidden',
        }}>
          <Mockup isDark={isDark} />
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ flexShrink: 0, padding: '0 22px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}>
        {/* Language note on last slide */}
        {isLast && (
          <p style={{
            fontSize: 11.5, color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
            textAlign: 'center', margin: '0 0 14px', lineHeight: 1.65,
            whiteSpace: 'pre-line', wordBreak: 'keep-all',
          }}>
            {s.langNote}
          </p>
        )}

        {/* Dots */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
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

        {/* Nav button */}
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
                boxShadow: `0 8px 28px ${accentColor}44`,
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
              }}
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
