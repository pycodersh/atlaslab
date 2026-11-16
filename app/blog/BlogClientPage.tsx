'use client'

import { Fragment, type CSSProperties } from 'react'
import { BASICS_ACCENTS, basicsSceneThumb } from '@/lib/blog/basicsScene'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DEFAULT_TAB, familyOf, familyTabs, groupKeyOf, layoutForKey, tabDescription, tabLabel } from '@/lib/blog/sections'
import { SectionHeader } from '@/components/SectionHeader'
import type { BlogThumbnail } from '@/lib/blog/thumbnail'
import type { BlogCard } from '@/lib/blog/indexView'
import { BlogThumb } from '@/components/blog/BlogThumb'
import { PostListRow } from '@/components/blog/PostListRow'
// 지도 보기(Explore Korea 기본) — 목록은 서버에서도 그려지고, 펜화 그림만 브라우저에서 받아 끼운다
import { ExploreMap } from '@/components/blog/ExploreMap'

const SERIF = '"Playfair Display", Georgia, serif'
const BODY  = '"DM Sans","Inter",system-ui,sans-serif'

const APP_LABEL: Record<string, string> = {
  'k-patto':  'K-Patto',
  'patto':    'Patto',
  'kpantry':  'K-Pantry',
  'k-pantry': 'K-Pantry',
}

type Post = {
  slug: string
  title: string
  description: string | null
  app: string
  locale: string
  category: string | null
  published_at: string
  thumb: BlogThumbnail | null
  readMin: number
  geo?: BlogCard['geo']
}

/** Korean 탭의 섹션 하나(Basics · Phrases) — 앞쪽 몇 편과 전체 개수 */
type Section = { key: string; title: string; desc: string; total: number; posts: Post[] }

/** 탭은 화면상의 필터라 쿼리 파라미터로만 표현한다(새 라우트 없음). 기본 탭(Korean)은 /blog 그대로다. */
function buildUrl(tab: string, opts: { lang?: 'en' | 'ko'; page?: number; sub?: string | null; region?: string | null; view?: 'grid' | 'map' } = {}) {
  const params = new URLSearchParams()
  if (tab !== DEFAULT_TAB) params.set('tab', tab)
  if (opts.sub) params.set('sub', opts.sub)
  if (opts.region) params.set('region', opts.region)
  if (opts.view === 'grid') params.set('view', 'grid')   // Explore Korea 는 지도가 기본이다
  if (opts.lang === 'ko') params.set('lang', 'ko')
  if (opts.page && opts.page > 1) params.set('page', String(opts.page))
  const q = params.toString()
  return q ? `/blog?${q}` : '/blog'
}

