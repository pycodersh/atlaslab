/**
 * 숙소 글 예약 버튼 — MDX 에서 <BookingCta hotel="oakwood" /> 로 쓴다. 링크는 lib/blog/bookingLinks.
 *
 * 모양은 Paradise City 글의 요약 카드 버튼과 같다: Trip.com 빨간 버튼 + Klook 아웃라인 버튼,
 * 720px 이상에서 50:50 나란히, 그보다 좁으면 위아래로. Klook 이 없는 호텔은 Trip.com 버튼 하나가 폭 전체를 쓴다.
 * 제휴 고지는 글 맨 위 <p className="post-disclosure"> 가 맡는다(Paradise City · INSPIRE 와 같은 방식).
 */
import { BOOKING_LINKS } from '@/lib/blog/bookingLinks'

const REL = 'nofollow sponsored noopener'
/* 두 버튼을 1px 오차 없이 같은 높이 · 같은 폭으로 — 본문 공통 규칙이 끼어들지 않게 이 안에서 모두 다시 정한다.
 *  - .tip-box a.cta-btn + a.cta-btn { margin-top: 12px } 가 두 번째 버튼을 아래로 처지게 했다 → margin 0 !important
 *  - 아웃라인 버튼만 padding 10.5px + border 1.5px 라 높이가 1px 달랐다 → 두 버튼 모두 같은 padding · 같은 두께 테두리
 *  - flex 1 1 290px + nowrap 이라 줄어들지 못해 상자 밖으로 밀려났다 → flex 1 1 0 · min-width 0 · 줄바꿈 허용
 * Tailwind 유틸리티는 .blog-prose a.cta-btn(특정성 더 높음)에 져서 쓰지 않고 같은 값을 여기 적는다:
 *  flex-col sm:flex-row items-stretch gap-3 w-full / flex-1 inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 text-sm font-semibold rounded-lg */
const CSS = `
.blog-prose .booking-cta { display: flex; flex-direction: column; align-items: stretch; gap: 12px; width: 100%;
  box-sizing: border-box; margin: 28px 0 8px; }
.blog-prose .tip-box .booking-cta { margin: 0; }
/* 640px(sm)에서 나란히 놓으면 팁 박스 안 버튼 폭이 245px 이라 라벨이 두 줄로 접힌다 → 한 줄에 들어가는 720px 부터 나란히 */
@media (min-width: 720px) { .blog-prose .booking-cta { flex-direction: row; } }
.blog-prose .booking-cta > a.cta-btn {
  flex: 1 1 0; min-width: 0; width: auto; box-sizing: border-box;
  display: inline-flex; align-items: center; justify-content: center; text-align: center;
  min-height: 44px; padding: 10px 16px !important; margin: 0 !important;
  font-size: 14px; font-weight: 600; line-height: 1.25 !important; white-space: normal;
  border-radius: 8px; border: 1.5px solid #C8102E;
}
.blog-prose .booking-cta > a.cta-btn.cta-btn-outline { border-color: #111; }
`

export function BookingCta({ hotel }: { hotel: string }) {
  const link = BOOKING_LINKS[hotel]
  if (!link) return null

  // 제휴 링크가 하나도 없으면 Google Hotels 검색(제휴 아님)
  if (!link.trip && !link.klook) {
    return (
      <div className="booking-cta">
        <style>{CSS}</style>
        <a className="cta-btn" href={`https://www.google.com/travel/search?q=${encodeURIComponent(link.name)}`}
          target="_blank" rel="noopener noreferrer">Check Rates &amp; Availability ↗</a>
      </div>
    )
  }

  return (
    <div className="booking-cta">
      <style>{CSS}</style>
      {link.trip && (
        <a className="cta-btn" href={link.trip} target="_blank" rel={REL}
          aria-label={`Check room rates for ${link.name} on Trip.com`}>Check Room Rates on Trip.com ↗</a>
      )}
      {link.klook && (
        <a className={link.trip ? 'cta-btn cta-btn-outline' : 'cta-btn'} href={link.klook} target="_blank" rel={REL}
          aria-label={`Check rates for ${link.name} on Klook`}>Check Rates on Klook ↗</a>
      )}
    </div>
  )
}
