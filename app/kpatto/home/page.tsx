'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { ALL_STORIES } from '@/data/kpatto/sample-episode'
import { usePreferences } from '@/contexts/PreferencesContext'
import { getUI } from '@/lib/kpatto/ui-strings'

export default function KPattoHomePage() {
  const { user } = useAuth()
  const { prefs } = usePreferences()
  const ui = getUI(prefs.language)
  const totalStories = ALL_STORIES.length

  const quickLinks = [
    { href: '/kpatto/pre-course', label: ui.home_link_precourse, emoji: '🔤' },
    { href: '/kpatto/story', label: ui.home_link_stories, emoji: '📚' },
    { href: '/kpatto/library/patterns', label: ui.home_link_patterns, emoji: '✏️' },
    { href: '/kpatto/library/vocabulary', label: ui.home_link_vocab, emoji: '📖' },
  ]

  const stats = [
    { label: ui.home_stat_episodes, value: '0', unit: `/ ${totalStories}` },
    { label: ui.home_stat_patterns, value: '0', unit: '' },
    { label: ui.home_stat_streak, value: '0', unit: '' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24,
      paddingTop: 'env(safe-area-inset-top, 0px)',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--pm)' }}>
            K-PATTO
          </div>
          <h1 style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 800, color: 'var(--pt)' }}>
            {ui.home_today}
          </h1>
        </div>
        <Link
          href="/kpatto/profile"
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'var(--pk, #FF6B8C)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 16,
            textDecoration: 'none',
          }}
        >
          {user ? (user.email?.[0].toUpperCase() ?? '👤') : '👤'}
        </Link>
      </div>

      {/* Today's story card */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FF6B8C 0%, #FF8C6B 100%)',
          borderRadius: 20,
          padding: '24px 20px',
          color: '#fff',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', opacity: 0.8 }}>
            {ui.home_today}
          </div>
          <h2 style={{ margin: '6px 0 4px', fontSize: 20, fontWeight: 800 }}>
            Episode 1 — 카페에서
          </h2>
          <p style={{ margin: '0 0 16px', fontSize: 13, opacity: 0.85 }}>
            2 patterns · 3 words · 4 panels
          </p>
          <Link
            href="/kpatto/story/kp-ep-001"
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.22)',
              backdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(255,255,255,0.4)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              padding: '10px 20px',
              borderRadius: 99,
              textDecoration: 'none',
            }}
          >
            {ui.home_start}
          </Link>
        </div>
      </div>

      {/* Progress summary */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--pm)', marginBottom: 10 }}>
          {ui.home_progress}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'var(--pb)',
                border: '1px solid var(--border, rgba(0,0,0,0.08))',
                borderRadius: 14,
                padding: '14px 12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--pt)' }}>
                {stat.value}
                {stat.unit && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--pm)' }}>{stat.unit}</span>
                )}
              </div>
              <div style={{ fontSize: 10, color: 'var(--pm)', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--pm)', marginBottom: 10 }}>
          {ui.home_quick_access}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'var(--pb)',
                border: '1px solid var(--border, rgba(0,0,0,0.08))',
                borderRadius: 14,
                padding: '14px 16px',
                textDecoration: 'none',
                color: 'var(--pt)',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <span style={{ fontSize: 20 }}>{link.emoji}</span>
              {link.label}
              <span style={{ marginLeft: 'auto', color: 'var(--pm)', fontSize: 16 }}>›</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
