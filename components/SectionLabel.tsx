'use client'

/**
 * SectionLabel — PATTO 공통 섹션 헤더 컴포넌트.
 *
 * 모든 탭(Essays / Progress / Library)에서 동일한 디자인 시스템을 사용한다.
 * - Playfair 1.3rem / weight 900 / Burgundy accent
 * - 한 줄 설명 (i18n 문자열)
 * - 얇은 Divider
 * - 아이콘 없음 — 텍스트 자체가 디자인
 */

export function SectionLabel({
  label,
  sub,
  action,
}: {
  label:   string
  sub?:    string
  action?: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline',
        justifyContent: 'space-between', gap: 12,
      }}>
        <h2
          className="font-playfair"
          style={{
            fontSize: '1.3rem', fontWeight: 900, color: 'var(--pt2)',
            margin: 0, letterSpacing: '-0.02em', lineHeight: 1,
            textShadow: '0 1px 0 rgba(255,255,255,.75), 0 10px 24px rgba(70,80,110,.08)',
          }}
        >
          {label}
        </h2>
        {action}
      </div>

      {sub && (
        <p style={{
          fontSize: 11, color: 'var(--pm)',
          margin: '7px 0 0', lineHeight: 1.4,
        }}>
          {sub}
        </p>
      )}

      <div style={{ height: '0.5px', background: 'var(--pd)', marginTop: 14 }} />
    </div>
  )
}
