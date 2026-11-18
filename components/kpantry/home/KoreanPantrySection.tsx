import Link from 'next/link'
import type { HomeIngredient } from '@/lib/kpantry/home'
import { guideHref } from '@/lib/kpantry/buyInfo'
import SectionHeader, { HOME_SECTION_PAD, SectionLink } from './SectionHeader'

const CSS = `
.kp-tiles { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
@media (min-width: 640px) { .kp-tiles { grid-template-columns: repeat(4, 1fr); } }
.kp-tile { display: flex; flex-direction: column; gap: 10px; padding: 12px; min-height: 104px; box-sizing: border-box; background: #FFFFFF;
  border: 1px solid #E7E5E4; border-radius: 12px; text-decoration: none; transition: border-color .15s; }
.kp-tile:hover, .kp-tile:focus-visible { border-color: #A8A29E; }
.kp-tile:active { border-color: #C8102E; }
.kp-tile-top { display: flex; align-items: center; gap: 8px; min-width: 0; }
.kp-tile-img { width: 32px; height: 32px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: #F5F5F4; }
.kp-tile-name { font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; color: #292524; line-height: 1.25; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.kp-tile-n { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: #1C1917; line-height: 1; margin-top: auto; }
.kp-tile-n small { font-family: Inter, sans-serif; font-size: 12px; font-weight: 500; color: #78716C; margin-left: 4px; }
`

/**
 * 홈 섹션 3 — "Cook by ingredient". 재료 하나 → 그 재료로 만드는 레시피 수.
 * 사각 타일(작은 사진 · 이름 · 큰 레시피 수) — 섹션 1의 둥근 고르기 칩과 모양부터 다르다(칩 = 고르기, 타일 = 이동).
 * 누르면 그 재료의 가이드 페이지 — "Recipes using …" 목록이 있다. 서버 컴포넌트.
 */
export default function KoreanPantrySection({ tiles }: { tiles: HomeIngredient[] }) {
  if (tiles.length === 0) return null
  return (
    <section style={{ padding: HOME_SECTION_PAD }} aria-labelledby="kp-sec-by-h">
      <style>{CSS}</style>
      <SectionHeader id="kp-sec-by-h" eyebrow="By Ingredient" title="Cook by Ingredient" desc="Pick one ingredient, see what it makes." />

      <ul className="kp-tiles" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {tiles.map(t => (
          <li key={t.id}>
            <Link href={guideHref(t.slug!)} className="kp-tile">
              <span className="kp-tile-top">
                {t.image_url ? <img src={t.image_url} alt="" className="kp-tile-img" loading="lazy" /> : <span className="kp-tile-img" />}
                <span className="kp-tile-name">{t.name}</span>
              </span>
              <span className="kp-tile-n">{t.recipes}<small>{t.recipes === 1 ? 'recipe' : 'recipes'}</small></span>
            </Link>
          </li>
        ))}
      </ul>

      <SectionLink href="/kpantry/en/ingredient-guide">Explore ingredient guide</SectionLink>
    </section>
  )
}
