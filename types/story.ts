import type { Level } from '@/types/pattern'
import type { PatternWithExamples } from '@/types/pattern'

export type Story = {
  id: string
  level: Level
  order_index: number   // 1부터 시작 (URL /learn/1 등에 사용)
  title: string
  description: string | null
  mini_story: string    // 5개 패턴을 연결한 짧은 스토리 문장
}

export type StoryPattern = {
  story_id: string
  pattern_id: string
  order_index: number   // 스토리 내 패턴 순서 (1~5)
}

// 카드 엔진에서 사용하는 완전한 스토리 (패턴+예문 포함)
export type StoryWithPatterns = Story & {
  patterns: PatternWithExamples[]
}
