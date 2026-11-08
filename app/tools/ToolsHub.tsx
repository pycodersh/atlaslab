'use client'

import { useEffect, useRef, useState, type ComponentType, type MouseEvent, type ReactNode } from 'react'
import { Banknote, Clock, CloudSun, MapPin, Ticket, Timer, TrainFront, UtensilsCrossed } from 'lucide-react'
import { TOOLS, toolHref, type ToolId } from './toolList'
import { OrderBuilder } from './order-builder/OrderBuilder'
import { SubwayTimer } from './subway-timer/SubwayTimer'
import { SubwayRules } from './subway-timer/SubwayRules'
import { KrwConverter, type Rates } from './krw-converter/KrwConverter'
import { TransitGuide } from './transit-guide/TransitGuide'
import { WeatherForecast } from './weather/WeatherForecast'
import { KpopCalendar } from './kpop-calendar/KpopCalendar'
import { WorldTime } from './world-time/WorldTime'
import { HotspotFinder } from './hotspot-finder/HotspotFinder'

const ICONS: Record<ToolId, ComponentType<{ size?: number; strokeWidth?: number }>> = {
  'order-builder': UtensilsCrossed,
  'subway-timer': Timer,
  'krw-converter': Banknote,
  'transit-guide': TrainFront,
  weather: CloudSun,
  'kpop-calendar': Ticket,
  'world-time': Clock,
  'hotspot-finder': MapPin,
}
// 도구 성격별 아이콘 색 [배경, 글자]
const TINTS: Record<ToolId, [string, string]> = {
  'order-builder': ['#FEE2E2', '#B91C1C'],
  'subway-timer': ['#FEF3C7', '#B45309'],
  'krw-converter': ['#D1FAE5', '#047857'],
  'transit-guide': ['#DBEAFE', '#1D4ED8'],
  weather: ['#E0F2FE', '#0369A1'],
  'kpop-calendar': ['#F3E8FF', '#7E22CE'],
  'world-time': ['#E0E7FF', '#4338CA'],
  'hotspot-finder': ['#CCFBF1', '#0F766E'],
}
const isToolId = (id: string): id is ToolId => TOOLS.some(t => t.id === id)

/**
 * 도구 허브. 카드는 진짜 링크(/tools/*)이고, 일반 클릭은 같은 화면에서 위젯을 띄운다.
 * 데스크톱은 가운데 모달, 폰은 화면 전체. 주소에 #도구id 를 남겨 뒤로 가기로 닫힌다.
 * 위젯을 지연 로드하지 않는 이유: 오프라인 캐시가 이 페이지의 정적 파일만 받아 두기 때문이다.
 */
