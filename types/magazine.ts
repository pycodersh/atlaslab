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
  poster?: string           // 영상 로딩 전 표시할 이미지
  credit?: string           // "Video by Creator on Pexels"
  pexelsUrl?: string        // 원본 Pexels 페이지 URL
  keywords?: string[]       // 관리자 검색 시 사용할 키워드
  durationSec?: number      // 영상 길이 (참고용)
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
  imageUrl: string          // fallback / primary
  imageAlt: string
  imagePool?: StoryImage[]  // 3장 랜덤 풀 — 있으면 세션마다 랜덤 선택
  storyNote?: string
  highlightPhrases: string[]
  paragraphs: MagazineParagraph[]
  patterns: MagazinePattern[]
  ambienceId?: AmbienceId
  introVideo?: IntroVideo
  scenePractice?: ScenePractice
}
