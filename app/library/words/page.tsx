'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, BookOpen } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { SwipeDeleteRow } from '@/components/SwipeDeleteRow'
import { getSavedWords, removeSavedWord, type SavedWord } from '@/lib/words/storage'
import { magazineStories } from '@/data/magazine-stories'
import { useT } from '@/hooks/useT'

function fmtDate(iso: string): string {
  const d = new Date(iso)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

function sourceLabel(w: SavedWord): string {
  if (w.sourceType === 'story' && w.storyId) {
    const story = magazineStories.find(s => s.id === w.storyId)
    return `Story ${String(w.storyId).padStart(2, '0')}${story ? ` · ${story.title}` : ''}`
  }
  if (w.sourceType === 'essay') return 'Essay'
  if (w.sourceType === 'pattern' || w.sourceType === 'example') return 'Pattern'
  return w.sourceId
}

export default function SavedWordsPage() {
  const router = useRouter()
  const t = useT()
  const [words, setWords] = useState<SavedWord[]>([])
  useEffect(() => { setWords(getSavedWords()) }, [])

  function handleDelete(id: string) {
    removeSavedWord(id)
    setWords(prev => prev.filter(w => w.id !== id))
  }

  return (
    <div style={{ height: '100dvh', overflowY: 'auto', background: 'var(--pb)' }}>
      <TopNav />

      <div style={{
        maxWidth: 480, margin: '0 auto',
        paddingTop: 16,
        paddingLeft: 24, paddingRight: 24, paddingBottom: 100,
        boxSizing: 'border-box',
      }}>

        {/* Back */}
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            marginBottom: 28,
          }}
        >
          <ChevronLeft style={{ width: 14, height: 14, color: 'var(--pm2)' }} strokeWidth={1.8} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm2)' }}>
            LIBRARY
          </span>
        </button>

        {/* Title */}
        <div style={{ marginBottom: 36 }}>
          <p className="font-playfair" style={{
            fontSize: 'clamp(1.8rem, 8vw, 2.4rem)', fontWeight: 900,
            letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--pt)', margin: 0,
          }}>
            Saved Words
          </p>
          <p style={{ fontSize: 11, color: 'var(--pm)', marginTop: 8 }}>
            {t('words_saved_count', { n: words.length })}
          </p>
          <div style={{ height: 1.5, background: 'var(--pa)', width: 32, marginTop: 14, borderRadius: 1, opacity: 0.7 }} />
        </div>

        {/* Empty state */}
        {words.length === 0 && (
          <div style={{ paddingTop: 40, textAlign: 'center' }}>
            <BookOpen style={{ width: 28, height: 28, color: 'var(--pd)', margin: '0 auto 14px' }} strokeWidth={1.5} />
            <p style={{ fontSize: 13, color: 'var(--pm2)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {t('words_empty')}
            </p>
          </div>
        )}

        {/* Word list */}
        <div style={{ borderRadius: 16, overflow: 'hidden', border: words.length > 0 ? '1px solid var(--pd)' : 'none' }}>
          {words.map((w, i) => (
            <SwipeDeleteRow
              key={w.id}
              onDeleteRequest={() => handleDelete(w.id)}
              containerStyle={{ borderTop: i > 0 ? '1px solid var(--pd)' : 'none' }}
            >
              <div style={{ padding: '16px 20px', background: 'var(--pw)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--pt)', margin: '0 0 3px', lineHeight: 1.3 }}>
                      {w.word}
                    </p>
                    {w.meaning && (
                      <p style={{ fontSize: 12, color: 'var(--pm)', margin: '0 0 6px' }}>{w.meaning}</p>
                    )}
                    {w.originalSentence && (
                      <p style={{
                        fontSize: 12, color: 'var(--pt2)', margin: '0 0 6px',
                        lineHeight: 1.6, fontStyle: 'italic',
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        &ldquo;{w.originalSentence}&rdquo;
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--pm2)', letterSpacing: '0.06em' }}>
                        {sourceLabel(w)}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--pd)' }}>·</span>
                      <span style={{ fontSize: 10, color: 'var(--pm2)' }}>{fmtDate(w.savedAt)}</span>
                    </div>
                  </div>

                </div>
              </div>
            </SwipeDeleteRow>
          ))}
        </div>
      </div>

    </div>
  )
}
