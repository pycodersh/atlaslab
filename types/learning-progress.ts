import type { Difficulty } from '@/types/pattern'

export type AgeGroup = 'elementary' | 'middle' | 'high' | 'worker'

export type InterestArea = 'daily' | 'investment' | 'business' | 'travel' | 'game' | 'it'

export type UserSettings = {
  ageGroup: AgeGroup
  interestArea: InterestArea
  dailyStoryCount: number
  difficulty: Difficulty
  voiceSpeed: 'slow' | 'normal' | 'fast'
  darkMode: boolean
}

export type DailyRecord = {
  studied: boolean
  completedStoryIds: string[]  // UUID
  readCount: number
  studyCount: number
  storyCompleted: number
  reviewCompleted: number
}

export type ReviewStage = 1 | 2 | 3 | 4 | 5 | 6

export type ReviewItem = {
  id: string
  storyId: string        // UUID
  patternId: string      // UUID
  reviewStage: ReviewStage
  dueDate: string
  completed: boolean
  completedDate: string | null
}

export type ReviewHistoryItem = {
  storyId: string
  patternId: string
  reviewStage: ReviewStage
  completedDate: string
}

export type FavoriteSentence = {
  id: string
  storyId: string
  patternId: string
  sentence: string
  source: 'original' | 'review'
  createdDate: string
}

export type StoryReviewStatus = {
  storyId: string
  mastered: boolean
  currentStage: number
}

export type LearningProgress = {
  currentStoryOrder: number     // URL 기반 order_index (1, 2, 3...)
  currentCardIndex: number
  completedStoryIds: string[]   // UUID
  dailyRecords: Record<string, DailyRecord>
  streakDays: number
  lastStudyDate: string | null
  reviewQueue: ReviewItem[]
  reviewHistory: ReviewHistoryItem[]
  favorites: FavoriteSentence[]
  storyReviewStatuses: Record<string, StoryReviewStatus>
  settings: UserSettings
}
