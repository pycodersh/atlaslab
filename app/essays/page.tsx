'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PenLine, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { type Essay, getEssays, getDailyReviewCount, MAX_DAILY_REVIEWS } from '@/lib/essays/storage'
import { useT } from '@/hooks/useT'

const INITIAL_SHOW = 3

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function EssayCard({ essay, onClick }: { essay: Essay; onClick: () => void }) {
  const t = useT()
  const preview = essay.body.slice(0, 120).replace(/\n/g, ' ')
  const hasReview = !!essay.review

  return (
    <div
      onClick={onClick}
      style={{ padding: '18px 0', borderBottom: '1px solid var(--pd)', cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 15, fontWeight: 700,
            color: 'var(--pt)', margin: '0 0 4px', lineHeight: 1.3,
          }}>
            {essay.title}
          </p>
          <p style={{
            fontSize: 12, color: 'var(--pm)', margin: '0 0 8px',
            lineHeight: 1.6, overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {preview}{essay.body.length > 120 ? '…' : ''}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: 'var(--pm2)' }}>{fmtDate(essay.createdAt)}</span>
            {hasReview && (
              <span style={{
                fontSize: 9, color: 'var(--pm2)',
                letterSpacing: '0.05em',
              }}>
                · ✓ {t('essays_reviewed_at')}
              </span>
            )}
            {essay.review?.detectedStyle && (
              <span style={{ fontSize: 9, color: 'var(--pm2)', opacity: 0.7 }}>
                · {essay.review.detectedStyle}
              </span>
            )}
          </div>
        </div>
        <ChevronRight style={{ width: 13, height: 13, color: 'var(--pm2)', flexShrink: 0, marginTop: 3 }} strokeWidth={1.4} />
      </div>
    </div>
  )
}

export default function EssaysPage() {
  const router = useRouter()
  const t = useT()
  const [essays, setEssays] = useState<Essay[]>([])
  const [reviewCount, setReviewCount] = useState(0)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    setEssays(getEssays())
    setReviewCount(getDailyReviewCount())
  }, [])

  const remaining = MAX_DAILY_REVIEWS - reviewCount
  const displayed = showAll ? essays : essays.slice(0, INITIAL_SHOW)
  const hasMore = essays.length > INITIAL_SHOW

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>
      <TopNav />

      {/* ── Sticky header block ──────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky',
        top: NAV_HEIGHT,
        zIndex: 30,
        background: 'var(--pb)',
        maxWidth: 480,
        margin: '0 auto',
        paddingTop: 28,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 0,
      }}>
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <p className="font-playfair" style={{
            fontSize: 'clamp(2rem, 9vw, 2.8rem)',
            fontWeight: 900, letterSpacing: '-0.02em',
            lineHeight: 1, color: 'var(--pt)', margin: 0,
          }}>
            ESSAYS
          </p>
          <p className="font-playfair" style={{
            fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',
            fontStyle: 'italic', fontWeight: 500,
            color: 'var(--pm)', marginTop: 10, lineHeight: 1.6,
          }}>
            {t('essays_subtitle')}
          </p>
          <div style={{ height: 1.5, background: 'var(--pa)', width: 32, marginTop: 14, borderRadius: 1, opacity: 0.7 }} />
        </div>

        {/* ── Today's Reviews — simple strip ───────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 14,
          borderBottom: '1px solid var(--pd)',
          marginBottom: 20,
        }}>
          <p style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.2em',
            color: 'var(--pm2)', margin: 0,
          }}>
            {t('essays_reviews_today')}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Pip indicators */}
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: MAX_DAILY_REVIEWS }).map((_, i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: i < reviewCount ? 'var(--pm2)' : 'var(--pa)',
                  opacity: i < reviewCount ? 0.3 : 1,
                }} />
              ))}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: remaining === 0 ? 'var(--pm2)' : 'var(--pa)',
            }}>
              {remaining} / {MAX_DAILY_REVIEWS}
            </span>
          </div>
        </div>

        {/* ── New Essay — Burgundy button ──────────────────────────────────── */}
        <button
          type="button"
          onClick={() => router.push('/essays/new')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, width: '100%', padding: '15px 0',
            borderRadius: 14, border: 'none',
            background: 'var(--pa)', cursor: 'pointer',
            marginBottom: 20,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
        >
          <PenLine style={{ width: 14, height: 14, color: '#fff' }} strokeWidth={2} />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: '#fff' }}>
            {t('essays_new')}
          </span>
        </button>
      </div>
      {/* ── END sticky header ─────────────────────────────────────────────────── */}

      {/* ── Scrollable essay list ────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 80,
      }}>
        {/* ── My Essays ────────────────────────────────────────────────────── */}
        {essays.length > 0 && (
          <div>
            <p style={{
              fontSize: 8.5, fontWeight: 700, letterSpacing: '0.24em',
              color: 'var(--pm)', margin: '0 0 4px',
            }}>
              {t('essays_my')}
            </p>
            <div style={{ borderTop: '1px solid var(--pd)' }}>
              {displayed.map(essay => (
                <EssayCard
                  key={essay.id}
                  essay={essay}
                  onClick={() => router.push(`/essays/${essay.id}`)}
                />
              ))}
            </div>

            {/* Show More / Show Less */}
            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAll(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 5, width: '100%', padding: '12px 0',
                  background: 'none', border: 'none', cursor: 'pointer',
                  marginTop: 4,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--pm2)' }}>
                  {showAll ? 'Show Less' : `Show More (${essays.length - INITIAL_SHOW})`}
                </span>
                {showAll
                  ? <ChevronUp style={{ width: 13, height: 13, color: 'var(--pm2)' }} strokeWidth={1.8} />
                  : <ChevronDown style={{ width: 13, height: 13, color: 'var(--pm2)' }} strokeWidth={1.8} />
                }
              </button>
            )}
          </div>
        )}

        {essays.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <p className="font-playfair" style={{
              fontSize: 14, fontStyle: 'italic',
              color: 'var(--pm)', lineHeight: 1.8, whiteSpace: 'pre-line',
            }}>
              {t('essays_empty')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
