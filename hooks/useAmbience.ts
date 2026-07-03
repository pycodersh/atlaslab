'use client'

import { useCallback, useEffect, useRef } from 'react'
import { createAmbience, type AmbienceId, type AmbienceController, AMBIENCE_BASE_VOLUME } from '@/lib/ambience/generator'

const FADE_IN  = 0.8   // seconds
const FADE_OUT = 0.8   // seconds

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

  // userVolume: from AMBIENCE_VOLUME_MAP[prefs.ambienceVolume]
  // finalGain  = userVolume × AMBIENCE_BASE_VOLUME[id]
  const play = useCallback(async (id: AmbienceId, userVolume = 0.22) => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    const ctx = ctxRef.current

    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
    if (ctx.state !== 'running') return

    const master = ensureMaster(ctx)
    const targetGain = userVolume * (AMBIENCE_BASE_VOLUME[id] ?? 1.0)

    ctrlRef.current?.destroy()
    ctrlRef.current = createAmbience(ctx, id, master)

    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(targetGain, now + FADE_IN)
  }, [])

  const stop = useCallback(() => {
    const ctx    = ctxRef.current
    const master = masterRef.current
    if (!ctx || !master) return

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
