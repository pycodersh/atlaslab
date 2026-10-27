import { NOINDEX_FOLLOW } from '@/lib/seo/noindex'
import { WelcomeOverlay } from '@/components/kpatto/WelcomeOverlay'

// 앱 내부 화면 — 색인 제외 (애드센스 심사 대비 얇은 페이지 정리)
export const metadata = NOINDEX_FOLLOW

/**
 * 앱 홈(/kpatto/home) — 처음 들어온 사용자에게 환영 오버레이를 띄운다.
 * 예전에는 /kpatto 가 앱 홈이라 거기서 띄웠는데, /kpatto 가 판매 랜딩이 되면서 여기로 옮겼다.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <WelcomeOverlay />
    </>
  )
}
