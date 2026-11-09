const FONT = "Pretendard, 'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', system-ui, sans-serif"

const CARDS = [
  { ch: '가', x: 196, tilt: -7, y: 176, color: '#4338CA' },
  { ch: '다', x: 444, tilt: 7, y: 176, color: '#0F766E' },
  { ch: '나', x: 320, tilt: 0, y: 162, color: '#C8102E' }, // 가운데 카드가 양쪽 위로 겹치게 맨 뒤에 그린다
]
const FLOATS = [
  { ch: 'ㄱ', x: 86, y: 86, r: 30, o: 0.5 },
  { ch: 'ㅏ', x: 562, y: 72, r: 26, o: 0.42 },
  { ch: 'ㅎ', x: 572, y: 272, r: 32, o: 0.5 },
  { ch: 'ㅏ', x: 62, y: 262, r: 22, o: 0.34 },
]

/**
 * 홈 Korean Basics 카드의 표지 — 이미지 파일 없이 SVG 하나로 그린다.
 * 폰의 작은 정사각 썸네일에서도 가운데 카드 3장이 남도록 viewBox 를 slice 로 채운다.
 */
export function KoreanBasicsArt() {
  return (
    <svg className="notranslate" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Korean letters 가, 나, 다 on three white cards" fontFamily={FONT}>
      <defs>
        <linearGradient id="kba-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EEF2FF" />
          <stop offset=".55" stopColor="#EFF6FF" />
          <stop offset="1" stopColor="#F1F5F9" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#kba-bg)" />

      {FLOATS.map((f, i) => (
        <g key={i} opacity={f.o}>
          <circle cx={f.x} cy={f.y} r={f.r} fill="#fff" stroke="#C7D2FE" strokeWidth="1.5" />
          <text x={f.x} y={f.y} textAnchor="middle" dominantBaseline="central" fontSize={f.r * 1.05} fontWeight="700" fill="#4F46E5">{f.ch}</text>
        </g>
      ))}

      {CARDS.map(c => (
        <g key={c.ch} transform={`rotate(${c.tilt} ${c.x} ${c.y})`}>
          <rect x={c.x - 68} y={c.y - 90} width="136" height="180" rx="24" fill="#fff" stroke="#E0E7FF" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 10px 18px rgba(49,46,129,.14))' }} />
          <text x={c.x} y={c.y} textAnchor="middle" dominantBaseline="central" fontSize="92" fontWeight="800" fill={c.color}>{c.ch}</text>
        </g>
      ))}

      <rect x="228" y="296" width="184" height="36" rx="18" fill="#312E81" />
      <text x="320" y="314" textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="700" letterSpacing=".4" fill="#fff">Hangul &amp; Core Rules</text>
    </svg>
  )
}
