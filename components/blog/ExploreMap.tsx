'use client'

/**
 * Explore Korea 지도 보기 — /blog?tab=explore-korea 의 기본 화면(격자는 ?view=grid).
 *
 * 넓은 화면: 왼쪽 글 목록 + 오른쪽 펜화 지도. 폰(≤767px): 지도가 위, 미리보기 카드가 아래.
 * 목록은 서버에서도 그대로 그려진다(글 전부 링크) — 지도 그림만 브라우저에서 받아 끼운다.
 * 핀: 호텔 = 딥 레드 #9E2B25, 장소 가이드 = 먹색 #262422. 오른쪽 위 토글로 Hotspot Finder 의 걷기 명소 핀을 겹친다.
 * 지역 칩(?region=)을 고르면 그 지역 상세 그림으로 부드럽게 확대된다 — 서울은 한강과 여섯 권역 이름이 보인다.
 * 좌표 · 지역은 lib/blog/exploreRegions(호텔 = OSM 실측, 가이드 = 링크된 명소). 좌표 없는 글은 목록에만 있다.
 */
import { useMemo, useRef, useState } from 'react'
import { EXPLORE_REGIONS, PLACED_SPOTS } from '@/lib/blog/exploreRegions'
import { HOTSPOT_CITIES } from '@/data/regionalHotspots'
import type { BlogCard } from '@/lib/blog/indexView'
import type { BlogThumbnail } from '@/lib/blog/thumbnail'
import { NATIONAL, REGION_VIEW, type LL } from '@/lib/maps/penmap'
import { PenMap, type PenArea, type PenPin } from '@/components/maps/PenMap'

const SERIF = '"Playfair Display", Georgia, serif'
const BODY = '"DM Sans","Inter",system-ui,sans-serif'
const INK = '#262422'
const RED = '#9E2B25'

const thumbSrc = (t: BlogThumbnail | null) => (!t ? null : t.kind === 'youtube' ? `https://img.youtube.com/vi/${t.videoId}/hqdefault.jpg` : t.src)
const isHotel = (p: BlogCard) => p.category === 'Hotels'
const hrefOf = (p: BlogCard) => `/blog/${p.locale}/${p.app}/${p.slug}`
const regionName = (p: BlogCard) => p.geo?.regions.map(r => EXPLORE_REGIONS.find(x => x.id === r)?.name).join(' · ') || 'Across Korea'

// 서울 여섯 권역 이름표 자리 — 권역 명소들의 가운데
const SEOUL_AREAS: PenArea[] = (HOTSPOT_CITIES.find(c => c.id === 'seoul')?.clusters ?? []).map(cl => {
  const pts = PLACED_SPOTS.filter(s => s.area === cl.id && s.ll).map(s => s.ll!)
  return { id: cl.id, name: cl.short, ll: [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length] as LL }
})

