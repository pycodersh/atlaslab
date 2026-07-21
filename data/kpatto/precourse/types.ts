import type { MultiLangText } from '../types'

// ── Step types ────────────────────────────────────────────────────────────────

export interface InfoStep {
  type: 'info'
  emoji?: string
  title?: MultiLangText
  body: MultiLangText
  highlight?: string   // large Korean display
  note?: MultiLangText // small grey note
}

export interface CombineAnimStep {
  type: 'combine-anim'
  explanation: MultiLangText
  pairs: { consonant: string; vowel: string; result: string }[]
}

export interface CardFlipGridStep {
  type: 'card-flip-grid'
  title: MultiLangText
  note?: MultiLangText
  cards: { front: string; back: string; sub?: string }[]
}

export interface StrokeGridStep {
  type: 'stroke-grid'
  title: MultiLangText
  note?: MultiLangText
  groups: {
    label: MultiLangText
    color: string
    consonants: { char: string; romanization: string; example: string }[]
  }[]
}

export interface WordPracticeStep {
  type: 'word-practice'
  title: MultiLangText
  words: { korean: string; meaning: MultiLangText; audio_url?: string }[]
}

export interface InteractiveCombineStep {
  type: 'interactive-combine'
  title: MultiLangText
  body: MultiLangText
  consonants: string[]
  vowels: string[]
}

export interface StackAnimStep {
  type: 'stack-anim'
  title: MultiLangText
  body: MultiLangText
  examples: { consonant: string; vowel: string; coda: string; result: string; coda_sound: string }[]
  codas: { char: string; sound: string; example: string; meaning: MultiLangText }[]
}

export interface DiphthongGridStep {
  type: 'diphthong-grid'
  title: MultiLangText
  note?: MultiLangText
  primary: { char: string; romanization: string; composition?: string }[]
  secondary?: { char: string; romanization: string; composition?: string }[]
}

export interface LiaisonDemoStep {
  type: 'liaison-demo'
  title: MultiLangText
  body: MultiLangText
  examples: { written: string; pronounced: string; note: MultiLangText }[]
}

export interface RoadmapStep {
  type: 'roadmap'
  title: MultiLangText
  items: { num: number; title: MultiLangText; required: boolean }[]
}

export interface SceneStep {
  type: 'scene'
  title: MultiLangText
  scene: 'cafe' | 'subway' | 'kpop'
  items: { korean: string; meaning: MultiLangText }[]
}

export type LessonStep =
  | InfoStep
  | CombineAnimStep
  | CardFlipGridStep
  | StrokeGridStep
  | WordPracticeStep
  | InteractiveCombineStep
  | StackAnimStep
  | DiphthongGridStep
  | LiaisonDemoStep
  | RoadmapStep
  | SceneStep

// ── Quiz ─────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  question: MultiLangText
  options: string[]
  correct: number
  explanation?: MultiLangText
}

export interface LessonQuiz {
  questions: QuizQuestion[]
  passingScore: number
}

// ── Lesson config ─────────────────────────────────────────────────────────────

export interface LessonConfig {
  id: number
  required: boolean
  duration: string
  title: MultiLangText
  subtitle: MultiLangText
  steps: LessonStep[]
  quiz?: LessonQuiz
}

// ── Progress ─────────────────────────────────────────────────────────────────

export interface LessonProgress {
  completed: boolean
  quiz_passed: boolean
  completed_at?: string
}

export interface PrecourseProgress {
  lessons: Record<number, LessonProgress>
  story_unlocked: boolean
}
