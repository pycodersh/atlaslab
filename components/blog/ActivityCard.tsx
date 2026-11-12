/**
 * 본문 중간의 보조 제휴 링크(Klook 액티비티 · 교통 등) — 슬림한 미니 카드.
 * MDX: <ActivityCard href="..." label="Book on Klook →">**Name** — 한 줄 설명</ActivityCard>
 *
 * 카드 전체가 하나의 링크다(<a> 안에 <a> 를 둘 수 없어 오른쪽 버튼은 모양만 버튼인 <span>).
 * 버튼은 Klook 오렌지(#FF5B00) 솔리드 미니 버튼 — 객실 예약(BookingCta)의 큰 빨간 버튼보다 작고 색도 달라 위계가 갈린다.
 * 카드는 은은한 웜그레이, 마우스를 올리면 테두리가 오렌지(orange-300)로. 설명 앞에 KLOOK 미니 배지(링크 주소로 판단).
 * 버튼 문구는 한 줄(nowrap)로 짧게.
 * 폭 600px 이상은 설명 왼쪽 · 버튼 오른쪽, 그보다 좁으면 버튼이 설명 아래로.
 * .blog-prose a 규칙(밑줄 · 레드)을 이기도록 .blog-prose a.act-card 로 쓴다.
 */
import type { ReactNode } from 'react'

const CSS = `
.blog-prose a.act-card { display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
  background: rgba(250,250,249,.9); border: 1px solid rgba(231,229,228,.9); border-radius: 8px; padding: 12px 16px; margin: 20px 0;
  color: inherit; text-decoration: none; transition: border-color .15s; }
.blog-prose a.act-card:hover { border-color: #FDBA74; color: inherit; }
.blog-prose a.act-card .act-card__badge { display: inline-block; margin-right: 8px; font-size: 10px; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase; color: #FF5B00; vertical-align: 1px; }
.blog-prose a.act-card:focus-visible { outline: 2px solid #1C1917; outline-offset: 2px; }
.blog-prose a.act-card .act-card__text { flex: 1 1 auto; min-width: 0; font-size: 14px; line-height: 1.45; color: #44403C; }
.blog-prose a.act-card .act-card__text strong { color: #1C1917; }
.blog-prose a.act-card .act-card__btn { flex: 0 0 auto; white-space: nowrap; background: #FF5B00; border: 1px solid transparent;
  border-radius: 6px; padding: 8px 14px; font-size: 12px; font-weight: 600; line-height: 1.2; color: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,.05); transition: background-color .15s; }
.blog-prose a.act-card:hover .act-card__btn { background: #E04F00; color: #fff; }
/* 520~600px 에서 나란히 두면 설명이 세 줄로 접혀서, 600px 부터 나란히 */
@media (min-width: 600px) {
  .blog-prose a.act-card { flex-direction: row; align-items: center; gap: 16px; }
}
`

/** 링크 주소로 정하는 출처 배지 — 지금은 Klook 만. 다른 곳 링크면 배지를 달지 않는다 */
function badgeFor(href: string): string | null {
  try { return /(^|\.)klook\.com$/.test(new URL(href).hostname) ? 'Klook' : null } catch { return null }
}

export function ActivityCard({ href, label, children }: { href: string; label: string; children?: ReactNode }) {
  const badge = badgeFor(href)
  return (
    <a className="act-card" href={href} target="_blank" rel="nofollow sponsored noopener">
      <style>{CSS}</style>
      <span className="act-card__text">{badge && <span className="act-card__badge" translate="no">{badge}</span>}{children}</span>
      <span className="act-card__btn">{label}</span>
    </a>
  )
}
