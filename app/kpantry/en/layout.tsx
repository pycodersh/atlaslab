import type { Metadata } from 'next'
import LegalLinks from '@/components/kpantry/layout/LegalLinks'
import { KP_THEME_CSS } from '@/components/kpantry/ui/theme'

// 하위 화면(dishes·ingredients·recipes·saved·subscribe)은 서버 HTML 이 2~75단어인
// 앱 내부 화면이라 기본값을 색인 제외로 둔다. 랜딩(page.tsx)만 index 로 되돌린다.
// 새 라우트를 추가해도 기본이 noindex 라 얇은 페이지가 새어 나가지 않는다.
export const metadata: Metadata = {
  title: 'K-Pantry',
  description: 'Cook Korean with What You Have.',
  robots: { index: false, follow: true },
}

// 테마 변수(--kp-*)는 랜딩의 언락 모달도 같이 쓴다 — components/kpantry/ui/theme.ts

export default function KPantryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="kp-app" style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh' }}>
      {/* K-Pantry 화면의 주 글꼴 Inter — 사이트 공통 글꼴에서 빼고 여기서만 불러온다(React 가 <head> 로 올린다) */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" precedence="default" />
      <style>{KP_THEME_CSS}</style>
      {children}
      {/* 모든 K-Pantry 화면 맨 아래 — 레시피 상세 액션 바·재료 화면 CTA 바(하단 고정)에 가리지 않게 그만큼 띄운다 */}
      <footer style={{ padding: '8px 16px calc(96px + env(safe-area-inset-bottom))' }}>
        <LegalLinks prefix="© Atlas Lab ·" />
      </footer>
    </div>
  )
}
