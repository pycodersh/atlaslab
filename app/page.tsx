import { createClient } from '@supabase/supabase-js'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { SectionHeader } from '@/components/SectionHeader'
import { GatewaySection, type GatewayCard } from '@/components/home/GatewaySection'
import { HomeCategoryBar, type HomeTab } from '@/components/HomeCategoryBar'
import { HomeSearch, type SearchDoc } from '@/components/HomeSearch'
import { LeadMagnetBanner } from '@/components/LeadMagnetBanner'
import {
  AXIS_LABELS,
  BLOG_GROUPS,
  groupKeyOf,
} from '@/lib/blog/sections'
import { cardThumbnailForPost } from '@/lib/blog/thumbnail'
import type { Metadata } from 'next'
import { ORGANIZATION_JSON_LD, WEBSITE_JSON_LD, DEFAULT_OPEN_GRAPH, SITE_TITLE, SITE_DESC, SITE_URL } from '@/lib/seo/site'

export const metadata: Metadata = {
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: SITE_TITLE, description: SITE_DESC, url: SITE_URL },
}

/* ── Typography constants ─────────────────────────────────────────────── */
const SERIF = '"Playfair Display", Georgia, serif'
const BODY  = '"DM Sans", Inter, system-ui, sans-serif'

/* ── Product data ─────────────────────────────────────────────────────── */
/** 홈 'Our Apps' 카드 목록 — 외국인 여행자·학습자 대상 서비스만 둔다.
 *  앞으로 K-PATTO PDF 패키지 같은 디지털 상품도 이 배열에 항목만 추가하면 그리드에 자연스럽게 합류한다
 *  (href 가 없으면 'Coming soon' 카드, 아이콘은 APP_ICONS 에 이름으로 추가).
 *  두 카드는 같은 구조(아이콘 · 이름 · 대상 한 줄 · 설명 · 버튼 두 개)로 높이·글꼴이 맞물린다 — 뱃지·부제·버튼 밑 문구는 두지 않는다.
 *  버튼: 'Launch WebApp ↗' 은 앱을 새 탭으로(홈을 떠나지 않게), 'Learn More' 는 같은 사이트의 소개 랜딩을 현재 탭으로.
 *  app 이 없으면 'Coming soon' 카드. */
