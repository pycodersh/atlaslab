import { getPlan, FREE_REVIEW_LIFETIME, PREMIUM_REVIEW_DAILY } from '@/lib/subscription/storage'

const ESSAYS_KEY    = 'patto-essays'
const DRAFT_KEY     = 'patto-essay-draft'
const REVIEW_DAY_KEY        = 'patto-essay-review-day'
const REVIEW_COUNT_KEY      = 'patto-essay-review-count'
const FREE_REVIEW_TOTAL_KEY = 'patto-essay-free-reviews-total'

export const MAX_DAILY_REVIEWS = PREMIUM_REVIEW_DAILY

// 'typical' = recurring mechanical error (first occurrence only, marked ★ Typ.)
export type AnnotationType = 'grammar' | 'expression' | 'strength' | 'typical'

export type Annotation = {
  type: AnnotationType
  fragment: string      // exact text to mark in the essay
  replacement?: string  // corrected form (grammar / expression / typical)
  note: string          // editor's handwritten note
}

export type EditorReview = {
  detectedStyle: string
  annotations: Annotation[]
  editorComment: string
  nextChallenge: string | string[]  // string[] new format; string for legacy
  suggestedVersion?: string
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

export function getEssays(): Essay[] {
  return Object.values(readAll())
    .map(e => ({ ...e, status: e.status ?? (e.review ? 'reviewed' : 'saved') as Essay['status'] }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getEssay(id: string): Essay | null {
  const e = readAll()[id] ?? null
  if (!e) return null
  return { ...e, status: e.status ?? (e.review ? 'reviewed' : 'saved') }
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
  const savedDay = localStorage.getItem(REVIEW_DAY_KEY)
  if (savedDay !== todayStr()) return 0
  return Number(localStorage.getItem(REVIEW_COUNT_KEY) ?? '0')
}

export function getFreeReviewTotal(): number {
  if (typeof window === 'undefined') return 0
  return Number(localStorage.getItem(FREE_REVIEW_TOTAL_KEY) ?? '0')
}

function incrementFreeReviewTotal(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(FREE_REVIEW_TOTAL_KEY, String(getFreeReviewTotal() + 1))
}

export function canReview(): boolean {
  const plan = getPlan()
  if (plan === 'premium') return getDailyReviewCount() < PREMIUM_REVIEW_DAILY
  return getFreeReviewTotal() < FREE_REVIEW_LIFETIME
}

export function getReviewsRemaining(): number {
  const plan = getPlan()
  if (plan === 'premium') return Math.max(0, PREMIUM_REVIEW_DAILY - getDailyReviewCount())
  return Math.max(0, FREE_REVIEW_LIFETIME - getFreeReviewTotal())
}

export function recordReviewUsed(): void {
  const plan = getPlan()
  if (plan === 'free') {
    incrementFreeReviewTotal()
  } else {
    incrementDailyReviewCount()
  }
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
