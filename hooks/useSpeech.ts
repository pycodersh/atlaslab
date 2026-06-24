'use client'

import { useCallback, useRef, useState } from 'react'

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

  const speak = useCallback(
    (text: string) => {
      const s = synth()
      if (!s) return
      s.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'en-US'
      u.rate = 0.88
      u.onstart = () => {
        isSpeakingRef.current = true
        setIsSpeaking(true)
      }
      u.onend = () => {
        isSpeakingRef.current = false
        setIsSpeaking(false)
      }
      u.onerror = () => {
        isSpeakingRef.current = false
        setIsSpeaking(false)
      }
      s.speak(u)
    },
    [],
  )

  const speakAll = useCallback(
    (texts: string[]) => {
      const s = synth()
      if (!s || texts.length === 0) return
      s.cancel()
      texts.forEach((text, i) => {
        const u = new SpeechSynthesisUtterance(text)
        u.lang = 'en-US'
        u.rate = 0.88
        if (i === 0) u.onstart = () => { isSpeakingRef.current = true; setIsSpeaking(true) }
        if (i === texts.length - 1) {
          u.onend = () => { isSpeakingRef.current = false; setIsSpeaking(false) }
          u.onerror = () => { isSpeakingRef.current = false; setIsSpeaking(false) }
        }
        s.speak(u)
      })
    },
    [],
  )

  return { speak, speakAll, stop, isSpeaking }
}
