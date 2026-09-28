import type { Metadata } from 'next'
import KPattoHomePage from './home/page'
import { WelcomeOverlay } from '@/components/kpatto/WelcomeOverlay'

const CANONICAL = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'}/kpatto`

export const metadata: Metadata = {
  alternates: { canonical: CANONICAL },
  openGraph:  { url: CANONICAL },
  // TEMP(AdSense review): 서버 HTML 이 12단어 수준이라 심사 기간에만 색인 제외.
  // 승인 후 이 줄을 지우고 app/sitemap.ts 의 INDEX_KPATTO_LANDING 을 true 로 되돌린다.
  // robots.txt 는 /kpatto 를 막지 않는다 — 막으면 크롤러가 noindex 를 읽지 못한다.
  robots: { index: false, follow: true },
}

export default function KPattoPage() {
  return (
    <>
      <KPattoHomePage />
      <WelcomeOverlay />
    </>
  )
}
