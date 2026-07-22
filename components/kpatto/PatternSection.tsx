'use client'

import { useEffect, useState } from 'react'
import { Volume2, Bookmark } from 'lucide-react'
import type { KPattoPattern, KPattoLanguage } from '@/data/kpatto/types'
import { isPatternSaved, savePattern, unsavePattern } from '@/lib/kpatto/savedPatterns'
import { useAuth } from '@/contexts/AuthContext'

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

function BookmarkBtn({ pattern, episodeId }: { pattern: KPattoPattern; episodeId: string }) {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) { setSaved(false); return }
    isPatternSaved(pattern.id).then(setSaved)
  }, [user, pattern.id])

  const handle = async () => {
    if (!user || loading) return
    setLoading(true)
    if (saved) {
      await unsavePattern(pattern.id)
      setSaved(false)
    } else {
      await savePattern(pattern.id, episodeId)
      setSaved(true)
    }
    setLoading(false)
  }

  return (
    <button onClick={handle} style={{ background: 'none', border: 'none', cursor: user ? 'pointer' : 'default', padding: 0, flexShrink: 0 }}>
      <Bookmark size={15} color={saved ? ACCENT : '#CCCCCC'} fill={saved ? ACCENT : 'none'} strokeWidth={1.8} />
    </button>
  )
}

export function PatternSection({
  tags,
  patternMap,
  lang,
  storyId,
  episodeId,
}: {
  tags: string[]
  patternMap: Record<string, KPattoPattern>
  lang: KPattoLanguage
  storyId: number
  episodeId: string
}) {
  const patterns = tags.map(id => patternMap[id]).filter(Boolean)
  if (patterns.length === 0) return null

  return (
    <div style={{ margin: '32px 0 0', padding: '0 16px' }}>
      {/* Section title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 3, height: 18, borderRadius: 99, background: ACCENT, flexShrink: 0 }} />
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#999999', textTransform: 'uppercase' }}>
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
            <div key={p.id}>
            {i > 0 && <div style={{ height: 1, background: '#F0EDE8', margin: '0 20px' }} />}
            <div style={{ padding: '20px 20px' }}>
              {/* Header chip */}
              <div style={{
                background: '#EEF8EC', border: '1px solid #C9EAC4', borderRadius: 12,
                padding: '12px 14px', marginBottom: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#16A34A', letterSpacing: '0.5px', marginBottom: 6 }}>
                      PATTERN {String(i + 1).padStart(3, '0')}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, marginBottom: 6 }}>
                      {p.korean}
                    </div>
                    <div style={{ fontSize: 13, color: '#666666' }}>{desc}</div>
                  </div>
                  <BookmarkBtn pattern={p} episodeId={episodeId} />
                </div>
              </div>

              {/* Examples */}
              <div>
                {p.examples.map((ex, j) => {
                  const translation = (ex.translations as Record<string, string>)[lang] ?? ex.translations.en
                  return (
                    <div key={j} style={{ paddingLeft: 8, marginBottom: j < p.examples.length - 1 ? 12 : 0 }}>
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
                  )
                })}
              </div>
            </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
