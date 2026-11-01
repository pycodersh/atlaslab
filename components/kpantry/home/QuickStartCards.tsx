import Link from 'next/link'
import { ArrowRight, CookingPot, ShoppingBasket } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Card = {
  href: string
  title: string
  desc: string
  icon: LucideIcon
  /** 1순위 도구는 브랜드 틴트, 두 번째는 흰 카드 — 시각적 위계 */
  primary: boolean
}

const CARDS: Card[] = [
  {
    href: '/kpantry/en/ingredients',
    title: 'What Can I Cook?',
    desc: 'Find recipes with ingredients you have.',
    icon: ShoppingBasket,
    primary: true,
  },
  {
    href: '/kpantry/en/recipes',
    title: 'What to Eat?',
    desc: 'Browse 100+ Korean recipes by dish.',
    icon: CookingPot,
    primary: false,
  },
]

/** 홈 첫 화면의 두 갈래 진입 — 풀 폭 카드 두 장을 위아래로. 카드 전체가 링크다 */
export default function QuickStartCards() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      padding: '12px 16px 8px',
    }}>
      {CARDS.map(({ href, title, desc, icon: Icon, primary }) => (
        <Link
          key={href}
          href={href}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            width: '100%',
            padding: '22px 20px',
            boxSizing: 'border-box',
            backgroundColor: primary ? '#FDF5F6' : '#FFFFFF',
            border: primary ? '1px solid #F3D5D9' : '1px solid rgba(231, 229, 228, 0.8)',
            borderRadius: 20,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            textDecoration: 'none',
          }}
        >
          <span aria-hidden="true" style={{
            width: 56,
            height: 56,
            flexShrink: 0,
            borderRadius: 16,
            backgroundColor: primary ? '#FFFFFF' : 'var(--kp-accent-soft)',
            border: primary ? '1px solid #F3D5D9' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={28} strokeWidth={1.75} color="#C8102E" />
          </span>

          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              display: 'block',
              fontFamily: 'Playfair Display, serif',
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1.2,
              color: primary ? '#C8102E' : '#1A1A1A',
            }}>
              {title}
            </span>
            <span style={{
              display: 'block',
              marginTop: 6,
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              lineHeight: 1.45,
              color: '#555555',
            }}>
              {desc}
            </span>
          </span>

          <span aria-hidden="true" style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: '50%',
            backgroundColor: primary ? 'var(--kp-accent)' : '#FFFFFF',
            border: primary ? 'none' : '1.5px solid var(--kp-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ArrowRight size={20} strokeWidth={2} color={primary ? '#FFFFFF' : '#C8102E'} />
          </span>
        </Link>
      ))}
    </div>
  )
}
