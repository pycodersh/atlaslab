export type Level = 1 | 2 | 3

export type Difficulty = 'normal' | 'advanced' | 'native'

export type PatternImage = {
  id: string
  storage_key: string  // Supabase Storage 경로
  alt_text: string | null
}

export type PatternExample = {
  id: string
  pattern_id: string
  difficulty: Difficulty
  order_index: number
  sentence: string
  translation: string | null  // 한국어 번역 (example_translations)
  audio_url: string | null
}

export type Pattern = {
  id: string
  level: Level
  order_index: number
  pattern_text: string   // 패턴 문자열 (pattern_translations)
  meaning: string        // 한국어 의미 (pattern_translations)
  image_url: string | null  // Supabase Storage 공개 URL
}

// 예문을 난이도별로 그룹화한 패턴 (카드 렌더링용)
export type PatternWithExamples = Pattern & {
  examples: Record<Difficulty, PatternExample[]>
  story_position: number  // story_patterns.order_index (1~5), patternExamplesFull 키 조합용
}
