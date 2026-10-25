import data from './book-patterns.json'
import { versionedExpressionAudio } from './expression-audio'

/**
 * K-PATTO PDF 전자책의 300패턴 (책의 #001~#300 순서 그대로).
 * 책의 ▶ LISTEN 버튼이 /audio/pattern-NNN 으로 오므로 번호·제목·예문·강조가 책과 같아야 한다.
 * book-patterns.json 은 exports/kpatto/pdf-build/export_book_patterns.py 로 만든다 — 손으로 고치지 말 것.
 */
export type BookExample = { ko: string; en: string; hl: string }
export type BookPattern = { no: number; slug: string; pattern: string; english: string; examples: BookExample[] }

export const BOOK_PATTERNS = data as BookPattern[]
export const BOOK_PATTERN_COUNT = BOOK_PATTERNS.length

/** 'pattern-007' → 7. 형식이 다르거나 범위를 벗어나면 null */
export function parsePatternSlug(slug: string): number | null {
  const m = /^pattern-(\d{3})$/.exec(slug)
  if (!m) return null
  const n = Number(m[1])
  return n >= 1 && n <= BOOK_PATTERN_COUNT ? n : null
}

export const patternSlug = (n: number) => `pattern-${String(n).padStart(3, '0')}`

export function bookExampleAudio(slug: string, i: number) {
  return versionedExpressionAudio(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/expressions/${slug}/ex${i + 1}.mp3`,
  )
}
