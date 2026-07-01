import Link from 'next/link'
import { ChevronRight, SlidersHorizontal, Sparkles, Info, UserCircle, BookOpen } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'

const HUBS = [
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
    desc: 'PATTO의 철학과 이야기를 소개합니다.',
    href: '/settings/about',
  },
  {
    icon: BookOpen,
    label: "Editor's Notes",
    desc: 'PATTO의 생각과 철학을 읽어보세요.',
    href: '/editor',
  },
]

export default function SettingsPage() {
  return (
    <div style={{ height: '100dvh', overflowY: 'auto', background: 'var(--pb)' }}>
      <TopNav />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: `${NAV_HEIGHT + 28}px 22px 60px` }}>

        {/* ── Magazine Header ───────────────────────────────────────────── */}
        <div style={{ marginBottom: 36 }}>
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
            앱을 나에게 맞게<br />조정하세요.
          </p>
          <div style={{ height: 1.5, background: 'var(--pa)', width: 32, marginTop: 14, borderRadius: 1, opacity: 0.7 }} />
        </div>

        {/* ── Guest / Login ─────────────────────────────────────────────── */}
        <div style={{
          padding: '20px 0',
          borderTop: '1px solid var(--pd)',
          borderBottom: '1px solid var(--pd)',
          marginBottom: 32,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--pal)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <UserCircle style={{ width: 18, height: 18, color: 'var(--pa)' }} strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--pt)', margin: '0 0 4px' }}>Guest</p>
              <p style={{ fontSize: 12, color: 'var(--pm)', margin: 0, lineHeight: 1.65 }}>
                로그인하면 학습 기록과 저장한 패턴을<br />안전하게 보관할 수 있어요.
              </p>
              <Link
                href="/settings/auth"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  marginTop: 12, fontSize: 12, fontWeight: 600,
                  color: 'var(--pa)', textDecoration: 'none',
                }}
              >
                로그인 / 회원가입
                <ChevronRight style={{ width: 13, height: 13 }} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Settings List ─────────────────────────────────────────────── */}
        <div>
          {HUBS.map(({ icon: Icon, label, desc, href }, i) => (
            <div key={href}>
              {i > 0 && <div style={{ height: 1, background: 'var(--pd)' }} />}
              <Link
                href={href}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 0', textDecoration: 'none' }}
              >
                <Icon
                  style={{ width: 15, height: 15, color: 'var(--pa)', flexShrink: 0 }}
                  strokeWidth={1.6}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)', margin: '0 0 2px', letterSpacing: '0.01em' }}>
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
        <div style={{ marginTop: 56, textAlign: 'center' }}>
          <p className="font-playfair" style={{
            fontSize: 15, fontWeight: 900, letterSpacing: '0.06em',
            color: 'var(--pa)', margin: '0 0 4px', opacity: 0.7,
          }}>
            PATTO
          </p>
          <p style={{ fontSize: 8, letterSpacing: '0.22em', color: 'var(--pm)', margin: '0 0 14px' }}>
            PATTERNS. STORIES. YOU.
          </p>
          <p style={{ fontSize: 10, color: 'var(--pm2)', margin: 0 }}>© 2026 ATLASLAB · v1.0.0</p>
        </div>

      </div>
    </div>
  )
}
