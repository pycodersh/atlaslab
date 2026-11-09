import type { ReactNode } from 'react'
import type { HotspotCategory } from '@/data/regionalHotspots'

// 사진 대신 쓰는 테마 썸네일 — 66곳이 이 8장을 나눠 쓴다
const STRIPES = [0, 1, 2, 3, 4]

const THEMES: Record<HotspotCategory, { from: string; to: string; ink: string; art: ReactNode }> = {
  'Nature & Park': {
    from: '#DCFCE7', to: '#A7F3D0', ink: '#166534',
    art: <>
      <circle cx="72" cy="22" r="9" fill="#FDE68A" />
      <path fill="#34D399" d="M4 78 32 38l26 40z" />
      <path fill="#059669" d="M30 78 60 28l32 50z" />
      <path fill="#D1FAE5" d="m60 28-9 15 6-3 4 5 7-2z" />
      <path fill="#047857" d="M2 78h92v5q-46 8-92 0z" />
    </>,
  },
  'Art & Culture': {
    from: '#EDE9FE', to: '#C4B5FD', ink: '#5B21B6',
    art: <>
      <path fill="#7C3AED" d="M48 10a38 38 0 1 0 0 76c8 0 11-5 9-11-2-6 2-13 9-13h8c8 0 14-6 14-14 0-21-18-38-40-38z" />
      <circle cx="30" cy="44" r="7" fill="#FDE68A" />
      <circle cx="44" cy="28" r="7" fill="#F9A8D4" />
      <circle cx="64" cy="34" r="7" fill="#93C5FD" />
      <circle cx="34" cy="64" r="7" fill="#A7F3D0" />
    </>,
  },
  'Local Market': {
    from: '#FEF3C7', to: '#FCD34D', ink: '#92400E',
    art: <>
      <path fill="#B45309" d="M18 48h5v36h-5zM73 48h5v36h-5z" />
      {STRIPES.map(i => <path key={i} fill={i % 2 ? '#FFFBEB' : '#D97706'} d={`M${12 + i * 14.4} 16h14.4v24a7.200 7.200 0 0 1-14.400 0z`} />)}
      <rect x="14" y="68" width="68" height="8" rx="3" fill="#92400E" />
      <circle cx="34" cy="61" r="7" fill="#EF4444" />
      <circle cx="48" cy="61" r="7" fill="#F97316" />
      <circle cx="62" cy="61" r="7" fill="#EF4444" />
    </>,
  },
  Heritage: {
    from: '#FFE4E6', to: '#FDA4AF', ink: '#9F1239',
    art: <>
      <rect x="34" y="14" width="28" height="6" rx="3" fill="#881337" />
      <path fill="#9F1239" d="M6 46c15-3 26-13 32-27h20c6 14 17 24 32 27-23-7-61-7-84 0z" />
      <path fill="#E11D48" d="M24 48h6v30h-6zM45 48h6v30h-6zM66 48h6v30h-6z" />
      <rect x="20" y="46" width="56" height="6" fill="#BE123C" />
      <rect x="13" y="78" width="70" height="7" rx="2" fill="#881337" />
    </>,
  },
  'Trendy Cafe': {
    from: '#FFEDD5', to: '#FDBA74', ink: '#9A3412',
    art: <>
      <path fill="none" stroke="#FB923C" strokeWidth="4" strokeLinecap="round" d="M34 12c-5 6 5 11 0 18M48 12c-5 6 5 11 0 18" />
      <path fill="none" stroke="#C2410C" strokeWidth="6" d="M66 47h5a9 9 0 0 1 0 18h-7" />
      <path fill="#EA580C" d="M20 40h46v18a18 18 0 0 1-18 18H38a18 18 0 0 1-18-18z" />
      <path fill="#FFEDD5" opacity=".55" d="M27 46h6v14a9 9 0 0 0 4 8c-6-1-10-6-10-12z" />
      <ellipse cx="43" cy="81" rx="31" ry="5" fill="#9A3412" />
    </>,
  },
  'Skyline & Modern': {
    from: '#E0E7FF', to: '#A5B4FC', ink: '#3730A3',
    art: <>
      <rect x="12" y="46" width="20" height="38" rx="2" fill="#818CF8" />
      <rect x="62" y="36" width="22" height="48" rx="2" fill="#6366F1" />
      <path fill="#3730A3" d="M46 6h4v14h-4zM39 20h18l3 10H36z" />
      <rect x="42" y="30" width="12" height="54" fill="#4338CA" />
      <path fill="#E0E7FF" d="M18 54h8v5h-8zM18 66h8v5h-8zM68 44h10v5H68zM68 56h10v5H68zM68 68h10v5H68z" />
      <rect x="6" y="84" width="84" height="4" rx="2" fill="#312E81" />
    </>,
  },
  'Coastal & Sea': {
    from: '#E0F2FE', to: '#7DD3FC', ink: '#075985',
    art: <>
      <circle cx="72" cy="22" r="10" fill="#FDE68A" />
      <path fill="#fff" d="M44 12v28h18z" />
      <path fill="#0369A1" d="M26 42h38l-7 10H33z" />
      <g fill="none" strokeWidth="8" strokeLinecap="round">
        <path stroke="#38BDF8" d="M8 58c10-10 20-10 30 0s20 10 30 0 14-7 20-5" />
        <path stroke="#0EA5E9" d="M8 71c10-10 20-10 30 0s20 10 30 0 14-7 20-5" />
        <path stroke="#0369A1" d="M8 84c10-10 20-10 30 0s20 10 30 0 14-7 20-5" />
      </g>
    </>,
  },
  'Shopping & Street': {
    from: '#FCE7F3', to: '#F9A8D4', ink: '#9D174D',
    art: <>
      <path fill="none" stroke="#9D174D" strokeWidth="5" strokeLinecap="round" d="M36 36V26a12 12 0 0 1 24 0v10" />
      <path fill="#DB2777" d="M24 32h48l6 54H18z" />
      <path fill="#FCE7F3" d="M48 74C33 62 36 49 43 49c3 0 5 3 5 3s2-3 5-3c7 0 10 13-5 25z" />
    </>,
  },
}

export function CategoryArt({ category }: { category: HotspotCategory }) {
  const { from, to, ink, art } = THEMES[category]
  return (
    <div className="hs-art" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      <svg viewBox="0 0 96 96" aria-hidden="true">{art}</svg>
      <span className="hs-theme" style={{ color: ink }}>{category}</span>
    </div>
  )
}
