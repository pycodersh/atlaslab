import { NOINDEX_FOLLOW } from '@/lib/seo/noindex'

// TEMP(AdSense review): 무료 에피소드 kp-ep-001~010 임시 noindex.
// 서버 HTML 이 얇고(고유 title·본문 없음) 회차끼리 메타가 같아서 심사 기간에만 막는다.
// 승인 후 SSR 본문·회차별 메타를 보강하고 이 파일을 삭제한 뒤
// app/sitemap.ts 의 INDEX_FREE_EPISODES 를 true 로 되돌린다.
// robots.txt 는 이 경로를 막지 않는다 — 막으면 크롤러가 noindex 를 읽지 못한다.
export const metadata = NOINDEX_FOLLOW

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
