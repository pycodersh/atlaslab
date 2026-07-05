'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Plus, ChevronRight } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
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
      className="glass-card-sm"
      style={{
        padding: '18px 18px 14px',
        cursor: 'pointer',
        marginBottom: 10,
        transition: 'opacity 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
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
              background: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: '2px 7px',
              border: '1px solid rgba(255,255,255,0.8)',
            }}>
              {fmtDate(essay.createdAt)}
            </span>
            {hasReview && (
              <span style={{
                fontSize: 10, color: '#27AE60', fontWeight: 700,
                background: 'rgba(39,174,96,0.08)', borderRadius: 6, padding: '2px 7px',
                border: '1px solid rgba(39,174,96,0.15)',
              }}>
                ✓ 첨삭 완료
              </span>
            )}
            {essay.review?.detectedStyle && (
              <span style={{
                fontSize: 10, color: 'var(--pm2)',
                background: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: '2px 7px',
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
          background: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ChevronRight style={{ width: 13, height: 13, color: 'var(--pm2)' }} strokeWidth={2} />
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
    <div style={{ minHeight: '100dvh' }}>
      <TopNav />

      <div style={{
        maxWidth: 540,
        margin: '0 auto',
        padding: `var(--pnav-h) 20px calc(${TAB_BAR_HEIGHT}px + 24px)`,
      }}>

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div style={{ paddingTop: 24, marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p style={{
                fontSize: 36, fontWeight: 900,
                letterSpacing: '-0.03em', lineHeight: 1,
                color: 'var(--pt)', margin: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}>
                ESSAYS
              </p>
              <p style={{
                fontSize: 14,
                color: 'var(--pm)', marginTop: 8, lineHeight: 1.5, margin: '8px 0 0',
                fontWeight: 400,
              }}>
                {t('essays_subtitle')}
              </p>
            </div>

            {/* Review quota badge */}
            <div className="glass-card-sm" style={{
              flexShrink: 0,
              padding: '10px 14px',
              textAlign: 'center',
              borderRadius: 14,
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
            background: 'rgba(255,255,255,0.68)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.82)',
            borderRadius: 18,
            cursor: 'pointer',
            fontSize: 15,
            fontWeight: 800,
            color: 'var(--pa)',
            letterSpacing: '0.02em',
            boxShadow: '0 4px 20px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.95)',
            transition: 'opacity 0.15s, transform 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <Plus style={{ width: 18, height: 18 }} strokeWidth={2.5} />
          New Essay
        </button>

        {/* ── Essay list ───────────────────────────────────────────────── */}
        {essays.length > 0 ? (
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{
                fontSize: 18, fontWeight: 800,
                color: 'var(--pt)', margin: 0, letterSpacing: '-0.01em',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
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

            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAll(v => !v)}
                className="glass-card-sm"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, width: '100%', padding: '13px 0',
                  border: 'none', cursor: 'pointer',
                  borderRadius: 14, marginTop: 4,
                  fontSize: 12, fontWeight: 600, color: 'var(--pm)',
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
            <div className="glass-card-sm" style={{
              width: 72, height: 72,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <span style={{ fontSize: 32 }}>✍️</span>
            </div>
            <p style={{
              fontSize: 15,
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
