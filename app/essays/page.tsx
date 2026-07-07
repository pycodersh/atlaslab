'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronRight, Sparkles, PenLine } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { SwipeDeleteRow } from '@/components/SwipeDeleteRow'
import { type Essay, getEssays, getReviewsRemaining, deleteEssay } from '@/lib/essays/storage'
import { getPlan, FREE_REVIEW_LIFETIME, PREMIUM_REVIEW_DAILY } from '@/lib/subscription/storage'
import { useT } from '@/hooks/useT'

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const cardBase: React.CSSProperties = {
  background: 'var(--pglass)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: 16,
  border: '1px solid var(--pglass-border)',
  boxShadow: '0 4px 18px rgba(40,40,60,0.06), 0 1px 4px rgba(40,40,60,0.03)',
}

function EssayCard({ essay, onClick }: { essay: Essay; onClick: () => void }) {
  const isReviewed = Boolean(essay.review)
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      style={{
        ...cardBase,
        padding: '11px 14px',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(40,40,60,0.09)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 18px rgba(40,40,60,0.06)'
      }}
    >
      {/* Title */}
      <p style={{
        fontSize: 13.5, fontWeight: 700, color: 'var(--pt)',
        margin: '0 0 7px', lineHeight: 1.3,
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
      }}>
        {essay.title || 'Untitled'}
      </p>

      {/* Status + Date + Chevron */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {isReviewed ? (
          <span style={{
            fontSize: 9.5, fontWeight: 700,
            color: '#4A7A6A',
            background: 'rgba(100,180,155,0.10)',
            borderRadius: 6, padding: '2px 7px',
            border: '1px solid rgba(100,180,155,0.22)',
            display: 'inline-flex', alignItems: 'center', gap: 3,
            flexShrink: 0,
          }}>
            <Sparkles style={{ width: 7, height: 7 }} strokeWidth={2} />
            AI Reviewed
          </span>
        ) : (
          <span style={{
            fontSize: 9.5, fontWeight: 600,
            color: '#A0A0A8',
            background: 'rgba(140,140,150,0.08)',
            borderRadius: 6, padding: '2px 7px',
            border: '1px solid rgba(140,140,150,0.16)',
            flexShrink: 0,
          }}>
            Draft
          </span>
        )}
        <span style={{ fontSize: 11, color: 'var(--pm)', fontWeight: 400, marginLeft: 'auto' }}>
          {fmtDate(essay.createdAt)}
        </span>
        <ChevronRight style={{ width: 10, height: 10, color: '#C0C0C5', flexShrink: 0 }} strokeWidth={2.2} />
      </div>
    </div>
  )
}

export default function EssaysPage() {
  const router = useRouter()
  const t = useT()
  const [essays, setEssays]   = useState<Essay[]>([])
  const [plan, setPlan]       = useState<'free' | 'premium'>('free')
  const [remaining, setRemaining] = useState(0)
  const [showAll, setShowAll] = useState(false)

  function handleDelete(id: string) {
    deleteEssay(id)
    setEssays(prev => prev.filter(e => e.id !== id))
  }

  const INITIAL_SHOW = 6

  useEffect(() => {
    setEssays(getEssays())
    setPlan(getPlan())
    setRemaining(getReviewsRemaining())
  }, [])

  const maxReviews = plan === 'premium' ? PREMIUM_REVIEW_DAILY : FREE_REVIEW_LIFETIME
  const displayed = showAll ? essays : essays.slice(0, INITIAL_SHOW)
  const hasMore = essays.length > INITIAL_SHOW

  return (
    <div style={{ minHeight: '100dvh' }}>
      <TopNav />

      <div style={{
        maxWidth: 520,
        margin: '0 auto',
        padding: `8px 20px calc(${TAB_BAR_HEIGHT}px + 32px)`,
      }}>

        {/* New Essay button — compact */}
        <button
          type="button"
          onClick={() => router.push('/essays/new')}
          style={{
            ...cardBase,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '13px 0',
            marginTop: 12,
            marginBottom: 10,
            cursor: 'pointer',
            transition: 'transform 0.18s, box-shadow 0.18s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(40,40,80,0.09)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 18px rgba(40,40,60,0.06)'
          }}
        >
          <Plus style={{ width: 14, height: 14, color: '#8E8E93' }} strokeWidth={2.5} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--pm)', letterSpacing: '-0.01em' }}>
            {t('essays_new')}
          </span>
        </button>

        {/* AI Reviews remaining */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            color: '#6E6E73', textTransform: 'uppercase',
          }}>
            AI Reviews
          </span>
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: remaining === 0 ? '#B0B0B8' : '#4A7A6A',
          }}>
            {remaining} / {maxReviews}{plan === 'premium' ? ' Today' : ' Lifetime'}
          </span>
        </div>

        {/* My Essays */}
        {essays.length > 0 ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{
                fontSize: 11, fontWeight: 700, color: '#6E6E73',
                margin: 0, letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                My Essays
              </p>
              <span style={{ fontSize: 12, color: 'var(--pm)', fontWeight: 500 }}>
                {essays.length} Essays
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {displayed.map(essay => (
                <SwipeDeleteRow
                  key={essay.id}
                  onDeleteRequest={() => handleDelete(essay.id)}
                  containerStyle={{ borderRadius: 16 }}
                  contentBg="transparent"
                >
                  <EssayCard
                    essay={essay}
                    onClick={() => router.push(`/essays/${essay.id}`)}
                  />
                </SwipeDeleteRow>
              ))}
            </div>

            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAll(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, width: '100%', marginTop: 12,
                  padding: '11px 0',
                  background: 'var(--pglass)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid var(--pglass-border)',
                  borderRadius: 14, cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, color: '#8E8E93',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.75' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                {showAll ? '접기' : `${essays.length - INITIAL_SHOW}개 더 보기`}
              </button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 56 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 24,
              background: 'var(--pglass)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--pglass-border)',
              boxShadow: '0 6px 20px rgba(40,40,60,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px',
            }}>
              <PenLine size={32} strokeWidth={1.5} color="var(--pm)" />
            </div>
            <p style={{ fontSize: 14, color: '#8E8E93', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>
              {t('essays_empty')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}