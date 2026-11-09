import type { ReactNode } from 'react'
import type { HotspotCategory } from '@/data/regionalHotspots'

// 사진 대신 쓰는 테마 뱃지 — [배경, 글자 · 아이콘 색, 16px 실루엣]
const THEMES: Record<HotspotCategory, { bg: string; fg: string; icon: ReactNode }> = {
  Heritage: {
    bg: '#FEF3C7', fg: '#92400E',
    icon: <path fill="currentColor" d="M2 10.5c3-.5 5-2.5 6-5.5h8c1 3 3 5 6 5.5-6-1.2-14-1.2-20 0zM5 11.5h14V13H5zM6 14h2.5v6H6zM10.75 14h2.5v6h-2.5zM15.5 14H18v6h-2.5zM4 20h16v2H4z" />,
  },
  'Trendy Cafe': {
    bg: '#F5EBE0', fg: '#7C4A21',
    icon: <>
      <path fill="currentColor" d="M4 10h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z" />
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M17 12h1.5a2.5 2.5 0 0 1 0 5H16.5M8 3c-1 1.5 1 2.5 0 4M13 3c-1 1.5 1 2.5 0 4" />
    </>,
  },
  'Local Market': {
    bg: '#FFEDD5', fg: '#9A3412',
    icon: <path fill="currentColor" d="M4 3h16l2 7a3 3 0 0 1-5 1.6 3.5 3.5 0 0 1-5 0 3.5 3.5 0 0 1-5 0A3 3 0 0 1 2 10zM5 14h2v8H5zM17 14h2v8h-2zM7 17h10v2.5H7z" />,
  },
  'Shopping & Street': {
    bg: '#FCE7F3', fg: '#9D174D',
    icon: <>
      <path fill="currentColor" d="M5 8h14l1.2 14H3.8z" />
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M8.5 8V6a3.5 3.5 0 0 1 7 0v2" />
    </>,
  },
  'Nature & Park': {
    bg: '#DCFCE7', fg: '#166534',
    icon: <path fill="currentColor" d="M12 1.5l6 8h-2.8l4.8 7.5h-7v5h-2v-5H4l4.8-7.5H6z" />,
  },
  'Skyline & Modern': {
    bg: '#E0E7FF', fg: '#3730A3',
    icon: <path fill="currentColor" d="M3 22V11h5v11zM10 22V6l2-4 2 4v16zM16 22v-9h5v9z" />,
  },
  'Coastal & Sea': {
    bg: '#E0F2FE', fg: '#075985',
    icon: <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" d="M2 7c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-2.5 5-1M2 13c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-2.5 5-1M2 19c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-2.5 5-1" />,
  },
  'Art & Culture': {
    bg: '#F3E8FF', fg: '#6B21A8',
    icon: <>
      <path fill="currentColor" d="M12 2.5a9.5 9.5 0 1 0 0 19c2 0 2.8-1.3 2.2-2.8-.6-1.6.4-3.2 2.2-3.2h2.1a3.5 3.5 0 0 0 3.5-3.5c0-5.300-4.500-9.500-10-9.500z" />
      <g fill="#F3E8FF"><circle cx="7.500" cy="11" r="1.600" /><circle cx="11" cy="7" r="1.600" /><circle cx="16" cy="8.500" r="1.600" /><circle cx="8.500" cy="16" r="1.600" /></g>
    </>,
  },
}

export function CategoryBadge({ category }: { category: HotspotCategory }) {
  const { bg, fg, icon } = THEMES[category]
  return (
    <span className="hs-badge" style={{ background: bg, color: fg }}>
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">{icon}</svg>
      {category}
    </span>
  )
}
