import Link from 'next/link'
import type { PostBadge as Badge } from '@/lib/blog/badge'
import { PostBadge } from './PostBadge'

/**
 * 세로 리스트 한 줄 — 홈 섹션과 /blog 목록이 같이 쓴다.
 *
 * 어떤 주제를 리스트로 그릴지는 lib/blog/sections.ts 의 layout 값이 정한다.
 * 스타일은 app/globals.css 의 .plist* 에 있다(두 페이지의 <style> 블록에
 * 나눠 두면 한쪽에만 규칙이 생긴다).
 *
 * 오른쪽 위에는 발행일이 아니라 읽는 시간을 보여 준다(문법·발음 글은 날짜가 의미 없는 에버그린 콘텐츠).
 *
 * kicker 는 제목 위 작은 라벨이다. 목록이 최신순이라 "01, 02…" 를 붙이면
 * 학습 순서처럼 읽혀서, 대신 글의 category 를 넣는다.
 * badge 는 제목 위 뱃지(lib/blog/badge) — kicker 보다 먼저 온다.
 */
export function PostListRow({
  href,
  kicker,
  badge,
  title,
  excerpt,
  readMin,
}: {
  href: string
  kicker?: string | null
  badge?: Badge | null
  title: string
  excerpt?: string | null
  /** 읽는 시간(분). 학습용(에버그린) 글이라 발행일 대신 이것을 보여 준다. */
  readMin?: number | null
}) {
  return (
    <Link href={href} className="plist-row">
      <div className="plist-main">
        {badge && <PostBadge badge={badge} />}
        {kicker && <div className="plist-kicker">{kicker}</div>}
        <div className="plist-title">{title}</div>
        {excerpt && <div className="plist-excerpt">{excerpt}</div>}
      </div>
      <div className="plist-meta">
        {readMin ? <span className="plist-read">{readMin} min read</span> : null}
        <span className="plist-arrow" aria-hidden="true">→</span>
      </div>
    </Link>
  )
}
