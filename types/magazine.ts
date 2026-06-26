export type MagazineParagraph = {
  id: string
  english: string
  koreanTranslation: string
  keyExpressions: string[]
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

export type MagazineStory = {
  id: number
  title: string
  subtitleKo: string
  imageUrl: string
  imageAlt: string
  storyNote?: string
  highlightPhrases: string[]
  paragraphs: MagazineParagraph[]
  patterns: MagazinePattern[]
  ambienceId?: AmbienceId
}
