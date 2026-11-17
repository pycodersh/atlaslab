'use client'

import { useState } from 'react'
import { HOTSPOT_CITIES, type SeoulClusterId } from '@/data/regionalHotspots'
import { CategoryArt } from './CategoryBadge'
import { HOTSPOT_PHOTOS } from '@/data/hotspotPhotos'
import type { CityId } from '@/data/transitRoutes'
import { PenMap } from '@/components/maps/PenMap'
import { NATIONAL, PLACE_LABELS } from '@/lib/maps/penmap'
import { SeoulAreaMap } from './SeoulAreaMap'
import { PLACED_SPOTS, km, type LL } from '@/lib/blog/exploreRegions'
import type { ExplorePost } from '@/lib/blog/explorePosts'
import type { BlogThumbnail } from '@/lib/blog/thumbnail'

const thumbSrc = (t: BlogThumbnail | null) => (!t ? null : t.kind === 'youtube' ? `https://img.youtube.com/vi/${t.videoId}/hqdefault.jpg` : t.src)
const fmtKm = (d: number) => (d < 1 ? `${Math.round(d * 10) * 100} m` : `${d.toFixed(1)} km`)

/**
 * 고른 도시 · 권역에 맞는 Explore Korea 글 — 지역 · 좌표는 lib/blog/exploreRegions 가 자동으로 잡는다.
 * 호텔: 같은 권역(서울) · 같은 도시 호텔을 명소에서 가까운 순으로. 서울 권역에 호텔이 없으면 가장 가까운 두 곳.
 * 코스 가이드는 여기서 고르지 않는다 — 명소들이 링크하는 가이드 하나를 목록 맨 위 카드로 보여 준다(courseOf).
 */
function pickExplore(posts: ExplorePost[], city: string, area: string | null, deck: string[]) {
  const deckLL = PLACED_SPOTS.filter(s => deck.includes(s.name) && s.ll)
  const nearest = (ll: LL | null) => {
    if (!ll) return null
    let best: { name: string; d: number } | null = null
    for (const s of deckLL) { const d = km(ll, s.ll!); if (!best || d < best.d) best = { name: s.name, d } }
    return best
  }
  const inCity = posts.filter(p => p.geo.regions.includes(city as never))
  const hotelsAll = inCity.filter(p => p.hotel && p.geo.ll).map(p => ({ p, near: nearest(p.geo.ll) }))
    .sort((a, b) => (a.near?.d ?? 99) - (b.near?.d ?? 99))
  const inArea = area ? hotelsAll.filter(h => h.p.geo.area === area) : hotelsAll
  const hotels = (inArea.length ? inArea : hotelsAll.slice(0, 2)).slice(0, 4)
  return { hotels, hotelsNearby: !!area && !inArea.length }
}

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

