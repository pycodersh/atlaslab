'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { writeSelectedIngredients } from '@/lib/kpantry/ingredients'
import type { HomeIngredient } from '@/lib/kpantry/home'
import SectionHeader, { SectionLink } from './SectionHeader'

const CSS = `
.kp-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.kp-chip { display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px 5px 5px; border-radius: 999px; background: #FFFFFF;
  border: 1px solid #E7E5E4; cursor: pointer; font-family: Inter, sans-serif; font-size: 13px; font-weight: 500; color: #44403C;
  transition: border-color .15s, color .15s, background-color .15s; }
.kp-chip:hover { border-color: #A8A29E; }
.kp-chip[aria-pressed="true"] { border-color: #C8102E; box-shadow: 0 0 0 1px #C8102E; color: #C8102E; background: #FFFBFB; }
.kp-chip-img { position: relative; width: 26px; height: 26px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: #F5F5F4; }
.kp-chip-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.kp-chip-on { position: absolute; inset: 0; background: rgba(200, 16, 46, .85); display: flex; align-items: center; justify-content: center; }
.kp-find { width: 100%; margin-top: 14px; padding: 14px 16px; border-radius: 14px; border: none; background: #C8102E; color: #FFFFFF;
  font-family: Inter, sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; }
.kp-find:disabled { background: #E7E5E4; color: #A8A29E; cursor: default; }
`

/**
 * 홈 섹션 1 — "Cook with what I have". 냉장고 재료 칩(레시피 등장 수 상위 8)을 골라
 * 바로 갭 분석 결과(/recipes?mode=pantry&ids=…)로 간다. 기본 선택 0개, 0개면 버튼 비활성.
 * 고른 재료는 재료 화면과 같은 localStorage 키에도 남겨 결과 화면의 Edit 이 이어서 보인다.
 */
export default function CookWithIngredientsCard({ chips }: { chips: HomeIngredient[] }) {
  const router = useRouter()
  const [picked, setPicked] = useState<string[]>([])

  const toggle = (id: string) => setPicked(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]))

  const find = () => {
    if (picked.length === 0) return
    writeSelectedIngredients(picked)
    router.push(`/kpantry/en/recipes?mode=pantry&ids=${picked.join(',')}`)
  }

  return (
    <section style={{ padding: '0 16px' }} aria-labelledby="kp-sec-have">
      <style>{CSS}</style>
      <SectionHeader id="kp-sec-have" num={1} title="Cook with what I have" desc="Tap what's in your fridge, then find recipes you can make." />

      <div className="kp-chips" role="group" aria-label="Ingredients you have">
        {chips.map(c => {
          const on = picked.includes(c.id)
          return (
            <button key={c.id} type="button" className="kp-chip" aria-pressed={on} onClick={() => toggle(c.id)}>
              <span className="kp-chip-img">
                {c.image_url && <img src={c.image_url} alt="" loading="lazy" />}
                {on && <span className="kp-chip-on"><Check size={14} strokeWidth={3} color="#FFFFFF" aria-hidden="true" /></span>}
              </span>
              {c.name}
            </button>
          )
        })}
      </div>

      <p aria-live="polite" style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#78716C', margin: '12px 0 0' }}>
        {picked.length} selected
      </p>
      <button type="button" className="kp-find" disabled={picked.length === 0} onClick={find}>
        Find recipes{picked.length > 0 ? ` (${picked.length})` : ''}
      </button>

      <SectionLink href="/kpantry/en/ingredients">See all ingredients</SectionLink>
    </section>
  )
}
