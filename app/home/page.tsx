'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import {
  getDueCount,
  getAllRecords,
  getStudiedTodayStoryCount,
  getPracticedTodayCount,
  getReviewedTodayCount,
} from '@/lib/srs/storage'
import { magazineStories } from '@/data/magazine-stories'

type Quote = { en: string; ko: string }
type CoverTheme = { seeds: string[]; quotes: Quote[] }

const COVER_THEMES: CoverTheme[] = [
  {
    seeds: ['rain', 'mist', 'fog', 'overcast', 'drizzle', 'window'],
    quotes: [
      { en: 'Read. Repeat. Remember.', ko: '읽고. 반복하고. 기억하라.' },
      { en: 'The quiet habit builds the loudest skill.', ko: '조용한 습관이\n가장 큰 실력을 만든다.' },
      { en: 'Slow is smooth.\nSmooth is fluent.', ko: '천천히가 매끄러움,\n매끄러움이 유창함.' },
      { en: 'Every story leaves\nsomething behind.', ko: '모든 이야기는\n무언가를 남긴다.' },
      { en: 'Language lives\nin stories.', ko: '언어는\n이야기 속에 산다.' },
      { en: 'Practice in quiet.\nSpeak with ease.', ko: '조용히 연습하면,\n편하게 말하게 된다.' },
      { en: 'A good sentence is\nworth rereading.', ko: '좋은 문장은\n다시 읽을 가치가 있다.' },
      { en: 'The page is\nalways open.', ko: '페이지는\n언제나 열려 있다.' },
    ],
  },
  {
    seeds: ['coffee', 'espresso', 'latte', 'breakfast', 'journal', 'desk'],
    quotes: [
      { en: 'Every morning is\na new page.', ko: '매일 아침은\n새로운 페이지다.' },
      { en: 'Begin again,\nevery day.', ko: '매일,\n다시 시작하라.' },
      { en: "Today's effort is\ntomorrow's ease.", ko: '오늘의 노력이\n내일의 여유다.' },
      { en: 'Make it a habit.', ko: '습관으로 만들어라.' },
      { en: 'A little, every day.', ko: '매일, 조금씩.' },
      { en: "Make today's\nsession count.", ko: '오늘의 학습을\n의미 있게.' },
      { en: 'Show up.\nThe rest follows.', ko: '일단 시작하라.\n나머지는 따라온다.' },
      { en: 'Keep the\nrhythm going.', ko: '리듬을 이어가라.' },
    ],
  },
  {
    seeds: ['forest', 'pine', 'meadow', 'fern', 'woodland', 'bloom'],
    quotes: [
      { en: 'Patience builds\nfluency.', ko: '인내가\n유창함을 만든다.' },
      { en: 'Language rewards\nthe patient.', ko: '언어는\n인내하는 자에게 보답한다.' },
      { en: 'Small steps.\nBig changes.', ko: '작은 걸음이\n큰 변화를.' },
      { en: 'The habit is\nthe teacher.', ko: '습관이 곧 스승이다.' },
      { en: 'One pattern\nat a time.', ko: '한 번에\n패턴 하나씩.' },
      { en: 'Depth before breadth.', ko: '넓이보다 깊이를 먼저.' },
      { en: 'Reading is the root\nof speaking.', ko: '읽기가\n말하기의 뿌리다.' },
      { en: 'The smallest habit\nchanges everything.', ko: '가장 작은 습관이\n모든 걸 바꾼다.' },
    ],
  },
  {
    seeds: ['candle', 'lamp', 'evening', 'warmglow', 'dusk', 'fireplace'],
    quotes: [
      { en: 'Stories stay\nwith you.', ko: '이야기는\n마음에 남는다.' },
      { en: 'Stories connect us.', ko: '이야기는 우리를 잇는다.' },
      { en: 'Find the story.\nLearn the language.', ko: '이야기를 찾으면,\n언어를 배운다.' },
      { en: 'Every story read is\na conversation prepared.', ko: '읽은 이야기 하나가\n대화 하나를 준비시킨다.' },
      { en: "Stories teach what\ntextbooks can't.", ko: '이야기는 교과서가\n못 가르치는 걸 가르친다.' },
      { en: 'Language is a door.\nReading is the key.', ko: '언어는 문이고,\n읽기는 열쇠다.' },
      { en: 'Return to the story.\nFind something new.', ko: '이야기로 돌아가면,\n새로운 걸 발견한다.' },
      { en: 'Read deeply.\nSpeak freely.', ko: '깊이 읽고,\n자유롭게 말하라.' },
    ],
  },
  {
    seeds: ['street', 'cobblestone', 'alley', 'city', 'bridge', 'urban'],
    quotes: [
      { en: 'Keep moving forward.', ko: '계속 앞으로 나아가라.' },
      { en: 'One sentence\nchanges everything.', ko: '문장 하나가\n모든 걸 바꾼다.' },
      { en: 'Words are bridges.', ko: '말은 다리다.' },
      { en: 'Speak first.\nRefine later.', ko: '먼저 말하고,\n나중에 다듬어라.' },
      { en: 'Less hesitation.\nMore speaking.', ko: '망설임은 줄이고,\n말은 더 많이.' },
      { en: 'Your voice is already\nthere. Practice finds it.', ko: '네 목소리는 이미 있다.\n연습이 그걸 찾아준다.' },
      { en: 'Speak a little more\ntoday than yesterday.', ko: '어제보다 오늘\n조금만 더 말하라.' },
      { en: 'The story continues.', ko: '이야기는 계속된다.' },
    ],
  },
  {
    seeds: ['ocean', 'shore', 'horizon', 'harbor', 'beach', 'waves'],
    quotes: [
      { en: "Fluency is not\na destination.\nIt's a direction.", ko: '유창함은\n목적지가 아니라 방향이다.' },
      { en: 'Stay curious.\nStay fluent.', ko: '호기심을 잃지 말고,\n유창함을 잃지 마라.' },
      { en: 'Every listen counts.', ko: '한 번의 듣기도 쌓인다.' },
      { en: 'Words become yours\nwith time.', ko: '시간이 지나면\n단어는 네 것이 된다.' },
      { en: 'You understand more\nthan you think.', ko: '너는 생각보다\n더 많이 이해하고 있다.' },
      { en: 'Language is alive —\nkeep it moving.', ko: '언어는 살아 있다 —\n계속 움직이게 하라.' },
      { en: 'Effort compounds\nquietly.', ko: '노력은 조용히 쌓인다.' },
      { en: 'Progress sounds like\nsilence at first.', ko: '성장은 처음엔\n침묵처럼 들린다.' },
    ],
  },
  {
    seeds: ['sunrise', 'dawn', 'morning', 'sunlight', 'daybreak', 'fresh'],
    quotes: [
      { en: 'Small progress\nevery day.', ko: '매일 작은 진전을.' },
      { en: 'Every review matters.', ko: '모든 복습이 중요하다.' },
      { en: 'One more story.', ko: '이야기 하나 더.' },
      { en: 'Not perfect.\nJust consistent.', ko: '완벽하지 않아도,\n꾸준하게.' },
      { en: 'Consistency is\nthe only shortcut.', ko: '꾸준함이\n유일한 지름길이다.' },
      { en: 'Keep going.\nEven on quiet days.', ko: '조용한 날에도,\n계속하라.' },
      { en: 'Every word,\na small victory.', ko: '단어 하나하나가\n작은 승리다.' },
      { en: 'Build the habit.\nThe skill will follow.', ko: '습관을 쌓아라.\n실력은 따라온다.' },
    ],
  },
  {
    seeds: ['library', 'bookshelf', 'reading', 'book', 'pages', 'study'],
    quotes: [
      { en: 'Patterns become\nhabits.', ko: '패턴이 습관이 된다.' },
      { en: 'One story at a time.', ko: '한 번에 이야기 하나씩.' },
      { en: 'Every session\nleaves a mark.', ko: '매 학습이 흔적을 남긴다.' },
      { en: 'Sentences become\ninstinct.', ko: '문장이 본능이 된다.' },
      { en: 'Read it. Feel it.\nSay it.', ko: '읽고. 느끼고. 말하라.' },
      { en: 'Natural speech starts\nwith natural reading.', ko: '자연스러운 말하기는\n자연스러운 읽기에서 시작된다.' },
      { en: 'Fluency comes\nfrom repetition.', ko: '유창함은 반복에서 온다.' },
      { en: 'Language is a craft.\nPolish it daily.', ko: '언어는 기술이다.\n매일 갈고닦아라.' },
    ],
  },
]

