/** italki 제휴 링크 — ref 파라미터가 있어야 가입 · 수업이 수수료로 잡힌다 */
const ITALKI_HREF = 'https://www.italki.com/affshare?ref=af34196889'

/**
 * italki 어필리에이트 배너 — Phrases · Basics · Life 글 본문 바로 아래(앱 CTA · Klook · 관련 글 위).
 * 노출 그룹은 글 상세 라우트의 ITALKI_GROUPS 가 정한다(lib/blog/sections 의 그룹 key 기준 — DB category 문자열이 아니다).
 *
 * 본문과 같은 밝은 톤: 아이보리 카드 + 옅은 테두리, 넓은 화면은 카피 왼쪽 · 버튼 오른쪽, 폰은 세로로 쌓는다.
 * KlookBanner 처럼 스타일을 컴포넌트 안에 둔다(본문 .blog-prose 바깥에 놓이므로 prose 규칙의 영향을 받지 않는다).
 */
export function ItalkiBanner() {
  return (
    <aside className="itk-banner" aria-label="Sponsored">
      <style>{`
        .itk-banner {
          background: #FBFBFA;
          border: 1px solid rgba(229,229,229,.8);
          border-radius: 16px;
          box-shadow: 0 1px 2px rgba(0,0,0,.05);
          padding: 24px;
          margin: 48px 0;
        }
        .itk-row { display: flex; flex-direction: column; align-items: flex-start; justify-content: space-between; gap: 24px; }
        .itk-eyebrow { display: block; font-size: 11px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: #737373; margin: 0 0 8px; }
        .itk-title { font-size: 18px; font-weight: 600; line-height: 1.35; color: #171717; margin: 0; }
        .itk-desc { font-size: 14px; line-height: 1.6; color: #525252; margin: 4px 0 0; max-width: 576px; }
        .itk-btn {
          white-space: nowrap; display: inline-block;
          padding: 12px 20px; border-radius: 12px;
          background: #171717; color: #fff; text-decoration: none;
          font-size: 14px; font-weight: 500; line-height: 1.2;
          box-shadow: 0 1px 2px rgba(0,0,0,.05);
          transition: background .15s;
        }
        .itk-btn:hover { background: #262626; color: #fff; }
        .itk-btn:focus-visible { outline: 3px solid #C8102E; outline-offset: 2px; }
        .itk-note { display: block; font-size: 12px; color: #A3A3A3; margin: 12px 0 0; }
        @media (min-width: 640px) {
          .itk-banner { padding: 32px; }
          .itk-row { flex-direction: row; align-items: center; }
          .itk-title { font-size: 20px; }
        }
      `}</style>
      <div className="itk-row">
        <div>
          <span className="itk-eyebrow">Practice with natives</span>
          <p className="itk-title">Ready to speak Korean with confidence?</p>
          <p className="itk-desc">
            Practice real conversations 1-on-1 with friendly native tutors on italki. Get personalized feedback and start
            speaking from day one.
          </p>
        </div>
        <a href={ITALKI_HREF} target="_blank" rel="noopener noreferrer sponsored" className="itk-btn">
          Find a Korean Tutor →
        </a>
      </div>
      <span className="itk-note">*Partner offer. New learners may receive bonus lesson credits.</span>
    </aside>
  )
}
