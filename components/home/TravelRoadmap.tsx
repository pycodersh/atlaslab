import { SectionHeader } from '@/components/SectionHeader'
import type { BlogThumbnail } from '@/lib/blog/thumbnail'
import { RoadmapSteps } from './RoadmapSteps'

/**
 * 홈 '첫 여행 로드맵' — lib/home/roadmap 의 다섯 단계를 실제 글로 풀어 그린다(app/page.tsx 가 글을 찾아 넘긴다).
 * PC(1000px 이상): 다섯 단계가 가로 5열. 그 아래: 단계마다 한 줄(왼쪽 대표 글 카드 · 오른쪽 링크).
 * 단계 번호는 순서가 의미라 <ol> 로 둔다.
 */
export type ResolvedLink = { href: string; label: string }
export type ResolvedStep = {
  key: string
  step: string
  title: string
  blurb: string
  hub: { href: string; title: string; thumb: BlogThumbnail | null } | null
  more: ResolvedLink[]
  phrase: ResolvedLink | null
}

const SERIF = '"Playfair Display", Georgia, serif'
const BODY = '"DM Sans", system-ui, sans-serif'

const CSS = `
.rm-wrap { padding-top: 48px; padding-bottom: 56px; }
@media (max-width: 700px) { .rm-wrap { padding-top: 32px; padding-bottom: 40px; } }
.rm-list {
  list-style: none; margin: 0; padding: 0;
  display: grid; grid-template-columns: repeat(5, minmax(0, 1fr));
  border-top: 2px solid var(--ink, #111);
}
.rm-step {
  padding: 18px 16px 20px;
  border-right: 1px solid var(--rule, #E5E1DC);
  display: flex; flex-direction: column; min-width: 0;
}
.rm-step:first-child { padding-left: 0; }
.rm-step:last-child { border-right: none; padding-right: 0; }
.rm-num {
  font-family: ${BODY}; font-size: 10.5px; font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--brand-red, #C8102E); margin-bottom: 6px;
}
.rm-title {
  font-family: ${SERIF}; font-size: 18px; font-weight: 700;
  line-height: 1.2; letter-spacing: -0.01em; color: var(--ink, #111);
  margin-bottom: 6px;
}
.rm-blurb {
  font-family: ${BODY}; font-size: 12.5px; line-height: 1.55;
  color: var(--ink-muted, #6B6B6B); margin-bottom: 14px;
}
.rm-hub { display: block; text-decoration: none; color: inherit; margin-bottom: 12px; }
.rm-hub .blog-thumb { margin-bottom: 8px; }
.rm-hub-title {
  font-family: ${SERIF}; font-size: 14px; font-weight: 700; line-height: 1.32;
  color: var(--ink, #111);
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.rm-hub:hover .rm-hub-title { color: var(--brand-red, #C8102E); }
.rm-side { display: flex; flex-direction: column; flex: 1; }
.rm-more { list-style: none; margin: 0 0 14px; padding: 0; }
.rm-more li + li { border-top: 1px solid var(--rule, #E5E1DC); }
.rm-more a {
  display: block; padding: 8px 0;
  font-family: ${BODY}; font-size: 13px; line-height: 1.35;
  color: var(--ink, #111); text-decoration: none;
}
.rm-more a::after { content: ' →'; color: var(--ink-muted, #6B6B6B); }
.rm-more a:hover { color: var(--brand-red, #C8102E); }
.rm-phrase {
  margin-top: auto;
  display: block; text-decoration: none;
  background: var(--paper-2, #F5F5F3);
  border-left: 3px solid var(--brand-red, #C8102E);
  padding: 9px 10px;
  font-family: ${BODY}; font-size: 12.5px; line-height: 1.4; color: var(--ink, #111);
}
.rm-phrase small {
  display: block; font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--ink-muted, #6B6B6B); margin-bottom: 2px;
}
.rm-phrase:hover { color: var(--brand-red, #C8102E); }

/* 1000px 미만 — 단계마다 한 줄: 왼쪽(번호 · 제목 · 대표 글), 오른쪽(링크 · 회화) */
@media (max-width: 999px) {
  .rm-list { grid-template-columns: 1fr; }
  .rm-step {
    padding: 20px 0; border-right: none;
    border-bottom: 1px solid var(--rule, #E5E1DC);
    display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0 28px;
  }
  .rm-step:last-child { border-bottom: none; }
  .rm-head { grid-column: 1 / -1; }
  .rm-hub { display: grid; grid-template-columns: 140px minmax(0, 1fr); gap: 12px; align-items: start; margin-bottom: 0; }
  .rm-hub .blog-thumb { margin-bottom: 0; }
  .rm-side { display: flex; flex-direction: column; }
}
/* 단계 탭 — 600px 미만에서만 보인다(PC · 태블릿은 다섯 단계를 다 펼친다) */
.rm-tabs { display: none; }

/* 600px 미만 — 다섯 단계를 위에 탭으로 두고 고른 한 단계만 보인다(세로 약 2,000px → 한 단계 높이).
   단계 다섯 개를 같은 격자 칸에 겹쳐 쌓고 안 고른 단계는 visibility: hidden 으로 감춘다 —
   칸 높이가 가장 긴 단계로 고정되므로 탭을 바꿔도 아래 내용이 들썩이지 않는다(CLS 0).
   visibility: hidden 인 링크는 탭 포커스 · 스크린리더에서도 빠진다. */
@media (max-width: 599px) {
  .rm-tabs {
    display: grid; grid-template-columns: repeat(5, minmax(0, 1fr));
    border-top: 2px solid var(--ink, #111);
    border-bottom: 1px solid var(--rule, #E5E1DC);
  }
  .rm-tab {
    appearance: none; background: none; border: 0; border-radius: 0;
    min-height: 52px; padding: 8px 2px 9px;
    display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 2px;
    font-family: ${BODY}; font-size: 11.5px; font-weight: 600; line-height: 1.2;
    color: var(--ink-muted, #6B6B6B); text-align: center;
    box-shadow: inset 0 -2px 0 transparent;
    cursor: pointer; -webkit-tap-highlight-color: transparent;
  }
  .rm-tab b { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: inherit; }
  .rm-tab[aria-selected="true"] { color: var(--ink, #111); box-shadow: inset 0 -2px 0 var(--brand-red, #C8102E); }
  .rm-tab[aria-selected="true"] b { color: var(--brand-red, #C8102E); }
  .rm-tab:focus-visible { outline: 2px solid var(--brand-red, #C8102E); outline-offset: -2px; }

  .rm-list { display: grid; grid-template-columns: minmax(0, 1fr); border-top: none; }
  .rm-step {
    grid-area: 1 / 1;
    display: flex; flex-direction: column; padding: 14px 0 4px; border-bottom: none;
  }
  .rm-step[data-active="false"] { visibility: hidden; }
  /* 번호는 탭이 이미 보여 주므로 감추고, 설명은 한 줄 반 정도로 줄인다 */
  .rm-num { display: none; }
  .rm-title { font-size: 17px; margin-bottom: 4px; }
  .rm-blurb { font-size: 12.5px; margin-bottom: 12px; }
  .rm-hub { grid-template-columns: 96px minmax(0, 1fr); margin-bottom: 8px; }
  .rm-hub-title { font-size: 14.5px; }
  /* 링크 줄은 손가락 타깃 44px */
  .rm-more { margin-bottom: 10px; }
  .rm-more a { padding: 12px 0; min-height: 44px; box-sizing: border-box; }
  /* 칸 높이는 가장 긴 단계에 맞춰져 있다 — 짧은 단계에서 회화 카드를 바닥으로 밀지 않고 링크 바로 아래 둔다 */
  .rm-side { flex: 0 0 auto; }
  .rm-phrase { margin-top: 0; padding: 11px 12px; }
}
`

export function TravelRoadmap({ steps }: { steps: ResolvedStep[] }) {
  if (!steps.length) return null
  return (
    <section id="roadmap" className="wrap rm-wrap" aria-labelledby="sec-roadmap">
      <style>{CSS}</style>
      <SectionHeader
        id="sec-roadmap"
        label="Your first days in Korea"
        desc="Follow it in order — every step links the guide to read and the Korean to say."
        more={{ href: '/blog', text: 'All guides →' }}
      />
      <RoadmapSteps steps={steps} />
    </section>
  )
}
