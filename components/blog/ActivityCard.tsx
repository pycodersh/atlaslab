/**
 * 본문 중간의 보조 제휴 링크(Klook 액티비티 · 교통 등) — 슬림한 미니 카드.
 * MDX: <ActivityCard href="..." label="Book on Klook →">**Name** — 한 줄 설명</ActivityCard>
 *
 * 카드 전체가 하나의 링크다(<a> 안에 <a> 를 둘 수 없어 오른쪽 버튼은 모양만 버튼인 <span>).
 * 버튼은 흰 바탕 · 얇은 돌색 테두리 · 미세 그림자의 미니 아웃라인 — 빨간 솔리드는 객실 예약(BookingCta)만 쓴다.
 * 마우스를 올리면 버튼 테두리 · 글자가 레드(#B91C1C)로 바뀐다. 버튼 문구는 한 줄(nowrap)로 짧게.
 * 폭 600px 이상은 설명 왼쪽 · 버튼 오른쪽, 그보다 좁으면 버튼이 설명 아래로.
 * .blog-prose a 규칙(밑줄 · 레드)을 이기도록 .blog-prose a.act-card 로 쓴다.
 */
import type { ReactNode } from 'react'

const CSS = `
.blog-prose a.act-card { display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
  background: #FAFAF9; border: 1px solid #E7E5E4; border-radius: 8px; padding: 12px 16px; margin: 20px 0;
  color: inherit; text-decoration: none; transition: border-color .15s; }
.blog-prose a.act-card:hover { border-color: #D6D3D1; color: inherit; }
.blog-prose a.act-card:focus-visible { outline: 2px solid #1C1917; outline-offset: 2px; }
.blog-prose a.act-card .act-card__text { flex: 1 1 auto; min-width: 0; font-size: 14px; line-height: 1.45; color: #44403C; }
.blog-prose a.act-card .act-card__text strong { color: #1C1917; }
.blog-prose a.act-card .act-card__btn { flex: 0 0 auto; white-space: nowrap; background: #fff; border: 1px solid #D6D3D1;
  border-radius: 6px; padding: 8px 14px; font-size: 12px; font-weight: 600; line-height: 1.2; color: #292524;
  box-shadow: 0 1px rgba(0,0,0,.05); transition: border-color .15s, color .15s; }
.blog-prose a.act-card:hover .act-card__btn { border-color: #B91C1C; color: #B91C1C; }
/* 520~600px 에서 나란히 두면 설명이 세 줄로 접혀서, 600px 부터 나란히 */
@media (min-width: 600px) {
  .blog-prose a.act-card { flex-direction: row; align-items: center; gap: 16px; }
}
`

export function ActivityCard({ href, label, children }: { href: string; label: string; children?: ReactNode }) {
  return (
    <a className="act-card" href={href} target="_blank" rel="nofollow sponsored noopener">
      <style>{CSS}</style>
      <span className="act-card__text">{children}</span>
      <span className="act-card__btn">{label}</span>
    </a>
  )
}
