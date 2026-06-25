import type { ReviewSchedule, ContentType } from './types'

export const REVIEW_INTERVALS = [1, 3, 7, 14, 30] // days after completion

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function generateReviewSchedule(
  userId: string,
  contentType: ContentType,
  contentId: string,
  title: string,
  completedDate: string,
): ReviewSchedule[] {
  return REVIEW_INTERVALS.map((days, i) => ({
    id: `${userId}-${contentType}-${contentId}-r${i + 1}-${Date.now()}`,
    userId,
    contentType,
    contentId,
    title,
    reviewNumber: i + 1,
    dueDate: addDays(completedDate, days),
    status: 'pending' as const,
  }))
}
