/**
 * 숙소 글 예약 버튼 — MDX 에서 <BookingCta hotel="oakwood" /> 로 쓴다. 링크는 lib/blog/bookingLinks.
 *
 * 모양은 Paradise City 글의 요약 카드 버튼과 같다: Trip.com 빨간 버튼 + Klook 아웃라인 버튼(.quick-card__btns 규칙 재사용),
 * 넓은 화면에서 나란히, 폰에서 위아래로. Klook 이 없는 호텔은 Trip.com 버튼 하나가 폭 전체를 쓴다.
 * 제휴 고지는 글 맨 위 <p className="post-disclosure"> 가 맡는다(Paradise City · INSPIRE 와 같은 방식).
 */
import { BOOKING_LINKS } from '@/lib/blog/bookingLinks'

const REL = 'nofollow sponsored noopener'
const CSS = `.blog-prose .booking-cta { margin: 28px 0 8px; }`

export function BookingCta({ hotel }: { hotel: string }) {
  const link = BOOKING_LINKS[hotel]
  if (!link) return null

  // 제휴 링크가 하나도 없으면 Google Hotels 검색(제휴 아님)
  if (!link.trip && !link.klook) {
    return (
      <div className="quick-card__btns booking-cta">
        <style>{CSS}</style>
        <a className="cta-btn" href={`https://www.google.com/travel/search?q=${encodeURIComponent(link.name)}`}
          target="_blank" rel="noopener noreferrer">Check Rates &amp; Availability ↗</a>
      </div>
    )
  }

  return (
    <div className="quick-card__btns booking-cta">
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
