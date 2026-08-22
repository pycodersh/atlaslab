import type { Metadata } from 'next'

// 앱 내부 자동 생성 목록 화면(저장 단어/표현 라이브러리) — 색인 제외.
// follow: true 로 두어 크롤러가 내부 링크는 계속 따라가게 한다.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default function LibraryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
