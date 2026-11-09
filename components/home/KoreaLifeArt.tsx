const VEG = ['#E8A33D', '#3F8F4F', '#B5522E', '#F2D16B', '#6AA84F', '#8C3B2A']
const BOWL = { x: 118, y: 368, inner: 58 }

// 비빔밥 고명 — 같은 크기의 부채꼴 여섯 조각
const wedges = VEG.map((fill, i) => {
  const point = (deg: number) => {
    const rad = (deg * Math.PI) / 180
    return `${(BOWL.x + BOWL.inner * Math.cos(rad)).toFixed(1)},${(BOWL.y + BOWL.inner * Math.sin(rad)).toFixed(1)}`
  }
  return { fill, d: `M${BOWL.x},${BOWL.y} L${point(i * 60 - 90)} A${BOWL.inner},${BOWL.inner} 0 0 1 ${point((i + 1) * 60 - 90)} Z` }
})

const PETALS = [0, 72, 144, 216, 288]
const WINDOWS_LOW = [250, 278, 306, 334, 362]
const WINDOWS_HIGH = [276, 304, 332]

/**
 * 홈 Korea Life 카드의 표지 — 이미지 파일 없이 SVG 하나로 그린다.
 * 폰의 작은 정사각 썸네일에서도 가운데 성문이 남도록 viewBox 를 slice 로 채운다.
 */
export function KoreaLifeArt() {
  return (
    <svg viewBox="0 0 640 480" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration of a Korean palace gate with bibimbap, a hanbok, a rose of Sharon flower and a taegeuk circle">
      <defs>
        <linearGradient id="kla-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F9E8D5" />
          <stop offset="1" stopColor="#F0D4B8" />
        </linearGradient>
      </defs>
      <rect width="640" height="480" fill="url(#kla-bg)" />
      <circle cx="320" cy="210" r="172" fill="#FCF3E7" />
      <path d="M0,430 C120,404 210,420 320,424 S540,402 640,428 V480 H0 Z" fill="#E7C5A3" />

      {/* 무궁화 */}
      <g transform="translate(100 100)">
        <path d="M-30,34 C-62,44 -76,30 -82,14 C-60,12 -42,18 -30,34 Z" fill="#3F8F4F" />
        <path d="M36,28 C62,46 80,34 88,20 C68,12 48,14 36,28 Z" fill="#4FA35F" />
        {PETALS.map(a => <ellipse key={a} cx="0" cy="-30" rx="24" ry="33" fill="#EF6A8E" stroke="#F9A8BD" strokeWidth="2" transform={`rotate(${a})`} />)}
        <circle r="15" fill="#B3123E" />
        <path d="M0,0 L10,-24" stroke="#F2D16B" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* 태극 */}
      <g transform="translate(544 96)">
        <circle r="52" fill="#fff" />
        <circle r="42" fill="#27509B" />
        <path d="M-42,0 A42,42 0 0 1 42,0 A21,21 0 0 1 0,0 A21,21 0 0 0 -42,0 Z" fill="#CD2E3A" />
      </g>

      {/* 성문 */}
      <path d="M176,372 V272 H464 V372 Z" fill="#B9B5AD" />
      <g stroke="#A29E96" strokeWidth="2">
        <path d="M176,298 H464 M176,324 H464 M176,350 H464" />
        <path d="M220,272 V298 M296,272 V298 M372,272 V298 M430,272 V298 M206,324 V350 M430,324 V350" />
      </g>
      <path d="M288,372 V326 A32,32 0 0 1 352,326 V372 Z" fill="#4A4640" />
      <path d="M212,372 V338 A21,21 0 0 1 254,338 V372 Z" fill="#5C5850" />
      <path d="M386,372 V338 A21,21 0 0 1 428,338 V372 Z" fill="#5C5850" />

      <rect x="236" y="230" width="168" height="42" fill="#A8324A" />
      <rect x="236" y="226" width="168" height="8" fill="#2E8C84" />
      {WINDOWS_LOW.map(x => <rect key={x} x={x} y="242" width="18" height="22" rx="2" fill="#FBEFE0" />)}
      <path d="M160,232 C200,226 224,208 238,188 H402 C416,208 440,226 480,232 C410,220 230,220 160,232 Z" fill="#37363F" />

      <rect x="264" y="154" width="112" height="36" fill="#A8324A" />
      <rect x="264" y="150" width="112" height="8" fill="#2E8C84" />
      {WINDOWS_HIGH.map(x => <rect key={x} x={x} y="164" width="16" height="20" rx="2" fill="#FBEFE0" />)}
      <path d="M212,156 C246,150 266,134 276,114 H364 C374,134 394,150 428,156 C376,144 264,144 212,156 Z" fill="#37363F" />
      <rect x="272" y="108" width="96" height="8" rx="4" fill="#2A2931" />

      {/* 돌솥 비빔밥 */}
      <g style={{ filter: 'drop-shadow(0 8px 12px rgba(90,50,20,.22))' }}>
        <rect x="26" y="358" width="184" height="20" rx="10" fill="#26221F" />
        <circle cx={BOWL.x} cy={BOWL.y} r="72" fill="#2F2A27" />
        <circle cx={BOWL.x} cy={BOWL.y} r="62" fill="#F7EEDC" />
        {wedges.map(w => <path key={w.fill} d={w.d} fill={w.fill} stroke="#F7EEDC" strokeWidth="2" />)}
        <circle cx={BOWL.x} cy={BOWL.y} r="28" fill="#fff" />
        <circle cx={BOWL.x} cy={BOWL.y} r="13" fill="#F5A623" />
      </g>

      {/* 한복 */}
      <g style={{ filter: 'drop-shadow(0 8px 12px rgba(90,50,20,.2))' }}>
        <path d="M508,322 H566 C586,376 598,416 606,452 H468 C476,416 488,376 508,322 Z" fill="#1F4E79" />
        <path d="M498,290 L452,328 L468,346 L506,320 Z" fill="#EF5B4C" />
        <path d="M576,290 L622,328 L606,346 L568,320 Z" fill="#EF5B4C" />
        <path d="M452,328 L468,346 L476,340 L460,322 Z" fill="#fff" />
        <path d="M622,328 L606,346 L598,340 L614,322 Z" fill="#fff" />
        <path d="M498,284 H576 L584,330 H490 Z" fill="#EF5B4C" />
        <path d="M520,284 L537,322 L554,284 H544 L537,302 L530,284 Z" fill="#fff" />
        <path d="M537,322 L526,390 L540,386 L544,322 Z" fill="#FBD5CE" />
      </g>
    </svg>
  )
}
