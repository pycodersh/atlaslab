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
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>
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
                <CheckCircle2 size={28} strokeWidth={1.8} color="#D4873A" style={{ marginBottom: 6 }} />
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
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 3, height: 14, borderRadius: 99, background: '#D4873A' }} />
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: '#D4873A', textTransform: 'uppercase' }}>
            {ui.pc_section_required}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 3, height: 14, borderRadius: 99, background: '#6366F1' }} />
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: '#6366F1', textTransform: 'uppercase' }}>
            {ui.pc_section_optional}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
      gap: 14,
      background: '#FFFFFF',
      border: `1.5px solid ${done ? 'rgba(212,135,58,0.25)' : 'rgba(0,0,0,0.07)'}`,
      borderRadius: 18,
      padding: '16px 18px',
      opacity: unlocked ? 1 : 0.5,
      textDecoration: 'none',
      color: '#1a1a2e',
      boxShadow: done
        ? '0 2px 12px rgba(212,135,58,0.08)'
        : unlocked
          ? '0 1px 6px rgba(0,0,0,0.04)'
          : 'none',
      transition: 'box-shadow 0.2s, border-color 0.2s',
    }}>
      {/* Number / status */}
      <div style={{
        width: 46,
        height: 46,
        borderRadius: 14,
        background: done
          ? 'rgba(212,135,58,0.10)'
          : !unlocked
            ? 'rgba(0,0,0,0.04)'
            : `${badgeColor}12`,
        border: done ? '1px solid rgba(212,135,58,0.20)' : '1px solid transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {done
          ? <CheckCircle2 size={22} color="#D4873A" />
          : !unlocked
            ? <Lock size={17} color="#C0C0C0" strokeWidth={2} />
            : <span style={{ fontSize: 15, fontWeight: 800, color: badgeColor }}>{String(lesson.id).padStart(2, '0')}</span>
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
          <span style={{
            fontSize: 9,
            fontWeight: 800,
            color: badgeColor,
            background: `${badgeColor}12`,
            border: `1px solid ${badgeColor}30`,
            padding: '2px 8px',
            borderRadius: 99,
            letterSpacing: '0.07em',
            textTransform: 'uppercase' as const,
          }}>
            {badge}
          </span>
          <span style={{ fontSize: 12, color: '#888888', fontWeight: 500 }}>
            {lesson.duration}
          </span>
        </div>
        <div style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#1a1a2e',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {titleOverride || (lesson.title as Record<string, string>)[lang] || lesson.title.en}
        </div>
      </div>

      {unlocked && !done && (
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 99,
          background: `${badgeColor}12`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: badgeColor, fontSize: 16, lineHeight: 1, marginLeft: 2 }}>›</span>
        </div>
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
