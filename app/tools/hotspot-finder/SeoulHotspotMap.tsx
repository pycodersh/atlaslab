'use client'

import type { SeoulClusterId } from '@/data/regionalHotspots'

// 실제 경계가 아니라 다섯 권역의 위치 관계만 보여 주는 약도다
const ZONES: { id: SeoulClusterId; label: string; points: string; x: number; y: number }[] = [
  { id: 'hongdae', label: 'Hongdae', points: '18,42 100,30 112,102 42,120 14,86', x: 62, y: 79 },
  { id: 'jongno', label: 'Jongno', points: '108,20 206,18 212,84 118,92', x: 160, y: 58 },
  { id: 'hannam', label: 'Hannam', points: '122,98 208,91 212,126 130,138', x: 169, y: 119 },
  { id: 'seongsu', label: 'Seongsu', points: '218,28 302,34 306,98 220,116', x: 262, y: 76 },
  { id: 'gangnam', label: 'Gangnam', points: '110,162 200,154 300,130 312,192 120,196', x: 214, y: 178 },
]

export function SeoulHotspotMap({ selected, onSelect }: { selected: SeoulClusterId; onSelect: (id: SeoulClusterId) => void }) {
  return (
    <svg className="hs-map notranslate" viewBox="0 0 320 204" role="group" aria-label="Map of five Seoul areas. Not to scale.">
      <path d="M0,130 C60,152 120,152 170,144 S260,122 320,114" fill="none" stroke="#DCE9F2" strokeWidth="14" strokeLinecap="round" />
      <text x="24" y="156" className="hs-river">Han River</text>
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
