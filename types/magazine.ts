export type ParagraphMediaType = 'image' | 'video' | 'animation'

export type ParagraphMedia = {
  type: ParagraphMediaType
  imageUrl?: string
  imageAlt?: string
  videoUrl?: string
  poster?: string
}

export type MagazineParagraph = {
  id: string
  english: string
  koreanTranslation: string
  keyExpressions: string[]
  media?: ParagraphMedia
}

export type MagazinePattern = {
  id: string
  pattern: string
  meaningKo: string
  storySentence: string
  storySentenceKo: string
  variationSentence: string
  variationSentenceKo: string
  explanation?: string
  examples?: { en: string; ko: string }[]
}

export type AmbienceId =
  | 'rain' | 'forest' | 'ocean' | 'cafe' | 'city'
  | 'night' | 'fireplace' | 'wind' | 'library' | 'train'

export type StoryImage = {
  url: string
  alt: string
}

export type IntroVideoSource = 'pexels' | 'local' | 'ai'

export type IntroVideo = {
  enabled: boolean
  source: IntroVideoSource
  url: string
  poster?: string
  credit?: string
  pexelsUrl?: string
  keywords?: string[]
  durationSec?: number
}

export type SceneVideoStatus = 'ready' | 'missing' | 'generating'

export type SceneVideo = {
  status: SceneVideoStatus   // 'ready'일 때만 <video> 렌더링
  url: string                // AI 영상 경로 (예: /videos/story1-scene.mp4)
  poster?: string            // 영상 없을 때 대체 이미지 URL
  prompt?: string            // 이 영상 생성에 사용된 videoPrompt
  source?: 'ai' | 'pexels' | 'local' | 'test'
  credit?: string
}

export type AmbienceType =
  | 'party' | 'home' | 'rain' | 'cafe'
  | 'station' | 'train' | 'city' | 'night'

export type StoryAmbience = {
  enabled: boolean
  url: string              // 로컬 파일: /audio/ambience/xxx.mp3
  type: AmbienceType
  volume?: number          // 기본값 0.25
  label?: string
}

// ── Scene 구조 ─────────────────────────────────────────────────────────────────
// AI Scene Video 생성을 위한 콘텐츠 단위.
// paragraphs/patterns는 UI가 그대로 사용하고,
// scenes는 AI 이미지·영상·환경음 생성의 기준 단위가 된다.

export type SceneMediaType = 'image' | 'video' | 'animation' | 'none'

export type SceneMedia = {
  type: SceneMediaType
  imageUrl?: string
  videoUrl?: string
  poster?: string
}

export type MagazineScene = {
  id: string                // 예: 's1-1', 's1-2'
  title: string             // 예: 'Friday Evening on the Train'
  titleKo?: string          // 예: '금요일 저녁 기차 안'
  paragraphIds: string[]    // 이 Scene에 속하는 paragraph ID 목록
  patternIds?: string[]     // 이 Scene에서 학습하는 pattern ID 목록
  media?: SceneMedia        // 현재 미디어 (없으면 생성 대기)

  // AI 생성 프롬프트 — 향후 버튼 하나로 영상·이미지·환경음 생성
  imagePrompt?: string      // Midjourney / Flux / DALL-E 등
  videoPrompt?: string      // Runway / Google Veo / Kling / Pika / Luma 등
  ambiencePrompt?: string   // ElevenLabs Sound Effects / AI Sound 등
}

// ── Legacy (사용 중단 예정) ─────────────────────────────────────────────────────

export type ScenePracticeSubtitle = {
  id: string
  start: number
  end: number
  en: string
  ko: string
  patternId?: string
}

export type ScenePractice = {
  enabled: boolean
  videoUrl: string
  poster?: string
  title: string
  description: string
  subtitles: ScenePracticeSubtitle[]
}

// ── Story ──────────────────────────────────────────────────────────────────────

export type MagazineStory = {
  id: number
  title: string
  subtitleKo: string
  imageUrl: string
  imageAlt: string
  imagePool?: StoryImage[]
  storyNote?: string
  highlightPhrases: string[]
  paragraphs: MagazineParagraph[]   // UI 렌더링 기준
  patterns: MagazinePattern[]       // UI 렌더링 기준
  ambienceId?: AmbienceId           // Web Audio 합성 환경음 ID
  sceneVideo?: SceneVideo           // Scene First 대표 영상
  ambience?: StoryAmbience          // HTML audio 환경음 (→ Web Audio 폴백)
  scenes?: MagazineScene[]          // Scene 단위 구조 (AI 영상 생성 기준)
  videoPrompt?: string              // Story 전체 영상 프롬프트 (장기 보관)
  introVideo?: IntroVideo
  scenePractice?: ScenePractice
}
