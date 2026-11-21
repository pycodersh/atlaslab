'use client'

/**
 * 고정 크기 한반도 펜화 지도(확대 · 끌기 없음) — Korea Weather 와 Intercity Transit 이 같이 쓴다.
 *
 * 그림은 Hotspot Finder 와 같은 public/maps/penmap-v2.svg(해안선 · 제주 · 울릉도 등 섬 · 도 경계, Natural Earth · geoBoundaries · OSM).
 * 그림 좌표(1 단위 ≈ 100 m)는 너무 커서, 점 · 글자를 화면 크기로 다루려고 PEN_K 로 나눈 「지도 단위」를 viewBox 로 쓴다.
 *   전국 범위(NATIONAL) 폭이 322 단위 — 동쪽만 12 단위(≈ 0.22°) 더 보여 줘 동해안 도시 글자가 틀 안에 들어온다.
 * 점 · 글자는 children 으로 받아 penXY(lon, lat) 자리에 그린다.
 */
import { useEffect, useState, type ReactNode } from 'react'
import { NATIONAL, project } from '@/lib/maps/penmap'
import { PEN_ART_CSS, loadArt } from './PenMap'

export const PEN_K = NATIONAL.w / 322
export const PEN_VB = { x: NATIONAL.x / PEN_K, y: NATIONAL.y / PEN_K, w: 322 + 12, h: NATIONAL.h / PEN_K }
export const penXY = (lon: number, lat: number): [number, number] => { const [x, y] = project(lat, lon); return [x / PEN_K, y / PEN_K] }

const CSS = `${PEN_ART_CSS}
.kp-svg .pm-lod-c { display: none; }
.kp-svg { display: block; width: 100%; height: auto; }
.kp-credit { margin: 4px 0 0; text-align: right; font-size: 9px; line-height: 1.3; color: #9CA3AF; }
.kp-credit a { color: inherit; }
`

export function KoreaPenSvg({ className = '', ariaLabel, children }: { className?: string; ariaLabel: string; children: ReactNode }) {
  const [art, setArt] = useState<string | null>(null)
  useEffect(() => { let dead = false; loadArt().then(t => { if (!dead) setArt(t) }).catch(() => {}); return () => { dead = true } }, [])
  return (
    <>
      <style>{CSS}</style>
      <svg className={`kp-svg notranslate ${className}`} viewBox={`${PEN_VB.x} ${PEN_VB.y} ${PEN_VB.w} ${PEN_VB.h}`} role="group" aria-label={ariaLabel}>
        {art && <g className="pm-art" transform={`scale(${1 / PEN_K})`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: art }} />}
        {children}
      </svg>
      <p className="kp-credit">Map data: Natural Earth · geoBoundaries · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a></p>
    </>
  )
}
