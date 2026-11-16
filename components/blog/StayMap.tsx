/**
 * 숙소 글 지도 — MDX 에서 <StayMap id="gyeongwonjae" /> 로 쓴다.
 *
 * 데이터는 scripts/make-stay-maps.mjs 가 만든 lib/blog/stay-maps.generated.json 하나뿐이다:
 *  - 바탕: 지역(송도 · 서울 도심)별 OSM 지도 이미지(밝은 톤, 영어 지명). 공항 · 다리 · 한강 · 서울역이 한 화면에 든다.
 *  - 경로: OSRM 실제 도로(실선) · 도보(점선) 경로를 이미지 좌표로 — SVG 로 지도와 같이 줄어든다.
 *  - 말풍선: 생성기가 핀 · 지명 · 다른 카드와 겹치지 않게 미리 놓은 자리. 크기는 컨테이너 폭 비율(cqw)이라
 *    데스크톱 어떤 폭에서도 배치가 그대로 유지된다.
 *  - 폰(≤640px): 지도 속 카드는 글자가 너무 작아져 숨기고, 같은 내용을 지도 아래 번호 목록으로 보여 준다.
 *    핀은 고정 px 크기라 폰에서도 번호가 읽힌다.
 * 지도 이미지는 밝은 톤 그대로 두고(지도는 다크 모드에서도 밝은 게 읽기 쉽다) 테두리 · 목록만 html.dark 를 따른다.
 */
import data from '@/lib/blog/stay-maps.generated.json'
import { STAY_MAP_BADGES } from '@/lib/blog/stayMapBadges'
import ov from '@/lib/blog/stay-map-overviews.generated.json'
import { StayMapZoom, type StayOverviews } from './StayMapZoom'

type Card = { num: number | null; hotel: boolean; title: string; lines: string[]; color: string; x: number; y: number; leader: number[] }
type MapData = {
  region: string
  hotel: { x: number; y: number; title: string; lines: string[] }
  routes: { color: string; dash: boolean; pts: string }[]
  pins: { x: number; y: number; num: number; color: string }[]
  cards: Card[]
}
type Region = { img: string; w: number; h: number; scale: { px: number; label: string } }

