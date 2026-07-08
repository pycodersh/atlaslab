import { getPlan, FREE_REVIEW_DAILY, PREMIUM_REVIEW_DAILY } from '@/lib/subscription/storage'
import { migrateAnnotations } from './migration'

const ESSAYS_KEY       = 'patto-essays'
const DRAFT_KEY        = 'patto-essay-draft'
const REVIEW_DAY_KEY   = 'patto-essay-review-day'
const REVIEW_COUNT_KEY = 'patto-essay-review-count'

export const MAX_DAILY_REVIEWS = PREMIUM_REVIEW_DAILY

// 'typical' = recurring mechanical error (first occurrence only, marked ★ Typ.)
export type AnnotationType = 'grammar' | 'expression' | 'strength' | 'typical'

/**
 * Grammar sub-types drive the visual style in EssayRenderer.
 * Renderer applies Controlled Random from a per-subType style pool.
 * Old annotations without subType fall back to 'circle' style.
 *
 * circle-pool  → tense / agreement / verbForm
 * replace-pool → article / preposition / vocabulary / vocab (legacy)
 * insert-pool  → missing
 * single-style → spelling / punctuation / capitalization / wordOrder
 */
export type AnnotationSubType =
  | 'tense'           // wrong tense / tense sequence
  | 'agreement'       // subject-verb agreement
  | 'verbForm'        // infinitive / gerund / past participle
  | 'article'         // a / an / the
  | 'preposition'     // wrong preposition
  | 'vocabulary'      // wrong word choice
  | 'vocab'           // legacy alias — renderer treats same as vocabulary
  | 'missing'         // word entirely missing from sentence
  | 'spelling'        // misspelling
  | 'punctuation'     // wrong / missing punctuation
  | 'capitalization'  // wrong capitalization
  | 'wordOrder'       // word order error

export type Annotation = {
  type: AnnotationType
  subType?: AnnotationSubType  // optional — old data without it falls back to circle
  fragment: string      // exact text to mark in the essay
  replacement?: string  // corrected form (grammar / expression / typical)
  note: string          // editor's handwritten note
}

export type VocabItem   = { word: string; meaning: string; example: string }
export type ChunkItem   = { expression: string; usage: string }
export type GrammarTip  = { point: string; explanation: string; example: string }

export type EditorReview = {
  detectedStyle: string
  annotations: Annotation[]
  editorComment: string          // legacy / fallback
  commentStrengths?: string[]    // structured comment: what went well
  commentImprovements?: string[] // structured comment: what to work on
  commentOverall?: string        // structured comment: warm wrap-up sentence
  nextChallenge: string | string[]
  suggestedVersion?: string
  oneLineAdvice?: string
  score?: number                 // 0-100 overall score
  vocabulary?: VocabItem[]       // 5-10 key words/expressions
  usefulChunks?: ChunkItem[]     // 5-8 natural expressions/patterns
  grammarTips?: GrammarTip[]     // key grammar points from this essay
  createdAt: string
}

export type Essay = {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt?: string
  status: 'saved' | 'reviewed'
  review: EditorReview | null
}

// ── Draft — max 1, explicitly saved only (no auto-save) ──────────────────────

export type EssayDraft = { title: string; body: string }

export function getDraft(): EssayDraft | null {
  if (typeof window === 'undefined') return null
  try {
    // Also migrate old patto_essay_draft key (underscore) from prior version
    const legacy = localStorage.getItem('patto_essay_draft')
    if (legacy) {
      try {
        const { title, body } = JSON.parse(legacy) as { title?: string; body?: string }
        if (body) {
          const draft = { title: title ?? '', body }
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
          localStorage.removeItem('patto_essay_draft')
          return draft
        }
      } catch { /* ignore */ }
      localStorage.removeItem('patto_essay_draft')
    }
    const s = localStorage.getItem(DRAFT_KEY)
    return s ? (JSON.parse(s) as EssayDraft) : null
  } catch { return null }
}

export function saveDraft(d: EssayDraft): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(DRAFT_KEY, JSON.stringify(d))
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DRAFT_KEY)
  localStorage.removeItem('patto_essay_draft') // legacy
}

// ── Essays ────────────────────────────────────────────────────────────────────

function readAll(): Record<string, Essay> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(ESSAYS_KEY) ?? '{}') } catch { return {} }
}

function writeAll(map: Record<string, Essay>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(ESSAYS_KEY, JSON.stringify(map))
}

// Run migration on a single essay in-place. Returns true if anything changed.
function applyMigration(essay: Essay, map: Record<string, Essay>): boolean {
  if (!essay.review?.annotations?.length) return false
  const { annotations, changed } = migrateAnnotations(essay.review.annotations)
  if (!changed) return false
  essay.review = { ...essay.review, annotations }
  map[essay.id] = essay
  return true
}

