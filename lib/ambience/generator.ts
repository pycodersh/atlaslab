'use client'

import type { AmbienceId } from '@/types/magazine'
export type { AmbienceId }

export const AMBIENCE_LABELS: Record<AmbienceId, string> = {
  rain:      'Rain',
  forest:    'Forest',
  ocean:     'Ocean',
  cafe:      'Café',
  city:      'City',
  night:     'Night',
  fireplace: 'Fireplace',
  wind:      'Wind',
  library:   'Library',
  train:     'Train',
}

export type AmbienceController = { destroy(): void }

// ── Shared helpers ────────────────────────────────────────────────────────────

function whiteNoise(ctx: AudioContext): AudioBufferSourceNode {
  const len    = ctx.sampleRate * 4
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
  const data   = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buffer
  src.loop   = true
  return src
}

function lp(ctx: AudioContext, freq: number, q = 0.5): BiquadFilterNode {
  const f = ctx.createBiquadFilter()
  f.type            = 'lowpass'
  f.frequency.value = freq
  f.Q.value         = q
  return f
}

function bp(ctx: AudioContext, freq: number, q = 1.0): BiquadFilterNode {
  const f = ctx.createBiquadFilter()
  f.type            = 'bandpass'
  f.frequency.value = freq
  f.Q.value         = q
  return f
}

function gain(ctx: AudioContext, v: number): GainNode {
  const g = ctx.createGain()
  g.gain.value = v
  return g
}

// Sine LFO → modulates target AudioParam
function lfo(
  ctx: AudioContext,
  freq: number,
  depth: number,
  target: AudioParam
): OscillatorNode {
  const osc = ctx.createOscillator()
  osc.type            = 'sine'
  osc.frequency.value = freq
  const g = ctx.createGain()
  g.gain.value = depth
  osc.connect(g)
  g.connect(target)
  osc.start()
  return osc
}

// ── Ambience factories (all sounds output to `out`) ───────────────────────────

function buildRain(ctx: AudioContext, out: GainNode): AudioNode[] {
  const src  = whiteNoise(ctx)
  const filt = lp(ctx, 350, 0.5)
  src.connect(filt); filt.connect(out)
  src.start()
  return [src, filt]
}

function buildForest(ctx: AudioContext, out: GainNode): AudioNode[] {
  const src  = whiteNoise(ctx)
  const filt = lp(ctx, 600, 0.4)
  const g    = gain(ctx, 0.75)
  src.connect(filt); filt.connect(g); g.connect(out)
  src.start()
  const mod = lfo(ctx, 0.07, 0.2, g.gain)  // gentle sway ~14s period
  return [src, filt, g, mod]
}

function buildOcean(ctx: AudioContext, out: GainNode): AudioNode[] {
  const src  = whiteNoise(ctx)
  const filt = lp(ctx, 380, 0.5)
  const g    = gain(ctx, 0.55)
  src.connect(filt); filt.connect(g); g.connect(out)
  src.start()
  const mod = lfo(ctx, 0.10, 0.42, g.gain)  // wave period ~10s
  return [src, filt, g, mod]
}

function buildCafe(ctx: AudioContext, out: GainNode): AudioNode[] {
  // Low murmur band
  const s1 = whiteNoise(ctx)
  const f1 = bp(ctx, 220, 1.2)
  const g1 = gain(ctx, 0.55)
  s1.connect(f1); f1.connect(g1); g1.connect(out)
  s1.start()

  // Mid conversation band
  const s2 = whiteNoise(ctx)
  const f2 = bp(ctx, 450, 0.9)
  const g2 = gain(ctx, 0.40)
  s2.connect(f2); f2.connect(g2); g2.connect(out)
  s2.start()

  return [s1, f1, g1, s2, f2, g2]
}

function buildCity(ctx: AudioContext, out: GainNode): AudioNode[] {
  // Distant traffic rumble
  const s1 = whiteNoise(ctx)
  const f1 = lp(ctx, 130, 0.6)
  const g1 = gain(ctx, 0.5)
  s1.connect(f1); f1.connect(g1); g1.connect(out)
  s1.start()

  // Mid ambient hum
  const s2 = whiteNoise(ctx)
  const f2 = bp(ctx, 380, 0.6)
  const g2 = gain(ctx, 0.3)
  s2.connect(f2); f2.connect(g2); g2.connect(out)
  s2.start()

  return [s1, f1, g1, s2, f2, g2]
}

function buildNight(ctx: AudioContext, out: GainNode): AudioNode[] {
  // Very dark, almost silent
  const src  = whiteNoise(ctx)
  const filt = lp(ctx, 180, 0.4)
  const g    = gain(ctx, 0.28)
  src.connect(filt); filt.connect(g); g.connect(out)
  src.start()
  return [src, filt, g]
}

function buildFireplace(ctx: AudioContext, out: GainNode): AudioNode[] {
  // Low crackle base
  const src  = whiteNoise(ctx)
  const filt = lp(ctx, 160, 0.6)
  const g    = gain(ctx, 0.6)
  src.connect(filt); filt.connect(g); g.connect(out)
  src.start()
  // Irregular flicker via fast LFO + random offset
  const mod = lfo(ctx, 0.8, 0.3, g.gain)
  return [src, filt, g, mod]
}

function buildWind(ctx: AudioContext, out: GainNode): AudioNode[] {
  const src  = whiteNoise(ctx)
  const filt = lp(ctx, 750, 0.4)
  const g    = gain(ctx, 0.6)
  src.connect(filt); filt.connect(g); g.connect(out)
  src.start()
  const mod = lfo(ctx, 0.28, 0.38, g.gain)  // gusty ~3.5s period
  return [src, filt, g, mod]
}

function buildLibrary(ctx: AudioContext, out: GainNode): AudioNode[] {
  // Near-silent hum
  const src  = whiteNoise(ctx)
  const filt = lp(ctx, 280, 0.4)
  const g    = gain(ctx, 0.18)
  src.connect(filt); filt.connect(g); g.connect(out)
  src.start()
  return [src, filt, g]
}

function buildTrain(ctx: AudioContext, out: GainNode): AudioNode[] {
  // Low rhythmic rumble
  const src  = whiteNoise(ctx)
  const filt = lp(ctx, 110, 0.8)
  const g    = gain(ctx, 0.65)
  src.connect(filt); filt.connect(g); g.connect(out)
  src.start()
  // Rhythmic clack: ~2Hz = joint-clack every 0.5s
  const mod = lfo(ctx, 2.0, 0.22, g.gain)
  return [src, filt, g, mod]
}

// ── Main factory ───────────────────────────────────────────────────────────────

const BUILDERS: Record<AmbienceId, (ctx: AudioContext, out: GainNode) => AudioNode[]> = {
  rain:      buildRain,
  forest:    buildForest,
  ocean:     buildOcean,
  cafe:      buildCafe,
  city:      buildCity,
  night:     buildNight,
  fireplace: buildFireplace,
  wind:      buildWind,
  library:   buildLibrary,
  train:     buildTrain,
}

export function createAmbience(
  ctx: AudioContext,
  id: AmbienceId,
  masterGain: GainNode
): AmbienceController {
  const nodes = BUILDERS[id](ctx, masterGain)
  return {
    destroy() {
      nodes.forEach(n => {
        try {
          if (n instanceof AudioBufferSourceNode || n instanceof OscillatorNode) n.stop()
        } catch { /* already stopped */ }
        try { n.disconnect() } catch { /* already disconnected */ }
      })
    },
  }
}
