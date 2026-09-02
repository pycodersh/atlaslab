import { YouTube } from './YouTube'

/**
 * 블로그 본문(MDX)에서 쓸 수 있는 컴포넌트 목록.
 *
 * 글 상세 라우트가 두 개([app]/[slug], patto/[slug])라서, 한쪽에만 추가되는
 * 사고를 막으려고 여기 한 곳에서만 정의하고 양쪽이 이걸 가져다 쓴다.
 * 새 컴포넌트는 여기에 추가할 것.
 */
export const blogMdxComponents = { YouTube }
