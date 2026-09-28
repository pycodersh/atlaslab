import { NOINDEX_FOLLOW } from '@/lib/seo/noindex'

// 앱 내부 화면 — 색인 제외 (애드센스 심사 대비 얇은 페이지 정리)
export const metadata = NOINDEX_FOLLOW

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
