'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import {
  getDueCount,
  getAllRecords,
  getStudiedTodayStoryCount,
  getPracticedTodayCount,
  getReviewedTodayCount,
} from '@/lib/srs/storage'
import { magazineStories } from '@/data/magazine-stories'

// ── Ken Burns keyframe (injected once) ───────────────────────────────────────
let kbInjected = false
function injectKenBurns() {
  if (kbInjected || typeof document === 'undefined') return
  kbInjected = true
  const s = document.createElement('style')
  s.textContent = `
    @keyframes kenBurns {
      from { transform: scale(1)     translateZ(0); }
      to   { transform: scale(1.07)  translateZ(0); }
    }
    @keyframes homeFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .kb-img { animation: kenBurns 26s ease-out forwards; will-change: transform; }
    .hm-btn-press:active { transform: scale(0.97); }
  `
  document.head.appendChild(s)
}

// ── Cover data ────────────────────────────────────────────────────────────────
type Quote = { en: string; ko: string }
type CoverTheme = { seeds: string[]; quotes: Quote[] }

const COVER_THEMES: CoverTheme[] = [
  {
    seeds: ['rain','mist','fog','window','drizzle','overcast'],
    quotes: [
      { en: 'The quiet habit\nbuilds the\nloudest skill.', ko: '조용한 습관이\n가장 큰 실력을 만든다.' },
      { en: 'The page is\nalways open.', ko: '페이지는\n언제나 열려 있다.' },
      { en: 'Language lives\nin stories.', ko: '언어는\n이야기 속에 산다.' },
      { en: 'A good sentence\nis worth rereading.', ko: '좋은 문장은\n다시 읽을 가치가 있다.' },
      { en: 'Read.\nRepeat.\nRemember.', ko: '읽고.\n반복하고.\n기억하라.' },
      { en: 'Practice in quiet.\nSpeak with ease.', ko: '조용히 연습하면,\n편하게 말하게 된다.' },
    ],
  },
  {
    seeds: ['coffee','espresso','latte','journal','desk','breakfast'],
    quotes: [
      { en: 'Every morning\nis a new page.', ko: '매일 아침은\n새로운 페이지다.' },
      { en: 'A little,\nevery day.', ko: '매일,\n조금씩.' },
      { en: 'Show up.\nThe rest follows.', ko: '일단 시작하라.\n나머지는 따라온다.' },
      { en: "Today's effort\nis tomorrow's ease.", ko: '오늘의 노력이\n내일의 여유다.' },
      { en: 'Keep the\nrhythm going.', ko: '리듬을 이어가라.' },
    ],
  },
  {
    seeds: ['forest','pine','meadow','fern','woodland','bloom'],
    quotes: [
      { en: 'Small steps.\nBig changes.', ko: '작은 걸음이\n큰 변화를.' },
      { en: 'Patience builds\nfluency.', ko: '인내가\n유창함을 만든다.' },
      { en: 'One pattern\nat a time.', ko: '한 번에\n패턴 하나씩.' },
      { en: 'Depth before\nbreadth.', ko: '넓이보다\n깊이를 먼저.' },
      { en: 'The smallest habit\nchanges everything.', ko: '가장 작은 습관이\n모든 걸 바꾼다.' },
    ],
  },
  {
    seeds: ['candle','lamp','evening','dusk','fireplace','warmglow'],
    quotes: [
      { en: 'Stories stay\nwith you.', ko: '이야기는\n마음에 남는다.' },
      { en: 'Read deeply.\nSpeak freely.', ko: '깊이 읽고,\n자유롭게 말하라.' },
      { en: 'Language is a door.\nReading is the key.', ko: '언어는 문이고,\n읽기는 열쇠다.' },
      { en: 'Return to the story.\nFind something new.', ko: '이야기로 돌아가면,\n새로운 걸 발견한다.' },
    ],
  },
  {
    seeds: ['street','cobblestone','city','bridge','urban','alley'],
    quotes: [
      { en: 'Words are bridges.', ko: '말은 다리다.' },
      { en: 'One sentence\nchanges everything.', ko: '문장 하나가\n모든 걸 바꾼다.' },
      { en: 'Speak a little more\ntoday than yesterday.', ko: '어제보다 오늘\n조금만 더 말하라.' },
      { en: 'The story continues.', ko: '이야기는 계속된다.' },
    ],
  },
  {
    seeds: ['ocean','shore','horizon','harbor','beach','waves'],
    quotes: [
      { en: "Fluency is not\na destination.\nIt's a direction.", ko: '유창함은\n목적지가 아니라 방향이다.' },
      { en: 'Effort compounds\nquietly.', ko: '노력은 조용히 쌓인다.' },
      { en: 'You understand more\nthan you think.', ko: '너는 생각보다\n더 많이 이해하고 있다.' },
      { en: 'Progress sounds\nlike silence at first.', ko: '성장은 처음엔\n침묵처럼 들린다.' },
    ],
  },
  {
    seeds: ['sunrise','dawn','morning','sunlight','daybreak','fresh'],
    quotes: [
      { en: 'Not perfect.\nJust consistent.', ko: '완벽하지 않아도,\n꾸준하게.' },
      { en: 'Keep going.\nEven on quiet days.', ko: '조용한 날에도,\n계속하라.' },
      { en: 'Build the habit.\nThe skill will follow.', ko: '습관을 쌓아라.\n실력은 따라온다.' },
      { en: 'Consistency is\nthe only shortcut.', ko: '꾸준함이\n유일한 지름길이다.' },
    ],
  },
  {
    seeds: ['library','bookshelf','reading','book','pages','study'],
    quotes: [
      { en: 'Patterns become\nhabits.', ko: '패턴이\n습관이 된다.' },
      { en: 'Sentences become\ninstinct.', ko: '문장이\n본능이 된다.' },
      { en: 'Fluency comes\nfrom repetition.', ko: '유창함은\n반복에서 온다.' },
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
  const SIZE = 76
  const r    = 30
  const circ = 2 * Math.PI * r
  const pct  = total > 0 ? Math.min(done / total, 1) : 0
  const offset = circ * (1 - pct)

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
      <p style={{
        fontSize: 7, fontWeight: 700, letterSpacing: '0.20em',
        color: 'rgba(255,255,255,0.40)', margin: 0, textTransform: 'uppercase',
      }}>
        Daily Goal
      </p>
      <div style={{ position:'relative', width:SIZE, height:SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ transform:'rotate(-90deg)' }}>
          <circle cx={SIZE/2} cy={SIZE/2} r={r}
            fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={2.5} />
          <circle cx={SIZE/2} cy={SIZE/2} r={r}
            fill="none" stroke="rgba(255,255,255,0.82)" strokeWidth={2.5}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition:'stroke-dashoffset 1.2s ease-out' }} />
        </svg>
        <div style={{
          position:'absolute', inset:0,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          gap:1,
        }}>
          <span className="font-playfair" style={{ fontSize:22, fontWeight:800, color:'#fff', lineHeight:1 }}>
            {done}
          </span>
          <span style={{ fontSize:9, color:'rgba(255,255,255,0.45)', lineHeight:1 }}>/ {total}</span>
        </div>
      </div>
      <p style={{ fontSize:7, color:'rgba(255,255,255,0.28)', margin:0, letterSpacing:'0.10em' }}>
        tasks
      </p>
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

  const [phase, setPhase] = useState(0)   // 0→1→2→3 cascade

  useEffect(() => {
    injectKenBurns()

    const due = getDueCount()
    const learnedStoryIds = new Set(
      getAllRecords().filter(r => r.itemType === 'story').map(r => r.itemId),
    )
    const nextStory = magazineStories.find(s => !learnedStoryIds.has(String(s.id))) ?? magazineStories[0]
    setFirstHref(due > 0 ? '/review' : `/stories/${nextStory.id}`)

    const storyDone   = getStudiedTodayStoryCount()
    const patternDone = getPracticedTodayCount()
    const reviewDone  = getReviewedTodayCount()
    const total = due > 0 ? 3 : 2
    let done = 0
    if (storyDone >= 1)   done++
    if (patternDone >= 5) done++
    if (due > 0 && reviewDone >= due) done++
    setGoalDone(done)
    setGoalTotal(total)

    const timers = [
      setTimeout(() => setPhase(1), 80),
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 820),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const fadeUp = (minPhase: number): React.CSSProperties => ({
    opacity: phase >= minPhase ? 1 : 0,
    transform: phase >= minPhase ? 'translateY(0)' : 'translateY(14px)',
    transition: 'opacity 0.75s cubic-bezier(.4,0,.2,1), transform 0.75s cubic-bezier(.4,0,.2,1)',
  })

  return (
    <div style={{ minHeight:'100dvh', background:'#0e0e0e' }}>
      <TopNav />

      {/* ── Full-bleed Hero ───────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: `calc(100dvh - ${NAV_HEIGHT}px)`,
        marginTop: NAV_HEIGHT,
        overflow: 'hidden',
        opacity: phase >= 1 ? 1 : 0,
        transition: 'opacity 1.2s ease-out',
      }}>

        {/* Cover image — Ken Burns slow zoom */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Daily cover"
          className="kb-img"
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 28%',
            display: 'block',
          }}
          onError={e => {
            const img = e.currentTarget
            if (!img.src.includes('coffee')) img.src = 'https://picsum.photos/seed/coffee/900/1400'
          }}
        />

        {/* 최소 균일 오버레이 — 그라디언트 없음 */}
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.14)', pointerEvents:'none' }} />

        {/* ── 상단: PATTO + 슬로건 + 날짜 — editorial stack ───────────── */}
        <div style={{
          position: 'absolute',
          top: 22,
          left: 18,
          right: 18,
          ...fadeUp(1),
        }}>
          {/* PATTO — 크게, 위로 */}
          <p className="font-playfair" style={{
            margin: 0,
            fontSize: 'clamp(4rem, 17.5vw, 6.2rem)',
            fontWeight: 900,
            letterSpacing: '-0.025em',
            lineHeight: 0.88,
            color: 'rgba(255,255,255,0.95)',
            textShadow: '0 2px 32px rgba(0,0,0,0.45)',
          }}>
            PATTO
          </p>

          {/* 슬로건 */}
          <p style={{
            margin: '10px 0 0',
            fontSize: 8,
            fontWeight: 600,
            letterSpacing: '0.22em',
            color: 'rgba(255,255,255,0.46)',
            textShadow: '0 1px 6px rgba(0,0,0,0.4)',
          }}>
            PATTERNS. STORIES. YOU.
          </p>

          {/* 날짜 */}
          <p style={{
            margin: '5px 0 0',
            fontSize: 7.5,
            fontWeight: 400,
            letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.30)',
            textShadow: '0 1px 6px rgba(0,0,0,0.4)',
          }}>
            {issueDateLabel}
          </p>
        </div>

        {/* ── Quote — 화면 절반 폭, 하단 패널 위 ──────────────────────── */}
        <div style={{
          position: 'absolute',
          bottom: 'calc(38% + 20px)',
          left: 18,
          width: '52%',
          ...fadeUp(2),
        }}>
          <p className="font-playfair" style={{
            margin: 0,
            fontSize: 'clamp(1.2rem, 5vw, 1.5rem)',
            fontWeight: 700,
            fontStyle: 'italic',
            lineHeight: 1.5,
            letterSpacing: '0.005em',
            color: 'rgba(255,255,255,0.94)',
            textShadow: '0 2px 18px rgba(0,0,0,0.50)',
            whiteSpace: 'pre-line',
          }}>
            {quote.en}
          </p>
          <p style={{
            margin: '10px 0 0',
            fontSize: 10,
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.46)',
            textShadow: '0 1px 8px rgba(0,0,0,0.4)',
            whiteSpace: 'pre-line',
            letterSpacing: '0.01em',
          }}>
            {quote.ko}
          </p>
        </div>

        {/* ── 하단 패널 ────────────────────────────────────────────────── */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.65) 35%, rgba(0,0,0,0.78))',
          padding: '52px 18px 26px',
          ...fadeUp(3),
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>

            {/* 좌: 버튼 컬럼 */}
            <div style={{ display:'flex', flexDirection:'column', gap:12, flex:'0 0 auto', minWidth:0 }}>

              {/* Continue Learning — Premium dark glass */}
              <button
                type="button"
                onClick={() => router.push(firstHref)}
                className="hm-btn-press"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 28,
                  padding: '10px 22px',
                  background: 'rgba(20,20,20,0.58)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  border: '1px solid rgba(255,255,255,0.17)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'background 0.20s ease, transform 0.15s ease',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(35,35,35,0.72)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,20,20,0.58)' }}
              >
                <span style={{ fontSize:13, fontWeight:600, letterSpacing:'0.04em', color:'rgba(255,255,255,0.92)' }}>
                  Continue Learning
                </span>
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.42)', fontWeight:300 }}>&gt;</span>
              </button>

              {/* Editor's Note — secondary mini editorial card */}
              <button
                type="button"
                onClick={() => router.push('/editor')}
                className="hm-btn-press"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 14px 9px 12px',
                  background: 'rgba(0,0,0,0.28)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'background 0.20s ease, transform 0.15s ease',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,20,20,0.42)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.28)' }}
              >
                {/* 아이콘 */}
                <BookOpen
                  style={{ width:14, height:14, color:'rgba(255,255,255,0.45)', flexShrink:0 }}
                  strokeWidth={1.8}
                />

                {/* 3-line content */}
                <div>
                  <p style={{ margin:0, fontSize:7.5, fontWeight:700, letterSpacing:'0.18em', color:'rgba(255,255,255,0.36)' }}>
                    EDITOR'S NOTE
                  </p>
                  <p style={{ margin:'2px 0 0', fontSize:11.5, fontWeight:600, color:'rgba(255,255,255,0.82)' }}>
                    Why PATTO is Different
                  </p>
                  <p style={{ margin:'1px 0 0', fontSize:9.5, color:'rgba(255,255,255,0.36)' }}>
                    Read · 35 sec
                  </p>
                </div>

                <span style={{ marginLeft:'auto', fontSize:12, color:'rgba(255,255,255,0.30)', fontWeight:300 }}>&gt;</span>
              </button>

            </div>

            {/* 우: Daily Goal 원형 — 버튼 컬럼과 동일 높이 중앙 */}
            <div style={{ marginLeft:'auto', flexShrink:0 }}>
              <GoalCircle done={goalDone} total={goalTotal} />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
