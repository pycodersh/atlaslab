'use client'

import { useState } from 'react'
import { HOTSPOT_CITIES, type SeoulClusterId } from '@/data/regionalHotspots'
import { CategoryArt, CategoryBadge } from './CategoryBadge'
import { CITIES, type CityId } from '@/data/transitRoutes'
import { KoreaRouteMap } from '../KoreaRouteMap'
import { SeoulHotspotMap } from './SeoulHotspotMap'

// 해시태그에는 공백 · & · 가운뎃점을 못 쓴다 — '명동거리 & 야시장' 은 앞쪽 이름 하나만 태그로 쓴다
const instagramTag = (ko: string) => ko.split(/[&·]/)[0].replace(/\s+/g, '')

export function HotspotFinder() {
  const [cityId, setCityId] = useState<CityId>('seoul')
  const [clusterId, setClusterId] = useState<SeoulClusterId>('jongno')
  const city = HOTSPOT_CITIES.find(c => c.id === cityId) ?? HOTSPOT_CITIES[0]
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
        .hs-map { display: block; width: 100%; max-width: 340px; height: auto; margin: 0 auto; }
        .hs-mapbox { width: 100%; animation: hs-in .2s ease-out; }
        .hs-mapbox .km-map { margin: 0 auto; }
        @media (prefers-reduced-motion: reduce) { .hs-mapbox { animation: none; } }
        .hs-city-hint { margin: 0; font-size: 13px; color: #6B7280; }
        .hs-river { font: 500 9px "DM Sans", Inter, system-ui, sans-serif; fill: #7D9BB0; }
        .hs-side-label { font: 700 9px "DM Sans", Inter, system-ui, sans-serif; letter-spacing: .06em; text-transform: uppercase; fill: #9CA3AF; }
        .hs-outline { fill: #FAF8F4; stroke: #E5E1D8; stroke-width: 1.5; }
        .hs-han { stroke: #CFE2EF; stroke-width: 11; }
        .hs-zone { cursor: pointer; outline: none; }
        .hs-zone path { fill: #E9E4DA; stroke: #fff; stroke-width: 2; transition: fill .15s; }
        .hs-zone text { font: 600 12px "DM Sans", Inter, system-ui, sans-serif; fill: #4B5563; pointer-events: none; transition: fill .15s; }
        .hs-zone.is-active path { fill: #9F1239; }
        .hs-zone.is-active text { fill: #fff; font-weight: 700; }
        .hs-zone:focus-visible path { stroke: #111827; }
        @media (hover: hover) { .hs-zone:not(.is-active):hover path { fill: #D9D2C4; } }
        .hs-side { flex: 1; min-width: 0; }
        .hs-cluster-name { margin: 0; font-family: "Playfair Display", Georgia, serif; font-size: 22px; font-weight: 700; line-height: 1.2; color: #111827; }
        .hs-cluster-theme { margin: 2px 0 12px; font-size: 13px; color: #4B5563; }
        .hs-chips { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
        .hs-chip { min-height: 44px; padding: 6px 4px; border: 1px solid #E5E7EB; border-radius: 10px; background: #fff; color: #374151; cursor: pointer; font: 600 13px/1.2 "DM Sans", Inter, system-ui, sans-serif; }
        .hs-chip[aria-pressed="true"] { background: #C8102E; border-color: #C8102E; color: #fff; }
        .hs-chip-full { display: none; }

        .hs-deck { display: flex; flex-direction: column; gap: 16px; max-width: 768px; margin: 0 auto 18px; animation: hs-in .2s ease-out; }
        @keyframes hs-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .hs-deck { animation: none; } }
        .hs-card { display: flex; flex-direction: column; gap: 20px; background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,.05); transition: border-color .15s; }
        @media (hover: hover) { .hs-card:hover { border-color: #D1D5DB; } .hs-tab:not([aria-selected="true"]):hover { border-color: #9CA3AF; } }
        .hs-art { display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 100%; height: 128px; border-radius: 16px; }
        .hs-art svg { display: block; width: 96px; height: 96px; }
        .hs-body { flex: 1; min-width: 0; }
        .hs-badge { display: inline-block; margin-bottom: 8px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap; }
        .hs-name { margin: 0; font-family: "Playfair Display", Georgia, serif; font-size: 20px; font-weight: 700; line-height: 1.25; color: #111827; }
        .hs-ko { margin: 4px 0 0; font-family: Pretendard, "DM Sans", system-ui, sans-serif; font-size: 14px; font-weight: 500; color: #6B7280; }
        .hs-what { margin: 8px 0 12px; font-size: 14px; line-height: 1.55; color: #374151; }
        .hs-tip { margin: 0; padding: 12px; background: #F8FAFC; border: 1px solid rgba(226,232,240,.6); border-radius: 12px; font-size: 12px; line-height: 1.55; color: #334155; }
        .hs-tip strong { display: block; color: #0F172A; font-weight: 700; margin-bottom: 2px; }
        .hs-links { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
        .hs-link { display: flex; align-items: center; justify-content: center; min-height: 44px; padding: 6px 4px; box-sizing: border-box; border: 1px solid #E5E7EB; border-radius: 10px; background: #fff; color: #374151; text-decoration: none; white-space: nowrap; font: 600 13px "DM Sans", Inter, system-ui, sans-serif; transition: background .15s, border-color .15s; }
        @media (hover: hover) { .hs-link:hover { background: #F9FAFB; border-color: #9CA3AF; } }
        .hs-link:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        .hs-route { display: flex; align-items: center; justify-content: center; min-height: 48px; max-width: 768px; padding: 10px 16px; margin: 0 auto 14px; box-sizing: border-box; border-radius: 12px; background: #111827; color: #fff; text-align: center; text-decoration: none; font: 700 14px "DM Sans", Inter, system-ui, sans-serif; }
        .hs-tab:focus-visible, .hs-chip:focus-visible, .hs-route:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        @media (min-width: 640px) {
          .hs-card { flex-direction: row; align-items: flex-start; }
          .hs-art { width: 112px; height: 112px; }
          .hs-art svg { width: 80px; height: 80px; }
        }
        @media (min-width: 768px) {
          .hs-art { width: 128px; height: 128px; }
          .hs-art svg { width: 92px; height: 92px; }
          .hs-tabs { grid-template-columns: repeat(6, minmax(0, 1fr)); }
          .hs-links { display: flex; justify-content: flex-end; }
          .hs-link { padding: 6px 16px; }
          .hs-card { padding: 24px; }
          .hs-seoul { flex-direction: row; align-items: center; gap: 32px; padding: 20px 28px; }
          .hs-mapbox { flex: 0 0 340px; width: 340px; }
          .hs-cluster-name { font-size: 26px; }
          .hs-chips { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .hs-chip-short { display: none; }
          .hs-chip-full { display: inline; }
        }
        @media (min-width: 1024px) {
          .hs-tabs { grid-template-columns: repeat(11, minmax(0, 1fr)); gap: 6px; }
          .hs-tab { padding: 8px 2px; font-size: 13px; }
        }
      `}</style>

      <div className="hs-tabs notranslate" translate="no" role="tablist" aria-label="City">
        {HOTSPOT_CITIES.map(c => (
          <button key={c.id} type="button" role="tab" className="hs-tab" aria-selected={c.id === city.id} onClick={() => setCityId(c.id)}>{c.name}</button>
        ))}
      </div>

      {!city.clusters && (
        <section className="hs-seoul" aria-label="Choose a city on the map">
          {/* 서울 ↔ 전국 지도가 바뀔 때만 다시 그려 페이드한다 — 지방 도시끼리는 강조 핀만 옮겨 간다 */}
          <div key="korea" className="hs-mapbox">
            <KoreaRouteMap to={city.id} onPick={setCityId} />
          </div>
          <div className="hs-side">
            <h2 key={city.id} className="hs-cluster-name notranslate" translate="no">{city.name}</h2>
            <p key={`${city.id}-theme`} className="hs-cluster-theme">
              <span className="notranslate" translate="no" lang="ko">{CITIES.find(c => c.id === city.id)?.ko}</span> · {spots.length} spots
            </p>
            <p className="hs-city-hint">Tap a city on the map to see its spots.</p>
          </div>
        </section>
      )}

      {city.clusters && cluster && (
        <section className="hs-seoul" aria-label="Choose a Seoul area">
          <div key="seoul" className="hs-mapbox">
            <SeoulHotspotMap selected={cluster.id} onSelect={setClusterId} />
          </div>
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
          {spots.map(spot => (
            <article key={spot.name} className="hs-card">
              <CategoryArt category={spot.category} />
              <div className="hs-body">
                <CategoryBadge category={spot.category} />
              <h2 className="hs-name notranslate" translate="no">{spot.name}</h2>
              <p className="hs-ko notranslate" translate="no" lang="ko">{spot.ko}</p>
              <p className="hs-what">{spot.what}</p>
              <p className="hs-tip"><strong>Walking &amp; Transit tip</strong>{spot.tip}</p>
              <div className="hs-links notranslate" translate="no">
                <a className="hs-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot.ko} ${spot.name}`)}`} target="_blank" rel="noopener noreferrer" aria-label={`${spot.name} on Google Maps`}>🗺️ Google Maps</a>
                <a className="hs-link" href={`https://www.instagram.com/explore/tags/${encodeURIComponent(instagramTag(spot.ko))}/`} target="_blank" rel="noopener noreferrer" aria-label={`${spot.name} on Instagram`}>📸 Live Vibes</a>
              </div>
              </div>
            </article>
          ))}
        </div>
        {city.routeLink && <a className="hs-route" href={`/tools/transit-guide?to=${city.id}`}>Check Route from Seoul in Transit Guide →</a>}
      </div>

      <p className="tl-note">Opening days and hours can change, so check a map app before you head out.</p>
    </>
  )
}
