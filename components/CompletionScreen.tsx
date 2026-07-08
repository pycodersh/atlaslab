'use client'

import { useRouter } from 'next/navigation'

// Shared Full-screen State button tokens
const PRIMARY_BTN: React.CSSProperties = {
  width: '100%', height: 56, borderRadius: 18,
  border: '1px solid rgba(109,141,255,0.30)',
  background: 'rgba(109,141,255,0.06)',
  fontSize: 15, fontWeight: 700,
  color: 'var(--pa)',
  boxShadow: '0 2px 12px rgba(109,141,255,0.12)',
  cursor: 'pointer', fontFamily: 'inherit',
}

const SECONDARY_BTN: React.CSSProperties = {
  width: '100%', height: 48,
  border: 'none', background: 'transparent',
  fontSize: 13.5, fontWeight: 500,
  color: 'var(--pm)',
  cursor: 'pointer', fontFamily: 'inherit',
}

export function CompletionScreen() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: 'calc(100dvh - 8.5rem)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 32px', textAlign: 'center',
    }}>
      {/* Icon */}
      <div style={{
        width: 72, height: 72, borderRadius: 22,
        background: 'rgba(109,141,255,0.08)',
        border: '1px solid rgba(109,141,255,0.16)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, marginBottom: 20,
      }}>
        🎉
      </div>

      {/* Eyebrow */}
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pa)', margin: '0 0 8px' }}>
        Level Complete
      </p>

      {/* Title */}
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--pt)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
        모든 스토리 완료!
      </h1>

      {/* Description */}
      <p style={{ fontSize: 13.5, color: 'var(--pm)', margin: '0 0 36px', lineHeight: 1.7, maxWidth: 280 }}>
        Level 1의 모든 패턴을 학습했습니다.
        <br />
        복습을 통해 패턴을 확실히 익혀보세요.
      </p>

      {/* Buttons */}
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button type="button" onClick={() => router.push('/learn/1')} style={PRIMARY_BTN}>
          처음부터 다시 학습
        </button>
        <button type="button" onClick={() => router.push('/records')} style={SECONDARY_BTN}>
          학습 기록 보기
        </button>
      </div>
    </div>
  )
}
