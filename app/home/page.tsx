'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { getFirstIncompleteItem } from '@/lib/review/home'
import { getTodayReviewItems } from '@/lib/review/storage'

// ── Cover image seeds (picsum.photos · 50장 순환) ─────────────────────────
const COVER_SEEDS = [
  // 일상 · 따뜻함
  'coffee', 'steam', 'candle', 'journal', 'desk',
  // 자연 · 빛
  'forest', 'sunlight', 'mist', 'bloom', 'dawn',
  // 날씨 · 계절
  'rain', 'snow', 'autumn', 'winter', 'fog',
  // 물 · 하늘
  'ocean', 'lake', 'shore', 'beach', 'harbor',
  // 도시 · 공간
  'alley', 'bridge', 'street', 'cobblestone', 'train',
  // 자연 · 풍경
  'mountain', 'alps', 'meadow', 'pine', 'path',
  // 시간 · 빛
  'sunset', 'dusk', 'twilight', 'stars', 'galaxy',
  // 문화 · 감성
  'library', 'cafe', 'bookshelf', 'window', 'reading',
  // 마을 · 고요함
  'village', 'cottage', 'garden', 'farmhouse', 'lighthouse',
  // 기타
  'maple', 'cherry', 'evening', 'sunrise', 'noon',
]
const COVER_IMAGES = COVER_SEEDS.map(s => `https://picsum.photos/seed/${s}/900/600`)

// ── Editorial quotes (50개 · 날짜 순환) ────────────────────────────────────
const DAILY_QUOTES = [
  'Small progress every day.',
  'Read. Repeat. Remember.',
  'Every review matters.',
  'Patterns become habits.',
  'One story at a time.',
  'Stories make language memorable.',
  'Fluency comes from repetition.',
  'Trust your voice.',
  'Speak naturally.',
  'Keep moving forward.',
  'Every word, a small victory.',
  'Language lives in stories.',
  'Make it a habit.',
  'One pattern at a time.',
  'Stories connect us.',
  'Words are bridges.',
  'Begin again, every day.',
  'A little, every day.',
  'The story continues.',
  'Speak with confidence.',
  'Read it. Feel it. Say it.',
  'Slow is smooth. Smooth is fluent.',
  'Every page is a step forward.',
  'Language is alive — keep it moving.',
  'Repetition is the mother of fluency.',
  'One sentence changes everything.',
  'Keep showing up.',
  'Every session leaves a mark.',
  'Stories stay with you.',
  'Read deeply. Speak freely.',
  'The quiet habit builds the loudest skill.',
  'One review at a time.',
  'Speak first. Refine later.',
  'Every morning is a new page.',
  'Curiosity builds fluency.',
  'Words have power. Use them.',
  'Today\'s effort is tomorrow\'s ease.',
  'Immerse yourself.',
  'Language grows with practice.',
  'Find the story. Learn the language.',
  'Progress is invisible until it isn\'t.',
  'Patience builds fluency.',
  'Every pattern is a stepping stone.',
  'Read. Listen. Speak. Repeat.',
  'The habit is the teacher.',
  'Small steps. Big changes.',
  'Stories are how we remember.',
  'Your voice is already there. Practice finds it.',
  'One more story.',
  'Not perfect. Just consistent.',
]

// ── Helpers ─────────────────────────────────────────────────────────────────
function dayOfYear(): number {
  const start = new Date(new Date().getFullYear(), 0, 0)
  return Math.floor((Date.now() - start.getTime()) / 86_400_000)
}

function byDay<T>(arr: T[]): T {
  return arr[dayOfYear() % arr.length]
}

// ISSUE 번호: 연도 첫날부터의 날짜를 3자리로 (매거진 느낌)
function getIssueLabel(): string {
  return `ISSUE ${String(dayOfYear()).padStart(3, '0')}`
}

function getDateLabel(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
}

function getNotice(reviewCount: number, hasItem: boolean): string {
  if (reviewCount >= 2) return `${reviewCount} reviews are ready.`
  if (reviewCount === 1) return 'One review is waiting.'
  if (hasItem) return 'A new story is waiting.'
  return 'Continue where you left off.'
}

