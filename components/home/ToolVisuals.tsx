/**
 * Smart Travel Tools 카드의 일러스트 — 도구에는 빌려 올 글 썸네일이 없어 SVG 로 그린다.
 * 폰에서는 96px 폭으로 잘리므로(slice) 핵심 그림은 가운데에 모아 둔다.
 */
const svgProps = { viewBox: '0 0 320 240', preserveAspectRatio: 'xMidYMid slice', xmlns: 'http://www.w3.org/2000/svg' }
const font = '"DM Sans", Inter, system-ui, sans-serif'

export function OrderBuilderVisual() {
  return (
    <svg {...svgProps}>
      <rect width="320" height="240" fill="#FBEFEA" />
      <circle cx="160" cy="120" r="96" fill="#F6DDD5" />
      <rect x="112" y="28" width="96" height="184" rx="16" fill="#111827" />
      <rect x="118" y="34" width="84" height="172" rx="11" fill="#fff" />
      <rect x="128" y="50" width="64" height="44" rx="10" fill="#C8102E" />
      <text x="160" y="69" textAnchor="middle" fontFamily={font} fontSize="11" fontWeight="700" fill="#fff">덜 맵게</text>
      <text x="160" y="85" textAnchor="middle" fontFamily={font} fontSize="11" fontWeight="700" fill="#fff">해 주세요</text>
      <rect x="128" y="106" width="64" height="8" rx="4" fill="#E5E7EB" />
      <rect x="128" y="122" width="44" height="8" rx="4" fill="#E5E7EB" />
      <path d="M134 168h52a26 26 0 0 1-52 0Z" fill="#C8102E" />
      <path d="M150 158c-4-6 4-8 0-14M170 158c-4-6 4-8 0-14" fill="none" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function SubwayTimerVisual() {
  return (
    <svg {...svgProps}>
      <rect width="320" height="240" fill="#E9F0F4" />
      <rect y="196" width="320" height="44" fill="#D5E1E8" />
      <rect x="28" y="112" width="54" height="84" rx="8" fill="#6B7C88" />
      <rect x="238" y="112" width="54" height="84" rx="8" fill="#6B7C88" />
      <rect x="82" y="146" width="34" height="10" rx="5" fill="#C8102E" />
      <rect x="204" y="146" width="34" height="10" rx="5" fill="#C8102E" />
      <circle cx="160" cy="104" r="72" fill="#fff" />
      <circle cx="160" cy="104" r="60" fill="none" stroke="#E5E7EB" strokeWidth="10" />
      <path d="M160 44a60 60 0 1 1-60 60" fill="none" stroke="#C8102E" strokeWidth="10" strokeLinecap="round" />
      <text x="160" y="114" textAnchor="middle" fontFamily={font} fontSize="30" fontWeight="700" fill="#111827">15:00</text>
    </svg>
  )
}

export function KrwPriceVisual() {
  return (
    <svg {...svgProps}>
      <rect width="320" height="240" fill="#EEF3E6" />
      <circle cx="160" cy="120" r="96" fill="#DFE9CF" />
      <g transform="rotate(-8 160 120)">
        <rect x="68" y="72" width="184" height="96" rx="8" fill="#7FA05A" />
        <rect x="78" y="82" width="164" height="76" rx="4" fill="none" stroke="#DFE9CF" strokeWidth="2" />
        <circle cx="160" cy="120" r="30" fill="#EEF3E6" />
        <text x="160" y="132" textAnchor="middle" fontFamily={font} fontSize="34" fontWeight="700" fill="#4F6E32">₩</text>
      </g>
      <circle cx="222" cy="172" r="30" fill="#C8102E" />
      <text x="222" y="183" textAnchor="middle" fontFamily={font} fontSize="30" fontWeight="700" fill="#fff">$</text>
    </svg>
  )
}
