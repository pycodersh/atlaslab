/**
 * 숙소 글 끝 예약 버튼 — MDX 에서 <BookingCta hotel="oakwood" /> 로 쓴다. 링크는 lib/blog/bookingLinks.
 * 모양은 본문 공통 버튼(.blog-prose a.cta-btn)을 그대로 쓴다.
 */
import { BOOKING_LINKS } from '@/lib/blog/bookingLinks'

const CSS = `
.booking-cta { margin: 32px 0 8px; text-align: center; }
.blog-prose .booking-cta a.cta-btn { display: inline-block; min-width: 280px; text-align: center; }
.blog-prose .booking-cta .booking-cta__note { margin: 10px 0 0; font-size: 12px; color: #6B6560; }
@media (max-width: 560px) { .blog-prose .booking-cta a.cta-btn { display: block; min-width: 0; } }
`

export function BookingCta({ hotel, label }: { hotel: string; label?: string }) {
  const link = BOOKING_LINKS[hotel]
  if (!link) return null
  const sponsored = !!link.href
  const href = link.href ?? `https://www.google.com/travel/search?q=${encodeURIComponent(link.name)}`
  return (
    <div className="booking-cta">
      <style>{CSS}</style>
      <a
        className="cta-btn"
        href={href}
        target="_blank"
        rel={sponsored ? 'noopener noreferrer sponsored' : 'noopener noreferrer'}
        aria-label={`Check rates and availability for ${link.name}`}
      >
        {label ?? link.label ?? 'Check Rates & Availability'} →
      </a>
      <p className="booking-cta__note">
        {sponsored
          ? 'Affiliate link: we may earn a small commission at no extra cost to you.'
          : 'Compare live rates across booking sites.'}
      </p>
    </div>
  )
}
