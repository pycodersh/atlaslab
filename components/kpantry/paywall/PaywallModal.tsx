'use client'
import { useRouter } from 'next/navigation'

interface Props {
  feature: string
  onClose: () => void
  onSignIn: () => void
}

const FEATURE_MESSAGES: Record<string, { title: string; desc: string; icon: string }> = {
  pantry_plus1: {
    icon: '🛒',
    title: 'Unlock +1 ingredient suggestions',
    desc: 'See which one ingredient to add to unlock more Korean recipes.',
  },
  pantry_plus2: {
    icon: '✨',
    title: 'Unlock +2 ingredient suggestions',
    desc: 'Discover even more recipes by adding just two ingredients.',
  },
  shopping_list: {
    icon: '📋',
    title: 'Unlock Shopping List',
    desc: 'Save missing ingredients and find stores near you.',
  },
  save_pantry: {
    icon: '🧺',
    title: 'Unlock Pantry Saving',
    desc: "Save your ingredients so you don't have to re-enter them every time.",
  },
  saved_unlimited: {
    icon: '🔖',
    title: 'Save unlimited recipes',
    desc: 'Free accounts can save up to 3 recipes. Upgrade to save as many as you want.',
  },
  find_stores: {
    icon: '📍',
    title: 'Find Nearby Stores',
    desc: 'Locate Korean and Asian grocery stores near you.',
  },
}

export default function PaywallModal({ feature, onClose, onSignIn }: Props) {
  const router = useRouter()
  const msg = FEATURE_MESSAGES[feature] ?? {
    icon: '⭐',
    title: 'Upgrade to K-Pantry Pro',
    desc: 'Unlock all features with a Pro subscription.',
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
          backgroundColor: '#E8E0D0', margin: '0 auto 24px',
        }} />

        <div style={{
          width: 64, height: 64, borderRadius: 20,
          backgroundColor: '#FDF5EE',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 32,
          margin: '0 auto 16px',
        }}>
          {msg.icon}
        </div>

        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 22, fontWeight: 700,
          color: '#1A1A1A', margin: '0 0 8px',
          textAlign: 'center',
        }}>
          {msg.title}
        </h2>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 14, color: '#6B6B6B',
          margin: '0 0 24px', textAlign: 'center',
          lineHeight: 1.5,
        }}>
          {msg.desc}
        </p>

        <div style={{
          backgroundColor: '#F5F0E8',
          borderRadius: 14, padding: '16px',
          marginBottom: 20,
        }}>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12, fontWeight: 600,
            color: '#6B6B6B', margin: '0 0 12px',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            K-Pantry Pro includes
          </p>
          {[
            '✅ +1/+2 ingredient gap suggestions',
            '✅ Unlimited recipe saves',
            '✅ Shopping list with store finder',
            '✅ Pantry ingredient saving',
            '✅ All future Pro features',
          ].map(item => (
            <p key={item} style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13, color: '#1A1A1A',
              margin: '0 0 6px',
            }}>
              {item}
            </p>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 32, fontWeight: 700, color: '#1A1A1A',
          }}>
            $3.99
          </span>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14, color: '#9E9E9E',
          }}>
            {' '}/month
          </span>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12, color: '#9E9E9E', margin: '4px 0 0',
          }}>
            or $24.99/year · Cancel anytime
          </p>
        </div>

        <button
          onClick={() => router.push('/kpantry/en/subscribe')}
          style={{
            width: '100%', padding: '16px',
            backgroundColor: '#C4622D', color: '#FFFFFF',
            border: 'none', borderRadius: 14,
            fontFamily: 'Inter, sans-serif',
            fontSize: 15, fontWeight: 600,
            cursor: 'pointer', marginBottom: 10,
          }}
        >
          Start Free Trial · 7 days free
        </button>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '14px',
            backgroundColor: 'transparent', color: '#9E9E9E',
            border: 'none', borderRadius: 14,
            fontFamily: 'Inter, sans-serif',
            fontSize: 14, cursor: 'pointer',
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
