import Image from 'next/image'
import { KLOOK_URL } from '@/lib/affiliate/links'

/** 사이트 레드 — K-Patto 배너 버튼과 같은 값(Tailwind red-600 은 톤이 달라 쓰지 않는다) */
const RED = '#C8102E'

/**
 * Klook 제휴 배너 — 왼쪽 사진 썸네일 + 가운데 카피 + 오른쪽 CTA 의 한 줄 카드. 폰은 위아래로 쌓는다.
 * 노출 그룹(Explore Korea · Food · Life)과 글당 제휴 배너 2개 상한은 글 상세 라우트가 정한다.
 *
 * 컴팩트 카드(2026-11-12): 안쪽 여백 16px · 넓은 화면 20/24px, 최소 높이 없음, 버튼 190 × 40.
 * 글 하단에서는 K-Patto 카드와 한 묶음(.art-bottom-cards, 간격 14px)으로 놓여 그 묶음이 위아래 여백을 정한다.
 * 사진은 /images/affiliate/klook-korea-passes.jpg(인천공항 항공사진, 288×192 로 줄인 것).
 * dark: 변형은 쓰지 않는다 — 글 페이지 자체에 다크 모드가 없어서, OS 다크 설정에서 이 카드만 어두워진다.
 */
export function KlookBanner() {
  return (
    <aside
      aria-label="Sponsored"
      className="my-6 flex flex-col items-stretch justify-between gap-3.5 rounded-2xl border border-[rgba(229,229,229,0.8)] bg-[#FBFBFA] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5"
    >
      {/* 썸네일은 글 열 높이만큼만(self-stretch) — 예전처럼 고정 96px 로 카드를 키우지 않는다 */}
      <div className="flex min-w-0 items-stretch gap-4">
        <div className="relative min-h-[72px] w-24 shrink-0 self-stretch overflow-hidden rounded-xl sm:w-32">
          <Image
            src="/images/affiliate/klook-korea-passes.jpg"
            alt="Incheon International Airport from above"
            fill
            sizes="128px"
            className="object-cover"
          />
          {/* 사진 위 미니 뱃지만 Klook 오렌지 — 라벨 · 버튼은 사이트 레드 */}
          <span
            className="absolute bottom-1.5 left-1.5 rounded bg-[#FF5B00] px-1.5 py-0.5 text-[10px] font-bold text-white"
            translate="no"
          >
            KLOOK
          </span>
        </div>
        <div className="min-w-0">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.05em]" style={{ color: RED }}>
            Activities &amp; Transportation
          </p>
          <p className="mt-0.5 mb-0 text-base font-bold leading-snug text-slate-900 sm:text-lg">
            Explore Korea with Klook Travel Passes
          </p>
          <p className="mt-0.5 mb-0 text-xs leading-snug text-slate-600 sm:text-sm">
            AREX airport express, KTX rail passes, and attraction tickets.
          </p>
          {/* 제휴 고지 — 12px · #A3A3A3, 위 6px(카드를 낮게 유지). 카드가 가로 배치라 글 열 안에 둔다 */}
          <p className="mt-1.5 mb-0 text-xs leading-snug text-[#A3A3A3]">
            We earn a commission if you book through this link, at no extra cost to you.
          </p>
        </div>
      </div>
      <a
        href={KLOOK_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="klk-cta flex h-10 w-full shrink-0 items-center justify-center rounded-xl px-4 text-sm font-semibold whitespace-nowrap text-white no-underline transition-colors sm:w-[190px]"
      >
        Book Passes →
      </a>
      {/* hover 색은 인라인 style 로 못 바꿔서 이 버튼만 규칙을 둔다 */}
      <style>{`
        .klk-cta { background: ${RED}; }
        .klk-cta:hover { background: #A30D25; color: #fff; }
        .klk-cta:focus-visible { outline: 3px solid #171717; outline-offset: 2px; }
      `}</style>
    </aside>
  )
}
