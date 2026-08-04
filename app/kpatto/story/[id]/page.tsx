'use client'

import { use, useState, useCallback, useEffect } from 'react'
import { notFound, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePreferences } from '@/contexts/PreferencesContext'
import { StoryPanel } from '@/components/kpatto/StoryPanel'
import { WebtoonEpisode } from '@/components/kpatto/WebtoonEpisode'
import { ChallengeSection } from '@/components/kpatto/ChallengeSection'
import { KPattoPaywall } from '@/components/kpatto/KPattoPaywall'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { ALL_STORIES } from '@/data/kpatto/sample-episode'
import { useKPattoSubscription } from '@/lib/kpatto/subscription'
import { fetchWebtoonEpisode, fetchEpisodeChallenges, advanceEpisodeRound } from '@/lib/kpatto/fetch-episode'
import type { WebtoonEpisodeData } from '@/data/kpatto/webtoon-types'
import { EP001_POOL, type RawQuestion } from '@/data/kpatto/challenge-pool-ep001'
import { EP002_POOL } from '@/data/kpatto/challenge-pool-ep002'
import { EP003_POOL } from '@/data/kpatto/challenge-pool-ep003'
import { EP004_POOL } from '@/data/kpatto/challenge-pool-ep004'
import { EP005_POOL } from '@/data/kpatto/challenge-pool-ep005'
import { EP006_POOL } from '@/data/kpatto/challenge-pool-ep006'
import { EP007_POOL } from '@/data/kpatto/challenge-pool-ep007'
import { EP008_POOL } from '@/data/kpatto/challenge-pool-ep008'
import { EP009_POOL } from '@/data/kpatto/challenge-pool-ep009'
import { EP010_POOL } from '@/data/kpatto/challenge-pool-ep010'
import { getUI } from '@/lib/kpatto/ui-strings'
import { onStoryComplete } from '@/lib/srs/storage'
import type { KPattoLanguage } from '@/data/kpatto/types'
import type { Question } from '@/components/kpatto/ChallengeSection'
import { generateChallenge } from '@/lib/kpatto/generate-challenge'
import { FREE_EPISODES } from '@/lib/kpatto/config'

const EPISODE_POOLS: Record<string, RawQuestion[]> = {
  'kp-ep-001': EP001_POOL,
  'kp-ep-002': EP002_POOL,
  'kp-ep-003': EP003_POOL,
  'kp-ep-004': EP004_POOL,
  'kp-ep-005': EP005_POOL,
  'kp-ep-006': EP006_POOL,
  'kp-ep-007': EP007_POOL,
  'kp-ep-008': EP008_POOL,
  'kp-ep-009': EP009_POOL,
  'kp-ep-010': EP010_POOL,
}

interface PageProps {
  params: Promise<{ id: string }>
}

