import { SAMPLE_PDF_URL, SAMPLE_PATTERNS, TRY_APP_PATH } from '@/lib/kpatto/purchase'

const BODY = '"DM Sans", "Inter", system-ui, sans-serif'
const RED = '#C8102E'

/**
 * K-Patto 공통 CTA 카드 — 블로그 어디에 놓이든 같은 모양(화이트 카드 + 레드 · 아웃라인 버튼 둘).
 *   - 본문 속 <KpattoCta /> (mid · end) — .blog-prose 안
 *   - 글 하단 ArticleAppBanner 의 K-Patto 카드(Phrases · Basics · Life · Explore) — .blog-prose 밖
 *
 * 스타일은 컴포넌트가 들고 다닌다. 본문 안에 놓일 때 .blog-prose p · a 규칙(특이도 0,1,1)에 덮이지 않도록
 * 선택자를 .kcta .kcta__* (0,2,0) 로 쓴다.
 *
 * 배치 — 카드 자체 폭으로 꺾는다(container query). 본문 칼럼이 680px 이라 카피 왼쪽 + 버튼 둘 오른쪽은
 * 카피 폭이 220px 안팎으로 줄어 4~5줄로 깨진다. 그래서
 *   카드 폭 < 640px   카피 아래 버튼 둘이 위아래로, 각각 가로 전체(폰)
 *   640px 이상        카피 아래 버튼 둘이 나란히
 *   760px 이상        카피 왼쪽 · 버튼 둘 오른쪽 나란히(본문보다 넓은 자리에 놓일 때)
 * 버튼 높이 48px 은 italki · Klook 배너와 같다.
 */
export function KpattoCtaCard({
  eyebrow = 'K-Patto',
  title,
  desc,
}: {
  eyebrow?: string
  title: string
  desc?: string
}) {
  return (
    <aside className="kcta" aria-label="K-Patto">
      <style>{`
        .kcta { container-type: inline-size; margin: 48px 0; font-family: ${BODY}; }
        .kcta .kcta__card {
          background: #fff; border: 1px solid #E7E5E4; border-radius: 16px;
          box-shadow: 0 1px 2px rgba(0,0,0,.04);
          padding: 24px;
          display: flex; flex-direction: column; gap: 20px;
        }
        .kcta .kcta__eyebrow { display: block; margin: 0 0 8px; font-size: 12px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: ${RED}; }
        .kcta .kcta__title { margin: 0; font-size: 19px; font-weight: 700; line-height: 1.35; color: #1C1917; }
        .kcta .kcta__desc { margin: 6px 0 0; font-size: 14.5px; line-height: 1.6; color: #57534E; }
        .kcta .kcta__btns { display: flex; flex-direction: column; gap: 10px; width: 100%; }
        .kcta .kcta__btn {
          display: flex; align-items: center; justify-content: center; white-space: nowrap;
          height: 48px; padding: 0 20px; box-sizing: border-box; border-radius: 12px;
          font-size: 14px; font-weight: 500; line-height: 1.2; text-decoration: none;
          transition: background-color .15s, border-color .15s;
        }
        .kcta .kcta__btn.is-primary { background: ${RED}; color: #fff; border: 1px solid ${RED}; }
        .kcta .kcta__btn.is-primary:hover { background: #A00D24; border-color: #A00D24; color: #fff; }
        .kcta .kcta__btn.is-secondary { background: #fff; color: #292524; border: 1px solid #D6D3D1; }
        .kcta .kcta__btn.is-secondary:hover { background: #F5F5F4; color: #292524; }
        .kcta .kcta__btn:focus-visible { outline: 3px solid #1C1917; outline-offset: 2px; }
        @container (min-width: 640px) {
          .kcta .kcta__card { padding: 28px; }
          .kcta .kcta__title { font-size: 20px; }
          .kcta .kcta__btns { flex-direction: row; }
          .kcta .kcta__btn { flex: 1 1 0; }
        }
        @container (min-width: 760px) {
          .kcta .kcta__card { flex-direction: row; align-items: center; justify-content: space-between; gap: 24px; }
          .kcta .kcta__btns { width: auto; flex-shrink: 0; gap: 12px; }
          .kcta .kcta__btn { flex: none; }
        }
      `}</style>
      <div className="kcta__card">
        <div>
          <span className="kcta__eyebrow" translate="no">{eyebrow}</span>
          <p className="kcta__title">{title}</p>
          {desc && <p className="kcta__desc">{desc}</p>}
        </div>
        <div className="kcta__btns">
          <a href={TRY_APP_PATH} className="kcta__btn is-primary">Read Webtoon Ep.1 Free →</a>
          <a href={SAMPLE_PDF_URL} className="kcta__btn is-secondary" download>
            Free {SAMPLE_PATTERNS}-Pattern PDF ↓
          </a>
        </div>
      </div>
    </aside>
  )
}
