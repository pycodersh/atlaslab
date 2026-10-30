import Image from 'next/image'
import { KLOOK_URL } from '@/lib/affiliate/links'

/** 사이트 레드 — K-Patto 배너 버튼과 같은 값(Tailwind red-600 은 톤이 달라 쓰지 않는다) */
const RED = '#C8102E'

/**
 * Klook 제휴 배너 — 왼쪽 사진 썸네일 + 가운데 카피 + 오른쪽 CTA 의 한 줄 카드. 폰은 위아래로 쌓는다.
 * 노출 그룹(Explore Korea · Food · Life)과 글당 제휴 배너 2개 상한은 글 상세 라우트가 정한다.
 *
 * 카드 껍데기(배경 · 테두리 · 둥근 모서리 · 여백 24/32px · 위아래 48px)와 꺾이는 폭(640px)은
 * 바로 위에 놓이는 AiraloBanner · ItalkiBanner 와 같은 값이다 — 두 카드가 한 세트로 보이게.
 * 넓은 화면 최소 높이 200px 도 AiraloBanner 와 같다(카피 길이가 달라도 높이가 맞는다). 버튼은 190 × 48(배너 넷 공통).
 * 사진은 /images/affiliate/klook-korea-passes.jpg(인천공항 항공사진, 288×192 로 줄인 것).
 * dark: 변형은 쓰지 않는다 — 글 페이지 자체에 다크 모드가 없어서, OS 다크 설정에서 이 카드만 어두워진다.
 */
export function KlookBanner() {
  return (
    <aside
      aria-label="Sponsored"
      className="my-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[rgba(229,229,229,0.8)] bg-[#FBFBFA] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:min-h-[200px] sm:flex-row sm:items-center sm:gap-6 sm:p-8"
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-36">
          <Image
            src="/images/affiliate/klook-korea-passes.jpg"
            alt="Incheon International Airport from above"
            fill
            sizes="144px"
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
          <p className="mt-1 mb-0 text-base font-bold leading-snug text-slate-900 sm:text-lg">
            Explore Korea with Klook Travel Passes
          </p>
          <p className="mt-1 mb-0 text-xs leading-relaxed text-slate-600 sm:text-sm">
            AREX airport express, KTX rail passes, and attraction tickets.
          </p>
        </div>
      </div>
      <a
        href={KLOOK_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="klk-cta flex h-12 w-full shrink-0 items-center justify-center rounded-xl px-4 text-sm font-semibold whitespace-nowrap text-white no-underline transition-colors sm:w-[190px]"
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
