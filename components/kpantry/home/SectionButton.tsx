import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/** 테라코타 — 홈 버튼 화살표 포인트(브랜드 레드보다 따뜻하고 음식 사진과 덜 부딪힌다) */
const TERRACOTTA = '#C85A32'

/*
 * 웜 크림 글래스 버튼 — 주황빛 크림 → 흰색 → 앰버 크림 가로 그라데이션 + 옅은 주황 테두리.
 * 호버·누름은 인라인으로 못 써서 클래스에 둔다. 누름 축소는 움직임 줄이기 설정이면 끈다.
 */
const BUTTON_CSS = `
.kp-section-btn {
  background: linear-gradient(to right, rgba(255, 247, 237, 0.7), rgba(255, 255, 255, 0.8), rgba(255, 251, 235, 0.7));
  border: 1px solid rgba(254, 215, 170, 0.5);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
}
.kp-section-btn:hover, .kp-section-btn:focus-visible { background: rgba(255, 247, 237, 0.9); border-color: rgba(254, 215, 170, 0.8); }
.kp-section-btn:active { transform: scale(0.99); }
@media (prefers-reduced-motion: reduce) { .kp-section-btn { transition: none; } .kp-section-btn:active { transform: none; } }
`

interface Props {
  href: string
  children: React.ReactNode
  /** true 면 화살표를 테라코타 원형 배지에 넣는다 — 홈의 주 행동(재료로 찾기) 하나에만 */
  badge?: boolean
}

/** 홈 세 섹션 맨 아래 공통 버튼 — 전폭, 12px 상하 여백, 14px 글씨, 둥근 모서리 16px */
export default function SectionButton({ href, children, badge = false }: Props) {
  return (
    <>
      <style>{BUTTON_CSS}</style>
      <Link href={href} className="kp-section-btn" style={{
        marginTop: 16,
        padding: badge ? '11px 16px' : '12px 16px',
        borderRadius: 16,
        color: '#292524',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        whiteSpace: 'nowrap',
        textDecoration: 'none',
      }}>
        {children}
        {badge ? (
          // 배지 24px 때문에 위아래 여백을 1px 씩 줄여 세 버튼 높이(48px)를 맞춘다
          <span aria-hidden="true" style={{
            width: 24,
            height: 24,
            flexShrink: 0,
            borderRadius: '50%',
            backgroundColor: TERRACOTTA,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ArrowRight size={13} strokeWidth={2.5} color="#FFFFFF" />
          </span>
        ) : (
          <ArrowRight size={16} strokeWidth={2} color={TERRACOTTA} aria-hidden="true" style={{ flexShrink: 0, opacity: 0.75 }} />
        )}
      </Link>
    </>
  )
}