/** 카드 오른쪽에 깔리는 사진 — 왼쪽(글 쪽)으로 갈수록 흰 배경에 스며든다. position 은 object-position(인물 · 그릇이 보이게) */
type ProductVisual = { src: string; position: string }
type Product = { name: string; audience: string; desc: string; app: string | null; learn: string | null; visual?: ProductVisual }
const STORAGE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`
const PRODUCTS: readonly Product[] = [
  {
    name: 'K-Patto',
    audience: 'For learners of Korean',
    desc: 'Master 300+ real-life Korean phrases through 100 slice-of-life webtoon episodes with native audio sync. Available in eBook, WebApp, or Complete Bundle.',
    app: '/kpatto/story',
    learn: '/kpatto',
    // 웹툰 주인공 Emma — 1화 카페 컷(public/kpatto/ep-001/ep01_c3.png)의 흰 테두리를 잘라 올린 것(372×458)
    visual: { src: `${STORAGE}/blog-covers/apps/kpatto-emma.webp`, position: '50% 30%' },
  },
  {
    name: 'K-Pantry',
    audience: 'For cooking Korean at home',
    desc: "Tells you what you can make with what's already in your fridge — and what to use when an ingredient is missing.",
    app: '/kpantry/en',
    learn: '/kpantry/landing',
    // 전주비빔밥 레시피 사진(1536×1024, 밝은 리넨 배경이라 흰 카드에 자연스럽게 녹는다)
    visual: { src: `${STORAGE}/pantry-recipe-images/jeonju-bibimbap-01.jpg`, position: '58% 50%' },
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
  // cardThumbnailForPost 로 여기서 정한다(Basics 는 영상 스틸, 그 밖에는 대표 이미지가 있으면 그것이 우선).
  const { data: allPosts } = await supabase
    .from('blog_posts')
    .select('slug, title, description, app, locale, category, published_at, content, thumbnail, tags')
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  // 게이트웨이 카드 — 사진은 각 주제 대표 글의 썸네일을 빌려 온다(비공개·삭제되면 사진 자리만 빠진다).
  // 링크는 /blog 목록의 해당 탭 · 칩(따로 만든 /learn-korean · /travel 페이지는 아직 없다)
  const bySlug = new Map((allPosts ?? []).filter(p => p.locale === 'en').map(p => [p.slug, p]))
  const thumbOf = (slug: string) => {
    const p = bySlug.get(slug)
    return p ? cardThumbnailForPost(p.slug, p.content, p.thumbnail) : null
  }
  const learnCards: GatewayCard[] = [
    {
      key: 'phrases', badge: 'Phrases', title: 'Learn Useful Phrases for Your Trip',
      desc: 'Speak naturally in restaurants, shops, and daily life.',
      href: '/blog?tab=phrases', thumb: thumbOf('korean-restaurant-drop-yo-water'), thumbAlt: 'K-Patto webtoon scene at a Korean restaurant',
    },
    {
      key: 'basics', badge: 'Basics', title: 'Master Korean Basics',
      desc: 'Learn Hangul, pronunciation, and basic grammar.',
      href: '/blog?tab=basics', thumb: thumbOf('korean-never-say-dangsin-neo'), thumbAlt: 'Korean grammar rule card',
    },
  ]
  const guideCards: GatewayCard[] = [
    {
      key: 'transit', title: 'Arrival & Transit',
      desc: 'K-ETA, SIM cards, T-Money, and subway navigation without stress.',
      href: '/blog?tab=life&sub=transit', thumb: thumbOf('korean-subway-etiquette-guide'), thumbAlt: 'Seoul subway',
    },
    {
      key: 'itineraries', title: 'Seoul Itineraries',
      desc: 'Curated 3, 4, 5-day routes and neighborhood survival guides.',
      href: '/blog?tab=explore-korea', thumb: thumbOf('seoul-itinerary-first-timers-3-4-5-days'), thumbAlt: 'Seoul skyline with N Seoul Tower',
    },
    {
      key: 'food', title: 'Food & Dining',
      desc: 'Decipher Korean menus, BBQ etiquette, and street food favorites.',
      href: '/blog?tab=food', thumb: thumbOf('how-to-read-korean-restaurant-menu'), thumbAlt: 'Korean table spread',
    },
  ]
  // 바로가기 바는 헤더 드로어와 같은 3대 축(Our Apps · Learn Korean · Travel & Life) — 각 게이트웨이 섹션으로 간다
  const categoryTabs: HomeTab[] = [
    { id: 'resources', label: AXIS_LABELS.apps },
    { id: 'learn-korean', label: AXIS_LABELS.korean },
    { id: 'travel-life', label: AXIS_LABELS.guides },
  ]
  // 히어로 검색 색인 — 주제 섹션에 드는 글만(본문은 빼고 제목 · 태그 · 그룹 이름). 브라우저가 이것만으로 거른다.
  const groupTitle = new Map<string, string>(BLOG_GROUPS.map(g => [g.key, g.title]))
  const searchDocs: SearchDoc[] = (allPosts ?? []).flatMap(p => {
    const g = groupKeyOf(p.app, p.category)
    return g ? [{ title: p.title, href: `/blog/${p.locale}/${p.app}/${p.slug}`, group: groupTitle.get(g) ?? '', tags: p.tags ?? [] }] : []
  })

  return (
    <>
      {/* 사이트 구조화 데이터 — Organization · WebSite (< 는 이스케이프해 </script> 끊김을 막는다) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD).replace(/</g, '\\u003c') }} />
      {/* ── Page-level styles ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: var(--paper, #fff); color: var(--ink, #111); overflow-x: hidden; }

        /* ── Hero (dark charcoal) ──────────────────────────────────── */
        /* overflow 는 보이게 둔다 — 검색 결과 드롭다운이 히어로 아래로 내려온다 */
        .hero {
          background: #121212;
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

        /* ── Our Apps section ──────────────────────────────────────── */
        /* 히어로 아래 여백(56px)과 비슷한 리듬으로 — 어두운 히어로에서 첫 구분선까지 숨 쉴 틈 */
        .products-wrap { padding-top: 48px; padding-bottom: 64px; }
        @media (max-width: 700px) { .products-wrap { padding-top: 32px; } }
        /* 카드 수에 따라 열이 자동으로 늘고 준다(2개면 반반, 3개 이상이면 3열…). 최소 폭 290px. */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
          gap: 24px;
        }
        /* 카드 자체는 링크가 아니다 — 버튼 두 개(앱 · 소개)가 각자 링크다.
           오른쪽 약 45% 에 사진(.pvis)을 깔고 왼쪽으로 갈수록 투명하게(mask) — 글(.pcontent, 왼쪽 60%)은 그 위에 올라앉는다 */
        .pcard {
          position: relative; overflow: hidden;
          background: #fff;
          border: 1px solid #F3F4F6;
          border-radius: 16px;
          box-shadow: 0 1px 2px rgba(0,0,0,.05);
          padding: 32px;
          min-height: 260px;
          display: flex; flex-direction: column;
          color: inherit;
          transition: box-shadow .3s, transform .3s;
        }
        @media (hover: hover) { .pcard:hover { box-shadow: 0 6px 20px rgba(0,0,0,.08); } }
        .pcontent { position: relative; z-index: 1; display: flex; flex-direction: column; flex: 1; }
        /* 글은 왼쪽 60% 안에서만 — 버튼 줄은 카드 폭 전체를 써서 두 버튼이 한 줄에 나란히 선다(버튼은 불투명이라 사진 위에 놓여도 읽힌다) */
        .pcard.has-visual .pmark,
        .pcard.has-visual .pname,
        .pcard.has-visual .paud,
        .pcard.has-visual .pdesc { max-width: 60%; }
        /* 사진 위에 걸치는 아웃라인 버튼은 흰 바탕을 깔아 글자가 사진에 묻히지 않게 한다 */
        .pcard.has-visual .pbtn-outline { background: #fff; }
        /* 위 규칙이 .pbtn-outline:hover 보다 특이도가 높아 눌림 · 호버 색을 여기서 다시 준다(안 그러면 흰 바탕에 흰 글자) */
        .pcard.has-visual .pbtn-outline:active { background: var(--ink, #111); }
        @media (hover: hover) { .pcard.has-visual .pbtn-outline:hover { background: var(--ink, #111); } }
        .pvis { position: absolute; top: 0; right: 0; bottom: 0; width: 45%; pointer-events: none; }
        .pvis img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          -webkit-mask-image: linear-gradient(to left, #000 45%, rgba(0,0,0,0) 100%);
          mask-image: linear-gradient(to left, #000 45%, rgba(0,0,0,0) 100%);
        }

        /* ── Mobile(768px 미만): 1열 + 가로형 카드로 재배치 ──────────── */
        @media (max-width: 767px) {
          .products-grid {
            display: flex; flex-direction: column;
            gap: 10px;
            background: transparent; border: none;
          }
          .pcard {
            border-radius: 14px;
            /* 상하를 줄여 한 화면에 더 들어오게 한다(좌우는 읽기 폭이라 유지) */
            padding: 14px 16px 14px;
            min-height: 0;
          }
          /* 폰은 글이 먼저 — 사진은 오른쪽 끝 35% 에 옅은 워터마크로만 남긴다 */
          /* 폰도 사진을 또렷하게(불투명도 0.92) — 대신 페이드는 사진의 왼쪽 가장자리에서만 짧게 일어나고,
             글(이름 · 대상 · 설명)은 왼쪽 64% 안에 두고 그 뒤에 흰 그라데이션을 깔아 사진이 글을 방해하지 않게 한다.
             버튼 줄은 불투명이라 카드 폭 전체를 그대로 쓴다 */
          .pcard.has-visual .pname,
          .pcard.has-visual .paud,
          .pcard.has-visual .pdesc { max-width: 64%; }
          .pcard.has-visual .pcontent {
            background: linear-gradient(to right, #fff 0%, rgba(255,255,255,.8) 55%, rgba(255,255,255,0) 72%);
            margin: -14px -16px; padding: 14px 16px;
          }
          .pvis { width: 42%; opacity: 0.92; }
          .pvis img {
            -webkit-mask-image: linear-gradient(to left, #000 62%, rgba(0,0,0,0) 100%);
            mask-image: linear-gradient(to left, #000 62%, rgba(0,0,0,0) 100%);
          }
          .pcontent {
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
          /* 버튼 세로 크기는 손가락 타깃이라 줄이지 않는다 — 폰은 두 버튼이 가로를 반반 나눈다 */
          .pbtns, .pbtn-soon {
            grid-area: btn;
            width: 100%;
          }
          .pbtns .pbtn { flex: 1 1 0; padding: 10px 8px; }
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
        /* 두 버튼은 글자 폭만큼(반반 칸에 억지로 넣으면 좁은 글 칸에서 'LAUNCH WEBAPP' 앞뒤가 잘렸다).
           폰에서는 가로를 반반 나눠 손가락 표적을 넓힌다(아래 미디어 쿼리) */
        .pbtns { display: flex; flex-wrap: wrap; gap: 8px; overflow: visible; }
        .pbtn {
          display: flex; align-items: center; justify-content: center;
          flex: 0 0 auto;
          font-family: ${BODY};
          font-size: 12px; font-weight: 600;
          text-align: center; text-decoration: none;
          letter-spacing: 0.06em; text-transform: uppercase;
          background: var(--brand-red, #C8102E);
          color: #fff;
          border: 1.5px solid var(--brand-red, #C8102E);
          padding: 9px 16px;
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

        /* ── 게이트웨이(Learn Korean · Travel & Life) — 흰 카드는 components/home/GatewaySection 이 들고 있다. 여기선 바깥 여백만 ── */
        .gw-wrap { padding-top: 8px; padding-bottom: 64px; }
        @media (max-width: 767px) { .gw-wrap { padding-bottom: 48px; } }

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
            <p className="hero-eyebrow"><span>Korea, decoded</span></p>
            <h1 className="hero-h1">Experience Korea Like a Local.</h1>
            <p className="hero-desc">
              Real-life Korean phrases with webtoon dialogues, practical travel guides without the fluff, and authentic Korean recipes you can cook anywhere.
            </p>
            <HomeSearch docs={searchDocs} />
          </div>
        </div>
      </section>

      {/* ── 카테고리 바로가기 — 히어로를 지나면 메뉴 아래에 붙는다 ── */}
      <HomeCategoryBar tabs={categoryTabs} />


      {/* ── Our Apps ── */}
      <div id="resources">
        <div className="wrap products-wrap">
          <SectionHeader axis={AXIS_LABELS.apps} />
          <div className="products-grid">
            {PRODUCTS.map(p => (
              <div key={p.name} className={`pcard${p.visual ? ' has-visual' : ''}`}>
                {/* 오른쪽 사진 — 왼쪽으로 갈수록 투명해져 흰 카드에 스며든다(장식이라 읽어 주지 않는다) */}
                {p.visual && (
                  <div className="pvis" aria-hidden="true">
                    <img src={p.visual.src} alt="" loading="lazy" decoding="async" style={{ objectPosition: p.visual.position }} />
                  </div>
                )}
                <div className="pcontent">
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
                      Open App ↗
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
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 게이트웨이 — 최신 글 나열 대신 주제별 목록으로 들어가는 흰 카드(Learn Korean 2장 · Travel & Life 3장) ── */}
      <div className="wrap gw-wrap">
        <GatewaySection id="learn-korean" variant="learn" title={AXIS_LABELS.korean} desc="Start with essential phrases and basics." cards={learnCards} />
        <GatewaySection id="travel-life" variant="guide" title={AXIS_LABELS.guides} desc="Solve everyday problems and enjoy your trip." cards={guideCards} />
      </div>

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

      {/* ── 리드 마그넷 — Why Atlas Lab 아래, 푸터 바로 위 ── */}
      <LeadMagnetBanner />

      {/* ── Footer (black) ── */}
      <SiteFooter />
    </>
  )
}
