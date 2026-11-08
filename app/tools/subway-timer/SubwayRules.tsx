/** 재승차 조건 카드와 출처 — 도구 페이지와 /tools 허브가 함께 쓴다 */
export function SubwayRules() {
  return (
    <>
    <style>{`
      .st-rules { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin-bottom: 20px; }
      .st-rule { border-radius: 16px; padding: 20px; }
      .st-rule.is-yes { background: rgba(236,253,245,.6); border: 1px solid #A7F3D0; }
      .st-rule.is-no { background: rgba(255,251,235,.6); border: 1px solid #FDE68A; }
      .st-rule h2 { font-size: 15px; font-weight: 700; color: #111827; margin: 0 0 12px; }
      .st-rule ul { list-style: none; margin: 0; padding: 0; }
      .st-rule li { display: flex; gap: 8px; font-size: 14px; line-height: 1.5; color: #1F2937; }
      .st-rule li + li { margin-top: 8px; }
      .st-mark { flex: none; width: 16px; font-weight: 700; }
      .is-yes .st-mark { color: #047857; }
      .is-no .st-mark { color: #B45309; }
      .st-solution { font-size: 14px; line-height: 1.5; font-style: italic; color: #1F2937; margin: 12px 0 0; padding-top: 12px; border-top: 1px solid #FDE68A; }
      @media (min-width: 640px) { .st-rules { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    `}</style>
    <div className="st-rules">
      <section className="st-rule is-yes">
        <h2>Free Re-entry Applies</h2>
        <ul>
          <li><span className="st-mark" aria-hidden="true">✓</span>Same station &amp; same line</li>
          <li><span className="st-mark" aria-hidden="true">✓</span>Within 15 minutes</li>
          <li><span className="st-mark" aria-hidden="true">✓</span>T-Money / Transit card only (Once per trip)</li>
        </ul>
      </section>
      <section className="st-rule is-no">
        <h2>Not Covered / Need Help</h2>
        <ul>
          <li><span className="st-mark" aria-hidden="true">✕</span>Single-journey paper tickets &amp; passes</li>
          {/* 경전철 전체가 아니다 — 우이신설선 · 신림선은 서울시 재승차 대상으로 보도됐다 */}
          <li><span className="st-mark" aria-hidden="true">✕</span>AREX, Shinbundang, Incheon Lines, some light rails (Gimpo, Uijeongbu, Yongin)</li>
          <li><span className="st-mark" aria-hidden="true">✕</span>Line 7 between Kkachiul and Seoknam</li>
        </ul>
        <p className="st-solution">💡 Solution: Press the &apos;Help&apos; bell button on the gate for staff assistance.</p>
      </section>
    </div>

    <p className="tl-note">
      This timer is a guide only. The gate system&apos;s clock decides, so leave yourself a margin. Use the same gate if you can.
      Re-entry is processed as a transfer, which waives the ₩1,550 base fare (first 10 km); official notices don&apos;t say how
      any extra distance fare is handled. Tapped in at the wrong gate but never tapped out? Official notices don&apos;t cover this, so ask the staff. Korail lines joined on June 20, 2026; Seoul Metro lines moved to 15 minutes on October 7, 2023.
      Sources: <a href="https://www.korea.kr/news/policyNewsView.do?newsId=148966539" rel="noopener noreferrer" target="_blank">Korea.kr (June 15, 2026)</a>,{' '}
      <a href="https://www.koreajoongangdaily.com/korea/less-running-to-toilet-as-seoul-lengthens-free-subway-reentry-time/11290623" rel="noopener noreferrer" target="_blank">Korea JoongAng Daily (Sept. 25, 2023)</a>.
    </p>
    </>
  )
}
