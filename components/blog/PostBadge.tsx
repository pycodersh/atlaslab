import type { PostBadge as Badge } from '@/lib/blog/badge'

/** 카드 뱃지 한 개 — 스타일은 app/globals.css 의 .pbadge(홈 · 목록이 같이 쓴다) */
export function PostBadge({ badge }: { badge: Badge | null }) {
  if (!badge) return null
  return <span className={`pbadge pbadge--${badge.tone}`}>{badge.label}</span>
}
