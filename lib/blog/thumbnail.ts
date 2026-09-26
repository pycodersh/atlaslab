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
  /** alt 를 따로 주지 않으면 카드가 글 제목을 쓴다 */
  | { kind: 'image'; src: string; alt?: string }

const YOUTUBE_TAG_RE = /<YouTube\s+([^>]*?)\/>/
/** ![alt](url "title") — url 만 잡고 선택적 title 은 버린다 */
const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\(\s*(\S+?)\s*(?:"[^"]*")?\)/

/** slug → 대표 이미지. 파일은 public/images/articles/ 에 있다.
 *  문자열이면 alt 는 글 제목을 쓰고, 객체로 주면 그 alt 를 쓴다. */
type Cover = string | { src: string; alt: string }

const COVER_BY_SLUG: Record<string, Cover> = {
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
  'how-to-order-at-a-korean-cafe': '/images/articles/korean-cafe-order.jpg',
  'seeing-a-doctor-in-korea': '/images/articles/korean-clinic-doctor.jpg',
  'buying-clothes-in-korean': '/images/articles/korean-clothes-shopping.jpg',
  'ordering-food-delivery-in-korea': '/images/articles/korean-food-delivery.jpg',
  'visiting-a-korean-palace-phrases': '/images/articles/korean-palace-gyeongbokgung.jpg',

  // Life in Korea — alt 를 따로 지정한다
  'korean-internet-slang-guide': {
    src: '/images/articles/korean-internet-slang.jpg',
    alt: 'Close-up of hands typing Korean internet slang on smartphone',
  },
  'korean-new-year-seollal-explained': {
    src: '/images/articles/seollal-tteokguk.jpg',
    alt: 'Traditional Korean Tteokguk rice cake soup for Seollal',
  },
  'nunchi-korean-reading-the-room': {
    src: '/images/articles/nunchi-cafe-terrace.jpg',
    alt: 'People interacting and reading the room in a Korean cafe terrace',
  },
  'korean-age-system-explained': {
    src: '/images/articles/korean-age-calendar.jpg',
    alt: 'January calendar and desk setup representing Korean age system',
  },
  'konglish-words-when-english-becomes-korean': {
    src: '/images/articles/konglish-neon-signs.jpg',
    alt: 'Korean street signage and neon signs representing Konglish words',
  },
  // 표지를 지정하지 않으면 본문 첫 이미지(터미널 다이어그램)가 올라와,
  // 상세 상단과 1절 본문에 같은 그림이 두 번 나온다.
  'incheon-airport-survival-guide': {
    src: '/images/articles/incheon-airport.jpg',
    alt: 'Aerial view of Incheon International Airport terminals and runways',
  },
  'korean-cafe-laptop-safety-rules': {
    src: '/images/articles/korean-cafe-laptop-safety-rules.jpg',
    alt: 'Open laptop left on a glass table, as is common in Korean cafés',
  },
  'korean-restaurant-ordering-guide': {
    src: '/images/articles/korean-restaurant-ordering-guide.jpg',
    alt: 'Brass service bell on a restaurant table next to a glass and cutlery',
  },
  // 원본은 세로 사진이라 남산타워부터 간판까지 3:2 로 잘라 넣었다
  'korean-convenience-store-dining-guide': {
    src: '/images/articles/korean-convenience-store-dining-guide.jpg',
    alt: '7-Eleven convenience store sign in Seoul with N Seoul Tower behind',
  },
  // 원본이 세로 사진이라 상추쌈이 가운데 오도록 3:2 로 잘랐다
  'korean-ssambap-dining-guide': {
    src: '/images/articles/korean-ssambap-dining-guide.jpg',
    alt: 'Grilled pork belly with ssamjang on a lettuce leaf held in the palm',
  },
  'korean-bbq-fried-rice-guide': {
    src: '/images/articles/korean-bbq-fried-rice-guide.jpg',
    alt: 'Kimchi fried rice with melted cheese on a Korean BBQ grill plate',
  },
  // 실제 사진(TAXI.jpg)을 3:2 로 잘라 넣었다. 처음엔 그린 '빈차' 표시등이었다.
  'korea-taxi-survival-guide': {
    src: '/images/articles/korea-taxi-survival-guide.jpg',
    alt: 'Glowing orange TAXI roof sign on a car at night in Korea',
  },
  // Gemini 생성 이미지(03.png)의 클로즈업 컷. 받침대 위 Gemini 표식은 나뭇결을
  // 이어 붙여 지웠고, 두 컷이 붙은 원본에서 구분선을 피해 오른쪽 컷만 3:2 로 썼다.
  'galbijjim-vs-western-beef-stew': {
    src: '/images/articles/galbijjim-vs-western-beef-stew.jpg',
    alt: 'Close-up of Korean braised short ribs galbi-jjim with chestnuts, jujubes and carrots in a clay pot',
  },
  // 라이선스 사진을 걷어내고 Gemini 로 만든 이미지로 교체했다(01.png).
  // 오른쪽 아래 Gemini 표식은 나무 바닥 조각으로 덮어 지웠다.
  'korean-songpyeon-pine-needles-science': {
    src: '/images/articles/korean-songpyeon-pine-needles-science.jpg',
    alt: 'Songpyeon on a plate with pine needles, half-moon songpyeon and a bowl of mugwort and plain rice cakes',
  },
  // 실제 사진(01.jpg) — 원본은 암스테르담 역이라 역명·거리 간판이 보이는
  // 위쪽을 잘라내고 에스컬레이터·발권기 장면만 남겼다. 처음엔 그린 표지였다.
  'zero-tipping-split-bills-korea': {
    src: '/images/articles/zero-tipping-split-bills-korea.jpg',
    alt: 'A hand holding up a green wallet printed with the word NO against a plain wall',
  },
  'olive-young-instant-tax-refund-guide': {
    src: '/images/articles/olive-young-instant-tax-refund-guide.jpg',
    alt: 'Olive Young flagship store at dusk with illuminated signage and glass facade',
  },
  'late-night-medicine-korea-clinics-guide': {
    src: '/images/articles/late-night-medicine-korea-clinics-guide.jpg',
    alt: 'A red first aid kit with scissors, tweezers, cotton swabs and blister packs of tablets on a dark table',
  },
  'google-maps-alternatives-korea': {
    src: '/images/articles/google-maps-alternatives-korea.jpg',
    alt: 'Naver Map and Kakao Map logos',
  },
  'seoul-subway-transfer-transit-card-guide': {
    src: '/images/articles/seoul-subway-transfer-transit-card-guide.jpg',
    alt: 'People using a subway ticket machine at the bottom of an escalator',
  },
}

/** 카드에 쓸 썸네일. 대표 이미지가 있으면 그것을, 없으면 본문에서 뽑는다. */
export function thumbnailForPost(
  slug: string,
  content: string | null | undefined,
): BlogThumbnail | null {
  const cover = COVER_BY_SLUG[slug]
  if (cover) {
    return typeof cover === 'string'
      ? { kind: 'image', src: cover }
      : { kind: 'image', src: cover.src, alt: cover.alt }
  }
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
