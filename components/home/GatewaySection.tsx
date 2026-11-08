import type { ReactNode } from 'react'
import Link from 'next/link'
import { SectionHeader } from '@/components/SectionHeader'
import { BlogThumb } from '@/components/blog/BlogThumb'
import type { BlogThumbnail } from '@/lib/blog/thumbnail'

/**
 * 홈 '게이트웨이' 섹션 — 최신 글을 늘어놓는 대신, 주제별 목록 · 도구로 들어가는 흰 카드 몇 장.
 *   Learn Korean        2열(Phrases · Basics)                variant 'learn'
 *   Travel & Life       3열(Explore Korea · Food · Life)     variant 'guide'
 *   Smart Travel Tools  3열(태블릿 · 폰 2열, 도구 6개)        variant 'tool' — 사진 대신 아이콘
 * 카드 내용은 [사진 또는 아이콘 + 제목 + 설명] 뿐이고, 카드 전체가 하나의 링크다.
 *
 * 사진은 각 주제 대표 글의 썸네일을 빌려 온다(app/page.tsx 가 slug 로 풀어 넘긴다) — 그 글 썸네일을 바꾸면 여기도 바뀐다.
 * 색 배경 없이 흰 카드 + 옅은 테두리만 쓴다(위의 OUR APPS 와 같은 톤).
 * 폰은 [ 96px 사진 | 글 ] 가로 줄로 눕혀 스크롤이 길어지지 않게 한다.
 */
export type GatewayCard = {
  key: string
  title: string
  desc: string
  href: string
  thumb?: BlogThumbnail | null
  thumbAlt?: string
  icon?: ReactNode
}

export function GatewaySection({
  id, title, desc, cards, variant,
}: {
  id: string
  title: string
  desc: string
  cards: GatewayCard[]
  variant: 'learn' | 'guide' | 'tool'
}) {
  return (
    <section id={id} className="gw-sec" aria-labelledby={`gw-${id}`}>
      <style>{`
        .gw-sec + .gw-sec { margin-top: 56px; }
        .gw-grid { display: grid; gap: 24px; }
        .gw-grid.is-learn { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .gw-grid.is-guide { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .gw-card {
          display: flex; flex-direction: column;
          background: #fff; border: 1px solid #F3F4F6; border-radius: 16px; overflow: hidden;
          box-shadow: 0 1px 2px rgba(0,0,0,.05);
          text-decoration: none; color: inherit;
          transition: box-shadow .3s;
        }
        @media (hover: hover) { .gw-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,.08); } }
        .gw-card .blog-thumb { aspect-ratio: 16 / 9; border-radius: 0; }
        /* 3열 카드는 폭이 좁아 16:9 면 납작하다 — 4:3 으로 키워 위 2열(Learn Korean) 카드와 키를 맞춘다 */
        .is-guide .gw-card .blog-thumb { aspect-ratio: 4 / 3; }
        .gw-grid.is-tool { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
        @media (min-width: 1024px) { .gw-grid.is-tool { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        .gw-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; margin: 20px 20px 0; border-radius: 12px; background: #FBEFEA; color: #C8102E; }
        .is-tool .gw-body { padding-top: 14px; }
        .is-tool .gw-title { font-size: 18px; }
        .is-tool .gw-desc { display: block; }
        .gw-body { padding: 20px; display: flex; flex-direction: column; flex: 1; min-width: 0; }
        .gw-title { font-family: "Playfair Display", Georgia, serif; font-size: 20px; font-weight: 700; line-height: 1.3; color: #111827; margin-bottom: 6px; }
        .gw-desc {
          font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 14px; line-height: 1.5; color: #4B5563;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        @media (max-width: 767px) {
          .gw-sec + .gw-sec { margin-top: 40px; }
          .gw-grid.is-learn, .gw-grid.is-guide { grid-template-columns: 1fr; gap: 10px; }
          .gw-card { flex-direction: row; align-items: center; border-radius: 14px; }
          .gw-card .blog-thumb { flex: 0 0 96px; width: 96px; aspect-ratio: auto; align-self: stretch; min-height: 96px; }
          .gw-body { padding: 12px 14px; }
          .gw-title { font-size: 18px; margin-bottom: 3px; }
          .gw-grid.is-tool { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          .is-tool .gw-card { flex-direction: column; align-items: stretch; }
          .gw-icon { margin: 14px 14px 0; }
          .is-tool .gw-body { padding: 10px 14px 14px; }
          .is-tool .gw-title { font-size: 16px; line-height: 1.25; }
          .is-tool .gw-desc { font-size: 13px; }
        }
      `}</style>
      {/* 섹션 이름은 대분류(Learn Korean · Travel & Life) 그 자체라 딥레드 axis 자리에 둔다 — OUR APPS 머리와 같은 모양 */}
      <SectionHeader id={`gw-${id}`} axis={title} desc={desc} />
      <div className={`gw-grid is-${variant}`}>
        {cards.map(c => (
          <Link key={c.key} href={c.href} className="gw-card">
            {c.icon
              ? <span className="gw-icon" aria-hidden="true">{c.icon}</span>
              : <BlogThumb thumb={c.thumb ?? null} alt={c.thumbAlt ?? ''} />}
            <div className="gw-body">
              <span className="gw-title">{c.title}</span>
              <span className="gw-desc">{c.desc}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
