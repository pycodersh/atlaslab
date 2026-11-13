'use client'

import { InstallAppButton, type InstallTheme } from './InstallAppButton'

/**
 * 랜딩 가격 카드 아래의 가로형 슬림 설치 카드 — /kpatto · /kpantry/landing 공통.
 * 왼쪽: 앱 아이콘 + 제목 + 한 줄 설명, 오른쪽: 다크 차콜 미니 버튼(가격표의 빨간 결제 버튼과 경쟁하지 않게).
 * 버튼 동작(네이티브 설치 창 · iOS/메뉴 안내 모달)은 InstallAppButton 그대로이고,
 * 이미 설치된 창(standalone)에서는 카드째 숨는다(frame).
 */
export function InstallAppCard({ theme, iconSrc }: { theme: InstallTheme; iconSrc: string }) {
  return (
    <InstallAppButton
      theme={theme}
      variant="bare"
      label="Install App ↓"
      className="px-4 py-2 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 whitespace-nowrap transition-colors"
      frame={button => (
        <div className="mt-5 bg-white border border-stone-200/90 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
            {/* 장식용 — 이름은 바로 옆 제목이 말한다 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iconSrc} alt="" width={36} height={36} className="w-9 h-9 rounded-lg shrink-0" />
            <div className="min-w-0">
              {/* 한 문장 그대로 둔다 — 앱 이름만 notranslate 로 떼면 사이트 번역(KO 등)이 앞뒤를 따로 옮겨 어순이 깨진다 */}
              <p className="m-0 text-sm font-semibold text-stone-900 leading-snug">
                {`Install ${theme.appName} on your device`}
              </p>
              <p className="m-0 mt-0.5 text-xs text-stone-500 leading-snug">
                Add to your home screen for one-tap access on iOS, Android, or desktop.
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto">{button}</div>
        </div>
      )}
    />
  )
}
