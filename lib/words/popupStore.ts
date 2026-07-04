import type { WordSourceType } from './storage'

export type PopupItem = {
  word:             string
  originalSentence: string
  sourceType:       WordSourceType
  sourceId:         string
  storyId?:         number
  patternId?:       string
  paragraphId?:     string
  exampleIndex?:    number
}

type Listener = (item: PopupItem | null) => void

let _item: PopupItem | null = null
const _listeners = new Set<Listener>()

export function openSavePopup(item: PopupItem) {
  _item = item
  _listeners.forEach(l => l(_item))
}

export function closeSavePopup() {
  _item = null
  _listeners.forEach(l => l(null))
}

/** Subscribe; returns unsubscribe fn. Immediately calls listener with current state. */
export function subscribeSavePopup(listener: Listener): () => void {
  _listeners.add(listener)
  listener(_item)
  return () => _listeners.delete(listener)
}
