import type { Metadata } from 'next'
import LegalLinks from '@/components/kpantry/layout/LegalLinks'

// 하위 화면(dishes·ingredients·recipes·saved·subscribe)은 서버 HTML 이 2~75단어인
// 앱 내부 화면이라 기본값을 색인 제외로 둔다. 랜딩(page.tsx)만 index 로 되돌린다.
// 새 라우트를 추가해도 기본이 noindex 라 얇은 페이지가 새어 나가지 않는다.
export const metadata: Metadata = {
  title: 'K-Pantry',
  description: 'Cook Korean with What You Have.',
  robots: { index: false, follow: true },
}

/**
 * K-Pantry 테마 — Atlas Lab 브랜드 토큰(app/globals.css :root)에 맞춘다.
 * 컴포넌트는 인라인 스타일에서 var(--kp-*) 만 쓴다. 주 액션은 --kp-accent(브랜드 레드) 하나.
 * 호버·누름은 버튼·링크 자신의 --kp-accent 를 바꿔서 처리한다 — 인라인 background 는 그대로 둬도
 * var() 가 요소 자신의 값으로 풀리므로 :hover 가 먹는다.
 */
const THEME_CSS = `
.kp-app {
  --kp-accent: var(--brand-red, #C8102E);
  --kp-accent-hover: var(--brand-red-dark, #A30D25);
  --kp-accent-active: #8A0B20;
  --kp-accent-soft: #FBEEF0;
  --kp-bg: #FDFBF7;
  --kp-surface-muted: #F1EFEC;
  --kp-rule: var(--rule, #E5E1DC);
  --kp-secondary: #475569;
  --kp-secondary-border: #CBD5E1;
  --kp-icon: #4B5563;
}
.kp-app :is(button, a):not(:disabled):hover { --kp-accent: var(--kp-accent-hover); }
.kp-app :is(button, a):not(:disabled):active { --kp-accent: var(--kp-accent-active); }
`

export default function KPantryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="kp-app" style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh' }}>
      <style>{THEME_CSS}</style>
      {children}
      {/* 모든 K-Pantry 화면 맨 아래 — 레시피 상세 액션 바·재료 화면 CTA 바(하단 고정)에 가리지 않게 그만큼 띄운다 */}
      <footer style={{ padding: '8px 16px calc(96px + env(safe-area-inset-bottom))' }}>
        <LegalLinks prefix="© Atlas Lab ·" />
      </footer>
    </div>
  )
}
