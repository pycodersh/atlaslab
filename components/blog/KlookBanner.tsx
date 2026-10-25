'use client'

import { useEffect, useRef, useState } from 'react'

const LOADER_SRC = 'https://affiliate.klook.com/widget/fetch-iframe-init.js'
const W = 728
const H = 90

/**
 * Klook 어필리에이트 배너(728×90) — Explore Korea 글 본문 바로 아래.
 *
 * 로더는 실행될 때마다 위젯 스크립트를 다시 붙이고, 위젯 스크립트는 그 시점에 문서의
 * .klk-aff-widget 을 전부 찾아 iframe 으로 바꾼다. 그래서 <Script> 로 한 번만 싣는 대신
 * 마운트마다 로더를 새로 넣는다 — 클라이언트 내비게이션으로 다른 글에 들어와도 배너가 뜬다.
 * <ins> 안쪽은 위젯이 innerHTML 로 갈아끼우므로 React 가 자식을 추적하지 않게 문자열로 넘긴다.
 *
 * 위젯이 iframe 에 width:728px; max-width:none 을 인라인으로 박아서 CSS 로는 줄일 수 없다.
 * PC 는 본문 칼럼(680px)의 좌우 패딩까지 써서 760px 안에 그대로 넣고,
 * 그보다 좁으면 칼럼 폭에 맞춰 비율 그대로 축소한다(잘리지 않게).
 */
export function KlookBanner() {
  const boxRef = useRef<HTMLElement | null>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const s = document.createElement('script')
    s.src = LOADER_SRC
    s.async = true
    document.body.appendChild(s)
    return () => { s.remove() }
  }, [])

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    // 마운트 직후 한 번 재고, 이후에는 창 크기·칼럼 폭이 바뀔 때마다 다시 잰다
    const fit = () => setScale(Math.min(1, box.clientWidth / W))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    window.addEventListener('resize', fit)
    return () => { ro.disconnect(); window.removeEventListener('resize', fit) }
  }, [])

  return (
    <aside ref={boxRef} className="klk-banner" aria-label="Sponsored" style={{ height: H * scale }}>
      <style>{`
        /* 본문 마지막 문단·아래 앱 CTA 와 붙지 않게 위아래 여백.
           좌우 -40px 은 .art-wrap 패딩만큼 — PC 에서 728px 이 잘리지 않고 들어간다. */
        .klk-banner {
          margin: 48px -40px 40px;
          display: flex; justify-content: center;
          overflow: hidden;
        }
        .klk-banner ins {
          display: block; flex: none;
          width: ${W}px; height: ${H}px;
          transform-origin: top center;
        }
        @media (max-width: 600px) {
          /* 모바일 .art-wrap 패딩은 20px */
          .klk-banner { margin: 36px -20px 32px; }
        }
      `}</style>
      <ins
        className="klk-aff-widget"
        data-wid="138930"
        data-bgtype="Play"
        data-adid="1524803"
        data-lang="en-BS"
        data-prod="banner"
        data-width={W}
        data-height={H}
        style={{ transform: scale < 1 ? `scale(${scale})` : undefined }}
        dangerouslySetInnerHTML={{ __html: '<a href="//www.klook.com/?aid=">Klook.com</a>' }}
      />
    </aside>
  )
}
