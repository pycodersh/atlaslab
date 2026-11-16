'use client'

/**
 * Explore Korea 지도 보기 — /blog?tab=explore-korea&view=map.
 *
 * 넓은 화면: 왼쪽 글 목록 + 오른쪽 지도. 폰(≤767px): 지도가 위, 미리보기 카드가 아래.
 * 핀: 호텔 = 진한 빨강(#C8102E), 장소 가이드 = 짙은 차콜. 오른쪽 위 토글로 Hotspot Finder 의 걷기 명소 핀을 겹친다.
 * 좌표 · 지역은 lib/blog/exploreRegions(호텔 = OSM 실측, 가이드 = 링크된 명소). 좌표 없는 글은 목록에만 있다.
 *
 * 바탕은 OSM 표준 타일(키 없음, 가벼운 사용 · 표기 필수). Leaflet 은 window 를 만지므로 브라우저에서만 불러온다.
 */
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import type * as Leaflet from 'leaflet'
import { EXPLORE_REGIONS, PLACED_SPOTS, type LL } from '@/lib/blog/exploreRegions'
import type { BlogCard } from '@/lib/blog/indexView'
import type { BlogThumbnail } from '@/lib/blog/thumbnail'

const SERIF = '"Playfair Display", Georgia, serif'
const BODY = '"DM Sans","Inter",system-ui,sans-serif'
const KOREA: LL = [36.2, 127.9]

const esc = (s: string) => s.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`)
const thumbSrc = (t: BlogThumbnail | null) => (!t ? null : t.kind === 'youtube' ? `https://img.youtube.com/vi/${t.videoId}/hqdefault.jpg` : t.src)
const isHotel = (p: BlogCard) => p.category === 'Hotels'
const hrefOf = (p: BlogCard) => `/blog/${p.locale}/${p.app}/${p.slug}`
const regionName = (p: BlogCard) => p.geo?.regions.map(r => EXPLORE_REGIONS.find(x => x.id === r)?.name).join(' · ') || 'Across Korea'

const CSS = `
.xm { display: grid; grid-template-columns: minmax(0, 360px) minmax(0, 1fr); gap: 0; margin-bottom: 64px;
  border: 1px solid #E5E1DC; background: #fff; }
.xm-list { height: 640px; overflow-y: auto; border-right: 1px solid #E5E1DC; overscroll-behavior: contain; }
.xm-count { position: sticky; top: 0; z-index: 1; padding: 12px 16px; background: #fff; border-bottom: 1px solid #EFECE8;
  font: 500 12px ${BODY}; color: #737373; letter-spacing: .02em; }
.xm-item { display: flex; gap: 12px; width: 100%; padding: 12px 16px; border: 0; border-bottom: 1px solid #F1EEEA; border-left: 3px solid transparent;
  background: #fff; text-align: left; cursor: pointer; color: inherit; font: inherit; transition: background .15s; }
.xm-item:hover { background: #F9F8F6; }
.xm-item.is-active { background: #F6F3EF; border-left-color: #C8102E; }
.xm-item:focus-visible { outline: 2px solid #C8102E; outline-offset: -2px; }
.xm-thumb { flex: 0 0 72px; width: 72px; height: 54px; border-radius: 4px; object-fit: cover; background: #EFECE8; }
.xm-body { min-width: 0; flex: 1; }
.xm-kicker { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font: 700 9.5px ${BODY}; letter-spacing: .12em; text-transform: uppercase; color: #525252; }
.xm-kicker i { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #2B2B2B; }
.xm-item.is-hotel .xm-kicker { color: #C8102E; }
.xm-item.is-hotel .xm-kicker i { background: #C8102E; }
.xm-title { font: 700 14px/1.3 ${SERIF}; color: #111; letter-spacing: -.01em;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.xm-meta { margin-top: 4px; font: 400 11.5px ${BODY}; color: #8A8580; }
.xm-open { display: inline-block; margin-top: 6px; font: 600 12px ${BODY}; color: #C8102E; text-decoration: none; }
.xm-open:hover { text-decoration: underline; text-underline-offset: 3px; }

.xm-mapwrap { position: relative; height: 640px; min-width: 0; }
.xm-map { position: absolute; inset: 0; background: #EDEAE4; }
.xm-toggle { position: absolute; top: 12px; right: 12px; z-index: 500; min-height: 36px; padding: 7px 14px; border: 1px solid #D6D3D1;
  border-radius: 999px; background: rgba(255,255,255,.95); color: #1C1917; cursor: pointer; font: 600 12.5px ${BODY};
  box-shadow: 0 1px 3px rgba(0,0,0,.12); transition: background .15s, color .15s, border-color .15s; }
.xm-toggle:hover { border-color: #A8A29E; }
.xm-toggle[aria-pressed="true"] { background: #1F4D3A; border-color: #1F4D3A; color: #fff; }
.xm-toggle:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
.xm-legend { position: absolute; left: 12px; bottom: 26px; z-index: 500; display: flex; flex-wrap: wrap; gap: 4px 12px; max-width: calc(100% - 24px);
  padding: 6px 10px; border-radius: 6px; background: rgba(255,255,255,.92); box-shadow: 0 1px 2px rgba(0,0,0,.1); font: 500 11.5px ${BODY}; color: #3F3A36; }
.xm-legend span { display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
.xm-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1px rgba(0,0,0,.15); }

/* 핀 — Leaflet divIcon */
.xm-pin { border-radius: 50%; border: 2.5px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,.4); box-sizing: border-box; }
.xm-pin--hotel { background: #C8102E; }
.xm-pin--place { background: #2B2B2B; }
.xm-pin--spot { background: #fff; border: 3px solid #1F4D3A; box-shadow: 0 1px 2px rgba(0,0,0,.3); }
.xm-pin.is-active { box-shadow: 0 0 0 4px rgba(200,16,46,.3), 0 1px 3px rgba(0,0,0,.4); }
.xm .leaflet-popup-content { margin: 10px 12px; font: 400 12.5px/1.45 ${BODY}; color: #3F3A36; }
.xm .leaflet-popup-content b { display: block; font: 700 13.5px/1.3 ${SERIF}; color: #111; }
.xm .leaflet-popup-content a { color: #C8102E; font-weight: 600; text-decoration: none; }
.xm .leaflet-popup-content .xm-pk { display: block; margin-bottom: 2px; font: 700 9.5px ${BODY}; letter-spacing: .12em; text-transform: uppercase; color: #737373; }
.xm .leaflet-container { font-family: ${BODY}; }

@media (max-width: 767px) {
  .xm { display: flex; flex-direction: column; }
  .xm-mapwrap { order: -1; height: 56vh; min-height: 320px; max-height: 460px; }
  .xm-list { height: auto; overflow: visible; border-right: 0; }
  .xm-count { position: static; }
  .xm-toggle { top: 10px; right: 10px; padding: 6px 12px; font-size: 12px; }
  .xm-legend { left: 10px; bottom: 22px; font-size: 11px; }
}
/* 폰: 지도 · 카드를 화면 끝까지(.bl-wrap 좌우 20px 를 되돌린다) */
@media (max-width: 700px) {
  .xm { border-left: 0; border-right: 0; margin-left: -20px; margin-right: -20px; }
}
`

