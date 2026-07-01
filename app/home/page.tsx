'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { getDueCount, getAllRecords } from '@/lib/srs/storage'
import { magazineStories } from '@/data/magazine-stories'
import { EDITOR_NOTES } from '@/data/editor-notes'
import { getNextUnreadId } from '@/lib/editor/storage'
import { useT } from '@/hooks/useT'
import { usePreferences } from '@/contexts/PreferencesContext'

// ── Ken Burns keyframe (injected once) ───────────────────────────────────────
let kbInjected = false
function injectKenBurns() {
  if (kbInjected || typeof document === 'undefined') return
  kbInjected = true
  const s = document.createElement('style')
  s.textContent = `
    @keyframes kenBurns {
      from { transform: scale(1)    translateZ(0); }
      to   { transform: scale(1.07) translateZ(0); }
    }
    .kb-img { animation: kenBurns 26s ease-out forwards; will-change: transform; }
    .hm-link { transition: opacity 0.18s ease; cursor: pointer; }
    .hm-link:hover { opacity: 0.65; }
    .hm-link:active { opacity: 0.45; }
  `
  document.head.appendChild(s)
}

// ── Cover data ────────────────────────────────────────────────────────────────
// Image source: Unsplash keyword queries (editorial lifestyle, warm tones)
// Categories follow the PATTO Cover Image Selection Guide:
//   카페/커피, 풍경/자연, 책/독서, 도서관/공간, 디저트/음식, 사람/일상
type Quote = { en: string; ko: string }
type CoverTheme = { keywords: string[]; quotes: Quote[] }