function WelcomeBanner() {
  const { prefs } = usePreferences()
  const ui = getUI(prefs.language)
  return (
    <div style={{
      margin: '0 16px 16px',
      background: 'linear-gradient(135deg, #22C55E18, #16A34A18)',
      border: '1.5px solid #22C55E40',
      borderRadius: 14,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <span style={{ fontSize: 22 }}>🎉</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>{ui.sv_welcome_heading}</div>
        <div style={{ fontSize: 12, color: '#16A34A' }}>{ui.sv_welcome_body}</div>
      </div>
    </div>
  )
}

export default function KPattoStoryPage({ params }: PageProps) {
  const { id } = use(params)
  const { prefs } = usePreferences()
  const ui = getUI(prefs.language)
  const router = useRouter()
  const searchParams = useSearchParams()
  const showWelcome = searchParams.get('welcome') === '1'
  const story = ALL_STORIES.find(s => s.id === id)
  const epNumFromId = parseInt(id.match(/kp-ep-(\d+)/)?.[1] ?? '0')

  // Completely invalid ID (not kp-ep-NNN format and not in static list)
  if (!story && !epNumFromId) notFound()

  const epNum = story?.episode ?? epNumFromId

  const [challengeDone, setChallengeDone] = useState(false)
  const [challengeQuestions, setChallengeQuestions] = useState<Question[] | null>(null)
  const [webtoonEpisode, setWebtoonEpisode] = useState<WebtoonEpisodeData | null>(null)
  const [webtoonLoading, setWebtoonLoading] = useState(true)
  const { isPro, loading: subLoading } = useKPattoSubscription()

  useEffect(() => {
    const pool = EPISODE_POOLS[id]
    if (pool) setChallengeQuestions(generateChallenge(pool))

    fetchEpisodeChallenges(id).then(dbQ => {
      if (dbQ.length > 0) setChallengeQuestions(dbQ)
    })

    const epNumber = parseInt(id.match(/kp-ep-(\d+)/)?.[1] ?? '0')

    if (epNumber <= FREE_EPISODES) {
      // Free episode: fetch directly from Supabase client
      fetchWebtoonEpisode(id).then(ep => {
        setWebtoonEpisode(ep)
        setWebtoonLoading(false)
      })
    } else {
      // Pro episode: go through server-gated API route (dialogue text never sent to non-subscribers)
      fetch(`/api/kpatto/episode/${id}`)
        .then(async r => {
          if (!r.ok) return null
          return r.json() as Promise<import('@/data/kpatto/webtoon-types').WebtoonEpisodeData>
        })
        .then(ep => {
          if (ep) setWebtoonEpisode(ep)
          setWebtoonLoading(false)
        })
        .catch(() => setWebtoonLoading(false))
    }
  }, [id])

  const handleChallengeComplete = useCallback(() => {
    if (story) onStoryComplete(story.episode, story.title)
    advanceEpisodeRound(id)
    setChallengeDone(true)
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, 300)
  }, [story, id])

  // After loading: if no static story and DB also returned nothing, 404
  if (!webtoonLoading && !story && !webtoonEpisode) notFound()

  const isProEpisode = epNum > FREE_EPISODES
  const isLocked = isProEpisode && !subLoading && !isPro

  // Map PATTO's Language type to KPattoLanguage (they share the same values)
  const displayLang = (prefs.language ?? 'en') as KPattoLanguage

  // Loading state — don't expose content before subscription is confirmed
  if (isProEpisode && subLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #F2F2F2', borderTop: '3px solid #D4873A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // Locked — show paywall only, no content in DOM
  if (isLocked) {
    return <KPattoPaywall onDismiss={() => router.back()} />
  }

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: KPATTO_TAB_BAR_HEIGHT + 32,
      maxWidth: 430,
      margin: '0 auto',
      background: '#FFFFFF',
    }}>
      {/* Top bar — only for non-webtoon (classic) layout */}
      {!webtoonLoading && !webtoonEpisode && (
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: '#FFFFFF',
          borderBottom: '1px solid #F2F2F2',
          padding: '0 16px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <Link href="/kpatto/story" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#111111', flexShrink: 0 }}>
            <ChevronLeft size={22} strokeWidth={2} />
          </Link>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              EP {String(epNum).padStart(2, '0')} · {story?.title ?? ''}
            </div>
            {story?.title_en && (
              <div style={{ fontSize: 11, color: '#999999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {story.title_en}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Welcome banner (shown after pre-course completion) */}
      {showWelcome && <WelcomeBanner />}

      {/* Story panels — webtoon or classic layout */}
      <div>
        {webtoonLoading ? (
          <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 28, height: 28, border: '3px solid #F2F2F2', borderTop: '3px solid #D4873A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : webtoonEpisode ? (
          <WebtoonEpisode
            episode={webtoonEpisode}
            episodeLabel={`EP ${String(epNum).padStart(2, '0')}`}
            storyTitle={story?.title ?? webtoonEpisode?.title ?? ''}
            singleColumn={epNum >= 31}
          />
        ) : (
          <div style={{ paddingTop: 16 }}>
            {story?.panels.map((panel, index) => (
              <StoryPanel
                key={panel.id}
                panel={panel}
                panelIndex={index}
                patterns={{}}
                displayLang={displayLang}
              />
            ))}
          </div>
        )}
      </div>

      {/* Challenge section */}
      {!challengeDone && challengeQuestions && (
        <ChallengeSection onComplete={handleChallengeComplete} questions={challengeQuestions} />
      )}

      {/* Completion footer — only after challenge */}
      {challengeDone && (
        <div style={{
          margin: '24px 16px 0',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 2px 20px rgba(0,0,0,0.07)',
        }}>
          {/* Upper — cream background */}
          <div style={{
            background: '#faf8f5',
            padding: '14px 20px 0',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <span style={{
              position: 'absolute', top: 14, left: 16,
              fontSize: 11, fontWeight: 600, color: '#aaa',
              letterSpacing: '0.06em',
            }}>
              EP {String(epNum).padStart(2, '0')}
            </span>
            <svg width="160" height="190" viewBox="0 0 160 190">
              <ellipse cx="80" cy="178" rx="52" ry="10" fill="#e8e2d8" opacity="0.6"/>
              <rect x="54" y="112" width="52" height="68" rx="8" fill="#f5e6d0"/>
              <rect x="44" y="120" width="18" height="48" rx="8" fill="#f5e6d0"/>
              <rect x="98" y="120" width="18" height="48" rx="8" fill="#f5e6d0"/>
              <rect x="57" y="148" width="46" height="36" rx="6" fill="#fff3e6" opacity="0.7"/>
              <rect x="54" y="110" width="52" height="10" rx="4" fill="#e8d5b8"/>
              <ellipse cx="80" cy="88" rx="30" ry="32" fill="#f5c89a"/>
              <path d="M50 78 Q52 50 80 47 Q108 50 110 78" fill="#6b3a1f"/>
              <path d="M54 74 Q57 60 62 66" fill="#7a4020" stroke="#5a2e10" strokeWidth="1"/>
              <path d="M106 74 Q103 60 98 66" fill="#7a4020" stroke="#5a2e10" strokeWidth="1"/>
              <ellipse cx="68" cy="85" rx="4.5" ry="5" fill="white"/>
              <ellipse cx="92" cy="85" rx="4.5" ry="5" fill="white"/>
              <ellipse cx="68" cy="86" rx="2.8" ry="3.2" fill="#3d2010"/>
              <ellipse cx="92" cy="86" rx="2.8" ry="3.2" fill="#3d2010"/>
              <ellipse cx="69" cy="85" rx="1" ry="1" fill="white"/>
              <ellipse cx="93" cy="85" rx="1" ry="1" fill="white"/>
              <path d="M74 96 Q80 101 86 96" stroke="#c47a5a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <ellipse cx="65" cy="94" rx="4.5" ry="2.5" fill="#f0a080" opacity="0.4"/>
              <ellipse cx="95" cy="94" rx="4.5" ry="2.5" fill="#f0a080" opacity="0.4"/>
              <rect x="62" y="112" width="36" height="4" rx="2" fill="#D4873A" opacity="0.5"/>
              <path d="M118 96 L133 83 L135 88 L139 82 L137 92 L132 89 Z" fill="#D4873A" opacity="0.9"/>
              <path d="M126 80 L130 67 L132 73 L136 67 L134 76 L129 73 Z" fill="#D4873A" opacity="0.7"/>
              <path d="M136 92 L149 83 L148 89 L153 85 L150 94 L145 91 Z" fill="#D4873A" opacity="0.6"/>
            </svg>
          </div>

          {/* Lower — white */}
          <div style={{
            background: '#fff',
            padding: '20px 20px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 500, color: '#1a1a1a', textAlign: 'center' }}>
              {ui.sv_ep_complete}
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#aaa', textAlign: 'center' }}>
              {story?.title ?? webtoonEpisode?.title ?? ''} · {story?.theme ?? webtoonEpisode?.theme ?? ''}
            </p>
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <Link
                href="/kpatto/story"
                style={{
                  flex: 1, height: 46, borderRadius: 12,
                  border: '1.5px solid #e0e0e0',
                  background: '#fff',
                  fontSize: 13, fontWeight: 600, color: '#444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  textDecoration: 'none',
                }}
              >
                {ui.sv_back}
              </Link>
              <Link
                href="/kpatto/progress"
                style={{
                  flex: 1, height: 46, borderRadius: 12,
                  border: 'none', background: '#D4873A',
                  fontSize: 13, fontWeight: 600, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  textDecoration: 'none',
                }}
              >
                {ui.sv_view_progress}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
