import { SectionHeader } from '@/components/SectionHeader'
import { TOOLS, type ToolId } from '@/app/tools/toolList'
import { TOOL_ART } from '@/app/tools/toolArt'

const FEATURED: { id: ToolId; badge: string; title: string; desc: string }[] = [
  {
    id: 'kpop-calendar', badge: 'Concerts & Guides', title: 'K-Pop Event Calendar',
    desc: 'Upcoming idol tour schedules, global ticketing links, and subway exit tips for KSPO Dome & Gocheok.',
  },
  {
    id: 'transit-guide', badge: 'Transit Navigator', title: 'Intercity Transit Guide',
    desc: 'Compare KTX trains, express buses, and flights across major routes between 10 cities.',
  },
  {
    id: 'order-builder', badge: 'Dining Survival', title: 'K-Food Order Assistant',
    desc: 'Point-and-order phrases, spice-level adjustments ("Not spicy"), and allergen alerts.',
  },
]

/**
 * 홈의 도구 섹션 — 대표 도구 3개는 바로 실행하고 나머지는 허브로 보낸다.
 * 머리글은 Travel & Life 와 같은 SectionHeader 를 쓴다.
 * 카드는 /tools#도구id 로 가서 허브가 위젯을 바로 연다(일반 <a>: 페이지가 뜰 때 주소의 # 을 읽어야 한다).
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
        .thb-badge { padding: 3px 8px; border-radius: 6px; background: #FBEFEA; color: #C8102E; font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 12px; font-weight: 700; margin-bottom: 12px; }
        .thb-name { font-family: "Playfair Display", Georgia, serif; font-size: 20px; font-weight: 700; line-height: 1.25; color: #111827; margin-bottom: 6px; }
        .thb-desc { font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 14px; line-height: 1.55; color: #4B5563; }
        .thb-strip { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 16px; padding: 16px; border: 1px solid #E5E7EB; border-radius: 16px; background: #F9FAFB; }
        .thb-strip p { margin: 0; font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 14px; font-weight: 500; line-height: 1.45; color: #374151; }
        .thb-cta { flex: none; display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 10px 16px; box-sizing: border-box; border-radius: 12px; background: #000; color: #fff; font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 14px; font-weight: 700; text-decoration: none; white-space: nowrap; }
        .thb-card:focus-visible, .thb-cta:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        @media (max-width: 767px) {
          .thb-grid { grid-template-columns: minmax(0, 1fr); gap: 12px; }
          .thb-strip { flex-direction: column; align-items: stretch; text-align: center; }
        }
      `}</style>

      <SectionHeader id="gw-tools" axis="Travel Tools" desc="Field-tested tools to solve everyday trip questions on the go." />

      <div className="thb-grid">
        {FEATURED.map(tool => (
          <a key={tool.id} className="thb-card" href={`/tools#${tool.id}`}>
            <span className="thb-art" style={{ background: TOOL_ART[tool.id].background }}>{TOOL_ART[tool.id].art}</span>
            <span className="thb-body">
              <span className="thb-badge">{tool.badge}</span>
              <span className="thb-name">{tool.title}</span>
              <span className="thb-desc">{tool.desc}</span>
            </span>
          </a>
        ))}
      </div>

      <div className="thb-strip">
        {/* 날씨는 1시간마다 갱신된다 — 'Real-time' 이라 쓰지 않는다 */}
        <p>Looking for Regional Hotspots, Subway Survival, or Weather Forecasts?</p>
        <a className="thb-cta" href="/tools">Launch Travel Hub ({TOOLS.length} Tools) →</a>
      </div>
    </section>
  )
}
