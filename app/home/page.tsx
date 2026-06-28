'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { getDueCount, getAllRecords } from '@/lib/srs/storage'
import { magazineStories } from '@/data/magazine-stories'

// ── Themed cover pairs (이미지 + 쿼트 느낌 매칭) ─────────────────────────────
type Quote = { en: string; ko: string }
type CoverTheme = {
  seeds:  string[]   // picsum.photos seed words
  quotes: Quote[]
}

const COVER_THEMES: CoverTheme[] = [
  // ① Rainy / Quiet — 비, 창가, 사색
  {
    seeds: ['rain', 'mist', 'fog', 'overcast', 'drizzle', 'window'],
    quotes: [
      { en: 'Read. Repeat. Remember.', ko: '읽고. 반복하고. 기억하라.' },
      { en: 'The quiet habit builds the loudest skill.', ko: '조용한 습관이 가장 큰 실력을 만든다.' },
      { en: 'Slow is smooth. Smooth is fluent.', ko: '천천히가 매끄러움, 매끄러움이 유창함.' },
      { en: 'Every story leaves something behind.', ko: '모든 이야기는 무언가를 남긴다.' },
      { en: 'Language lives in stories.', ko: '언어는 이야기 속에 산다.' },
      { en: 'Practice in quiet. Speak with ease.', ko: '조용히 연습하면, 편하게 말하게 된다.' },
      { en: 'A good sentence is worth rereading.', ko: '좋은 문장은 다시 읽을 가치가 있다.' },
      { en: 'The page is always open.', ko: '페이지는 언제나 열려 있다.' },
    ],
  },
  // ② Coffee / Morning focus — 커피, 아침, 집중
  {
    seeds: ['coffee', 'espresso', 'latte', 'breakfast', 'journal', 'desk'],
    quotes: [
      { en: 'Every morning is a new page.', ko: '매일 아침은 새로운 페이지다.' },
      { en: 'Begin again, every day.', ko: '매일, 다시 시작하라.' },
      { en: "Today's effort is tomorrow's ease.", ko: '오늘의 노력이 내일의 여유다.' },
      { en: 'Make it a habit.', ko: '습관으로 만들어라.' },
      { en: 'A little, every day.', ko: '매일, 조금씩.' },
      { en: "Make today's session count.", ko: '오늘의 학습을 의미 있게.' },
      { en: 'Show up. The rest follows.', ko: '일단 시작하라. 나머지는 따라온다.' },
      { en: 'Keep the rhythm going.', ko: '리듬을 이어가라.' },
    ],
  },
  // ③ Forest / Nature — 숲, 자연, 고요
  {
    seeds: ['forest', 'pine', 'meadow', 'fern', 'woodland', 'bloom'],
    quotes: [
      { en: 'Patience builds fluency.', ko: '인내가 유창함을 만든다.' },
      { en: 'Language rewards the patient.', ko: '언어는 인내하는 자에게 보답한다.' },
      { en: 'Small steps. Big changes.', ko: '작은 걸음이 큰 변화를.' },
      { en: 'The habit is the teacher.', ko: '습관이 곧 스승이다.' },
      { en: 'One pattern at a time.', ko: '한 번에 패턴 하나씩.' },
      { en: 'Depth before breadth.', ko: '넓이보다 깊이를 먼저.' },
      { en: 'Reading is the root of speaking.', ko: '읽기가 말하기의 뿌리다.' },
      { en: 'The smallest habit changes everything.', ko: '가장 작은 습관이 모든 걸 바꾼다.' },
    ],
  },
  // ④ Evening / Cozy — 저녁, 램프, 따뜻함
  {
    seeds: ['candle', 'lamp', 'evening', 'warmglow', 'dusk', 'fireplace'],
    quotes: [
      { en: 'Stories stay with you.', ko: '이야기는 마음에 남는다.' },
      { en: 'Stories connect us.', ko: '이야기는 우리를 잇는다.' },
      { en: 'Find the story. Learn the language.', ko: '이야기를 찾으면, 언어를 배운다.' },
      { en: 'Every story read is a conversation prepared.', ko: '읽은 이야기 하나가 대화 하나를 준비시킨다.' },
      { en: "Stories teach what textbooks can't.", ko: '이야기는 교과서가 못 가르치는 걸 가르친다.' },
      { en: 'Language is a door. Reading is the key.', ko: '언어는 문이고, 읽기는 열쇠다.' },
      { en: 'Return to the story. Find something new.', ko: '이야기로 돌아가면, 새로운 걸 발견한다.' },
      { en: 'Read deeply. Speak freely.', ko: '깊이 읽고, 자유롭게 말하라.' },
    ],
  },
  // ⑤ City / Travel — 도시, 거리, 여행
  {
    seeds: ['street', 'cobblestone', 'alley', 'city', 'bridge', 'urban'],
    quotes: [
      { en: 'Keep moving forward.', ko: '계속 앞으로 나아가라.' },
      { en: 'One sentence changes everything.', ko: '문장 하나가 모든 걸 바꾼다.' },
      { en: 'Words are bridges.', ko: '말은 다리다.' },
      { en: 'Speak first. Refine later.', ko: '먼저 말하고, 나중에 다듬어라.' },
      { en: 'Less hesitation. More speaking.', ko: '망설임은 줄이고, 말은 더 많이.' },
      { en: 'Your voice is already there. Practice finds it.', ko: '네 목소리는 이미 있다. 연습이 그걸 찾아준다.' },
      { en: 'Speak a little more today than yesterday.', ko: '어제보다 오늘 조금만 더 말하라.' },
      { en: 'The story continues.', ko: '이야기는 계속된다.' },
    ],
  },
  // ⑥ Ocean / Peace — 바다, 해변, 평온
  {
    seeds: ['ocean', 'shore', 'horizon', 'harbor', 'beach', 'waves'],
    quotes: [
      { en: "Fluency is not a destination. It's a direction.", ko: '유창함은 목적지가 아니라 방향이다.' },
      { en: 'Stay curious. Stay fluent.', ko: '호기심을 잃지 말고, 유창함을 잃지 마라.' },
      { en: 'Every listen counts.', ko: '한 번의 듣기도 쌓인다.' },
      { en: 'Words become yours with time.', ko: '시간이 지나면 단어는 네 것이 된다.' },
      { en: 'You understand more than you think.', ko: '너는 생각보다 더 많이 이해하고 있다.' },
      { en: 'Language is alive — keep it moving.', ko: '언어는 살아 있다 — 계속 움직이게 하라.' },
      { en: 'Effort compounds quietly.', ko: '노력은 조용히 쌓인다.' },
      { en: 'Progress sounds like silence at first.', ko: '성장은 처음엔 침묵처럼 들린다.' },
    ],
  },
  // ⑦ Morning Light — 일출, 여명, 상쾌함
  {
    seeds: ['sunrise', 'dawn', 'morning', 'sunlight', 'daybreak', 'fresh'],
    quotes: [
      { en: 'Small progress every day.', ko: '매일 작은 진전을.' },
      { en: 'Every review matters.', ko: '모든 복습이 중요하다.' },
      { en: 'One more story.', ko: '이야기 하나 더.' },
      { en: 'Not perfect. Just consistent.', ko: '완벽하지 않아도, 꾸준하게.' },
      { en: 'Consistency is the only shortcut.', ko: '꾸준함이 유일한 지름길이다.' },
      { en: 'Keep going. Even on quiet days.', ko: '조용한 날에도, 계속하라.' },
      { en: 'Every word, a small victory.', ko: '단어 하나하나가 작은 승리다.' },
      { en: 'Build the habit. The skill will follow.', ko: '습관을 쌓아라. 실력은 따라온다.' },
    ],
  },
  // ⑧ Library / Reading — 책, 도서관, 독서
  {
    seeds: ['library', 'bookshelf', 'reading', 'book', 'pages', 'study'],
    quotes: [
      { en: 'Patterns become habits.', ko: '패턴이 습관이 된다.' },
      { en: 'One story at a time.', ko: '한 번에 이야기 하나씩.' },
      { en: 'Every session leaves a mark.', ko: '매 학습이 흔적을 남긴다.' },
      { en: 'Sentences become instinct.', ko: '문장이 본능이 된다.' },
      { en: 'Read it. Feel it. Say it.', ko: '읽고. 느끼고. 말하라.' },
      { en: 'Natural speech starts with natural reading.', ko: '자연스러운 말하기는 자연스러운 읽기에서 시작된다.' },
      { en: 'Fluency comes from repetition.', ko: '유창함은 반복에서 온다.' },
      { en: 'Language is a craft. Polish it daily.', ko: '언어는 기술이다. 매일 갈고닦아라.' },
    ],
  },
]

function pickCover(): { imageUrl: string; quote: Quote } {
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
            {quote.en}
          </p>
          <p
            style={{
              fontSize: 13,
              color: 'var(--pm)',
              lineHeight: 1.5,
              letterSpacing: '0.01em',
              margin: '10px 0 0',
            }}
          >
            {quote.ko}
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
