'use client'

import { useSyncExternalStore } from 'react'

/**
 * 로그인 없는 북마크 · 좋아요 (localStorage 전용, 서버에 아무것도 보내지 않는다).
 *
 * 대상은 사이트 콘텐츠(블로그 가이드 글, K-PATTO 표현 페이지)다.
 * 앱 학습 흐름의 저장(lib/bookmarks, lib/kpatto/saved-expressions)과는 따로 둔다 —
 * 그쪽은 앱 내부 ID·DB 동기화를 다루고, 여기는 "이 페이지"를 URL 단위로 기억한다.
 *
 * 탭 사이 동기화: 다른 탭은 storage 이벤트, 같은 탭은 커스텀 이벤트로 알린다.
 */

export type SaveKind = 'guide' | 'pattern'

export type SaveItem = {
  /** 'guide:en/k-patto/slug' · 'pattern:slug' 처럼 종류가 앞에 붙은 고유 키 */
  id: string
  kind: SaveKind
  title: string
  href: string
  desc?: string
}

export type Bookmark = SaveItem & { savedAt: string }

type SavesState = {
  bookmarks: Record<string, Bookmark>
  likes: Record<string, string>   // id → likedAt
}

const KEY = 'atlas-saves'
const EVENT = 'atlas-saves-change'
const EMPTY: SavesState = { bookmarks: {}, likes: {} }

// useSyncExternalStore 는 같은 값이면 같은 참조를 돌려받아야 한다 — 원문 문자열로 캐시한다
let cacheRaw: string | null = null
let cacheState: SavesState = EMPTY

function read(): SavesState {
  let raw: string | null = null
  try { raw = localStorage.getItem(KEY) } catch { return EMPTY }
  if (raw === cacheRaw) return cacheState
  cacheRaw = raw
  try {
    const parsed = raw ? JSON.parse(raw) : null
    cacheState = {
      bookmarks: parsed?.bookmarks ?? {},
      likes: parsed?.likes ?? {},
    }
  } catch {
    cacheState = EMPTY
  }
  return cacheState
}

function write(next: SavesState) {
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* 저장 공간 없음·차단 — 화면만 그대로 */ }
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) onChange() }
  window.addEventListener('storage', onStorage)
  window.addEventListener(EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(EVENT, onChange)
  }
}

/** 서버 렌더와 첫 하이드레이션은 빈 상태로 맞추고, 그 뒤 저장값으로 바뀐다 */
export function useSaves(): SavesState {
  return useSyncExternalStore(subscribe, read, () => EMPTY)
}

/** 토글 — 새 상태(true=저장됨)를 돌려준다 */
export function toggleBookmark(item: SaveItem): boolean {
  const cur = read()
  const bookmarks = { ...cur.bookmarks }
  const on = !bookmarks[item.id]
  if (on) bookmarks[item.id] = { ...item, savedAt: new Date().toISOString() }
  else delete bookmarks[item.id]
  write({ ...cur, bookmarks })
  return on
}

export function removeBookmark(id: string) {
  const cur = read()
  if (!cur.bookmarks[id]) return
  const bookmarks = { ...cur.bookmarks }
  delete bookmarks[id]
  write({ ...cur, bookmarks })
}

export function toggleLike(id: string): boolean {
  const cur = read()
  const likes = { ...cur.likes }
  const on = !likes[id]
  if (on) likes[id] = new Date().toISOString()
  else delete likes[id]
  write({ ...cur, likes })
  return on
}

/** 최근 저장순 */
export function sortedBookmarks(state: SavesState): Bookmark[] {
  return Object.values(state.bookmarks).sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}
