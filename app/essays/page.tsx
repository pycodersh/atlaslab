'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PenLine, ChevronRight } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { type Essay, getEssays, getDailyReviewCount, MAX_DAILY_REVIEWS } from '@/lib/essays/storage'
import { useT } from '@/hooks/useT'

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
      style={{
        padding: '20px 0',
        borderBottom: '1px solid var(--pd)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--pt)',
            margin: '0 0 5px',
            lineHeight: 1.3,
          }}>
            {essay.title}
          </p>
          <p style={{
            fontSize: 12,
            color: 'var(--pm)',
            margin: '0 0 8px',
            lineHeight: 1.6,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {preview}{essay.body.length > 120 ? '…' : ''}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, color: 'var(--pm2)' }}>{fmtDate(essay.createdAt)}</span>
            {hasReview && (
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: 'var(--pa)',
                background: 'var(--pal)',
                padding: '2px 7px',
                borderRadius: 10,
              }}>
                {t('essays_reviewed_at')}
              </span>
            )}
            {essay.review && (
              <span style={{ fontSize: 10, color: 'var(--pm2)' }}>
                {essay.review.detectedStyle}
              </span>
            )}
          </div>
        </div>
        <ChevronRight style={{ width: 14, height: 14, color: 'var(--pm2)', flexShrink: 0, marginTop: 2 }} strokeWidth={1.4} />
      </div>
    </div>
  )
}

export default function EssaysPage() {
  const router = useRouter()
  const t = useT()
  const [essays, setEssays] = useState<Essay[]>([])
  const [reviewCount, setReviewCount] = useState(0)

  useEffect(() => {
    setEssays(getEssays())
    setReviewCount(getDailyReviewCount())
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>
      <TopNav />

      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        paddingTop: NAV_HEIGHT + 28,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 80,
      }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 36 }}>
          <p className="font-playfair" style={{
            fontSize: 'clamp(2rem, 9vw, 2.8rem)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: 'var(--pt)',
            margin: 0,
          }}>
            ESSAYS
          </p>
          <p className="font-playfair" style={{
            fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',
            fontStyle: 'italic',
            fontWeight: 500,
            color: 'var(--pm)',
            marginTop: 10,
            lineHeight: 1.6,
          }}>
            {t('essays_subtitle')}
          </p>
          <div style={{ height: 1.5, background: 'var(--pa)', width: 32, marginTop: 14, borderRadius: 1, opacity: 0.7 }} />
        </div>

        {/* ── Today's Reviews counter ─────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderRadius: 14,
          background: 'var(--pd)',
          marginBottom: 28,
        }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--pm)', margin: '0 0 3px' }}>
              {t('essays_reviews_today')}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: reviewCount >= MAX_DAILY_REVIEWS ? 'var(--pm2)' : 'var(--pa)', lineHeight: 1 }}>
                {MAX_DAILY_REVIEWS - reviewCount}
              </span>
              <span style={{ fontSize: 11, color: 'var(--pm)', fontWeight: 500 }}>/ {MAX_DAILY_REVIEWS} remaining</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {Array.from({ length: MAX_DAILY_REVIEWS }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: i < reviewCount ? 'var(--pm2)' : 'var(--pa)',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── New Essay button ─────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => router.push('/essays/new')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '15px 0',
            borderRadius: 14,
            border: '1.5px solid var(--pa)',
            background: 'none',
            cursor: 'pointer',
            marginBottom: 40,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--pal)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
        >
          <PenLine style={{ width: 15, height: 15, color: 'var(--pa)' }} strokeWidth={1.8} />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--pa)' }}>
            {t('essays_new')}
          </span>
        </button>

        {/* ── My Essays ────────────────────────────────────────────────────── */}
        {essays.length > 0 && (
          <div>
            <p style={{
              fontSize: 8.5,
              fontWeight: 700,
              letterSpacing: '0.24em',
              color: 'var(--pm)',
              margin: '0 0 4px',
            }}>
              {t('essays_my')}
            </p>
            <div style={{ borderTop: '1px solid var(--pd)' }}>
              {essays.map(essay => (
                <EssayCard
                  key={essay.id}
                  essay={essay}
                  onClick={() => router.push(`/essays/${essay.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {essays.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <p className="font-playfair" style={{
              fontSize: 14,
              fontStyle: 'italic',
              color: 'var(--pm)',
              lineHeight: 1.8,
              whiteSpace: 'pre-line',
            }}>
              {t('essays_empty')}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
