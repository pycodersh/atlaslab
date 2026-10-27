'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { LicenseModal } from './LicenseModal'
import { FREE_EPISODES } from '@/lib/kpatto/config'
import { KP } from '@/lib/kpatto/theme'

const ACCENT = KP.primary
const T1 = '#111111'
const T2 = '#666666'

/**
 * 잠긴 에피소드 안내 — 앱 안에서는 결제하지 않고 웹사이트 판매 랜딩(/kpatto#pricing)으로 보낸다.
 * (월 구독 Paddle 결제는 폐지. 기존 구독자는 구독 페이지의 구독 관리로 계속 관리한다.)
 *
 * 하단 시트(KPattoPaywall)와 구독 페이지의 무료 사용자 화면이 같이 쓴다.
 *
 * 문구 주의: 앱을 여는 상품은 WebApp Pass($19.99)·Complete Bundle($24.99) 뿐이다.
 * eBook 단품($14.99)은 앱을 열지 않으므로 가격 범위를 $19.99 부터 쓰고, 153쪽 PDF 는 번들에만 들어 있다고 쓴다.
 */
export function KPattoUnlockPanel({ onLater, onUnlocked }: { onLater?: () => void; onUnlocked?: () => void }) {
  const [licenseOpen, setLicenseOpen] = useState(false)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: KP.primaryLight, border: `1.5px solid ${KP.primaryBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Lock size={28} color={ACCENT} strokeWidth={2} />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 21, fontWeight: 800, color: T1, margin: '0 0 8px', lineHeight: 1.3 }}>
          Unlock All 100 Episodes &amp; Full Audio
        </h2>
        <p style={{ fontSize: 14.5, color: T2, lineHeight: 1.6, margin: 0 }}>
          Get lifetime access through our official website — 300+ phrases with native audio on every line.
          The Complete Bundle adds the 153-page printable eBook.
        </p>
      </div>

      <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0, display: 'grid', gap: 9 }}>
        {['All 100 episodes and challenges', 'One-time payment — no subscription', `Episodes 1–${FREE_EPISODES} stay free`].map(p => (
          <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: T1 }}>
            <span style={{ color: '#22C55E', fontSize: 16 }} aria-hidden>✓</span>{p}
          </li>
        ))}
      </ul>

      {/* 판매 랜딩은 새 탭 — 앱에서 보던 화면을 잃지 않게 */}
      <a
        href="/kpatto#pricing"
        target="_blank"
        rel="noopener"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', height: 52, borderRadius: 14,
          background: ACCENT, color: '#FFFFFF', textDecoration: 'none',
          fontSize: 15.5, fontWeight: 700, boxSizing: 'border-box', padding: '0 12px', textAlign: 'center',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span>🛒 View Lifetime Plans (<span className="notranslate" translate="no">$19.99 ~ $24.99</span>) →</span>
      </a>

      <button
        type="button"
        onClick={() => setLicenseOpen(true)}
        style={{
          width: '100%', height: 52, marginTop: 10, borderRadius: 14,
          background: '#fff', border: `1px solid ${KP.primaryBorder}`, color: ACCENT,
          fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        🔑 Already Purchased? Enter License Key
      </button>
      {licenseOpen && <LicenseModal onClose={() => setLicenseOpen(false)} onUnlocked={onUnlocked} />}

      {onLater && (
        <button
          type="button"
          onClick={onLater}
          style={{
            width: '100%', height: 48, marginTop: 14,
            background: 'transparent', border: 'none',
            fontSize: 15, fontWeight: 600, color: T2,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Later
        </button>
      )}
    </div>
  )
}
