'use client'

import { useEffect, useState } from 'react'
import { TRY_APP_PATH } from '@/lib/kpatto/purchase'

/**
 * 글 상세 · 모바일 전용 하단 고정 CTA — 글을 20% 이상 내려 읽으면 아래에서 올라온다.
 * 768px 이상에서는 CSS 로 아예 숨긴다(넓은 화면은 본문 CTA · 하단 배너로 충분).
 * 닫으면 이 탭(세션) 동안은 다시 띄우지 않는다. sessionStorage 를 못 쓰는 환경이면 이번 페이지에서만 닫힌다.
 */
const KEY = 'atlas:article-sticky-cta-closed'

export function ArticleStickyCta() {
  const [show, setShow] = useState(false)
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    let raf = 0
    const check = () => {
      try { if (sessionStorage.getItem(KEY) === '1') { setClosed(true); return } } catch { /* 저장소 막힘 — 그냥 띄운다 */ }
      const max = document.documentElement.scrollHeight - window.innerHeight
      setShow(max > 0 && window.scrollY / max >= 0.2)
    }
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(check) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [])

  if (closed) return null

  const close = () => {
    setClosed(true)
    try { sessionStorage.setItem(KEY, '1') } catch { /* 무시 */ }
  }

  return (
    <div className={show ? 'astk is-on' : 'astk'} role="complementary" aria-label="K-Patto webtoon" aria-hidden={!show}>
      <style>{`
        .astk {
          position: fixed; left: 0; right: 0; bottom: 0; z-index: 150;
          display: none;
          padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
          background: rgba(18,18,18,0.97); color: #fff;
          border-top: 2px solid var(--brand-red, #C8102E);
          box-shadow: 0 -6px 20px rgba(0,0,0,0.18);
          transform: translateY(110%); transition: transform .28s cubic-bezier(.4,0,.2,1);
        }
        @media (max-width: 767px) { .astk { display: flex; align-items: center; gap: 10px; } }
        .astk.is-on { transform: translateY(0); }
        .astk-icon { flex: 0 0 auto; }
        .astk-text {
          flex: 1; min-width: 0; margin: 0;
          font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 13px; font-weight: 600; line-height: 1.3;
        }
        .astk-btn {
          flex: 0 0 auto; display: inline-flex; align-items: center; min-height: 36px; padding: 0 14px;
          background: var(--brand-red, #C8102E); color: #fff; text-decoration: none; border-radius: 6px;
          font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 13px; font-weight: 700; white-space: nowrap;
        }
        .astk-btn:active { background: var(--brand-red-dark, #A30D25); }
        .astk-x {
          flex: 0 0 auto; width: 32px; height: 32px; margin-right: -4px;
          display: inline-flex; align-items: center; justify-content: center;
          border: 0; background: none; color: rgba(255,255,255,0.65); font-size: 20px; line-height: 1; cursor: pointer;
        }
        @media (prefers-reduced-motion: reduce) { .astk { transition: none; } }
      `}</style>
      <svg className="astk-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF5A6E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 5.5C4.5 4 7.5 4 12 6c4.5-2 7.5-2 10-.5V19c-2.5-1.5-5.5-1.5-10 .5-4.5-2-7.5-2-10-.5z" />
        <line x1="12" y1="6" x2="12" y2="19.5" />
      </svg>
      <p className="astk-text">Learn real phrases with K-Patto Webtoon</p>
      <a href={TRY_APP_PATH} className="astk-btn" tabIndex={show ? 0 : -1}>Try Ep.1 Free</a>
      <button type="button" className="astk-x" aria-label="Close" onClick={close} tabIndex={show ? 0 : -1}>×</button>
    </div>
  )
}