const COVER_THEMES: CoverTheme[] = [
  {
    // 카페 / 커피 — 따뜻한 테이블, 창가 커피, 노트
    keywords: [
      'cafe,window,coffee,morning',
      'coffee,table,book,morning',
      'latte,notebook,cafe,cozy',
      'espresso,morning,desk,warm',
      'coffeeshop,window,light,quiet',
      'cappuccino,journal,morning',
    ],
    quotes: [
      { en: 'Every morning\nis a new page.', ko: '매일 아침은\n새로운 페이지다.' },
      { en: 'A little,\nevery day.', ko: '매일,\n조금씩.' },
      { en: 'Show up.\nThe rest follows.', ko: '일단 시작하라.\n나머지는 따라온다.' },
      { en: "Today's effort\nis tomorrow's ease.", ko: '오늘의 노력이\n내일의 여유다.' },
      { en: 'Keep the\nrhythm going.', ko: '리듬을 이어가라.' },
    ],
  },
  {
    // 풍경 / 자연 — 바다, 산, 도시, 하늘, 계절
    keywords: [
      'ocean,horizon,calm,sea',
      'mountain,path,nature,morning',
      'landscape,golden,hour,serene',
      'city,river,bridge,dusk',
      'seaside,quiet,light,view',
      'meadow,soft,light,nature',
    ],
    quotes: [
      { en: "Fluency is not\na destination.\nIt's a direction.", ko: '유창함은\n목적지가 아니라 방향이다.' },
      { en: 'Effort compounds\nquietly.', ko: '노력은 조용히 쌓인다.' },
      { en: 'You understand more\nthan you think.', ko: '너는 생각보다\n더 많이 이해하고 있다.' },
      { en: 'Progress sounds\nlike silence at first.', ko: '성장은 처음엔\n침묵처럼 들린다.' },
      { en: 'Small steps.\nBig changes.', ko: '작은 걸음이\n큰 변화를.' },
    ],
  },
  {
    // 책 / 독서 — 오픈북, 필기, 읽는 공간
    keywords: [
      'book,open,reading,warm',
      'reading,notebook,pen,light',
      'open,book,coffee,morning',
      'pages,reading,cozy,light',
      'handwriting,journal,table,soft',
      'book,glasses,coffee,quiet',
    ],
    quotes: [
      { en: 'Patterns become\nhabits.', ko: '패턴이\n습관이 된다.' },
      { en: 'Sentences become\ninstinct.', ko: '문장이\n본능이 된다.' },
      { en: 'Fluency comes\nfrom repetition.', ko: '유창함은\n반복에서 온다.' },
      { en: 'Language is a craft.\nPolish it daily.', ko: '언어는 기술이다.\n매일 갈고닦아라.' },
      { en: 'A good sentence\nis worth rereading.', ko: '좋은 문장은\n다시 읽을 가치가 있다.' },
    ],
  },
  {
    // 도서관 / 공부 공간 — 서재, 책장, 조용한 공간
    keywords: [
      'library,books,shelf,warm',
      'bookshelf,study,lamp,quiet',
      'library,table,light,cozy',
      'study,room,books,morning',
      'desk,lamp,books,evening',
      'reading,room,shelf,soft',
    ],
    quotes: [
      { en: 'Language lives\nin stories.', ko: '언어는\n이야기 속에 산다.' },
      { en: 'Read deeply.\nSpeak freely.', ko: '깊이 읽고,\n자유롭게 말하라.' },
      { en: 'Language is a door.\nReading is the key.', ko: '언어는 문이고,\n읽기는 열쇠다.' },
      { en: 'The quiet habit\nbuilds the\nloudest skill.', ko: '조용한 습관이\n가장 큰 실력을 만든다.' },
      { en: 'Read.\nRepeat.\nRemember.', ko: '읽고.\n반복하고.\n기억하라.' },
    ],
  },
  {
    // 디저트 / 음식 — 케이크, 베이커리, 테이블 세팅
    keywords: [
      'dessert,cake,table,soft',
      'bakery,pastry,morning,light',
      'coffee,cake,table,cozy',
      'bread,breakfast,morning,warm',
      'tea,pastry,table,light',
      'dessert,plate,minimal,warm',
    ],
    quotes: [
      { en: 'Stories stay\nwith you.', ko: '이야기는\n마음에 남는다.' },
      { en: 'Return to the story.\nFind something new.', ko: '이야기로 돌아가면,\n새로운 걸 발견한다.' },
      { en: 'The page is\nalways open.', ko: '페이지는\n언제나 열려 있다.' },
      { en: 'Practice in quiet.\nSpeak with ease.', ko: '조용히 연습하면,\n편하게 말하게 된다.' },
    ],
  },
  {
    // 사람 / 일상 — 뒷모습, 걷는 모습, 창밖 보는 실루엣
    keywords: [
      'woman,window,reading,soft',
      'person,walking,street,quiet',
      'silhouette,morning,light,calm',
      'person,cafe,window,book',
      'woman,back,ocean,view',
      'person,street,alley,travel',
    ],
    quotes: [
      { en: 'Words are bridges.', ko: '말은 다리다.' },
      { en: 'One sentence\nchanges everything.', ko: '문장 하나가\n모든 걸 바꾼다.' },
      { en: 'Speak a little more\ntoday than yesterday.', ko: '어제보다 오늘\n조금만 더 말하라.' },
      { en: 'The story continues.', ko: '이야기는 계속된다.' },
      { en: 'Depth before\nbreadth.', ko: '넓이보다\n깊이를 먼저.' },
    ],
  },
  {
    // 아침 / 일출 — 빛, 창가, 새벽
    keywords: [
      'sunrise,window,morning,golden',
      'morning,light,curtain,soft',
      'dawn,city,view,warm',
      'sunlight,room,morning,calm',
      'golden,hour,outdoor,soft',
      'morning,fog,landscape,serene',
    ],
    quotes: [
      { en: 'Not perfect.\nJust consistent.', ko: '완벽하지 않아도,\n꾸준하게.' },
      { en: 'Keep going.\nEven on quiet days.', ko: '조용한 날에도,\n계속하라.' },
      { en: 'Build the habit.\nThe skill will follow.', ko: '습관을 쌓아라.\n실력은 따라온다.' },
      { en: 'Consistency is\nthe only shortcut.', ko: '꾸준함이\n유일한 지름길이다.' },
      { en: 'Patience builds\nfluency.', ko: '인내가\n유창함을 만든다.' },
    ],
  },
  {
    // 도시 / 여행 / 골목 — 유럽풍 골목, 조용한 거리
    keywords: [
      'alley,europe,flowers,quiet',
      'street,cobblestone,travel,calm',
      'city,morning,empty,light',
      'europe,alley,cafe,warm',
      'travel,street,soft,light',
      'village,path,morning,still',
    ],
    quotes: [
      { en: 'One pattern\nat a time.', ko: '한 번에\n패턴 하나씩.' },
      { en: 'The smallest habit\nchanges everything.', ko: '가장 작은 습관이\n모든 걸 바꾼다.' },
      { en: 'Words are bridges.', ko: '말은 다리다.' },
      { en: 'The story continues.', ko: '이야기는 계속된다.' },
    ],
  },
]

function pickCover(): { imageUrl: string; quote: Quote } {
  const theme = COVER_THEMES[Math.floor(Math.random() * COVER_THEMES.length)]
  const quote = theme.quotes[Math.floor(Math.random() * theme.quotes.length)]
  // picsum: 숫자 시드로 매번 다른 이미지 보장
  const seed  = Math.floor(Math.random() * 9000) + 1000
  const imageUrl = `https://picsum.photos/seed/${seed}/900/1400`
  return { imageUrl, quote }
}

