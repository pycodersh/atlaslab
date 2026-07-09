'use client'

import { useCallback, useEffect, useState } from 'react'
import { getPreferences, RATE_MAP, type VoiceKey } from '@/lib/settings/preferences'
import { ttsProvider, getPitchForKey } from '@/lib/tts'

type SpeakOpts = {
  /** 기본 음성 (스토리 내레이터 등). 없으면 사용자 설정 음성 */
  voiceKey?: VoiceKey
  /** 세그먼트별 음성 (texts와 1:1) — 화자 구분용 */
  voiceKeys?: VoiceKey[]
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentParagraphIdx, setCurrentParagraphIdx] = useState(-1)

  const speakTexts = useCallback((
    texts:     string[],
    audioUrls?: (string | null | undefined)[],
    opts?:     SpeakOpts,
  ) => {
    const prefs    = getPreferences()
    const voiceKey = opts?.voiceKey ?? prefs.voice

    setIsSpeaking(true)
    setCurrentParagraphIdx(0)

    ttsProvider.speak({
      texts,
      audioUrls,
      voiceKey,
      voiceKeys: opts?.voiceKeys,
      rate:   RATE_MAP[prefs.speechRate],
      pitch:  getPitchForKey(voiceKey),
      volume: 1.0,
      onStart: () => {
        setIsSpeaking(true)
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: 'PATTO',
            artist: 'Patterns · Stories · You',
            artwork: [{ src: '/patto-logo.png', sizes: 'any', type: 'image/png' }],
          })
          navigator.mediaSession.playbackState = 'playing'
        }
      },
      onEnd: () => {
        setIsSpeaking(false)
        setCurrentParagraphIdx(-1)
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none'
      },
      onError: () => {
        setIsSpeaking(false)
        setCurrentParagraphIdx(-1)
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none'
      },
      onParagraphChange: (idx) => setCurrentParagraphIdx(idx),
    })
  }, [])

  /** 단일 문장 (팝업 번역 읽기) */
  const speak = useCallback((text: string, audioUrl?: string | null, voiceKey?: VoiceKey) => {
    speakTexts([text], audioUrl ? [audioUrl] : undefined, { voiceKey })
  }, [speakTexts])

  /** 전체 스토리 문단 순차 읽기 */
  const speakAll = useCallback((
    texts:     string[],
    audioUrls?: (string | null | undefined)[],
    opts?:     SpeakOpts,
  ) => {
    speakTexts(texts, audioUrls, opts)
  }, [speakTexts])

  const stop = useCallback(() => {
    ttsProvider.stop()
    setIsSpeaking(false)
    setCurrentParagraphIdx(-1)
  }, [])

  return { speak, speakAll, stop, isSpeaking, currentParagraphIdx }
}
