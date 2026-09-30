import type { Metadata } from 'next'

// 하위 화면(dishes·ingredients·recipes·saved·subscribe)은 서버 HTML 이 2~75단어인
// 앱 내부 화면이라 기본값을 색인 제외로 둔다. 랜딩(page.tsx)만 index 로 되돌린다.
// 새 라우트를 추가해도 기본이 noindex 라 얇은 페이지가 새어 나가지 않는다.
export const metadata: Metadata = {
  title: 'K-Pantry',
  description: 'Cook Korean with What You Have.',
  robots: { index: false, follow: true },
}

export default function KPantryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ backgroundColor: '#F5F0E8', minHeight: '100vh' }}>
      {children}
    </div>
  )
}
