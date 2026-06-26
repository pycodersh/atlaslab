'use client'

import { useCallback, useEffect, useState } from 'react'
import { getPreferences, RATE_MAP } from '@/lib/settings/preferences'
import { ttsProvider, getPitchForKey } from '@/lib/tts'

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)

  /** 텍스트 배열을 문단 단위로 순차 재생 */
  const speakTexts = useCallback((texts: string[]) => {
    const prefs    = getPreferences()
    const voiceKey = prefs.voice

    // 재생 시작 전 optimistic 상태 업데이트 (버튼 즉시 반응)
    setIsSpeaking(true)

    ttsProvider.speak({
      texts,
      voiceKey,
      rate:   RATE_MAP[prefs.speechRate],
      pitch:  getPitchForKey(voiceKey),
      volume: 1.0,
      onStart: () => setIsSpeaking(true),
      onEnd:   () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    })
  }, [])

  /** 단일 문장 (팝업 번역 읽기) */
  const speak = useCallback((text: string) => {
    speakTexts([text])
  }, [speakTexts])

  /** 전체 스토리 문단 순차 읽기 */
  const speakAll = useCallback((texts: string[]) => {
    speakTexts(texts)
  }, [speakTexts])

  const stop = useCallback(() => {
    ttsProvider.stop()
    setIsSpeaking(false)
  }, [])

  // 페이지 이동(언마운트) 시 즉시 중단
  useEffect(() => {
    return () => { ttsProvider.stop() }
  }, [])

  return { speak, speakAll, stop, isSpeaking }
}
