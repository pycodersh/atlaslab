'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronRight, Sparkles } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { type Essay, getEssays, getDailyReviewCount, MAX_DAILY_REVIEWS } from '@/lib/essays/storage'
import { useT } from '@/hooks/useT'

const INITIAL_SHOW = 4

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
}

function StackedCardGroup({
  essays,
  onNavigate,
}: {
  essays: Essay[]
  onNavigate: (id: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const CARD_HEIGHT = 120
  const PEEK = 11
  const collapsedHeight = CARD_HEIGHT + (essays.length - 1) * PEEK

  if (!isExpanded) {
    return (
      <div
        style={{ position: 'relative', height: collapsedHeight, cursor: 'pointer' }}
        onClick={() => setIsExpanded(true)}
      >
        {essays.map((essay, idx) => {
          const stackPos = essays.length - 1 - idx
          const scale = 1 - stackPos * 0.018
          const bottom = stackPos * PEEK
          const bgAlpha = 0.88 - stackPos * 0.06
          const rVal = 255 - stackPos * 6
          const gVal = 255 - stackPos * 4
          const bVal = 255 - stackPos * 2
          return (
            <div
              key={essay.id}
              style={{
                position: 'absolute',
                left: 0, right: 0,
                bottom,
                transform: `scale(${scale})`,
                transformOrigin: 'bottom center',
                zIndex: idx + 1,
                background: idx === essays.length - 1
                  ? 'rgba(255,255,255,0.94)'
                  : `rgba(${rVal},${gVal},${bVal},${bgAlpha})`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: 28,
                border: '1px solid rgba(255,255,255,0.82)',
                boxShadow: `0 ${4 + stackPos * 2}px ${12 + stackPos * 6}px rgba(40,40,60,${0.05 + stackPos * 0.015})`,
                padding: idx === essays.length - 1 ? '22px 22px 18px' : '18px 22px 14px',
                transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                overflow: 'hidden',
              }}
            >
              {idx === essays.length - 1 ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <p style={{
                      fontSize: 16, fontWeight: 700, color: '#1C1C1E',
                      margin: 0, lineHeight: 1.35, flex: 1, minWidth: 0,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                    }}>
                      {essay.title}
                    </p>
                    <div style={{
                      flexShrink: 0, width: 26, height: 26, borderRadius: 9,
                      background: 'rgba(240,243,248,0.9)',
                      border: '1px solid rgba(220,228,240,0.6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ChevronRight style={{ width: 12, height: 12, color: '#8E8E93' }} strokeWidth={2.2} />
                    </div>
                  </div>
                  <p style={{
                    fontSize: 13, color: '#6E6E73', margin: '0 0 14px',
                    lineHeight: 1.65, overflow: 'hidden',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {essay.body.slice(0, 120).replace(/\n/g, ' ')}{essay.body.length > 120 ? '…' : ''}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    <span style={{
                      fontSize: 10.5, color: '#8E8E93', fontWeight: 500,
                      background: 'rgba(240,243,248,0.85)', borderRadius: 8, padding: '3px 9px',
                      border: '1px solid rgba(220,228,240,0.5)',
                    }}>
                      {fmtDate(essay.createdAt)}
                    </span>
                    {essay.review?.detectedStyle && (
                      <span style={{
                        fontSize: 10.5, color: '#6E6E73', fontWeight: 500,
                        background: 'rgba(240,243,248,0.85)', borderRadius: 8, padding: '3px 9px',
                        border: '1px solid rgba(220,228,240,0.5)',
                      }}>
                        {essay.review.detectedStyle}
                      </span>
                    )}
                    {!!essay.review && (
                      <span style={{
                        fontSize: 10.5, color: '#27AE60', fontWeight: 700,
                        background: 'rgba(39,174,96,0.08)', borderRadius: 8, padding: '3px 9px',
                        border: '1px solid rgba(39,174,96,0.15)',
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                      }}>
                        AI 첨삭
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <p style={{
                  fontSize: 14, fontWeight: 600,
                  color: `rgba(28,28,30,${0.5 - stackPos * 0.1})`,
                  margin: 0, lineHeight: 1.35,
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                }}>
                  {essay.title}
                </p>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          style={{
            fontSize: 11, fontWeight: 600, color: '#6E6E73',
            background: 'rgba(240,243,248,0.9)',
            border: '1px solid rgba(220,228,240,0.6)',
            borderRadius: 10, padding: '5px 12px', cursor: 'pointer',
          }}
        >
          접기
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[...essays].reverse().map((essay) => (
          <div
            key={essay.id}
            onClick={() => onNavigate(essay.id)}
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 28,
              border: '1px solid rgba(255,255,255,0.85)',
              boxShadow: '0 12px 32px rgba(40,40,60,0.08), 0 2px 8px rgba(40,40,60,0.04)',
              padding: '22px 22px 18px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.015) translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 20px 44px rgba(40,40,60,0.12), 0 4px 12px rgba(40,40,60,0.06)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)'
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(40,40,60,0.08), 0 2px 8px rgba(40,40,60,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
              <p style={{
                fontSize: 16, fontWeight: 700, color: '#1C1C1E',
                margin: 0, lineHeight: 1.35, flex: 1, minWidth: 0,
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
              }}>
                {essay.title}
              </p>
              <div style={{
                flexShrink: 0, width: 26, height: 26, borderRadius: 9,
                background: 'rgba(240,243,248,0.9)',
                border: '1px solid rgba(220,228,240,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ChevronRight style={{ width: 12, height: 12, color: '#8E8E93' }} strokeWidth={2.2} />
              </div>
            </div>
            <p style={{
              fontSize: 13, color: '#6E6E73', margin: '0 0 14px',
              lineHeight: 1.65, overflow: 'hidden',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {essay.body.slice(0, 120).replace(/\n/g, ' ')}{essay.body.length > 120 ? '…' : ''}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              <span style={{
                fontSize: 10.5, color: '#8E8E93', fontWeight: 500,
                background: 'rgba(240,243,248,0.85)', borderRadius: 8, padding: '3px 9px',
                border: '1px solid rgba(220,228,240,0.5)',
              }}>
                {fmtDate(essay.createdAt)}
              </span>
              {essay.review?.detectedStyle && (
                <span style={{
                  fontSize: 10.5, color: '#6E6E73', fontWeight: 500,
                  background: 'rgba(240,243,248,0.85)', borderRadius: 8, padding: '3px 9px',
                  border: '1px solid rgba(220,228,240,0.5)',
                }}>
                  {essay.review.detectedStyle}
                </span>
              )}
              {!!essay.review && (
                <span style={{
                  fontSize: 10.5, color: '#27AE60', fontWeight: 700,
                  background: 'rgba(39,174,96,0.08)', borderRadius: 8, padding: '3px 9px',
                  border: '1px solid rgba(39,174,96,0.15)',
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                }}>
                  <Sparkles style={{ width: 9, height: 9 }} strokeWidth={2} />
                  AI 첨삭
                </span>
              )}
            </div>
          </div>
        ))}
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

  const GROUP_SIZE = 3
  const groups: Essay[][] = []
  for (let i = 0; i < displayed.length; i += GROUP_SIZE) {
    groups.push(displayed.slice(i, i + GROUP_SIZE))
  }

  return (
    <div style={{ minHeight: '100dvh' }}>
      <TopNav />

      <div style={{
        maxWidth: 540,
        margin: '0 auto',
        padding: `var(--pnav-h) 20px calc(${TAB_BAR_HEIGHT}px + 32px)`,
      }}>

        {/* Page header */}
        <div style={{ paddingTop: 28, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <p style={{
                fontSize: 38, fontWeight: 900,
                letterSpacing: '-0.04em', lineHeight: 1,
                color: '#1C1C1E', margin: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}>
                ESSAYS
              </p>
              <p style={{
                fontSize: 14, color: '#6E6E73',
                margin: '8px 0 0', lineHeight: 1.5,
                fontWeight: 400, letterSpacing: '-0.01em',
              }}>
                쓰고, 돌아보고, 성장하세요.
              </p>
            </div>

            <div style={{
              flexShrink: 0,
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.85)',
              boxShadow: '0 4px 16px rgba(40,40,60,0.06)',
              padding: '12px 16px',
              textAlign: 'center',
              minWidth: 72,
            }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 5, justifyContent: 'center' }}>
                {Array.from({ length: MAX_DAILY_REVIEWS }).map((_, i) => (
                  <div key={i} style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: i < reviewCount ? 'rgba(142,142,147,0.3)' : 'rgba(100,160,255,0.55)',
                  }} />
                ))}
              </div>
              <span style={{
                fontSize: 12, fontWeight: 800,
                color: remaining === 0 ? '#8E8E93' : '#1C1C1E',
                letterSpacing: '-0.02em',
              }}>
                {remaining}/{MAX_DAILY_REVIEWS}
              </span>
              <div style={{ fontSize: 9.5, color: '#8E8E93', fontWeight: 500, marginTop: 2 }}>
                남은 첨삭
              </div>
            </div>
          </div>
        </div>

        {/* New Essay card */}
        <button
          type="button"
          onClick={() => router.push('/essays/new')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            width: '100%',
            marginBottom: 32,
            padding: '20px 0',
            background: 'rgba(255,255,255,0.70)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1.5px dashed rgba(180,200,230,0.55)',
            borderRadius: 24,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(40,40,80,0.05)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.85)'
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(40,40,80,0.09)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.70)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(40,40,80,0.05)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(100,160,255,0.12)',
            border: '1px solid rgba(140,190,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Plus style={{ width: 17, height: 17, color: '#5A9CF0' }} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#3A3A3C', letterSpacing: '-0.01em' }}>
            New Essay
          </span>
        </button>

        {/* My Essays */}
        {essays.length > 0 ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <p style={{
                fontSize: 17, fontWeight: 800, color: '#1C1C1E',
                margin: 0, letterSpacing: '-0.02em',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}>
                My Essays
              </p>
              <span style={{
                fontSize: 12, color: '#8E8E93', fontWeight: 600,
                background: 'rgba(240,243,248,0.85)',
                borderRadius: 9, padding: '3px 10px',
                border: '1px solid rgba(220,228,240,0.5)',
              }}>
                {essays.length}개
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {groups.map((group, gi) => (
                <StackedCardGroup
                  key={gi}
                  essays={group}
                  onNavigate={(id) => router.push(`/essays/${id}`)}
                />
              ))}
            </div>

            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAll(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, width: '100%', marginTop: 24,
                  padding: '14px 0',
                  background: 'rgba(255,255,255,0.68)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.82)',
                  borderRadius: 16, cursor: 'pointer',
                  fontSize: 12.5, fontWeight: 600, color: '#6E6E73',
                  boxShadow: '0 2px 12px rgba(40,40,60,0.05)',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.8' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                {showAll ? '접기' : `${essays.length - INITIAL_SHOW}개 더 보기`}
              </button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 56 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 28,
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.85)',
              boxShadow: '0 8px 24px rgba(40,40,60,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <span style={{ fontSize: 36 }}>✍️</span>
            </div>
            <p style={{
              fontSize: 15, color: '#6E6E73',
              lineHeight: 1.8, margin: 0,
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