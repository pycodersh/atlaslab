import { createClient } from '@supabase/supabase-js'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { BlogThumb } from '@/components/blog/BlogThumb'
import { PostListRow } from '@/components/blog/PostListRow'
import { SectionHeader } from '@/components/SectionHeader'
import { HomeCategoryBar, type HomeTab } from '@/components/HomeCategoryBar'
import { readMinutes } from '@/lib/blog/readTime'
import {
  BLOG_GROUPS,
  groupKeyOf,
  minPostsToShow,
  POSTS_PER_SECTION,
} from '@/lib/blog/sections'
import { thumbnailForPost } from '@/lib/blog/thumbnail'

/* ── Typography constants ─────────────────────────────────────────────── */
const SERIF = '"Playfair Display", Georgia, serif'
const BODY  = '"DM Sans", Inter, system-ui, sans-serif'

/* ── Product data ─────────────────────────────────────────────────────── */
/** 홈 'Our Resources' 카드 목록 — 외국인 여행자·학습자 대상 서비스만 둔다.
 *  앞으로 K-PATTO PDF 패키지 같은 디지털 상품도 이 배열에 항목만 추가하면 그리드에 자연스럽게 합류한다
 *  (href 가 없으면 'Coming soon' 카드, 아이콘은 APP_ICONS 에 이름으로 추가).
 *  두 카드는 같은 구조(아이콘 · 이름 · 대상 한 줄 · 설명 · 버튼 두 개)로 높이·글꼴이 맞물린다 — 뱃지·부제·버튼 밑 문구는 두지 않는다.
 *  버튼: 'Launch WebApp ↗' 은 앱을 새 탭으로(홈을 떠나지 않게), 'Learn More' 는 같은 사이트의 소개 랜딩을 현재 탭으로.
 *  app 이 없으면 'Coming soon' 카드. */
type Product = { name: string; audience: string; desc: string; app: string | null; learn: string | null }
const PRODUCTS: readonly Product[] = [
  {
    name: 'K-Patto',
    audience: 'For learners of Korean',
    desc: 'Master 300+ real-life Korean phrases through 100 slice-of-life webtoon episodes with native audio sync. Available in eBook, WebApp, or Complete Bundle.',
    app: '/kpatto/story',
    learn: '/kpatto',
  },
  {
    name: 'K-Pantry',
    audience: 'For cooking Korean at home',
    desc: "Tells you what you can make with what's already in your fridge — and what to use when an ingredient is missing.",
    app: '/kpantry/en',
    learn: '/kpantry/landing',
  },
]

/* ── App icons (SVG) ──────────────────────────────────────────────────── */
const APP_ICONS: Record<string, React.ReactNode> = {
  /* K-Patto — brackets with pattern lines (Korean patterns) */
  'K-Patto': (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
      stroke="#fff" strokeWidth="1.7" strokeLinecap="round">
      <path d="M7 4H4v16h3"/>
      <path d="M17 4h3v16h-3"/>
      <line x1="9"  y1="9"  x2="15" y2="9"/>
      <line x1="9"  y1="12" x2="15" y2="12"/>
      <line x1="9"  y1="15" x2="13" y2="15"/>
    </svg>
  ),
  /* K-Pantry — rice bowl with chopstick steam lines (Korean cooking) */
  'K-Pantry': (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
      stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16c0 4.42-3.58 8-8 8s-8-3.58-8-8z"/>
      <line x1="3"  y1="12" x2="21" y2="12"/>
      <path d="M9 11V8M12 11V7M15 11V8"/>
    </svg>
  ),
}

type BlogRow = {
  slug: string
  title: string
  description: string | null
  app: string
  locale: string
  category: string | null
  published_at: string
  content: string | null
  thumbnail: string | null
}

/** 한 번 받아온 글 목록을 섹션별로 나눈다. 쿼리는 호출부에서 한 번만 돈다.
 *  분류 기준은 lib/blog/sections 하나뿐 — /blog 목록 탭과 같은 것을 쓴다.
 *  groupKeyOf 가 null 을 주는 글(app=patto)은 주제 섹션에 넣지 않는다. */
