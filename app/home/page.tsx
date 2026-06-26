'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { getFirstIncompleteItem } from '@/lib/review/home'
import { getTodayReviewItems } from '@/lib/review/storage'

// ── Cover image seeds (50장 순환) ─────────────────────────────────────────
const COVER_SEEDS = [
  'coffee', 'steam', 'candle', 'journal', 'desk',
  'forest', 'sunlight', 'mist', 'bloom', 'dawn',
  'rain', 'snow', 'autumn', 'winter', 'fog',
  'ocean', 'lake', 'shore', 'beach', 'harbor',
  'alley', 'bridge', 'street', 'cobblestone', 'train',
  'mountain', 'alps', 'meadow', 'pine', 'path',
  'sunset', 'dusk', 'twilight', 'stars', 'galaxy',
  'library', 'cafe', 'bookshelf', 'window', 'reading',
  'village', 'cottage', 'garden', 'farmhouse', 'lighthouse',
  'maple', 'cherry', 'evening', 'sunrise', 'noon',
]
const COVER_IMAGES = COVER_SEEDS.map(s => `https://picsum.photos/seed/${s}/900/600`)

// ── Editorial quotes (100개) ─────────────────────────────────────────────
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
  "Today's effort is tomorrow's ease.",
  'Immerse yourself.',
  'Language grows with practice.',
  'Find the story. Learn the language.',
  "Progress is invisible until it isn't.",
  'Patience builds fluency.',
  'Every pattern is a stepping stone.',
  'Read. Listen. Speak. Repeat.',
  'The habit is the teacher.',
  'Small steps. Big changes.',
  'Stories are how we remember.',
  'Your voice is already there. Practice finds it.',
  'One more story.',
  'Not perfect. Just consistent.',
  'Language is a door. Reading is the key.',
  'The best time to practice is now.',
  'Every story leaves something behind.',
  'Fluency is built one day at a time.',
  'Speak the language. Live the story.',
  'Review today. Remember tomorrow.',
  'Sentences become instinct.',
  'Effort compounds quietly.',
  'Stay curious. Stay fluent.',
  'You understand more than you think.',
  'Every listen counts.',
  'The page is always open.',
  'Words become yours with time.',
  'Show up. The rest follows.',
  'One pattern. Infinite sentences.',
  'Less hesitation. More speaking.',
  'Consistency is the only shortcut.',
  'Return to the story. Find something new.',
  'The habit of reading builds the habit of speaking.',
  'Language is patience rewarded.',
  "Today's review is tomorrow's reflex.",
  'Every sentence you read stays with you.',
  'Depth before breadth.',
  'Understand it. Then own it.',
  'Keep the rhythm going.',
  'Natural speech starts with natural reading.',
  'A good sentence is worth rereading.',
  'The story is the lesson.',
  'Practice in quiet. Speak with ease.',
  'Build the habit. The skill will follow.',
  'Every day, a new sentence remembered.',
  'Learn the language. Tell your story.',
  'Reading is the root of speaking.',
  'The smallest habit changes everything.',
  'Progress sounds like silence at first.',
  'Speak a little more today than yesterday.',
  'Language is a craft. Polish it daily.',
  'One good review is worth ten new words.',
  'Keep going. Even on quiet days.',
  "Stories teach what textbooks can't.",
  'Your accent is part of your voice.',
  'A sentence a day moves mountains.',
  'Language rewards the patient.',
  'The habit protects the skill.',
  'Every story read is a conversation prepared.',
  "Fluency is not a destination. It's a direction.",
  "Make today's session count.",
  'One page. One pattern. One step.',
  'The cover changes. The practice continues.',
]

// ── Helpers ──────────────────────────────────────────────────────────────
function dayOfYear(): number {
  const start = new Date(new Date().getFullYear(), 0, 0)
  return Math.floor((Date.now() - start.getTime()) / 86_400_000)
}

function byDay<T>(arr: T[]): T {
  return arr[dayOfYear() % arr.length]
}

