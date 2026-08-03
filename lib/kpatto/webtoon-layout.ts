/**
 * webtoon-layout.ts — 에디터와 리뷰가 공유하는 레이아웃 계산
 *
 * EP01-30: 레거시 — gap 높이는 heightRatio 비례, 패널은 원본 폭
 * EP31+  : singleColumn — gap 높이 heightRatio 비례, 패널은 73% 중앙 정렬
 */

/** EP31 이상이면 singleColumn 레이아웃 사용 */
export function isSingleColumn(episodeNum: number): boolean {
  return episodeNum >= 31
}

/**
 * gap 컨테이너 스타일
 * - singleColumn: fixedHeightPx 있으면 고정, 없으면 heightRatio 비례 (paddingBottom trick)
 * - 레거시     : heightRatio 비례 (paddingBottom trick)
 */
export function gapContainerStyle(
  heightRatio: number,
  hasBubbles: boolean,
  singleColumn: boolean,
  fixedHeightPx?: number,
): React.CSSProperties {
  if (singleColumn) {
    if (fixedHeightPx !== undefined) return { height: fixedHeightPx }
    return { paddingBottom: `${heightRatio * 100}%` }
  }
  return { paddingBottom: `${heightRatio * 100}%` }
}

/**
 * 패널 이미지 폭
 * - singleColumn: 73%
 * - 레거시 wide : 100%
 * - 레거시 기타 : 78%
 */
export function panelImageWidth(layout: string, singleColumn: boolean): string {
  if (singleColumn) return '73%'
  return layout === 'wide' ? '100%' : '78%'
}

/**
 * 패널 정렬
 * - singleColumn: 항상 center
 * - 레거시      : layout 값으로 결정
 */
export function panelJustify(
  layout: string,
  singleColumn: boolean,
): 'center' | 'flex-start' | 'flex-end' {
  if (singleColumn) return 'center'
  if (layout === 'wide') return 'center'
  if (layout === 'medium-right') return 'flex-end'
  return 'flex-start'
}
