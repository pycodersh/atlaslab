import { SectionHeader } from '@/components/SectionHeader'
import { TOOLS, toolHref, type ToolId } from '@/app/tools/toolList'
import { TOOL_ART } from '@/app/tools/toolArt'
import { CalendarDays, CloudSun, Globe, Ruler, Timer, UtensilsCrossed, type LucideIcon } from 'lucide-react'

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

/** 대표 카드에 없는 7개 도구 — 칩을 누르면 허브에서 그 도구가 바로 열린다 */
const QUICK: { id: ToolId; label: string; icon: LucideIcon | null }[] = [
  { id: 'krw-converter', label: 'KRW Calc', icon: null },
  { id: 'order-builder', label: 'K-Food', icon: UtensilsCrossed },
  { id: 'weather', label: 'Weather', icon: CloudSun },
  { id: 'holiday-calendar', label: 'Holidays', icon: CalendarDays },
  { id: 'size-units', label: 'Size & Units', icon: Ruler },
  { id: 'subway-timer', label: 'Subway 15m', icon: Timer },
  { id: 'world-time', label: 'World Time', icon: Globe },
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
        .thb-strip { display: flex; align-items: center; gap: 12px; margin-top: 16px; padding: 12px 12px 12px 16px; border: 1px solid #E5E7EB; border-radius: 16px; background: #F9FAFB; }
        .thb-chips { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; flex: 1; min-width: 0; margin: 0; padding: 0; list-style: none; }
        .thb-chip { display: flex; flex-shrink: 0; align-items: center; gap: 6px; height: 36px; padding: 0 12px; box-sizing: border-box; border: 1px solid #E2E8F0; border-radius: 999px; background: #fff; color: #334155; text-decoration: none; white-space: nowrap; font: 500 12px "DM Sans", Inter, system-ui, sans-serif; transition: background .15s, border-color .15s; }
        .thb-chip svg { flex: none; color: #64748B; }
        .thb-won { width: 14px; text-align: center; font-size: 13px; font-weight: 700; color: #64748B; }
        .thb-chip:active { background: #F1F5F9; }
        @media (hover: hover) { .thb-chip:hover { border-color: #94A3B8; } }
        .thb-chip:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        .thb-cta { flex: none; display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 10px 16px; box-sizing: border-box; border-radius: 12px; background: #000; color: #fff; font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 14px; font-weight: 700; text-decoration: none; white-space: nowrap; }
        .thb-card:focus-visible, .thb-cta:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        @media (max-width: 767px) {
          /* 폰은 /tools 허브 같은 가로 줄 — 글자 크기는 바로 위 Travel & Life 카드(.gw-*)와 맞춘다 */
          .thb-grid { grid-template-columns: minmax(0, 1fr); gap: 10px; }
          .thb-card { flex-direction: row; align-items: center; gap: 12px; padding: 10px 12px 10px 10px; border-radius: 14px; }
          .thb-art { flex: 0 0 80px; width: 80px; height: 80px; aspect-ratio: auto; border-radius: 12px; overflow: hidden; }
          .thb-body { min-width: 0; padding: 0; }
          .thb-name { font-size: 18px; margin-bottom: 3px; }
          .thb-desc { font-size: 14px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          .thb-arrow { display: block; flex: none; font-size: 14px; line-height: 1; color: #9CA3AF; }
          /* 폰은 칩을 한 줄로 가로 스크롤 — 화면 끝까지 붙여 다음 칩이 걸쳐 보이게 한다 */
          .thb-strip { flex-direction: column; align-items: stretch; padding: 12px 0; border: 0; background: none; }
          .thb-chips { flex-wrap: nowrap; overflow-x: auto; margin: 0 -16px; padding: 4px 16px; scrollbar-width: none; -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain; }
          .thb-chips::-webkit-scrollbar { display: none; }
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

      <nav className="thb-strip" aria-label="More travel tools">
        <ul className="thb-chips">
          {QUICK.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <a className="thb-chip" href={toolHref(id)} aria-label={TOOLS.find(t => t.id === id)?.title}>
                {Icon ? <Icon size={14} aria-hidden="true" /> : <span className="thb-won" aria-hidden="true">₩</span>}
                <span className="notranslate" translate="no">{label}</span>
              </a>
            </li>
          ))}
        </ul>
        <a className="thb-cta" href="/tools">All Tools ({TOOLS.length}) →</a>
      </nav>
    </section>
  )
}
