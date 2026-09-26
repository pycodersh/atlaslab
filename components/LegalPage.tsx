import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

const F = '"DM Sans","Inter",system-ui,sans-serif'

/**
 * 법적 고지 페이지(/privacy, /terms) 공통 껍데기.
 * 헤더(SiteNav)·푸터(SiteFooter)는 다른 필수 페이지와 같은 것을 쓰고,
 * 본문은 max-w-3xl · line-height 1.7 의 읽기용 타이포그래피를 준다.
 */
export function LegalPage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#F9F8F6', color: 'var(--ink, #111)', fontFamily: F }}>
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl px-6 pt-12 pb-20 md:pt-16 md:pb-28">
        <article className="legal-prose">{children}</article>
      </main>
      <SiteFooter />

      <style>{`
        .legal-prose { font-size: 16px; line-height: 1.7; color: #1f2937; }
        .legal-prose h1 { font-size: 34px; line-height: 1.25; font-weight: 800; letter-spacing: -0.02em; color: #111; margin: 0 0 20px; }
        .legal-prose h2 { font-size: 20px; line-height: 1.4; font-weight: 700; color: #111; margin: 40px 0 12px; padding-top: 16px; border-top: 2px solid #C8102E; }
        .legal-prose p { margin: 0 0 16px; }
        .legal-prose ul { list-style-type: disc; padding-left: 22px; margin: 0 0 16px; }
        .legal-prose li { margin-bottom: 8px; }
        .legal-prose a { color: #C8102E; text-decoration: underline; text-underline-offset: 2px; overflow-wrap: anywhere; }
        .legal-prose strong { color: #111; font-weight: 700; }
        @media (max-width: 480px) { .legal-prose h1 { font-size: 28px; } }
      `}</style>
    </div>
  )
}
