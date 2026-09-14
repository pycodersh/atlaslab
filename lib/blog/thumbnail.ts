/**
 * 카드 썸네일 — 홈 섹션과 /blog 목록이 같은 함수를 쓴다.
 *
 * 우선순위
 *   0) slug 에 지정된 대표 이미지(COVER_BY_SLUG)  → public/images/articles
 *   1) 본문 첫 <YouTube id="..." /> 의 id         → 유튜브 썸네일
 *   2) 본문 첫 마크다운 이미지 ![](url)            → 그 이미지
 *   3) 아무것도 없으면 null → 카드에 이미지 영역을 만들지 않는다(자리표시자 금지)
 *
 * 대표 이미지를 코드 쪽 맵에 두는 이유:
 * 이 블로그는 MDX 파일이 아니라 Supabase 의 blog_posts 행이고, frontmatter 도
 * thumbnail 컬럼도 없다. 본문에 이미지를 끼워 넣으면 글 내용이 바뀌므로,
 * "표지"만 따로 선언한다. 나중에 thumbnail 컬럼이 생기면 이 맵을 옮기면 된다.
 */

export type BlogThumbnail =
  | { kind: 'youtube'; videoId: string; portrait: boolean }
  | { kind: 'image'; src: string }

const YOUTUBE_TAG_RE = /<YouTube\s+([^>]*?)\/>/
/** ![alt](url "title") — url 만 잡고 선택적 title 은 버린다 */
const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\(\s*(\S+?)\s*(?:"[^"]*")?\)/

/** slug → 대표 이미지. 파일은 public/images/articles/ 에 있다. */
const COVER_BY_SLUG: Record<string, string> = {
  'korean-pharmacy-what-to-say': '/images/articles/korean-pharmacy.jpg',
  'asking-for-directions-in-korean': '/images/articles/ask-directions.jpg',
  'han-river-picnic-korean-phrases': '/images/articles/han-river-picnic.jpg',
  'k-beauty-store-korean-vocabulary': '/images/articles/olive-young-kbeauty.jpg',
  'shopping-at-a-korean-traditional-market': '/images/articles/traditional-market.jpg',
  'korean-noraebang-phrases': '/images/articles/korean-noraebang.jpg',
  'how-to-order-at-a-korean-restaurant': '/images/articles/order-korean-restaurant.jpg',
  'korean-convenience-store-phrases': '/images/articles/convenience-store-phrases.jpg',
  'ordering-korean-street-food': '/images/articles/street-food-bunsik.jpg',
  'korean-subway-phrases-first-trip': '/images/articles/seoul-subway-phrases.jpg',
}

/** 카드에 쓸 썸네일. 대표 이미지가 있으면 그것을, 없으면 본문에서 뽑는다. */
export function thumbnailForPost(
  slug: string,
  content: string | null | undefined,
): BlogThumbnail | null {
  const cover = COVER_BY_SLUG[slug]
  if (cover) return { kind: 'image', src: cover }
  return readThumbnail(content)
}

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
