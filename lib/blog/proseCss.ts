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

        /* ── 타이포 스케일 (모바일 기본 → 768px 이상에서 한 단 키운다) ──
           본문 16/1.75 → 18/1.8, h2 24 → 30, h3 20 → 22.
           px 로 적는 이유: 이 CSS 는 <style> 로 주입돼 rem 기준(루트 폰트)이
           페이지마다 달라질 여지가 있어, 실제 크기를 고정한다.
           모든 글이 같은 한 곳(.blog-prose)을 보므로 카테고리와 무관하게 같다. */
        .blog-prose h2 {
          font-family: ${SERIF}; font-size: 24px; font-weight: 700;
          color: #111; margin: 48px 0 20px;
          padding-bottom: 8px; border-bottom: 1px solid #E5E1DC;
          letter-spacing: -0.01em; line-height: 1.3;
        }
        .blog-prose h3 {
          font-family: ${BODY}; font-size: 20px; font-weight: 600;
          color: #222; margin: 30px 0 10px; line-height: 1.35;
        }

        /* 본문 — 색은 #444 대신 slate-700(#334155). 같은 크기라도 대비가 올라가
           글자가 덜 얇아 보인다("PC에서 얇다"는 지적의 절반은 대비 문제였다). */
        .blog-prose p {
          font-size: 16px; line-height: 1.75; color: #334155; margin: 0 0 20px;
        }

        @media (min-width: 768px) {
          .blog-prose h2 { font-size: 30px; margin: 64px 0 24px; }
          .blog-prose h3 { font-size: 22px; margin: 34px 0 12px; }
          /* 에디토리얼 기준 본문 20px — Medium·Substack 대역 */
          .blog-prose p  { font-size: 20px; line-height: 1.8; margin-bottom: 26px; }
        }
        .blog-prose strong { font-weight: 700; color: #111; }
        .blog-prose em { font-style: italic; color: #555; }

        /* 목록 — 문단보다 여백을 넓게 주고 왼쪽으로 살짝 들여쓴다 */
        .blog-prose ul, .blog-prose ol {
          margin: 24px 0 24px 8px; padding-left: 24px;
        }
        .blog-prose li {
          font-size: 16px; line-height: 1.75; color: #334155; margin-bottom: 10px;
        }
        .blog-prose li:last-child { margin-bottom: 0; }
        .blog-prose li::marker { color: #C8102E; }
        @media (min-width: 768px) {
          .blog-prose li { font-size: 20px; line-height: 1.8; margin-bottom: 14px; }
          .blog-prose ul, .blog-prose ol { margin: 28px 0 28px 8px; }
        }

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
          /* 본문보다 한 단 작게 — 인용·예시라는 것이 크기로도 드러난다 */
          font-size: 15.5px; line-height: 1.7;
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
        @media (min-width: 768px) {
          .blog-prose blockquote { padding: 1rem 1.25rem; margin: 1.5rem 0; }
          /* 본문(20px)보다 한 단 작게 유지 — 인용이라는 것이 크기로 드러난다 */
          .blog-prose blockquote p { font-size: 18px; line-height: 1.75; }
        }
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

        /* 표 — 본문보다 한 단 작게 유지한다(열이 많아 본문 크기로는 넘친다) */
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
        @media (min-width: 768px) {
          .blog-prose table { font-size: 16px; }
          .blog-prose th { font-size: 15px; }
          .blog-prose th, .blog-prose td { padding: 11px 16px; }
        }

        .blog-prose * { font-family: inherit; }
        /* ::marker 는 font-family: inherit 대상이 아니므로 위 규칙이 색을 덮지 않는다 */
`
}
