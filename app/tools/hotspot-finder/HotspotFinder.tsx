'use client'

import { useState } from 'react'
import { CATEGORY_EMOJI, HOTSPOT_CITIES } from '@/data/regionalHotspots'

export function HotspotFinder() {
  const [selected, setSelected] = useState(0)
  const city = HOTSPOT_CITIES[selected]

  return (
    <>
      <style>{`
        .tl-wrap.hs-wrap { max-width: 1040px; }
        .hs-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 20px; }
        .hs-tab { min-height: 44px; padding: 8px 4px; border: 1px solid #E5E7EB; border-radius: 12px; background: #fff; color: #374151; cursor: pointer; font: 600 14px "DM Sans", Inter, system-ui, sans-serif; }
        .hs-tab[aria-selected="true"] { background: #111827; border-color: #111827; color: #fff; }
        .hs-deck { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin-bottom: 18px; }
        .hs-card { display: flex; flex-direction: column; background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,.05); transition: border-color .15s; }
        @media (hover: hover) { .hs-card:hover { border-color: #D1D5DB; } .hs-tab:not([aria-selected="true"]):hover { border-color: #9CA3AF; } }
        .hs-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
        .hs-step { font-family: "Playfair Display", Georgia, serif; font-size: 22px; font-weight: 700; line-height: 1; color: #C8102E; }
        .hs-badge { padding: 3px 8px; border-radius: 6px; background: #F3F4F6; font-size: 12px; font-weight: 600; color: #374151; white-space: nowrap; }
        .hs-name { margin: 0; font-family: "Playfair Display", Georgia, serif; font-size: 20px; font-weight: 700; line-height: 1.25; color: #111827; }
        .hs-ko { margin: 2px 0 10px; font-family: Pretendard, "DM Sans", system-ui, sans-serif; font-size: 13px; color: #6B7280; }
        .hs-what { margin: 0 0 12px; font-size: 15px; line-height: 1.5; color: #111827; }
        .hs-tip { margin: 0; padding-top: 12px; border-top: 1px solid #F3F4F6; font-size: 13px; line-height: 1.5; color: #4B5563; }
        .hs-tip strong { display: block; color: #111827; font-weight: 700; }
        .hs-route { display: flex; align-items: center; justify-content: center; min-height: 48px; padding: 10px 16px; margin-bottom: 14px; box-sizing: border-box; border-radius: 12px; background: #111827; color: #fff; text-align: center; text-decoration: none; font: 700 14px "DM Sans", Inter, system-ui, sans-serif; }
        .hs-tab:focus-visible, .hs-route:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        @media (min-width: 768px) {
          .hs-tabs { grid-template-columns: repeat(9, minmax(0, 1fr)); }
          .hs-deck { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
      `}</style>

      <div className="hs-tabs notranslate" translate="no" role="tablist" aria-label="City">
        {HOTSPOT_CITIES.map((c, i) => (
          <button key={c.id} type="button" role="tab" className="hs-tab" aria-selected={i === selected} onClick={() => setSelected(i)}>{c.name}</button>
        ))}
      </div>

      {/* key: 자동 번역이 글자 노드를 바꿔 끼우므로 도시가 바뀌면 통째로 새로 그린다 */}
      <div key={city.id} role="tabpanel" aria-label={city.name}>
        <div className="hs-deck">
          {city.spots.map((spot, i) => (
            <article key={spot.name} className="hs-card">
              <div className="hs-top">
                <span className="hs-step notranslate" translate="no">{i + 1}</span>
                <span className="hs-badge">{CATEGORY_EMOJI[spot.category]} {spot.category}</span>
              </div>
              <h2 className="hs-name notranslate" translate="no">{spot.name}</h2>
              <p className="hs-ko notranslate" translate="no" lang="ko">{spot.ko}</p>
              <p className="hs-what">{spot.what}</p>
              <p className="hs-tip"><strong>Walking &amp; Transit tip</strong>{spot.tip}</p>
            </article>
          ))}
        </div>
        {city.routeLink && <a className="hs-route" href={`/tools/transit-guide?to=${city.id}`}>Check Route from Seoul in Transit Guide →</a>}
      </div>

      <p className="tl-note">Opening days and hours can change, so check a map app before you head out.</p>
    </>
  )
}
