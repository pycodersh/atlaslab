const ESSAYS_KEY = 'patto-essays'
const REVIEW_DAY_KEY = 'patto-essay-review-day'
const REVIEW_COUNT_KEY = 'patto-essay-review-count'

export const MAX_DAILY_REVIEWS = 3

export type AnnotationType = 'grammar' | 'expression' | 'strength'

export type Annotation = {
  type: AnnotationType
  fragment: string      // exact text to mark in the essay
  replacement?: string  // for grammar/expression fixes
  note: string          // editor's handwritten note
}

export type TypicalMistake = {
  rule: string        // "Capitalize the first word of every sentence."
  examples?: string[] // ["hello → Hello", "we went → We went"]
}

export type EditorReview = {
  detectedStyle: string
  annotations: Annotation[]
  editorComment: string
  nextChallenge: string | string[]  // string[] new format; string for legacy
  typicalMistakes?: TypicalMistake[]
  suggestedVersion?: string
  createdAt: string
}

export type Essay = {
  id: string
  title: string
  body: string
  createdAt: string
  review: EditorReview | null
}

function readAll(): Record<string, Essay> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(ESSAYS_KEY) ?? '{}') } catch { return {} }
}

function writeAll(map: Record<string, Essay>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(ESSAYS_KEY, JSON.stringify(map))
}

export function getEssays(): Essay[] {
  return Object.values(readAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getEssay(id: string): Essay | null {
  return readAll()[id] ?? null
}

export function saveEssay(data: Pick<Essay, 'title' | 'body'>): Essay {
  const map = readAll()
  const id = `essay-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const essay: Essay = {
    id,
    title: data.title.trim() || 'Untitled',
    body: data.body,
    createdAt: new Date().toISOString(),
    review: null,
  }
  map[id] = essay
  writeAll(map)
  return essay
}

export function updateEssay(id: string, patch: Partial<Pick<Essay, 'title' | 'body'>>): Essay | null {
  const map = readAll()
  if (!map[id]) return null
  map[id] = { ...map[id], ...patch }
  writeAll(map)
  return map[id]
}

export function saveReview(id: string, review: EditorReview): Essay | null {
  const map = readAll()
  if (!map[id]) return null
  map[id] = { ...map[id], review }
  writeAll(map)
  return map[id]
}

export function deleteEssay(id: string): void {
  const map = readAll()
  delete map[id]
  writeAll(map)
}

// ── Daily review limit ────────────────────────────────────────────────────────

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getDailyReviewCount(): number {
  if (typeof window === 'undefined') return 0
  const savedDay = localStorage.getItem(REVIEW_DAY_KEY)
  if (savedDay !== todayStr()) return 0
  return Number(localStorage.getItem(REVIEW_COUNT_KEY) ?? '0')
}

export function canReview(): boolean {
  return getDailyReviewCount() < MAX_DAILY_REVIEWS
}

export function incrementDailyReviewCount(): void {
  if (typeof window === 'undefined') return
  const today = todayStr()
  const savedDay = localStorage.getItem(REVIEW_DAY_KEY)
  const count = savedDay === today ? Number(localStorage.getItem(REVIEW_COUNT_KEY) ?? '0') : 0
  localStorage.setItem(REVIEW_DAY_KEY, today)
  localStorage.setItem(REVIEW_COUNT_KEY, String(count + 1))
}

export function resetDailyReviewCount(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(REVIEW_DAY_KEY)
  localStorage.removeItem(REVIEW_COUNT_KEY)
}
