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
  meaning?:         string           // legacy Korean meaning / fallback
  translations?:    Partial<Record<string, string>>  // lang → meaning (cache)
  sourceType:       WordSourceType
  sourceId:         string           // storyId or patternId or essayId (string)
  storyId?:         number
  patternId?:       string
  paragraphId?:     string           // 문단 팝업에서 저장 시
  exampleIndex?:    number           // 패턴 예문에서 저장 시 (0-based)
  originalSentence: string
  savedAt:          string           // ISO
}

import { getPlan, FREE_WORD_LIMIT } from '@/lib/subscription/storage'
import { lookupMeaning, normalizeWord } from '@/data/patto-dictionary'
import { lookupPhraseMeaning } from '@/data/patto-phrase-dictionary'
import { upsertCacheEntry, getCacheEntry } from '@/lib/saved/translationCache'

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

export function getSavedWordCount(): number {
  return Object.keys(readAll()).length
}

export function canSaveWord(): boolean {
  if (getPlan() === 'premium') return true
  return getSavedWordCount() < FREE_WORD_LIMIT
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
  const dictMeaning = item.meaning ?? lookupMeaning(normalizeWord(item.word))

  // Merge existing cache translations so re-saves reuse prior API calls
  const cached = getCacheEntry('word', item.word)
  const translations = { ...(cached?.translations ?? {}), ...(item.translations ?? {}) }
  if (dictMeaning) translations.ko = translations.ko ?? dictMeaning

  // Persist to translation cache
  if (Object.keys(translations).length) upsertCacheEntry('word', item.word, translations)

  const map = readAll()
  const entry: SavedWord = {
    ...item,
    meaning: dictMeaning,
    translations,
    id: genId(),
    savedAt: new Date().toISOString(),
  }
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
  meaning?:         string           // legacy Korean meaning / fallback
  translations?:    Partial<Record<string, string>>  // lang → meaning (cache)
  meaningSource?:   'dictionary' | 'sentence'  // where meaning came from
  needsMeaningReview?: boolean                 // true if sentence fallback used
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
  const dictEntry = lookupPhraseMeaning(item.phrase)
  let meaning: string | undefined
  let meaningSource: 'dictionary' | 'sentence' | undefined
  let needsMeaningReview: boolean | undefined
  if (dictEntry) {
    meaning = dictEntry.meaning
    meaningSource = 'dictionary'
  } else if (item.meaning) {
    meaning = item.meaning
    meaningSource = 'sentence'
    needsMeaningReview = true
  }

  // Merge existing cache translations so re-saves reuse prior API calls
  const cached = getCacheEntry('phrase', item.phrase)
  const translations = { ...(cached?.translations ?? {}), ...(item.translations ?? {}) }
  if (meaning) translations.ko = translations.ko ?? meaning

  if (Object.keys(translations).length) upsertCacheEntry('phrase', item.phrase, translations)

  const entry: SavedPhrase = {
    ...item,
    meaning,
    translations,
    meaningSource,
    needsMeaningReview,
    id: `ph-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    savedAt: new Date().toISOString(),
  }
  map[entry.id] = entry
  writePhrases(map)
  return entry
}

export function removeSavedPhrase(id: string) {
  const map = readPhrases()
  delete map[id]
  writePhrases(map)
}
