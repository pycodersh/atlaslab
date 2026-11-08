import Link from 'next/link'
import { TOOLS } from '@/app/tools/toolList'

/** 홈의 Smart Travel Tools — 도구를 늘어놓지 않고 /tools 허브로 가는 배너 한 장 */
export function ToolsHubBanner() {
  return (
    <section id="tools" className="gw-sec" aria-labelledby="tools-hub-title">
      <style>{`
        .thb-card {
          display: flex; flex-direction: column; align-items: flex-start; gap: 20px; padding: 24px;
          border: 1px solid #E5E7EB; border-radius: 24px; background: linear-gradient(to bottom right, #F9FAFB, #fff);
          box-shadow: 0 1px 2px rgba(0,0,0,.05); text-decoration: none; color: inherit; transition: box-shadow .2s;
        }
        @media (hover: hover) { .thb-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.1); } }
        .thb-eyebrow { display: block; font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .14em; color: #C8102E; margin-bottom: 10px; }
        .thb-title { display: block; font-family: "Playfair Display", Georgia, serif; font-size: 26px; font-weight: 700; line-height: 1.2; color: #111827; margin-bottom: 10px; }
        .thb-body { display: block; font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 15px; line-height: 1.6; color: #4B5563; max-width: 620px; }
        .thb-cta { flex: none; display: inline-block; padding: 14px 24px; border-radius: 12px; background: #000; color: #fff; font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 15px; font-weight: 700; white-space: nowrap; }
        @media (min-width: 640px) { .thb-card { padding: 40px; } .thb-title { font-size: 32px; } }
        @media (min-width: 768px) { .thb-card { flex-direction: row; align-items: center; justify-content: space-between; gap: 40px; } }
      `}</style>
      <Link href="/tools" className="thb-card">
        <span>
          <span className="thb-eyebrow">SMART TRAVEL UTILITIES</span>
          <span id="tools-hub-title" className="thb-title">Your Pocket Companion for Traveling Korea</span>
          <span className="thb-body">Food ordering phrases, subway timer, currency sense, intercity transit, weather forecast, and K-Pop calendars—everything in one offline-ready hub.</span>
        </span>
        <span className="thb-cta">Launch Travel Hub ({TOOLS.length} Tools) →</span>
      </Link>
    </section>
  )
}
