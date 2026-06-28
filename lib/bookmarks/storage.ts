/**
 * 패턴 북마크 (게스트: localStorage)
 *
 * 패턴 카드의 북마크를 저장하고, Progress 화면의 "Pattern Library"에서 조회한다.
 * 향후 Supabase 동기화 시 이 모듈만 교체하면 된다.
 */

export type BookmarkedPattern = {
  patternId: string
  pattern: string
  meaningKo: string
  storyId: number
  savedAt: string // ISO
}

const KEY = 'patto-bookmarks'

function readAll(): Record<string, BookmarkedPattern> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeAll(map: Record<string, BookmarkedPattern>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(map))
}

/** 저장된 북마크 목록 (최근 저장순) */
export function getBookmarks(): BookmarkedPattern[] {
  return Object.values(readAll()).sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}

export function isBookmarked(patternId: string): boolean {
  return !!readAll()[patternId]
}

export function removeBookmark(patternId: string) {
  const map = readAll()
  delete map[patternId]
  writeAll(map)
}

/** 북마크 토글 — 새 상태(true=저장됨)를 반환 */
export function toggleBookmark(item: Omit<BookmarkedPattern, 'savedAt'>): boolean {
  const map = readAll()
  if (map[item.patternId]) {
    delete map[item.patternId]
    writeAll(map)
    return false
  }
  map[item.patternId] = { ...item, savedAt: new Date().toISOString() }
  writeAll(map)
  return true
}
