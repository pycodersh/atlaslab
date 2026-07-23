'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

const T1 = '#111111'
const T2 = '#666666'
const BORDER = '#E8E4DF'
const ACCENT = '#D4873A'

interface NotifPrefs {
  kpatto_notif_new_episode: boolean
  kpatto_notif_weekly_reminder: boolean
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 28, borderRadius: 14,
        background: value ? ACCENT : '#D1D5DB',
        border: 'none', cursor: 'pointer', padding: 3,
        display: 'flex', alignItems: 'center',
        justifyContent: value ? 'flex-end' : 'flex-start',
        transition: 'background 0.2s',
        flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
      } as React.CSSProperties}
    >
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </button>
  )
}

function NotifRow({ label, description, value, onChange }: {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div style={{
      background: '#FFFFFF', borderRadius: 12,
      border: `1px solid ${BORDER}`,
      padding: '16px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T1, marginBottom: 3 }}>{label}</div>
          <div style={{ fontSize: 12.5, color: T2, lineHeight: 1.55 }}>{description}</div>
        </div>
        <Toggle value={value} onChange={onChange} />
      </div>
    </div>
  )
}

export default function KPattoNotificationsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [prefs, setPrefs] = useState<NotifPrefs>({
    kpatto_notif_new_episode: true,
    kpatto_notif_weekly_reminder: false,
  })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (authLoading || !user) { setLoaded(true); return }
    const supabase = createClient()
    supabase
      .from('user_profiles')
      .select('kpatto_notif_new_episode, kpatto_notif_weekly_reminder')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setPrefs({
            kpatto_notif_new_episode: data.kpatto_notif_new_episode ?? true,
            kpatto_notif_weekly_reminder: data.kpatto_notif_weekly_reminder ?? false,
          })
        }
        setLoaded(true)
      })
  }, [user, authLoading])

  async function handleToggle(key: keyof NotifPrefs, value: boolean) {
    if (!user) return
    setPrefs(p => ({ ...p, [key]: value }))
    const supabase = createClient()
    await supabase
      .from('user_profiles')
      .update({ [key]: value })
      .eq('id', user.id)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9F7F4', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 16px', height: 52,
        background: '#FFFFFF', borderBottom: `1px solid ${BORDER}`,
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: T1, padding: 4 }}
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: T1 }}>Notifications</span>
      </div>

      <div style={{ padding: '24px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!authLoading && !user ? (
          <div style={{
            background: '#FFFFFF', borderRadius: 12, border: `1px solid ${BORDER}`,
            padding: '32px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T1, marginBottom: 6 }}>Sign in required</div>
            <div style={{ fontSize: 13, color: T2, lineHeight: 1.6 }}>Sign in to manage notifications</div>
          </div>
        ) : !loaded ? null : (
          <>
            <NotifRow
              label="New Episode Alerts"
              description="Get notified when new episodes are released"
              value={prefs.kpatto_notif_new_episode}
              onChange={v => handleToggle('kpatto_notif_new_episode', v)}
            />
            <NotifRow
              label="Weekly Study Reminder"
              description="A gentle reminder to keep your Korean practice going"
              value={prefs.kpatto_notif_weekly_reminder}
              onChange={v => handleToggle('kpatto_notif_weekly_reminder', v)}
            />
          </>
        )}
      </div>
    </div>
  )
}