export function ExploreMap({ posts, region }: { posts: BlogCard[]; region: string | null }) {
  const mapEl = useRef<HTMLDivElement>(null)
  const listEl = useRef<HTMLDivElement>(null)
  const L = useRef<typeof Leaflet | null>(null)
  const map = useRef<Leaflet.Map | null>(null)
  const postLayer = useRef<Leaflet.LayerGroup | null>(null)
  const spotLayer = useRef<Leaflet.LayerGroup | null>(null)
  const markers = useRef(new Map<string, Leaflet.Marker>())
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [showSpots, setShowSpots] = useState(false)

  const pinned = useMemo(() => posts.filter(p => p.geo?.ll), [posts])
  const spots = useMemo(() => PLACED_SPOTS.filter(s => s.ll && (!region || s.city === region)), [region])

  // 지도 한 번 만들기
  useEffect(() => {
    let dead = false
    import('leaflet').then(mod => {
      if (dead || !mapEl.current) return
      const Lf = (mod as unknown as { default?: typeof Leaflet }).default ?? (mod as typeof Leaflet)
      L.current = Lf
      const m = Lf.map(mapEl.current, { center: KOREA, zoom: 7, scrollWheelZoom: false, zoomControl: true, attributionControl: true })
      Lf.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(m)
      // 휠 확대는 지도를 한 번 누른 뒤에만 — 페이지 스크롤이 지도에 붙잡히지 않게
      m.once('focus', () => m.scrollWheelZoom.enable())
      m.on('click', () => m.scrollWheelZoom.enable())
      postLayer.current = Lf.layerGroup().addTo(m)
      spotLayer.current = Lf.layerGroup().addTo(m)
      map.current = m
      setReady(true)
    })
    return () => { dead = true; map.current?.remove(); map.current = null }
  }, [])

  // 글 핀
  useEffect(() => {
    const Lf = L.current, layer = postLayer.current
    if (!ready || !Lf || !layer) return
    layer.clearLayers()
    markers.current.clear()
    for (const p of pinned) {
      const hotel = isHotel(p)
      const size = hotel ? 20 : 18
      const mk = Lf.marker(p.geo!.ll as LL, {
        icon: Lf.divIcon({ className: `xm-pin xm-pin--${hotel ? 'hotel' : 'place'}`, iconSize: [size, size] }),
        title: p.title, zIndexOffset: hotel ? 200 : 100, keyboard: true,
      }).bindPopup(`<span class="xm-pk">${hotel ? 'Hotel' : 'Place guide'} · ${esc(regionName(p))}</span><b>${esc(p.title)}</b><a href="${hrefOf(p)}">Read the ${hotel ? 'review' : 'guide'} →</a>`, { maxWidth: 260 })
      mk.on('click', () => {
        setActive(p.slug)
        // 넓은 화면에서만 목록을 그 글로 굴린다 — 폰은 목록이 지도 아래라 화면이 지도를 떠나 버린다
        if (window.matchMedia('(min-width: 768px)').matches) {
          listEl.current?.querySelector(`[data-slug="${p.slug}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
      })
      markers.current.set(p.slug, mk)
      layer.addLayer(mk)
    }
  }, [ready, pinned])

  // 걷기 명소 핀(토글)
  useEffect(() => {
    const Lf = L.current, layer = spotLayer.current
    if (!ready || !Lf || !layer) return
    layer.clearLayers()
    if (!showSpots) return
    for (const s of spots) {
      const guide = s.guide ? `<br><a href="/blog/en/k-patto/${s.guide.slug}${s.guide.anchor ? `#${s.guide.anchor}` : ''}">${esc(s.guide.label)} →</a>` : ''
      layer.addLayer(Lf.marker(s.ll as LL, {
        icon: Lf.divIcon({ className: 'xm-pin xm-pin--spot', iconSize: [14, 14] }), title: s.name, zIndexOffset: 0,
      }).bindPopup(`<span class="xm-pk">Walking hotspot</span><b>${esc(s.name)}</b><span lang="ko">${esc(s.ko)}</span> · ${esc(s.what)}${guide}`, { maxWidth: 260 }))
    }
  }, [ready, showSpots, spots])

  // 보이는 핀에 맞춰 화면을 맞춘다(지역 · 글 · 명소 토글이 바뀔 때)
  useEffect(() => {
    const Lf = L.current, m = map.current
    if (!ready || !Lf || !m) return
    const pts = [...pinned.map(p => p.geo!.ll as LL), ...(showSpots ? spots.map(s => s.ll as LL) : [])]
    m.invalidateSize()
    if (!pts.length) m.setView(KOREA, 7)
    else if (pts.length === 1) m.setView(pts[0], 14)
    else m.fitBounds(Lf.latLngBounds(pts), { padding: [36, 36], maxZoom: 14 })
  }, [ready, pinned, spots, showSpots])

  // 고른 글 핀 강조
  useEffect(() => {
    markers.current.forEach((mk, slug) => mk.getElement()?.classList.toggle('is-active', slug === active))
  }, [active, ready, pinned])

  const pick = (p: BlogCard) => {
    setActive(p.slug)
    const mk = markers.current.get(p.slug)
    if (!mk || !map.current) return
    map.current.flyTo(mk.getLatLng(), Math.max(map.current.getZoom(), 14), { duration: 0.6 })
    mk.openPopup()
    // 폰은 지도가 위에 있으니 지도로 올려 보여 준다
    if (!window.matchMedia('(min-width: 768px)').matches) mapEl.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  const noPin = posts.length - pinned.length

  return (
    <div className="xm">
      <style>{CSS}</style>
      <div className="xm-list" ref={listEl}>
        <div className="xm-count">
          {posts.length} {posts.length === 1 ? 'article' : 'articles'} · {pinned.length} on the map{noPin ? ` · ${noPin} without a single spot` : ''}
        </div>
        {posts.map(p => {
          const src = thumbSrc(p.thumb)
          const hotel = isHotel(p)
          return (
            <div key={p.slug} data-slug={p.slug} className={`xm-item${hotel ? ' is-hotel' : ''}${active === p.slug ? ' is-active' : ''}`}
              role="button" tabIndex={0} aria-label={`${p.title} — show on map`}
              onClick={() => pick(p)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(p) } }}>
              {src ? <img className="xm-thumb" src={src} alt="" loading="lazy" /> : <span className="xm-thumb" aria-hidden="true" />}
              <div className="xm-body">
                <div className="xm-kicker notranslate" translate="no"><i aria-hidden="true" />{hotel ? 'Hotel' : 'Place'} · {regionName(p)}</div>
                <div className="xm-title">{p.title}</div>
                <div className="xm-meta">{p.readMin} min read{p.geo?.ll ? '' : ' · Not on the map'}</div>
                <a className="xm-open" href={hrefOf(p)} onClick={e => e.stopPropagation()}>Read →</a>
              </div>
            </div>
          )
        })}
      </div>
      <div className="xm-mapwrap">
        <div className="xm-map" ref={mapEl} role="region" aria-label="Map of Explore Korea articles" />
        <button type="button" className="xm-toggle" aria-pressed={showSpots} onClick={() => setShowSpots(v => !v)}>
          {showSpots ? '− Hide Walking Hotspots' : '+ Show Walking Hotspots'}
        </button>
        <div className="xm-legend" aria-hidden="true">
          <span><i style={{ background: '#C8102E' }} />Hotels</span>
          <span><i style={{ background: '#2B2B2B' }} />Places</span>
          {showSpots && <span><i style={{ background: '#fff', borderColor: '#1F4D3A' }} />Walking hotspots</span>}
        </div>
      </div>
    </div>
  )
}