const CSS = `
.stay-map2 { margin: 8px 0 36px; border: 1px solid #E5E1DC; border-radius: 14px; overflow: hidden; background: #fff; }
html.dark .stay-map2 { border-color: #2E2E2E; background: #141414; }
.stay-map2 .sm2-canvas { position: relative; container-type: inline-size; line-height: 0; }
.stay-map2 .sm2-canvas img { display: block; width: 100%; height: auto; margin: 0; border-radius: 0; box-shadow: none; }
.stay-map2 svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.stay-map2 .sm2-pin { position: absolute; transform: translate(-50%, -50%); width: 22px; height: 22px; border-radius: 50%;
  border: 2.5px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,.35); color: #fff; font: 700 12px/17px "DM Sans", system-ui, sans-serif; text-align: center; }
.stay-map2 .sm2-hotel { width: 26px; height: 26px; background: #C8102E; font-size: 13px; line-height: 21px; z-index: 2; }
.stay-map2 .sm2-card { position: absolute; width: 30%; box-sizing: border-box; padding: 1.2cqw 1.4cqw; background: #fff;
  border-radius: 1cqw; border-left: 0.7cqw solid; box-shadow: 0 0.3cqw 1.2cqw rgba(0,0,0,.18); line-height: 1.3; z-index: 3; }
.stay-map2 .sm2-card b { display: block; font: 700 2cqw/1.3 "DM Sans", system-ui, sans-serif; color: #111; }
.stay-map2 .sm2-card span { display: block; font: 500 1.75cqw/1.3 "DM Sans", system-ui, sans-serif; color: #444; }
.stay-map2 .sm2-scale { position: absolute; right: 1.5%; top: 2.5%; background: rgba(255,255,255,.9); border-radius: 6px;
  padding: 3px 8px 5px; font: 600 11px/1.2 "DM Sans", system-ui, sans-serif; color: #222; z-index: 4; white-space: nowrap; }
.stay-map2 .sm2-scale i { display: block; height: 4px; background: #222; margin-top: 3px; max-width: 45cqw; }
/* 확대 · 이동(StayMapZoom) — 확대 전엔 세로 스크롤을 페이지에 넘긴다 */
.stay-map2 .sm2-zoom { position: relative; overflow: hidden; touch-action: pan-y; }
.stay-map2 .sm2-zoom.is-zoomed { touch-action: none; cursor: grab; }
.stay-map2 .sm2-zoom.is-zoomed:active { cursor: grabbing; }
.stay-map2 .sm2-layer { position: relative; transform-origin: 0 0; will-change: transform; }
.stay-map2 .sm2-layer img { -webkit-user-drag: none; user-select: none; pointer-events: none; }
.stay-map2 .sm2-badge { position: absolute; left: 1.5%; top: 2.5%; max-width: 58%; z-index: 4; padding: 4px 9px;
  background: rgba(255,255,255,.82); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0,0,0,.08); font: 600 11px/1.35 "DM Sans", system-ui, sans-serif; color: #3F3A36;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stay-map2 .sm2-ctrl { position: absolute; right: 10px; bottom: 10px; z-index: 4; display: flex; gap: 4px; line-height: 1; }
.stay-map2 .sm2-ctrl button { min-width: 30px; height: 30px; padding: 0; border: 1px solid #D6D3D1; border-radius: 8px;
  background: rgba(255,255,255,.92); color: #1C1917; font: 600 17px/1 "DM Sans", system-ui, sans-serif; cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,.1); }
.stay-map2 .sm2-ctrl .sm2-txt { padding: 0 9px; font-size: 12px; letter-spacing: .02em; }
.stay-map2 .sm2-ctrl button[aria-pressed="true"] { background: #1C1917; border-color: #1C1917; color: #fff; }
.stay-map2 .sm2-ctrl button:hover:not(:disabled):not([aria-pressed="true"]) { background: #fff; border-color: #A8A29E; }
/* 줌 아웃 단계(도시 · 한국) — 상세 레이어(말풍선 · 경로 · 핀)는 숨기고, 미리 구운 넓은 지도에 호텔 ★ · 이름표만 */
.stay-map2 .sm2-lv-city .sm2-layer, .stay-map2 .sm2-lv-korea .sm2-layer { opacity: 0; visibility: hidden; transition: opacity .35s ease, visibility 0s linear .35s !important; }
.stay-map2 .sm2-ov { position: absolute; inset: 0; z-index: 2; opacity: 0; visibility: hidden; transition: opacity .35s ease, visibility 0s linear .35s; pointer-events: none; }
.stay-map2 .sm2-ov.is-on { opacity: 1; visibility: visible; transition: opacity .35s ease; }
.stay-map2 .sm2-ov img { display: block; width: 100%; height: 100%; margin: 0; border-radius: 0; box-shadow: none; -webkit-user-drag: none; user-select: none; }
.stay-map2 .sm2-ov-name { position: absolute; transform: translate(18px, -50%); padding: 3px 8px; border-radius: 6px; background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.22); border-left: 3px solid #C8102E; white-space: nowrap;
  font: 700 12px/1.3 "DM Sans", system-ui, sans-serif; color: #111; }
.stay-map2 .sm2-ov-name.is-left { transform: translate(calc(-100% - 18px), -50%); }
.stay-map2 .sm2-ctrl button:disabled { opacity: .45; cursor: default; }
.stay-map2 .sm2-ctrl button:focus-visible { outline: 2px solid #C8102E; outline-offset: 1px; }
.stay-map2 .sm2-legend { display: none; list-style: none; margin: 0; padding: 14px 14px 4px; }
.stay-map2 .sm2-legend li { display: flex; gap: 10px; align-items: flex-start; margin: 0 0 10px; padding: 0; font-size: 14px; line-height: 1.35; }
.stay-map2 .sm2-legend li::before { content: none; }
.stay-map2 .sm2-legend .sm2-dot { flex: 0 0 auto; display: block; width: 22px; height: 22px; border-radius: 50%; color: #fff; font: 700 12px/22px "DM Sans", system-ui, sans-serif; text-align: center; }
.stay-map2 .sm2-legend .sm2-dot--line { border-radius: 3px; height: 6px; margin-top: 8px; }
.stay-map2 .sm2-legend b { display: block; color: #111; font-weight: 600; }
html.dark .stay-map2 .sm2-legend b { color: #EDEDED; }
.stay-map2 .sm2-legend span { display: block; color: #6B6560; font-size: 13px; }
html.dark .stay-map2 .sm2-legend span { color: #A3A09C; }
.stay-map2 .sm2-credit { margin: 0; padding: 8px 14px 12px; font-size: 11px; line-height: 1.4; color: #6B6560; }
@media (max-width: 640px) {
  .stay-map2 .sm2-card, .stay-map2 .sm2-leader { display: none; }
  .stay-map2 .sm2-legend { display: block; }
  .stay-map2 .sm2-pin { width: 20px; height: 20px; font-size: 11px; line-height: 15px; }
  .stay-map2 .sm2-hotel { width: 22px; height: 22px; line-height: 17px; }
  .stay-map2 .sm2-badge { max-width: 62%; font-size: 10px; padding: 3px 7px; white-space: normal;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .stay-map2 .sm2-scale { font-size: 10px; padding: 2px 6px 4px; }
  .stay-map2 .sm2-ctrl { right: 8px; bottom: 8px; }
  .stay-map2 .sm2-ctrl { gap: 3px; }
  .stay-map2 .sm2-ctrl button { min-width: 32px; height: 32px; }
  .stay-map2 .sm2-ctrl .sm2-txt { padding: 0 7px; font-size: 11px; }
  .stay-map2 .sm2-ov-name { font-size: 11px; padding: 2px 6px; }
}
`

