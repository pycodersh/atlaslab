import type { ReviewSchedule, StudyLog, ContentType } from './types'
import { generateReviewSchedule, today } from './schedule'

const SCHEDULE_KEY = 'patto-review-schedule'
const LOGS_KEY = 'patto-study-logs'
const SEEDED_KEY = 'patto-review-seeded'

// ── Seed data (demo) ────────────────────────────────────────────────────
function seedIfNeeded() {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(SEEDED_KEY)) return

  const t = today()
  const seeds: ReviewSchedule[] = [
    {
      id: 'seed-s3-r2',
      userId: 'guest',
      contentType: 'story',
      contentId: '3',
      title: 'The Unexpected Party',
      reviewNumber: 2,
      dueDate: t,
      status: 'pending',
    },
    {
      id: 'seed-s8-r1',
      userId: 'guest',
      contentType: 'story',
      contentId: '8',
      title: 'A Rainy Morning',
      reviewNumber: 1,
      dueDate: t,
      status: 'pending',
    },
    {
      id: 'seed-p1-r4',
      userId: 'guest',
      contentType: 'pattern_set',
      contentId: '1',
      title: 'I want to ~ 외 4개 패턴',
      reviewNumber: 4,
      dueDate: t,
      status: 'pending',
    },
    // Future schedule examples
    {
      id: 'seed-s1-r3',
      userId: 'guest',
      contentType: 'story',
      contentId: '1',
      title: 'Morning Coffee',
      reviewNumber: 3,
      dueDate: addDaysFromToday(2),
      status: 'pending',
    },
  ]

  // Seed study logs for calendar
  const logs: StudyLog[] = [
    makeLog('guest', 'story', '1', 'Morning Coffee', 0, 12, daysAgo(6)),
    makeLog('guest', 'story', '2', 'The Library', 0, 10, daysAgo(5)),
    makeLog('guest', 'story', '1', 'Morning Coffee', 1, 8, daysAgo(5)),
    makeLog('guest', 'story', '3', 'The Unexpected Party', 0, 15, daysAgo(3)),
    makeLog('guest', 'pattern_set', '1', 'I want to ~ 외 4개 패턴', 1, 6, daysAgo(3)),
    makeLog('guest', 'story', '2', 'The Library', 1, 9, daysAgo(2)),
    makeLog('guest', 'story', '8', 'A Rainy Morning', 0, 11, daysAgo(1)),
  ]

  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(seeds))
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
  localStorage.setItem(SEEDED_KEY, '1')
}

function addDaysFromToday(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function makeLog(
  userId: string,
  contentType: ContentType,
  contentId: string,
  title: string,
  reviewNumber: number,
  studiedMinutes: number,
  date: string,
): StudyLog {
  return {
    id: `log-${contentType}-${contentId}-${reviewNumber}-${date}`,
    userId,
    date,
    contentType,
    contentId,
    title,
    reviewNumber,
    studiedMinutes,
    completedAt: `${date}T10:00:00.000Z`,
  }
}

// ── Read / Write ─────────────────────────────────────────────────────────
export function getReviewSchedules(): ReviewSchedule[] {
  seedIfNeeded()
  try {
    return JSON.parse(localStorage.getItem(SCHEDULE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveReviewSchedules(schedules: ReviewSchedule[]) {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedules))
}

export function getStudyLogs(): StudyLog[] {
  seedIfNeeded()
  try {
    return JSON.parse(localStorage.getItem(LOGS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveStudyLog(log: StudyLog) {
  const logs = getStudyLogs()
  logs.push(log)
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

// ── Business logic ────────────────────────────────────────────────────────
export function getTodayReviewItems(): ReviewSchedule[] {
  const t = today()
  return getReviewSchedules().filter(s => s.status === 'pending' && s.dueDate <= t)
}

export function markReviewCompleted(id: string) {
  const schedules = getReviewSchedules()
  const updated = schedules.map(s =>
    s.id === id
      ? { ...s, status: 'completed' as const, completedAt: new Date().toISOString() }
      : s
  )
  saveReviewSchedules(updated)
}

export function createReviewScheduleIfNeeded(
  userId: string,
  contentType: ContentType,
  contentId: string,
  title: string,
  completedDate: string,
) {
  const existing = getReviewSchedules()
  const alreadyExists = existing.some(
    s => s.userId === userId && s.contentType === contentType && s.contentId === contentId
  )
  if (alreadyExists) return
  const newSchedules = generateReviewSchedule(userId, contentType, contentId, title, completedDate)
  saveReviewSchedules([...existing, ...newSchedules])
}

export function getStudyLogsForDate(date: string): StudyLog[] {
  return getStudyLogs().filter(l => l.date === date)
}

export function getStudyCountsByDate(): Record<string, number> {
  const logs = getStudyLogs()
  const counts: Record<string, number> = {}
  for (const log of logs) {
    counts[log.date] = (counts[log.date] ?? 0) + 1
  }
  return counts
}
