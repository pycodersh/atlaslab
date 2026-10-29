/**
 * 본문의 FAQ 섹션 → Schema.org FAQPage 용 문답.
 *
 * 원고 규칙(docs/CONTENT_GUIDELINES.md · scripts/generate-global-post.mjs 공통):
 *   ## Frequently Asked Questions   (또는 '## FAQ')
 *   **질문?**                        굵은 한 줄 또는 '### 질문?'
 *   답 문단(여러 줄 가능)
 * 다음 '## ' 머리글에서 섹션이 끝난다. 문답이 2개 미만이면 null — 화면에 없는 문답을 스키마에 넣지 않는다.
 */
export type FaqItem = { q: string; a: string }

const plain = (s: string) =>
  s
    .replace(/<[^>]+>/g, ' ')                 // JSX · HTML 태그
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')     // 이미지
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')  // 링크 → 글자
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

export function extractFaq(content: string | null | undefined): FaqItem[] | null {
  if (!content) return null
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const start = lines.findIndex(l => /^##\s+.*(Frequently Asked Questions|FAQ)/i.test(l))
  if (start === -1) return null
  let end = lines.findIndex((l, i) => i > start && /^##\s/.test(l))
  if (end === -1) end = lines.length

  const items: FaqItem[] = []
  let cur: { q: string; a: string[] } | null = null
  const flush = () => { if (cur && cur.a.length) items.push({ q: plain(cur.q), a: plain(cur.a.join(' ')) }) }
  for (const raw of lines.slice(start + 1, end)) {
    const line = raw.trim()
    const q = line.match(/^\*\*(.+?\?)\*\*$/) ?? line.match(/^###\s+(.+\?)\s*$/)
    if (q) { flush(); cur = { q: q[1], a: [] }; continue }
    if (cur && line) cur.a.push(line)
  }
  flush()
  return items.length >= 2 ? items.filter(i => i.q && i.a) : null
}
