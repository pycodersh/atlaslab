import { KLOOK_URL } from '@/lib/affiliate/links'

const PERKS = ['Instant AREX QR', 'Korail KTX Rail Pass'] as const

/**
 * Klook 제휴 배너 — 왼쪽 오렌지 브랜드 블록 + 오른쪽 카피 · 혜택 태그 · CTA. 폰은 위아래로 쌓는다.
 * 노출 그룹(Explore Korea · Food · Life)과 글당 제휴 배너 2개 상한은 글 상세 라우트가 정한다.
 *
 * 예전 728×90 위젯(iframe)은 이미지 한 장이라 본문과 톤이 따로 놀고 클릭 대상도 위젯이 정했다.
 * 지금은 서버에서 그리는 일반 카드라 스크립트 · iframe 이 없다.
 * dark: 변형은 쓰지 않는다 — 글 페이지 자체에 다크 모드가 없어서, OS 다크 설정에서 이 카드만 어두워진다.
 */
export function KlookBanner() {
  return (
    <aside
      aria-label="Sponsored"
      className="my-12 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6"
    >
      <div
        aria-hidden="true"
        className="flex h-36 w-full shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#FF5B00] to-[#E05000] text-white sm:w-48"
      >
        <span className="text-3xl font-extrabold tracking-wide" translate="no">KLOOK</span>
        <span className="mt-1.5 text-[11px] font-semibold tracking-[0.14em] opacity-90" translate="no">
          AREX · KTX · PASSES
        </span>
      </div>

      <div className="min-w-0">
        <p className="m-0 text-[11px] font-bold uppercase tracking-[0.12em] text-[#FF5B00]">Activities &amp; Transportation</p>
        <p className="mt-1.5 mb-0 text-lg font-semibold leading-snug text-neutral-900 sm:text-xl">
          Explore Korea with Klook Travel Passes
        </p>
        <p className="mt-1.5 mb-0 text-sm leading-relaxed text-neutral-600">
          Skip the queues at Incheon Airport with AREX express train tickets, or grab unlimited KTX rail passes for
          seamless Seoul-Busan trips.
        </p>
        <ul className="mt-3 mb-0 flex list-none flex-wrap gap-2 p-0">
          {PERKS.map(p => (
            <li key={p} className="m-0 rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs text-orange-700">
              ✓ {p}
            </li>
          ))}
        </ul>
        <a
          href={KLOOK_URL}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mt-4 inline-block rounded-xl bg-[#FF5B00] px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#E05000] hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
          Book Passes →
        </a>
      </div>
    </aside>
  )
}
