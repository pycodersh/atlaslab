'use client'

import { useEffect, useRef, useState, type ComponentType, type MouseEvent, type ReactNode } from 'react'
import { Banknote, Clock, CloudSun, MapPin, Ticket, Timer, TrainFront, UtensilsCrossed } from 'lucide-react'
import { TOOLS, toolHref, type ToolGroup, type ToolId } from './toolList'
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
const FILTERS: ('All' | ToolGroup)[] = ['All', 'Survival', 'Planning']
const isToolId = (id: string): id is ToolId => TOOLS.some(t => t.id === id)

/**
 * 도구 허브. 카드는 진짜 링크(/tools/*)이고, 일반 클릭은 같은 화면에서 위젯을 띄운다.
 * 데스크톱은 가운데 모달, 폰은 화면 전체. 주소에 #도구id 를 남겨 뒤로 가기로 닫힌다.
 * 위젯을 지연 로드하지 않는 이유: 오프라인 캐시가 이 페이지의 정적 파일만 받아 두기 때문이다.
 */
export function ToolsHub({ rates, updated }: { rates: Rates; updated: string }) {
  const [filter, setFilter] = useState<'All' | ToolGroup>('All')
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
  const shown = filter === 'All' ? TOOLS : TOOLS.filter(t => t.group === filter)

  return (
    <div className="tl-wrap th-wrap">
      <style>{`
        .tl-wrap.th-wrap { max-width: 1040px; }
        .th-filters { display: inline-flex; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; background: #fff; margin-bottom: 20px; }
        .th-filters button { min-width: 84px; min-height: 44px; padding: 0 14px; border: 0; background: none; font: 600 14px "DM Sans", Inter, system-ui, sans-serif; color: #6B7280; cursor: pointer; }
        .th-filters button[aria-pressed="true"] { background: #111827; color: #fff; }
        .th-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .th-card { display: flex; flex-direction: column; padding: 16px; background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.05); text-decoration: none; color: inherit; transition: box-shadow .2s, border-color .2s; }
        @media (hover: hover) { .th-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,.08); border-color: #D1D5DB; } }
        .th-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; background: #FBEFEA; color: #C8102E; margin-bottom: 12px; }
        .th-title { font-family: "Playfair Display", Georgia, serif; font-size: 17px; font-weight: 700; line-height: 1.25; color: #111827; margin-bottom: 4px; }
        .th-desc { font-size: 13px; line-height: 1.5; color: #4B5563; }

        .th-overlay { position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; background: rgba(17,24,39,.55); }
        .th-modal { display: flex; flex-direction: column; width: min(980px, calc(100vw - 48px)); height: min(88vh, 920px); background: #FAFAF8; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
        .th-head { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 20px; background: #fff; border-bottom: 1px solid #E5E7EB; }
        .th-head h2 { font-size: 16px; font-weight: 700; color: #111827; margin: 0; min-width: 0; }
        .th-head-actions { display: flex; align-items: center; gap: 8px; flex: none; }
        .th-action { display: flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 12px; border: 1px solid #D1D5DB; border-radius: 10px; background: #fff; color: #374151; text-decoration: none; font: 600 13px "DM Sans", Inter, system-ui, sans-serif; cursor: pointer; }
        .th-body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; padding: 24px; }
        .th-body .kp-calendar { top: 0; }
        .th-filters button:focus-visible, .th-card:focus-visible, .th-action:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }

        @media (min-width: 640px) { .th-grid { gap: 16px; } .th-card { padding: 20px; } }
        @media (min-width: 1024px) { .th-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } .th-title { font-size: 18px; } .th-desc { font-size: 14px; } }
        @media (max-width: 767px) {
          .th-overlay { align-items: stretch; background: #FAFAF8; }
          .th-modal { width: 100%; height: 100dvh; border-radius: 0; box-shadow: none; }
          .th-head { padding: 8px 12px 8px 16px; }
          .th-body { padding: 20px 16px 40px; }
          .th-action.is-open span { display: none; }
        }
      `}</style>

      <p className="tl-eyebrow">Smart Travel Utilities</p>
      <h1 className="tl-h1">Your Pocket Companion for Traveling Korea</h1>
      <p className="tl-lead">Pick a tool and use it right here.</p>

      <div className="th-filters" role="group" aria-label="Filter tools">
        {FILTERS.map(f => <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>)}
      </div>

      <div key={filter} className="th-grid">
        {shown.map(t => {
          const Icon = ICONS[t.id]
          return (
            <a key={t.id} href={toolHref(t.id)} className="th-card" onClick={e => open(e, t.id)}>
              <span className="th-icon" aria-hidden="true"><Icon size={22} strokeWidth={1.75} /></span>
              <span className="th-title">{t.title}</span>
              <span className="th-desc">{t.desc}</span>
            </a>
          )
        })}
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
    </div>
  )
}
