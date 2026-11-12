/**
 * 본문 중간의 보조 제휴 링크(Klook 액티비티 · 교통 등) — 차분한 미니 카드.
 * MDX: <ActivityCard href="..." label="Book N Seoul Tower Observatory Tickets on Klook →">**Lead:** 한두 문장</ActivityCard>
 *
 * 빨간 솔리드 버튼은 객실 예약(BookingCta 의 Trip.com)만 쓴다 — 이 카드는 연한 돌색 바탕 + 진한 레드 텍스트 링크.
 * 폰은 위아래, 640px 이상은 설명 왼쪽 · 링크 오른쪽.
 * .blog-prose a 규칙(밑줄 · #C8102E)보다 특정성이 높게 .blog-prose .act-card a.act-card__link 로 쓴다.
 */
import type { ReactNode } from 'react'

const CSS = `
.blog-prose .act-card { display: flex; flex-direction: column; justify-content: space-between; gap: 8px;
  background: #FAFAF9; border: 1px solid #E7E5E4; border-radius: 8px; padding: 12px 16px; margin: 20px 0; }
.blog-prose .act-card .act-card__text { flex: 1 1 auto; min-width: 0; margin: 0; font-size: 14.5px; line-height: 1.55; color: #44403C; }
.blog-prose .act-card .act-card__text p { margin: 0; font-size: inherit; line-height: inherit; color: inherit; }
.blog-prose .act-card .act-card__text strong { color: #1C1917; }
.blog-prose .act-card a.act-card__link { flex: 0 1 auto; color: #B91C1C; font-size: 14.5px; font-weight: 600; line-height: 1.4;
  text-decoration: none; }
.blog-prose .act-card a.act-card__link:hover { color: #991B1B; text-decoration: underline; text-underline-offset: 3px; }
.blog-prose .act-card a.act-card__link:focus-visible { outline: 2px solid #1C1917; outline-offset: 2px; border-radius: 2px; }
@media (min-width: 640px) {
  .blog-prose .act-card { flex-direction: row; align-items: center; gap: 20px; }
  /* 링크는 줄어들지 않고 제 길이(최대 40%)를 차지한다 — 안 그러면 긴 설명에 밀려 링크가 서너 줄로 접힌다 */
  .blog-prose .act-card a.act-card__link { flex: 0 0 auto; max-width: 40%; text-align: right; }
}
`

export function ActivityCard({ href, label, children }: { href: string; label: string; children?: ReactNode }) {
  return (
    <aside className="act-card">
      <style>{CSS}</style>
      <div className="act-card__text">{children}</div>
      <a className="act-card__link" href={href} target="_blank" rel="nofollow sponsored noopener">{label}</a>
    </aside>
  )
}
