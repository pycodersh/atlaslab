'use client'

import { use } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LESSONS } from '@/data/kpatto/precourse/lessons'
import { useKPrecourseProgress } from '@/hooks/useKPrecourseProgress'
import { LessonPlayer } from '@/components/kpatto/precourse/LessonPlayer'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { usePreferences } from '@/contexts/PreferencesContext'
import { getUI } from '@/lib/kpatto/ui-strings'
import type { KPattoLanguage } from '@/data/kpatto/types'

interface PageProps {
  params: Promise<{ lesson: string }>
}

export default function LessonPage({ params }: PageProps) {
  const { lesson: lessonParam } = use(params)
  const lessonId = parseInt(lessonParam, 10)
  const router = useRouter()
  const { markLessonComplete } = useKPrecourseProgress()
  const { prefs } = usePreferences()
  const ui = getUI('en')
  const lang = 'en' as KPattoLanguage

  const lesson = LESSONS.find(l => l.id === lessonId)
  if (!lesson) notFound()

  const handleComplete = (quizPassed: boolean) => {
    markLessonComplete(lessonId, quizPassed)
    if (lessonId === 6 && quizPassed) {
      router.push('/kpatto/story/kp-ep-001?welcome=1')
    } else {
      router.push('/kpatto/pre-course')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      paddingBottom: KPATTO_TAB_BAR_HEIGHT + 32,
      maxWidth: 600,
      margin: '0 auto',
    }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: '#FFFFFF',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        padding: '14px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Link
            href="/kpatto/pre-course"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: '#555555',
              fontSize: 20,
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            ‹
          </Link>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#999999', letterSpacing: '0.04em' }}>
                LESSON {String(lessonId).padStart(2, '0')} · {lesson.duration}
              </span>
              <span style={{
                fontSize: 9,
                fontWeight: 800,
                color: lesson.required ? '#D4873A' : '#6366F1',
                background: lesson.required ? 'rgba(212,135,58,0.10)' : 'rgba(99,102,241,0.10)',
                border: `1px solid ${lesson.required ? 'rgba(212,135,58,0.25)' : 'rgba(99,102,241,0.25)'}`,
                padding: '2px 7px',
                borderRadius: 99,
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
              }}>
                {lesson.required ? ui.lp_meta_required : ui.lp_meta_optional}
              </span>
            </div>
            <div style={{
              fontSize: 17,
              fontWeight: 700,
              color: '#1a1a2e',
              lineHeight: 1.3,
            }}>
              {lesson.title[lang] ?? lesson.title.en}
            </div>
            <div style={{ fontSize: 13, color: '#AAAAAA', marginTop: 3, lineHeight: 1.4 }}>
              {lesson.subtitle[lang] ?? lesson.subtitle.en}
            </div>
          </div>
        </div>
      </div>

      {/* Player */}
      <LessonPlayer lesson={lesson} onComplete={handleComplete} />
    </div>
  )
}
