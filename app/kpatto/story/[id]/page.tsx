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
import { PatternSection } from '@/components/kpatto/PatternSection'
import { KPattoPaywall } from '@/components/kpatto/KPattoPaywall'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { ALL_STORIES } from '@/data/kpatto/sample-episode'
import { useKPattoSubscription } from '@/lib/kpatto/subscription'
import { WEBTOON_EPISODES } from '@/data/kpatto/episode-001-webtoon'
import { KPATTO_PATTERNS } from '@/data/kpatto/patterns'
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

// Build a pattern lookup map
const PATTERN_MAP = Object.fromEntries(KPATTO_PATTERNS.map(p => [p.id, p]))

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

const FREE_EPISODES = 5 // EP01~05 무료

export default function KPattoStoryPage({ params }: PageProps) {
  const { id } = use(params)
  const { prefs } = usePreferences()
  const ui = getUI(prefs.language)
  const router = useRouter()
  const searchParams = useSearchParams()
  const showWelcome = searchParams.get('welcome') === '1'
  const story = ALL_STORIES.find(s => s.id === id)
  const [challengeDone, setChallengeDone] = useState(false)
  const [challengeQuestions, setChallengeQuestions] = useState<Question[] | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const { isPro, loading: subLoading } = useKPattoSubscription()

  useEffect(() => {
    const pool = EPISODE_POOLS[id]
    if (pool) setChallengeQuestions(generateChallenge(pool))
  }, [id])

  const handleChallengeComplete = useCallback(() => {
    if (story) onStoryComplete(story.episode, story.title)
    setChallengeDone(true)
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, 300)
  }, [story])

  if (!story) notFound()

  const isLocked = story.episode > FREE_EPISODES && !subLoading && !isPro

  useEffect(() => {
    if (isLocked) setShowPaywall(true)
  }, [isLocked])

  // Map PATTO's Language type to KPattoLanguage (they share the same values)
  const displayLang = (prefs.language ?? 'en') as KPattoLanguage

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: KPATTO_TAB_BAR_HEIGHT + 32,
      maxWidth: 430,
      margin: '0 auto',
      background: '#FFFFFF',
    }}>
      {showPaywall && (
        <KPattoPaywall onDismiss={() => { setShowPaywall(false); router.back() }} />
      )}
      {/* Top bar — only for non-webtoon (classic) layout */}
      {!WEBTOON_EPISODES[id] && (
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
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            EP {String(story.episode).padStart(2, '0')} · {story.title}
          </div>
        </div>
      )}

      {/* Welcome banner (shown after pre-course completion) */}
      {showWelcome && <WelcomeBanner />}

      {/* Story panels — webtoon or classic layout */}
      <div>
        {WEBTOON_EPISODES[id] ? (
          <WebtoonEpisode
            episode={WEBTOON_EPISODES[id]}
            episodeLabel={`EP ${String(story.episode).padStart(2, '0')}`}
            storyTitle={story.title}
          />
        ) : (
          <div style={{ paddingTop: 16 }}>
            {story.panels.map((panel, index) => (
              <StoryPanel
                key={panel.id}
                panel={panel}
                panelIndex={index}
                patterns={PATTERN_MAP}
                displayLang={displayLang}
              />
            ))}
          </div>
        )}
      </div>

      {/* Patterns section */}
      <PatternSection tags={story.tags} patternMap={PATTERN_MAP} lang={displayLang} storyId={story.episode} episodeId={id} />

      {/* Challenge section */}
      {!challengeDone && challengeQuestions && (
        <ChallengeSection onComplete={handleChallengeComplete} questions={challengeQuestions} />
      )}

      {/* Completion footer — only after challenge */}
      {challengeDone && <div style={{
        margin: '24px 16px 0',
        background: 'linear-gradient(135deg, #FF6B8C 0%, #FF8C6B 100%)',
        borderRadius: 20,
        padding: '24px 20px',
        textAlign: 'center',
        color: '#fff',
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
        <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>{ui.sv_ep_complete}</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, opacity: 0.85 }}>
          {ui.sv_patterns_learned(story.tags.length)}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link
            href="/kpatto/story"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1.5px solid rgba(255,255,255,0.4)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              padding: '9px 18px',
              borderRadius: 99,
              textDecoration: 'none',
            }}
          >
            {ui.sv_back}
          </Link>
          <Link
            href="/kpatto/progress"
            style={{
              background: '#fff',
              color: '#FF6B8C',
              fontWeight: 700,
              fontSize: 13,
              padding: '9px 18px',
              borderRadius: 99,
              textDecoration: 'none',
            }}
          >
            {ui.sv_view_progress}
          </Link>
        </div>
      </div>}
    </div>
  )
}
