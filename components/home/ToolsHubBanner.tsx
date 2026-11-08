import type { ReactNode } from 'react'
import { SectionHeader } from '@/components/SectionHeader'
import { TOOLS } from '@/app/tools/toolList'

const art = (children: ReactNode) => (
  <svg viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none">{children}</svg>
)

const FEATURED = [
  {
    id: 'kpop-calendar', theme: 'is-kpop', badge: 'Concerts & Guides', title: 'K-Pop Event Calendar',
    desc: 'Upcoming idol tour schedules, global ticketing links, and subway exit tips for KSPO Dome & Gocheok.',
    art: art(<>
      <path d="M160 18 60 150h60zM160 18l40 132h60z" fill="#fff" opacity=".14" />
      <rect x="118" y="14" width="84" height="12" rx="6" fill="#fff" opacity=".85" />
      <g fill="#fff"><circle cx="58" cy="44" r="2.5" /><circle cx="262" cy="36" r="2" /><circle cx="286" cy="70" r="2.5" /><circle cx="34" cy="78" r="2" /></g>
      <g stroke="#fff" strokeWidth="5" strokeLinecap="round"><path d="M92 150v-34M160 150v-46M228 150v-34" /></g>
      <g fill="#FDE68A"><circle cx="92" cy="104" r="13" /><circle cx="160" cy="90" r="15" /><circle cx="228" cy="104" r="13" /></g>
    </>),
  },
  {
    id: 'transit-guide', theme: 'is-transit', badge: 'Transit Navigator', title: 'Intercity Transit Guide',
    desc: 'Compare KTX trains, express buses, and flights across major routes between 10 cities.',
    art: art(<>
      <path d="M-10 128C70 88 110 142 170 104s90-42 160-40" stroke="#fff" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" opacity=".8" />
      <circle cx="40" cy="106" r="7" fill="#fff" /><circle cx="286" cy="66" r="7" fill="#FDE68A" />
      <rect x="122" y="30" width="76" height="86" rx="18" fill="#fff" />
      <rect x="134" y="44" width="52" height="30" rx="6" fill="#1D4ED8" />
      <circle cx="142" cy="96" r="6" fill="#F59E0B" /><circle cx="178" cy="96" r="6" fill="#F59E0B" />
      <path d="M138 116l-10 18M182 116l10 18" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </>),
  },
  {
    id: 'order-builder', theme: 'is-food', badge: 'Dining Survival', title: 'K-Food Order Assistant',
    desc: 'Point-and-order phrases, spice-level adjustments ("Not spicy"), and allergen alerts.',
    art: art(<>
      <g stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".75"><path d="M136 52c-8-10 8-16 0-28M162 52c-8-10 8-16 0-28M188 52c-8-10 8-16 0-28" /></g>
      <path d="M92 70h136a68 62 0 0 1-136 0Z" fill="#fff" />
      <rect x="82" y="60" width="156" height="14" rx="7" fill="#FEF3C7" />
      <circle cx="160" cy="98" r="11" fill="#DC2626" opacity=".85" />
      <path d="m238 24-50 44M256 34l-58 38" stroke="#7C2D12" strokeWidth="5" strokeLinecap="round" />
    </>),
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
        .is-kpop .thb-art { background: linear-gradient(135deg, #4C1D95, #DB2777); }
        .is-transit .thb-art { background: linear-gradient(135deg, #0E7490, #2563EB); }
        .is-food .thb-art { background: linear-gradient(135deg, #F59E0B, #DC2626); }
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

      <SectionHeader id="gw-tools" axis="Travel Utilities" desc="Field-tested tools to solve everyday trip questions on the go." />

      <div className="thb-grid">
        {FEATURED.map(tool => (
          <a key={tool.id} className={`thb-card ${tool.theme}`} href={`/tools#${tool.id}`}>
            <span className="thb-art">{tool.art}</span>
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
