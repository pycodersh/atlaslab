import type { ContentType } from './types'
import { getTodayReviewItems, getStudyLogsForDate, getStudyCountsByDate } from './storage'
import { today } from './schedule'

export interface LearningItem {
  id: string
  contentType: ContentType
  contentId: string
  title: string
  reviewNumber: number  // 0 = 신규
  href: string
  estimatedMin: number
  scheduleId?: string   // review_schedule의 id (복습 항목일 때)
}

export function getTodayLearningPlan(): LearningItem[] {
  const reviews = getTodayReviewItems()
  const todayLogs = getStudyLogsForDate(today())
  const completedKeys = new Set(todayLogs.map(l => `${l.contentType}-${l.contentId}-${l.reviewNumber}`))

  const items: LearningItem[] = reviews.map(r => ({
    id: r.id,
    contentType: r.contentType,
    contentId: r.contentId,
    title: r.title,
    reviewNumber: r.reviewNumber,
    href: r.contentType === 'pattern_set' ? `/stories/${r.contentId}?v=p` : `/stories/${r.contentId}`,
    estimatedMin: r.contentType === 'pattern_set' ? 5 : 8,
    scheduleId: r.id,
  }))

  // 신규 스토리 추가 (데모: Story 1)
  const newStory: LearningItem = {
    id: 'new-story-1',
    contentType: 'story',
    contentId: '1',
    title: 'The Unexpected Party',
    reviewNumber: 0,
    href: '/stories/1',
    estimatedMin: 12,
  }

  const allItems = [...items, newStory]

  // 오늘 이미 완료한 항목 제외
  return allItems.filter(item => {
    const key = `${item.contentType}-${item.contentId}-${item.reviewNumber}`
    return !completedKeys.has(key)
  })
}

export function getFirstIncompleteItem(): LearningItem | null {
  const plan = getTodayLearningPlan()
  return plan[0] ?? null
}

export function isTodayComplete(): boolean {
  return getTodayLearningPlan().length === 0
}

export function getTodayEstimatedMinutes(): number {
  return getTodayLearningPlan().reduce((sum, i) => sum + i.estimatedMin, 0)
}

// ── Pattern of the Day ───────────────────────────────────────────────────
const PATTERNS_OF_DAY = [
  { pattern: "I want to ~", meaningKo: "~하고 싶다", example: "I want to take a break and read something good." },
  { pattern: "I have to ~", meaningKo: "~해야 한다", example: "I have to finish this before the meeting starts." },
  { pattern: "I just ~", meaningKo: "방금 ~했다", example: "I just got back from a really long walk." },
  { pattern: "I can ~", meaningKo: "~할 수 있다", example: "I can help you with that if you need me to." },
  { pattern: "I don't ~", meaningKo: "~하지 않는다", example: "I don't usually drink coffee this late at night." },
  { pattern: "I happen to ~", meaningKo: "우연히 ~하다", example: "I happened to meet an old friend on the street yesterday." },
  { pattern: "I tend to ~", meaningKo: "~하는 경향이 있다", example: "I tend to overthink things when I'm tired." },
]

export function getPatternOfTheDay() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return PATTERNS_OF_DAY[dayOfYear % PATTERNS_OF_DAY.length]
}

// ── Progress Summary (localStorage 기반) ───────────────────────────────
export function getProgressSummary() {
  const counts = getStudyCountsByDate()
  const totalDays = Object.values(counts).filter(v => v > 0).length

  // 연속 학습일 계산
  const dates = Object.keys(counts).filter(k => counts[k] > 0).sort().reverse()
  let streak = 0
  const todayStr = today()
  const d = new Date(todayStr)
  for (let i = 0; i < dates.length; i++) {
    const diff = Math.round((d.getTime() - new Date(dates[i]).getTime()) / 86400000)
    if (diff === i || diff === i + 1) streak++
    else break
  }

  return {
    storiesCompleted: 0,    // Supabase 기반 — Home에서는 0 표시 (로그인 후 실시간 반영)
    patternsLearned: 0,
    streakDays: streak,
    totalStudyDays: totalDays,
  }
}

// ── Greeting ─────────────────────────────────────────────────────────────
export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning.'
  if (h < 18) return 'Good Afternoon.'
  return 'Good Evening.'
}
