import Link from 'next/link'
import type { HomeIngredient } from '@/lib/kpantry/home'
import SectionHeader, { SectionButton, sectionStyle } from './SectionHeader'

const CSS = `
.kp-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.kp-chip { display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px 5px 5px; border-radius: 999px; background: #FFFFFF;
  border: 1px solid #E7E5E4; font-family: Inter, sans-serif; font-size: 13px; font-weight: 500; color: #44403C; text-decoration: none;
  transition: border-color .15s; }
.kp-chip:hover, .kp-chip:focus-visible { border-color: #A8A29E; }
.kp-chip-img { width: 26px; height: 26px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: #F5F5F4; }
.kp-chip-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
`

/**
 * 홈 섹션 1 — "Cook with What I Have". 냉장고 재료 미리보기(레시피 등장 수 상위 8) — 홈에서는 고르지 않는다.
 * 칩도, 아래 버튼도 전체 재료 선택 화면(/kpantry/en/ingredients)으로 간다. 서버 컴포넌트.
 */
export default function CookWithIngredientsCard({ chips }: { chips: HomeIngredient[] }) {
  return (
    <section style={sectionStyle(true)} aria-labelledby="kp-sec-have-h">
      <style>{CSS}</style>
      <SectionHeader id="kp-sec-have-h" title="Cook with What I Have" desc="Pick what's in your fridge and see what you can make." />

      <ul className="kp-chips" aria-label="Ingredients you can pick" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {chips.map(c => (
          <li key={c.id}>
            <Link href="/kpantry/en/ingredients" className="kp-chip">
              <span className="kp-chip-img">{c.image_url && <img src={c.image_url} alt="" loading="lazy" />}</span>
              {c.name}
            </Link>
          </li>
        ))}
      </ul>

      <SectionButton href="/kpantry/en/ingredients">Select Your Ingredients</SectionButton>
    </section>
  )
}
