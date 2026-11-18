'use client'
import { usePathname } from 'next/navigation'
import { APP_MAX_WIDTH } from '@/lib/appLayout'

/**
 * K-PATTO 앱 화면 폭 — PC 에서 APP_MAX_WIDTH(768px)까지만 넓어지고 가운데 정렬.
 * 예외(풀폭 그대로): 판매 랜딩 /kpatto, 관리 도구 /kpatto/editor.
 * 앱 화면들의 안쪽 480px 제한은 이 래퍼 하나로 대신한다(2026-11-18).
 */
const FULL_BLEED = (path: string) => path === '/kpatto' || path === '/kpatto/' || path.startsWith('/kpatto/editor')

export function KPattoAppWidth({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? ''
  if (FULL_BLEED(path)) return <>{children}</>
  return <div data-kpatto-app-width style={{ maxWidth: APP_MAX_WIDTH, margin: '0 auto' }}>{children}</div>
}
