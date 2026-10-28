'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * 홈 카테고리 바로가기 — 히어로 아래, 'Our Resources' 위.
 * 스크롤해서 히어로를 지나면 상단 메뉴(56px) 바로 아래에 붙어 따라온다(sticky + 살짝 흐린 배경).
 * 탭을 누르면 해당 섹션으로 부드럽게 이동하고, 보고 있는 섹션의 탭이 IntersectionObserver 로 켜진다.
 * 탭 목록은 홈이 실제로 그린 섹션만 받는다(글이 적어 감춘 섹션은 탭도 없다).
 */
export type HomeTab = { id: string; label: string }

const NAV_H = 56   // components/SiteNav .site-nav 높이
const BAR_H = 52

export function HomeCategoryBar({ tabs }: { tabs: HomeTab[] }) {
  const [active, setActive] = useState<string>('all')
  const scrollerRef = useRef<HTMLDivElement>(null)
  // 탭을 눌러 이동하는 동안에는 관찰 결과가 탭을 이리저리 바꾸지 않게 잠깐 고정한다
  const locked = useRef(false)
  const lockTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(lockTimer.current), [])

  useEffect(() => {
    const els = tabs.map(t => document.getElementById(t.id)).filter((e): e is HTMLElement => !!e)
    if (!els.length) return
    // 지금 보는 섹션 = 머리가 '메뉴 + 바 아래 ~ 화면 35%' 선을 지난 섹션 중 마지막.
    // 맨 끝 섹션은 머리가 그 선까지 올라오지 못할 수 있어, 페이지 바닥에 닿으면 마지막 탭을 켠다.
    const pick = () => {
      if (locked.current) return
      const line = NAV_H + BAR_H + window.innerHeight * 0.35
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      if (atBottom && window.scrollY > 0) { setActive(els[els.length - 1].id); return }
      let current = 'all'
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id
      setActive(current)
    }
    // 섹션이 그 선을 넘나드는 순간은 IntersectionObserver 로 받고, 바닥 · 빠른 점프는 스크롤로 보정한다
    const io = new IntersectionObserver(pick, {
      rootMargin: `-${NAV_H + BAR_H}px 0px -${Math.round(window.innerHeight * 0.65) - NAV_H - BAR_H}px 0px`,
      threshold: [0, 1],
    })
    els.forEach(el => io.observe(el))
    let raf = 0
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(pick) }
    window.addEventListener('scroll', onScroll, { passive: true })
    pick()
    return () => { io.disconnect(); cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll) }
  }, [tabs])

  // 켜진 탭이 가로 스크롤 밖에 있으면 보이게 끌어온다(모바일).
  // scrollIntoView 는 페이지까지 세로로 움직이므로 쓰지 않고, 탭 줄만 가로로 민다.
  useEffect(() => {
    const row = scrollerRef.current
    const btn = row?.querySelector<HTMLElement>(`[data-tab="${active}"]`)
    if (!row || !btn) return
    const left = btn.offsetLeft - row.offsetLeft, right = left + btn.offsetWidth
    if (left < row.scrollLeft) row.scrollTo({ left: left - 16, behavior: 'smooth' })
    else if (right > row.scrollLeft + row.clientWidth) row.scrollTo({ left: right - row.clientWidth + 16, behavior: 'smooth' })
  }, [active])

  const go = (id: string) => {
    setActive(id)
    locked.current = true
    clearTimeout(lockTimer.current)
    lockTimer.current = setTimeout(() => { locked.current = false }, 900)
    if (id === 'all') { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const all: HomeTab[] = [{ id: 'all', label: 'All' }, ...tabs]

  return (
    <>
      <style>{`
        .hcat {
          position: sticky; top: ${NAV_H}px; z-index: 90;
          background: rgba(255,255,255,0.86);
          -webkit-backdrop-filter: saturate(160%) blur(10px); backdrop-filter: saturate(160%) blur(10px);
          border-bottom: 1px solid var(--rule, #E5E1DC);
        }
        .hcat-scroll {
          display: flex; gap: 8px; align-items: center;
          height: ${BAR_H}px; overflow-x: auto; overscroll-behavior-x: contain;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .hcat-scroll::-webkit-scrollbar { display: none; }
        .hcat-tab {
          flex: 0 0 auto; height: 32px; padding: 0 15px; border-radius: 999px;
          border: 1px solid var(--rule, #E5E1DC); background: var(--paper-warm, #F7F5F2);
          font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 13px; font-weight: 600;
          color: var(--ink-muted, #6B6B6B); cursor: pointer; white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
          transition: background .15s, border-color .15s, color .15s;
        }
        .hcat-tab:focus-visible { outline: 2px solid var(--ink, #111); outline-offset: 2px; }
        @media (hover: hover) { .hcat-tab:hover { border-color: var(--ink, #111); color: var(--ink, #111); } }
        .hcat-tab[aria-current="true"] { background: var(--ink, #111); border-color: var(--ink, #111); color: #fff; }
        /* 바로 이동한 섹션 머리가 메뉴 + 바 밑에 가리지 않게 */
        ${tabs.map(t => `#${t.id}`).join(', ')} { scroll-margin-top: ${NAV_H + BAR_H + 12}px; }
      `}</style>
      <nav className="hcat" aria-label="Jump to a section">
        <div className="wrap">
          <div className="hcat-scroll" ref={scrollerRef}>
            {all.map(t => (
              <button key={t.id} type="button" data-tab={t.id} className="hcat-tab"
                aria-current={active === t.id ? 'true' : undefined} onClick={() => go(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  )
}
