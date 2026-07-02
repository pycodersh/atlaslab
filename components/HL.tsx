'use client'

import { QA_HIGHLIGHT } from '@/lib/qa'

/** QA용 하이라이트 컴포넌트. QA_HIGHLIGHT=false 시 아무 변화 없음. */
export function HL({ children }: { children: React.ReactNode }) {
  if (!QA_HIGHLIGHT) return <>{children}</>
  return (
    <mark style={{ background: '#FFEB3B', color: 'inherit', borderRadius: 2, padding: '0 2px' }}>
      {children}
    </mark>
  )
}
