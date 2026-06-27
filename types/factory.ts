/**
 * PATTO Story Factory — 타입 시스템
 *
 * 목표: 800개 Story / 4,000개 Pattern을 동일한 품질로 생산
 * 방식: AI가 StoryPackage를 생성 → DB에 저장 → Story Reader에 제공
 */

// ── 난이도 / 분류 ──────────────────────────────────────────────────────────────

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type StoryTheme =
  | 'friendship' | 'travel' | 'work' | 'family'
  | 'restaurant' | 'shopping' | 'daily-life' | 'romance'
  | 'health' | 'education' | 'technology' | 'nature'
  | 'city' | 'celebration' | 'loss' | 'growth'

export type StoryMood =
  | 'warm' | 'humorous' | 'nostalgic' | 'exciting'
  | 'peaceful' | 'bittersweet' | 'motivating' | 'reflective'

// ── Metadata ───────────────────────────────────────────────────────────────────

export type StoryMetadata = {
  title: string
  titleKo: string
  theme: StoryTheme
  mood: StoryMood
  difficulty: CEFRLevel
  languageLevel: CEFRLevel   // 실제 텍스트 기준 (theme과 다를 수 있음)
  estimatedMinutes: number   // 읽기 소요 시간 추정 (분)
  sceneCount: number
  patternCount: number       // 항상 5
  tags: string[]             // 검색/필터용
  targetAudience?: string    // 예: 'beginner adult learners'
  setting: string            // 배경 장소/상황 한 줄 요약
}

// ── Paragraph ─────────────────────────────────────────────────────────────────

export type FactoryParagraph = {
  id: string                 // 예: 'p{storyId}-{n}'
  english: string
  koreanTranslation: string
  keyExpressions: string[]   // 이 단락에서 가장 중요한 표현 1~2개
}

// ── Pattern ───────────────────────────────────────────────────────────────────

export type FactoryPattern = {
  id: string                 // 예: 'pt{storyId}-{n}'
  pattern: string            // 예: 'I want to ~.'
  meaningKo: string          // 예: '~하고 싶다'
  explanation: string        // 한국어 설명 (3줄 이내, \n 구분)
  storySentence: string      // Story 안 실제 문장
  storySentenceKo: string
  variationSentence: string  // 응용 예문
  variationSentenceKo: string
  examples: {
    en: string
    ko: string
  }[]                        // 5개 고정
}

// ── Scene ─────────────────────────────────────────────────────────────────────

export type FactoryScene = {
  id: string                 // 예: 's{storyId}-{n}'
  title: string              // 영어 장면 제목
  titleKo: string            // 한국어 장면 제목
  summary: string            // 1~2문장 장면 요약 (AI 생성 시 컨텍스트용)
  paragraphIds: string[]     // 이 Scene에 포함된 paragraph ID
  patternIds: string[]       // 이 Scene에서 주로 등장하는 pattern ID

  // AI 생성 프롬프트
  imagePrompt: string        // Midjourney / Flux / DALL-E 등
  videoPrompt: string        // Runway / Google Veo / Kling / Pika / Luma 등
  ambiencePrompt: string     // ElevenLabs Sound Effects / AI 환경음 등
}

// ── Scene Video ───────────────────────────────────────────────────────────────

export type SceneVideoStatus = 'missing' | 'generating' | 'ready'

export type FactorySceneVideo = {
  status: SceneVideoStatus
  url: string                // 로컬: /videos/story{id}-scene.mp4
  poster?: string            // 영상 없을 때 대체 이미지
  prompt: string             // 생성에 사용된 videoPrompt
  source?: 'ai' | 'pexels' | 'local'
  generatedAt?: string       // ISO date — AI 생성 일시
  model?: string             // 예: 'runway-gen3', 'google-veo-2', 'kling-1.5'
}

// ── TTS Queue ─────────────────────────────────────────────────────────────────

export type TTSStatus = 'pending' | 'generated' | 'error'

export type TTSQueueItem = {
  paragraphId: string
  text: string
  voice: string              // 예: 'us-female'
  status: TTSStatus
  audioUrl?: string          // Supabase Storage URL
  generatedAt?: string
}

// ── Story Package ─────────────────────────────────────────────────────────────
// PATTO DB에 저장되는 단위. JSON 하나 = Story 하나.

export type StoryPackage = {
  version: '1.0'
  packageId: string          // 예: 'story-001'
  generatedAt: string        // ISO date
  generatedBy?: string       // 예: 'claude-opus-4', 'gpt-4o', 'human'

  metadata: StoryMetadata

  story: {
    id: number
    title: string
    subtitleKo: string
    storyNote?: string
    highlightPhrases: string[]
    ambienceId?: string      // Web Audio 합성 환경음 ID
    sceneVideo: FactorySceneVideo
    ambience?: {
      enabled: boolean
      url: string
      type: string
      volume: number
      label: string
    }
  }

  paragraphs: FactoryParagraph[]
  scenes: FactoryScene[]
  patterns: FactoryPattern[]
  ttsQueue: TTSQueueItem[]
}

// ── Factory Generator 출력 타입 ───────────────────────────────────────────────
// 각 Generator는 독립적으로 호출 가능

export type StoryGeneratorOutput = {
  title: string
  titleKo: string
  storyNote: string
  highlightPhrases: string[]
  paragraphs: Omit<FactoryParagraph, 'id'>[]
}

export type SceneGeneratorOutput = {
  scenes: (Omit<FactoryScene, 'id' | 'imagePrompt' | 'videoPrompt' | 'ambiencePrompt'> & {
    paragraphIndexes?: number[]  // AI가 index로 반환할 경우 (0-based)
  })[]
}

export type PatternExtractorOutput = {
  patterns: Omit<FactoryPattern, 'id'>[]
}

export type PromptGeneratorOutput = {
  scenes: Pick<FactoryScene, 'id' | 'imagePrompt' | 'videoPrompt' | 'ambiencePrompt'>[]
}

export type ExampleGeneratorOutput = {
  patternId: string
  examples: { en: string; ko: string }[]
}[]

export type MetadataGeneratorOutput = StoryMetadata
