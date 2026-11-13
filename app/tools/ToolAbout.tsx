import type { ReactNode } from 'react'

/**
 * 도구 페이지 'About this tool' — 위젯 바로 아래, Explore & Book 카드 위.
 * 예전의 FAQ 아코디언과 위젯 밑에 흩어져 있던 참고 문구를 이 블록 하나로 모았다(2026-11-13).
 *
 *   text  이 도구를 어떻게 쓰면 좋은지 2~3문장. 예전 FAQ 의 핵심(다루는 지역 · 쓰는 법 · 기준값)을 녹였다.
 *   note  참고 문구 한 단락(text-xs · stone-400). 그림 · 데이터 기준일 · 확인 안내 · 출처를 한데 모은다.
 *         WeatherAPI · ExchangeRate-API 처럼 이용 조건이 출처 표기를 요구하는 링크는 여기서 빼지 않는다.
 *
 * 라벨은 바로 아래 Explore & Book 제목(.wac-title)과 같은 모양 — 두 블록이 한 지면처럼 읽히게.
 * 글이 서버 HTML 에 그대로 들어가 검색엔진이 읽는다. FAQPage 구조화 데이터는 화면에 질문 · 답이 없어져서 내지 않는다.
 */
export function ToolAbout({ text, note, label = 'About this tool' }: { text: ReactNode; note?: ReactNode; label?: string }) {
  return (
    <section className="tl-about" aria-labelledby="tl-about-title">
      <style>{`
        .tl-about { margin-top: 40px; padding-top: 24px; border-top: 1px solid #E7E5E4; }
        .tl-about-label { margin: 0 0 10px; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #A8A29E; }
        .tl-about-text { margin: 0; font-size: 15px; line-height: 1.65; color: #44403C; }
        .tl-about-note { margin: 10px 0 0; font-size: 12px; line-height: 1.6; color: #A8A29E; }
        .tl-about-note a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
        .tl-about-note a:hover { color: #57534E; }
      `}</style>
      <h2 id="tl-about-title" className="tl-about-label">{label}</h2>
      <p className="tl-about-text">{text}</p>
      {note && <p className="tl-about-note">{note}</p>}
    </section>
  )
}
