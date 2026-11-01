import Link from 'next/link'
import { ArrowRight, ShoppingBasket } from 'lucide-react'

/**
 * 홈 섹션 1 — 재료로 레시피 찾기 단일 카드(카드 전체가 링크).
 * 'What to Eat?' 은 하단 RECIPES 탭과 겹쳐서 뺐다.
 * 제목 줄은 SectionHeader 와 같은 모양(빨간 17px 아이콘 + 17px 굵은 제목 + 13px 회색 설명)이라
 * 세 섹션 머리가 한 톤으로 읽힌다.
 */
export default function CookWithIngredientsCard() {
  return (
    <section style={{ padding: '12px 16px 0' }}>
      <Link
        href="/kpantry/en/ingredients"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '18px 16px',
          backgroundColor: '#FDF5F6',
          border: '1px solid #F3D5D9',
          borderRadius: 20,
          textDecoration: 'none',
        }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'Inter, sans-serif',
            fontSize: 17,
            fontWeight: 700,
            color: '#1A1A1A',
          }}>
            <ShoppingBasket size={17} strokeWidth={2} color="#C8102E" aria-hidden="true" />
            Cook with What You Have
          </span>
          <span style={{
            display: 'block',
            marginTop: 3,
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            lineHeight: 1.45,
            color: '#6B6B6B',
          }}>
            Select ingredients in your fridge to find matching recipes.
          </span>
        </span>

        <span aria-hidden="true" style={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: '50%',
          backgroundColor: 'var(--kp-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <ArrowRight size={18} strokeWidth={2} color="#FFFFFF" />
        </span>
      </Link>
    </section>
  )
}
