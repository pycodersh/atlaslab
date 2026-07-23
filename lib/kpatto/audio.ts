'use client'

// episodeId 'kp-ep-001' → 'ep01'
function epCode(episodeId: string): string | null {
  const m = episodeId.match(/kp-ep-(\d+)/)
  return m ? `ep${String(parseInt(m[1], 10)).padStart(2, '0')}` : null
}

// bubbleId 'g0-b1' + episodeId 'kp-ep-001' → '/kpatto/audio/ep01/ep01-c1-b1.wav'
// gap number is 0-indexed in data but 1-indexed in filenames
export function bubbleAudioUrl(episodeId: string, bubbleId: string): string | null {
  const ep = epCode(episodeId)
  const m = bubbleId.match(/^g(\d+)-b(\d+)$/)
  if (!ep || !m) return null
  const cutNum = parseInt(m[1], 10) + 1
  return `/kpatto/audio/${ep}/${ep}-c${cutNum}-b${m[2]}.wav`
}

// patternIndex is 0-based position within the episode (p001 = index 0, p002 = index 1, ...)
export function patternAudioUrl(episodeId: string, patternIndex: number): string | null {
  const ep = epCode(episodeId)
  if (!ep) return null
  return `/kpatto/audio/${ep}/${ep}-p${String(patternIndex + 1).padStart(3, '0')}.wav`
}

// Cache of confirmed-existing URLs to avoid repeated HEAD requests
const existsCache = new Map<string, boolean>()

async function fileExists(url: string): Promise<boolean> {
  if (existsCache.has(url)) return existsCache.get(url)!
  try {
    const res = await fetch(url, { method: 'HEAD' })
    const ok = res.ok
    existsCache.set(url, ok)
    return ok
  } catch {
    return false
  }
}

// Currently playing Audio element — stop before starting a new one
let currentAudio: HTMLAudioElement | null = null

function stopCurrent() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }
}

// Play a WAV file. Returns true only after it plays to completion.
// Returns false immediately if file doesn't exist (HEAD 404).
export async function tryPlayAudio(url: string): Promise<boolean> {
  const exists = await fileExists(url)
  if (!exists) return false

  return new Promise(resolve => {
    stopCurrent()
    const audio = new Audio(url)
    currentAudio = audio
    audio.onended = () => { if (currentAudio === audio) currentAudio = null; resolve(true) }
    audio.onerror = () => { if (currentAudio === audio) currentAudio = null; resolve(false) }
    audio.play().catch(() => { if (currentAudio === audio) currentAudio = null; resolve(false) })
  })
}

// Play text via browser TTS.
export function speakTTS(text: string, rate = 0.9): Promise<void> {
  return new Promise(resolve => {
    if (typeof window === 'undefined' || !window.speechSynthesis) { resolve(); return }
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'ko-KR'
    utt.rate = rate
    utt.onend = () => resolve()
    utt.onerror = () => resolve()
    window.speechSynthesis.speak(utt)
  })
}

// Stop all audio (WAV + TTS)
export function stopAllAudio() {
  stopCurrent()
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
}

// Play WAV if file exists, fallback to TTS only when confirmed missing.
export async function playWithFallback(url: string | null, text: string): Promise<void> {
  if (url) {
    const ok = await tryPlayAudio(url)
    if (ok) return
  }
  stopCurrent()
  await speakTTS(text)
}
