'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Square } from 'lucide-react'
import { versionedExpressionAudio } from '@/lib/kpatto/expression-audio'

export type AudioSample = { slug: string; n: 1 | 2 | 3; ko: string; en: string }

const INK = '#111111'
const MUTED = '#6B6B6B'
const RULE = '#E5E1DC'
const RED = 'var(--brand-red, #C8102E)'

/** 실제 Supabase Storage 예문 음성(audio/expressions/{slug}/exN.mp3)을 그대로 재생하는 샘플 플레이어 */
export function SampleAudio({ samples }: { samples: AudioSample[] }) {
  const [playing, setPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => () => { audioRef.current?.pause() }, [])

  const urlOf = (s: AudioSample) =>
    versionedExpressionAudio(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/expressions/${s.slug}/ex${s.n}.mp3`,
    )

  const toggle = (s: AudioSample) => {
    const key = `${s.slug}/${s.n}`
    if (playing === key) {
      audioRef.current?.pause()
      setPlaying(null)
      return
    }
    audioRef.current?.pause()
    const a = new Audio(urlOf(s))
    audioRef.current = a
    a.onended = () => setPlaying(p => (p === key ? null : p))
    a.onerror = () => setPlaying(p => (p === key ? null : p))
    setPlaying(key)
    a.play().catch(() => setPlaying(null))
  }

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderTop: `1px solid ${RULE}` }}>
      {samples.map(s => {
        const key = `${s.slug}/${s.n}`
        const on = playing === key
        return (
          <li key={key} style={{ borderBottom: `1px solid ${RULE}` }}>
            <button
              type="button"
              onClick={() => toggle(s)}
              aria-label={on ? `Stop: ${s.ko}` : `Play: ${s.ko}`}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                background: 'transparent', border: 'none', padding: '14px 2px', cursor: 'pointer',
                textAlign: 'left', fontFamily: 'inherit', WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span
                style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  background: on ? RED : INK, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
              >
                {on ? <Square size={12} fill="currentColor" /> : <Play size={14} fill="currentColor" style={{ marginLeft: 2 }} />}
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 16, fontWeight: 600, color: INK }}>{s.ko}</span>
                <span style={{ display: 'block', fontSize: 13, color: MUTED, marginTop: 2 }}>{s.en}</span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
