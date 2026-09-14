/**
 * 카드 썸네일 추출 — 홈 섹션과 /blog 목록이 같은 함수를 쓴다.
 *
 * 우선순위
 *   1) 본문 첫 <YouTube id="..." /> 의 id  → 유튜브 썸네일
 *   2) 본문 첫 마크다운 이미지 ![](url)     → 그 이미지
 *   3) 둘 다 없으면 null → 카드에 이미지 영역을 만들지 않는다(자리표시자 금지)
 */

export type BlogThumbnail =
  | { kind: 'youtube'; videoId: string; portrait: boolean }
  | { kind: 'image'; src: string }

const YOUTUBE_TAG_RE = /<YouTube\s+([^>]*?)\/>/
/** ![alt](url "title") — url 만 잡고 선택적 title 은 버린다 */
const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\(\s*(\S+?)\s*(?:"[^"]*")?\)/

export function readThumbnail(content: string | null | undefined): BlogThumbnail | null {
  if (!content) return null

  // 1) 유튜브 임베드
  const attrs = content.match(YOUTUBE_TAG_RE)?.[1]
  if (attrs) {
    const videoId = attrs.match(/id="([A-Za-z0-9_-]+)"/)?.[1]
    if (videoId) {
      return {
        kind: 'youtube',
        videoId,
        // 중앙 크롭은 세로 쇼츠 전제라 가로 영상에 쓰면 3배 확대돼 버린다
        portrait: !/orientation="landscape"/.test(attrs),
      }
    }
  }

  // 2) 마크다운 이미지 (본문 이미지는 Supabase Storage 절대 URL 을 쓴다)
  const src = content.match(MARKDOWN_IMAGE_RE)?.[1]
  if (src && /^(https?:\/\/|\/)/.test(src)) return { kind: 'image', src }

  return null
}
