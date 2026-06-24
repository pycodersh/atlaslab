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

  // DB 원본 문장을 직접 사용, 공백 정리
  const speak = useCallback((text: string) => {
    const s = synth()
    if (!s) return
    s.cancel()
    const u = new SpeechSynthesisUtterance(text.trim())
    u.lang = 'en-US'
    u.rate = 0.88
    u.onstart = () => { isSpeakingRef.current = true; setIsSpeaking(true) }
    u.onend   = () => { isSpeakingRef.current = false; setIsSpeaking(false) }
    u.onerror = () => { isSpeakingRef.current = false; setIsSpeaking(false) }
    s.speak(u)
  }, [])

  // 여러 문장을 하나의 utterance로 합쳐서 자연스럽게 연속 재생
  // 큐잉 방식은 브라우저(특히 iOS Safari)에서 문장 사이에 부자연스러운 끊김이 발생함
  const speakAll = useCallback((texts: string[]) => {
    const s = synth()
    if (!s || texts.length === 0) return
    s.cancel()
    const combined = texts.map((t) => t.trim()).filter(Boolean).join(' ')
    const u = new SpeechSynthesisUtterance(combined)
    u.lang = 'en-US'
    u.rate = 0.88
    u.onstart = () => { isSpeakingRef.current = true; setIsSpeaking(true) }
    u.onend   = () => { isSpeakingRef.current = false; setIsSpeaking(false) }
    u.onerror = () => { isSpeakingRef.current = false; setIsSpeaking(false) }
    s.speak(u)
  }, [])

  return { speak, speakAll, stop, isSpeaking }
}
