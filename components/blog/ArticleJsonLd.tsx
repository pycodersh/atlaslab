import { extractFaq } from '@/lib/blog/faq'
import { tabLabel } from '@/lib/blog/sections'
import { SITE_URL, SITE_NAME, breadcrumbJsonLd } from '@/lib/seo/site'

/**
 * 글 상세의 구조화 데이터(Schema.org). 화면에는 아무것도 그리지 않는다.
 *   Article       — 제목 · 설명 · 발행일 · 대표 이미지 · 발행 주체
 *   BreadcrumbList — Home › Articles › 탭(Phrases · Basics · Explore Korea · Food · Life) › 글
 *   FAQPage       — content 를 주면 본문의 'Frequently Asked Questions' 섹션에서(lib/blog/faq)
 * 본문 위에는 발행일을 보여 주지 않지만(에버그린 콘텐츠), 검색엔진용 datePublished 는 여기에 둔다.
 */
export function ArticleJsonLd({
  headline,
  description,
  datePublished,
  url,
  content,
  image,
  group,
}: {
  headline: string
  description?: string | null
  datePublished: string
  url: string
  content?: string | null
  /** 공유 이미지와 같은 대표 이미지(상대 경로면 사이트 주소를 붙인다) */
  image?: string
  /** 글이 속한 탭(lib/blog/sections 의 그룹 key). 없으면 빵부스러기에서 탭 단계를 뺀다 */
  group?: string | null
}) {
  const abs = (u: string) => (u.startsWith('http') ? u : `${SITE_URL}${u}`)
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    ...(description ? { description } : {}),
    ...(image ? { image: [abs(image)] } : {}),
    datePublished: new Date(datePublished).toISOString(),
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/apple-touch-icon.png` } },
  }
  const crumbs = breadcrumbJsonLd([
    { name: 'Home', url: SITE_URL },
    { name: 'Articles', url: `${SITE_URL}/blog` },
    ...(group ? [{ name: tabLabel(group), url: `${SITE_URL}/blog?tab=${group}` }] : []),
    { name: headline, url },
  ])
  const faq = extractFaq(content)
  const faqJson = faq && {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }
  // </script> 로 끊기는 걸 막으려고 < 를 이스케이프한다
  const ld = (o: object) => ({ __html: JSON.stringify(o).replace(/</g, '\\u003c') })
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(json)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(crumbs)} />
      {faqJson && <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqJson)} />}
    </>
  )
}
