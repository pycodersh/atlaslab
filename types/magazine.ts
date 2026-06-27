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

export type SceneVideo = {
  url: string
  poster?: string
  credit?: string
  pexelsUrl?: string
  source?: IntroVideoSource
  scenePrompt?: string
}

export type AmbienceType = 'party' | 'home' | 'rain' | 'cafe' | 'station' | 'train' | 'city' | 'night'

export type StoryAmbience = {
  enabled: boolean
  url: string              // 로컬 파일: /audio/ambience/xxx.mp3
  type: AmbienceType
  volume?: number          // 기본값 0.25
  label?: string
}

export type ScenePracticeSubtitle = {
  id: string
  start: number          // 영상 시작 시각 (초) — v1에서는 참고용
  end: number            // 영상 종료 시각 (초)
  en: string
  ko: string
  patternId?: string     // 연결된 패턴 ID (강조 표시용)
}

export type ScenePractice = {
  enabled: boolean
  videoUrl: string
  poster?: string
  title: string
  description: string
  subtitles: ScenePracticeSubtitle[]
}

export type MagazineStory = {
  id: number
  title: string
  subtitleKo: string
  imageUrl: string
  imageAlt: string
  imagePool?: StoryImage[]
  storyNote?: string
  highlightPhrases: string[]
  paragraphs: MagazineParagraph[]
  patterns: MagazinePattern[]
  ambienceId?: AmbienceId
  sceneVideo?: SceneVideo
  ambience?: StoryAmbience   // Scene 환경음 (HTML audio → Web Audio 폴백)
  videoPrompt?: string       // 향후: AI 영상 생성 프롬프트
  introVideo?: IntroVideo
  scenePractice?: ScenePractice
}
