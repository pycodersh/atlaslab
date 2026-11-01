'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BuyProButton from '@/components/kpantry/paywall/BuyProButton'
import LicenseKeyForm from '@/components/kpantry/paywall/LicenseKeyForm'
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
        fontSize: 14, color: '#6B6B6B', margin: '0 0 24px',
      }}>
        Cook more Korean food with less effort.
      </p>

      {active ? (
        <div style={{
          backgroundColor: '#EDF4E8',
          border: '1.5px solid #2D5016',
          borderRadius: 20, padding: '20px',
          marginBottom: 24,
        }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: '#2D5016', margin: 0 }}>
            ✓ Pro is active on this browser
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#3D3320', margin: '6px 0 12px', lineHeight: 1.5 }}>
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
        </div>
      ) : (
        <>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20, padding: '20px',
            border: '2px solid #C4622D',
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
              Checkout opens on Gumroad. Your license key arrives on the receipt.
            </p>
          )}

          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20, padding: '20px',
            border: '1.5px solid #E8E0D0',
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

      <div style={{ backgroundColor: '#F0EAD8', borderRadius: 16, padding: '16px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '0 0 12px' }}>
          Everything in Pro
        </p>
        {PRO_BENEFITS.map(item => (
          <p key={item} style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13,
            color: '#3D3320', margin: '0 0 8px',
          }}>
            ✅ {item}
          </p>
        ))}
      </div>
    </div>
  )
}
