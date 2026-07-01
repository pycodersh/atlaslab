import Link from 'next/link'
import { ChevronRight, SlidersHorizontal, Sparkles, Info, UserCircle } from 'lucide-react'
import { TopNav } from '@/components/TopNav'

const HUBS = [
  {
    icon: UserCircle,
    label: 'Account',
    desc: '로그인하여 학습 기록과 저장한 패턴을 동기화합니다.',
    href: '/settings/auth',
  },
  {
    icon: SlidersHorizontal,
    label: 'Preferences',
    desc: '학습 환경과 표시 언어를 설정합니다.',
    href: '/settings/preferences',
  },
  {
    icon: Sparkles,
    label: 'Subscription',
    desc: '프리미엄 플랜 및 결제를 관리합니다.',
    href: '/settings/subscription',
  },
  {
    icon: Info,
    label: 'About PATTO',
    desc: "PATTO의 철학, Editor's Notes, 버전 정보를 확인합니다.",
    href: '/settings/about',
  },
]

export default function SettingsPage() {
  return (
    <div style={{ height: '100dvh', overflowY: 'auto', background: 'var(--pb)' }}>
      <TopNav />

      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        paddingTop: 'calc(var(--pnav-h) + 28px)',
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 60,
        boxSizing: 'border-box',
      }}>

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 40 }}>
          <p className="font-playfair" style={{
            fontSize: 'clamp(2rem, 9vw, 2.8rem)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: 'var(--pt)',
            margin: 0,
          }}>
            Settings
          </p>
          <p className="font-playfair" style={{
            fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',
            fontStyle: 'italic',
            fontWeight: 500,
            color: 'var(--pm)',
            marginTop: 10,
            lineHeight: 1.6,
          }}>
            나에게 맞는 학습 환경을 설정하세요.
          </p>
          <div style={{ height: 1.5, background: 'var(--pa)', width: 32, marginTop: 14, borderRadius: 1, opacity: 0.7 }} />
        </div>

        {/* ── Settings rows — all identical style ──────────────────────── */}
        <div>
          {HUBS.map(({ icon: Icon, label, desc, href }, i) => (
            <div key={href}>
              <div style={{ height: 1, background: 'var(--pd)' }} />
              <Link
                href={href}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 0', textDecoration: 'none' }}
              >
                <Icon
                  style={{ width: 17, height: 17, color: 'var(--pa)', flexShrink: 0 }}
                  strokeWidth={1.5}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)', margin: '0 0 1px', letterSpacing: '0.01em' }}>
                    {label}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0 }}>{desc}</p>
                </div>
                <ChevronRight style={{ width: 14, height: 14, color: 'var(--pm2)', flexShrink: 0 }} strokeWidth={1.4} />
              </Link>
            </div>
          ))}
          <div style={{ height: 1, background: 'var(--pd)' }} />
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div style={{ marginTop: 64, textAlign: 'center' }}>
          <p className="font-playfair" style={{
            fontSize: 15, fontWeight: 900, letterSpacing: '0.06em',
            color: 'var(--pa)', margin: '0 0 5px', opacity: 0.7,
          }}>
            PATTO
          </p>
          <p style={{ fontSize: 8, letterSpacing: '0.22em', color: 'var(--pm2)', margin: 0 }}>
            PATTERNS. STORIES. YOU.
          </p>
        </div>

      </div>
    </div>
  )
}