function pickCover(): { imageUrl: string; quote: Quote } {
  const theme = COVER_THEMES[Math.floor(Math.random() * COVER_THEMES.length)]
  const seed  = theme.seeds[Math.floor(Math.random() * theme.seeds.length)]
  const quote = theme.quotes[Math.floor(Math.random() * theme.quotes.length)]
  return { imageUrl: `https://picsum.photos/seed/${seed}/900/1400`, quote }
}

function getIssueDateLabel(): string {
  return new Date()
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    .toUpperCase()
}

// ── Circular Goal Badge ───────────────────────────────────────────────────────
function GoalCircle({ done, total }: { done: number; total: number }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const pct  = total > 0 ? Math.min(done / total, 1) : 0
  const offset = circ * (1 - pct)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <p style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
        DAILY GOAL
      </p>
      <div style={{ position: 'relative', width: 62, height: 62 }}>
        <svg width={62} height={62} viewBox="0 0 62 62" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={31} cy={31} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={2.5} />
          <circle
            cx={31} cy={31} r={r} fill="none"
            stroke="rgba(255,255,255,0.80)" strokeWidth={2.5}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="font-playfair" style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            {done}
          </span>
          <span style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.50)', lineHeight: 1.3 }}>/ {total}</span>
        </div>
      </div>
      <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', margin: 0, letterSpacing: '0.06em' }}>tasks</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()

  const [{ imageUrl, quote }] = useState(() => pickCover())
  const issueDateLabel = getIssueDateLabel()

  const [firstHref, setFirstHref] = useState('/stories/1')
  const [goalDone,  setGoalDone]  = useState(0)
  const [goalTotal, setGoalTotal] = useState(2)

  const [showImg,    setShowImg]    = useState(false)
  const [showTop,    setShowTop]    = useState(false)
  const [showQuote,  setShowQuote]  = useState(false)
  const [showBottom, setShowBottom] = useState(false)

  useEffect(() => {
    const due = getDueCount()
    const learnedStoryIds = new Set(
      getAllRecords().filter((r) => r.itemType === 'story').map((r) => r.itemId),
    )
    const nextStory = magazineStories.find((s) => !learnedStoryIds.has(String(s.id))) ?? magazineStories[0]
    setFirstHref(due > 0 ? '/review' : `/stories/${nextStory.id}`)

    const storyDone   = getStudiedTodayStoryCount()
    const patternDone = getPracticedTodayCount()
    const reviewDone  = getReviewedTodayCount()
    const total = due > 0 ? 3 : 2
    let done = 0
    if (storyDone >= 1)  done++
    if (patternDone >= 5) done++
    if (due > 0 && reviewDone >= due) done++
    setGoalDone(done)
    setGoalTotal(total)

    const timers = [
      setTimeout(() => setShowImg(true),    60),
      setTimeout(() => setShowTop(true),   350),
      setTimeout(() => setShowQuote(true), 600),
      setTimeout(() => setShowBottom(true), 850),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const fadeUp = (show: boolean): React.CSSProperties => ({
    opacity: show ? 1 : 0,
    transform: show ? 'translateY(0)' : 'translateY(10px)',
    transition: 'opacity 0.65s ease-out, transform 0.65s ease-out',
  })

  // 버튼 공통 스타일 — 두 버튼 동일 폭·높이 (fit-content 기준 최소폭)
  const btnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    padding: '11px 16px',
    background: 'rgba(255,255,255,0.10)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'background 0.18s',
    whiteSpace: 'nowrap' as const,
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#111' }}>
      <TopNav />

      {/* ── Full-bleed Hero ───────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: `calc(100dvh - ${NAV_HEIGHT}px)`,
          marginTop: NAV_HEIGHT,
          overflow: 'hidden',
          opacity: showImg ? 1 : 0,
          transition: 'opacity 1.1s ease-out',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Daily cover"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }}
          onError={(e) => {
            const img = e.currentTarget
            if (!img.src.includes('coffee')) img.src = 'https://picsum.photos/seed/coffee/900/1400'
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)', pointerEvents: 'none' }} />

        {/* ── PATTO 로고 — 우측으로 치우치게, 상단에서 35% 내려감 ──── */}
        <div
          style={{
            position: 'absolute',
            top: '18%',
            left: '28%',
            right: 18,
            ...fadeUp(showTop),
          }}
        >
          <p
            className="font-playfair"
            style={{
              margin: 0,
              fontSize: 'clamp(3.2rem, 14vw, 5rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              lineHeight: 0.9,
              color: 'rgba(255,255,255,0.95)',
              textShadow: '0 2px 24px rgba(0,0,0,0.5)',
            }}
          >
            PATTO
          </p>
          {/* 슬로건 + 날짜 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <p style={{ margin: 0, fontSize: 7.5, fontWeight: 600, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.50)', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
              PATTERNS. STORIES. YOU.
            </p>
            <p style={{ margin: 0, fontSize: 7.5, fontWeight: 500, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.38)', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
              {issueDateLabel}
            </p>
          </div>
        </div>

        {/* ── Quote — 화면 절반 이내 폭 ───────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(40% + 14px)',
            left: 20,
            width: '50%',
            ...fadeUp(showQuote),
          }}
        >
          <p
            className="font-playfair"
            style={{
              margin: 0,
              fontSize: 'clamp(1.15rem, 4.8vw, 1.45rem)',
              fontWeight: 700,
              fontStyle: 'italic',
              lineHeight: 1.32,
              color: 'rgba(255,255,255,0.95)',
              textShadow: '0 2px 16px rgba(0,0,0,0.55)',
              whiteSpace: 'pre-line',
            }}
          >
            {quote.en}
          </p>
          <p style={{
            margin: '8px 0 0',
            fontSize: 10.5,
            color: 'rgba(255,255,255,0.52)',
            lineHeight: 1.6,
            textShadow: '0 1px 8px rgba(0,0,0,0.45)',
            whiteSpace: 'pre-line',
          }}>
            {quote.ko}
          </p>
        </div>

        {/* ── 하단 패널 ────────────────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.70) 38%, rgba(0,0,0,0.82))',
            padding: '40px 18px 24px',
            ...fadeUp(showBottom),
          }}
        >
          {/* 버튼 + Daily Goal — 같은 row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

            {/* 좌: 두 버튼 (동일 폭) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: '0 0 auto' }}>
              {/* Continue Learning */}
              <button
                type="button"
                onClick={() => router.push(firstHref)}
                style={btnStyle}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)' }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '0.03em', color: 'rgba(255,255,255,0.90)' }}>
                  Continue Learning
                </span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', fontWeight: 400 }}>&gt;</span>
              </button>

              {/* Editor's Note — Continue Learning과 동일 폭 */}
              <button
                type="button"
                onClick={() => router.push('/settings/about')}
                style={{ ...btnStyle, width: '100%' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)' }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '0.03em', color: 'rgba(255,255,255,0.90)' }}>
                  Editor&apos;s Note
                </span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', fontWeight: 400 }}>&gt;</span>
              </button>
            </div>

            {/* 우: Daily Goal — 버튼 두 개와 동일 높이 중앙 */}
            <div style={{ marginLeft: 'auto' }}>
              <GoalCircle done={goalDone} total={goalTotal} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
