'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { type Essay, getEssays, getDailyReviewCount, MAX_DAILY_REVIEWS } from '@/lib/essays/storage'
import { useT } from '@/hooks/useT'

const INITIAL_SHOW = 3

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', year: 'numeric' })
}

function EssayCard({ essay, onClick }: { essay: Essay; onClick: () => void }) {
  const t = useT()
  const preview = essay.body.slice(0, 100).replace(/\n/g, ' ')
  const hasReview = !!essay.review

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--pc)',
        borderRadius: 16,
        padding: '18px 18px 14px',
        cursor: 'pointer',
        marginBottom: 10,
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 15, fontWeight: 700,
            color: 'var(--pt)', margin: '0 0 5px', lineHeight: 1.3,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
          }}>
            {essay.title}
          </p>
          <p style={{
            fontSize: 12.5, color: 'var(--pm)', margin: '0 0 10px',
            lineHeight: 1.6, overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {preview}{essay.body.length > 100 ? '…' : ''}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <span style={{
              fontSize: 10, color: 'var(--pm2)',
              background: 'var(--pb)', borderRadius: 6, padding: '2px 7px',
            }}>
              {fmtDate(essay.createdAt)}
            </span>
            {hasReview && (
              <span style={{
                fontSize: 10, color: '#27AE60', fontWeight: 700,
                background: 'rgba(39,174,96,0.1)', borderRadius: 6, padding: '2px 7px',
              }}>
                ✓ 첨삭 완료
              </span>
            )}
            {essay.review?.detectedStyle && (
              <span style={{
                fontSize: 10, color: 'var(--pm2)',
                background: 'var(--pb)', borderRadius: 6, padding: '2px 7px',
              }}>
                {essay.review.detectedStyle}
              </span>
            )}
          </div>
        </div>
        <div style={{
          flexShrink: 0,
          width: 28, height: 28,
          borderRadius: 8,
          background: 'var(--pb)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ChevronDown style={{ width: 13, height: 13, color: 'var(--pm2)', transform: 'rotate(-90deg)' }} strokeWidth={2} />
        </div>
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
  const hasMore   = essays.length > INITIAL_SHOW

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>
      <TopNav />

      <div style={{
        paddingTop: 'var(--pnav-h)',
        paddingBottom: `calc(${TAB_BAR_HEIGHT}px + 24px)`,
        maxWidth: 540,
        margin: '0 auto',
        padding: `var(--pnav-h) 20px calc(${TAB_BAR_HEIGHT}px + 24px)`,
      }}>

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div style={{ paddingTop: 24, marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p className="font-playfair" style={{
                fontSize: 36, fontWeight: 900,
                letterSpacing: '-0.03em', lineHeight: 1,
                color: 'var(--pt)', margin: 0,
              }}>
                ESSAYS
              </p>
              <p className="font-playfair" style={{
                fontSize: 14, fontStyle: 'italic',
                color: 'var(--pm)', marginTop: 8, lineHeight: 1.5, margin: '8px 0 0',
              }}>
                {t('essays_subtitle')}
              </p>
            </div>

            {/* Review quota badge */}
            <div style={{
              flexShrink: 0,
              background: remaining === 0 ? 'var(--pc)' : 'var(--pal)',
              border: `1px solid ${remaining === 0 ? 'var(--pd)' : 'var(--pacb)'}`,
              borderRadius: 12,
              padding: '10px 14px',
              textAlign: 'center',
            }}>
              <div style={{ display: 'flex', gap: 3, marginBottom: 4, justifyContent: 'center' }}>
                {Array.from({ length: MAX_DAILY_REVIEWS }).map((_, i) => (
                  <div key={i} style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: i < reviewCount ? 'var(--pm2)' : 'var(--pa)',
                    opacity: i < reviewCount ? 0.3 : 1,
                  }} />
                ))}
              </div>
              <span style={{
                fontSize: 11, fontWeight: 800,
                color: remaining === 0 ? 'var(--pm2)' : 'var(--pa)',
              }}>
                {remaining}/{MAX_DAILY_REVIEWS}
              </span>
            </div>
          </div>

          {/* Accent rule */}
          <div style={{ height: 2, background: 'var(--pa)', width: 36, marginTop: 14, borderRadius: 1 }} />
        </div>

        {/* ── New Essay button ─────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => router.push('/essays/new')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            marginTop: 20,
            padding: '16px 0',
            background: 'var(--pa)',
            border: 'none',
            borderRadius: 16,
            cursor: 'pointer',
            fontSize: 15,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '0.02em',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Plus style={{ width: 18, height: 18 }} strokeWidth={2.5} />
          New Essay
        </button>

        {/* ── Essay list ───────────────────────────────────────────────── */}
        {essays.length > 0 ? (
          <div style={{ marginTop: 24 }}>
            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p className="font-playfair" style={{
                fontSize: 18, fontWeight: 900,
                color: 'var(--pt)', margin: 0, letterSpacing: '-0.01em',
              }}>
                My Essays
              </p>
              <span style={{ fontSize: 11, color: 'var(--pm2)', fontWeight: 600 }}>
                {essays.length} total
              </span>
            </div>

            {displayed.map(essay => (
              <EssayCard
                key={essay.id}
                essay={essay}
                onClick={() => router.push(`/essays/${essay.id}`)}
              />
            ))}

            {/* Show More / Show Less */}
            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAll(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, width: '100%', padding: '13px 0',
                  background: 'var(--pc)', border: 'none', cursor: 'pointer',
                  borderRadius: 14, marginTop: 4,
                  fontSize: 12, fontWeight: 600, color: 'var(--pm2)',
                }}
              >
                {showAll ? 'Show Less' : `Show More (${essays.length - INITIAL_SHOW})`}
                {showAll
                  ? <ChevronUp style={{ width: 13, height: 13 }} strokeWidth={2} />
                  : <ChevronDown style={{ width: 13, height: 13 }} strokeWidth={2} />
                }
              </button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 48 }}>
            <div style={{
              width: 64, height: 64,
              borderRadius: '50%',
              background: 'var(--pc)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <span style={{ fontSize: 28 }}>✍️</span>
            </div>
            <p className="font-playfair" style={{
              fontSize: 15, fontStyle: 'italic',
              color: 'var(--pm)', lineHeight: 1.8, margin: 0,
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
