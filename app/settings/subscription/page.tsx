'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Sparkles, BookOpen, Layers, Bookmark, Check } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { useT } from '@/hooks/useT'

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.86)',
  boxShadow: '0 4px 18px rgba(40,50,80,0.07)',
  overflow: 'hidden',
}

function IconCircle({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{
      width: 38, height: 38, borderRadius: 12, flexShrink: 0,
      background: accent ? `${accent}14` : 'rgba(255,255,255,0.72)',
      border: `1px solid ${accent ? `${accent}24` : 'rgba(220,225,235,0.80)'}`,
      boxShadow: '0 1px 4px rgba(40,50,80,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </div>
  )
}

function SecTitle({ label }: { label: string }) {
  return (
    <p style={{
      fontSize: 9.5, fontWeight: 700, letterSpacing: '0.20em',
      color: '#8E8E93', textTransform: 'uppercase',
      margin: '24px 0 8px 2px',
    }}>
      {label}
    </p>
  )
}

export default function SubscriptionPage() {
  const t = useT()
  const [selected, setSelected] = useState('annual')
  const [toast, setToast] = useState(false)

  const FEATURES = [
    { icon: BookOpen,  label: t('feat_all_stories'),  color: '#4A6FA8' },
    { icon: Layers,    label: t('feat_all_patterns'), color: '#3A7A4A' },
    { icon: Bookmark,  label: t('feat_bookmarks'),    color: '#8F234B' },
    { icon: Sparkles,  label: t('feat_updates'),      color: '#7A6A20' },
  ]

  const PLANS = [
    { id: 'monthly', label: t('plan_monthly'), price: '$4.99', period: '/ mo',   badge: null },
    { id: 'annual',  label: t('plan_annual'),  price: '$39.99', period: '/ yr',  badge: 'BEST VALUE' },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>
      <TopNav />

      <div style={{
        maxWidth: 480, margin: '0 auto',
        paddingTop: 14, paddingLeft: 20, paddingRight: 20, paddingBottom: 100,
        boxSizing: 'border-box',
      }}>

        {/* Back */}
        <Link href="/settings" style={{ display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none', marginBottom: 20 }}>
          <ChevronLeft style={{ width: 13, height: 13, color: 'var(--pm)' }} strokeWidth={1.8} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.10em', color: 'var(--pm)' }}>Profile</span>
        </Link>

        {/* Page title */}
        <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--pt)', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
          Subscription
        </p>
        <p style={{ fontSize: 11, color: 'var(--pm)', margin: '0 0 4px' }}>
          {t('sub_subtitle')}
        </p>

        {/* ── CURRENT PLAN ── */}
        <SecTitle label={t('sub_current_plan')} />
        <div style={glassCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
            <IconCircle accent="#6E6E73">
              <Sparkles style={{ width: 17, height: 17, color: '#6E6E73' }} strokeWidth={1.6} />
            </IconCircle>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
                FREE
              </p>
              <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0, lineHeight: 1.4 }}>
                {t('sub_free_desc')}
              </p>
            </div>
          </div>
        </div>

        {/* ── PREMIUM FEATURES ── */}
        <SecTitle label={t('sub_premium')} />
        <div style={glassCard}>
          {FEATURES.map(({ icon: Icon, label, color }, i) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
              borderBottom: i < FEATURES.length - 1 ? '1px solid rgba(230,232,236,0.80)' : 'none',
            }}>
              <IconCircle accent={color}>
                <Icon style={{ width: 16, height: 16, color }} strokeWidth={1.7} />
              </IconCircle>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--pt2)', margin: 0, flex: 1 }}>
                {label}
              </p>
              <Check style={{ width: 13, height: 13, color: '#4A6FA8', flexShrink: 0 }} strokeWidth={2.5} />
            </div>
          ))}
        </div>

        {/* ── CHOOSE A PLAN ── */}
        <SecTitle label={t('sub_choose_plan')} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PLANS.map(plan => {
            const isSel = selected === plan.id
            const isAnnual = plan.id === 'annual'
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelected(plan.id)}
                style={{
                  ...glassCard,
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  border: isSel
                    ? isAnnual
                      ? '2px solid rgba(74,111,168,0.70)'
                      : '2px solid rgba(60,60,80,0.40)'
                    : '1px solid rgba(255,255,255,0.86)',
                  padding: 0,
                  background: isSel
                    ? isAnnual
                      ? 'rgba(74,111,168,0.05)'
                      : 'rgba(255,255,255,0.92)'
                    : 'rgba(255,255,255,0.80)',
                  transition: 'border 0.18s, background 0.18s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <p style={{
                        fontSize: 14, fontWeight: 700, margin: 0,
                        color: isSel ? (isAnnual ? '#4A6FA8' : 'var(--pt)') : 'var(--pt2)',
                        letterSpacing: '-0.01em',
                      }}>
                        {plan.label}
                      </p>
                      {plan.badge && (
                        <span style={{
                          fontSize: 8.5, fontWeight: 800, letterSpacing: '0.12em',
                          color: isSel ? '#4A6FA8' : '#8E8E93',
                          background: isSel ? 'rgba(74,111,168,0.10)' : 'rgba(140,145,165,0.10)',
                          border: `1px solid ${isSel ? 'rgba(74,111,168,0.25)' : 'rgba(140,145,165,0.20)'}`,
                          borderRadius: 5, padding: '2px 6px', textTransform: 'uppercase',
                          transition: 'all 0.18s',
                        }}>
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    {isAnnual && (
                      <p style={{ fontSize: 10, color: isSel ? '#4A6FA8' : 'var(--pm2)', margin: 0, fontWeight: 500 }}>
                        {t('plan_save')}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{
                      fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em',
                      color: isSel ? (isAnnual ? '#4A6FA8' : 'var(--pt)') : 'var(--pt2)',
                      margin: '0 0 1px', lineHeight: 1,
                    }}>
                      {plan.price}
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--pm2)', margin: 0, fontWeight: 400 }}>
                      {plan.period}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* ── CTA ── */}
        <div style={{ marginTop: 20 }}>
          <button
            type="button"
            onClick={() => { setToast(true); setTimeout(() => setToast(false), 2800) }}
            style={{
              width: '100%', padding: '15px 0',
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.86)',
              boxShadow: '0 2px 14px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.95)',
              borderRadius: 16, cursor: 'pointer',
              fontSize: 13, fontWeight: 700, letterSpacing: '0.12em',
              color: '#3A3A3C', fontFamily: 'inherit',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            SUBSCRIBE
          </button>
          <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--pm2)', marginTop: 12 }}>
            {t('sub_fine_print')}
          </p>
        </div>

        {/* Version */}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#C0C0C8', margin: '40px 0 0', fontWeight: 500 }}>
          v1.0.0
        </p>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--pt)', color: 'var(--pb)',
          fontSize: 12, padding: '10px 22px', borderRadius: 999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 50, whiteSpace: 'nowrap', letterSpacing: '0.04em',
        }}>
          {t('sub_toast')}
        </div>
      )}
    </div>
  )
}
