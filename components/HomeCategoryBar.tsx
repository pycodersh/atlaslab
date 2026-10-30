'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * 홈 카테고리 바로가기 — 히어로 아래, 'Products' 위.
 * 스크롤해서 히어로를 지나면 상단 메뉴(56px) 바로 아래에 붙어 따라온다(sticky + 살짝 흐린 배경).
 * 탭을 누르면 해당 섹션으로 부드럽게 이동하고, 보고 있는 섹션의 탭이 IntersectionObserver 로 켜진다.
 * 탭은 상단 메뉴와 같은 3대 축(Products · Korean · Guides) — 각 탭은 그 축의 첫 섹션 id 를 받는다.
 * 축 안의 뒤쪽 섹션(예: Korean 의 두 번째 섹션)을 지나는 동안에도 그 축의 탭이 켜진 채로 있다.
 * 맨 위(히어로)에서는 아무 탭도 켜지지 않는다 — 예전의 All 탭은 없앴다.
 */
export type HomeTab = { id: string; label: string }

const NAV_H = 56   // components/SiteNav .site-nav 높이
const BAR_H = 52

export function HomeCategoryBar({ tabs }: { tabs: HomeTab[] }) {
  const [active, setActive] = useState<string>('')
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
      let current = ''
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
    const left = btn.offsetLeft, right = left + btn.offsetWidth
    if (left < row.scrollLeft) row.scrollTo({ left: left - 16, behavior: 'smooth' })
    else if (right > row.scrollLeft + row.clientWidth) row.scrollTo({ left: right - row.clientWidth + 16, behavior: 'smooth' })
  }, [active])

  // 밑줄 — 탭마다 테두리를 켜고 끄는 대신 하나를 켜진 탭 글자 아래로 미끄러뜨린다(클릭 · 스크롤 모두 부드럽게).
  // 상태로 두면 렌더가 한 번 더 돌아서 DOM 스타일만 바꾼다. 굵기가 바뀌면 글자 폭도 바뀌니 다음 프레임에 잰다.
  const indicatorRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const place = () => {
      const btn = scrollerRef.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`)
      const bar = indicatorRef.current
      if (!bar) return
      // 맨 위(켜진 탭 없음)로 돌아오면 밑줄을 숨긴다
      if (!btn) { bar.style.opacity = '0'; return }
      const text = btn.querySelector<HTMLElement>('.hcat-label') ?? btn
      bar.style.width = `${text.offsetWidth}px`
      // 탭 줄(.hcat-scroll)이 position: relative 라 글자의 offsetLeft 는 이미 줄 기준이다
      bar.style.transform = `translateX(${text.offsetLeft}px)`
      bar.style.opacity = '1'
    }
    const raf = requestAnimationFrame(place)
    window.addEventListener('resize', place)
    document.fonts?.ready.then(place).catch(() => {})
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', place) }
  }, [active, tabs])

  const go = (id: string) => {
    setActive(id)
    locked.current = true
    clearTimeout(lockTimer.current)
    lockTimer.current = setTimeout(() => { locked.current = false }, 900)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <style>{`
        .hcat {
          position: sticky; top: ${NAV_H}px; z-index: 90;
          background: rgba(255,255,255,0.86);
          -webkit-backdrop-filter: saturate(160%) blur(10px); backdrop-filter: saturate(160%) blur(10px);
          border-bottom: 1px solid var(--rule, #E5E1DC);
        }
        /* 밑줄 탭 — 배경 · 테두리 없는 글자 탭, 켜진 탭만 굵게 + 아래 2px 밑줄(브랜드 레드) */
        .hcat-scroll {
          position: relative;
          display: flex; gap: 32px; align-items: stretch;
          height: ${BAR_H}px; overflow-x: auto; overscroll-behavior-x: contain;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .hcat-scroll::-webkit-scrollbar { display: none; }
        .hcat-tab {
          flex: 0 0 auto; display: flex; align-items: center;
          padding: 12px 4px; margin: 0; border: 0; background: none; border-radius: 0;
          font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 14px; font-weight: 500;
          letter-spacing: 0.01em; color: var(--ink-muted, #6B6B6B); cursor: pointer; white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
          transition: color .2s ease;
        }
        .hcat-tab:focus-visible { outline: 2px solid var(--ink, #111); outline-offset: -4px; border-radius: 2px; }
        @media (hover: hover) { .hcat-tab:hover { color: var(--ink, #111); } }
        .hcat-tab[aria-current="true"] { color: var(--ink, #111); font-weight: 700; }
        /* 굵게 바뀌어도 탭 폭이 그대로이게 — 굵은 글자 폭을 보이지 않는 줄로 미리 잡아 둔다(옆 탭이 밀리지 않는다) */
        .hcat-label { display: inline-flex; flex-direction: column; align-items: center; }
        .hcat-label::after {
          content: attr(data-text); height: 0; overflow: hidden; visibility: hidden;
          font-weight: 700; pointer-events: none; user-select: none;
        }
        .hcat-indicator {
          position: absolute; left: 0; bottom: 0; height: 2px; width: 0;
          background: var(--brand-red, #C8102E); border-radius: 2px 2px 0 0;
          opacity: 0; pointer-events: none;
          transition: transform .3s cubic-bezier(.4, 0, .2, 1), width .3s cubic-bezier(.4, 0, .2, 1), opacity .2s;
        }
        @media (max-width: 640px) { .hcat-scroll { gap: 24px; } .hcat-tab { font-size: 13.5px; } }
        @media (prefers-reduced-motion: reduce) { .hcat-indicator, .hcat-tab { transition: none; } }
        /* 바로 이동한 섹션 머리가 메뉴 + 바 밑에 가리지 않게 */
        ${tabs.map(t => `#${t.id}`).join(', ')} { scroll-margin-top: ${NAV_H + BAR_H + 12}px; }
      `}</style>
      <nav className="hcat" aria-label="Jump to a section">
        <div className="wrap">
          <div className="hcat-scroll" ref={scrollerRef}>
            {tabs.map(t => (
              // 축 이름은 상단 메뉴처럼 자동 번역에서 뺀다('Korean' 이 '한국인'이 된다)
              <button key={t.id} type="button" data-tab={t.id} className="hcat-tab" translate="no"
                aria-current={active === t.id ? 'true' : undefined} onClick={() => go(t.id)}>
                <span className="hcat-label" data-text={t.label}>{t.label}</span>
              </button>
            ))}
            <span ref={indicatorRef} className="hcat-indicator" aria-hidden="true" />
          </div>
        </div>
      </nav>
    </>
  )
}
