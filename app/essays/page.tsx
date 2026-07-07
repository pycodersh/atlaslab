'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronRight, Sparkles, PenLine } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { type Essay, getEssays, getDailyReviewCount, MAX_DAILY_REVIEWS } from '@/lib/essays/storage'
import { useT } from '@/hooks/useT'

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
}

// Shared card style
const cardBase: React.CSSProperties = {
  background: 'var(--pglass)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: 20,
  border: '1px solid var(--pglass-border)',
  boxShadow: '0 4px 18px rgba(40,40,60,0.06), 0 1px 4px rgba(40,40,60,0.03)',
}

// AI 첨삭 chip — gray-mint, low saturation
const aiChipStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700,
  color: '#4A7A6A',
  background: 'rgba(100,180,155,0.10)',
  borderRadius: 7, padding: '2px 8px',
  border: '1px solid rgba(100,180,155,0.22)',
  display: 'inline-flex', alignItems: 'center', gap: 3,
}

function EssayCard({ essay, onClick }: { essay: Essay; onClick: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      style={{
        ...cardBase,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'transform 0.18s, box-shadow 0.18s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(40,40,60,0.10), 0 2px 6px rgba(40,40,60,0.05)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 18px rgba(40,40,60,0.06), 0 1px 4px rgba(40,40,60,0.03)'
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
        <p style={{
          fontSize: 14, fontWeight: 700, color: 'var(--pt)',
          margin: 0, lineHeight: 1.3, flex: 1, minWidth: 0,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
        }}>
          {essay.title || 'Untitled'}
        </p>
        <ChevronRight style={{ width: 11, height: 11, color: '#C0C0C5', flexShrink: 0, marginTop: 2 }} strokeWidth={2.2} />
      </div>

      {/* Body preview */}
      <p style={{
        fontSize: 12, color: '#8E8E93', margin: '0 0 10px',
        lineHeight: 1.6, overflow: 'hidden',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}>
        {essay.body.slice(0, 110).replace(/\n/g, ' ')}{essay.body.length > 110 ? '…' : ''}
      </p>

      {/* Chips row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {essay.review ? (
          <span style={aiChipStyle}>
            <Sparkles style={{ width: 8, height: 8 }} strokeWidth={2} />
            AI 첨삭 완료
          </span>
        ) : (
          <span style={{
            fontSize: 10, fontWeight: 600,
            color: '#A0A0A8',
            background: 'rgba(140,140,150,0.08)',
            borderRadius: 7, padding: '2px 8px',
            border: '1px solid rgba(140,140,150,0.16)',
            display: 'inline-flex', alignItems: 'center',
          }}>
            AI 첨삭 미완료
          </span>
        )}
        <span style={{ fontSize: 9.5, color: '#B0B0B8', fontWeight: 500, marginLeft: 'auto' }}>
          {fmtDate(essay.createdAt)}
        </span>
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

  const INITIAL_SHOW = 6

  useEffect(() => {
    setEssays(getEssays())
    setReviewCount(getDailyReviewCount())
  }, [])

  const remaining = MAX_DAILY_REVIEWS - reviewCount
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

        {/* ── New Essay card — glass style, no dashed border ── */}
        <button
          type="button"
          onClick={() => router.push('/essays/new')}
          style={{
            ...cardBase,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            width: '100%',
            padding: '24px 0',
            marginTop: 12,
            marginBottom: 10,
            border: '1px solid var(--pglass-border)',
            cursor: 'pointer',
            transition: 'all 0.18s',
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
          <div style={{
            width: 28, height: 28, borderRadius: 9,
            background: 'rgba(140,140,150,0.09)',
            border: '1px solid rgba(140,140,150,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Plus style={{ width: 15, height: 15, color: '#8E8E93' }} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)', letterSpacing: '-0.01em' }}>
            New Essay
          </span>
        </button>

        {/* AI 첨삭 남은 횟수 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {Array.from({ length: MAX_DAILY_REVIEWS }).map((_, i) => (
              <div key={i} style={{
                width: 4.5, height: 4.5, borderRadius: '50%',
                background: i < reviewCount ? 'rgba(142,142,147,0.22)' : 'rgba(100,175,155,0.50)',
              }} />
            ))}
            <span style={{
              fontSize: 10.5, fontWeight: 600,
              color: remaining === 0 ? '#B0B0B8' : '#4A7A6A',
              marginLeft: 3,
            }}>
              AI 첨삭 {remaining}회 남음
            </span>
          </div>
        </div>

        {/* ── My Essays ── */}
        {essays.length > 0 ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{
                fontSize: 13, fontWeight: 700, color: '#6E6E73',
                margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                My Essays
              </p>
              <span style={{
                fontSize: 11, color: '#B0B0B8', fontWeight: 600,
              }}>
                {essays.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {displayed.map(essay => (
                <EssayCard
                  key={essay.id}
                  essay={essay}
                  onClick={() => router.push(`/essays/${essay.id}`)}
                />
              ))}
            </div>

            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAll(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, width: '100%', marginTop: 16,
                  padding: '12px 0',
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
