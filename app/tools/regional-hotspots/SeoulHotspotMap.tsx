'use client'

import type { SeoulClusterId } from '@/data/regionalHotspots'

// 서울 외곽 실루엣을 손으로 옮긴 약도다. 실제 행정 경계가 아니라 여섯 권역의 위치 관계만 보여 준다
const SEOUL_OUTLINE = 'M16,128 C28,104 52,92 74,78 C84,56 104,40 126,44 C146,34 160,20 184,12 C206,6 226,18 236,38 C246,58 252,76 268,92 C290,100 310,116 308,138 C306,158 290,164 284,182 C272,206 244,214 222,210 C206,226 176,232 158,218 C140,208 124,216 108,222 C88,226 72,212 74,194 C60,176 50,160 34,156 C22,150 12,142 16,128 Z'
const HAN_RIVER = 'M0,116 C36,122 62,146 104,162 C134,174 168,176 200,160 C226,148 250,132 276,142 C292,150 306,154 320,152'

// 여의도·용산만 서쪽 돌출부(여의도)가 강을 건너고, 강남·잠실은 강 남쪽에 놓는다
const ZONES: { id: SeoulClusterId; label: string; path: string; x: number; y: number }[] = [
  { id: 'hongdae', label: 'Hongdae', path: 'M66,90 C84,80 108,74 126,84 C132,100 128,120 130,132 C112,136 92,130 72,118 C62,110 60,100 66,90 Z', x: 97, y: 110 },
  { id: 'jongno', label: 'Jongno', path: 'M140,52 C158,38 190,32 208,46 C216,60 216,78 212,92 C188,98 158,98 136,92 C132,78 134,62 140,52 Z', x: 175, y: 71 },
  { id: 'seongsu', label: 'Seongsu', path: 'M224,70 C238,66 248,76 256,88 C268,100 284,106 292,118 C292,126 282,128 270,128 C254,124 238,130 222,140 C216,124 216,90 224,70 Z', x: 253, y: 108 },
  { id: 'myeongdong', label: 'Myeongdong', path: 'M136,98 C160,104 188,104 212,98 C216,108 214,122 208,130 C186,135 158,135 138,130 C132,120 132,108 136,98 Z', x: 174, y: 121 },
  { id: 'yeouido', label: 'Yeouido · Yongsan', path: 'M138,136 C160,141 186,141 206,136 C212,146 208,156 196,160 C176,166 152,166 136,166 C128,180 104,182 92,172 C80,158 84,142 106,141 C122,140 134,142 138,136 Z', x: 151, y: 157 },
  { id: 'gangnam', label: 'Gangnam · Jamsil', path: 'M142,186 C170,188 200,180 222,168 C244,156 262,152 284,158 C292,164 290,172 282,184 C272,202 244,208 224,204 C206,218 176,222 160,212 C150,206 140,198 142,186 Z', x: 215, y: 191 },
]

export function SeoulHotspotMap({ selected, onSelect }: { selected: SeoulClusterId; onSelect: (id: SeoulClusterId) => void }) {
  return (
    <svg className="hs-map notranslate" viewBox="0 0 320 236" role="group" aria-label="Map of six Seoul areas around the Han River. Not to scale.">
      <path className="hs-outline" d={SEOUL_OUTLINE} strokeLinejoin="round" />
      <path className="hs-han" d={HAN_RIVER} fill="none" strokeLinecap="round" />
      <text x="4" y="140" className="hs-river">Han River</text>
      <text x="8" y="20" className="hs-side-label">North</text>
      <text x="8" y="228" className="hs-side-label">South</text>
      {ZONES.map(zone => {
        const active = zone.id === selected
        return (
          <g key={zone.id} className={`hs-zone${active ? ' is-active' : ''}`} role="button" tabIndex={0} aria-label={`Show ${zone.label}`} aria-pressed={active}
            onClick={() => onSelect(zone.id)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(zone.id) } }}>
            <path d={zone.path} strokeLinejoin="round" />
            <text x={zone.x} y={zone.y} textAnchor="middle">{zone.label}</text>
          </g>
        )
      })}
    </svg>
  )
}