export function getEssays(): Essay[] {
  const map = readAll()
  let dirty = false
  const essays = Object.values(map).map(e => {
    const essay: Essay = { ...e, status: e.status ?? (e.review ? 'reviewed' : 'saved') as Essay['status'] }
    if (applyMigration(essay, map)) dirty = true
    return essay
  })
  if (dirty) writeAll(map)
  return essays.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getEssay(id: string): Essay | null {
  const map = readAll()
  const e = map[id] ?? null
  if (!e) return null
  const essay: Essay = { ...e, status: e.status ?? (e.review ? 'reviewed' : 'saved') as Essay['status'] }
  if (applyMigration(essay, map)) writeAll(map)
  return essay
}

export function saveEssay(data: Pick<Essay, 'title' | 'body'>): Essay {
  const map = readAll()
  const id = `essay-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const essay: Essay = {
    id,
    title: data.title.trim() || autoTitle(data.body) || 'Untitled',
    body: data.body,
    createdAt: new Date().toISOString(),
    status: 'saved',
    review: null,
  }
  map[id] = essay
  writeAll(map)
  return essay
}

export function updateEssay(id: string, patch: Partial<Pick<Essay, 'title' | 'body'>>): Essay | null {
  const map = readAll()
  if (!map[id]) return null
  const prev = map[id]
  map[id] = {
    ...prev,
    ...patch,
    title: (patch.title !== undefined ? patch.title.trim() : prev.title) || autoTitle(patch.body ?? prev.body) || 'Untitled',
    updatedAt: new Date().toISOString(),
  }
  writeAll(map)
  return map[id]
}

export function saveReview(id: string, review: EditorReview): Essay | null {
  const map = readAll()
  if (!map[id]) return null
  map[id] = { ...map[id], review, status: 'reviewed', updatedAt: new Date().toISOString() }
  writeAll(map)
  return map[id]
}

export function deleteEssay(id: string): void {
  const map = readAll()
  delete map[id]
  writeAll(map)
}

// ── Auto-title from first sentence ───────────────────────────────────────────

export function autoTitle(body: string): string {
  const first = body.trim().split(/[.!?\n]/)[0].trim()
  if (!first) return ''
  return first.length > 60 ? first.slice(0, 57) + '…' : first
}

// ── Daily review limit ────────────────────────────────────────────────────────

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getDailyReviewCount(): number {
  if (typeof window === 'undefined') return 0
  try {
    const savedDay = localStorage.getItem(REVIEW_DAY_KEY)
    const today    = todayStr()
    // Different day → count is 0 (reset happens lazily in incrementDailyReviewCount)
    if (!savedDay || savedDay !== today) return 0
    const raw   = localStorage.getItem(REVIEW_COUNT_KEY)
    const count = Number(raw)
    // Guard against corrupted values (NaN, negative, non-integer)
    if (!Number.isFinite(count) || count < 0) {
      localStorage.removeItem(REVIEW_COUNT_KEY)
      return 0
    }
    return Math.floor(count)
  } catch {
    return 0
  }
}

export type CanReviewResult =
  | { allowed: true;  count: number; limit: number; date: string }
  | { allowed: false; reason: 'daily_limit'; count: number; limit: number; date: string }

export function canReview(): CanReviewResult {
  const plan  = getPlan()
  const limit = plan === 'premium' ? PREMIUM_REVIEW_DAILY : FREE_REVIEW_DAILY
  const count = getDailyReviewCount()
  const date  = todayStr()
  if (count < limit) return { allowed: true,  count, limit, date }
  return { allowed: false, reason: 'daily_limit', count, limit, date }
}

export function getReviewsRemaining(): number {
  const plan  = getPlan()
  const limit = plan === 'premium' ? PREMIUM_REVIEW_DAILY : FREE_REVIEW_DAILY
  return Math.max(0, limit - getDailyReviewCount())
}

// Called after a successful review to update the local UI counter.
// The server is authoritative; this is only for immediate UI feedback.
export function recordReviewUsed(): void {
  incrementDailyReviewCount()
}

export function incrementDailyReviewCount(): void {
  if (typeof window === 'undefined') return
  try {
    const today    = todayStr()
    const savedDay = localStorage.getItem(REVIEW_DAY_KEY)
    const raw      = savedDay === today ? localStorage.getItem(REVIEW_COUNT_KEY) : null
    const prev     = Number(raw)
    const count    = Number.isFinite(prev) && prev >= 0 ? Math.floor(prev) : 0
    localStorage.setItem(REVIEW_DAY_KEY, today)
    localStorage.setItem(REVIEW_COUNT_KEY, String(count + 1))
  } catch { /* localStorage unavailable — ignore */ }
}

export function resetDailyReviewCount(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(REVIEW_DAY_KEY)
  localStorage.removeItem(REVIEW_COUNT_KEY)
}
