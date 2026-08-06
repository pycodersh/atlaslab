'use client'

import { Fragment, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { useKPattoSubscription } from '@/lib/kpatto/subscription'
import { FREE_EPISODES } from '@/lib/kpatto/config'
import { getEpisodeProgressMap, type EpProgressMap } from '@/lib/kpatto/episode-progress'

// ── 토큰 ──────────────────────────────────────────────────────────────────────
const ACCENT = '#D4873A'
const T1     = '#111111'
const T2     = '#888888'
const T3     = '#BBBBBB'
const BG     = '#FFFFFF'
const BORDER = '#EBEBEB'

// ── 섹션 라벨 (카드 제목 공통) ──────────────────────────────────────────────────
const SECTION_LABEL: React.CSSProperties = {
  fontSize:      10,
  fontWeight:    700,
  color:         T2,
  letterSpacing: '0.10em',
}

const TOTAL_EPISODES    = 100
const TOTAL_EXPRESSIONS = 325  // DB kp_expressions 실측값

// ── 녹색 5단계 ────────────────────────────────────────────────────────────────
function epColor(count: number, locked: boolean): string {
  if (locked || count === 0) return '#EBEBEB'
  if (count === 1)           return '#EAF3DE'
  if (count === 2)           return '#C0DD97'
  if (count === 3)           return '#97C459'
  return '#639922'  // 4회 이상
}

const LEGEND_COLORS = ['#EBEBEB', '#EAF3DE', '#C0DD97', '#97C459', '#639922']

// ── 이번 주 월요일 ISO (기기 로컬 시간 기준) ─────────────────────────────────
function getThisWeekMondayISO(): string {
  const now  = new Date()
  const diff = now.getDay() === 0 ? 6 : now.getDay() - 1  // 0=일 → 6칸 전
  const mon  = new Date(now)
  mon.setDate(now.getDate() - diff)
  mon.setHours(0, 0, 0, 0)
  return mon.toISOString()
}

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: BG,
      border: `1px solid ${BORDER}`,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function KPattoRecordPage() {
  const router           = useRouter()
  const { isPro }        = useKPattoSubscription()

  const [progressMap, setProgressMap] = useState<EpProgressMap>(new Map())
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    getEpisodeProgressMap().then(map => {
      setProgressMap(map)
      setLoading(false)
    })
  }, [])

  // ── 통계 계산 ────────────────────────────────────────────────────────────
  const totalCompleted = progressMap.size  // 완료된 에피소드 수 (count > 0)

  const mondayISO = getThisWeekMondayISO()
  let weekEpisodes = 0
  for (const [, rec] of progressMap) {
    if (rec.completed_at >= mondayISO) weekEpisodes++
  }

  // 반복 카운트 미구현 → 0
  const masteredExpr = 0
  const learningExpr = 0

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>
      <KPattoHeader />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 16px 0' }}>

        {/* ── [1] This Week ─────────────────────────────────────────────── */}
        <Card>
          {/* 카드 헤더 — Episodes·Expressions 카드와 동일한 위치·크기 */}
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '14px 14px 10px',
          }}>
            <span style={SECTION_LABEL}>THIS WEEK</span>
          </div>
          {/* 두 숫자 (여백으로만 구분 — 선 없음) */}
          <div style={{ display: 'flex' }}>
            {([
              { label: 'Episodes',    value: weekEpisodes },
              { label: 'Expressions', value: 0 },
            ] as { label: string; value: number }[]).map(({ label, value }) => (
              <div
                key={label}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '16px 0 16px',
                }}
              >
                <div style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: value > 0 ? ACCENT : T3,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                }}>
                  {value}
                </div>
                <div style={{ fontSize: 12, color: T2, marginTop: 6, fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── [2] Episodes 10×10 격자 ──────────────────────────────────── */}
        <Card>
          {/* 카드 헤더 */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 14px 10px',
          }}>
            <span style={SECTION_LABEL}>EPISODES</span>
            <span style={{ fontSize: 13, color: T2 }}>
              <span style={{ fontWeight: 700, color: loading ? T3 : T1 }}>{totalCompleted}</span>
              {' '}of {TOTAL_EPISODES}
            </span>
          </div>

          {/* 격자 본체 */}
          <div style={{ padding: '0 12px 10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {Array.from({ length: 10 }, (_, rowIdx) => {
                const rowStart = rowIdx * 10 + 1

                return (
                  <Fragment key={rowIdx}>
                    {/* 행 번호 + 10개 셀 */}
                    <div style={{ display: 'flex', alignItems: 'stretch', gap: 4 }}>

                      {/* 행 시작 번호 */}
                      <div style={{
                        width: 20,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 9,
                        color: T3,
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {rowStart}
                      </div>

                      {/* 10칸 grid */}
                      <div style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(10, 1fr)',
                        gap: 3,
                      }}>
                        {Array.from({ length: 10 }, (_, colIdx) => {
                          const ep     = rowStart + colIdx
                          const rec    = progressMap.get(ep)
                          const count  = rec?.completed_count ?? 0
                          const locked = ep > FREE_EPISODES && !isPro
                          const epId   = `kp-ep-${String(ep).padStart(3, '0')}`

                          return (
                            <button
                              key={ep}
                              onClick={() => {
                                if (locked) router.push('/kpatto/subscription')
                                else        router.push(`/kpatto/story/${epId}`)
                              }}
                              title={`EP${String(ep).padStart(2, '0')}${locked ? ' (Pro)' : ` · ${count}회 완료`}`}
                              style={{
                                aspectRatio: '1',
                                background: loading ? '#F0F0F0' : epColor(count, locked),
                                borderRadius: 3,
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'block',
                                WebkitTapHighlightColor: 'transparent',
                                transition: 'opacity 0.2s',
                              }}
                              aria-label={`EP${String(ep).padStart(2, '0')}${locked ? ' Pro' : ''}`}
                            />
                          )
                        })}
                      </div>
                    </div>

                    {/* EP01~10 아래 Pro 경계선 */}
                    {rowIdx === 0 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        margin: '1px 0',
                        paddingLeft: 24,  // 행 번호 너비(20) + gap(4) 만큼 들여씀
                      }}>
                        <div style={{ flex: 1, height: 1, background: BORDER }} />
                        <span style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: T3,
                          letterSpacing: '0.08em',
                        }}>PRO</span>
                        <div style={{ flex: 1, height: 1, background: BORDER }} />
                      </div>
                    )}
                  </Fragment>
                )
              })}
            </div>

            {/* 범례: Less □□□□□ More */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 3,
              marginTop: 10,
              paddingRight: 2,
            }}>
              <span style={{ fontSize: 9, color: T3, marginRight: 1 }}>Less</span>
              {LEGEND_COLORS.map((color, i) => (
                <div key={i} style={{
                  width: 10, height: 10,
                  borderRadius: 2,
                  background: color,
                  border: i === 0 ? `1px solid ${BORDER}` : 'none',
                }} />
              ))}
              <span style={{ fontSize: 9, color: T3, marginLeft: 1 }}>More</span>
            </div>
          </div>
        </Card>

        {/* ── [3] Expressions 카드 ────────────────────────────────────── */}
        <Card>
          {/* 카드 헤더 */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px 8px',
          }}>
            <span style={SECTION_LABEL}>EXPRESSIONS</span>
            <span style={{ fontSize: 13, color: T2 }}>
              <span style={{ fontWeight: 700, color: T1 }}>{masteredExpr + learningExpr}</span>
              {' '}of {TOTAL_EXPRESSIONS}
            </span>
          </div>

          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* 설명문 */}
            <p style={{
              fontSize: 12, color: T2,
              margin: 0, lineHeight: 1.55,
            }}>
              Built on Korea&apos;s national Korean curriculum —
              levels 1 through 3, from beginner to early intermediate.
            </p>

            {/* 가로 막대 */}
            <div style={{
              height: 8, borderRadius: 99,
              background: BORDER,
              overflow: 'hidden',
              display: 'flex',
            }}>
              <div style={{
                width: `${(masteredExpr / TOTAL_EXPRESSIONS) * 100}%`,
                background: ACCENT,
                borderRadius: 99,
                transition: 'width 0.5s ease',
              }} />
              <div style={{
                width: `${(learningExpr / TOTAL_EXPRESSIONS) * 100}%`,
                background: `${ACCENT}88`,
                borderRadius: 99,
                transition: 'width 0.5s ease',
              }} />
            </div>

            {/* 범례 */}
            <div style={{ display: 'flex', gap: 16 }}>
              {([
                { label: 'Mastered', count: masteredExpr, color: ACCENT },
                { label: 'Learning', count: learningExpr, color: `${ACCENT}88` },
              ] as { label: string; count: number; color: string }[]).map(({ label, count, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: T2 }}>{label} </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T1 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}
