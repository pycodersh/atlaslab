'use client'

import { useState } from 'react'
import { CATEGORY_EMOJI, HOTSPOT_CITIES, type SeoulClusterId } from '@/data/regionalHotspots'
import { SeoulHotspotMap } from './SeoulHotspotMap'

export function HotspotFinder() {
  const [selected, setSelected] = useState(0)
  const [clusterId, setClusterId] = useState<SeoulClusterId>('jongno')
  const city = HOTSPOT_CITIES[selected]
  const cluster = city.clusters?.find(c => c.id === clusterId)
  const spots = cluster?.spots ?? city.spots

  return (
    <>
      <style>{`
        .tl-wrap.hs-wrap { max-width: 1040px; }
        .hs-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 20px; }
        .hs-tab { min-height: 44px; padding: 8px 4px; border: 1px solid #E5E7EB; border-radius: 12px; background: #fff; color: #374151; cursor: pointer; font: 600 14px "DM Sans", Inter, system-ui, sans-serif; }
        .hs-tab[aria-selected="true"] { background: #111827; border-color: #111827; color: #fff; }

        .hs-seoul { display: flex; flex-direction: column; gap: 14px; padding: 16px; margin-bottom: 16px; background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; }
        .hs-map { display: block; width: 100%; max-width: 300px; height: auto; margin: 0 auto; }
        .hs-river { font: 500 9px "DM Sans", Inter, system-ui, sans-serif; fill: #7D9BB0; }
        .hs-zone { cursor: pointer; outline: none; }
        .hs-zone polygon { fill: #F3F1EC; stroke: #fff; stroke-width: 3; transition: fill .15s; }
        .hs-zone text { font: 600 12px "DM Sans", Inter, system-ui, sans-serif; fill: #4B5563; pointer-events: none; transition: fill .15s; }
        .hs-zone.is-active polygon { fill: #C8102E; }
        .hs-zone.is-active text { fill: #fff; font-weight: 700; }
        .hs-zone:focus-visible polygon { stroke: #111827; }
        @media (hover: hover) { .hs-zone:not(.is-active):hover polygon { fill: #E7E3DB; } }
        .hs-side { flex: 1; min-width: 0; }
        .hs-cluster-name { margin: 0; font-family: "Playfair Display", Georgia, serif; font-size: 22px; font-weight: 700; line-height: 1.2; color: #111827; }
        .hs-cluster-theme { margin: 2px 0 12px; font-size: 13px; color: #4B5563; }
        .hs-chips { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
        .hs-chip { min-height: 44px; padding: 6px 4px; border: 1px solid #E5E7EB; border-radius: 10px; background: #fff; color: #374151; cursor: pointer; font: 600 13px/1.2 "DM Sans", Inter, system-ui, sans-serif; }
        .hs-chip[aria-pressed="true"] { background: #C8102E; border-color: #C8102E; color: #fff; }
        .hs-chip-full { display: none; }

        .hs-deck { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin-bottom: 18px; animation: hs-in .2s ease-out; }
        @keyframes hs-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .hs-deck { animation: none; } }
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
        .hs-tab:focus-visible, .hs-chip:focus-visible, .hs-route:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        @media (max-width: 767px) { .hs-map { max-width: 240px; } }
        @media (min-width: 768px) {
          .hs-tabs { grid-template-columns: repeat(9, minmax(0, 1fr)); }
          .hs-deck { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .hs-seoul { flex-direction: row; align-items: center; gap: 32px; padding: 20px 28px; }
          .hs-map { flex: 0 0 300px; margin: 0; }
          .hs-cluster-name { font-size: 26px; }
          .hs-chips { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .hs-chip-short { display: none; }
          .hs-chip-full { display: inline; }
        }
      `}</style>

      <div className="hs-tabs notranslate" translate="no" role="tablist" aria-label="City">
        {HOTSPOT_CITIES.map((c, i) => (
          <button key={c.id} type="button" role="tab" className="hs-tab" aria-selected={i === selected} onClick={() => setSelected(i)}>{c.name}</button>
        ))}
      </div>

      {city.clusters && cluster && (
        <section className="hs-seoul" aria-label="Choose a Seoul area">
          <SeoulHotspotMap selected={cluster.id} onSelect={setClusterId} />
          <div className="hs-side">
            <h2 key={cluster.id} className="hs-cluster-name notranslate" translate="no">{cluster.name}</h2>
            <p key={`${cluster.id}-theme`} className="hs-cluster-theme"><span className="notranslate" translate="no" lang="ko">{cluster.ko}</span> · {cluster.theme}</p>
            <div className="hs-chips notranslate" translate="no" role="group" aria-label="Seoul areas">
              {city.clusters.map(c => (
                <button key={c.id} type="button" className="hs-chip" aria-pressed={c.id === cluster.id} onClick={() => setClusterId(c.id)}>
                  <span className="hs-chip-short">{c.short}</span>
                  <span className="hs-chip-full">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* key: 자동 번역이 글자 노드를 바꿔 끼우고, 바뀔 때마다 카드가 부드럽게 나타나게 새로 그린다 */}
      <div key={`${city.id}-${cluster?.id ?? ''}`} role="tabpanel" aria-label={cluster?.name ?? city.name}>
        <div className="hs-deck">
          {spots.map((spot, i) => (
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
