import { YouTube } from './YouTube'
import { Instagram } from './Instagram'
import { ReelVideo } from './ReelVideo'
import { Blockquote } from './Blockquote'
import { NoTranslateCode, NoTranslatePre, KoreanTd, KoreanTh, KoreanStrong, KoreanEm } from './NoTranslate'
import { KeyTakeaways, Dialogue, Line, DoDont, Do, Dont, Callout, KpattoCta } from './ArticleBlocks'
import { GrammarCheatCard, RuleCard, RuleAvoid, RuleInstead, RuleExample } from './GrammarCheatCard'
import { KoreanBasicPlayer, DangerPronounsPlayer } from './KoreanBasicPlayer'
import { StayMap } from './StayMap'
import { BookingCta } from './BookingCta'
import { createElement, Fragment, type JSX, type ReactNode } from 'react'

function LegacyPlainText({ children }: { children?: ReactNode }): JSX.Element {
  return createElement(Fragment, null, children)
}

/**
 * 블로그 본문(MDX)에서 쓸 수 있는 컴포넌트 목록.
 *
 * 글 상세 라우트가 두 개([app]/[slug], patto/[slug])라서, 한쪽에만 추가되는
 * 사고를 막으려고 여기 한 곳에서만 정의하고 양쪽이 이걸 가져다 쓴다.
 * 새 컴포넌트는 여기에 추가할 것.
 */
/** blockquote 는 HTML 태그를 가로채는 것이라 원고를 고치지 않아도 적용된다 */
/** code·pre 는 자동 번역(헤더 언어 선택)에서 제외한다. 표 칸 · 굵게 · 기울임도 한국어가 들어 있으면 제외한다(예문이 망가지지 않게) */
/** KeyTakeaways · Dialogue · Line · DoDont · Do · Dont · Callout · KpattoCta — Food · Life 시각 블록(docs/CONTENT_GUIDELINES.md) */
/** GrammarCheatCard — Basics '너 vs 당신' 글 전용 요약 인포그래픽. RuleCard · RuleAvoid · RuleInstead · RuleExample — 같은 카드의 조립형(다른 Basics 글) */
export const blogMdxComponents = {
  YouTube, Instagram, ReelVideo, blockquote: Blockquote, code: NoTranslateCode, pre: NoTranslatePre,
  td: KoreanTd, th: KoreanTh, strong: KoreanStrong, em: KoreanEm,
  KeyTakeaways, Dialogue, Line, DoDont, Do, Dont, Callout, KpattoCta,
  GrammarCheatCard, RuleCard, RuleAvoid, RuleInstead, RuleExample,
  /** KoreanBasicVideo slug="..." — Basics 글 상단 12초 Remotion 쇼트(remotion/KoreanBasic/videos.json). DangerPronounsVideo 는 '너 vs 당신' 글의 첫 태그 */
  KoreanBasicVideo: KoreanBasicPlayer,
  DangerPronounsVideo: DangerPronounsPlayer,
  /** StayMap id="..." — 숙소 글 상단 지도(lib/blog/stay-maps.generated.json — scripts/make-stay-maps.mjs). BookingCta hotel="..." — 숙소 글 끝 예약 버튼(lib/blog/bookingLinks) */
  StayMap, BookingCta,
  /** 임시: 제휴 링크를 걷어낸 옛 태그 — 링크 없이 안쪽 글자만 낸다. 원고 · DB 에서는 이미 지웠지만
   *  글 fetch 캐시(revalidate 하루)가 옛 본문을 하루 동안 돌려줄 수 있어, 그동안 빌드가 깨지지 않게 둔다.
   *  2026-11-06 이후 지울 것 */
  AiraloLink: LegacyPlainText,
}