function groupIntoSections(posts: BlogRow[]) {
  const buckets = new Map<string, BlogRow[]>(BLOG_GROUPS.map(g => [g.key, []]))

  for (const post of posts) {
    const key = groupKeyOf(post.app, post.category)
    if (!key) continue
    buckets.get(key)!.push(post)
  }

  // posts 는 published_at 내림차순으로 들어오므로 앞에서 자르면 최신순이다.
  return BLOG_GROUPS.map(section => {
    const all = buckets.get(section.key)!
    return {
      key: section.key,
      title: section.title,
      desc: section.desc,
      layout: section.layout as 'grid' | 'list',
      total: all.length,
      posts: all.slice(0, POSTS_PER_SECTION).map(post => ({
        ...post,
        thumb: thumbnailForPost(post.slug, post.content, post.thumbnail),
        readMin: readMinutes(post.content),
      })),
    }
  })
}

/** 섹션 바로가기 앵커 — 'explore-korea' 만 짧게 #explore */
const anchorOf = (key: string) => (key === 'explore-korea' ? 'explore' : key)

/* ── Why Atlas Lab items ──────────────────────────────────────────────── */
const WHY = [
  {
    title: 'Pattern-first learning',
    desc:  'Every app teaches through repeating real patterns — not isolated vocabulary or one-off drills.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
        stroke="var(--ink,#111)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2h9l3 3v13H4V2z"/>
        <path d="M13 2v3h3"/>
        <line x1="7" y1="9"  x2="13" y2="9"/>
        <line x1="7" y1="12" x2="13" y2="12"/>
        <line x1="7" y1="15" x2="10" y2="15"/>
      </svg>
    ),
  },
  {
    title: 'Real AI, not a wrapper',
    desc:  'AI generates content, adapts to each user, and gives feedback — it does not just relay a chat model.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
        stroke="var(--ink,#111)" strokeWidth="1.5" strokeLinecap="round">
        <rect x="6" y="6" width="8" height="8"/>
        <line x1="10" y1="1" x2="10" y2="6"/>
        <line x1="10" y1="14" x2="10" y2="19"/>
        <line x1="1"  y1="10" x2="6"  y2="10"/>
        <line x1="14" y1="10" x2="19" y2="10"/>
      </svg>
    ),
  },
  {
    title: 'Habit-sized by design',
    desc:  'Built for phones and offline use. Five focused minutes a day beats five interrupted hours.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
        stroke="var(--ink,#111)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="1" width="8" height="18" rx="1.5"/>
        <circle cx="10" cy="16" r="0.75" fill="var(--ink,#111)" stroke="none"/>
        <line x1="8" y1="4" x2="12" y2="4"/>
      </svg>
    ),
  },
  {
    title: 'One mission, many tools',
    desc:  'Language, food, career — every Atlas Lab product helps build a skill that lasts.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
        stroke="var(--ink,#111)" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="10" cy="10" r="8"/>
        <line x1="10" y1="2"  x2="10" y2="5"/>
        <line x1="10" y1="15" x2="10" y2="18"/>
        <line x1="2"  y1="10" x2="5"  y2="10"/>
        <line x1="15" y1="10" x2="18" y2="10"/>
        <circle cx="10" cy="10" r="2.5"/>
      </svg>
    ),
  },
]

/* ── ISR ──────────────────────────────────────────────────────────────── */
export const revalidate = 3600

/* ══════════════════════════════════════════════════════════════════════════
   Home page
   ══════════════════════════════════════════════════════════════════════════ */
