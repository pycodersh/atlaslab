/**
 * Module-level audio ownership coordinator.
 *
 * Only one audio source can "own" playback at a time.
 * When a new owner claims playback, the previous owner is interrupted.
 */

interface AudioEntry {
  id: string
  /** Called when another source claims ownership — component must stop itself */
  onInterrupt: () => void
}

let current: AudioEntry | null = null
let _isActive = false

const listeners = new Set<() => void>()

function notify() {
  listeners.forEach(fn => fn())
}

/** Claim playback ownership. Interrupts the previous owner if different. */
export function coordinatorClaim(id: string, onInterrupt: () => void): void {
  if (current && current.id !== id) {
    current.onInterrupt()
  }
  current = { id, onInterrupt }
  _isActive = true
  notify()
}

/** Notify the coordinator that this id's playback has ended naturally. */
export function coordinatorEnded(id: string): void {
  if (current?.id === id) {
    current = null
    _isActive = false
    notify()
  }
}

/** Notify the coordinator that this id has paused (still owns audio). */
export function coordinatorPaused(id: string): void {
  if (current?.id === id) {
    _isActive = false
    notify()
  }
}

/** Notify the coordinator that this id has resumed. */
export function coordinatorResumed(id: string): void {
  if (current?.id === id) {
    _isActive = true
    notify()
  }
}

/** Force-stop all audio and reset coordinator state. */
export function coordinatorReset(): void {
  if (current) {
    current.onInterrupt()
    current = null
  }
  _isActive = false
  notify()
}

/** Read current coordinator state (suitable for useState initializer). */
export function coordinatorGetState() {
  return { currentId: current?.id ?? null, isActive: _isActive }
}

/** Subscribe to state changes. Returns unsubscribe function. */
export function coordinatorSubscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
