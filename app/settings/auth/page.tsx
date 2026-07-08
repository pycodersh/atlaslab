'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { AuthButtons } from '@/components/auth/AuthButtons'

function AuthContent() {
  const params = useSearchParams()
  const hasError = params.get('error') === 'auth_failed'

  return (
    <div style={{
      maxWidth: 480, margin: '0 auto',
      paddingTop: 14, paddingLeft: 20, paddingRight: 20, paddingBottom: 100,
      boxSizing: 'border-box',
    }}>
      <Link href="/settings" style={{ display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none', marginBottom: 20 }}>
        <ChevronLeft style={{ width: 13, height: 13, color: 'var(--pm)' }} strokeWidth={1.8} />
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.10em', color: 'var(--pm)' }}>Profile</span>
      </Link>

      <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--pt)', margin: '0 0 2px', letterSpacing: '-0.01em' }}>Account</p>
      <p style={{ fontSize: 11, color: 'var(--pm)', margin: '0 0 28px' }}>
        로그인하여 학습 기록을 모든 기기에서 동기화하세요.
      </p>

      {hasError && (
        <div style={{
          background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.20)',
          borderRadius: 12, padding: '10px 14px', marginBottom: 20,
          fontSize: 12.5, color: '#dc2626', lineHeight: 1.5,
        }}>
          로그인에 실패했습니다. 다시 시도해주세요.
        </div>
      )}

      <AuthButtons showTitle={false} onSuccess={() => { window.location.href = '/settings' }} />

      <p style={{ textAlign: 'center', fontSize: 11, color: '#C0C0C8', margin: '40px 0 0', fontWeight: 500 }}>
        v1.0.0
      </p>
    </div>
  )
}

export default function AuthPage() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>
      <TopNav />
      <Suspense>
        <AuthContent />
      </Suspense>
    </div>
  )
}
