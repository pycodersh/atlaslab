'use client'
import Link from 'next/link'
import { Bookmark } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/kpantry/supabase'

/**
 * K-Pantry 홈 헤더 — 한 줄 미니멀: 세리프 워드마크("K"만 브랜드 레드) + 오른쪽 저장함 버튼.
 * 저장함에는 로그인했고 저장한 레시피가 있을 때만 작은 레드 배지(개수).
 * K-Pantry 의 다른 화면은 이 헤더 대신 PageBanner · HomeLink 를 쓴다 — 홈 전용이다.
 */

const CSS = `
.kph { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 28px 4px 16px; }
.kph-word { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; line-height: 1.1; color: #1C1917; margin: 0; }
.kph-word b { color: #C8102E; font-weight: 700; }
.kph-saved { position: relative; width: 40px; height: 40px; border-radius: 50%; background: #FFFFFF; border: 1px solid rgba(231,229,228,.8);
  box-shadow: 0 1px 2px rgba(0,0,0,.05); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kph-badge { position: absolute; top: -3px; right: -3px; min-width: 17px; height: 17px; padding: 0 4px; box-sizing: border-box; border-radius: 999px; background: #C8102E; color: #FFFFFF; border: 1.5px solid #FFFFFF;
  font-family: Inter, sans-serif; font-size: 10px; font-weight: 700; line-height: 14px; text-align: center; }
`

export default function KPantryHeader() {
  const [saved, setSaved] = useState(0)

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
    <header className="kph">
      <style>{CSS}</style>
      <h1 className="kph-word"><b>K</b>-Pantry</h1>
      <Link href="/kpantry/en/saved" aria-label="Saved recipes" className="kph-saved">
        <Bookmark size={18} strokeWidth={1.75} color="#1C1917" aria-hidden="true" />
        {saved > 0 && <span className="kph-badge" aria-hidden="true">{saved > 99 ? '99+' : saved}</span>}
      </Link>
    </header>
  )
}
