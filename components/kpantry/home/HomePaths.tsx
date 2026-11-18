'use client'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { trackHomePathClick } from '@/lib/kpantry/analytics'
import { PathNumber } from './SectionHeader'

interface Props {
  recipeCount: number | null
  example: { name: string; recipes: number } | null
}

const CSS = `
.kp-paths { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr; gap: 10px; }
@media (min-width: 768px) { .kp-paths { grid-template-columns: repeat(3, 1fr); } }
.kp-path { display: flex; align-items: center; gap: 12px; min-height: 80px; box-sizing: border-box; padding: 14px 14px 14px 16px; height: 100%;
  background: #FFFFFF; border: 1px solid #E7E5E4; border-radius: 16px; text-decoration: none; transition: border-color .15s; }
.kp-path:hover, .kp-path:focus-visible { border-color: #A8A29E; }
.kp-path:active { border-color: #C8102E; }
.kp-path-t { display: block; font-family: Inter, sans-serif; font-size: 15px; font-weight: 700; color: #1C1917; line-height: 1.3; }
.kp-path-d { display: block; font-family: Inter, sans-serif; font-size: 13px; color: #78716C; line-height: 1.4; margin-top: 2px; }
`

/**
 * 히어로 바로 아래 "3가지 길" — 이 카드만 보고도 서비스가 세 가지라는 걸 알게 한다. 세 장은 같은 모양.
 * 숫자(레시피 수 · 예시 재료의 레시피 수)는 서버가 DB 에서 센 값.
 */
export default function HomePaths({ recipeCount, example }: Props) {
  const paths = [
    {
      key: 'have' as const, num: 1 as const, href: '/kpantry/en/ingredients',
      title: 'Cook with what I have', desc: "Pick what's in your fridge — see what you can make.",
    },
    {
      key: 'browse' as const, num: 2 as const, href: '/kpantry/en/recipes',
      title: 'Browse all recipes',
      desc: `${recipeCount ? `${recipeCount} Korean` : 'Korean'} home recipes, from stews to street food.`,
    },
    {
      key: 'by_ingredient' as const, num: 3 as const, href: '/kpantry/en/ingredient-guide',
      title: 'Cook by ingredient',
      desc: example
        ? `Got ${example.name}? See all ${example.recipes} recipes that use it.`
        : 'Got gochujang? See every recipe that uses it.',
    },
  ]

  return (
    <nav aria-label="Three ways to find a recipe">
      <style>{CSS}</style>
      <ul className="kp-paths">
        {paths.map(p => (
          <li key={p.key}>
            <Link href={p.href} className="kp-path" onClick={() => trackHomePathClick({ path: p.key })}>
              <PathNumber num={p.num} size={30} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="kp-path-t">{p.title}</span>
                <span className="kp-path-d">{p.desc}</span>
              </span>
              <ChevronRight size={18} strokeWidth={2} color="#A8A29E" aria-hidden="true" style={{ flexShrink: 0 }} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
