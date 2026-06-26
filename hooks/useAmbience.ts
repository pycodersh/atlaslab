'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createAmbience, type AmbienceId, type AmbienceController } from '@/lib/ambience/generator'

const FADE_IN  = 2.0   // seconds
const FADE_OUT = 2.2   // seconds
const VOLUME   = 0.18  // 18% — well below TTS voice

export function useAmbience() {
  const ctxRef     = useRef<AudioContext | null>(null)
  const masterRef  = useRef<GainNode | null>(null)
  const ctrlRef    = useRef<AmbienceController | null>(null)
  const [active, setActive] = useState(false)

  function ensureCtx(): AudioContext {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    // Resume if suspended (browser autoplay policy)
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }

  function ensureMaster(ctx: AudioContext): GainNode {
    if (!masterRef.current) {
      const g = ctx.createGain()
      g.gain.value = 0
      g.connect(ctx.destination)
      masterRef.current = g
    }
    return masterRef.current
  }

  const play = useCallback((id: AmbienceId) => {
    const ctx    = ensureCtx()
    const master = ensureMaster(ctx)

    // Tear down previous
    ctrlRef.current?.destroy()

    // Build and start new sounds
    ctrlRef.current = createAmbience(ctx, id, master)

    // Fade in
    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(VOLUME, now + FADE_IN)

    setActive(true)
  }, [])

  const stop = useCallback(() => {
    const ctx    = ctxRef.current
    const master = masterRef.current
    if (!ctx || !master) return

    // Fade out then destroy
    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(0, now + FADE_OUT)

    const ctrl = ctrlRef.current
    ctrlRef.current = null
    setTimeout(() => { ctrl?.destroy() }, (FADE_OUT + 0.1) * 1000)

    setActive(false)
  }, [])

  const toggle = useCallback((id: AmbienceId) => {
    if (active) stop()
    else play(id)
  }, [active, play, stop])

  // Clean up on unmount (page navigation)
  useEffect(() => {
    return () => {
      ctrlRef.current?.destroy()
      ctxRef.current?.close()
    }
  }, [])

  return { active, toggle, play, stop }
}
