'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePreferences } from '@/contexts/PreferencesContext'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { ALL_STORIES } from '@/data/kpatto/sample-episode'
import { getUI } from '@/lib/kpatto/ui-strings'
import { getStreak, getPracticedTodayCount, getAllRecords } from '@/lib/srs/storage'

const T1 = '#111111'
const T2 = '#999999'
const DIV = '#F2F2F2'

function getDateLabel() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function KPattoHomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { prefs } = usePreferences()
  const ui = getUI(prefs.language)

  const [streak, setStreak]     = useState(0)
  const [patternsDone, setPatternsDone] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setStreak(getStreak())
    getPracticedTodayCount()
    const records = getAllRecords()
    setPatternsDone(new Set(records.filter(r => r.repeatCount > 0).map(r => r.itemId)).size)
  }, [])

  const featured = ALL_STORIES[0]

  const stats = [
    { label: ui.home_stat_episodes, value: `0 / ${ALL_STORIES.length}` },
    { label: ui.home_stat_patterns, value: String(patternsDone) },
    { label: ui.home_stat_streak,   value: String(streak) },
  ]

  const links = [
    { href: '/kpatto/pre-course',         label: ui.home_link_precourse, emoji: '🔤' },
    { href: '/kpatto/story',              label: ui.home_link_stories,   emoji: '📚' },
    { href: '/kpatto/library/patterns',   label: ui.home_link_patterns,  emoji: '✏️' },
    { href: '/kpatto/library/vocabulary', label: ui.home_link_vocab,     emoji: '📖' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>

      {/* Top bar */}
      <div style={{ padding: '52px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.10em', color: T2, fontWeight: 600, textTransform: 'uppercase' }}>K-PATTO</div>
          <div style={{ fontSize: 11, color: T2, marginTop: 2 }}>{getDateLabel()}</div>
        </div>
        <Link
          href="/kpatto/profile"
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: T1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFFFFF', fontSize: 14, textDecoration: 'none', fontWeight: 700,
          }}
        >
          {user ? (user.email?.[0].toUpperCase() ?? '?') : '?'}
        </Link>
      </div>

      <div style={{ height: 1, background: DIV }} />

      {/* Featured episode */}
      <div
        role="button" tabIndex={0}
        onClick={() => router.push(`/kpatto/story/${featured.id}`)}
        onKeyDown={e => e.key === 'Enter' && router.push(`/kpatto/story/${featured.id}`)}
        style={{ padding: '24px 20px', cursor: 'pointer' }}
      >
        <div style={{ fontSize: 10, letterSpacing: '0.10em', color: T2, fontWeight: 600, textTransform: 'uppercase', marginBottom: 10 }}>
          {ui.home_today} · EP {String(featured.episode).padStart(2, '0')}
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: T1, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 8 }}>
          {featured.title}
        </div>
        <div style={{ fontSize: 12, color: T2, marginBottom: 20 }}>
          {ui.st_meta(featured.tags.length, featured.vocabulary_ids.length, featured.panels.length)}
        </div>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); router.push(`/kpatto/story/${featured.id}`) }}
          style={{
            background: T1, color: '#FFFFFF',
            border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 700,
            padding: '13px 28px', cursor: 'pointer',
          }}
        >
          {ui.home_start}
        </button>
      </div>

      <div style={{ height: 1, background: DIV }} />

      {/* Stats strip */}
      <div style={{ display: 'flex' }}>
        {stats.map(({ label, value }, i) => (
          <div key={label} style={{
            flex: 1, textAlign: 'center', padding: '20px 0',
            borderRight: i < stats.length - 1 ? `1px solid ${DIV}` : 'none',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: T1, letterSpacing: '-0.03em' }}>{value}</div>
            <div style={{ fontSize: 10, color: T2, marginTop: 4, letterSpacing: '0.04em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: DIV }} />

      {/* Quick access */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.10em', color: T2, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
          {ui.home_quick_access}
        </div>
      </div>
      <div>
        {links.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 20px',
              borderBottom: i < links.length - 1 ? `1px solid ${DIV}` : 'none',
              textDecoration: 'none', color: T1,
              fontWeight: 500, fontSize: 14,
            }}
          >
            <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{link.emoji}</span>
            {link.label}
            <svg style={{ marginLeft: 'auto', color: DIV }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#BBBBBB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
        ))}
      </div>

    </div>
  )
}
