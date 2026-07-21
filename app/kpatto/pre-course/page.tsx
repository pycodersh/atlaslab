'use client'

import Link from 'next/link'
import { LESSONS } from '@/data/kpatto/precourse/lessons'
import { useKPrecourseProgress } from '@/hooks/useKPrecourseProgress'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { usePreferences } from '@/contexts/PreferencesContext'
import { getUI } from '@/lib/kpatto/ui-strings'

export default function PreCoursePage() {
  const { isLessonComplete, isLessonUnlocked, storyUnlocked } = useKPrecourseProgress()
  const { prefs } = usePreferences()
  const ui = getUI(prefs.language)

  const required = LESSONS.filter(l => l.required)
  const optional = LESSONS.filter(l => !l.required)
  const requiredDone = required.filter(l => isLessonComplete(l.id)).length

  return (
    <div style={{ minHeight: '100vh', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/kpatto/home" style={{ color: 'var(--pt)', textDecoration: 'none', fontSize: 20 }}>‹</Link>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--pm)' }}>K-PATTO</div>
          <h1 style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 800, color: 'var(--pt)' }}>{ui.pc_title}</h1>
        </div>
      </div>

      {/* Hero / unlock status */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{
          background: storyUnlocked
            ? 'linear-gradient(135deg, #22C55E, #16A34A)'
            : 'linear-gradient(135deg, #FF6B8C, #FF8C6B)',
          borderRadius: 20,
          padding: '20px',
          color: '#fff',
        }}>
          {storyUnlocked ? (
            <>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🎉</div>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>{ui.pc_hero_done_heading}</div>
              <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 14 }}>{ui.pc_hero_done_body}</div>
              <Link
                href="/kpatto/story/kp-ep-001"
                style={{
                  display: 'inline-block',
                  background: 'rgba(255,255,255,0.25)',
                  border: '1.5px solid rgba(255,255,255,0.5)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  padding: '9px 18px',
                  borderRadius: 99,
                  textDecoration: 'none',
                }}
              >
                {ui.pc_hero_done_cta}
              </Link>
            </>
          ) : (
            <>
              <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>{ui.pc_hero_label}</div>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>
                {ui.pc_hero_progress(requiredDone, required.length)}
              </div>
              <div style={{
                height: 6,
                background: 'rgba(255,255,255,0.25)',
                borderRadius: 99,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${(requiredDone / required.length) * 100}%`,
                  background: '#fff',
                  borderRadius: 99,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>{ui.pc_hero_hint}</div>
            </>
          )}
        </div>
      </div>

      {/* Required lessons */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--pm)', marginBottom: 10 }}>
          {ui.pc_section_required}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {required.map(lesson => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              done={isLessonComplete(lesson.id)}
              unlocked={isLessonUnlocked(lesson.id)}
              badge={ui.pc_badge_required}
              badgeColor="#FF6B8C"
            />
          ))}
        </div>
      </div>

      {/* Optional lessons */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--pm)', marginBottom: 10 }}>
          {ui.pc_section_optional}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {optional.map(lesson => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              done={isLessonComplete(lesson.id)}
              unlocked={isLessonUnlocked(lesson.id)}
              badge={ui.pc_badge_optional}
              badgeColor="#6366F1"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function LessonRow({ lesson, done, unlocked, badge, badgeColor }: {
  lesson: (typeof LESSONS)[0]
  done: boolean
  unlocked: boolean
  badge: string
  badgeColor: string
}) {
  const { prefs } = usePreferences()
  const lang = prefs.language ?? 'en'

  const el = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: 'var(--pb)',
      border: `1.5px solid ${done ? '#22C55E40' : 'var(--border, rgba(0,0,0,0.08))'}`,
      borderRadius: 16,
      padding: '14px 16px',
      opacity: unlocked ? 1 : 0.5,
      textDecoration: 'none',
      color: 'var(--pt)',
    }}>
      {/* Number / status */}
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        background: done ? '#22C55E18' : 'rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: done ? 18 : 14,
        fontWeight: 800,
        color: done ? '#22C55E' : 'var(--pm)',
        flexShrink: 0,
      }}>
        {done ? '✓' : !unlocked ? '🔒' : String(lesson.id).padStart(2, '0')}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            color: badgeColor,
            background: `${badgeColor}18`,
            padding: '1px 6px',
            borderRadius: 99,
            letterSpacing: '0.04em',
          }}>
            {badge}
          </span>
          <span style={{ fontSize: 11, color: 'var(--pm)' }}>{lesson.duration}</span>
        </div>
        <div style={{
          fontSize: 15,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {lesson.id}. {(lesson.title as Record<string, string>)[lang] ?? lesson.title.en}
        </div>
      </div>

      {unlocked && !done && (
        <span style={{ color: 'var(--pm)', fontSize: 18, flexShrink: 0 }}>›</span>
      )}
    </div>
  )

  if (!unlocked) return <div key={lesson.id}>{el}</div>
  return (
    <Link href={`/kpatto/pre-course/${lesson.id}`} key={lesson.id} style={{ textDecoration: 'none' }}>
      {el}
    </Link>
  )
}
