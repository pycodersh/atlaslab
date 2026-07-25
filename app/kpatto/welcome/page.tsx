'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const DARK = '#0d0d1a'

export default function KPattoWelcomePage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/kpatto/onboarding')
        return
      }

      const hasVisited = localStorage.getItem('kpatto_visited')
      if (!hasVisited) {
        localStorage.setItem('kpatto_visited', 'true')
        router.push('/kpatto/onboarding')
      } else {
        router.push('/kpatto/home')
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .su-1 {
          animation: slideUp 0.6s ease-out 0.3s forwards;
          opacity: 0;
        }
        .su-2 {
          animation: slideUp 0.6s ease-out 0.5s forwards;
          opacity: 0;
        }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, background: DARK,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0,
      }}>
        {/* K-PATTO */}
        <div style={{
          fontSize: 56, fontWeight: 900, letterSpacing: 8,
          lineHeight: 1,
        }}>
          <span style={{ color: '#D4873A' }}>K</span>
          <span style={{ color: '#ffffff' }}>-PATTO</span>
        </div>

        {/* 구분선 */}
        <div style={{
          width: 40, height: 1,
          background: '#333',
          margin: '20px auto',
        }} />

        {/* Repeat patterns */}
        <p className="su-1" style={{
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          fontSize: 18,
          color: '#aaa',
          margin: 0,
        }}>
          Repeat patterns through stories.
        </p>

        {/* BUILD FLUENCY */}
        <p className="su-2" style={{
          fontFamily: 'sans-serif',
          fontSize: 12,
          fontWeight: 400,
          letterSpacing: 6,
          color: '#555',
          margin: 0,
          marginTop: 8,
        }}>
          BUILD FLUENCY
        </p>
      </div>
    </>
  )
}
