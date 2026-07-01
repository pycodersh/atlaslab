// ── Editor Notes Read Tracking ────────────────────────────────────────────────
const KEY = 'patto:editor:read'

function load(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set()
  } catch {
    return new Set()
  }
}

function save(s: Set<number>) {
  localStorage.setItem(KEY, JSON.stringify([...s]))
}

export function markNoteRead(id: number): void {
  const s = load()
  s.add(id)
  save(s)
}

export function getReadNoteIds(): number[] {
  return [...load()].sort((a, b) => a - b)
}

export function isNoteRead(id: number): boolean {
  return load().has(id)
}

export function getReadCount(): number {
  return load().size
}

export function getNextUnreadId(totalNotes = 30): number {
  const read = load()
  for (let i = 1; i <= totalNotes; i++) {
    if (!read.has(i)) return i
  }
  return 1  // all read → back to first
}
