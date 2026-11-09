'use client'

import type { SeoulClusterId } from '@/data/regionalHotspots'

// 실제 경계가 아니라 여섯 권역의 위치 관계만 보여 주는 약도다.
// 여의도·용산은 강 위 섬(여의도)과 북쪽 강변(용산)에 걸치므로 강을 덮고, 강남·잠실만 남쪽에 놓는다
const ZONES: { id: SeoulClusterId; label: string; points: string; x: number; y: number }[] = [
  { id: 'hongdae', label: 'Hongdae', points: '10,34 102,24 106,114 60,120 12,104', x: 58, y: 76 },
  { id: 'jongno', label: 'Jongno', points: '110,14 216,14 216,64 110,64', x: 163, y: 44 },
  { id: 'myeongdong', label: 'Myeongdong', points: '110,70 216,70 216,114 110,114', x: 163, y: 97 },
  { id: 'seongsu', label: 'Seongsu', points: '224,30 310,34 310,118 224,142', x: 267, y: 86 },
  { id: 'yeouido', label: 'Yeouido · Yongsan', points: '112,120 216,120 216,148 150,150 120,178 56,176 40,126 106,126', x: 132, y: 141 },
  { id: 'gangnam', label: 'Gangnam · Jamsil', points: '130,186 214,180 288,168 312,150 312,212 130,212', x: 224, y: 201 },
]

export function SeoulHotspotMap({ selected, onSelect }: { selected: SeoulClusterId; onSelect: (id: SeoulClusterId) => void }) {
  return (
    <svg className="hs-map notranslate" viewBox="0 0 320 220" role="group" aria-label="Map of six Seoul areas around the Han River. Not to scale.">
      <path d="M0,128 C40,134 70,160 130,166 S260,160 320,130" fill="none" stroke="#DCE9F2" strokeWidth="14" strokeLinecap="round" />
      <text x="6" y="156" className="hs-river">Han River</text>
      <text x="16" y="20" className="hs-side-label">North</text>
      <text x="16" y="206" className="hs-side-label">South</text>
      {ZONES.map(zone => {
        const active = zone.id === selected
        return (
          <g key={zone.id} className={`hs-zone${active ? ' is-active' : ''}`} role="button" tabIndex={0} aria-label={`Show ${zone.label}`} aria-pressed={active}
            onClick={() => onSelect(zone.id)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(zone.id) } }}>
            <polygon points={zone.points} strokeLinejoin="round" />
            <text x={zone.x} y={zone.y} textAnchor="middle">{zone.label}</text>
          </g>
        )
      })}
    </svg>
  )
}
