'use client'

import { useRouter } from 'next/navigation'

/**
 * 뒤로가기 버튼 — 브라우저 이동 이력을 따라 돌아간다.
 * 이력이 없을 경우(직접 접근) /kpatto/expressions 로 fallback.
 */
export function ExpressionBackButton() {
  const router = useRouter()

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/kpatto/expressions')
    }
  }

  return (
    <button
      onClick={handleBack}
      aria-label="Go back"
      style={{
        display: 'flex', alignItems: 'center',
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#888888', padding: '8px 4px 8px 0', flexShrink: 0,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>
  )
}
