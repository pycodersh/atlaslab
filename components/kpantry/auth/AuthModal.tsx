'use client'
import { useState } from 'react'
import { signIn, signUp } from '@/lib/kpantry/auth'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function AuthModal({ onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError(null)

    const { error: authError } = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password)

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onSuccess()
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    }}
    onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '100%',
        maxWidth: 430,
        backgroundColor: '#FFFFFF',
        borderRadius: '24px 24px 0 0',
        padding: '24px 24px 40px',
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          backgroundColor: '#E8E0D0',
          margin: '0 auto 24px',
        }} />

        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 22, fontWeight: 700,
          color: '#1A1A1A', margin: '0 0 4px',
        }}>
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h2>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13, color: '#9E9E9E', margin: '0 0 24px',
        }}>
          {mode === 'signin'
            ? 'Sign in to access your saved recipes and pantry.'
            : 'Join K-Pantry to save recipes and build your pantry.'}
        </p>

        <div style={{ marginBottom: 12 }}>
          <label style={{
            fontFamily: 'Inter, sans-serif', fontSize: 12,
            fontWeight: 600, color: '#6B6B6B',
            display: 'block', marginBottom: 6,
          }}>
            EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 12,
              border: '1.5px solid #E8E0D0',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14, color: '#1A1A1A',
              outline: 'none',
              boxSizing: 'border-box',
              backgroundColor: '#FAFAF8',
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{
            fontFamily: 'Inter, sans-serif', fontSize: 12,
            fontWeight: 600, color: '#6B6B6B',
            display: 'block', marginBottom: 6,
          }}>
            PASSWORD
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 12,
              border: '1.5px solid #E8E0D0',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14, color: '#1A1A1A',
              outline: 'none',
              boxSizing: 'border-box',
              backgroundColor: '#FAFAF8',
            }}
          />
        </div>

        {error && (
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13,
            color: '#E53E3E', margin: '0 0 16px',
          }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '16px',
            backgroundColor: '#2D5016', color: '#FFFFFF',
            border: 'none', borderRadius: 14,
            fontFamily: 'Inter, sans-serif',
            fontSize: 15, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginBottom: 12,
          }}
        >
          {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>

        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 13,
          color: '#9E9E9E', textAlign: 'center', margin: 0,
        }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            style={{
              color: '#2D5016', fontWeight: 600,
              background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 13,
            }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
