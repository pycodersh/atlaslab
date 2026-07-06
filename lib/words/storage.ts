/**
 * Saved Words — 단어 저장 (localStorage)
 *
 * 단어 + 출처 문장을 함께 저장한다.
 * 향후 Supabase 동기화 시 이 모듈만 교체하면 된다.
 */

export type WordSourceType = 'story' | 'pattern' | 'example' | 'essay'

export type SavedWord = {
  id:               string           // UUID-like unique key
  word:             string
  meaning?:         string           // optional — 사용자가 직접 입력하거나 AI가 채울 예정
  sourceType:       WordSourceType
  sourceId:         string           // storyId or patternId or essayId (string)
  storyId?:         number
  patternId?:       string
  paragraphId?:     string           // 문단 팝업에서 저장 시
  exampleIndex?:    number           // 패턴 예문에서 저장 시 (0-based)
  originalSentence: string
  savedAt:          string           // ISO
}

const KEY = 'patto-saved-words'

function readAll(): Record<string, SavedWord> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeAll(map: Record<string, SavedWord>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(map))
}

function genId(): string {
  return `w-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/** 저장된 단어 목록 (최근 저장순) */
export function getSavedWords(): SavedWord[] {
  return Object.values(readAll()).sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}

export function isSavedWord(word: string): boolean {
  const lower = word.toLowerCase()
  return Object.values(readAll()).some(w => w.word.toLowerCase() === lower)
}

export function saveWord(item: Omit<SavedWord, 'id' | 'savedAt'>): SavedWord {
  const map = readAll()
  const entry: SavedWord = { ...item, id: genId(), savedAt: new Date().toISOString() }
  map[entry.id] = entry
  writeAll(map)
  return entry
}

export function removeSavedWord(id: string) {
  const map = readAll()
  delete map[id]
  writeAll(map)
}

// ── Saved Phrases ─────────────────────────────────────────────────────────────

export type SavedPhrase = {
  id:               string
  phrase:           string
  phraseType:       string           // 'phrasalVerb' | 'idiom' | 'chunk' | etc.
  meaning?:         string
  sourceType:       WordSourceType
  sourceId:         string
  storyId?:         number
  patternId?:       string
  paragraphId?:     string
  exampleIndex?:    number
  originalSentence: string
  savedAt:          string           // ISO
}

const PHRASE_KEY = 'patto-saved-phrases'

function readPhrases(): Record<string, SavedPhrase> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(PHRASE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writePhrases(map: Record<string, SavedPhrase>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PHRASE_KEY, JSON.stringify(map))
}

export function getSavedPhrases(): SavedPhrase[] {
  return Object.values(readPhrases()).sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}

export function isSavedPhrase(phrase: string): boolean {
  const lower = phrase.toLowerCase()
  return Object.values(readPhrases()).some(p => p.phrase.toLowerCase() === lower)
}

export function savePhrase(item: Omit<SavedPhrase, 'id' | 'savedAt'>): SavedPhrase {
  const map = readPhrases()
  const entry: SavedPhrase = { ...item, id: `ph-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, savedAt: new Date().toISOString() }
  map[entry.id] = entry
  writePhrases(map)
  return entry
}

export function removeSavedPhrase(id: string) {
  const map = readPhrases()
  delete map[id]
  writePhrases(map)
}