// "JUNE 26, 2026" — 매거진 발행일 형식
function getIssueDateLabel(): string {
  return new Date()
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    .toUpperCase()
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

// 탭의 좌측 가장자리(px-3 = 12px)와 맞추기 위한 콘텐츠 좌측 패딩
const LEFT_GUTTER  = 14   // nav PATTO tab paddingLeft 기준
const RIGHT_GUTTER = 20

// ── Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const [notice,       setNotice]       = useState('')
  const [firstHref,    setFirstHref]    = useState('/stories/1')
  const [showImg,      setShowImg]      = useState(false)
  const [showQuote,    setShowQuote]    = useState(false)
  const [showLine,     setShowLine]     = useState(false)
  const [showNote,     setShowNote]     = useState(false)
  const [showBtn,      setShowBtn]      = useState(false)

  const coverUrl       = byDay(COVER_IMAGES)
  const quote          = byDay(DAILY_QUOTES)
  const issueDateLabel = getIssueDateLabel()

  useEffect(() => {
    const reviews = getTodayReviewItems()
    const first   = getFirstIncompleteItem()
    setNotice(getNotice(reviews.length, !!first))
    if (first) setFirstHref(first.href)

    const timers = [
      setTimeout(() => setShowImg(true),   60),
      setTimeout(() => setShowQuote(true), 400),
      setTimeout(() => setShowLine(true),  620),
      setTimeout(() => setShowNote(true),  720),
      setTimeout(() => setShowBtn(true),   880),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>
      <TopNav />

      {/* ── Cover Image — full-bleed ────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '45vh',
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

        {/* 하단 그라디언트 — 콘텐츠 영역으로 자연스럽게 이어짐 */}
        <div
          style={{
            position: 'absolute',
            inset: 'auto 0 0 0',
            height: '50%',
            background: 'linear-gradient(to bottom, transparent, var(--pb))',
            pointerEvents: 'none',
          }}
        />

        {/* 우측 미세 어둠 — 로고 가독성 보조 */}
        <div
          style={{
            position: 'absolute',
            inset: '0 0 0 40%',
            background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.20))',
            pointerEvents: 'none',
          }}
        />

        {/* ── Magazine Logo — 이미지 우측 중앙 ── */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: RIGHT_GUTTER,
            transform: 'translateY(-55%)',
            textAlign: 'right',
            pointerEvents: 'none',
          }}
        >
          {/* PATTO 타이틀 — Playfair, 대형, 매거진 로고 */}
          <p
            className="font-playfair"
            style={{
              margin: 0,
              fontSize: 'clamp(4rem, 18vw, 6.5rem)',
              fontWeight: 900,
              letterSpacing: '-0.025em',
              lineHeight: 0.88,
              color: 'rgba(255,255,255,0.93)',
              textShadow: [
                '0 2px 28px rgba(0,0,0,0.72)',
                '0 1px 6px rgba(0,0,0,0.45)',
              ].join(', '),
            }}
          >
            PATTO
          </p>

          {/* 발행일 — PATTO 바로 아래 */}
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 8.5,
              fontWeight: 500,
              letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.60)',
              textShadow: '0 1px 8px rgba(0,0,0,0.55)',
            }}
          >
            {issueDateLabel}
          </p>
        </div>
      </div>

      {/* ── Content — PATTO 탭 좌측 기준선(14px)으로 정렬 ──────────── */}
      <div
        style={{
          paddingLeft:  LEFT_GUTTER,
          paddingRight: RIGHT_GUTTER,
          paddingBottom: 96,
          maxWidth: 440,
        }}
      >

        {/* Quote */}
        <div style={{ paddingTop: 18, marginBottom: 28, ...fade(showQuote) }}>
          <p
            className="font-playfair"
            style={{
              fontSize: 'clamp(1.4rem, 5.5vw, 1.72rem)',
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
            marginBottom: 20,
            ...fade(showLine),
          }}
        />

        {/* TODAY'S NOTE */}
        <div style={{ marginBottom: 34, ...fade(showNote) }}>
          <p
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.26em',
              color: 'var(--pa)',
              margin: '0 0 6px 0',
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
            {notice || ' '}
          </p>
        </div>

        {/* Continue Learning */}
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