function fade(show: boolean): React.CSSProperties {
  return { opacity: show ? 1 : 0, transition: 'opacity 0.75s ease-out' }
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const [notice,     setNotice]     = useState('')
  const [firstHref,  setFirstHref]  = useState('/stories/1')
  const [showImg,    setShowImg]    = useState(false)
  const [showQuote,  setShowQuote]  = useState(false)
  const [showLine,   setShowLine]   = useState(false)
  const [showNote,   setShowNote]   = useState(false)
  const [showBtn,    setShowBtn]    = useState(false)

  const coverUrl   = byDay(COVER_IMAGES)
  const quote      = byDay(DAILY_QUOTES)
  const issueLabel = getIssueLabel()
  const dateLabel  = getDateLabel()

  useEffect(() => {
    const reviews = getTodayReviewItems()
    const first   = getFirstIncompleteItem()
    setNotice(getNotice(reviews.length, !!first))
    if (first) setFirstHref(first.href)

    const timers = [
      setTimeout(() => setShowImg(true),    60),
      setTimeout(() => setShowQuote(true),  400),
      setTimeout(() => setShowLine(true),   640),
      setTimeout(() => setShowNote(true),   740),
      setTimeout(() => setShowBtn(true),    900),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>
      <TopNav />

      {/* ── Cover Image ───────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '58vh',
          marginTop: NAV_HEIGHT,
          overflow: 'hidden',
          ...fade(showImg),
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt="Daily cover"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />

        {/* Bottom vignette — 배경색과 자연스럽게 이어지도록 */}
        <div
          style={{
            position: 'absolute',
            inset: 'auto 0 0 0',
            height: '50%',
            background: 'linear-gradient(to bottom, transparent, var(--pb))',
            pointerEvents: 'none',
          }}
        />

        {/* ── Magazine masthead overlay ── */}
        {/* Left: Issue number */}
        <p
          style={{
            position: 'absolute',
            top: 18,
            left: 22,
            margin: 0,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.32em',
            color: 'rgba(255,255,255,0.65)',
            textShadow: '0 1px 8px rgba(0,0,0,0.55)',
            pointerEvents: 'none',
          }}
        >
          {issueLabel}
        </p>

        {/* Right: Date */}
        <p
          style={{
            position: 'absolute',
            top: 18,
            right: 22,
            margin: 0,
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.55)',
            textShadow: '0 1px 8px rgba(0,0,0,0.55)',
            pointerEvents: 'none',
          }}
        >
          {dateLabel}
        </p>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div style={{ padding: '0 28px 96px', maxWidth: 384, margin: '0 auto' }}>

        {/* Quote — Playfair italic, 매거진 헤드라인처럼 */}
        <div style={{ paddingTop: 28, marginBottom: 32, ...fade(showQuote) }}>
          <p
            className="font-playfair"
            style={{
              fontSize: 'clamp(1.45rem, 5.5vw, 1.75rem)',
              fontWeight: 700,
              fontStyle: 'italic',
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
              color: 'var(--pt)',
              margin: 0,
            }}
          >
            {quote}
          </p>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: 'var(--pd)',
            marginBottom: 22,
            ...fade(showLine),
          }}
        />

        {/* Today's Note — 캡션 라벨 + 오늘의 안내 */}
        <div style={{ marginBottom: 36, ...fade(showNote) }}>
          <p
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.26em',
              color: 'var(--pa)',
              margin: '0 0 7px 0',
            }}
          >
            TODAY'S NOTE
          </p>
          <p
            style={{
              fontSize: 13,
              color: 'var(--pm)',
              letterSpacing: '0.02em',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {notice || ' '}
          </p>
        </div>

        {/* Continue Learning — text link, 가장 중요한 CTA */}
        <div style={fade(showBtn)}>
          <button
            type="button"
            onClick={() => router.push(firstHref)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: 'var(--pa)',
              }}
            >
              Continue Learning
            </span>
            <ArrowRight
              style={{ width: 12, height: 12, color: 'var(--pa)' }}
              strokeWidth={2.5}
            />
          </button>
        </div>

      </div>
    </div>
  )
}
