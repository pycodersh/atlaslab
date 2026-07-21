'use client'

import { use } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LESSONS } from '@/data/kpatto/precourse/lessons'
import { useKPrecourseProgress } from '@/hooks/useKPrecourseProgress'
import { LessonPlayer } from '@/components/kpatto/precourse/LessonPlayer'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'

interface PageProps {
  params: Promise<{ lesson: string }>
}

export default function LessonPage({ params }: PageProps) {
  const { lesson: lessonParam } = use(params)
  const lessonId = parseInt(lessonParam, 10)
  const router = useRouter()
  const { markLessonComplete } = useKPrecourseProgress()

  const lesson = LESSONS.find(l => l.id === lessonId)
  if (!lesson) notFound()

  const handleComplete = (quizPassed: boolean) => {
    markLessonComplete(lessonId, quizPassed)
    if (lessonId === 6 && quizPassed) {
      // Story unlock flow
      router.push('/kpatto/story/kp-ep-001?welcome=1')
    } else {
      router.push('/kpatto/pre-course')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: KPATTO_TAB_BAR_HEIGHT + 32,
      maxWidth: 600,
      margin: '0 auto',
    }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'var(--pb)',
        borderBottom: '1px solid var(--border, rgba(0,0,0,0.06))',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <Link
          href="/kpatto/pre-course"
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'var(--pb-alt, rgba(0,0,0,0.05))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: 'var(--pt)',
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          ‹
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: 'var(--pm)', fontWeight: 700, letterSpacing: '0.06em' }}>
            LESSON {String(lessonId).padStart(2, '0')} · {lesson.duration}
            {lesson.required ? ' · REQUIRED' : ' · OPTIONAL'}
          </div>
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--pt)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {lesson.title.en}
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <div style={{ padding: '16px 20px 20px' }}>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--pm)' }}>
          {lesson.subtitle.en}
        </p>
      </div>

      {/* Player */}
      <LessonPlayer lesson={lesson} onComplete={handleComplete} />
    </div>
  )
}
