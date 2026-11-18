'use client'
import Link from 'next/link'
import { Bookmark } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/kpantry/supabase'

/**
 * K-Pantry 홈 헤더 — 로고 마크(뚝배기 + 김 한 줄) · 워드마크("K"만 브랜드 레드) · 태그라인 · 저장 레시피 수 배지.
 * 스크롤 0 에선 배경 없이 페이지에 얹히고, 내려가면 크림 배경 + 아래 1px 선으로 상단에 붙는다(태그라인은 사라진다).
 * K-Pantry 의 다른 화면은 이 헤더 대신 PageBanner · HomeLink 를 쓴다(2026-11-18 확인) — 홈 전용이다.
 */

const CSS = `
/* 페이지 맨 위 형제로 둔다 — sticky 는 부모 상자 안에서만 붙어 있으므로 부모가 페이지 전체여야 한다 */
.kph { position: sticky; top: 0; z-index: 40; padding: 14px 0 12px;
  background: transparent; border-bottom: 1px solid transparent; transition: background-color .2s, border-color .2s, padding .2s; }
.kph-in { max-width: 1040px; margin: 0 auto; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.kph[data-scrolled="true"] { background: var(--kp-bg, #FDFBF7); border-bottom-color: var(--kp-rule, #E5E1DC); padding-top: 10px; padding-bottom: 10px; }
.kph-brand { display: flex; align-items: center; gap: 10px; min-width: 0; text-decoration: none; }
.kph-word { display: block; font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; line-height: 1.05; color: #1C1917; margin: 0; letter-spacing: -0.01em; }
.kph-word b { color: #C8102E; font-weight: 700; }
.kph-tag { display: block; font-family: Inter, sans-serif; font-size: 12px; line-height: 1.3; color: #78716C; margin: 3px 0 0; white-space: nowrap; overflow: hidden; max-height: 16px; transition: opacity .2s, max-height .2s, margin .2s; }
.kph[data-scrolled="true"] .kph-tag { opacity: 0; max-height: 0; margin-top: 0; }
/* 375px 에서 태그라인이 넘칠 만큼 좁으면 숨긴다(두 줄로 내려가지 않게 nowrap + 아래 기준) */
@media (max-width: 340px) { .kph-tag { display: none; } }
.kph-saved { position: relative; width: 40px; height: 40px; border-radius: 50%; background: #FFFFFF; border: 1px solid rgba(231,229,228,.8); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kph-badge { position: absolute; top: -3px; right: -3px; min-width: 17px; height: 17px; padding: 0 4px; box-sizing: border-box; border-radius: 999px; background: #C8102E; color: #FFFFFF; border: 1.5px solid #FFFFFF;
  font-family: Inter, sans-serif; font-size: 10px; font-weight: 700; line-height: 14px; text-align: center; }
.kph-mark path { fill: none; stroke: #2A2522; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.kph-mark .kph-soup { fill: #C8102E; fill-opacity: .55; stroke: none; }
.kph-mark .kph-steam { stroke-width: 1.4; stroke-opacity: .7; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; animation: kph-steam 1.6s ease-out .3s forwards; }
@keyframes kph-steam { 0% { stroke-dashoffset: 1; opacity: 0; transform: translateY(3px); } 40% { opacity: 1; } 100% { stroke-dashoffset: 0; opacity: .8; transform: none; } }
@media (prefers-reduced-motion: reduce) { .kph-mark .kph-steam { animation: none; stroke-dashoffset: 0; opacity: .8; } .kph, .kph-tag { transition: none; } }
`

/** 로고 마크 — 히어로와 같은 선 그림의 뚝배기, 위로 김 한 줄(로드 때 한 번만 피어오른다) */
function LogoMark() {
  return (
    <svg className="kph-mark" width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
      <path className="kph-steam" pathLength={1} d="M15 11 C13 9 17 7 15 5 C14 4 15.5 2.6 15 1.6" />
      <path d="M4 15 C4.3 21.5 8.6 26 15 26 C21.4 26 25.7 21.5 26 15" />
      <path d="M4 15 C4 12.6 9 11.2 15 11.2 C21 11.2 26 12.6 26 15 C26 17.4 21 18.8 15 18.8 C9 18.8 4 17.4 4 15 Z" />
      <path className="kph-soup" d="M6.4 15 C6.4 13.4 10.2 12.6 15 12.6 C19.8 12.6 23.6 13.4 23.6 15 C23.6 16.6 19.8 17.4 15 17.4 C10.2 17.4 6.4 16.6 6.4 15 Z" />
      <path d="M11 26 l.4 2 h7.2 l.4 -2" />
    </svg>
  )
}

export default function KPantryHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [saved, setSaved] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 저장한 레시피 수 — 로그인했을 때만(비로그인·0개면 배지 없음). RLS 로 내 행만 센다
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { count } = await supabase.from('pantry_saved_recipes').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
        if (alive) setSaved(count ?? 0)
      } catch { /* 배지 없이 */ }
    })()
    return () => { alive = false }
  }, [])

  return (
    <header className="kph" data-scrolled={scrolled}>
      <style>{CSS}</style>
      <div className="kph-in">
      <Link href="/kpantry/en" className="kph-brand" aria-label="K-Pantry home">
        <LogoMark />
        <span style={{ minWidth: 0 }}>
          <span className="kph-word" role="heading" aria-level={1}><b>K</b>-Pantry</span>
          <span className="kph-tag">Cook Korean with what you have</span>
        </span>
      </Link>
      <Link href="/kpantry/en/saved" aria-label="Saved recipes" className="kph-saved">
        <Bookmark size={18} strokeWidth={1.75} color="#1C1917" aria-hidden="true" />
        {saved > 0 && <span className="kph-badge" aria-hidden="true">{saved > 99 ? '99+' : saved}</span>}
      </Link>
      </div>
    </header>
  )
}
