'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PrecourseProgress, LessonProgress } from '@/data/kpatto/precourse/types'

const STORAGE_KEY = 'kpatto.precourse.v1'

function defaultProgress(): PrecourseProgress {
  return { lessons: {}, story_unlocked: false }
}

function load(): PrecourseProgress {
  if (typeof window === 'undefined') return defaultProgress()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : defaultProgress()
  } catch {
    return defaultProgress()
  }
}

function save(p: PrecourseProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch { /* ignore */ }
}

export function useKPrecourseProgress() {
  const [progress, setProgress] = useState<PrecourseProgress>(defaultProgress)

  useEffect(() => {
    setProgress(load())
  }, [])

  const markLessonComplete = useCallback((lessonId: number, quizPassed: boolean) => {
    setProgress(prev => {
      const entry: LessonProgress = {
        completed: true,
        quiz_passed: quizPassed,
        completed_at: new Date().toISOString(),
      }
      const updated: PrecourseProgress = {
        ...prev,
        lessons: { ...prev.lessons, [lessonId]: entry },
        // unlock story after lesson 6 quiz pass
        story_unlocked: prev.story_unlocked || (lessonId === 6 && quizPassed),
      }
      save(updated)
      return updated
    })
  }, [])

  const isLessonComplete = useCallback((lessonId: number) => {
    return !!progress.lessons[lessonId]?.completed
  }, [progress])

  const isLessonUnlocked = useCallback((lessonId: number) => {
    if (lessonId === 1) return true
    return !!progress.lessons[lessonId - 1]?.completed
  }, [progress])

  const getLesson = useCallback((lessonId: number): LessonProgress | undefined => {
    return progress.lessons[lessonId]
  }, [progress])

  return {
    progress,
    markLessonComplete,
    isLessonComplete,
    isLessonUnlocked,
    getLesson,
    storyUnlocked: progress.story_unlocked,
  }
}
