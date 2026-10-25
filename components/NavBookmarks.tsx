'use client'

import Link from 'next/link'
import { useSaves } from '@/lib/saves'

/** 헤더의 "내 북마크" 진입점 — 언어 선택과 같은 무게의 텍스트 버튼, 저장한 게 있으면 개수 */
export function NavBookmarks() {
  const n = Object.keys(useSaves().bookmarks).length
  return (
    <Link href="/bookmarks" className="nav-pill nav-pill--sub" aria-label={n ? `My bookmarks (${n})` : 'My bookmarks'} title="My Bookmarks">
      <svg width="14" height="14" viewBox="0 0 24 24" fill={n ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 3.5h12a.5.5 0 0 1 .5.5v16.2a.3.3 0 0 1-.48.24L12 16l-6.02 4.44a.3.3 0 0 1-.48-.24V4a.5.5 0 0 1 .5-.5z" />
      </svg>
      {n > 0 && <span aria-hidden="true">{n}</span>}
    </Link>
  )
}
