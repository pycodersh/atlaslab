'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Lock, CheckCircle2 } from 'lucide-react'
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
      {/* Top header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px 10px' }}>
        <Link href="/kpatto/home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#111111', flexShrink: 0 }}>
          <ChevronLeft size={22} strokeWidth={2} />
        </Link>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#111111', letterSpacing: '-0.01em' }}>PRE-COURSE</span>
      </div>

      {/* Hero card with image background */}
      <div style={{ padding: '0 20px 0' }}>
        <div style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          background: '#1A1A1A',
          minHeight: 180,
        }}>
          {/* Background image */}
          <Image
            src="/kpatto/banners/Pre-course.png"
            alt="Pre-Course"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center center' }}
            sizes="100vw"
            priority
          />
          {/* Dark overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.55)',
          }} />
          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, padding: '20px 20px 20px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 180 }}>
            {storyUnlocked ? (
              <>
                <div style={{ fontSize: 24, marginBottom: 6 }}>🎉</div>
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>{ui.pc_hero_done_heading}</div>
                <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 14 }}>{ui.pc_hero_done_body}</div>
                <Link
                  href="/kpatto/story/kp-ep-001"
                  style={{
                    display: 'inline-block',
                    background: '#D4873A',
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
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>{ui.pc_hero_label}</div>
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 10 }}>
                  {ui.pc_hero_progress(requiredDone, required.length)}
                </div>
                <div style={{
                  height: 6,
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 99,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(requiredDone / required.length) * 100}%`,
                    background: '#D4873A',
                    borderRadius: 99,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>{ui.pc_hero_hint}</div>
              </>
            )}
          </div>
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
              badgeColor="#D4873A"
              titleOverride={(ui as unknown as Record<string, string>)[`pc_lesson_title_${lesson.id}`] || undefined}
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
              titleOverride={(ui as unknown as Record<string, string>)[`pc_lesson_title_${lesson.id}`] || undefined}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function LessonRow({ lesson, done, unlocked, badge, badgeColor, titleOverride }: {
  lesson: (typeof LESSONS)[0]
  done: boolean
  unlocked: boolean
  badge: string
  badgeColor: string
  titleOverride?: string
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
        background: done ? '#D4873A18' : 'rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {done
          ? <CheckCircle2 size={20} color="#D4873A" />
          : !unlocked
            ? <Lock size={16} color="#CCCCCC" />
            : <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--pm)' }}>{String(lesson.id).padStart(2, '0')}</span>
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
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
          <span style={{ fontSize: 11, color: 'var(--pm)' }}>
            {lesson.duration.replace('분', ' min.')}
          </span>
        </div>
        <div style={{
          fontSize: 15,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {titleOverride || (lesson.title as Record<string, string>)[lang] || lesson.title.en}
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
