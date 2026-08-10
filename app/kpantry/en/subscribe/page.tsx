'use client'
import { useRouter } from 'next/navigation'

export default function SubscribePage() {
  const router = useRouter()

  return (
    <div style={{ backgroundColor: '#F5F0E8', minHeight: '100vh', padding: '60px 20px 40px' }}>
      <button
        onClick={() => router.back()}
        style={{
          background: 'none', border: 'none',
          cursor: 'pointer', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6B6B6B',
        }}
      >
        ← Back
      </button>

      <h1 style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 30, fontWeight: 700,
        color: '#1A1A1A', margin: '0 0 8px',
      }}>
        K-Pantry Pro
      </h1>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 14, color: '#6B6B6B', margin: '0 0 32px',
      }}>
        Cook more Korean food with less effort.
      </p>

      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20, padding: '20px',
        border: '2px solid #C4622D',
        marginBottom: 12,
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: -12, left: 20,
          backgroundColor: '#C4622D', color: '#FFFFFF',
          fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700,
          borderRadius: 20, padding: '3px 12px',
        }}>
          7 DAYS FREE
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
              Monthly
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#9E9E9E', margin: '2px 0 0' }}>
              Cancel anytime
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
              $3.99
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#9E9E9E', margin: 0 }}>
              per month
            </p>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20, padding: '20px',
        border: '1.5px solid #E8E0D0',
        marginBottom: 32,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
              Yearly
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#2D5016', margin: '2px 0 0', fontWeight: 600 }}>
              Save 48% · $2.08/month
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
              $24.99
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#9E9E9E', margin: 0 }}>
              per year
            </p>
          </div>
        </div>
      </div>

      <button style={{
        width: '100%', padding: '18px',
        backgroundColor: '#C4622D', color: '#FFFFFF',
        border: 'none', borderRadius: 14,
        fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600,
        cursor: 'pointer', marginBottom: 12,
      }}>
        Start 7-Day Free Trial
      </button>

      <p style={{
        fontFamily: 'Inter, sans-serif', fontSize: 11,
        color: '#B0A890', textAlign: 'center', margin: '0 0 24px',
        lineHeight: 1.5,
      }}>
        Payment integration coming soon.
        Your subscription will be activated when billing is ready.
      </p>

      <div style={{ backgroundColor: '#F0EAD8', borderRadius: 16, padding: '16px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '0 0 12px' }}>
          Everything in Pro
        </p>
        {[
          '🛒 See +1/+2 ingredient suggestions',
          '🔖 Save unlimited recipes',
          '📋 Shopping list with store finder',
          '🧺 Save your pantry ingredients',
          '⭐ Priority access to new features',
        ].map(item => (
          <p key={item} style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13,
            color: '#3D3320', margin: '0 0 8px',
          }}>
            {item}
          </p>
        ))}
      </div>
    </div>
  )
}
