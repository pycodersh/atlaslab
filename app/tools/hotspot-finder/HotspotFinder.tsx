'use client'

import { useState } from 'react'
import { HOTSPOT_CITIES, type SeoulClusterId } from '@/data/regionalHotspots'
import { CategoryArt } from './CategoryBadge'
import { HOTSPOT_PHOTOS } from '@/data/hotspotPhotos'
import { CITIES, type CityId } from '@/data/transitRoutes'
import { KoreaRouteMap } from '../KoreaRouteMap'
import { SeoulHotspotMap } from './SeoulHotspotMap'

// 해시태그에는 공백 · & · 가운뎃점을 못 쓴다 — '명동거리 & 야시장' 은 앞쪽 이름 하나만 태그로 쓴다
const instagramTag = (ko: string) => ko.split(/[&·]/)[0].replace(/\s+/g, '')

// 문장으로 쓴 팁을 '역 · 휴무일' 형태의 메타 문구로 잇는다 — Univ. 같은 약어의 마침표는 문장 끝이 아니다
const metaTip = (tip: string) => tip.replace(/\.$/, '').replace(/(\S+)\. (?=[A-Z])/g, (match, word) => (word === 'Univ' ? match : `${word} · `))

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-16.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2" aria-hidden="true">
      <rect x="2.500" y="2.500" width="19" height="19" rx="5.500" />
      <circle cx="12" cy="12" r="4.500" />
      <circle cx="17.500" cy="6.500" r="1" fill="#F43F5E" stroke="none" />
    </svg>
  )
}

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
        .hs-card { display: flex; align-items: flex-start; gap: 14px; background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.05); transition: border-color .15s; }
        @media (hover: hover) { .hs-card:hover { border-color: #D1D5DB; } .hs-tab:not([aria-selected="true"]):hover { border-color: #9CA3AF; } }
        .hs-art { position: relative; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-sizing: border-box; width: 96px; aspect-ratio: 1; padding-bottom: 14px; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,.08); }
        .hs-art img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
        .hs-art svg { display: block; width: 58px; height: 58px; }
        .hs-theme { position: absolute; left: 50%; bottom: 5px; transform: translateX(-50%); box-sizing: border-box; width: max-content; max-width: calc(100% - 8px); padding: 2px 6px; border-radius: 6px; background: rgba(0,0,0,.5); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); color: #fff; font-size: 11px; font-weight: 600; line-height: 1.2; text-align: center; }
        .hs-body { flex: 1; min-width: 0; }
        .hs-name { margin: 0; font-family: "Playfair Display", Georgia, serif; font-size: 20px; font-weight: 700; line-height: 1.25; color: #111827; }
        .hs-ko { margin: 4px 0 0; font-family: Pretendard, "DM Sans", system-ui, sans-serif; font-size: 14px; font-weight: 500; color: #6B7280; }
        .hs-what { margin: 6px 0 0; font-size: 14px; line-height: 1.55; color: #374151; }
        .hs-tip { margin: 8px 0 0; padding-top: 8px; border-top: 1px solid #F1F5F9; font-size: 12px; font-weight: 500; line-height: 1.625; color: #64748B; }
        .hs-links { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
        .hs-link { display: flex; align-items: center; justify-content: center; gap: 6px; min-height: 44px; padding: 6px 4px; box-sizing: border-box; border: 1px solid #E2E8F0; border-radius: 12px; background: #fff; color: #334155; text-decoration: none; white-space: nowrap; font: 600 12px "DM Sans", Inter, system-ui, sans-serif; transition: background .15s, border-color .15s; }
        @media (hover: hover) { .hs-link:hover { background: #F9FAFB; border-color: #9CA3AF; } }
        .hs-link:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        .hs-route { display: flex; align-items: center; justify-content: center; min-height: 48px; max-width: 768px; padding: 10px 16px; margin: 0 auto 14px; box-sizing: border-box; border-radius: 12px; background: #111827; color: #fff; text-align: center; text-decoration: none; font: 700 14px "DM Sans", Inter, system-ui, sans-serif; }
        .hs-tab:focus-visible, .hs-chip:focus-visible, .hs-route:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        /* 폰은 글 칸이 좁아 버튼 글자가 넘치므로 버튼 줄만 썸네일 아래까지 펼친다 */
        @media (max-width: 639px) { .hs-links { margin-left: -110px; } }
        @media (min-width: 640px) {
          .hs-art { width: 112px; }
          .hs-art svg { width: 68px; height: 68px; }
        }
        @media (min-width: 768px) {
          .hs-tabs { grid-template-columns: repeat(6, minmax(0, 1fr)); }
          .hs-links { display: flex; justify-content: flex-end; }
          .hs-link { min-height: 36px; padding: 4px 14px; font-size: 12px; }
          .hs-card { gap: 20px; padding: 20px; }
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
              <CategoryArt category={spot.category} photo={HOTSPOT_PHOTOS[spot.name]} alt={spot.name} />
              <div className="hs-body">
              <h2 className="hs-name notranslate" translate="no">{spot.name}</h2>
              <p className="hs-ko notranslate" translate="no" lang="ko">{spot.ko}</p>
              <p className="hs-what">{spot.what}</p>
              <p className="hs-tip">{metaTip(spot.tip)}</p>
              <div className="hs-links notranslate" translate="no">
                <a className="hs-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot.ko} ${spot.name}`)}`} target="_blank" rel="noopener noreferrer" aria-label={`${spot.name} on Google Maps`}><GoogleIcon />Google Maps</a>
                <a className="hs-link" href={`https://www.instagram.com/explore/tags/${encodeURIComponent(instagramTag(spot.ko))}/`} target="_blank" rel="noopener noreferrer" aria-label={`${spot.name} on Instagram`}><InstagramIcon />Live Vibes</a>
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
