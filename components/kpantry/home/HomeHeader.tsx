'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserRound } from 'lucide-react'
import AuthModal from '@/components/kpantry/auth/AuthModal'
import { createClient } from '@/lib/kpantry/supabase'

interface Props {
  /** 있으면 사진 위 흰 글씨 히어로, 없으면 배경 위 진한 글씨 헤더 */
  heroImg?: string
}

/**
 * 홈 상단 — 타이틀 + 프로필 버튼 하나(기능 없던 알림 종은 뺐다).
 * 프로필: 로그인 안 했으면 AuthModal, 했으면 Pro·라이선스 관리(/subscribe).
 */
export default function HomeHeader({ heroImg }: Props) {
  const router = useRouter()
  const [showAuth, setShowAuth] = useState(false)

  const handleProfile = async () => {
    const { data: { user } } = await createClient().auth.getUser()
    if (user) router.push('/kpantry/en/subscribe')
    else setShowAuth(true)
  }

  const onPhoto = !!heroImg
  const ink = onPhoto ? '#FFFFFF' : '#1A1A1A'

  const title = (
    <div>
      <h1 style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 30,
        fontWeight: 700,
        color: onPhoto ? '#FAFAFA' : '#1A1A1A',
        margin: 0,
        lineHeight: 1.1,
        textShadow: onPhoto ? '0 2px 8px rgba(0,0,0,0.4)' : undefined,
      }}>
        K-Pantry
      </h1>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        color: onPhoto ? 'rgba(255,255,255,0.85)' : '#6B6B6B',
        margin: '4px 0 0',
      }}>
        Cook Korean with What You Have.
      </p>
    </div>
  )

  const profileButton = (
    <button
      type="button"
      onClick={handleProfile}
      aria-label="Account"
      style={{
        width: 40,
        height: 40,
        flexShrink: 0,
        borderRadius: '50%',
        border: onPhoto ? '1px solid rgba(255,255,255,0.5)' : '1px solid var(--kp-rule)',
        backgroundColor: onPhoto ? 'rgba(0,0,0,0.25)' : '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <UserRound size={20} strokeWidth={1.75} color={ink} aria-hidden="true" />
    </button>
  )

  return (
    <>
      {onPhoto ? (
        <div style={{ position: 'relative', height: 180, overflow: 'hidden', backgroundColor: '#111111' }}>
          <img src={heroImg} alt="" style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7,
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.55) 100%)',
          }} />
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            padding: '0 20px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12,
          }}>
            {title}
            {profileButton}
          </div>
        </div>
      ) : (
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          padding: '40px 20px 8px',
        }}>
          {title}
          {profileButton}
        </header>
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => { setShowAuth(false); window.location.reload() }}
        />
      )}
    </>
  )
}
