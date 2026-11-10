'use client'

import { useEffect } from 'react'
import { HUB_ORDER, TOOLS, toolHref, type ToolId } from './toolList'
import { TOOL_ART } from './toolArt'

const isToolId = (id: string): id is ToolId => TOOLS.some(t => t.id === id)

/**
 * 도구 허브. 카드는 도구마다 따로 색인되는 개별 페이지(/tools/슬러그)로 간다.
 * 예전에는 /tools#도구id 로 이 화면에서 모달을 띄웠다 — 그 주소로 들어오면 개별 페이지로 옮겨 준다.
 * next/link 대신 <a> 를 쓰는 이유: next/link 의 RSC 요청은 오프라인 캐시에 없다.
 */
export function ToolsHub() {
  useEffect(() => {
    const id = location.hash.slice(1)
    if (isToolId(id)) location.replace(toolHref(id))
  }, [])

  return (
    <>
      <style>{`
        .tl-wrap.th-wrap { max-width: 1040px; }
        .th-hero { background: #121212; color: #fff; }
        .th-hero-inner { box-sizing: border-box; max-width: 832px; margin: 0 auto; padding: 20px 32px 48px; }
        .th-back { display: inline-flex; align-items: center; min-height: 44px; margin-bottom: 18px; color: #D1D5DB; text-decoration: none; font-size: 14px; font-weight: 600; }
        .th-tag { display: block; width: fit-content; margin: 0 0 12px; padding: 4px 8px; border-radius: 6px; background: #C8102E; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: .12em; }
        .th-hero h1 { margin: 0 0 10px; font-family: "Playfair Display", Georgia, serif; font-size: 40px; font-weight: 700; line-height: 1.15; color: #fff; }
        .th-hero-sub { margin: 0; font-size: 16px; line-height: 1.6; color: #D1D5DB; }
        @media (hover: hover) { .th-back:hover { color: #fff; } }
        .th-list { display: flex; flex-direction: column; gap: 16px; max-width: 768px; margin: 0 auto; }
        .th-card { display: flex; align-items: center; gap: 20px; padding: 14px 20px 14px 14px; background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.05); text-decoration: none; color: inherit; transition: transform .2s, box-shadow .2s, border-color .2s; }
        .th-thumb { flex: none; display: block; width: 112px; height: 84px; border-radius: 12px; overflow: hidden; }
        .th-thumb svg { display: block; width: 100%; height: 100%; }
        .th-text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .th-title { font-family: "Playfair Display", Georgia, serif; font-size: 18px; font-weight: 700; line-height: 1.25; color: #111827; margin-bottom: 4px; }
        .th-desc { font-size: 14px; line-height: 1.5; color: #374151; }
        .th-arrow { flex: none; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: 1px solid #E5E7EB; border-radius: 50%; font-size: 16px; line-height: 1; color: #6B7280; transition: color .2s, border-color .2s, background .2s; }
        @media (hover: hover) { .th-card:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(0,0,0,.08); border-color: #C8102E; } .th-card:hover .th-arrow { color: #fff; background: #C8102E; border-color: #C8102E; } }
        @media (prefers-reduced-motion: reduce) { .th-card, .th-arrow { transition: none; } .th-card:hover { transform: none; } }
        .th-back:focus-visible, .th-card:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }

        @media (max-width: 767px) {
          .th-hero-inner { padding: 12px 20px 36px; }
          .th-hero h1 { font-size: 30px; }
          .th-list { gap: 12px; }
          .th-card { gap: 12px; padding: 10px 12px 10px 10px; }
          .th-thumb { width: 72px; height: 54px; border-radius: 10px; }
          .th-title { font-size: 16px; margin-bottom: 2px; }
          .th-desc { font-size: 13px; line-height: 1.45; }
          .th-arrow { width: 28px; height: 28px; font-size: 14px; }
        }
      `}</style>

      <header className="th-hero">
        <div className="th-hero-inner">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- 오프라인 캐시에 있는 이 페이지에서 홈으로 페이지째 이동한다 */}
          <a className="th-back" href="/">← Back to Home</a>
          <p className="th-tag">TRAVEL TOOLS</p>
          <h1>Your Pocket Companion for Traveling Korea</h1>
          <p className="th-hero-sub">Fast, lightweight utilities designed for your pocket on the go.</p>
        </div>
      </header>

      <div className="tl-wrap th-wrap">
        <div className="th-list">
          {HUB_ORDER.map(id => TOOLS.find(t => t.id === id)!).map(t => (
            <a key={t.id} href={toolHref(t.id)} className="th-card">
              <span className="th-thumb" style={{ background: TOOL_ART[t.id].background }}>{TOOL_ART[t.id].art}</span>
              <span className="th-text">
                <span className="th-title">{t.title}</span>
                <span className="th-desc">{t.desc}</span>
              </span>
              <span className="th-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
