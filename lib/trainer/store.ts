import type { SessionProgress, PaceData } from './types'

const SESSION_KEY = (id: number) => `patto-trainer-session-${id}`
const PACE_KEY    = (id: number) => `patto-trainer-pace-${id}`
const SESSION_TTL_MS = 24 * 60 * 60 * 1000  // 24h

export function saveSessionProgress(p: SessionProgress) {
  try { localStorage.setItem(SESSION_KEY(p.storyId), JSON.stringify(p)) } catch {}
}

export function loadSessionProgress(storyId: number): SessionProgress | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY(storyId))
    if (!raw) return null
    const p = JSON.parse(raw) as SessionProgress
    if (Date.now() - p.savedAt > SESSION_TTL_MS) { clearSessionProgress(storyId); return null }
    return p
  } catch { return null }
}

export function clearSessionProgress(storyId: number) {
  try { localStorage.removeItem(SESSION_KEY(storyId)) } catch {}
}

export function recordPaceSample(storyId: number, responseMs: number) {
  try {
    const raw  = localStorage.getItem(PACE_KEY(storyId))
    const prev = raw ? (JSON.parse(raw) as PaceData) : null
    const count = (prev?.sessionCount ?? 0) + 1
    const avg   = prev ? Math.round((prev.avgResponseMs * prev.sessionCount + responseMs) / count) : responseMs
    const next: PaceData = { storyId, avgResponseMs: avg, sessionCount: count, lastUpdated: Date.now() }
    localStorage.setItem(PACE_KEY(storyId), JSON.stringify(next))
  } catch {}
}

export function loadPaceData(storyId: number): PaceData | null {
  try {
    const raw = localStorage.getItem(PACE_KEY(storyId))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

/** Wait duration before "Need another listen?" fires (adapts to user pace, min 4s, max 8s) */
export function waitDurationMs(storyId: number): number {
  const pace = loadPaceData(storyId)
  if (!pace || pace.sessionCount < 4) return 5000
  return Math.min(8000, Math.max(4000, pace.avgResponseMs * 1.5))
}
