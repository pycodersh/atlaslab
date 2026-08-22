import type { Metadata } from 'next'

// 앱 내부 자동 생성 페이지(스토리 100편 + 목록/진도 화면) — 색인 제외.
// follow: true 로 두어 크롤러가 내부 링크는 계속 따라가게 한다.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default function StoriesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
