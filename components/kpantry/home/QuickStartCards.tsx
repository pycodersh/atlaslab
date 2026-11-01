import Link from 'next/link'
import { ArrowRight, CookingPot, ShoppingBasket } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const CARDS: { href: string; title: string; desc: string; icon: LucideIcon }[] = [
  {
    href: '/kpantry/en/ingredients',
    title: 'What Can I Cook?',
    desc: 'Find recipes with ingredients you have.',
    icon: ShoppingBasket,
  },
  {
    href: '/kpantry/en/recipes',
    title: 'What to Eat?',
    desc: 'Browse 100+ Korean recipes by dish.',
    icon: CookingPot,
  },
]

/** 홈 첫 화면의 두 갈래 진입 — 재료로 찾기 / 요리로 고르기 */
export default function QuickStartCards() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      padding: '12px 16px 8px',
    }}>
      {CARDS.map(({ href, title, desc, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: '16px 14px 14px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--kp-rule)',
            borderRadius: 18,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            textDecoration: 'none',
            minHeight: 168,
            boxSizing: 'border-box',
          }}
        >
          <span aria-hidden="true" style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: 'var(--kp-accent-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={22} strokeWidth={1.75} color="#C8102E" />
          </span>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 18,
            fontWeight: 700,
            lineHeight: 1.2,
            color: '#1A1A1A',
          }}>
            {title}
          </span>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12.5,
            lineHeight: 1.45,
            color: '#6B6B6B',
            flex: 1,
          }}>
            {desc}
          </span>
          <span aria-hidden="true" style={{
            alignSelf: 'flex-end',
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: 'var(--kp-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ArrowRight size={16} strokeWidth={2} color="#FFFFFF" />
          </span>
        </Link>
      ))}
    </div>
  )
}
