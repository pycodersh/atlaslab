import type { Metadata } from 'next'

/**
 * 색인 제외(내부 링크는 계속 따라가게 둔다).
 * 앱 내부 화면처럼 검색 결과에 노출할 가치가 없는 라우트의 layout 에서 쓴다.
 * page.tsx 가 'use client' 이면 metadata 를 내보낼 수 없어 layout 을 통해 적용한다.
 */
export const NOINDEX_FOLLOW: Metadata = { robots: { index: false, follow: true } }
