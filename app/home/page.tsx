'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { getDueCount, getAllRecords } from '@/lib/srs/storage'
import { magazineStories } from '@/data/magazine-stories'
import { EDITOR_NOTES } from '@/data/editor-notes'
import { getNextUnreadId } from '@/lib/editor/storage'
import { useT } from '@/hooks/useT'

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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const t = useT()

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

  const fadeUp = (minPhase: number): React.CSSProperties => ({
    opacity: phase >= minPhase ? 1 : 0,
    transform: phase >= minPhase ? 'translateY(0)' : 'translateY(14px)',
    transition: 'opacity 0.75s cubic-bezier(.4,0,.2,1), transform 0.75s cubic-bezier(.4,0,.2,1)',
  })

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
          ...fadeUp(1),
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
            color: 'rgba(255,255,255,0.44)',
            textShadow: '0 1px 8px rgba(0,0,0,0.4)',
            whiteSpace: 'pre-line',
            letterSpacing: '0.01em',
          }}>
            {quote.ko}
          </p>
        </div>

        {/* ── 하단 — Magazine Link Typography ──────────────────────────── */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.62) 30%, rgba(0,0,0,0.76))',
          padding: '60px 20px 32px',
          ...fadeUp(3),
        }}>

          {/* Continue Learning — primary magazine link */}
          <div
            role="button"
            tabIndex={0}
            className="hm-link"
            onClick={() => router.push(firstHref)}
            onKeyDown={e => e.key === 'Enter' && router.push(firstHref)}
            style={{ display:'inline-block', marginBottom: 20 }}
          >
            <p style={{
              margin: 0,
              fontSize: 'clamp(1rem, 4.2vw, 1.2rem)',
              fontWeight: 700,
              letterSpacing: '0.01em',
              color: 'rgba(255,255,255,0.95)',
              lineHeight: 1.2,
            }}>
              {t('continue_learning')} →
            </p>
            {/* Magazine rule line */}
            <div style={{
              marginTop: 7,
              height: 1,
              width: '100%',
              background: 'rgba(255,255,255,0.28)',
            }} />
          </div>

          {/* Editor's Note — secondary typography link */}
          {editorNote && (
            <div
              role="button"
              tabIndex={0}
              className="hm-link"
              onClick={() => router.push('/editor')}
              onKeyDown={e => e.key === 'Enter' && router.push('/editor')}
              style={{ display:'block' }}
            >
              <p style={{
                margin: '0 0 3px',
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '0.20em',
                color: 'rgba(255,255,255,0.36)',
                textTransform: 'uppercase',
              }}>
                {t('editor_note_label')}
              </p>
              <p style={{
                margin: '0 0 2px',
                fontSize: 13,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.72)',
                lineHeight: 1.3,
              }}>
                {editorNote.title}
              </p>
              <p style={{
                margin: 0,
                fontSize: 10.5,
                color: 'rgba(255,255,255,0.38)',
                letterSpacing: '0.02em',
              }}>
                {editorReadLabel} →
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
