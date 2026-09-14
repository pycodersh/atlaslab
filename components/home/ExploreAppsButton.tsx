'use client'

/**
 * 히어로의 "Explore our apps" 버튼.
 *
 * 기본 앵커 점프 대신 부드럽게 스크롤하고, 도착하면 앱 카드를 순차로 살짝
 * 띄워 시선을 모은다(.pcard-glow, 스타일은 app/page.tsx 의 <style> 에 있다).
 *
 * href 는 그대로 둔다 — JS 가 안 돌아도 앵커로는 이동해야 한다.
 * prefers-reduced-motion 이면 강조 없이 바로 이동한다.
 */
const TARGET_ID = 'products'
const GLOW_CLASS = 'pcard-glow'
const START_DELAY = 380   // 스크롤이 자리잡을 때까지
const STAGGER = 130       // 카드 간 간격
const GLOW_MS = 900

export function ExploreAppsButton({ children }: { children: React.ReactNode }) {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(TARGET_ID)
    if (!target) return // 앵커 기본 동작에 맡긴다

    e.preventDefault()

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })

    if (reduced) return

    const cards = target.querySelectorAll<HTMLElement>('.pcard')
    cards.forEach((card, i) => {
      window.setTimeout(() => {
        card.classList.add(GLOW_CLASS)
        window.setTimeout(() => card.classList.remove(GLOW_CLASS), GLOW_MS)
      }, START_DELAY + i * STAGGER)
    })
  }

  return (
    <a href={`#${TARGET_ID}`} className="hero-btn" onClick={onClick}>
      {children}
    </a>
  )
}
