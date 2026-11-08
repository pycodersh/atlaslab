import { TOOLS, toolHref } from './toolList'

/** 다른 도구로 가는 링크. next/link 의 RSC 요청은 오프라인 캐시에 없어 일반 <a> 로 페이지째 이동한다 */
export function MoreTools({ current }: { current: string }) {
  return (
    <nav className="tl-more" aria-label="More travel tools">
      <span className="tl-more-label">More tools</span>
      <a href="/tools">All tools</a>
      {TOOLS.filter(t => toolHref(t.id) !== current).map(t => (
        <a key={t.id} href={toolHref(t.id)}>{t.title}</a>
      ))}
    </nav>
  )
}
