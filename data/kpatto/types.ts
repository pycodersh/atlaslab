// K-PATTO content data types
// Designed to support 100 episodes with multilingual content

// Supported display languages — ko is the source language (Korean content base)
// Launch order: 1st EN, 2nd ES+PT, 3rd ZH-CN
export type KPattoLanguage = 'ko' | 'en' | 'es' | 'pt' | 'zh-cn'

export type MultiLangText = Partial<Record<KPattoLanguage, string>>

export interface KPattoDialogue {
  id: string
  character: string
  korean: string
  translations: MultiLangText
  audio_url?: string
  pattern_id?: string
}

export interface KPattoPatternCard {
  pattern_id: string
}

export interface KPattoPanel {
  id: string
  image_url?: string
  dialogues: KPattoDialogue[]
  pattern_card?: KPattoPatternCard
}

export interface KPattoStory {
  id: string
  episode: number
  title: string
  level: 'beginner' | 'intermediate' | 'advanced'
  theme: string
  tags: string[]
  vocabulary_ids: string[]
  panels: KPattoPanel[]
  thumbnail_url?: string
}

export interface KPattoPattern {
  id: string
  korean: string
  structure: string
  translations: MultiLangText
  examples: Array<{
    korean: string
    translations: MultiLangText
    audio_url?: string
  }>
  level: 'beginner' | 'intermediate' | 'advanced'
}

export interface KPattoVocabulary {
  id: string
  korean: string
  translations: MultiLangText
  audio_url?: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
}

// User progress types
export interface KPattoStoryProgress {
  story_id: string
  completed: boolean
  last_panel_index: number
  completed_at?: string
}

export interface KPattoUserProgress {
  user_id: string
  completed_stories: string[]
  story_progress: Record<string, KPattoStoryProgress>
  learned_patterns: string[]
  learned_vocabulary: string[]
  streak_days: number
  last_study_date: string | null
}