function getIssueDateLabel(): string {
  return new Date()
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    .toUpperCase()
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const t = useT()
  const { prefs } = usePreferences()

  const [{ imageUrl, quote }] = useState(() => pickCover())
  const issueDateLabel = getIssueDateLabel()

  const [firstHref, setFirstHref] = useState('/stories/1')
  const [editorNote, setEditorNote] = useState<{ id: number; title: string; readTimeSec: number } | null>(null)

  const [phase, setPhase] = useState(0)

  useEffect(() => {
    injectKenBurns()

    // Next story to read
    const due = getDueCount()
    const learnedStoryIds = new Set(
      getAllRecords().filter(r => r.itemType === 'story').map(r => r.itemId),
    )
    const nextStory = magazineStories.find(s => !learnedStoryIds.has(String(s.id))) ?? magazineStories[0]
    setFirstHref(due > 0 ? '/review' : `/stories/${nextStory.id}`)

    // Next unread editor's note
    const nextId = getNextUnreadId(30)
    const note = EDITOR_NOTES.find(n => n.id === nextId) ?? EDITOR_NOTES[0]
    if (note) setEditorNote({ id: note.id, title: note.title, readTimeSec: note.readTimeSec })

    // Phase cascade for entrance animation
    const timers = [
      setTimeout(() => setPhase(1), 80),
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 820),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const fadeStyle = (minPhase: number) => {
    const active = phase >= minPhase
    return {
      opacity: active ? 1 : 0,
      transform: active ? 'translateY(0)' : 'translateY(14px)',
      transition: 'opacity 0.75s cubic-bezier(.4,0,.2,1), transform 0.75s cubic-bezier(.4,0,.2,1)',
    }
  }

  const editorReadLabel = editorNote
    ? t('editor_note_read', { n: editorNote.readTimeSec })
    : ''

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

        {/* Minimal dark overlay */}
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.16)', pointerEvents:'none' }} />

        {/* ── 상단: PATTO + 슬로건 + 날짜 ───────────────────────────────── */}
        <div style={{
          position: 'absolute',
          top: 18,
          left: 18,
          right: 18,
          ...fadeStyle(1),
        }}>
          <p className="font-playfair" style={{
            margin: 0,
            fontSize: 'clamp(4.7rem, 20vw, 7.2rem)',
            fontWeight: 900,
            letterSpacing: '-0.025em',
            lineHeight: 0.88,
            color: 'rgba(255,255,255,0.95)',
            textShadow: '0 2px 32px rgba(0,0,0,0.45)',
          }}>
            PATTO
          </p>

          <p style={{
            margin: '10px 0 0',
            fontSize: 8,
            fontWeight: 600,
            letterSpacing: '0.22em',
            color: 'rgba(255,255,255,0.44)',
            textShadow: '0 1px 6px rgba(0,0,0,0.4)',
          }}>
            PATTERNS. STORIES. YOU.
          </p>

          <p style={{
            margin: '5px 0 0',
            fontSize: 7.5,
            fontWeight: 400,
            letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.28)',
            textShadow: '0 1px 6px rgba(0,0,0,0.4)',
          }}>
            {issueDateLabel}
          </p>
        </div>

        {/* ── Quote ─────────────────────────────────────────────────────── */}
        <div style={{
          position: 'absolute',
          bottom: 'calc(30% + 24px)',
          left: 18,
          width: '52%',
          ...fadeStyle(2),
        }}>
          <p className="font-playfair" style={{
            margin: 0,
            fontSize: 'clamp(1.45rem, 6vw, 1.8rem)',
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
          {prefs.appLang === 'ko' && (
            <p style={{
              margin: '10px 0 0',
              fontSize: 12,
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.44)',
              textShadow: '0 1px 8px rgba(0,0,0,0.4)',
              whiteSpace: 'pre-line',
              letterSpacing: '0.01em',
            }}>
              {quote.ko}
            </p>
          )}
        </div>

        {/* ── 하단 — Magazine Link Typography ──────────────────────────── */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.62) 30%, rgba(0,0,0,0.76))',
          padding: '60px 20px 32px',
          ...fadeStyle(3),
        }}>
          {/* 우측 정렬 컨테이너 — 두 링크 모두 동일 오른쪽 기준 */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end' }}>

          {/* Continue Learning — magazine text link */}
          <div
            role="button"
            tabIndex={0}
            className="hm-link"
            onClick={() => router.push(firstHref)}
            onKeyDown={e => e.key === 'Enter' && router.push(firstHref)}
            style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 18 }}
          >
            <div style={{ display:'inline-block' }}>
              <p style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.01em',
                color: 'rgba(255,255,255,0.95)',
                lineHeight: 1.2,
              }}>
                Continue Learning
              </p>
              <div style={{
                marginTop: 6,
                height: 1,
                background: 'rgba(255,255,255,0.28)',
              }} />
            </div>
            <ArrowRight style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.60)', flexShrink: 0 }} strokeWidth={1.5} />
          </div>

          {/* Editor's Note — same style, fixed label */}
          <div
            role="button"
            tabIndex={0}
            className="hm-link"
            onClick={() => router.push('/editor')}
            onKeyDown={e => e.key === 'Enter' && router.push('/editor')}
            style={{ display:'flex', alignItems:'center', gap: 8 }}
          >
            <div style={{ display:'inline-block' }}>
              <p style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.01em',
                color: 'rgba(255,255,255,0.60)',
                lineHeight: 1.2,
              }}>
                Editor&apos;s Note
              </p>
              <div style={{
                marginTop: 6,
                height: 1,
                background: 'rgba(255,255,255,0.16)',
              }} />
            </div>
            <ArrowRight style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} strokeWidth={1.5} />
          </div>

          </div>{/* end 우측 정렬 컨테이너 */}
        </div>
      </div>
    </div>
  )
}
