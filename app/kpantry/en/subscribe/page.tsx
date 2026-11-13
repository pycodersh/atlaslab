'use client'
import { ArrowLeft, Check, CircleCheck } from 'lucide-react'
import { META_ICON, INLINE_ICON } from '@/components/kpantry/ui/icon'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BuyProButton from '@/components/kpantry/paywall/BuyProButton'
import LicenseKeyForm from '@/components/kpantry/paywall/LicenseKeyForm'
import { InstallAppButton } from '@/components/kpantry/InstallAppButton'
import { deactivateLicense, hasLicensePass } from '@/lib/kpantry/license'
import { KPANTRY_CHECKOUT_URL, KPANTRY_PRICE, PRO_BENEFITS } from '@/lib/kpantry/purchase'

export default function SubscribePage() {
  const router = useRouter()
  // null = 확인 중
  const [active, setActive] = useState<boolean | null>(null)

  useEffect(() => {
    hasLicensePass().then(setActive)
  }, [])

  const handleDeactivate = async () => {
    await deactivateLicense()
    setActive(false)
  }

  return (
    <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', padding: '60px 20px 40px' }}>
      <button
        onClick={() => router.back()}
        style={{
          background: 'none', border: 'none',
          cursor: 'pointer', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6B6B6B',
        }}
      >
        <ArrowLeft {...META_ICON} />Back
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
        fontSize: 14, color: '#6B6B6B', margin: '0 0 24px',
      }}>
        Cook more Korean food with less effort.
      </p>

      {active ? (
        <div style={{
          backgroundColor: 'var(--kp-accent-soft)',
          border: '1.5px solid var(--kp-accent)',
          borderRadius: 20, padding: '20px',
          marginBottom: 24,
        }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--kp-accent)', margin: 0 }}>
            <CircleCheck {...INLINE_ICON} />Pro is active on this browser
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#333333', margin: '6px 0 12px', lineHeight: 1.5 }}>
            Moving to another device? Deactivate here, then enter the same key there.
          </p>
          <button
            type="button"
            onClick={handleDeactivate}
            style={{
              background: 'none', border: 'none', padding: 0,
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
              color: '#6B6B6B', textDecoration: 'underline', cursor: 'pointer',
            }}
          >
            Deactivate on this browser
          </button>
          {/* 잠금이 풀린 직후가 설치를 권하기 가장 좋은 때(K-PATTO /kpatto/redeem 과 같다) — 이미 설치된 창이면 보이지 않는다 */}
          <InstallAppButton
            before={<p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#333333', margin: '16px 0 10px', lineHeight: 1.5 }}>Keep K-Pantry one tap away — install it on this device.</p>}
            style={{ fontFamily: 'Inter, sans-serif', borderRadius: 14 }}
          />
        </div>
      ) : (
        <>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20, padding: '20px',
            border: '2px solid var(--kp-accent)',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                  Lifetime Pass
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B6B6B', margin: '2px 0 0' }}>
                  One-time purchase · No subscription
                </p>
              </div>
              {KPANTRY_PRICE && (
                <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                  {KPANTRY_PRICE}
                </p>
              )}
            </div>
          </div>

          <BuyProButton />
          {KPANTRY_CHECKOUT_URL && (
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 12,
              color: '#6B6B6B', textAlign: 'center', margin: '8px 0 0', lineHeight: 1.5,
            }}>
              Checkout opens on Gumroad. Then enter your order number or purchase email below.
            </p>
          )}

          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20, padding: '20px',
            border: '1.5px solid var(--kp-rule)',
            margin: '20px 0 24px',
          }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>
              Already bought it?
            </p>
            {active === null ? (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B6B6B', margin: 0 }}>Checking…</p>
            ) : (
              <LicenseKeyForm onUnlocked={() => setActive(true)} />
            )}
          </div>
        </>
      )}

      <div style={{ backgroundColor: 'var(--kp-surface-muted)', borderRadius: 16, padding: '16px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '0 0 12px' }}>
          Everything in Pro
        </p>
        {PRO_BENEFITS.map(item => (
          <p key={item} style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13,
            color: '#333333', margin: '0 0 8px',
          }}>
            <Check {...META_ICON} color="#C8102E" />{item}
          </p>
        ))}
      </div>
    </div>
  )
}
