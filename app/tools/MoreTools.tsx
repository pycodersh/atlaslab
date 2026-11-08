const TOOLS = [
  { href: '/tools/order-builder', title: 'K-Food Order Builder' },
  { href: '/tools/subway-timer', title: '15-Min Subway Timer' },
  { href: '/tools/krw-converter', title: 'KRW Price Sense' },
]

/** 다른 도구로 가는 링크. next/link 의 RSC 요청은 오프라인 캐시에 없어 일반 <a> 로 페이지째 이동한다 */
export function MoreTools({ current }: { current: string }) {
  return (
    <nav className="tl-more" aria-label="More travel tools">
      <span className="tl-more-label">More tools</span>
      {TOOLS.filter(t => t.href !== current).map(t => (
        <a key={t.href} href={t.href}>{t.title}</a>
      ))}
    </nav>
  )
}
