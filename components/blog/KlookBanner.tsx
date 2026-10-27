'use client'

import { useEffect, useRef, useState } from 'react'

const LOADER_SRC = 'https://affiliate.klook.com/widget/fetch-iframe-init.js'
const W = 728
const H = 90

/** Klook 제휴 ID — 위젯 data-wid 와 같은 값(위젯이 만드는 링크의 aid 로 확인) */
const KLOOK_AID = '138930'
const KLOOK_ADID = '1524803'
/** 배너를 누르면 가는 곳 — Klook 한국(국가 ID 10) 여행 탐색 페이지.
 *  ID 는 슬러그 글자가 아니라 숫자로 정해진다: country/14 는 대만, country/12 는 일본(co1012-japan)으로 갔다.
 *  한국은 10 — Klook 이 색인한 'Places to visit in South Korea'(coureg/10) · attractions/south-korea/g10 로 확인(2026-10-27).
 *  ?aid= 로 제휴 ID 를 붙여 클릭이 수수료로 잡히게 한다 */
const KLOOK_HREF = `https://www.klook.com/en-US/coureg/10-south-korea-things-to-do/?aid=${KLOOK_AID}`

/**
 * Klook 어필리에이트 배너(728×90) — Explore Korea · Food · Life 글에서 앱 CTA 카드 바로 아래.
 *
 * 로더는 실행될 때마다 위젯 스크립트를 다시 붙이고, 위젯 스크립트는 그 시점에 문서의
 * .klk-aff-widget 을 전부 찾아 iframe 으로 바꾼다. 그래서 <Script> 로 한 번만 싣는 대신
 * 마운트마다 로더를 새로 넣는다 — 클라이언트 내비게이션으로 다른 글에 들어와도 배너가 뜬다.
 * <ins> 안쪽은 위젯이 innerHTML 로 갈아끼우므로 React 가 자식을 추적하지 않게 문자열로 넘긴다.
 *
 * 404 수정: 원래 위젯 코드의 data-lang="en-BS"(바하마 영어) 때문에 위젯 링크가 klook.com/en-BS/… 로 가서 404 였다.
 * en-US 로 바꾸고, 위젯 iframe 위에 투명 링크를 덮어 클릭은 KLOOK_HREF(Klook 한국 여행 탐색 페이지)로 보낸다.
 * iframe 안의 링크는 Klook 이 그려서 우리가 고칠 수 없기 때문이다.
 *
 * 폭: 본문 칼럼(680px)을 넘지 않는다. 위젯이 iframe 에 width:728px 을 인라인으로 박아서 CSS 로 줄일 수 없으니
 * 칼럼 폭에 맞춰 비율 그대로 축소한다(PC 약 680×84, 휴대폰은 더 작게).
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
        /* 본문 칼럼 폭 그대로(w-full max-w-full), 둥근 모서리로 잘라내고(rounded-xl overflow-hidden),
           위아래 24px(my-6), 가운데 정렬 */
        .klk-banner {
          position: relative;
          width: 100%; max-width: 100%;
          margin: 24px 0;
          display: flex; justify-content: center;
          border-radius: 12px; overflow: hidden;
        }
        .klk-banner ins {
          display: block; flex: none;
          width: ${W}px; height: ${H}px;
          transform-origin: top center;
        }
        /* iframe 위를 덮는 클릭 영역 — 위젯 링크 대신 Klook 한국 여행 탐색 페이지로 */
        .klk-banner-link { position: absolute; inset: 0; z-index: 1; }
        .klk-banner-link:focus-visible { outline: 3px solid #C8102E; outline-offset: -3px; border-radius: 12px; }
      `}</style>
      <ins
        className="klk-aff-widget"
        data-wid={KLOOK_AID}
        data-bgtype="Play"
        data-adid={KLOOK_ADID}
        data-lang="en-US"
        data-prod="banner"
        data-width={W}
        data-height={H}
        style={{ transform: scale < 1 ? `scale(${scale})` : undefined }}
        dangerouslySetInnerHTML={{ __html: `<a href="${KLOOK_HREF}" target="_blank" rel="noopener noreferrer">Klook.com</a>` }}
      />
      <a
        href={KLOOK_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className="klk-banner-link"
        aria-label="Things to do in South Korea on Klook (opens in a new tab)"
      />
    </aside>
  )
}
