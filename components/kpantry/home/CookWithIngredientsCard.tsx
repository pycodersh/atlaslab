import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * 배경: 질그릇·고추·마늘·샬롯 식재료 사진(Unsplash License, 무료 상업 이용 가능).
 * 원본 https://unsplash.com/photos/yBeL0XChO8o — 저장소에 넣지 않고 Unsplash CDN 에서 크기를 줄여 받는다.
 */
const BG_IMAGE = 'https://images.unsplash.com/photo-1504632236107-4ae29a44f388?w=900&q=70&auto=format&fit=crop'

/**
 * 홈 섹션 1 — 재료로 레시피 찾기 히어로 배너(카드 전체가 /ingredients 링크).
 * 사진 위 40% 어둡게 + 글자·버튼이 올라가는 안쪽 판에만 유리 효과(blur·반투명 흰색). 다른 화면에는 쓰지 않는다.
 */
export default function CookWithIngredientsCard() {
  return (
    <section style={{ padding: '12px 16px 0' }}>
      <Link
        href="/kpantry/en/ingredients"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          minHeight: 170,
          padding: 20,
          borderRadius: 16,
          overflow: 'hidden',
          textDecoration: 'none',
          backgroundColor: '#3D2B1A',
        }}
      >
        <img
          src={BG_IMAGE}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <span aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />

        <span style={{
          position: 'relative',
          display: 'block',
          padding: 14,
          borderRadius: 14,
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
        }}>
          <span style={{
            display: 'block',
            fontFamily: 'Playfair Display, serif',
            fontSize: 16,
            fontWeight: 700,
            color: '#FFFFFF',
          }}>
            Cook with What You Have
          </span>
          <span style={{
            display: 'block',
            marginTop: 4,
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            color: '#E7E5E4',
          }}>
            Select ingredients to find matching recipes.
          </span>

          {/* 버튼 모양 — 링크 안이라 span. 호버는 레이아웃 테마의 --kp-accent 전환(#A30D25)을 따른다 */}
          <span style={{
            marginTop: 16,
            padding: '12px 14px',
            borderRadius: 12,
            backgroundColor: 'var(--kp-accent)',
            color: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
            transition: 'background-color 0.15s',
          }}>
            Select Ingredients &amp; Find Recipes
            <ArrowRight size={14} strokeWidth={2} aria-hidden="true" style={{ flexShrink: 0 }} />
          </span>
        </span>
      </Link>
    </section>
  )
}