const pct = (v: number, of: number) => `${(v / of) * 100}%`

export function StayMap({ id }: { id: string }) {
  const m = (data.maps as Record<string, MapData>)[id]
  if (!m) return null
  const r = (data.regions as Record<string, Region>)[m.region]
  const aria = `Map of ${m.hotel.title}: ` + m.cards.filter(c => !c.hotel).map(c => `${c.title}, ${c.lines.join(', ')}`).join('; ')
  // 줌 아웃 단계 — scripts/make-stay-overviews.mjs 가 만든 도시 · 전국 지도(상세 지도와 같은 비율)
  const ovR = (ov.regions as Record<string, { city: { img: string; scale: { px: number; label: string }; name: string }; korea: { img: string; scale: { px: number; label: string } } }>)[m.region]
  const ovM = (ov.maps as Record<string, { city: number[]; korea: number[] }>)[id]
  const at = (p: number[]): [number, number] => [(p[0] / r.w) * 100, (p[1] / r.h) * 100]
  const overviews: StayOverviews | undefined = ovR && ovM ? {
    hotel: m.hotel.title,
    city: { img: ovR.city.img, name: ovR.city.name, scale: { label: ovR.city.scale.label, frac: ovR.city.scale.px / r.w }, at: at(ovM.city) },
    korea: { img: ovR.korea.img, scale: { label: ovR.korea.scale.label, frac: ovR.korea.scale.px / r.w }, at: at(ovM.korea) },
  } : undefined

  return (
    <figure className="stay-map2 not-prose">
      <style>{CSS}</style>
      <div className="sm2-canvas" role="group" aria-label={aria}>
        <StayMapZoom badge={STAY_MAP_BADGES[id]} scale={{ label: r.scale.label, frac: r.scale.px / r.w }} overviews={overviews}>
        <img src={r.img} width={r.w} height={r.h} alt="" loading="lazy" draggable={false} />
        <svg viewBox={`0 0 ${r.w} ${r.h}`} aria-hidden>
          {m.routes.map((rt, i) => (
            <g key={i}>
              <polyline points={rt.pts} fill="none" stroke="#fff" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
              <polyline points={rt.pts} fill="none" stroke={rt.color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={rt.dash ? '2 11' : undefined} />
            </g>
          ))}
          {m.cards.map((c, i) => (
            <line key={i} className="sm2-leader" x1={c.leader[0]} y1={c.leader[1]} x2={c.leader[2]} y2={c.leader[3]}
              stroke={c.color} strokeWidth="2.5" strokeDasharray="5 4" />
          ))}
        </svg>
        {m.pins.map((p, i) => (
          <span key={i} className="sm2-pin" style={{ left: pct(p.x, r.w), top: pct(p.y, r.h), background: p.color }}>{p.num}</span>
        ))}
        <span className="sm2-pin sm2-hotel" style={{ left: pct(m.hotel.x, r.w), top: pct(m.hotel.y, r.h) }}>★</span>
        {m.cards.map((c, i) => (
          <div key={i} className="sm2-card" style={{ left: pct(c.x, r.w), top: pct(c.y, r.h), borderLeftColor: c.color }}>
            <b>{c.title}</b>
            {c.lines.map(l => <span key={l}>{l}</span>)}
          </div>
        ))}
        </StayMapZoom>
        {/* 축척 막대 · 위치 뱃지 · 확대 버튼은 StayMapZoom 이 확대 레이어 밖에 그린다(막대는 배율만큼 길어진다) */}
      </div>

      <figcaption>
        <ol className="sm2-legend">
          {m.cards.map((c, i) => (
            <li key={i}>
              <span className={`sm2-dot${c.num === null && !c.hotel ? ' sm2-dot--line' : ''}`} style={{ background: c.color }}>
                {c.hotel ? '★' : c.num ?? ''}
              </span>
              <span><b>{c.title}</b><span>{c.lines.join(' · ')}</span></span>
            </li>
          ))}
        </ol>
        <p className="sm2-credit">Road and walking routes from OpenStreetMap data (OSRM); drive times assume no traffic. Map © OpenStreetMap contributors.</p>
      </figcaption>
    </figure>
  )
}