const spotId = (name: string) => `spot-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

// 이 권역 · 도시의 코스 가이드 — 명소들이 가장 많이 링크하는 글 하나
function courseOf(spots: { guide?: { slug: string; label: string } }[]) {
  const n = new Map<string, number>()
  for (const s of spots) if (s.guide) n.set(s.guide.slug, (n.get(s.guide.slug) ?? 0) + 1)
  const slug = [...n].sort((a, b) => b[1] - a[1])[0]?.[0]
  return slug ? spots.find(s => s.guide?.slug === slug)!.guide! : null
}

// 지도 위 도시 자리(전국 지도) — 영문 지명 표의 좌표
const cityLL = (id: string) => PLACE_LABELS.find(l => l.name.toLowerCase() === id)?.ll

export function HotspotFinder({ posts = [] }: { posts?: ExplorePost[] }) {
  const [cityId, setCityId] = useState<CityId>('seoul')
  const [clusterId, setClusterId] = useState<SeoulClusterId>('jongno')
  const city = HOTSPOT_CITIES.find(c => c.id === cityId) ?? HOTSPOT_CITIES[0]
  const cluster = city.clusters?.find(c => c.id === clusterId)
  const spots = cluster?.spots ?? city.spots
  const ek = pickExplore(posts, city.id, cluster?.id ?? null, spots.map(s => s.name))
  const placeName = cluster ? `${city.name} · ${cluster.name}` : city.name

  return (
    <>
      <style>{`
        .tl-wrap.hs-wrap { max-width: 1040px; }
        .hs-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 20px; }
        .hs-tab { min-height: 44px; padding: 8px 4px; border: 1px solid #E5E7EB; border-radius: 12px; background: #fff; color: #374151; cursor: pointer; font: 600 14px "DM Sans", Inter, system-ui, sans-serif; }
        .hs-tab[aria-selected="true"] { background: #111827; border-color: #111827; color: #fff; }

        .hs-seoul { display: flex; flex-direction: column; gap: 14px; padding: 16px; margin-bottom: 16px; background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; }
        .hs-mapbox { width: 100%; }
        .hs-penmap { width: 100%; height: 320px; border: 1px solid #E5E7EB; border-radius: 12px; }
        .hs-mapbox .sa-map { border: 1px solid #E5E7EB; border-radius: 12px; }
        .hs-name-link { color: inherit; text-decoration: none; background-image: linear-gradient(#9E2B25, #9E2B25); background-size: 0 1.5px; background-position: 0 100%; background-repeat: no-repeat; transition: background-size .2s, color .15s; }
        @media (hover: hover) { .hs-name-link:hover { color: #9E2B25; background-size: 100% 1.5px; } }
        .hs-name-link:focus-visible { outline: 2px solid #9E2B25; outline-offset: 2px; border-radius: 2px; }
        .hs-course { display: flex; align-items: center; gap: 14px; max-width: 768px; margin: 0 auto 14px; padding: 12px; box-sizing: border-box;
          background: #fff; border: 1px solid #E5E7EB; border-left: 3px solid #9E2B25; border-radius: 14px; color: inherit; text-decoration: none; transition: border-color .15s, box-shadow .15s; }
        @media (hover: hover) { .hs-course:hover { box-shadow: 0 2px 10px rgba(0,0,0,.06); border-color: #D1D5DB; border-left-color: #9E2B25; } }
        .hs-course:focus-visible { outline: 2px solid #9E2B25; outline-offset: 2px; }
        .hs-course img { flex: 0 0 88px; width: 88px; height: 66px; border-radius: 8px; object-fit: cover; }
        .hs-course-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .hs-course-k { font: 700 10.5px "DM Sans", Inter, system-ui, sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #9E2B25; }
        .hs-course-t { font-family: "Playfair Display", Georgia, serif; font-size: 16px; font-weight: 700; line-height: 1.3; color: #111827;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .hs-city-hint { margin: 0; font-size: 13px; color: #6B7280; }
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
        .hs-card { display: flex; flex-direction: column; background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.05); transition: border-color .15s; }
        @media (hover: hover) { .hs-card:hover { border-color: #D1D5DB; } .hs-tab:not([aria-selected="true"]):hover { border-color: #9CA3AF; } }
        .hs-art { position: relative; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-sizing: border-box; width: 96px; aspect-ratio: 1; padding-bottom: 14px; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,.08); }
        .hs-art img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
        .hs-art svg { display: block; width: 58px; height: 58px; }
        .hs-theme { position: absolute; left: 50%; bottom: 5px; transform: translateX(-50%); box-sizing: border-box; width: max-content; max-width: calc(100% - 8px); padding: 2px 6px; border-radius: 6px; background: rgba(0,0,0,.5); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); color: #fff; font-size: 11px; font-weight: 600; line-height: 1.2; text-align: center; }
        .hs-head { display: flex; align-items: flex-start; gap: 14px; }
        .hs-titles { flex: 1; min-width: 0; }
        .hs-name { margin: 0; font-family: "Playfair Display", Georgia, serif; font-size: 20px; font-weight: 700; line-height: 1.25; color: #111827; }
        .hs-ko { margin: 4px 0 0; font-family: Pretendard, "DM Sans", system-ui, sans-serif; font-size: 14px; font-weight: 500; color: #6B7280; }
        .hs-what { margin: 6px 0 0; font-size: 14px; line-height: 1.55; color: #374151; }
        .hs-tip { margin: 12px 0 0; padding-top: 10px; border-top: 1px solid #F1F5F9; font-size: 12px; line-height: 1.5; color: #64748B; }
        .hs-links { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
        .hs-link { display: flex; align-items: center; justify-content: center; gap: 6px; min-height: 44px; padding: 6px 4px; box-sizing: border-box; border: 1px solid #E2E8F0; border-radius: 12px; background: #fff; color: #334155; text-decoration: none; white-space: nowrap; font: 600 12px "DM Sans", Inter, system-ui, sans-serif; transition: background .15s, border-color .15s; }
        @media (hover: hover) { .hs-link:hover { background: #F9FAFB; border-color: #9CA3AF; } }
        .hs-link:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        /* 카드 아래 버튼 줄 — Google Maps · Live Vibes 두 개(가이드 링크는 명소 제목이 맡는다) */
        .hs-foot { display: flex; flex-direction: column; }
        .hs-route { display: flex; align-items: center; justify-content: center; min-height: 48px; max-width: 768px; padding: 10px 16px; margin: 0 auto 14px; box-sizing: border-box; border-radius: 12px; background: #111827; color: #fff; text-align: center; text-decoration: none; font: 700 14px "DM Sans", Inter, system-ui, sans-serif; }
        .hs-tab:focus-visible, .hs-chip:focus-visible, .hs-route:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        /* Explore Korea 카드 — 명소 덱과 같은 폭, 흰 카드 · 세리프 제목. 폰 1열, 640px~ 2열 */
        .hs-ek { max-width: 768px; margin: 8px auto 22px; padding-top: 22px; border-top: 1px solid #E5E7EB; }
        .hs-ek-h { margin: 0; font-family: "Playfair Display", Georgia, serif; font-size: 20px; font-weight: 700; line-height: 1.25; color: #111827; }
        .hs-ek-sub { margin: 2px 0 12px; font-size: 13px; color: #6B7280; }
        .hs-ek-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; margin-bottom: 20px; }
        .hs-ek-card { display: flex; gap: 12px; align-items: center; min-width: 0; padding: 10px; background: #fff; border: 1px solid #E5E7EB;
          border-left: 3px solid #2B2B2B; border-radius: 12px; color: inherit; text-decoration: none; transition: border-color .15s, box-shadow .15s; }
        .hs-ek-card.is-hotel { border-left-color: #C8102E; }
        @media (hover: hover) { .hs-ek-card:hover { border-color: #D1D5DB; box-shadow: 0 2px 8px rgba(0,0,0,.06); } .hs-ek-card.is-hotel:hover { border-left-color: #C8102E; } .hs-ek-card:not(.is-hotel):hover { border-left-color: #2B2B2B; } }
        .hs-ek-card:focus-visible, .hs-ek-more:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        .hs-ek-card img, .hs-ek-ph { flex: 0 0 84px; width: 84px; height: 63px; border-radius: 8px; object-fit: cover; background: #F3F4F6; }
        .hs-ek-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .hs-ek-k { font: 700 10px "DM Sans", Inter, system-ui, sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #525252;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hs-ek-card.is-hotel .hs-ek-k { color: #C8102E; }
        .hs-ek-t { font-family: "Playfair Display", Georgia, serif; font-size: 15px; font-weight: 700; line-height: 1.3; color: #111827;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .hs-ek-more { display: inline-flex; align-items: center; min-height: 32px; color: #C8102E; text-decoration: none; font: 600 13px "DM Sans", Inter, system-ui, sans-serif; }
        @media (hover: hover) { .hs-ek-more:hover { text-decoration: underline; text-underline-offset: 3px; } }
        @media (min-width: 640px) { .hs-ek-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        /* 폰은 글 칸이 좁아 버튼 글자가 넘치므로 버튼 줄만 썸네일 아래까지 펼친다 */
        @media (max-width: 639px) {
          .hs-name { font-size: 18px; line-height: 1.35; }
          .hs-ko { margin-top: 2px; font-size: 12px; }
          .hs-what { margin-top: 4px; font-size: 12px; line-height: 1.625; color: #334155; }
        }
        @media (min-width: 640px) {
          .hs-art { width: 112px; }
          .hs-art svg { width: 68px; height: 68px; }
        }
        @media (min-width: 768px) {
          .hs-tabs { grid-template-columns: repeat(6, minmax(0, 1fr)); }
          .hs-links { display: flex; justify-content: flex-end; }
          .hs-foot { flex-direction: row-reverse; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; }
          .hs-foot .hs-links { margin-top: 0; }
          .hs-link { min-height: 36px; padding: 4px 14px; font-size: 12px; }
          .hs-card { padding: 20px; }
          .hs-head { gap: 20px; }
          .hs-seoul { flex-direction: row; align-items: center; gap: 32px; padding: 20px 28px; }
          .hs-mapbox { flex: 0 0 420px; width: 420px; }
          .hs-penmap { height: 340px; }
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

      {/* 지도 — 서울은 실제 구 경계로 그린 여섯 권역(고른 권역만 딥 레드), 다른 도시는 전국 지도에 그 도시 핀 · 이름만 강조 */}
      <section className="hs-seoul" aria-label={cluster ? 'Choose a Seoul area' : `${city.name} on the map of Korea`}>
        <div className="hs-mapbox">
          {cluster ? (
            <SeoulAreaMap selected={cluster.id} onSelect={setClusterId} names={Object.fromEntries((city.clusters ?? []).map(c => [c.id, c.short]))} />
          ) : (
            <PenMap
              className="hs-penmap"
              view={NATIONAL}
              interactive={false}
              highlight={city.id}
              pins={cityLL(city.id) ? [{ id: city.id, ll: cityLL(city.id)!, kind: 'hotel' as const, label: city.name }] : []}
              ariaLabel={`Map of South Korea with ${city.name} marked`}
            />
          )}
        </div>
        <div className="hs-side">
          <h2 key={cluster?.id ?? city.id} className="hs-cluster-name notranslate" translate="no">{cluster?.name ?? city.name}</h2>
          <p key={`${cluster?.id ?? city.id}-theme`} className="hs-cluster-theme">{cluster ? cluster.theme : `${spots.length} walking spots`}</p>
          {city.clusters && cluster ? (
            <div className="hs-chips notranslate" translate="no" role="group" aria-label="Seoul areas">
              {city.clusters.map(c => (
                <button key={c.id} type="button" className="hs-chip" aria-pressed={c.id === cluster.id} onClick={() => setClusterId(c.id)}>
                  <span className="hs-chip-short">{c.short}</span>
                  <span className="hs-chip-full">{c.name}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* key: 자동 번역이 글자 노드를 바꿔 끼우고, 바뀔 때마다 카드가 부드럽게 나타나게 새로 그린다 */}
      <div key={`${city.id}-${cluster?.id ?? ''}`} role="tabpanel" aria-label={cluster?.name ?? city.name}>
        {/* 이 권역 · 도시의 걷기 코스 가이드 — 명소 목록 맨 위 카드 하나 */}
        {(() => {
          const g = courseOf(spots); if (!g) return null
          const post = posts.find(p => p.slug === g.slug)
          const title = post?.title ?? g.label.split(' · ')[0]
          return (
            <a className="hs-course" href={`/blog/en/k-patto/${g.slug}`}>
              {post && thumbSrc(post.thumb) ? <img src={thumbSrc(post.thumb)!} alt="" loading="lazy" /> : null}
              <span className="hs-course-body">
                <span className="hs-course-k">Walking Course Guide</span>
                <span className="hs-course-t">{title} →</span>
              </span>
            </a>
          )
        })()}
        <div className="hs-deck">
          {spots.map(spot => (
            <article key={spot.name} id={spotId(spot.name)} className="hs-card">
              {/* 위: 사진 + 제목 묶음 / 아래: 팁과 버튼은 카드 전체 폭을 쓴다 */}
              <div className="hs-head">
                <CategoryArt category={spot.category} photo={HOTSPOT_PHOTOS[spot.name]} alt={spot.name} />
                <div className="hs-titles">
                  {/* 제목이 그 명소를 다룬 가이드 절로 가는 링크 */}
                  <h2 className="hs-name notranslate" translate="no">{spot.guide
                    ? <a className="hs-name-link" href={`/blog/en/k-patto/${spot.guide.slug}${spot.guide.anchor ? `#${spot.guide.anchor}` : ''}`}>{spot.name}</a>
                    : spot.name}</h2>
                  <p className="hs-ko notranslate" translate="no" lang="ko">{spot.ko}</p>
                  <p className="hs-what">{spot.what}</p>
                </div>
              </div>
              <p className="hs-tip">{metaTip(spot.tip)}</p>
              <div className="hs-foot">
              <div className="hs-links notranslate" translate="no">
                <a className="hs-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot.ko} ${spot.name}`)}`} target="_blank" rel="noopener noreferrer" aria-label={`${spot.name} on Google Maps`}><GoogleIcon />Google Maps</a>
                <a className="hs-link" href={`https://www.instagram.com/explore/tags/${encodeURIComponent(instagramTag(spot.ko))}/`} target="_blank" rel="noopener noreferrer" aria-label={`${spot.name} on Instagram`}><InstagramIcon />Live Vibes</a>
              </div>
              </div>
            </article>
          ))}
        </div>

        {/* Explore Korea — 이 지역 호텔 리뷰 · 하루 코스 가이드(우리 글, 같은 탭으로 연다) */}
        {ek.hotels.length > 0 && (
          <section className="hs-ek" aria-label={`Explore Korea articles for ${placeName}`}>
            {ek.hotels.length > 0 && (
              <>
                <h2 className="hs-ek-h">Where to stay {ek.hotelsNearby ? 'nearby' : `in ${cluster ? cluster.short : city.name}`}</h2>
                <p className="hs-ek-sub">Explore Korea hotel reviews{ek.hotelsNearby ? ' — no reviewed hotel in this area yet, so these are the closest' : ''}</p>
                <div className="hs-ek-grid">
                  {ek.hotels.map(({ p, near }) => (
                    <a key={p.slug} className="hs-ek-card is-hotel" href={`/blog/en/k-patto/${p.slug}`}>
                      {thumbSrc(p.thumb) ? <img src={thumbSrc(p.thumb)!} alt="" loading="lazy" /> : <span className="hs-ek-ph" aria-hidden="true" />}
                      <span className="hs-ek-body">
                        <span className="hs-ek-k">Hotel{near ? <> · <span className="notranslate" translate="no">{fmtKm(near.d)} to {near.name}</span></> : null}</span>
                        <span className="hs-ek-t">{p.title}</span>
                      </span>
                    </a>
                  ))}
                </div>
              </>
            )}
            <a className="hs-ek-more" href={`/blog?tab=explore-korea&region=${city.id}&view=map`}>See {city.name} hotels and guides on the Explore Korea map →</a>
          </section>
        )}
        {city.routeLink && <a className="hs-route" href={`/tools/intercity-transit?to=${city.id}`}>Check Route from Seoul in Transit Guide →</a>}
      </div>

      {/* 그림 안내 · 영업시간 확인 안내는 한 문장으로 합쳐 페이지의 About this tool 참고 문구로 옮겼다 */}
    </>
  )
}
