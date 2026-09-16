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

        /* ── 타이포 스케일 — blog.atlaslabstudios.com(INSIGHTS) 규격에 맞춘다.
           그쪽 본문을 1280px 에서 실측한 값: p 16px/1.85, h2 26px(여백 56/18),
           blockquote 좌측 3px 실선·투명 배경, 본문 폭 680px.
           여기서는 본문 줄간격만 1.7 로 조금 좁혀 더 조밀하게 간다.
           px 로 적는 이유: 이 CSS 는 <style> 로 주입돼 rem 기준(루트 폰트)이
           페이지마다 달라질 여지가 있어, 실제 크기를 고정한다.
           모든 글이 같은 한 곳(.blog-prose)을 보므로 카테고리와 무관하게 같다. */
        .blog-prose h2 {
          font-family: ${SERIF}; font-size: 22px; font-weight: 700;
          color: #111; margin: 44px 0 16px;
          padding-bottom: 8px; border-bottom: 1px solid #E5E1DC;
          letter-spacing: -0.01em; line-height: 1.3;
        }
        .blog-prose h3 {
          font-family: ${BODY}; font-size: 19px; font-weight: 600;
          color: #222; margin: 28px 0 10px; line-height: 1.35;
        }

        /* 본문 — 크기는 모바일·PC 동일(16px). 색은 slate-700 으로 대비를 준다. */
        .blog-prose p {
          font-size: 16px; line-height: 1.7; color: #334155; margin: 0 0 20px;
        }

        @media (min-width: 768px) {
          .blog-prose h2 { font-size: 26px; margin: 50px 0 18px; }
          .blog-prose h3 { font-size: 20px; margin: 32px 0 10px; }
        }
        .blog-prose strong { font-weight: 700; color: #111; }
        .blog-prose em { font-style: italic; color: #555; }

        /* 목록 — ★ list-style-type 을 직접 켜야 점이 보인다.
           Tailwind Preflight 에 "ol, ul, menu { list-style: none }" 이 있어서,
           여기서 disc/decimal 을 다시 지정하기 전까지는 ::marker 자체가
           만들어지지 않았다(그래서 마커 색 규칙도 아무 일을 하지 않았다). */
        .blog-prose ul, .blog-prose ol {
          margin: 16px 0; padding-left: 20px;   /* ml-5 */
          list-style-position: outside;
        }
        .blog-prose ul { list-style-type: disc; }
        .blog-prose ol { list-style-type: decimal; }
        .blog-prose li {
          /* 본문과 같은 16px, 색만 한 단 진하게(slate-800) */
          font-size: 16px; line-height: 1.7; color: #1E293B; margin-bottom: 8px;
        }
        .blog-prose li:last-child { margin-bottom: 0; }
        .blog-prose li::marker { color: #1E293B; }

        /* 한국어 예시·회화 콜아웃.
           블로그 INSIGHTS 와 같은 모양으로 맞춘다 — 배경 없이 좌측 3px 실선,
           슬레이트 계열(#1E293B). 예전의 레드 보더 + 베이지 배경은 걷어냈다. */
        .blog-prose blockquote {
          background: transparent;
          border-left: 3px solid #1E293B;
          padding: 4px 0 4px 24px;
          margin: 24px 0;
        }
        .blog-prose blockquote p {
          margin: 0;
          font-size: 16px; line-height: 1.7;
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
          .blog-prose blockquote p { font-size: 17px; line-height: 1.75; }
        }

        /* 경고·공지 콜아웃 — components/blog/Blockquote.tsx 가 머리말을 보고
           클래스를 붙인다("**Critical Warning:** …" 처럼 머리말 + 콜론).
           예문 인용구는 위의 단정한 기본 스타일 그대로 둔다. */
        .blog-prose blockquote.is-callout-warn {
          background: #FFF1F2;                 /* rose-50 */
          border-left-color: #F43F5E;          /* rose-500 */
          padding: 14px 18px 14px 20px;
          border-radius: 0 4px 4px 0;
        }
        .blog-prose blockquote.is-callout-warn p { color: #1F2937; }
        /* 머리말(**Critical Warning:**)은 로즈 계열로 한 번 더 집어준다 */
        .blog-prose blockquote.is-callout-warn strong { color: #9F1239; }
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