export default async function AtlasLabHome() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
  // 섹션이 여러 개지만 쿼리는 한 번만 — 전부 가져와서 코드에서 분류한다.
  // content 를 같이 받는 이유: 카드 썸네일(유튜브 임베드 또는 본문 첫 이미지)을
  // thumbnailForPost 로 여기서 정한다(대표 이미지가 있으면 그것이 우선).
  const { data: allPosts } = await supabase
    .from('blog_posts')
    .select('slug, title, description, app, locale, category, published_at, content, thumbnail')
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  // 카테고리(Phrases → Basics → Explore Korea → Food → Life)를 BLOG_GROUPS 순서대로 세로로 바로 그린다.
  const blogSections = groupIntoSections(allPosts ?? [])
  // 글이 적어 감추는 섹션은 바로가기 탭에서도 뺀다 — 탭 순서는 화면에 놓인 순서 그대로
  const shownSections = blogSections.filter(s => s.posts.length >= minPostsToShow(s.key))
  const categoryTabs: HomeTab[] = [
    { id: 'resources', label: 'Resources' },
    ...shownSections.map(s => ({ id: anchorOf(s.key), label: s.key === 'explore-korea' ? 'Explore' : s.title })),
  ]

  return (
    <>
      {/* ── Page-level styles ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: var(--paper, #fff); color: var(--ink, #111); overflow-x: hidden; }

        /* ── Hero (dark charcoal) ──────────────────────────────────── */
        .hero {
          background: #121212;
          overflow: hidden;
        }
        /* 좌우 여백·최대 폭은 아래 본문 섹션(.wrap)과 같은 컨테이너를 쓴다 — 텍스트 폭만 따로 제한 */
        /* 버튼 없이 서브 카피로 끝나므로 위아래 여백을 같게 둬서 텍스트 블록이 가운데 앉게 한다 */
        .hero-inner { padding-top: 56px; padding-bottom: 56px; }
        .hero-text { max-width: 720px; }
        @media (max-width: 700px) {
          .hero-inner { padding-top: 36px; padding-bottom: 36px; }
        }
        .hero-eyebrow {
          font-family: ${BODY};
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-bottom: 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .hero-eyebrow::before {
          content: '';
          display: inline-block; width: 24px; height: 1px;
          background: rgba(255,255,255,0.3);
        }
        .hero-h1 {
          font-family: ${SERIF};
          font-size: clamp(27px, 3.6vw, 44px);
          font-weight: 700; line-height: 1.14;
          letter-spacing: -0.02em;
          color: #fff;
          margin-bottom: 16px;
        }
        .hero-desc {
          font-family: ${BODY};
          font-size: clamp(14px, 1.5vw, 16px);
          color: rgba(255,255,255,0.66);
          line-height: 1.65;
          margin-bottom: 0;
          max-width: 640px;
        }
        /* ── Inner container ───────────────────────────────────────── */
        .wrap {
          max-width: 1060px; margin: 0 auto;
          padding-left: 40px; padding-right: 40px;
        }
        @media (max-width: 700px) {
          .wrap { padding-left: 20px; padding-right: 20px; }
        }

        /* 섹션 머리는 공통 디자인 시스템(components/SectionHeader + globals.css .section-header)을 쓴다 */

        /* ── Products section ──────────────────────────────────────── */
        /* 히어로 아래 여백(56px)과 비슷한 리듬으로 — 어두운 히어로에서 첫 구분선까지 숨 쉴 틈 */
        .products-wrap { padding-top: 48px; padding-bottom: 64px; }
        @media (max-width: 700px) { .products-wrap { padding-top: 32px; } }
        /* 카드 수에 따라 열이 자동으로 늘고 준다(2개면 반반, 3개 이상이면 3열…). 최소 폭 290px. */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
          gap: 24px;
        }
        /* 카드 자체는 링크가 아니다 — 버튼 두 개(앱 · 소개)가 각자 링크다 */
        .pcard {
          background: var(--paper, #fff);
          border: 1px solid var(--rule, #E5E1DC);
          padding: 32px 28px 28px;
          display: flex; flex-direction: column;
          color: inherit;
        }

        /* ── Mobile(768px 미만): 1열 + 가로형 카드로 재배치 ──────────── */
        @media (max-width: 767px) {
          .products-grid {
            display: flex; flex-direction: column;
            gap: 10px;
            background: transparent; border: none;
          }
          .pcard {
            border: 1px solid var(--rule, #E5E1DC) !important;
            border-radius: 10px;
            /* 상하를 줄여 한 화면에 더 들어오게 한다(좌우는 읽기 폭이라 유지) */
            padding: 13px 16px 14px !important;
            display: grid;
            grid-template-columns: auto 1fr;
            grid-template-areas:
              "icon name"
              "aud  aud"
              "desc desc"
              "btn  btn";
            gap: 0 12px;
            align-items: center;
          }
          .pmark  {
            grid-area: icon;
            width: 40px !important; height: 40px !important;
            border-radius: 11px !important;
            margin-bottom: 0 !important;
          }
          /* 아이콘 높이 한가운데에 이름을 맞춘다 — 위로 붙어 보이던 것을 정돈 */
          .pname  {
            grid-area: name;
            align-self: center;
            font-size: 17px !important;
            margin-bottom: 0 !important;
          }
          .paud {
            grid-area: aud;
            margin-top: 9px;
            margin-bottom: 0 !important;
          }
          .pdesc  {
            grid-area: desc;
            margin-top: 5px;
            font-size: 13px !important;
            line-height: 1.55;
            margin-bottom: 11px !important;
          }
          /* 버튼 세로 크기는 손가락 타깃이라 줄이지 않는다(패딩 10px 유지) */
          .pbtns, .pbtn-soon {
            grid-area: btn;
            width: 100%;
          }
        }
        .pmark {
          width: 56px; height: 56px;
          background: #121212;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px; flex-shrink: 0;
        }
        .pname {
          font-family: ${SERIF};
          font-size: 19px; font-weight: 700;
          color: var(--ink, #111); margin-bottom: 4px;
          letter-spacing: -0.01em; line-height: 1.2;
        }
        /* "누구를 위한 앱인지" — 이름 바로 아래 한 줄. 레드, 출시 전(href 없음)은 회색. */
        .paud {
          font-family: ${BODY};
          font-size: 12px; font-weight: 600;
          color: var(--brand-red, #C8102E);
          line-height: 1.4; margin-bottom: 10px;
        }
        .paud-soon { color: var(--ink-muted, #6B6B6B); }
        .pdesc {
          font-family: ${BODY};
          font-size: 12.5px; color: var(--ink-muted, #6B6B6B);
          line-height: 1.6; margin-bottom: 16px; flex: 1;
        }
        /* 버튼 두 개를 반반으로 — 왼쪽 솔리드 버건디(앱 열기), 오른쪽 아웃라인(소개 랜딩).
           터치 기기는 탭한 버튼에 :hover 를 남기므로 호버 변화는 마우스 기기로 한정하고,
           누르는 동안의 피드백은 :active 가 준다. */
        .pbtns { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
        /* 좁은 폰에서 'LAUNCH WEBAPP ↗' 이 반 칸을 넘지 않게 자간 · 좌우 여백만 줄인다(높이는 그대로) */
        @media (max-width: 420px) {
          .pbtns .pbtn { letter-spacing: 0.02em; padding-left: 6px; padding-right: 6px; }
        }
        .pbtn {
          display: flex; align-items: center; justify-content: center;
          font-family: ${BODY};
          font-size: 12px; font-weight: 700;
          text-align: center; text-decoration: none;
          letter-spacing: 0.06em; text-transform: uppercase;
          background: var(--brand-red, #C8102E);
          color: #fff;
          border: 1.5px solid var(--brand-red, #C8102E);
          padding: 10px 12px;
          white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .pbtn-outline { background: transparent; color: var(--ink, #111); border-color: var(--ink, #111); }
        @media (hover: hover) {
          .pbtn:hover {
            background: var(--brand-red-dark, #A30D25);
            border-color: var(--brand-red-dark, #A30D25);
          }
          .pbtn-outline:hover { background: var(--ink, #111); border-color: var(--ink, #111); color: #fff; }
        }
        .pbtn:active { background: var(--brand-red-dark, #A30D25); border-color: var(--brand-red-dark, #A30D25); }
        .pbtn-outline:active { background: var(--ink, #111); border-color: var(--ink, #111); color: #fff; }
        /* 누를 수 없는 자리 — 같은 크기·모양으로 두되 색만 죽인다 */
        .pbtn-soon {
          display: block;
          font-family: ${BODY};
          font-size: 12px; font-weight: 700;
          text-align: center; text-decoration: none;
          letter-spacing: 0.06em; text-transform: uppercase;
          background: #F0EEE9;
          color: #9A9A9A;
          border: 1.5px solid #F0EEE9;
          padding: 10px 12px;
          cursor: default;
        }

        /* ── Blog section ──────────────────────────────────────────── */
        .blog-outer {
          background: #F5F5F3;
          padding: 60px 0 64px;
        }
        /* 카테고리가 세로로 이어지므로 구획이 드러나도록 사이 여백을 넉넉히 준다 */
        .blog-sec + .blog-sec { margin-top: 64px; }
        /* 카드 사이 1px 구분선 — 컨테이너 배경이 아니라 카드 테두리로 그린다.
           행이 덜 찼을 때(3열에 카드 2장 등) 빈 칸이 회색 블록으로 보이지 않는다.
           위·왼쪽은 컨테이너가, 오른쪽·아래는 각 카드가 맡아 1px 로 맞물린다. */
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);   /* 태블릿 */
          gap: 0;
          border-top: 1px solid #E5E1DC;
          border-left: 1px solid #E5E1DC;
        }
        @media (min-width: 1200px) {
          .blog-grid { grid-template-columns: repeat(3, 1fr); }
        }
        /* 모바일 규칙은 .bcard / .bbody 정의 뒤에 온다 — 아래 참조 */
        .bcard {
          background: #F5F5F3;
          text-decoration: none;
          display: flex; flex-direction: column;
          border-right: 1px solid #E5E1DC;
          border-bottom: 1px solid #E5E1DC;
          transition: background 0.15s;
        }
        .bcard:hover { background: #ECEAE7; }
        .bbody {
          padding: 24px;
          display: flex; flex-direction: column; flex: 1;
        }
        .btitle {
          font-family: ${SERIF};
          font-size: 16.5px; font-weight: 700;
          color: var(--ink, #111); line-height: 1.32;
          margin-bottom: 10px; letter-spacing: -0.01em;
          /* 제목 2줄 제한 — 카드 높이가 제목 길이에 휘둘리지 않게 */
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .bexcerpt {
          font-family: ${BODY};
          font-size: 12.5px; color: var(--ink-muted, #6B6B6B);
          line-height: 1.65; flex: 1; margin-bottom: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        /* 카드 발치의 날짜 — 섹션 제목이 카테고리를 말해주므로 카드에는 카테고리 라벨이 없다 */
        .bmeta {
          font-family: ${BODY};
          font-size: 11px; color: #9A9A9A;
          margin-top: 12px; letter-spacing: 0.01em;
        }

        /* 768px 미만 — 카드 격자를 가로형 콤팩트 리스트로 눕힌다.
           한 행이 96px 썸네일 + 위아래 12px 이라 한 화면에 4편 이상 들어온다.
           경계는 카드 아래 테두리가 그대로 맡고, 좌우 테두리는 지운다.
           ★ .bcard 정의보다 뒤에 와야 flex-direction 이 덮인다(같은 특이도). */
        @media (max-width: 767px) {
          .blog-grid { grid-template-columns: 1fr; border-left: none; }
          .bcard {
            flex-direction: row; align-items: flex-start;
            gap: 14px; padding: 12px 2px;
            border-right: none;
          }
          .bbody { padding: 0; min-width: 0; justify-content: center; }
          .btitle { font-size: 15px; line-height: 1.35; margin-bottom: 6px; }
          .bexcerpt { font-size: 12.5px; line-height: 1.55; flex: 0 1 auto; }
          .bmeta { font-size: 10.5px; margin-top: 8px; }
        }

        /* ── Why section ───────────────────────────────────────────── */
        .why-wrap { padding-top: 60px; padding-bottom: 72px; }
        .why-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px 28px;
        }
        @media (max-width: 820px) {
          .why-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 460px) {
          .why-grid { grid-template-columns: 1fr; gap: 28px; }
        }
        .why-item { display: flex; flex-direction: column; gap: 12px; }
        .why-icon {
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--ink, #111);
          flex-shrink: 0;
        }
        .why-title {
          font-family: ${SERIF};
          font-size: 16px; font-weight: 700;
          color: var(--ink, #111); line-height: 1.2;
          letter-spacing: -0.01em;
        }
        .why-desc {
          font-family: ${BODY};
          font-size: 12.5px; color: var(--ink-muted, #6B6B6B);
          line-height: 1.7;
        }
      `}</style>

      {/* ── Navigation (red) ── */}
      <SiteNav />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="wrap hero-inner">
          <div className="hero-text">
            <p className="hero-eyebrow"><span><span className="notranslate" translate="no">Atlas Lab</span> — Your Ultimate Korea Companion</span></p>
            <h1 className="hero-h1">Everything You Need to Live, Travel, and Speak Like a Local in Korea.</h1>
            <p className="hero-desc">
              Your ultimate companion to master Korean, discover curated stays, and experience local culture effortlessly.
            </p>
          </div>
        </div>
      </section>

      {/* ── 카테고리 바로가기 — 히어로를 지나면 메뉴 아래에 붙는다 ── */}
      <HomeCategoryBar tabs={categoryTabs} />

      {/* ── Products ── */}
      <div id="resources">
        <div className="wrap products-wrap">
          <SectionHeader label="Our Resources" />
          <div className="products-grid">
            {PRODUCTS.map(p => (
              <div key={p.name} className="pcard">
                {/* Icon — dark rounded square with SVG symbol */}
                <div className="pmark">
                  {APP_ICONS[p.name]}
                </div>
                {/* Name + description (flex: 1 pushes the buttons to the bottom) */}
                <div className="pname notranslate" translate="no">{p.name}</div>
                <div className={`paud${p.app ? '' : ' paud-soon'}`}>
                  {p.audience}
                </div>
                <div className="pdesc">{p.desc}</div>
                {p.app ? (
                  <div className="pbtns">
                    <a href={p.app} target="_blank" rel="noopener noreferrer" className="pbtn"
                       aria-label={`Launch ${p.name} web app (opens in a new tab)`}>
                      Launch WebApp ↗
                    </a>
                    {p.learn && (
                      <a href={p.learn} className="pbtn pbtn-outline" aria-label={`Learn more about ${p.name}`}>
                        Learn More
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="pbtn-soon">Coming soon</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 주제별 섹션 — 카테고리를 세로로 차례대로, 머리는 공통 SectionHeader ── */}
      {blogSections.some(s => s.posts.length >= minPostsToShow(s.key)) && (
        <div className="blog-outer">
          <div className="wrap">
            {blogSections.map(section =>
              // 카드가 적은 섹션은 비어 보이므로 홈에서는 감춘다(목록 탭에는 남는다). 최소 글 수는 섹션마다 다를 수 있다.
              section.posts.length < minPostsToShow(section.key) ? null : (
                <section key={section.key} id={anchorOf(section.key)} className="blog-sec" aria-labelledby={`sec-${section.key}`}>
                  <SectionHeader
                    id={`sec-${section.key}`}
                    label={section.title}
                    more={{ href: `/blog?tab=${section.key}`, text: `View all ${section.total} →` }}
                    desc={section.desc}
                  />
                  {section.layout === 'list' ? (
                    <div className="plist">
                      {section.posts.map(post => (
                        <PostListRow
                          key={`${post.locale}/${post.app}/${post.slug}`}
                          href={`/blog/${post.locale}/${post.app}/${post.slug}`}
                          title={post.title}
                          excerpt={post.description}
                          readMin={post.readMin}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="blog-grid">
                      {section.posts.map(post => (
                        <a
                          key={`${post.locale}/${post.app}/${post.slug}`}
                          href={`/blog/${post.locale}/${post.app}/${post.slug}`}
                          className="bcard"
                        >
                          <BlogThumb thumb={post.thumb} alt={post.title} />
                          <div className="bbody">
                            <div className="btitle">{post.title}</div>
                            {post.description && (
                              <div className="bexcerpt">{post.description}</div>
                            )}
                            <div className="bmeta">
                              {post.readMin} min read
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </section>
              ),
            )}
          </div>
        </div>
      )}

      {/* ── Why Atlas Lab ── */}
      <div className="wrap why-wrap">
        <SectionHeader label="Why Atlas Lab" />
        <div className="why-grid">
          {WHY.map(item => (
            <div key={item.title} className="why-item">
              <div className="why-icon">{item.icon}</div>
              <div className="why-title">{item.title}</div>
              <div className="why-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer (black) ── */}
      <SiteFooter />
    </>
  )
}
