'use client'

import { useCallback, useEffect, useRef } from 'react'
import { createAmbience, type AmbienceId, type AmbienceController } from '@/lib/ambience/generator'

const FADE_IN  = 2.0   // seconds
const FADE_OUT = 2.2   // seconds
const VOLUME   = 0.22  // 22% — Scene First 기준 (TTS 100% 기준 배경)

export function useAmbience() {
  const ctxRef    = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const ctrlRef   = useRef<AmbienceController | null>(null)

  function ensureMaster(ctx: AudioContext): GainNode {
    if (!masterRef.current) {
      const g = ctx.createGain()
      g.gain.value = 0
      g.connect(ctx.destination)
      masterRef.current = g
    }
    return masterRef.current
  }

  // AudioContext는 반드시 resume() 완료 후 사운드 생성 (autoplay policy 대응)
  const play = useCallback(async (id: AmbienceId) => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    const ctx = ctxRef.current

    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
    if (ctx.state !== 'running') return  // 여전히 실행 불가 → 조용히 중단

    const master = ensureMaster(ctx)

    // 기존 사운드 정리
    ctrlRef.current?.destroy()
    ctrlRef.current = createAmbience(ctx, id, master)

    // Fade in
    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(VOLUME, now + FADE_IN)
  }, [])

  const stop = useCallback(() => {
    const ctx    = ctxRef.current
    const master = masterRef.current
    if (!ctx || !master) return

    // Fade out → destroy
    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(0, now + FADE_OUT)

    const ctrl = ctrlRef.current
    ctrlRef.current = null
    setTimeout(() => { ctrl?.destroy() }, (FADE_OUT + 0.2) * 1000)
  }, [])

  // 언마운트(페이지 이동) 시 즉시 정리
  useEffect(() => {
    return () => {
      ctrlRef.current?.destroy()
      ctxRef.current?.close()
    }
  }, [])

  return { play, stop }
}
