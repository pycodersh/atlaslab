export type ContentType = 'story' | 'pattern_set'

export interface StudyLog {
  id: string
  userId: string
  date: string          // YYYY-MM-DD
  contentType: ContentType
  contentId: string
  title: string
  reviewNumber: number  // 0 = 최초 학습, 1~5 = 복습 회차
  studiedMinutes: number
  completedAt: string   // ISO 8601
}

export interface ReviewSchedule {
  id: string
  userId: string
  contentType: ContentType
  contentId: string
  title: string
  reviewNumber: number  // 1~5
  dueDate: string       // YYYY-MM-DD
  status: 'pending' | 'completed'
  completedAt?: string
}
