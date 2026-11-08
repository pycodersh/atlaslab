import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { OfflineRegister } from './OfflineRegister'

/**
 * Smart Travel Tools 공통 틀 — 헤더 · 푸터 · 도구 화면 공용 스타일 · 오프라인 워커 등록.
 * 사이트 전체를 Google Translate 위젯이 번역하므로, 직원에게 보여 줄 한국어 · 금액 · 타이머 숫자에는 notranslate 를 붙인다.
 */
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <style>{`
        .tl-main { background: #FAFAF8; color: #111827; font-family: "DM Sans", Inter, system-ui, sans-serif; }
        .tl-wrap { max-width: 720px; margin: 0 auto; padding: 48px 32px 72px; }
        .tl-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #C8102E; margin: 0 0 10px; }
        .tl-h1 { font-family: "Playfair Display", Georgia, serif; font-size: 36px; line-height: 1.15; font-weight: 700; margin: 0 0 10px; color: #111827; }
        .tl-lead { font-size: 16px; line-height: 1.6; color: #4B5563; margin: 0 0 32px; }
        .tl-card { background: #fff; border: 1px solid #F3F4F6; border-radius: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.05); padding: 24px; margin-bottom: 20px; }
        .tl-h2 { font-size: 16px; font-weight: 700; margin: 0 0 14px; color: #111827; }
        .tl-btn {
          min-height: 48px; padding: 12px 20px; border-radius: 10px; border: 1px solid #C8102E; background: #C8102E; color: #fff;
          font: 700 15px "DM Sans", Inter, system-ui, sans-serif; cursor: pointer;
        }
        .tl-btn:disabled { background: #E5E7EB; border-color: #E5E7EB; color: #9CA3AF; cursor: default; }
        .tl-btn-ghost { background: #fff; color: #111827; border-color: #D1D5DB; }
        .tl-btn:focus-visible, .tl-input:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        .tl-actions { display: flex; flex-wrap: wrap; gap: 10px; }
        .tl-input {
          width: 100%; box-sizing: border-box; min-height: 52px; padding: 10px 14px; border: 1px solid #D1D5DB; border-radius: 10px;
          background: #fff; color: #111827; font: 600 18px "DM Sans", Inter, system-ui, sans-serif;
        }
        .tl-note { font-size: 13px; line-height: 1.6; color: #6B7280; margin: 0; }
        .tl-note a { color: #C8102E; }
        .tl-more { display: flex; flex-wrap: wrap; gap: 8px 20px; align-items: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 14px; }
        .tl-more-label { font-weight: 700; }
        .tl-more a { color: #C8102E; text-decoration: none; font-weight: 500; }
        @media (hover: hover) { .tl-more a:hover { text-decoration: underline; } }
        @media (max-width: 767px) {
          .tl-wrap { padding: 28px 20px 56px; }
          .tl-h1 { font-size: 28px; }
          .tl-card { padding: 20px; }
        }
      `}</style>
      <main className="tl-main">{children}</main>
      <SiteFooter />
      <OfflineRegister />
    </>
  )
}
