export type FaqItem = { q: string; a: string }

/**
 * 도구 페이지 맨 아래 FAQ — 접이식 아코디언(네이티브 <details> · <summary>, 자바스크립트 없음).
 * 첫 질문만 펼친 채로 시작한다. 닫힌 답도 HTML 에 그대로 있어 검색엔진이 읽는다.
 * 같은 내용을 FAQPage 구조화 데이터로도 낸다(검색 결과용).
 * 열고 닫을 때 높이 애니메이션은 ::details-content 를 지원하는 브라우저에서만 — 나머지는 바로 열린다.
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
        .tl-faq { margin-top: 40px; interpolate-size: allow-keywords; }
        .tl-faq h2 { margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #111827; }
        .tl-faq-list { background: #fff; border: 1px solid rgba(231,229,228,.9); border-radius: 12px; overflow: hidden; }
        .tl-faq-item + .tl-faq-item { border-top: 1px solid rgba(231,229,228,.8); }
        .tl-faq-q { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px;
          cursor: pointer; list-style: none; font-size: 14px; font-weight: 600; line-height: 1.5; color: #1C1917; }
        .tl-faq-q::-webkit-details-marker { display: none; }
        .tl-faq-q:hover { background: #FAFAF9; }
        .tl-faq-q:focus-visible { outline: 2px solid #C8102E; outline-offset: -2px; }
        .tl-faq-chev { flex: none; color: #A8A29E; transition: transform .2s ease; }
        .tl-faq-item[open] .tl-faq-chev { transform: rotate(180deg); }
        .tl-faq-a { margin: 0; padding: 0 16px 14px; font-size: 14px; line-height: 1.6; color: #57534E; }
        .tl-faq-item::details-content { height: 0; overflow: hidden; transition: height .2s ease, content-visibility .2s allow-discrete; }
        .tl-faq-item[open]::details-content { height: auto; }
        @media (prefers-reduced-motion: reduce) {
          .tl-faq-chev, .tl-faq-item::details-content { transition: none; }
        }
      `}</style>
      <h2 id="tl-faq-title">Frequently asked questions</h2>
      <div className="tl-faq-list">
        {items.map(({ q, a }, i) => (
          <details key={q} className="tl-faq-item" open={i === 0}>
            <summary className="tl-faq-q">
              <span>{q}</span>
              <svg className="tl-faq-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </summary>
            <p className="tl-faq-a">{a}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </section>
  )
}
