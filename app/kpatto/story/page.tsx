'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Lock } from 'lucide-react'
import { usePreferences } from '@/contexts/PreferencesContext'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { ALL_STORIES } from '@/data/kpatto/sample-episode'
import { useKPattoSubscription } from '@/lib/kpatto/subscription'
import { createClient } from '@/lib/supabase/client'
import { FREE_EPISODES } from '@/lib/kpatto/config'
import { getEpisodeProgressMap, type EpProgressMap } from '@/lib/kpatto/episode-progress'

type EpItem = { id: string; episode: number; title: string; title_en: string | null; theme: string; thumbnail_url: string }

const T1     = '#111111'
const T2     = '#999999'
const ACCENT = '#D4873A'
const GREEN  = '#22C55E'
const MAX_VIEWS = 5

// ── 상태 배지 ────────────────────────────────────────────────────────────────

function EpisodeStatus({ count }: { count: number }) {
  const displayCount = Math.min(count, MAX_VIEWS)
  if (displayCount >= MAX_VIEWS) {
    return <span style={{ fontSize: 12, color: ACCENT, fontWeight: 700 }}>Mastered! 🏆</span>
  }
  if (displayCount > 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: MAX_VIEWS }, (_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i < displayCount ? ACCENT : '#E0E0E0',
              flexShrink: 0,
            }} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600 }}>{displayCount}/{MAX_VIEWS}</span>
      </div>
    )
  }
  return <span style={{ fontSize: 12, color: T2 }}>Not started yet</span>
}

// ── 완료 체크 오버레이 (썸네일 우상단) ─────────────────────────────────────

function CompletedBadge() {
  return (
    <div style={{
      position: 'absolute', top: 5, right: 5,
      width: 22, height: 22, borderRadius: '50%',
      background: GREEN,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
    }}>
      <svg viewBox="0 0 12 12" width="12" height="12">
        <polyline
          points="2,6.5 4.5,9 10,3"
          fill="none" stroke="#FFFFFF"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}


// ── 메인 ─────────────────────────────────────────────────────────────────────

export default function KPattoStoryListPage() {
  usePreferences()
  const { isPro } = useKPattoSubscription()

  const [progressMap, setProgressMap]   = useState<EpProgressMap>(new Map())
  const [nextEpNum,   setNextEpNum]     = useState<number>(0)   // 0 = 아직 모름
  const [dbEpisodes,  setDbEpisodes]    = useState<EpItem[]>([])

  const nextEpRef = useRef<HTMLDivElement | null>(null)

  // ── 완료 진행도 로드 ──────────────────────────────────────────────────────
  useEffect(() => {
    getEpisodeProgressMap().then(map => {
      setProgressMap(map)
      const maxDone = map.size > 0 ? Math.max(...map.keys()) : 0
      setNextEpNum(Math.min(maxDone + 1, 100))
    })
  }, [])

  // ── 다음 화 위치로 자동 스크롤 ───────────────────────────────────────────
  useEffect(() => {
    if (nextEpNum > 1 && nextEpRef.current) {
      // 목록이 렌더링될 시간을 주고 스크롤
      const t = setTimeout(() => {
        nextEpRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 350)
      return () => clearTimeout(t)
    }
  }, [nextEpNum])

  // ── DB에서 에피소드 메타 로드 ─────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('kp_episodes')
      .select('episode_num, title, title_en, theme')
      .order('episode_num')
      .then(({ data }) => {
        if (!data) return
        setDbEpisodes(data.map(r => {
          const epNum = r.episode_num as number
          const epId  = `kp-ep-${String(epNum).padStart(3, '0')}`
          const staticStory = ALL_STORIES.find(s => s.id === epId)
          return {
            id:            epId,
            episode:       epNum,
            title:         r.title as string,
            title_en:      (r.title_en as string | null) ?? null,
            theme:         (r.theme ?? '') as string,
            thumbnail_url: staticStory?.thumbnail_url
              ?? `/kpatto/ep-${String(epNum).padStart(3, '0')}/ep${epNum}_c1.png`,
          }
        }))
      })
  }, [])

  const episodes = dbEpisodes.length > 0
    ? dbEpisodes
    : ALL_STORIES.map(s => ({ ...s, title_en: s.title_en ?? null, thumbnail_url: s.thumbnail_url ?? '/kpatto/banners/ep1.png' }))

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: `calc(${KPATTO_TAB_BAR_HEIGHT + 16}px + env(safe-area-inset-bottom, 0px))` }}>
      <KPattoHeader />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 16px 0' }}>

        {episodes.map((story) => {
          const prog   = progressMap.get(story.episode)
          const count  = prog?.completed_count ?? 0
          const isDone = count > 0
          const isNext = story.episode === nextEpNum
          const locked = story.episode > FREE_EPISODES && !isPro

          return (
            <div
              key={story.id}
              ref={isNext ? nextEpRef : undefined}
              style={{
                display: 'flex', alignItems: 'stretch',
                borderRadius: 16,
                border: isNext
                  ? `2px solid ${ACCENT}`
                  : '1px solid #E0E0E0',
                boxShadow: isNext
                  ? `0 0 0 3px ${ACCENT}22, 0 2px 8px rgba(0,0,0,0.10)`
                  : '0 1px 4px rgba(0,0,0,0.08)',
                background: locked ? '#FAFAFA' : '#FFFFFF',
                overflow: 'hidden',
                minHeight: 100,
                opacity: locked ? 0.75 : 1,
              }}
            >
              {/* Thumbnail */}
              <div style={{ padding: '10px 0 10px 10px', flexShrink: 0 }}>
                <div style={{ position: 'relative', width: 120, height: 80, borderRadius: 12, overflow: 'hidden', background: '#F7F7F7' }}>
                  <Image
                    src={story.thumbnail_url}
                    alt={story.title}
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center center', filter: locked ? 'grayscale(0.4)' : 'none' }}
                    sizes="120px"
                  />
                  {locked && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.18)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Lock size={20} color="#FFFFFF" strokeWidth={2} />
                    </div>
                  )}
                  {/* 완료 체크 (잠금 아닌 경우에만) */}
                  {isDone && !locked && <CompletedBadge />}
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0, padding: '12px 8px 12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
                {/* EP 번호 + 제목 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: T1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                    <span style={{ color: locked ? T2 : ACCENT }}>EP {String(story.episode).padStart(2, '0')}</span>
                    <span style={{ color: T2, fontWeight: 400 }}> · </span>
                    {story.title}
                  </div>
                </div>
                {/* 영어 제목 */}
                {story.title_en && (
                  <div style={{ fontSize: 11, color: T2, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {story.title_en}
                  </div>
                )}
                {/* 진행 상태 */}
                <div style={{ marginTop: 2 }}>
                  {locked
                    ? <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600 }}>Pro only</span>
                    : <EpisodeStatus count={count} />
                  }
                </div>
              </div>

              {/* Chevron */}
              <Link
                href={`/kpatto/story/${story.id}`}
                style={{ display: 'flex', alignItems: 'center', padding: '0 12px', textDecoration: 'none', flexShrink: 0 }}
                aria-label={`View ${story.title}`}
              >
                <ChevronRight size={20} color="#999999" />
              </Link>
            </div>
          )
        })}

        <div style={{ height: 4 }} />
      </div>
    </div>
  )
}
