'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Sparkles, BookOpen, Layers, Bookmark } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { useT } from '@/hooks/useT'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
      color: 'var(--pa)', textTransform: 'uppercase',
      margin: '36px 0 0', paddingBottom: 10,
    }}>
      {children}
    </p>
  )
}

export default function SubscriptionPage() {
  const t = useT()
  const [selected, setSelected] = useState('annual')
  const [toast, setToast] = useState(false)

  const FEATURES = [
    { icon: BookOpen,  label: t('feat_all_stories') },
    { icon: Layers,    label: t('feat_all_patterns') },
    { icon: Bookmark,  label: t('feat_bookmarks') },
    { icon: Sparkles,  label: t('feat_updates') },
  ]

  const PLANS = [
    { id: 'monthly', label: t('plan_monthly'), price: '$4.99', period: '/ month', note: null },
    { id: 'annual',  label: t('plan_annual'),  price: '$39.99', period: '/ year', note: t('plan_save') },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>
      <TopNav />

      <div style={{
        maxWidth: 480, margin: '0 auto',
        paddingTop: 'calc(var(--pnav-h) + 28px)',
        paddingLeft: 24, paddingRight: 24, paddingBottom: 100,
        boxSizing: 'border-box',
      }}>

        {/* Back */}
        <Link
          href="/settings"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--pm)', textDecoration: 'none',
            marginBottom: 32, width: 'fit-content',
          }}
        >
          <ChevronLeft style={{ width: 14, height: 14 }} strokeWidth={1.5} />
          <span style={{ fontSize: 10, letterSpacing: '0.18em', fontWeight: 700, textTransform: 'uppercase' }}>
            {t('back')}
          </span>
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <h1 className="font-playfair" style={{
            fontSize: 'clamp(1.7rem, 7vw, 2.2rem)',
            fontWeight: 900, lineHeight: 1, color: 'var(--pt)',
            margin: 0, letterSpacing: '-0.02em',
          }}>
            SUBSCRIPTION
          </h1>
          <p style={{ fontSize: 11, color: 'var(--pm)', marginTop: 8, lineHeight: 1.5 }}>
            {t('sub_subtitle')}
          </p>
        </div>

        {/* ── Current Plan ───────────────────────────────────── */}
        <SectionLabel>{t('sub_current_plan')}</SectionLabel>
        <div style={{ borderTop: '1px solid var(--pd)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '18px 0',
          }}>
            <Sparkles style={{ width: 17, height: 17, color: 'var(--pa)', flexShrink: 0 }} strokeWidth={1.5} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)', margin: '0 0 1px' }}>Free</p>
              <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0 }}>{t('sub_free_desc')}</p>
            </div>
          </div>
        </div>

        {/* ── Premium Features ───────────────────────────────── */}
        <SectionLabel>{t('sub_premium')}</SectionLabel>
        <div style={{ borderTop: '1px solid var(--pd)' }}>
          {FEATURES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}
            >
              <Icon style={{ width: 14, height: 14, color: 'var(--pa)', flexShrink: 0 }} strokeWidth={1.8} />
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--pt2)', margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Choose a Plan ──────────────────────────────────── */}
        <SectionLabel>{t('sub_choose_plan')}</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          {PLANS.map(plan => {
            const isSelected = selected === plan.id
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelected(plan.id)}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  background: 'none',
                  border: isSelected ? '1.5px solid var(--pa)' : '1.5px solid var(--pd)',
                  borderRadius: 14, padding: '14px 18px',
                  transition: 'border-color 0.18s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <div>
                  <p style={{
                    fontSize: 13, fontWeight: 700, margin: '0 0 2px',
                    color: isSelected ? 'var(--pt)' : 'var(--pt2)',
                  }}>
                    {plan.label}
                  </p>
                  {plan.note && (
                    <p style={{ fontSize: 10, color: 'var(--pa)', margin: 0, fontWeight: 500 }}>
                      {plan.note}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p className="font-playfair" style={{
                    fontSize: '1.2rem', fontWeight: 900,
                    color: isSelected ? 'var(--pa)' : 'var(--pt2)',
                    margin: '0 0 1px', lineHeight: 1, letterSpacing: '-0.01em',
                  }}>
                    {plan.price}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--pm)', margin: 0 }}>
                    {plan.period}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* ── CTA ───────────────────────────────────────────── */}
        <div style={{ marginTop: 32 }}>
          <button
            type="button"
            onClick={() => { setToast(true); setTimeout(() => setToast(false), 2800) }}
            style={{
              width: '100%', padding: '13px 0',
              background: 'var(--pa)', color: '#fff',
              border: 'none', borderRadius: 12,
              fontSize: 12, fontWeight: 700,
              letterSpacing: '0.14em', cursor: 'pointer',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            SUBSCRIBE
          </button>
          <p style={{
            textAlign: 'center', fontSize: 10,
            color: 'var(--pm2)', marginTop: 14,
          }}>
            {t('sub_fine_print')}
          </p>
        </div>

      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--pt)', color: 'var(--pb)',
          fontSize: 12, padding: '10px 20px', borderRadius: 999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 50, whiteSpace: 'nowrap', letterSpacing: '0.04em',
        }}>
          {t('sub_toast')}
        </div>
      )}
    </div>
  )
}
