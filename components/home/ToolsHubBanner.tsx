import { SectionHeader } from '@/components/SectionHeader'
import { TOOLS, toolHref, type ToolId } from '@/app/tools/toolList'
import { TOOL_ART } from '@/app/tools/toolArt'
import { ToolIcon } from '@/app/tools/toolIcons'

const FEATURED: { id: ToolId; title: string; desc: string }[] = [
  {
    id: 'hotspot-finder', title: 'Regional Hotspot Finder',
    desc: 'Curated walking clusters across Seoul and 10 regional cities with visual previews and instant transit tips.',
  },
  {
    id: 'transit-guide', title: 'Intercity Transit Guide',
    desc: 'Compare KTX trains, express buses, and flights across major routes between 10 cities.',
  },
  {
    id: 'kpop-calendar', title: 'K-Pop Event Calendar',
    desc: 'Upcoming idol tour schedules, global ticketing links, and subway exit tips for KSPO Dome & Gocheok.',
  },
]

/** 대표 카드에 없는 7개 도구 — 4열 × 2행 미니 카드(마지막 8번째 칸은 All Tools). 부제는 3~4단어.
 *  환율은 하루 한 번 갱신이라 'Live' 라 쓰지 않는다(toolList 의 같은 규칙) */
const QUICK: { id: ToolId; label: string; sub: string }[] = [
  { id: 'krw-converter', label: 'KRW Calc', sub: 'Daily-rate converter' },
  { id: 'order-builder', label: 'K-Food', sub: 'Polite ordering phrases' },
  { id: 'weather', label: 'Weather', sub: '7-day city forecasts' },
  { id: 'holiday-calendar', label: 'Holidays', sub: 'Holiday & peak dates' },
  { id: 'size-units', label: 'Size & Units', sub: 'Shoe & clothing sizes' },
  { id: 'subway-timer', label: 'Subway 15m', sub: 'Free re-entry timer' },
  { id: 'world-time', label: 'World Time', sub: 'Seoul vs home time' },
]

/**
 * 홈의 도구 섹션 — 대표 도구 3개는 바로 실행하고 나머지는 허브로 보낸다.
 * 머리글은 Travel & Life 와 같은 SectionHeader 를 쓴다.
 * 카드와 칩은 도구마다 따로 있는 페이지(/tools/슬러그)로 바로 간다.
 */
export function ToolsHubBanner() {
  return (
    <section id="tools" className="gw-sec" aria-labelledby="gw-tools">
      <style>{`
        .thb-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
        .thb-card { display: flex; flex-direction: column; background: #fff; border: 1px solid #F3F4F6; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,.05); text-decoration: none; color: inherit; transition: transform .2s, box-shadow .2s, border-color .2s; }
        @media (hover: hover) { .thb-card:hover { transform: translateY(-4px); box-shadow: 0 8px 22px rgba(0,0,0,.1); border-color: #D1D5DB; } }
        @media (prefers-reduced-motion: reduce) { .thb-card { transition: none; } .thb-card:hover { transform: none; } }
        .thb-art { display: block; aspect-ratio: 16 / 8; }
        .thb-art svg { display: block; width: 100%; height: 100%; }
        .thb-body { display: flex; flex-direction: column; align-items: flex-start; flex: 1; padding: 20px; }
        .thb-name { font-family: "Playfair Display", Georgia, serif; font-size: 20px; font-weight: 700; line-height: 1.25; color: #111827; margin-bottom: 8px; }
        .thb-desc { font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 14px; line-height: 1.55; color: #4B5563; }
        .thb-arrow { display: none; }
        /* 나머지 7개 도구 + All Tools — 위 3열 카드와 같은 폭의 4열 × 2행(폰 2열) 미니 카드 */
        .thb-mini { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 16px 0 0; padding: 0; list-style: none; }
        @media (min-width: 768px) { .thb-mini { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        .thb-mini-card { display: flex; flex-direction: column; gap: 4px; height: 100%; box-sizing: border-box; padding: 14px;
          background: #fff; border: 1px solid rgba(231,229,228,.9); border-radius: 12px; color: #1C1917; text-decoration: none;
          font-family: "DM Sans", Inter, system-ui, sans-serif; transition: border-color .15s, box-shadow .15s, background-color .15s; }
        @media (hover: hover) { .thb-mini-card:hover { border-color: #A8A29E; box-shadow: 0 1px 2px rgba(0,0,0,.05); } }
        .thb-mini-top { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; line-height: 1.3; }
        .thb-mini-top svg, .thb-mini-top .thb-mini-ic { flex: none; color: #78716C; }
        .thb-mini-sub { font-size: 12px; line-height: 1.4; color: #78716C; }
        .thb-mini-all { justify-content: center; background: #1C1917; border-color: #1C1917; color: #fff; }
        @media (hover: hover) { .thb-mini-all:hover { background: #292524; border-color: #292524; } }
        .thb-mini-all .thb-mini-top { font-size: 14px; }
        .thb-mini-all .thb-mini-sub { color: #D6D3D1; }
        .thb-card:focus-visible, .thb-mini-card:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        @media (max-width: 767px) {
          /* 폰은 /tools 허브 같은 가로 줄 — 글자 크기는 바로 위 Travel & Life 카드(.gw-*)와 맞춘다 */
          .thb-grid { grid-template-columns: minmax(0, 1fr); gap: 10px; }
          .thb-card { flex-direction: row; align-items: center; gap: 12px; padding: 10px 12px 10px 10px; border-radius: 14px; }
          .thb-art { flex: 0 0 80px; width: 80px; height: 80px; aspect-ratio: auto; border-radius: 12px; overflow: hidden; }
          .thb-body { min-width: 0; padding: 0; }
          .thb-name { font-size: 18px; margin-bottom: 3px; }
          .thb-desc { font-size: 14px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          .thb-arrow { display: block; flex: none; font-size: 14px; line-height: 1; color: #9CA3AF; }
        }
      `}</style>

      <SectionHeader id="gw-tools" axis="Travel Tools" desc="Field-tested tools to solve everyday trip questions on the go." />

      <div className="thb-grid">
        {FEATURED.map(tool => (
          <a key={tool.id} className="thb-card" href={toolHref(tool.id)}>
            <span className="thb-art" style={{ background: TOOL_ART[tool.id].background }}>{TOOL_ART[tool.id].art}</span>
            <span className="thb-body">
              <span className="thb-name">{tool.title}</span>
              <span className="thb-desc">{tool.desc}</span>
            </span>
            <span className="thb-arrow" aria-hidden="true">↗</span>
          </a>
        ))}
      </div>

      <nav aria-label="More travel tools">
        <ul className="thb-mini">
          {QUICK.map(({ id, label, sub }) => (
            <li key={id}>
              <a className="thb-mini-card" href={toolHref(id)} aria-label={TOOLS.find(t => t.id === id)?.title}>
                <span className="thb-mini-top">
                  <ToolIcon id={id} size={16} className="thb-mini-ic" />
                  <span className="notranslate" translate="no">{label}</span>
                </span>
                <span className="thb-mini-sub">{sub}</span>
              </a>
            </li>
          ))}
          <li>
            <a className="thb-mini-card thb-mini-all" href="/tools">
              <span className="thb-mini-top">All Tools ({TOOLS.length}) →</span>
              <span className="thb-mini-sub">Browse every travel tool</span>
            </a>
          </li>
        </ul>
      </nav>
    </section>
  )
}
