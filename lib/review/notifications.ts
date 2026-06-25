import { getTodayReviewItems, getReviewSchedules } from './storage'
import type { ReviewSchedule } from './types'

/**
 * 오늘 복습 예정 항목 반환 (pending + dueDate <= today)
 * Settings > Review Reminder 연동 시 이 함수를 사용하세요.
 */
export { getTodayReviewItems }

/**
 * 오늘 복습 알림을 보내야 하는지 여부
 * Settings의 review_reminder_enabled 설정과 조합해서 사용하세요.
 */
export function hasReviewReminderToday(): boolean {
  if (typeof window === 'undefined') return false
  return getTodayReviewItems().length > 0
}

/**
 * 특정 날짜의 복습 항목 반환 (알림 스케줄링용)
 */
export function getReviewItemsForDate(date: string): ReviewSchedule[] {
  return getReviewSchedules().filter(s => s.status === 'pending' && s.dueDate === date)
}

/**
 * 알림 설정 읽기/쓰기 (Settings > Preferences 연동 준비)
 */
const REMINDER_KEY = 'patto-review-reminder-enabled'
export function isReviewReminderEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(REMINDER_KEY) !== 'false'
}
export function setReviewReminderEnabled(enabled: boolean) {
  localStorage.setItem(REMINDER_KEY, enabled ? 'true' : 'false')
}
