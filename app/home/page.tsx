'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { getDueCount, getAllRecords } from '@/lib/srs/storage'
import { magazineStories } from '@/data/magazine-stories'

// ── Themed cover pairs (이미지 + 쿼트 느낌 매칭) ─────────────────────────────
type CoverTheme = {
  seeds:  string[]   // picsum.photos seed words
  quotes: string[]
}

const COVER_THEMES: CoverTheme[] = [
  // ① Rainy / Quiet — 비, 창가, 사색
  {
    seeds: ['rain', 'mist', 'fog', 'overcast', 'drizzle', 'window'],
    quotes: [
      'Read. Repeat. Remember.',
      'The quiet habit builds the loudest skill.',
      'Slow is smooth. Smooth is fluent.',
      'Every story leaves something behind.',
      'Language lives in stories.',
      'Practice in quiet. Speak with ease.',
      'A good sentence is worth rereading.',
      'The page is always open.',
    ],
  },
  // ② Coffee / Morning focus — 커피, 아침, 집중
  {
    seeds: ['coffee', 'espresso', 'latte', 'breakfast', 'journal', 'desk'],
    quotes: [
      'Every morning is a new page.',
      'Begin again, every day.',
      "Today's effort is tomorrow's ease.",
      'Make it a habit.',
      'A little, every day.',
      "Make today's session count.",
      'Show up. The rest follows.',
      'Keep the rhythm going.',
    ],
  },
  // ③ Forest / Nature — 숲, 자연, 고요
  {
    seeds: ['forest', 'pine', 'meadow', 'fern', 'woodland', 'bloom'],
    quotes: [
      'Patience builds fluency.',
      'Language rewards the patient.',
      'Small steps. Big changes.',
      'The habit is the teacher.',
      'One pattern at a time.',
      'Depth before breadth.',
      'Reading is the root of speaking.',
      'The smallest habit changes everything.',
    ],
  },
  // ④ Evening / Cozy — 저녁, 램프, 따뜻함
  {
    seeds: ['candle', 'lamp', 'evening', 'warmglow', 'dusk', 'fireplace'],
    quotes: [
      'Stories stay with you.',
      'Stories connect us.',
      'Find the story. Learn the language.',
      'Every story read is a conversation prepared.',
      "Stories teach what textbooks can't.",
      'Language is a door. Reading is the key.',
      'Return to the story. Find something new.',
      'Read deeply. Speak freely.',
    ],
  },
  // ⑤ City / Travel — 도시, 거리, 여행
  {
    seeds: ['street', 'cobblestone', 'alley', 'city', 'bridge', 'urban'],
    quotes: [
      'Keep moving forward.',
      'One sentence changes everything.',
      'Words are bridges.',
      'Speak first. Refine later.',
      'Less hesitation. More speaking.',
      'Your voice is already there. Practice finds it.',
      'Speak a little more today than yesterday.',
      'The story continues.',
    ],
  },
  // ⑥ Ocean / Peace — 바다, 해변, 평온
  {
    seeds: ['ocean', 'shore', 'horizon', 'harbor', 'beach', 'waves'],
    quotes: [
      "Fluency is not a destination. It's a direction.",
      'Stay curious. Stay fluent.',
      'Every listen counts.',
      'Words become yours with time.',
      'You understand more than you think.',
      'Language is alive — keep it moving.',
      'Effort compounds quietly.',
      'Progress sounds like silence at first.',
    ],
  },
  // ⑦ Morning Light — 일출, 여명, 상쾌함
  {
    seeds: ['sunrise', 'dawn', 'morning', 'sunlight', 'daybreak', 'fresh'],
    quotes: [
      'Small progress every day.',
      'Every review matters.',
      'One more story.',
      'Not perfect. Just consistent.',
      'Consistency is the only shortcut.',
      'Keep going. Even on quiet days.',
      'Every word, a small victory.',
      'Build the habit. The skill will follow.',
    ],
  },
  // ⑧ Library / Reading — 책, 도서관, 독서
  {
    seeds: ['library', 'bookshelf', 'reading', 'book', 'pages', 'study'],
    quotes: [
      'Patterns become habits.',
      'One story at a time.',
      'Every session leaves a mark.',
      'Sentences become instinct.',
      'Read it. Feel it. Say it.',
      'Natural speech starts with natural reading.',
      'Fluency comes from repetition.',
      'Language is a craft. Polish it daily.',
    ],
  },
]

function pickCover(): { imageUrl: string; quote: string } {
  const theme  = COVER_THEMES[Math.floor(Math.random() * COVER_THEMES.length)]
  const seed   = theme.seeds[Math.floor(Math.random() * theme.seeds.length)]
  const quote  = theme.quotes[Math.floor(Math.random() * theme.quotes.length)]
  return {
    imageUrl: `https://picsum.photos/seed/${seed}/900/600`,
    quote,
  }
}

// 매거진 발행일 형식: "JUNE 26, 2026"
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

const LEFT_GUTTER  = 14
const RIGHT_GUTTER = 20

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()

  // 세션마다 1회 랜덤 선택 (마운트 시 결정, 새로고침 시 재선택)
  const [{ imageUrl, quote }] = useState(() => pickCover())
  const issueDateLabel = getIssueDateLabel()

  const [notice,    setNotice]    = useState('')
  const [firstHref, setFirstHref] = useState('/stories/1')
  const [showImg,   setShowImg]   = useState(false)
  const [showQuote, setShowQuote] = useState(false)
  const [showLine,  setShowLine]  = useState(false)
  const [showNote,  setShowNote]  = useState(false)
  const [showBtn,   setShowBtn]   = useState(false)

  useEffect(() => {
    // 오늘 복습할 항목이 있으면 ReviewSession으로, 없으면 새 스토리로
    const due = getDueCount()
    const learnedStoryIds = new Set(
      getAllRecords().filter((r) => r.itemType === 'story').map((r) => r.itemId),
    )
    const nextStory = magazineStories.find((s) => !learnedStoryIds.has(String(s.id))) ?? magazineStories[0]
    setNotice(getNotice(due, true))
    setFirstHref(due > 0 ? '/review' : `/stories/${nextStory.id}`)

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

      {/* ── Cover Image — full-bleed ──────────────────────────────────── */}
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
          src={imageUrl}
          alt="Daily cover"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
          onError={(e) => {
            // fallback: coffee seed as safe default
            const img = e.currentTarget
            if (!img.src.includes('coffee')) {
              img.src = 'https://picsum.photos/seed/coffee/900/600'
            }
          }}
        />

        {/* 하단 그라디언트 */}
        <div
          style={{
            position: 'absolute',
            inset: 'auto 0 0 0',
            height: '50%',
            background: 'linear-gradient(to bottom, transparent, var(--pb))',
            pointerEvents: 'none',
          }}
        />

        {/* 우측 미세 어둠 — 로고 가독성 */}
        <div
          style={{
            position: 'absolute',
            inset: '0 0 0 40%',
            background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.20))',
            pointerEvents: 'none',
          }}
        />

        {/* Magazine Logo — 우측 중앙 */}
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

      {/* ── Content — 탭 좌측 기준선(14px) 정렬 ─────────────────────── */}
      <div
        style={{
          paddingLeft:   LEFT_GUTTER,
          paddingRight:  RIGHT_GUTTER,
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
