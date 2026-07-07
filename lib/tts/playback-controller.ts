'use client'

/**
 * Shimmer TTS Playback Controller — singleton.
 *
 * Manages a dedicated HTMLAudioElement for Pattern / Example Shimmer audio.
 * Story playback uses the existing ttsProvider (separate instance).
 *
 * Designed to support a future Auto Play sequence:
 *   Pattern → Example 1 → Example 2 → Example 3
 *   via playSequence([{ id, url }, ...])
 */

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'error'

type Listener = (state: PlaybackState, id: string | null) => void

let _audio: HTMLAudioElement | null = null

function getAudio(): HTMLAudioElement {
  if (!_audio) _audio = new Audio()
  return _audio
}

function clearHandlers(a: HTMLAudioElement) {
  a.oncanplay  = null
  a.onplaying  = null
  a.onended    = null
  a.onerror    = null
}

class PlaybackController {
  private _state: PlaybackState  = 'idle'
  private _id: string | null     = null
  private _rate                  = 1.0
  private _listeners             = new Set<Listener>()
  private _abort                 = new AbortController()
  private _blobUrl: string | null = null

  get state()     { return this._state }
  get currentId() { return this._id }

  subscribe(listener: Listener): () => void {
    this._listeners.add(listener)
    listener(this._state, this._id)     // sync current state immediately
    return () => this._listeners.delete(listener)
  }

  private emit(state: PlaybackState, id: string | null) {
    this._state = state
    this._id    = id
    this._listeners.forEach(l => l(state, id))
  }

  private _revokeBlobUrl() {
    if (this._blobUrl) {
      URL.revokeObjectURL(this._blobUrl)
      this._blobUrl = null
    }
  }

  stop() {
    this._abort.abort()
    this._abort = new AbortController()
    if (_audio) {
      _audio.pause()
      clearHandlers(_audio)
    }
    this._revokeBlobUrl()
    if (this._state !== 'idle') this.emit('idle', null)
  }

  async play(id: string, url: string) {
    this.stop()
    this.emit('loading', id)

    const signal = this._abort.signal

    try {
      const res = await fetch(url, {
        signal,
        cache: 'no-cache',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      if (signal.aborted) return

      const blob = await res.blob()
      if (signal.aborted) return

      const blobUrl = URL.createObjectURL(blob)
      this._blobUrl = blobUrl

      const audio = getAudio()
      audio.pause()
      clearHandlers(audio)
      audio.src          = blobUrl
      audio.playbackRate = this._rate
      audio.load()

      audio.oncanplay = () => {
        if (signal.aborted) { this._revokeBlobUrl(); return }
        audio.play().catch(() => {
          this._revokeBlobUrl()
          this.emit('error', id)
        })
      }

      audio.onplaying = () => {
        if (signal.aborted) { this._revokeBlobUrl(); return }
        this.emit('playing', id)
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: 'PATTO',
            artist: 'Patterns · Stories · You',
            artwork: [{ src: '/patto-logo.png', sizes: 'any', type: 'image/png' }],
          })
          navigator.mediaSession.playbackState = 'playing'
        }
      }

      audio.onended = () => {
        this._revokeBlobUrl()
        this.emit('idle', null)
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none'
      }

      audio.onerror = () => {
        this._revokeBlobUrl()
        this.emit('error', id)
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      this.emit('error', id)
    }
  }

  toggle(id: string, url: string) {
    if (this._id === id && this._state === 'playing') {
      this.stop()
    } else {
      this.play(id, url)
    }
  }

  setRate(rate: number) {
    this._rate = Math.min(Math.max(rate, 0.5), 2.0)
    if (_audio) _audio.playbackRate = this._rate
  }

  // Future: auto-play sequence (Pattern → Ex1 → Ex2 → Ex3)
  // async playSequence(items: { id: string; url: string }[]): Promise<void> { ... }
}

export const playbackController = new PlaybackController()