const CSS = `
.xm { display: grid; grid-template-columns: minmax(0, 360px) minmax(0, 1fr); gap: 0; margin-bottom: 64px;
  border: 1px solid #E5E1DC; background: #fff; }
.xm-list { height: 640px; overflow-y: auto; border-right: 1px solid #E5E1DC; overscroll-behavior: contain; }
.xm-count { position: sticky; top: 0; z-index: 1; padding: 12px 16px; background: #fff; border-bottom: 1px solid #EFECE8;
  font: 500 12px ${BODY}; color: #737373; letter-spacing: .02em; }
.xm-item { display: flex; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #F1EEEA; border-left: 3px solid transparent;
  background: #fff; color: inherit; cursor: pointer; transition: background .15s; }
.xm-item:hover { background: #F9F8F6; }
.xm-item.is-active { background: #F6F3EF; border-left-color: ${RED}; }
.xm-item:focus-visible { outline: 2px solid ${RED}; outline-offset: -2px; }
.xm-thumb { flex: 0 0 72px; width: 72px; height: 54px; border-radius: 4px; object-fit: cover; background: #EFECE8; }
.xm-body { min-width: 0; flex: 1; }
.xm-kicker { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font: 700 9.5px ${BODY}; letter-spacing: .12em; text-transform: uppercase; color: #525252; }
.xm-kicker i { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${INK}; }
.xm-item.is-hotel .xm-kicker { color: ${RED}; }
.xm-item.is-hotel .xm-kicker i { background: ${RED}; }
.xm-title { display: block; font: 700 14px/1.3 ${SERIF}; color: #111; letter-spacing: -.01em; text-decoration: none;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.xm-title:hover { text-decoration: underline; text-underline-offset: 3px; }
.xm-meta { margin-top: 4px; font: 400 11.5px ${BODY}; color: #8A8580; }

.xm-mapwrap { position: relative; height: 640px; min-width: 0; }
.xm-map.pm { position: absolute; inset: 0; }
.xm-toggle { position: absolute; top: 12px; right: 12px; z-index: 3; min-height: 36px; padding: 7px 14px; border: 1px solid ${INK};
  border-radius: 999px; background: #F7F5EE; color: ${INK}; cursor: pointer; font: 600 12.5px ${BODY}; transition: background .15s, color .15s; }
.xm-toggle:hover { background: #EDE9DE; }
.xm-toggle[aria-pressed="true"] { background: ${INK}; color: #F7F5EE; }
.xm-toggle:focus-visible { outline: 2px solid ${RED}; outline-offset: 2px; }
/* 범례는 오른쪽 아래 바다(대한해협 · 동해 쪽) — 제주를 가리지 않는다 */
.xm-legend { position: absolute; right: 12px; bottom: 24px; z-index: 3; display: flex; flex-wrap: wrap; gap: 4px 12px; max-width: calc(100% - 24px);
  padding: 5px 10px; border: 1px solid rgba(38,36,34,.25); border-radius: 6px; background: rgba(247,245,238,.92); font: 500 11.5px ${BODY}; color: ${INK}; }
.xm-legend span { display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
.xm-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 50%; box-sizing: border-box; }
.xm-pk { display: block; margin-bottom: 2px; font: 700 9.5px ${BODY}; letter-spacing: .12em; text-transform: uppercase; color: #7A746B; padding-right: 18px; }
.xm-pt { display: block; font: 700 13.5px/1.3 ${SERIF}; color: #111; padding-right: 10px; }
.xm-pl { display: inline-block; margin-top: 5px; color: ${RED}; font-weight: 600; text-decoration: none; }
.xm-pl:hover { text-decoration: underline; text-underline-offset: 3px; }

@media (max-width: 767px) {
  .xm { display: flex; flex-direction: column; }
  .xm-mapwrap { order: -1; height: 56vh; min-height: 340px; max-height: 480px; }
  .xm-list { height: auto; overflow: visible; border-right: 0; }
  .xm-count { position: static; }
  .xm-toggle { top: 10px; right: 10px; padding: 6px 12px; font-size: 12px; }
  .xm-legend { right: 8px; bottom: 20px; font-size: 11px; }
}
@media (max-width: 700px) {
  .xm { border-left: 0; border-right: 0; margin-left: -20px; margin-right: -20px; }
}
`

