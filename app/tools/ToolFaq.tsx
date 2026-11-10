export type FaqItem = { q: string; a: string }

/**
 * 도구 페이지 맨 아래 FAQ — 위젯 밑, 스크롤해야 보이는 자리에 둔다.
 * 같은 내용을 FAQPage 구조화 데이터로도 낸다(검색 결과용).
 */
export function ToolFaq({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }
  return (
    <section className="tl-faq" aria-labelledby="tl-faq-title">
      <style>{`
        .tl-faq { margin-top: 40px; padding-top: 24px; border-top: 1px solid #E5E7EB; }
        .tl-faq h2 { margin: 0 0 4px; font-size: 16px; font-weight: 700; color: #111827; }
        .tl-faq dl { margin: 0; }
        .tl-faq dt { margin-top: 16px; font-size: 14px; font-weight: 600; line-height: 1.5; color: #1F2937; }
        .tl-faq dd { margin: 4px 0 0; font-size: 14px; line-height: 1.6; color: #4B5563; }
      `}</style>
      <h2 id="tl-faq-title">Frequently asked questions</h2>
      <dl>
        {items.map(({ q, a }) => (
          <div key={q}>
            <dt>{q}</dt>
            <dd>{a}</dd>
          </div>
        ))}
      </dl>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </section>
  )
}
