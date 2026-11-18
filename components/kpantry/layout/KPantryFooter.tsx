'use client'
import { usePathname } from 'next/navigation'
import LegalLinks from '@/components/kpantry/layout/LegalLinks'
import { InstallAppButton } from '@/components/kpantry/InstallAppButton'

/**
 * K-Pantry 화면 맨 아래 — 앱 설치 필 버튼 + 약관 링크.
 * 홈(/kpantry/en)에서는 그리지 않는다: 설치 버튼과 약관은 헤더의 설정 화면(/kpantry/en/settings)에 모여 있다.
 * 다른 화면에서는 하단 고정 바(레시피 상세 액션 바 · 재료 화면 CTA)에 가리지 않게 아래를 띄운다.
 */
export default function KPantryFooter() {
  const path = usePathname()
  if (path === '/kpantry/en' || path === '/kpantry/en/') {
    return <div aria-hidden="true" style={{ height: 'calc(24px + env(safe-area-inset-bottom))' }} />
  }
  return (
    <footer style={{ padding: '8px 16px calc(96px + env(safe-area-inset-bottom))' }}>
      {/* 앱 설치 — 기기별(iOS·iPadOS 안내 / Android·PC 설치 창). 이미 설치된 창에서는 보이지 않는다 */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <InstallAppButton variant="pill" style={{ fontFamily: 'Inter, sans-serif', marginBottom: 12 }} />
      </div>
      <LegalLinks prefix="© Atlas Lab ·" />
    </footer>
  )
}