export function ExploreMap({ posts, region, regions = [], onRegion }: {
  posts: BlogCard[]
  region: string | null
  /** 지도에서 누를 수 있는 도시(지금 타입에서 글이 있는 지역 id) */
  regions?: string[]
  /** 도시 이름을 누르면 — 위 드롭다운과 같은 주소로 바꾼다 */
  onRegion?: (id: string) => void
}) {
  const listEl = useRef<HTMLDivElement>(null)
  const mapEl = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string | null>(null)
  const [showSpots, setShowSpots] = useState(false)
  const [focus, setFocus] = useState<{ pinId: string; key: number } | null>(null)

  const pinned = useMemo(() => posts.filter(p => p.geo?.ll), [posts])
  const spots = useMemo(() => PLACED_SPOTS.filter(s => s.ll && (!region || s.city === region)), [region])
  const view = (region && REGION_VIEW[region]) || NATIONAL

  const pins: PenPin[] = [
    ...(showSpots ? spots.map(s => ({ id: `spot:${s.name}`, ll: s.ll!, kind: 'spot' as const, label: s.name })) : []),
    ...pinned.map(p => ({ id: p.slug, ll: p.geo!.ll as LL, kind: isHotel(p) ? ('hotel' as const) : ('place' as const), label: p.title, active: p.slug === active })),
  ]

  const openPin = (id: string) => {
    setActive(id)
    if (!id.startsWith('spot:') && matchMedia('(min-width: 768px)').matches) {
      listEl.current?.querySelector(`[data-slug="${globalThis.CSS.escape(id)}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }
  const pick = (p: BlogCard) => {
    setActive(p.slug)
    if (!p.geo?.ll) return
    setFocus(f => ({ pinId: p.slug, key: (f?.key ?? 0) + 1 }))
    // 폰은 지도가 위에 있으니 지도로 올려 보여 준다
    if (!matchMedia('(min-width: 768px)').matches) mapEl.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  const activePost = active && !active.startsWith('spot:') ? posts.find(p => p.slug === active) : null
  const activeSpot = active?.startsWith('spot:') ? spots.find(s => `spot:${s.name}` === active) : null
  const popup = activePost?.geo?.ll
    ? { pinId: activePost.slug, onClose: () => setActive(null), content: (
        <>
          <span className="xm-pk">{isHotel(activePost) ? 'Hotel' : 'Place guide'} · {regionName(activePost)}</span>
          <span className="xm-pt">{activePost.title}</span>
          <a className="xm-pl" href={hrefOf(activePost)}>Read the {isHotel(activePost) ? 'review' : 'guide'} →</a>
        </>) }
    : activeSpot
      ? { pinId: active!, onClose: () => setActive(null), content: (
          <>
            <span className="xm-pk">Walking hotspot</span>
            <span className="xm-pt">{activeSpot.name}</span>
            {activeSpot.what}
            {activeSpot.guide && <><br /><a className="xm-pl" href={`/blog/en/k-patto/${activeSpot.guide.slug}${activeSpot.guide.anchor ? `#${activeSpot.guide.anchor}` : ''}`}>{activeSpot.guide.label} →</a></>}
          </>) }
      : null

  const noPin = posts.length - pinned.length

  return (
    <div className="xm">
      <style>{CSS}</style>
      <div className="xm-list" ref={listEl}>
        {/* 숫자가 바뀌는 줄 — 자동 번역이 글자 노드를 감싸면 갱신이 안 보여서 번역에서 뺀다 */}
        <div className="xm-count notranslate" translate="no">
          {posts.length} {posts.length === 1 ? 'article' : 'articles'} · {pinned.length} on the map{noPin ? ` · ${noPin} without a single spot` : ''}
        </div>
        {/* 글마다 진짜 링크(제목) — 검색엔진이 목록을 그대로 읽는다. 줄을 누르면 지도에서 그 핀으로 */}
        {posts.map(p => {
          const src = thumbSrc(p.thumb)
          const hotel = isHotel(p)
          return (
            <div key={p.slug} data-slug={p.slug} className={`xm-item${hotel ? ' is-hotel' : ''}${active === p.slug ? ' is-active' : ''}`}
              tabIndex={0} aria-label={`${p.title} — show on map`}
              onClick={() => pick(p)} onKeyDown={e => { if (e.key === 'Enter' && e.target === e.currentTarget) { e.preventDefault(); pick(p) } }}>
              {src ? <img className="xm-thumb" src={src} alt="" loading="lazy" /> : <span className="xm-thumb" aria-hidden="true" />}
              <div className="xm-body">
                <div className="xm-kicker notranslate" translate="no"><i aria-hidden="true" />{hotel ? 'Hotel' : 'Place'} · {regionName(p)}</div>
                <a className="xm-title" href={hrefOf(p)} onClick={e => e.stopPropagation()}>{p.title}</a>
                <div className="xm-meta">{p.readMin} min read{p.geo?.ll ? '' : ' · Not on the map'}</div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="xm-mapwrap notranslate" translate="no" ref={mapEl}>
        <PenMap
          className="xm-map"
          view={view}
          pins={pins}
          areas={region === 'seoul' ? SEOUL_AREAS : []}
          onPin={openPin}
          cities={regions}
          onCity={onRegion}
          popup={popup}
          focus={focus}
          ariaLabel="Illustrated map of Korea with Explore Korea hotels and guides"
          topRight={
            <button type="button" className="xm-toggle" aria-pressed={showSpots} onClick={() => setShowSpots(v => !v)}>
              {showSpots ? '− Hide Walking Hotspots' : '+ Show Walking Hotspots'}
            </button>
          }
        />
        <div className="xm-legend" aria-hidden="true">
          <span><i style={{ background: RED }} />Hotels</span>
          <span><i style={{ background: INK }} />Places</span>
          {showSpots && <span><i style={{ background: '#F7F5EE', border: `2px solid ${INK}` }} />Walking hotspots</span>}
        </div>
      </div>
    </div>
  )
}
