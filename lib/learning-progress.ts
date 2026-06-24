import type {
  DailyRecord,
  LearningProgress,
  ReviewItem,
  ReviewStage,
  StoryReviewStatus,
  UserSettings,
} from '@/types/learning-progress'

export const LEARNING_PROGRESS_STORAGE_KEY = 'patto.learningProgress.v2'
export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30, 60] as const
export const MAX_TODAY_STORIES = 5

export const defaultUserSettings: UserSettings = {
  ageGroup: 'worker',
  interestArea: 'daily',
  dailyStoryCount: 1,
  difficulty: 'normal',
  voiceSpeed: 'normal',
  darkMode: false,
}

export const defaultLearningProgress: LearningProgress = {
  currentStoryOrder: 1,
  currentCardIndex: 0,
  completedStoryIds: [],
  dailyRecords: {},
  streakDays: 0,
  lastStudyDate: null,
  reviewQueue: [],
  reviewHistory: [],
  favorites: [],
  storyReviewStatuses: {},
  settings: defaultUserSettings,
}

export function getTodayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(dateKey: string, days: number) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  return getTodayKey(date)
}

function getPreviousDateKey(dateKey: string) {
  return addDays(dateKey, -1)
}

function normalizeDailyRecord(record?: Partial<DailyRecord>): DailyRecord {
  return {
    studied: record?.studied ?? false,
    completedStoryIds: record?.completedStoryIds ?? [],
    readCount: record?.readCount ?? 0,
    studyCount: record?.studyCount ?? 0,
    storyCompleted: record?.storyCompleted ?? 0,
    reviewCompleted: record?.reviewCompleted ?? 0,
  }
}

function normalizeStoryReviewStatus(
  status: Partial<StoryReviewStatus> | undefined,
  storyId: string,
): StoryReviewStatus {
  return {
    storyId,
    mastered: status?.mastered ?? false,
    currentStage: status?.currentStage ?? 0,
  }
}

export function normalizeLearningProgress(
  progress: Partial<LearningProgress> | null | undefined,
): LearningProgress {
  const dailyRecords = Object.fromEntries(
    Object.entries(progress?.dailyRecords ?? {}).map(([dateKey, record]) => [
      dateKey,
      normalizeDailyRecord(record),
    ]),
  )
  return {
    ...defaultLearningProgress,
    ...progress,
    completedStoryIds: progress?.completedStoryIds ?? [],
    dailyRecords,
    reviewQueue: progress?.reviewQueue ?? [],
    reviewHistory: progress?.reviewHistory ?? [],
    favorites: progress?.favorites ?? [],
    storyReviewStatuses: progress?.storyReviewStatuses ?? {},
    settings: { ...defaultUserSettings, ...progress?.settings },
  }
}

export function loadLearningProgress(): LearningProgress {
  if (typeof window === 'undefined') return defaultLearningProgress
  try {
    const stored = window.localStorage.getItem(LEARNING_PROGRESS_STORAGE_KEY)
    if (!stored) return defaultLearningProgress
    return normalizeLearningProgress(JSON.parse(stored))
  } catch {
    return defaultLearningProgress
  }
}

export function saveLearningProgress(progress: LearningProgress) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LEARNING_PROGRESS_STORAGE_KEY, JSON.stringify(progress))
}

export function touchStudyDate(progress: LearningProgress, dateKey = getTodayKey()) {
  const previousRecord = normalizeDailyRecord(progress.dailyRecords[dateKey])
  const alreadyStudiedToday = progress.lastStudyDate === dateKey || previousRecord.studied
  const yesterdayKey = getPreviousDateKey(dateKey)
  const streakDays = alreadyStudiedToday
    ? progress.streakDays
    : progress.lastStudyDate === yesterdayKey
      ? progress.streakDays + 1
      : 1
  return {
    ...progress,
    streakDays,
    lastStudyDate: dateKey,
    dailyRecords: {
      ...progress.dailyRecords,
      [dateKey]: { ...previousRecord, studied: true },
    },
  }
}

export function completeStoryAndScheduleReview(
  progress: LearningProgress,
  storyId: string,
  patternIds: string[],
  readCount: number,
  readGoal: number,
) {
  const dateKey = getTodayKey()
  const touched = touchStudyDate(progress, dateKey)
  const previousRecord = normalizeDailyRecord(touched.dailyRecords[dateKey])
  const completed = readCount >= readGoal
  const alreadyCompleted = touched.completedStoryIds.includes(storyId)
  const completedStoryIds = completed
    ? Array.from(new Set([...touched.completedStoryIds, storyId]))
    : touched.completedStoryIds

  const withRecord = {
    ...touched,
    completedStoryIds,
    dailyRecords: {
      ...touched.dailyRecords,
      [dateKey]: {
        ...previousRecord,
        studied: true,
        completedStoryIds: completed
          ? Array.from(new Set([...previousRecord.completedStoryIds, storyId]))
          : previousRecord.completedStoryIds,
        readCount,
        studyCount: Math.max(previousRecord.studyCount, 1),
        storyCompleted:
          completed && !alreadyCompleted
            ? previousRecord.storyCompleted + 1
            : previousRecord.storyCompleted,
      },
    },
  }

  if (!completed) return withRecord

  // 복습 스케줄 1단계 등록
  const existingKeys = new Set(
    withRecord.reviewQueue.map((item) => `${item.storyId}-${item.patternId}-${item.reviewStage}`),
  )
  const nextItems: ReviewItem[] = patternIds
    .filter((pid) => !existingKeys.has(`${storyId}-${pid}-1`))
    .map((pid) => ({
      id: `${storyId}-${pid}-1-${dateKey}`,
      storyId,
      patternId: pid,
      reviewStage: 1 as ReviewStage,
      dueDate: addDays(dateKey, REVIEW_INTERVAL_DAYS[0]),
      completed: false,
      completedDate: null,
    }))

  return {
    ...withRecord,
    reviewQueue: [...withRecord.reviewQueue, ...nextItems],
    storyReviewStatuses: {
      ...withRecord.storyReviewStatuses,
      [storyId]: normalizeStoryReviewStatus(
        { ...withRecord.storyReviewStatuses[storyId], currentStage: 1 },
        storyId,
      ),
    },
  }
}

export function isFavoriteSentence(progress: LearningProgress, sentence: string) {
  return progress.favorites.some((f) => f.sentence === sentence)
}

export function toggleFavoriteSentence(
  progress: LearningProgress,
  sentence: string,
  storyId: string,
  patternId: string,
) {
  const existing = progress.favorites.find((f) => f.sentence === sentence)
  if (existing) {
    return { ...progress, favorites: progress.favorites.filter((f) => f.id !== existing.id) }
  }
  return {
    ...progress,
    favorites: [
      ...progress.favorites,
      {
        id: `${storyId}-${patternId}-${Date.now()}`,
        storyId,
        patternId,
        sentence,
        source: 'original' as const,
        createdDate: getTodayKey(),
      },
    ],
  }
}

export function updateUserSettings(
  progress: LearningProgress,
  settings: Partial<LearningProgress['settings']>,
) {
  return { ...progress, settings: { ...progress.settings, ...settings } }
}
