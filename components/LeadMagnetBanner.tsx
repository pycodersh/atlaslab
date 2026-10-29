import { SAMPLE_PDF_URL, SAMPLE_PATTERNS, TRY_APP_PATH } from '@/lib/kpatto/purchase'

/**
 * 홈 리드 마그넷 — Why Atlas Lab 아래, 푸터 바로 위의 넓은 다크 카드.
 * 무료 10패턴 PDF(내려받기) + 웹툰 Ep.1(웹앱). 링크는 lib/kpatto/purchase 의 단일 출처를 쓴다.
 * 넓은 화면은 문구 왼쪽 · 버튼 오른쪽, 폰은 위아래로 쌓고 버튼이 폭 전체를 쓴다.
 */
export function LeadMagnetBanner() {
  return (
    <section className="lmag" aria-labelledby="lmag-title">
      <style>{`
        .lmag { padding: 0 0 72px; }
        .lmag-card {
          /* 홈 .wrap(1060px - 좌우 40px)의 본문 폭과 맞춘다 — 위 Why 섹션과 좌우 끝이 같은 선에 선다 */
          max-width: 980px; margin: 0 auto; box-sizing: border-box;
          background: #121212; color: #fff; border-radius: 10px;
          padding: 36px 40px; display: flex; align-items: center; justify-content: space-between; gap: 32px;
          border-top: 3px solid var(--brand-red, #C8102E);
        }
        .lmag-wrap { padding: 0 40px; }
        .lmag-eyebrow {
          font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: .16em; text-transform: uppercase; color: #FF5A6E; margin: 0 0 10px;
        }
        .lmag-title {
          font-family: "Playfair Display", Georgia, serif; font-size: clamp(22px, 2.6vw, 30px);
          font-weight: 700; line-height: 1.2; letter-spacing: -0.01em; color: #fff; margin: 0 0 10px;
        }
        .lmag-desc {
          font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 15px; line-height: 1.6;
          color: rgba(255,255,255,0.68); margin: 0; max-width: 560px;
        }
        .lmag-btns { display: flex; flex-direction: column; gap: 10px; flex: 0 0 260px; }
        .lmag-btn {
          display: flex; align-items: center; justify-content: center; min-height: 48px; padding: 12px 20px;
          font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 14px; font-weight: 700; letter-spacing: .02em;
          text-decoration: none; border-radius: 6px; box-sizing: border-box; text-align: center;
          transition: background .15s, color .15s, border-color .15s;
          -webkit-tap-highlight-color: transparent;
        }
        .lmag-btn-primary { background: var(--brand-red, #C8102E); color: #fff; border: 1.5px solid var(--brand-red, #C8102E); }
        .lmag-btn-ghost { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,0.7); }
        @media (hover: hover) {
          .lmag-btn-primary:hover { background: var(--brand-red-dark, #A30D25); border-color: var(--brand-red-dark, #A30D25); }
          .lmag-btn-ghost:hover { background: #fff; color: #111; border-color: #fff; }
        }
        @media (max-width: 767px) {
          .lmag { padding-bottom: 48px; }
          .lmag-wrap { padding: 0 20px; }
          .lmag-card { flex-direction: column; align-items: stretch; padding: 26px 20px 22px; gap: 20px; }
          .lmag-btns { flex: 0 0 auto; }
          .lmag-desc { font-size: 14.5px; }
        }
      `}</style>
      <div className="lmag-wrap">
        <div className="lmag-card">
          <div>
            <p className="lmag-eyebrow notranslate" translate="no">Free from K-Patto</p>
            <h2 id="lmag-title" className="lmag-title">Master Real-Life Korean Before You Land in Seoul</h2>
            <p className="lmag-desc">
              Get our curated {SAMPLE_PATTERNS}-Pattern Study Guide (PDF + Audio) and read bite-sized webtoon episodes for free.
            </p>
          </div>
          <div className="lmag-btns">
            <a href={SAMPLE_PDF_URL} download className="lmag-btn lmag-btn-primary">Download Free PDF Guide</a>
            <a href={TRY_APP_PATH} className="lmag-btn lmag-btn-ghost">Read Webtoon Ep. 1</a>
          </div>
        </div>
      </div>
    </section>
  )
}
