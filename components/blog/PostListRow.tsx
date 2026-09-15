import Link from 'next/link'

/**
 * 세로 리스트 한 줄 — 홈 섹션과 /blog 목록이 같이 쓴다.
 *
 * 어떤 주제를 리스트로 그릴지는 lib/blog/sections.ts 의 layout 값이 정한다.
 * 스타일은 app/globals.css 의 .plist* 에 있다(두 페이지의 <style> 블록에
 * 나눠 두면 한쪽에만 규칙이 생긴다).
 *
 * kicker 는 제목 위 작은 라벨이다. 목록이 최신순이라 "01, 02…" 를 붙이면
 * 학습 순서처럼 읽혀서, 대신 글의 category 를 넣는다.
 */
export function PostListRow({
  href,
  kicker,
  title,
  excerpt,
  date,
}: {
  href: string
  kicker?: string | null
  title: string
  excerpt?: string | null
  date: string
}) {
  return (
    <Link href={href} className="plist-row">
      <div className="plist-main">
        {kicker && <div className="plist-kicker">{kicker}</div>}
        <div className="plist-title">{title}</div>
        {excerpt && <div className="plist-excerpt">{excerpt}</div>}
      </div>
      <div className="plist-meta">
        <span className="plist-date">{date}</span>
        <span className="plist-arrow" aria-hidden="true">→</span>
      </div>
    </Link>
  )
}
