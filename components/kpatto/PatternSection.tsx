'use client'

import { useState } from 'react'
import { Volume2, Bookmark } from 'lucide-react'
import type { KPattoPattern, KPattoLanguage } from '@/data/kpatto/types'

const ACCENT = '#D4873A'
const T1     = '#111111'

const PATTERN_DESCS: Record<string, string> = {
  'kp-005': 'Use this to say what something IS',
  'kp-003': 'Use this to ask for something',
  'kp-004': 'Use this to ask what something is',
  'kp-006': 'Use this to ask if something exists',
  'kp-007': 'Use this to ask the price',
}

function speakAll(sentences: string[], onDone: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  let idx = 0
  const next = () => {
    if (idx >= sentences.length) { onDone(); return }
    const utt = new SpeechSynthesisUtterance(sentences[idx++])
    utt.lang = 'ko-KR'
    utt.rate = 0.9
    utt.onend = next
    window.speechSynthesis.speak(utt)
  }
  next()
}

function SpeakAllBtn({ sentences, size, color, activeColor }: { sentences: string[]; size: number; color: string; activeColor: string }) {
  const [playing, setPlaying] = useState(false)
  const handle = () => {
    if (playing) { window.speechSynthesis.cancel(); setPlaying(false); return }
    setPlaying(true)
    speakAll(sentences, () => setPlaying(false))
  }
  return (
    <button
      onClick={handle}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0 }}
    >
      <Volume2 size={size} color={playing ? activeColor : color} strokeWidth={1.8} />
    </button>
  )
}

export function PatternSection({
  tags,
  patternMap,
  lang,
}: {
  tags: string[]
  patternMap: Record<string, KPattoPattern>
  lang: KPattoLanguage
}) {
  const patterns = tags.map(id => patternMap[id]).filter(Boolean)
  if (patterns.length === 0) return null

  return (
    <div style={{ margin: '32px 0 0', padding: '0 16px' }}>
      {/* Section title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 3, height: 18, borderRadius: 99, background: ACCENT, flexShrink: 0 }} />
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.04em', color: T1, textTransform: 'uppercase' }}>
          Patterns in this episode
        </div>
      </div>

      {/* Single combined card */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E8E4DF',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {patterns.map((p, i) => {
          const desc = PATTERN_DESCS[p.id] ?? p.structure
          return (
            <div key={p.id} style={{ padding: '20px 20px', paddingTop: i === 0 ? 20 : 0 }}>
              {/* Header: left green line + text + bookmark */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 10, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 3, borderRadius: 2, background: '#16A34A', flexShrink: 0, alignSelf: 'stretch' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: '#16A34A', letterSpacing: '0.5px', marginBottom: 4 }}>
                      PATTERN {String(i + 1).padStart(3, '0')}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, marginBottom: 6 }}>
                      {p.korean}
                    </div>
                    <div style={{ fontSize: 13, color: '#999999' }}>{desc}</div>
                  </div>
                </div>
                <Bookmark size={15} color="#CCCCCC" strokeWidth={1.8} style={{ cursor: 'pointer', flexShrink: 0 }} />
              </div>

              {/* Examples */}
              <div style={{ paddingBottom: i < patterns.length - 1 ? 20 : 0 }}>
                {p.examples.map((ex, j) => {
                  const translation = (ex.translations as Record<string, string>)[lang] ?? ex.translations.en
                  return (
                    <div key={j}>
                      {j > 0 && (
                        <div style={{ height: 1, background: '#EDE9E3', margin: '16px 0' }} />
                      )}
                      <div style={{ paddingLeft: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', paddingLeft: 6 }}>
                            {ex.korean}
                          </div>
                          {j === 0 && <span style={{ marginRight: 12 }}><SpeakAllBtn sentences={p.examples.map(e => e.korean)} size={14} color="#CCCCCC" activeColor={ACCENT} /></span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#999999', marginTop: 2, paddingLeft: 14 }}>
                          {translation}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
