'use client'

import { useRouter } from 'next/navigation'
import { useT } from '@/hooks/useT'
import { Btn } from '@/components/ui/Btn'

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
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Btn variant="primary" size="md" onClick={() => router.push('/patto/learn/1')}>Restart</Btn>
        <Btn variant="secondary" size="md" onClick={() => router.push('/patto/records')}>Records</Btn>
      </div>
    </div>
  )
}
