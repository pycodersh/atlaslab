// K-PATTO content data types
// Designed to support 100 episodes with multilingual content

// Supported display languages — ko is the source language (Korean content base)
// Launch order: 1st EN, 2nd JA, 3rd ES
export type KPattoLanguage = 'ko' | 'en' | 'ja' | 'es'

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

export type TailDirection = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

export interface SpeechBubbleConfig {
  speaker: string
  korean: string
  x: number            // % from left (top-left corner of bubble box)
  y: number            // % from top
  width: number        // % of panel width
  tailDirection: TailDirection
  tailTarget: { x: number; y: number }  // % coordinates where tail tip points
}

export interface KPattoPanel {
  id: string
  image_url?: string       // individual panel image
  strip_url?: string       // vertical strip containing multiple panels
  strip_index?: number     // 0-based index within strip
  strip_total?: number     // total panels in strip
  panel_aspect?: string    // CSS aspect-ratio value e.g. '720/220'
  speech_bubbles?: SpeechBubbleConfig[]
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
