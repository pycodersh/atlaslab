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

// Currently playing Audio element — stop before starting a new one
let currentAudio: HTMLAudioElement | null = null

function stopCurrent() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }
}

export function stopAllAudio() {
  stopCurrent()
}

// Play a URL directly. Returns true on successful playback, false on error.
export async function tryPlayAudio(url: string): Promise<boolean> {
  return new Promise(resolve => {
    stopCurrent()
    const audio = new Audio(url)
    currentAudio = audio
    audio.onended = () => { if (currentAudio === audio) currentAudio = null; resolve(true) }
    audio.onerror = () => {
      const err = audio.error
      console.error('[kpatto audio] onerror', url, 'code:', err?.code, 'message:', err?.message)
      if (currentAudio === audio) currentAudio = null
      resolve(false)
    }
    audio.play().catch((e) => {
      console.error('[kpatto audio] play() rejected', url, e)
      if (currentAudio === audio) currentAudio = null
      resolve(false)
    })
  })
}

// Play DB audio if URL is available. No TTS fallback.
export async function playAudio(url: string | null): Promise<void> {
  if (!url) {
    console.log('[kpatto audio] no url')
    return
  }
  const ok = await tryPlayAudio(url)
  if (!ok) {
    console.log('[kpatto audio] failed', url)
  }
}
