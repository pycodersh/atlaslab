import type { Difficulty, Level, PatternWithExamples } from '@/types/pattern'

// 영어 원문 + 한국어 번역 쌍 (\n\n으로 단락 구분)
export type MiniStoryContent = {
  en: string
  ko: string
}

export type Story = {
  id: string
  level: Level
  order_index: number
  title: string
  description: string | null
  mini_stories: Record<Difficulty, MiniStoryContent>
}

export type StoryPattern = {
  story_id: string
  pattern_id: string
  order_index: number
}

export type StoryWithPatterns = Story & {
  patterns: PatternWithExamples[]
}
