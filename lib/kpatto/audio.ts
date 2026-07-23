'use client'

// episodeId 'kp-ep-001' → 'ep01'
function epCode(episodeId: string): string | null {
  const m = episodeId.match(/kp-ep-(\d+)/)
  return m ? `ep${m[1].padStart(2, '0')}` : null
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

// patternId 'kp-001' + episodeId 'kp-ep-001' → '/kpatto/audio/ep01/ep01-p001.wav'
export function patternAudioUrl(episodeId: string, patternId: string): string | null {
  const ep = epCode(episodeId)
  const m = patternId.match(/kp-(\d+)/)
  if (!ep || !m) return null
  return `/kpatto/audio/${ep}/${ep}-p${m[1].padStart(3, '0')}.wav`
}

// Try playing a WAV file. Returns true if it played successfully.
export function tryPlayAudio(url: string): Promise<boolean> {
  return new Promise(resolve => {
    const audio = new Audio(url)
    audio.onended = () => resolve(true)
    audio.onerror = () => resolve(false)
    audio.play().catch(() => resolve(false))
  })
}

// Play text via browser TTS.
export function speakTTS(text: string, rate = 0.9): Promise<void> {
  return new Promise(resolve => {
    if (typeof window === 'undefined' || !window.speechSynthesis) { resolve(); return }
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'ko-KR'
    utt.rate = rate
    utt.onend = () => resolve()
    utt.onerror = () => resolve()
    window.speechSynthesis.speak(utt)
  })
}

// Play WAV if available, fallback to TTS.
export async function playWithFallback(url: string | null, text: string): Promise<void> {
  if (url) {
    const ok = await tryPlayAudio(url)
    if (ok) return
  }
  await speakTTS(text)
}