export function BlogClientPage({
  posts,
  sections,
  activeTab,
  activeLang,
  subChips,
  activeSub,
  regionChips = [],
  activeRegion = null,
  activeView = 'grid',
  regionTotal = 0,
  totalCount,
  totalPages,
  currentPage,
  pageTitle,
  headingTag = 'h1',
}: {
  /** 정적 HTML 에는 Suspense fallback 과 쿼리를 읽은 화면이 둘 다 실려 h1 이 두 번 나온다.
   *  fallback 쪽은 'div' 로 그려 문서의 h1 을 하나로 둔다(겉모양은 .bl-h1 그대로) */
  headingTag?: 'h1' | 'div'
  posts: Post[]
  /** Korean 탭에서만 채워진다 — 있으면 posts 대신 섹션별로 그린다 */
  sections: Section[]
  activeTab: string
  activeLang: 'en' | 'ko'
  subChips: { key: string; label: string; short?: string; count: number }[]
  activeSub: string | null
  /** Explore Korea 만 — 지역 칩(11곳) · 지금 지역 · Grid/Map · 칩 'All' 개수 */
  regionChips?: { key: string; label: string; count: number }[]
  activeRegion?: string | null
  activeView?: 'grid' | 'map'
  regionTotal?: number
  totalCount: number
  totalPages: number
  currentPage: number
  pageTitle: string
}) {
  const lang: 'EN' | 'KO' = activeLang === 'ko' ? 'KO' : 'EN'
  const router = useRouter()
  const isExplore = activeTab === 'explore-korea'
  const goRegion = (region: string | null) => router.push(buildUrl(activeTab, { sub: activeSub, region, view: activeView }), { scroll: false })
  // 격자로 그릴지 세로 리스트로 그릴지는 홈과 같은 기준(sections.ts)을 본다
  const isList = layoutForKey(activeTab) === 'list'
  // 탭 바는 지금 탭이 속한 가족(Learn Korean: Phrases · Basics / Travel & Life: Explore Korea · Food · Life)만 보여 준다.
  // Korean 개요(/blog)는 Phrases · Basics 어느 쪽에도 밑줄이 없다
  const family = familyOf(activeTab)
  const tabs = familyTabs(activeTab)

  const card = (post: Post, index: number) => {
    // Basics 영상 스틸만 위치에 따라 구도와 윗선 색이 돈다. 사진 카드는 그대로다
    const scene = basicsSceneThumb(post.thumb, index)
    return (
      <Link
        key={post.slug}
        href={`/blog/${post.locale}/${post.app}/${post.slug}`}
        className={scene ? 'bl-card is-accent' : 'bl-card'}
        style={scene ? ({ '--bl-accent': BASICS_ACCENTS[index % 4] } as CSSProperties) : undefined}
      >
        <BlogThumb key={scene?.kind === 'image' ? scene.src : undefined} thumb={scene ?? post.thumb} alt={post.title} label={tabLabel(groupKeyOf(post.app, post.category) ?? '')} />
        <div className="bl-body">
          <div className="bl-title">{post.title}</div>
          {post.description && (
            <div className="bl-desc">{post.description}</div>
          )}
          <div className="bl-read">{post.readMin} min read</div>
        </div>
      </Link>
    )
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; overflow-x: hidden; scrollbar-gutter: stable; }
        body { background: #F9F8F6; color: #111; overflow-x: hidden; scrollbar-gutter: stable; }

        /* ── Hero ──────────────────────────────────────────────────── */
        /* 아래 여백은 탭 바(.bl-filterbar, padding-top 32px)와 붙는 자리라
           히어로 쪽을 32/40px 으로 줄여 둘이 한 덩어리로 읽히게 한다. */
        .bl-hero {
          background: #121212;
          padding: 36px 0 32px;
        }
        @media (min-width: 768px) {
          .bl-hero { padding: 52px 0 40px; }
        }
        /* 뒤로가기 — 테두리 없는 작은 대문자 텍스트 링크. 위아래 패딩은 누르는 영역용이고 음수 마진으로 자리를 되돌린다.
           마우스를 올리면 화살표만 왼쪽으로 살짝 민다 */
        .bl-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: ${BODY};
          font-size: 12px; font-weight: 500; line-height: 1;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #A3A3A3; text-decoration: none;
          padding: 8px 0; margin: -8px 0 8px;
          transition: color 0.15s;
        }
        .bl-back:hover { color: #fff; }
        .bl-back-arrow { display: inline-block; transition: transform 0.15s; }
        .bl-back:hover .bl-back-arrow { transform: translateX(-2px); }
        .bl-kicker {
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #A3A3A3;
          margin-bottom: 8px;
        }
        /* 세리프는 유지하고 크기만 30/36px 로 눌러 설명·탭과 위계를 맞춘다 */
        .bl-h1 {
          font-family: ${SERIF};
          font-size: 30px;
          font-weight: 700; line-height: 1.15;
          letter-spacing: -0.025em;
          color: #fff;
          margin-bottom: 12px;
        }
        @media (min-width: 768px) {
          .bl-h1 { font-size: 36px; }
        }
        .bl-sub {
          font-family: ${BODY};
          font-size: 14px; color: #A3A3A3;
          line-height: 1.625; max-width: 576px;
        }
        @media (min-width: 768px) {
          .bl-sub { font-size: 16px; }
        }

        /* ── Wrap ──────────────────────────────────────────────────── */
        .bl-wrap {
          max-width: 1060px; margin: 0 auto;
          padding-left: 48px; padding-right: 48px;
        }
        @media (max-width: 700px) {
          .bl-wrap { padding-left: 20px; padding-right: 20px; }
        }

        /* ── Filter bar ────────────────────────────────────────────── */
        .bl-filterbar {
          display: flex; align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #E5E3DF;
          padding-top: 32px;
          margin-bottom: 36px;
          overflow-x: auto; -webkit-overflow-scrolling: touch;
          gap: 12px;
        }
        .bl-tabs {
          display: flex; align-items: center; gap: 0;
          flex-shrink: 0;
        }
        .bl-tab {
          display: inline-block;
          background: transparent; border: none;
          border-bottom: 2px solid transparent;
          padding: 0 0 12px; margin-right: 28px;
          font-family: ${BODY};
          font-size: 14px; font-weight: 500;
          color: #888; cursor: pointer;
          text-decoration: none; white-space: nowrap;
          transition: color 0.15s, border-color 0.15s;
          flex-shrink: 0;
        }
        .bl-tab:hover { color: #111; border-bottom-color: rgba(200,16,46,0.35); }
        .bl-tab.active { color: #111; font-weight: 700; border-bottom-color: #C8102E; }

        /* ── Sub-category chips ────────────────────────────────────── */
        /* 매거진식 텍스트 필터 — 테두리 · 배경 없이 글자와 얇은 밑줄로만 상태를 보인다.
           가로로 스크롤되고 스크롤바는 숨긴다. 줄이 화면보다 길면 오른쪽 끝이 잘려 보여 더 있다는 걸 알려 준다.
           위아래 패딩은 손가락 표적(높이 약 36px)을 위한 것이고, 활성 밑줄은 글자 바로 아래 오도록 border 로 그린다. */
        .bl-subbar {
          display: flex; gap: 24px;
          margin: -16px 0 28px;
          overflow-x: auto; -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .bl-subbar::-webkit-scrollbar { display: none; }
        .bl-chip {
          flex-shrink: 0; white-space: nowrap;
          display: inline-flex; align-items: baseline;
          font-family: ${BODY};
          font-size: 14px; font-weight: 400; line-height: 1.2;
          color: #737373; text-decoration: none;
          padding: 8px 0 4px;
          border-bottom: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
        }
        .bl-chip:hover { color: #171717; }
        .bl-chip.active { color: #171717; font-weight: 600; border-bottom-color: #171717; }
        .bl-chip-n { margin-left: 4px; font-size: 12px; font-weight: 400; color: #A3A3A3; font-variant-numeric: tabular-nums; }
        .bl-chip.active .bl-chip-n { color: #404040; font-weight: 500; }
        .bl-chip-short { display: none; }
        /* 폰은 짧은 이름만, 개수 없이 — 칩 2~3개와 All 이 스크롤 없이 한 줄에 들어온다 */
        @media (max-width: 700px) {
          .bl-subbar { gap: 20px; }
          .bl-chip-full, .bl-chip-n { display: none; }
          .bl-chip-short { display: inline; }
        }

        /* ── Explore Korea 한 줄 컨트롤 바 ─────────────────────────────── */
        /* 왼쪽 타입 칩(위 .bl-chip 그대로) · 오른쪽 지역 드롭다운 + Grid/Map. 칩 줄만 줄어들 수 있고 오른쪽은 고정 폭 */
        .bl-xrow { display: flex; align-items: center; gap: 16px; margin: -16px 0 24px; }
        .bl-xrow .bl-subbar { margin: 0; flex: 1; min-width: 0; }
        .bl-xctl { flex: none; display: flex; align-items: center; gap: 8px; }
        .bl-region { position: relative; display: inline-flex; align-items: center; height: 34px; padding: 0 30px 0 12px;
          border: 1px solid #D6D3D1; border-radius: 8px; background: #fff; color: #1C1917; cursor: pointer;
          font-family: ${BODY}; font-size: 13px; font-weight: 500; white-space: nowrap; transition: border-color .15s; }
        .bl-region:hover { border-color: #A8A29E; }
        .bl-region:focus-within { outline: 2px solid #9E2B25; outline-offset: 2px; }
        .bl-region-short { display: none; }
        .bl-region-chev { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); color: #57534E; pointer-events: none; }
        .bl-region select { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; font-size: 16px; }
        .bl-view { flex: none; display: inline-flex; height: 34px; box-sizing: border-box; border: 1px solid #D6D3D1; border-radius: 8px; overflow: hidden; background: #fff; }
        .bl-vbtn { display: inline-flex; align-items: center; gap: 6px; padding: 0 12px;
          font-family: ${BODY}; font-size: 13px; font-weight: 600; color: #57534E; text-decoration: none; transition: background .15s, color .15s; }
        .bl-vbtn + .bl-vbtn { border-left: 1px solid #D6D3D1; }
        .bl-vbtn:hover { color: #111; background: #F5F5F4; }
        .bl-vbtn.active { background: #C8102E; color: #fff; }
        .bl-vbtn:focus-visible { outline: 2px solid #9E2B25; outline-offset: 2px; }
        /* 폰: 칩은 이름만(위 규칙), 드롭다운은 개수 없이, Grid/Map 은 아이콘만 — 한 줄에 다 들어온다 */
        @media (max-width: 700px) {
          .bl-xrow { gap: 10px; }
          .bl-xrow .bl-subbar { gap: 16px; }
          .bl-xctl { gap: 6px; }
          .bl-region { padding: 0 26px 0 10px; font-size: 12.5px; }
          .bl-region-chev { right: 9px; }
          .bl-region-full { display: none; }
          .bl-region-short { display: inline; }
          .bl-vbtn { padding: 0 10px; }
          .bl-vlabel { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        }

        /* ── Post grid ─────────────────────────────────────────────── */
        /* 카드 사이 1px 구분선 — 컨테이너 배경이 아니라 카드 테두리로 그린다.
           행이 덜 찼을 때 빈 칸이 회색 블록으로 보이지 않는다.
           위·왼쪽은 컨테이너가, 오른쪽·아래는 각 카드가 맡아 1px 로 맞물린다. */
        .bl-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);   /* 태블릿 */
          gap: 0;
          border-top: 1px solid #E5E1DC;
          border-left: 1px solid #E5E1DC;
          margin-bottom: 48px;
        }
        @media (min-width: 1200px) {
          .bl-grid { grid-template-columns: repeat(3, 1fr); }
        }
        /* 모바일 규칙은 .bl-card / .bl-body 정의 뒤에 온다 — 아래 참조 */
        .bl-card {
          background: #F9F8F6;
          display: flex; flex-direction: column;
          text-decoration: none; color: inherit;
          border-right: 1px solid #E5E1DC;
          border-bottom: 1px solid #E5E1DC;
          transition: background 0.15s;
        }
        /* 썸네일은 카드 가장자리에 붙고 글은 안쪽에 — 패딩을 본문 래퍼로 옮겼다 */
        /* 뱃지를 걷어내 제목이 카드 글의 첫 줄이다 — 썸네일 바로 아래에서 시작하도록 위쪽만 22px */
        .bl-body {
          padding: 22px 24px 28px;
          display: flex; flex-direction: column; flex: 1;
        }
        .bl-card:hover { background: #ECEAE7; }
        .bl-card.is-accent .blog-thumb { border-top: 3px solid var(--bl-accent); }
        .bl-cat {
          font-family: ${BODY};
          font-size: 9.5px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #C8102E; margin-bottom: 10px;
        }
        .bl-title {
          font-family: ${SERIF};
          font-size: 16px; font-weight: 700;
          color: #111; line-height: 1.3;
          margin-bottom: 10px; letter-spacing: -0.01em;
        }
        .bl-desc {
          font-family: ${BODY};
          font-size: 12.5px; color: #777;
          line-height: 1.65; margin-bottom: 16px; flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .bl-read {
          font-family: ${BODY};
          font-size: 11px; color: #aaa; letter-spacing: 0.02em;
        }

        /* 768px 미만 — 홈과 같은 가로형 콤팩트 리스트.
           썸네일 정사각 96px 규칙은 globals.css 에 공용으로 있다.
           ★ .bl-card 정의보다 뒤에 와야 flex-direction 이 덮인다. */
        @media (max-width: 767px) {
          .bl-grid { grid-template-columns: 1fr; border-left: none; }
          .bl-card {
            flex-direction: row; align-items: flex-start;
            gap: 14px; padding: 12px 2px;
            border-right: none;
          }
          .bl-body { padding: 0; min-width: 0; min-height: 72px; justify-content: center; }
          .bl-cat { font-size: 9px; margin-bottom: 5px; }
          .bl-title {
            font-size: 15px; line-height: 1.35; margin-bottom: 4px;
            display: -webkit-box; -webkit-line-clamp: 2;
            -webkit-box-orient: vertical; overflow: hidden;
          }
          /* 폰은 [ 썸네일 | 제목 2줄 + 읽는 시간 ] 만 — 요약은 넓은 화면에서만 */
          .bl-desc { display: none; }
          .bl-read { font-size: 10.5px; }
        }

        /* ── Empty state ───────────────────────────────────────────── */
        .bl-empty {
          min-height: 380px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 60px 24px;
          border: 1px solid #E5E3DF;
          background: #F9F8F6;
          margin-bottom: 48px;
          gap: 0;
        }
        .bl-empty-icon {
          width: 48px; height: 48px;
          border: 1.5px solid #E5E3DF;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .bl-empty-title {
          font-family: ${BODY};
          font-size: 18px; font-weight: 700;
          color: #111; margin-bottom: 8px;
        }
        .bl-empty-desc {
          font-family: ${BODY};
          font-size: 14px; color: #777;
          line-height: 1.65; max-width: 320px;
          margin-bottom: 24px;
        }
        .bl-empty-action {
          font-family: ${BODY};
          font-size: 13px; font-weight: 600;
          background: transparent;
          border: 1.5px solid #C8102E;
          color: #C8102E;
          padding: 10px 22px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          letter-spacing: 0.02em;
        }
        .bl-empty-action:hover { background: #C8102E; color: #fff; }

        /* ── Pagination ────────────────────────────────────────────── */
        .bl-pag {
          display: flex; align-items: center; justify-content: center;
          gap: 4px; margin-bottom: 64px; flex-wrap: wrap;
        }
        .bl-pag-btn {
          font-family: ${BODY};
          font-size: 13px; font-weight: 500;
          padding: 6px 14px;
          text-decoration: none; color: #666;
          border-bottom: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
          white-space: nowrap;
        }
        .bl-pag-btn:hover { color: #111; border-bottom-color: rgba(200,16,46,0.35); }
        .bl-pag-btn.active { color: #111; font-weight: 700; border-bottom-color: #C8102E; }
        .bl-pag-ellipsis { color: #ccc; font-size: 13px; padding: 6px 4px; }

        /* 세로 리스트(.plist) 여백만 목록 페이지 기준으로 맞춘다.
           나머지 규칙은 globals.css 에 있다(홈과 공유). */
        .plist { margin-bottom: 48px; }

        /* 한국어 안내 블록을 걷어냈으므로, 페이지네이션이 없는 탭에서는
           마지막 요소가 푸터와 64px 을 유지하도록 맞춘다(.bl-pag 와 동일). */
        .bl-grid:last-child, .bl-empty:last-child, .plist:last-child { margin-bottom: 64px; }

        /* Korean 탭의 섹션(Basics · Phrases) — 머리는 홈과 같은 SectionHeader(위 검은 선이 섹션 구분선).
           섹션 사이는 격자 아래 여백(48px)에 더해 16px 을 띄워 두 구역이 확실히 갈라져 보이게 한다 */
        .bl-sec + .bl-sec { margin-top: 16px; }
        .bl-sec:last-child .bl-grid { margin-bottom: 64px; }
      `}</style>

      {/* ── Hero ── */}
      <section className="bl-hero">
        <div className="bl-wrap">
          <Link href="/" className="bl-back"><span className="bl-back-arrow" aria-hidden="true">←</span>Atlas Lab</Link>
          {/* 대분류 · 탭 · 칩 이름은 자동 번역에서 뺀다 — 'Phrases' 가 '실없는 말', 'Korean' 이 '한국인'이 된다.
              헤더 드로어 · 홈 바로가기 바와 같은 영어 라벨을 그대로 보여 준다 */}
          <p className="bl-kicker notranslate" translate="no">{family.label}</p>
          {(() => {
            const Heading = headingTag
            return <Heading className="bl-h1">{lang === 'KO' ? '한국어 아티클' : pageTitle}</Heading>
          })()}
          <p className="bl-sub">{tabDescription(activeTab)}</p>
        </div>
      </section>

      {/* ── Body ── */}
      <div style={{ background: '#F9F8F6' }}>
        <div className="bl-wrap">

          {/* Filter bar */}
          <div className="bl-filterbar">
            <div className="bl-tabs notranslate" translate="no">
              {tabs.map(tab => (
                <Link
                  key={tab.key}
                  href={buildUrl(tab.key)}
                  className={`bl-tab${activeTab === tab.key ? ' active' : ''}`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>

          {/* 서브 칩 — 2차 탭마다 따로(Basics · Phrases · Explore Korea · Food · Life). Korean 개요에는 없다.
              Explore Korea 는 한 줄 컨트롤 바: 왼쪽 All · Hotels · Places, 오른쪽 지역 드롭다운 + Grid / Map.
              드롭다운에는 지금 타입에서 1편 이상인 지역만 나온다(indexView). 지도에서 도시 이름을 눌러도 같은 주소로 바뀐다 */}
          {subChips.length > 0 && !isExplore && (
              <nav className="bl-subbar notranslate" translate="no" aria-label="Sub-categories">
                <Link
                  href={buildUrl(activeTab, { region: activeRegion, view: activeView })}
                  scroll={false}
                  className={`bl-chip${activeSub ? '' : ' active'}`}
                >
                  All <span className="bl-chip-n">{totalCount}</span>
                </Link>
                {subChips.map(c => (
                  <Link
                    key={c.key}
                    href={buildUrl(activeTab, { sub: c.key, region: activeRegion, view: activeView })}
                    scroll={false}
                    className={`bl-chip${activeSub === c.key ? ' active' : ''}`}
                  >
                    <span className="bl-chip-full">{c.label}</span>
                    <span className="bl-chip-short">{c.short ?? c.label}</span>
                    <span className="bl-chip-n">{c.count}</span>
                  </Link>
                ))}
              </nav>
          )}
          {subChips.length > 0 && isExplore && (
            <div className="bl-xrow">
              <nav className="bl-subbar notranslate" translate="no" aria-label="Sub-categories">
                <Link
                  href={buildUrl(activeTab, { region: activeRegion, view: activeView })}
                  scroll={false}
                  className={`bl-chip${activeSub ? '' : ' active'}`}
                >
                  All <span className="bl-chip-n">{totalCount}</span>
                </Link>
                {subChips.map(c => (
                  <Link
                    key={c.key}
                    href={buildUrl(activeTab, { sub: c.key, region: activeRegion, view: activeView })}
                    scroll={false}
                    className={`bl-chip${activeSub === c.key ? ' active' : ''}`}
                  >
                    <span className="bl-chip-full">{c.label}</span>
                    <span className="bl-chip-short">{c.short ?? c.label}</span>
                    <span className="bl-chip-n">{c.count}</span>
                  </Link>
                ))}
              </nav>
                <div className="bl-xctl">
                <label className="bl-region notranslate" translate="no">
                  {/* 보이는 글자는 이 span(넓은 화면은 개수까지), 실제 선택은 위에 겹친 투명 select — 폰은 기기 선택기가 뜬다 */}
                  <span className="bl-region-txt" aria-hidden="true">
                    <span className="bl-region-full">{activeRegion ? regionChips.find(r => r.key === activeRegion)?.label : 'All Regions'} ({activeRegion ? regionChips.find(r => r.key === activeRegion)?.count : regionTotal})</span>
                    <span className="bl-region-short">{activeRegion ? regionChips.find(r => r.key === activeRegion)?.label : 'All Regions'}</span>
                  </span>
                  <svg className="bl-region-chev" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <select aria-label="Region" value={activeRegion ?? ''} onChange={e => goRegion(e.target.value || null)}>
                    <option value="">All Regions ({regionTotal})</option>
                    {regionChips.map(r => <option key={r.key} value={r.key}>{r.label} ({r.count})</option>)}
                  </select>
                </label>
            <div className="bl-view notranslate" translate="no" role="group" aria-label="View">
              <Link href={buildUrl(activeTab, { sub: activeSub, region: activeRegion, view: 'grid' })} scroll={false}
                className={`bl-vbtn${activeView === 'grid' ? ' active' : ''}`} aria-current={activeView === 'grid' ? 'true' : undefined}>
                <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true"><path fill="currentColor" d="M1 1h5v5H1zM8 1h5v5H8zM1 8h5v5H1zM8 8h5v5H8z" /></svg><span className="bl-vlabel">Grid</span>
              </Link>
              <Link href={buildUrl(activeTab, { sub: activeSub, region: activeRegion, view: 'map' })} scroll={false}
                className={`bl-vbtn${activeView === 'map' ? ' active' : ''}`} aria-current={activeView === 'map' ? 'true' : undefined}>
                <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" d="M1 3l4-1.5 4 1.5 4-1.5v10L9 13 5 11.5 1 13z M5 1.5v10 M9 3v10" /></svg><span className="bl-vlabel">Map</span>
              </Link>
            </div>
              </div>
            </div>
          )}

          {/* Korean 탭 — Basics 구역 위, Phrases 구역 아래. 카드는 다른 탭과 같은 .bl-card 그대로 */}
          {sections.length > 0 ? (
            sections.map(sec => (
              <section key={sec.key} className="bl-sec" aria-labelledby={`bl-sec-${sec.key}`}>
                <SectionHeader
                  id={`bl-sec-${sec.key}`}
                  label={sec.title}
                  desc={sec.desc}
                  more={sec.total > sec.posts.length ? { href: buildUrl(sec.key), text: `View all ${sec.total} ${sec.title} →` } : undefined}
                />
                <div className="bl-grid">{sec.posts.map(card)}</div>
              </section>
            ))
          ) : activeView === 'map' && posts.length > 0 ? (
            <ExploreMap posts={posts as BlogCard[]} region={activeRegion} regions={regionChips.map(r => r.key)} onRegion={goRegion} />
          ) : (!posts || posts.length === 0) ? (
            <div className="bl-empty">
              <h3 className="bl-empty-title">No articles yet for this filter</h3>
              <p className="bl-empty-desc">Try a different filter or check back later.</p>
            </div>
          ) : isList ? (
            <div className="plist">
              {posts.map(post => (
                <PostListRow
                  key={post.slug}
                  href={`/blog/${post.locale}/${post.app}/${post.slug}`}
                  kicker={post.category ?? APP_LABEL[post.app] ?? post.app}
                  title={post.title}
                  excerpt={post.description}
                  readMin={post.readMin}
                />
              ))}
            </div>
          ) : (
            <div className="bl-grid">{posts.map(card)}</div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bl-pag">
              {currentPage > 1 && (
                <Link href={buildUrl(activeTab, { lang: activeLang, page: currentPage - 1, sub: activeSub, region: activeRegion, view: activeView })} className="bl-pag-btn">
                  ← Prev
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="bl-pag-ellipsis">…</span>
                    )}
                    <Link
                      href={buildUrl(activeTab, { lang: activeLang, page: p, sub: activeSub, region: activeRegion, view: activeView })}
                      className={`bl-pag-btn${p === currentPage ? ' active' : ''}`}
                    >
                      {p}
                    </Link>
                  </Fragment>
                ))}
              {currentPage < totalPages && (
                <Link href={buildUrl(activeTab, { lang: activeLang, page: currentPage + 1, sub: activeSub, region: activeRegion, view: activeView })} className="bl-pag-btn">
                  Next →
                </Link>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