export function ToolsHub({ rates, updated }: { rates: Rates; updated: string }) {
  const [openId, setOpenId] = useState<ToolId | null>(null)
  const openedHere = useRef(false)

  useEffect(() => {
    const read = () => {
      const id = location.hash.slice(1)
      setOpenId(isToolId(id) ? id : null)
    }
    read()
    window.addEventListener('popstate', read)
    return () => window.removeEventListener('popstate', read)
  }, [])

  const close = () => {
    if (openedHere.current) {
      openedHere.current = false
      history.back()
    } else {
      history.replaceState(null, '', location.pathname)
      setOpenId(null)
    }
  }

  useEffect(() => {
    if (!openId) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Order Builder 전체 화면이나 공연장 퀵 가이드가 열려 있으면 Esc 를 그쪽이 먼저 받는다
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('.ob-show, .kp-quick-overlay')) close() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [openId])

  const open = (e: MouseEvent<HTMLAnchorElement>, id: ToolId) => {
    // 새 탭으로 열기(Ctrl · Cmd · 가운데 클릭)는 링크 그대로 둔다
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    openedHere.current = true
    history.pushState(null, '', `#${id}`)
    setOpenId(id)
  }

  const widgets: Record<ToolId, ReactNode> = {
    'order-builder': <OrderBuilder />,
    'subway-timer': <><SubwayTimer /><SubwayRules /></>,
    'krw-converter': <KrwConverter rates={rates} updated={updated} />,
    'transit-guide': <TransitGuide />,
    weather: <WeatherForecast />,
    'kpop-calendar': <KpopCalendar />,
    'world-time': <WorldTime />,
    'hotspot-finder': <HotspotFinder />,
  }
  const openTool = TOOLS.find(t => t.id === openId)

  return (
    <>
      <style>{`
        .tl-wrap.th-wrap { max-width: 1040px; }
        .th-hero { background: #121212; color: #fff; }
        .th-hero-inner { box-sizing: border-box; max-width: 1040px; margin: 0 auto; padding: 20px 32px 48px; }
        .th-back { display: inline-flex; align-items: center; min-height: 44px; margin-bottom: 18px; color: #D1D5DB; text-decoration: none; font-size: 14px; font-weight: 600; }
        .th-tag { display: block; width: fit-content; margin: 0 0 12px; padding: 4px 8px; border-radius: 6px; background: #C8102E; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: .12em; }
        .th-hero h1 { margin: 0 0 10px; font-family: "Playfair Display", Georgia, serif; font-size: 40px; font-weight: 700; line-height: 1.15; color: #fff; }
        .th-hero-sub { margin: 0; font-size: 16px; line-height: 1.6; color: #D1D5DB; }
        @media (hover: hover) { .th-back:hover { color: #fff; } }
        .th-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .th-card { position: relative; display: flex; flex-direction: column; padding: 18px; background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.05); text-decoration: none; color: inherit; transition: transform .2s, box-shadow .2s, border-color .2s; }
        @media (hover: hover) { .th-card:hover { transform: translateY(-3px); box-shadow: 0 8px 22px rgba(0,0,0,.1); border-color: #D1D5DB; } .th-card:hover .th-arrow { color: #111827; } }
        @media (prefers-reduced-motion: reduce) { .th-card { transition: none; } .th-card:hover { transform: none; } }
        .th-arrow { position: absolute; top: 14px; right: 16px; font-size: 16px; line-height: 1; color: #9CA3AF; transition: color .2s; }
        .th-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; margin-bottom: 12px; }
        .th-title { font-family: "Playfair Display", Georgia, serif; font-size: 17px; font-weight: 700; line-height: 1.25; color: #111827; margin-bottom: 4px; }
        .th-desc { font-size: 13.5px; line-height: 1.55; color: #374151; }

        .th-overlay { position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; background: rgba(17,24,39,.55); }
        .th-modal { display: flex; flex-direction: column; width: min(980px, calc(100vw - 48px)); height: min(88vh, 920px); background: #FAFAF8; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
        .th-head { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 20px; background: #fff; border-bottom: 1px solid #E5E7EB; }
        .th-head h2 { font-size: 16px; font-weight: 700; color: #111827; margin: 0; min-width: 0; }
        .th-head-actions { display: flex; align-items: center; gap: 8px; flex: none; }
        .th-action { display: flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 12px; border: 1px solid #D1D5DB; border-radius: 10px; background: #fff; color: #374151; text-decoration: none; font: 600 13px "DM Sans", Inter, system-ui, sans-serif; cursor: pointer; }
        .th-body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; padding: 24px; }
        .th-body .kp-calendar { top: 0; }
        .th-back:focus-visible, .th-card:focus-visible, .th-action:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }

        @media (min-width: 640px) { .th-grid { gap: 16px; } .th-card { padding: 22px; } }
        @media (min-width: 1024px) { .th-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } .th-title { font-size: 18px; } .th-desc { font-size: 14px; } }
        @media (max-width: 767px) {
          .th-hero-inner { padding: 12px 20px 36px; }
          .th-hero h1 { font-size: 30px; }
          .th-overlay { align-items: stretch; background: #FAFAF8; }
          .th-modal { width: 100%; height: 100dvh; border-radius: 0; box-shadow: none; }
          .th-head { padding: 8px 12px 8px 16px; }
          .th-body { padding: 20px 16px 40px; }
          .th-action.is-open span { display: none; }
        }
      `}</style>

      <header className="th-hero">
        <div className="th-hero-inner">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- 오프라인 캐시에 있는 이 페이지에서 홈으로 페이지째 이동한다 */}
          <a className="th-back" href="/">← Back to Home</a>
          <p className="th-tag">TRAVEL UTILITIES</p>
          <h1>Your Pocket Companion for Traveling Korea</h1>
          <p className="th-hero-sub">Fast, lightweight utilities designed for your pocket on the go.</p>
        </div>
      </header>

      <div className="tl-wrap th-wrap">
        <div className="th-grid">
          {TOOLS.map(t => {
            const Icon = ICONS[t.id]
            const [background, color] = TINTS[t.id]
            return (
              <a key={t.id} href={toolHref(t.id)} className="th-card" onClick={e => open(e, t.id)}>
                <span className="th-arrow" aria-hidden="true">↗</span>
                <span className="th-icon" style={{ background, color }} aria-hidden="true"><Icon size={22} strokeWidth={1.75} /></span>
                <span className="th-title">{t.title}</span>
                <span className="th-desc">{t.desc}</span>
              </a>
            )
          })}
        </div>
      </div>

      {openTool && (
        <div className="th-overlay" onClick={e => { if (e.target === e.currentTarget) close() }}>
          <div className="th-modal" role="dialog" aria-modal="true" aria-label={openTool.title}>
            <header className="th-head">
              <h2>{openTool.title}</h2>
              <div className="th-head-actions">
                <a className="th-action is-open" href={toolHref(openTool.id)} target="_blank" rel="noopener noreferrer" aria-label="Open in new window"><span>Open in new window&nbsp;</span>↗</a>
                <button type="button" className="th-action" autoFocus onClick={close}>Close</button>
              </div>
            </header>
            <div key={openTool.id} className="th-body">{widgets[openTool.id]}</div>
          </div>
        </div>
      )}
    </>
  )
}
