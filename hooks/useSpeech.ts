'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getPreferences, RATE_MAP, findVoice } from '@/lib/settings/preferences'

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const isSpeakingRef = useRef(false)

  function synth() {
    return typeof window !== 'undefined' ? window.speechSynthesis : null
  }

  const stop = useCallback(() => {
    synth()?.cancel()
    isSpeakingRef.current = false
    setIsSpeaking(false)
  }, [])

  function buildUtterance(text: string): SpeechSynthesisUtterance {
    const prefs = getPreferences()
    const u = new SpeechSynthesisUtterance(text.trim())
    u.lang = prefs.voice.startsWith('uk') ? 'en-GB' : 'en-US'
    u.rate = RATE_MAP[prefs.speechRate]
    const voice = findVoice(prefs.voice)
    if (voice) u.voice = voice
    u.onstart = () => { isSpeakingRef.current = true;  setIsSpeaking(true)  }
    u.onend   = () => { isSpeakingRef.current = false; setIsSpeaking(false) }
    u.onerror = () => { isSpeakingRef.current = false; setIsSpeaking(false) }
    return u
  }

  const speak = useCallback((text: string) => {
    const s = synth()
    if (!s) return
    s.cancel()
    s.speak(buildUtterance(text))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const speakAll = useCallback((texts: string[]) => {
    const s = synth()
    if (!s || texts.length === 0) return
    s.cancel()
    const combined = texts.map(t => t.trim()).filter(Boolean).join(' ')
    s.speak(buildUtterance(combined))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 페이지 이동(언마운트) 시 즉시 중단
  useEffect(() => {
    return () => { synth()?.cancel() }
  }, [])

  return { speak, speakAll, stop, isSpeaking }
}
