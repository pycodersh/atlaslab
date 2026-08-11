'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

/**
 * 뒤로가기 — <Link> 형태이지만 onClick에서 브라우저 이력을 따라 돌아간다.
 * cursor: default → 일반 화살표(iPadOS 적응형 포인터 원형 하이라이트 방지)
 * 직접 접근(이력 없음)일 때는 href="/kpatto/expressions" fallback.
 */
export function ExpressionBackButton() {
  const router = useRouter()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/kpatto/expressions')
    }
  }

  return (
    <Link
      href="/kpatto/expressions"
      onClick={handleClick}
      style={{
        display: 'flex', alignItems: 'center', textDecoration: 'none',
        color: '#888888', padding: '8px 4px 8px 0',
        cursor: 'default',
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label="Go back"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </Link>
  )
}
