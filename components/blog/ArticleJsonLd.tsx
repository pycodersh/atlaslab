import { extractFaq } from '@/lib/blog/faq'

/**
 * 글 상세의 구조화 데이터(Schema.org Article). 화면에는 아무것도 그리지 않는다.
 * 본문 위에는 발행일을 보여 주지 않지만(에버그린 콘텐츠), 검색엔진용 datePublished 는 여기에 둔다.
 * content 를 주면 본문의 'Frequently Asked Questions' 섹션을 FAQPage 로도 낸다(lib/blog/faq).
 */
export function ArticleJsonLd({
  headline,
  description,
  datePublished,
  url,
  content,
}: {
  headline: string
  description?: string | null
  datePublished: string
  url: string
  content?: string | null
}) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    ...(description ? { description } : {}),
    datePublished: new Date(datePublished).toISOString(),
    mainEntityOfPage: url,
  }
  const faq = extractFaq(content)
  const faqJson = faq && {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }
  return (
    <>
      <script
        type="application/ld+json"
        // </script> 로 끊기는 걸 막으려고 < 를 이스케이프한다
        dangerouslySetInnerHTML={{ __html: JSON.stringify(json).replace(/</g, '\\u003c') }}
      />
      {faqJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson).replace(/</g, '\\u003c') }}
        />
      )}
    </>
  )
}
