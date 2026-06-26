'use client'

import { useCallback, useEffect, useState } from 'react'
import { getPreferences, RATE_MAP } from '@/lib/settings/preferences'
import { ttsProvider, getPitchForKey } from '@/lib/tts'

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speakTexts = useCallback((
    texts:     string[],
    audioUrls?: (string | null | undefined)[],
  ) => {
    const prefs    = getPreferences()
    const voiceKey = prefs.voice

    setIsSpeaking(true)

    ttsProvider.speak({
      texts,
      audioUrls,
      voiceKey,
      rate:   RATE_MAP[prefs.speechRate],
      pitch:  getPitchForKey(voiceKey),
      volume: 1.0,
      onStart: () => setIsSpeaking(true),
      onEnd:   () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    })
  }, [])

  /** 단일 문장 (팝업 번역 읽기) — audioUrl 있으면 사전생성 MP3 우선 재생 */
  const speak = useCallback((text: string, audioUrl?: string | null) => {
    speakTexts([text], audioUrl ? [audioUrl] : undefined)
  }, [speakTexts])

  /** 전체 스토리 문단 순차 읽기 — audioUrls 있으면 사전생성 MP3 우선 재생 */
  const speakAll = useCallback((
    texts:     string[],
    audioUrls?: (string | null | undefined)[],
  ) => {
    speakTexts(texts, audioUrls)
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
