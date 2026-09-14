/**
 * 블로그 본문(.blog-prose) 스타일 — 글 상세 라우트 두 곳의 단일 출처.
 *
 * /blog/[locale]/[app]/[slug] 와 /blog/[locale]/patto/[slug] 가 같은 문자열을
 * 쓴다. 예전에는 두 파일에 같은 CSS 가 복사돼 있어 한쪽만 고쳐질 위험이 있었다.
 *
 * bodyFont 는 locale 에 따라 달라져서(한국어는 맑은 고딕 계열) 인자로 받는다.
 */

const SERIF = '"Playfair Display", Georgia, serif'
const BODY = '"DM Sans", "Inter", system-ui, sans-serif'

export function proseCss(bodyFont: string): string {
  return `
        .blog-prose { padding-top: 36px; padding-bottom: 8px; font-family: ${bodyFont}; }

        /* 제목 위계 — h2 는 아래 가는 선으로 구간을 끊어준다.
           선과 첫 문단 사이가 좁아 답답해서 아래 여백을 22px 로 띄웠다(56:22). */
        .blog-prose h2 {
          font-family: ${SERIF}; font-size: 26px; font-weight: 700;
          color: #111; margin: 56px 0 22px;
          padding-bottom: 8px; border-bottom: 1px solid #E5E1DC;
          letter-spacing: -0.01em; line-height: 1.3;
        }
        .blog-prose h3 {
          font-family: ${BODY}; font-size: 19px; font-weight: 700;
          color: #222; margin: 32px 0 10px; line-height: 1.35;
        }

        /* 본문 */
        .blog-prose p {
          font-size: 16px; line-height: 1.8; color: #444; margin: 0 0 20px;
        }
        .blog-prose strong { font-weight: 700; color: #111; }
        .blog-prose em { font-style: italic; color: #555; }

        /* 목록 — 문단보다 여백을 넓게 주고 왼쪽으로 살짝 들여쓴다 */
        .blog-prose ul, .blog-prose ol {
          margin: 24px 0 24px 8px; padding-left: 24px;
        }
        .blog-prose li {
          font-size: 16px; line-height: 1.8; color: #444; margin-bottom: 10px;
        }
        .blog-prose li:last-child { margin-bottom: 0; }
        .blog-prose li::marker { color: #C8102E; }

        /* 한국어 예시·회화 콜아웃.
           본문 인용문(>)은 대부분 "한국어 — 영어 번역" 형태의 예시라,
           단순 인용이 아니라 눈에 띄는 콜아웃으로 처리한다. */
        .blog-prose blockquote {
          background: #F8F8F6;
          border-left: 3px solid #C8102E;
          padding: 0.75rem 1rem;
          margin: 1.25rem 0;
        }
        .blog-prose blockquote p {
          margin: 0;
          /* 원문은 "> 줄1 / > 줄2" 여러 줄인데 마크다운이 한 문단으로 합쳐서
             대화가 한 줄로 이어져 버린다. pre-line 으로 줄바꿈만 되살린다. */
          white-space: pre-line;
          font-style: normal;
          font-weight: 500;
          color: #333;
        }
        .blog-prose blockquote p + p { margin-top: 10px; }
        /* 화자 라벨(**You:**)과 강조된 조사는 조금 더 진하게 */
        .blog-prose blockquote strong { font-weight: 600; color: #111; }
        /* 이탤릭으로 적힌 번역 줄은 본문보다 흐리게 */
        .blog-prose blockquote em { font-style: italic; font-weight: 400; color: #666; }
        .blog-prose code {
          font-size: 13px; background: #F0EADF; color: #C8102E;
          border-radius: 4px; padding: 2px 6px;
          font-family: "Courier New", monospace;
        }
        .blog-prose pre {
          background: #1a1a1a; border-radius: 8px;
          padding: 20px; overflow-x: auto; margin: 0 0 24px;
        }
        .blog-prose pre code { background: none; padding: 0; color: rgba(255,255,255,0.85); }
        .blog-prose a { color: #C8102E; text-decoration: underline; text-underline-offset: 3px; }
        .blog-prose a:hover { color: #A30D25; }
        .blog-prose hr { border: none; border-top: 1px solid #E5E1DC; margin: 32px 0; }

        /* 표 — 기존 스타일 유지 */
        .blog-prose table {
          width: 100%; border-collapse: collapse; margin: 24px 0;
          font-size: 14px; display: block; overflow-x: auto;
        }
        .blog-prose th, .blog-prose td {
          padding: 10px 16px; text-align: left; border: 1px solid #E5E1DC;
        }
        .blog-prose th {
          background: #F0EADF; font-weight: 700;
          font-size: 13px; letter-spacing: 0.02em; color: #111;
        }
        .blog-prose tr:nth-child(even) td { background: #F5F3F0; }

        .blog-prose * { font-family: inherit; }
        /* ::marker 는 font-family: inherit 대상이 아니므로 위 규칙이 색을 덮지 않는다 */
`
}
