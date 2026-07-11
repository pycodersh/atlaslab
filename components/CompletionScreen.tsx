'use client'

import { useRouter } from 'next/navigation'
import { useT } from '@/hooks/useT'

// Shared Full-screen State button tokens
const PRIMARY_BTN: React.CSSProperties = {
  width: '100%', height: 56, borderRadius: 18,
  border: 'none',
  background: '#2C2C32',
  fontSize: 15, fontWeight: 700,
  color: '#FFFFFF',
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
  const t = useT()

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
        background: 'rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, marginBottom: 20,
      }}>
        🎉
      </div>

      {/* Eyebrow */}
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pm)', margin: '0 0 8px' }}>
        Level Complete
      </p>

      {/* Title */}
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--pt)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
        {t('completion_title')}
      </h1>

      {/* Description */}
      <p style={{ fontSize: 13.5, color: 'var(--pm)', margin: '0 0 36px', lineHeight: 1.7, maxWidth: 280 }}>
        {t('completion_desc1')}
        <br />
        {t('completion_desc2')}
      </p>

      {/* Buttons */}
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button type="button" onClick={() => router.push('/patto/learn/1')} style={PRIMARY_BTN}>
          {t('completion_restart')}
        </button>
        <button type="button" onClick={() => router.push('/patto/records')} style={SECONDARY_BTN}>
          {t('completion_records')}
        </button>
      </div>
    </div>
  )
}
