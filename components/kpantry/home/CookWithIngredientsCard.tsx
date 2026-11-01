import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * 홈 섹션 1 — 앱의 핵심 도구(재료로 레시피 찾기)를 여는 히어로 카드.
 * 'What to Eat?' 은 하단 RECIPES 탭과 겹쳐서 뺐다.
 * 카드 안 하단의 풀 폭 버튼이 /ingredients 로 간다(링크 안에 링크를 두지 않으려고 카드 자체는 링크가 아니다).
 * 제목은 바로 위 헤더 태그라인(Cook Korean with What You Have.)과 겹치지 않게 질문형으로 둔다.
 */
export default function CookWithIngredientsCard() {
  return (
    <section style={{ padding: '12px 16px 0' }}>
      <div style={{
        padding: '26px 22px 22px',
        background: 'linear-gradient(to bottom right, #FFF5F6, #FFF0F2)',
        border: '1px solid #F6D0D5',
        borderRadius: 16,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}>
        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 24,
          fontWeight: 700,
          lineHeight: 1.25,
          color: '#1C1917',
          margin: 0,
        }}>
          What can you cook today?
        </h2>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          lineHeight: 1.6,
          color: '#57534E',
          margin: '8px 0 18px',
        }}>
          Select ingredients from your pantry or fridge to discover matching Korean recipes.
        </p>

        <Link
          href="/kpantry/en/ingredients"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '12px 16px',
            borderRadius: 12,
            backgroundColor: 'var(--kp-accent)',
            color: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            fontWeight: 500,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            whiteSpace: 'nowrap',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          Select Ingredients &amp; Find Recipes
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
