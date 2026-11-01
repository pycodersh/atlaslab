'use client'
import { Bookmark, Check, ClipboardList, KeyRound, MapPin, ShoppingBasket, ShoppingCart, Sparkles, Star, type LucideIcon } from 'lucide-react'
import { META_ICON, INLINE_ICON } from '@/components/kpantry/ui/icon'
import { useState } from 'react'
import BuyProButton from './BuyProButton'
import LicenseKeyForm from './LicenseKeyForm'
import LegalLinks from '@/components/kpantry/layout/LegalLinks'
import { PRO_BENEFITS } from '@/lib/kpantry/purchase'

interface Props {
  feature: string
  onClose: () => void
  onSignIn: () => void
}

const FEATURE_MESSAGES: Record<string, { title: string; desc: string; icon: LucideIcon }> = {
  pantry_plus1: {
    icon: ShoppingCart,
    title: 'Unlock +1 ingredient suggestions',
    desc: 'See which one ingredient to add to unlock more Korean recipes.',
  },
  pantry_plus2: {
    icon: Sparkles,
    title: 'Unlock +2 ingredient suggestions',
    desc: 'Discover even more recipes by adding just two ingredients.',
  },
  shopping_list: {
    icon: ClipboardList,
    title: 'Unlock Shopping List',
    desc: 'Save missing ingredients and find stores near you.',
  },
  save_pantry: {
    icon: ShoppingBasket,
    title: 'Unlock Pantry Saving',
    desc: "Save your ingredients so you don't have to re-enter them every time.",
  },
  saved_unlimited: {
    icon: Bookmark,
    title: 'Save unlimited recipes',
    desc: 'Free accounts can save up to 3 recipes. Upgrade to save as many as you want.',
  },
  find_stores: {
    icon: MapPin,
    title: 'Find Nearby Stores',
    desc: 'Locate Korean and Asian grocery stores near you.',
  },
}

// onSignIn 은 호출부 호환을 위해 받기만 한다 — Pro 는 로그인 없이 라이선스 키로 열린다
export default function PaywallModal({ feature, onClose }: Props) {
  const [showKeyForm, setShowKeyForm] = useState(false)
  const msg = FEATURE_MESSAGES[feature] ?? {
    icon: Star,
    title: 'Upgrade to K-Pantry Pro',
    desc: 'Unlock all features with K-Pantry Pro.',
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
        maxHeight: '92vh',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          backgroundColor: 'var(--kp-rule)', margin: '0 auto 24px',
        }} />

        <div style={{
          width: 64, height: 64, borderRadius: 20,
          backgroundColor: 'var(--kp-accent-soft)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 32,
          margin: '0 auto 16px',
        }}>
          <msg.icon size={30} strokeWidth={1.75} color="#C8102E" aria-hidden="true" />
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
          backgroundColor: 'var(--kp-bg)',
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
          {PRO_BENEFITS.map(item => (
            <p key={item} style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13, color: '#1A1A1A',
              margin: '0 0 6px',
            }}>
              <Check {...META_ICON} color="#C8102E" />{item}
            </p>
          ))}
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12, color: '#6B6B6B',
            margin: '8px 0 0',
          }}>
            One-time purchase · Lifetime access · No subscription
          </p>
        </div>

        <BuyProButton />

        <div style={{ margin: '16px 0 4px' }}>
          {showKeyForm ? (
            <LicenseKeyForm />
          ) : (
            <button
              type="button"
              onClick={() => setShowKeyForm(true)}
              style={{
                width: '100%', padding: '12px',
                backgroundColor: 'transparent', color: 'var(--kp-accent)',
                border: '1.5px solid var(--kp-accent)', borderRadius: 14,
                fontFamily: 'Inter, sans-serif',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <KeyRound {...INLINE_ICON} />Enter License Key
            </button>
          )}
        </div>

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

        <LegalLinks style={{ marginTop: 4 }} />
      </div>
    </div>
  )
}
