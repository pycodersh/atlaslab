import { YouTube } from './YouTube'
import { Blockquote } from './Blockquote'
import { NoTranslateCode, NoTranslatePre } from './NoTranslate'
import { KeyTakeaways, Dialogue, Line, DoDont, Do, Dont, Callout, KpattoCta } from './ArticleBlocks'

/**
 * 블로그 본문(MDX)에서 쓸 수 있는 컴포넌트 목록.
 *
 * 글 상세 라우트가 두 개([app]/[slug], patto/[slug])라서, 한쪽에만 추가되는
 * 사고를 막으려고 여기 한 곳에서만 정의하고 양쪽이 이걸 가져다 쓴다.
 * 새 컴포넌트는 여기에 추가할 것.
 */
/** blockquote 는 HTML 태그를 가로채는 것이라 원고를 고치지 않아도 적용된다 */
/** code·pre 는 자동 번역(헤더 언어 선택)에서 제외한다 */
/** KeyTakeaways · Dialogue · Line · DoDont · Do · Dont · Callout · KpattoCta — Food · Life 시각 블록(docs/CONTENT_GUIDELINES.md) */
export const blogMdxComponents = {
  YouTube, blockquote: Blockquote, code: NoTranslateCode, pre: NoTranslatePre,
  KeyTakeaways, Dialogue, Line, DoDont, Do, Dont, Callout, KpattoCta,
}
