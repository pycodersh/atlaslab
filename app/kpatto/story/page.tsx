'use client'

import Link from 'next/link'
import { usePreferences } from '@/contexts/PreferencesContext'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { ALL_STORIES } from '@/data/kpatto/sample-episode'
import { getUI } from '@/lib/kpatto/ui-strings'

const T1  = '#111111'
const T2  = '#999999'
const DIV = '#F2F2F2'

const LEVEL_LABEL: Record<string, string> = {
  beginner:     'BEG',
  intermediate: 'INT',
  advanced:     'ADV',
}

export default function KPattoStoryListPage() {
  const { prefs } = usePreferences()
  const ui = getUI(prefs.language)

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>

      {/* Header */}
      <div style={{ padding: '52px 20px 20px' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.10em', color: T2, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
          K-PATTO
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: T1, letterSpacing: '-0.03em' }}>
          Story
        </div>
      </div>

      <div style={{ height: 1, background: DIV }} />

      {/* Story list */}
      {ALL_STORIES.map((story, i) => (
        <Link
          key={story.id}
          href={`/kpatto/story/${story.id}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '18px 20px',
            borderBottom: i < ALL_STORIES.length - 1 ? `1px solid ${DIV}` : 'none',
            textDecoration: 'none', color: T1,
          }}
        >
          {/* Episode number */}
          <div style={{
            width: 44, height: 44, borderRadius: 10, flexShrink: 0,
            background: '#F7F7F7',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.06em', color: T2 }}>EP</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: T1, lineHeight: 1.1 }}>
              {String(story.episode).padStart(2, '0')}
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {story.title}
            </div>
            <div style={{ fontSize: 12, color: T2 }}>
              {ui.st_meta(story.tags.length, story.vocabulary_ids.length, story.panels.length)}
            </div>
          </div>

          {/* Level badge */}
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
            color: T2, border: `1px solid ${DIV}`,
            padding: '3px 7px', borderRadius: 4, flexShrink: 0,
          }}>
            {LEVEL_LABEL[story.level] ?? story.level.toUpperCase()}
          </span>
        </Link>
      ))}

    </div>
  )
}
