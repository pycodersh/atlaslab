/**
 * 홈 히어로 오른쪽(모바일은 검색창 아래 띠)의 단선 라인 아트.
 * 한옥 처마 → 말풍선과 '한' → 남산 N서울타워 → 지도 핀이 바닥선 하나로 이어져 왼쪽부터 그려진다(약 1.8초).
 *
 * - JS 없이 CSS 만 쓴다: pathLength=1 로 길이를 정규화하고 stroke-dashoffset 1 → 0.
 * - 선 굵기는 vector-effect 로 화면 크기와 상관없이 1.5px.
 * - 바닥선(주 경로)은 하위 경로(M) 없이 한 줄이다 — 한 붓으로 이어 그려져야 순서가 지켜진다.
 *   말풍선 안 글자 획과 핀 구멍은 주 경로가 그 자리를 지날 때 맞춰 따로 그린다.
 * - 움직임 줄이기 설정이면 다 그려진 상태로 바로 보인다.
 */
const MAIN =
  // 바닥선 → 한옥: 왼쪽 기둥, 처마 끝이 들린 지붕, 용마루, 오른쪽 처마, 오른쪽 기둥
  'M6 150 H40 V114 C30 114 18 108 10 98 C36 98 54 86 66 72 H114 C126 86 144 98 170 98 C162 108 150 114 140 114 V150' +
  // → 말풍선: V자 꼬리 한쪽으로 올라가 둥근 사각형을 한 바퀴 돌고 꼬리 반대쪽으로 같은 바닥점에 내려온다
  ' H206 L216 126 H272 Q286 126 286 112 V78 Q286 64 272 64 H210 Q196 64 196 78 V112 Q196 126 210 126 H230 L208 150' +
  // → 남산: 언덕을 올라 탑 기둥 · 전망대 · 안테나 · 반대쪽 기둥 · 언덕 내려오기
  ' H304 C324 134 338 126 352 124 V74 H346 L349 62 H357 V20 V62 H365 L368 74 H362 V124 C376 126 390 134 410 150' +
  // → 지도 핀: 끝점이 바닥에 닿는 물방울 모양, 그리고 바닥선 끝
  ' H460 C452 136 440 122 440 106 A20 20 0 1 1 480 106 C480 122 468 136 460 150 H514'

// '한' — ㅎ(꼭지 · 가로획 · 이응) + ㅏ + ㄴ 받침. [d, 시작(초)]
const HAN: [string, number][] = [
  ['M216 74 H226', 0.72],
  ['M209 82 H233', 0.78],
  ['M215 95 A6 6 0 1 0 227 95 A6 6 0 1 0 215 95', 0.84],
  ['M248 70 V106', 0.92],
  ['M248 87 H257', 0.98],
  ['M212 108 V118 H266', 1.04],
]

export function HeroLineArt() {
  return (
    <div className="hla" aria-hidden="true">
      <style>{`
        .hla { width: 100%; }
        .hla svg { display: block; width: 100%; height: auto; overflow: visible; }
        .hla path {
          fill: none; stroke: #FAF9F6; stroke-opacity: 0.8; stroke-width: 1.5;
          stroke-linecap: round; stroke-linejoin: round;
          stroke-dasharray: 1; stroke-dashoffset: 1;
          animation: hla-draw var(--d, 1.8s) cubic-bezier(.45,.05,.35,1) var(--s, 0s) forwards;
        }
        @keyframes hla-draw { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .hla path { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
      <svg viewBox="0 0 520 170" preserveAspectRatio="xMidYMid meet" focusable="false">
        <path d={MAIN} pathLength={1} vectorEffect="non-scaling-stroke" />
        {HAN.map(([d, s]) => (
          <path key={d} d={d} pathLength={1} vectorEffect="non-scaling-stroke" style={{ ['--s' as string]: `${s}s`, ['--d' as string]: '0.22s' }} />
        ))}
        <path d="M453 106 A7 7 0 1 0 467 106 A7 7 0 1 0 453 106" pathLength={1} vectorEffect="non-scaling-stroke" style={{ ['--s' as string]: '1.62s', ['--d' as string]: '0.3s' }} />
      </svg>
    </div>
  )
}
