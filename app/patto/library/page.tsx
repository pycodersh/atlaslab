'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTrainerSafe } from '@/contexts/TrainerContext'
import { useRouter } from 'next/navigation'
import {
  Search, X, BookOpen, ChevronRight, ChevronDown,
  BookMarked, Layers, Plus, Sparkles, PenLine,
  MessageSquare, FileText,
} from 'lucide-react'

import { TopNav } from '@/components/TopNav'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { SwipeDeleteRow } from '@/components/SwipeDeleteRow'
import { magazineStories } from '@/data/magazine-stories'
import { getBookmarks, removeBookmark, type BookmarkedPattern } from '@/lib/bookmarks/storage'
import { getSavedWords, getSavedPhrases, removeSavedWord, removeSavedPhrase, type SavedWord, type SavedPhrase } from '@/lib/words/storage'
import { useT } from '@/hooks/useT'
import { useItemTranslation } from '@/hooks/useItemTranslation'
import { lookupPhraseMeaning } from '@/data/patto-phrase-dictionary'
import { lookupMeaning } from '@/data/patto-dictionary'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { useTheme } from '@/components/ThemeProvider'
import { EssayComposerPanel } from '@/components/essay/EssayComposerPanel'
import { EssayDetailPanel } from '@/components/essay/EssayDetailPanel'
import { type Essay, getEssays, getReviewsRemaining, deleteEssay } from '@/lib/essays/storage'
import { getPlan, FREE_REVIEW_LIFETIME, PREMIUM_REVIEW_DAILY } from '@/lib/subscription/storage'
import type { MagazinePattern } from '@/types/magazine'

// ── Types ──────────────────────────────────────────────────────────────────────

type LibSection = 'writing-studio' | 'saved-words' | 'saved-patterns' | 'my-sentences'

// ── Constants ──────────────────────────────────────────────────────────────────

const RECENT_KEY = 'patto-library-recent-searches'
const MAX_RECENT  = 5
const PREVIEW_WORDS    = 5
const PREVIEW_PHRASES  = 5
const PREVIEW_PATTERNS = 3

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[.,!?;:"\-–—()\[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function readRecentSearches(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') } catch { return [] }
}

function saveRecentSearch(q: string) {
  const prev = readRecentSearches().filter(s => s !== q)
  const next  = [q, ...prev].slice(0, MAX_RECENT)
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
}

function buildPatternIndex() {
  const out: { storyId: number; storyTitle: string; pattern: MagazinePattern }[] = []
  for (const story of magazineStories) {
    for (const pattern of story.patterns) {
      out.push({ storyId: story.id, storyTitle: story.title, pattern })
    }
  }
  return out
}

function sourceLabel(item: SavedWord | SavedPhrase): string {
  const parts: string[] = []
  if (item.storyId) parts.push(`Story ${String(item.storyId).padStart(2, '0')}`)
  if (item.patternId) parts.push(`Pattern ${item.patternId}`)
  if ((item as SavedWord).exampleIndex != null) parts.push(`Ex ${(item as SavedWord).exampleIndex! + 1}`)
  return parts.join(' · ')
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Styles ────────────────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'var(--pglass)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  borderRadius: 20,
  border: '1px solid var(--pglass-border)',
  boxShadow: '0 4px 18px rgba(40,50,80,0.07), 0 1px 4px rgba(40,50,80,0.03)',
  overflow: 'hidden',
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 9.5, fontWeight: 700, letterSpacing: '0.16em',
  color: '#8E8E93', margin: '0 0 8px 4px', textTransform: 'uppercase' as const,
}

const ROW_BORDER = '1px solid var(--pglass-border)'

function cardBase(isDark: boolean): React.CSSProperties {
  return {
    background: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: 16,
    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.8)',
    boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.20)' : '0 4px 18px rgba(40,40,60,0.06), 0 1px 4px rgba(40,40,60,0.03)',
  }
}

// ── Word/Phrase rows ──────────────────────────────────────────────────────────

function WordListRow({ w, first, onRemove }: { w: SavedWord; first: boolean; onRemove: () => void }) {
  const meaning = useItemTranslation('word', w.word, w.translations, w.meaning ?? lookupMeaning(w.word))
  return (
    <SwipeDeleteRow onDeleteRequest={onRemove} containerStyle={{ borderTop: first ? 'none' : ROW_BORDER }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px 12px 18px' }}>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: 'var(--pt)' }}>{w.word}</span>
        <span style={{ fontSize: 12, color: meaning ? 'var(--pm)' : 'var(--pd)', fontWeight: 400, textAlign: 'right', flexShrink: 0 }}>
          {meaning ?? '—'}
        </span>
      </div>
    </SwipeDeleteRow>
  )
}

function PhraseListRow({ ph, first, onRemove }: { ph: SavedPhrase; first: boolean; onRemove: () => void }) {
  const dictEntry = lookupPhraseMeaning(ph.phrase)
  const legacyMeaning = dictEntry?.meaning ?? (ph.meaningSource === 'dictionary' ? ph.meaning : undefined)
  const meaning = useItemTranslation('phrase', ph.phrase, ph.translations, legacyMeaning)
  return (
    <SwipeDeleteRow onDeleteRequest={onRemove} containerStyle={{ borderTop: first ? 'none' : ROW_BORDER }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px 12px 18px' }}>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: 'var(--pt)' }}>{ph.phrase}</span>
        {meaning && (
          <span style={{ fontSize: 12, color: 'var(--pm)', fontWeight: 400, textAlign: 'right', flexShrink: 0 }}>{meaning}</span>
        )}
      </div>
    </SwipeDeleteRow>
  )
}

// ── Pattern Accordion ─────────────────────────────────────────────────────────

function BookmarkedPatternRow({ bm, first, onPress, onRemove }: {
  bm: BookmarkedPattern; first: boolean; onPress: () => void; onRemove: () => void
}) {
  const meaning = useItemTranslation('pattern', bm.pattern, bm.translations, bm.meaningKo)
  return (
    <SwipeDeleteRow onDeleteRequest={onRemove} containerStyle={{ borderTop: first ? 'none' : ROW_BORDER }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button type="button" onClick={onPress} style={{
          flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
          padding: '11px 8px 11px 16px',
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)', margin: '0 0 2px', lineHeight: 1.35 }}>{bm.pattern}</p>
          {meaning && <p style={{ fontSize: 11, color: '#8E8E93', margin: 0, fontWeight: 400 }}>{meaning}</p>}
        </button>
      </div>
    </SwipeDeleteRow>
  )
}

function PatternAccordion({ storyId, storyTitle, patterns, onPress, onRemove }: {
  storyId: number; storyTitle: string; patterns: BookmarkedPattern[]
  onPress: (bm: BookmarkedPattern) => void; onRemove: (patternId: string) => void
}) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ ...glassCard, overflow: 'hidden', marginBottom: 8 }}>
      <button type="button" onClick={() => setOpen(v => !v)} style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: open ? ROW_BORDER : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', background: '#2C2C32', borderRadius: 7, padding: '2px 8px', letterSpacing: '0.04em' }}>
            S{String(storyId).padStart(2, '0')}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)' }}>{storyTitle}</span>
          <span style={{ fontSize: 10, color: '#B0B0B8', fontWeight: 500 }}>{patterns.length}</span>
        </div>
        <ChevronDown style={{ width: 14, height: 14, color: '#B0B0B8', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} strokeWidth={2} />
      </button>
      {open && (
        <div>
          {patterns.map((bm, i) => (
            <BookmarkedPatternRow key={bm.patternId} bm={bm} first={i === 0}
              onPress={() => onPress(bm)} onRemove={() => onRemove(bm.patternId)} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Search result rows ────────────────────────────────────────────────────────

function SearchWordRow({ w, border, onPress }: { w: SavedWord; border: boolean; onPress: () => void }) {
  const src = sourceLabel(w)
  const meaning = useItemTranslation('word', w.word, w.translations, w.meaning ?? lookupMeaning(w.word))
  return (
    <button type="button" onClick={onPress} style={{
      display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
      padding: '13px 18px', borderTop: border ? ROW_BORDER : 'none',
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)', margin: '0 0 2px' }}>{w.word}</p>
      {meaning && <p style={{ fontSize: 11, color: '#8E8E93', margin: '0 0 3px' }}>{meaning}</p>}
      <p style={{ fontSize: 10, color: '#B0B0B8', margin: 0, letterSpacing: '0.04em' }}>
        {src || w.originalSentence.slice(0, 50)}
      </p>
    </button>
  )
}

function SearchPhraseRow({ ph, border, onPress }: { ph: SavedPhrase; border: boolean; onPress: () => void }) {
  const src = sourceLabel(ph)
  return (
    <button type="button" onClick={onPress} style={{
      display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
      padding: '13px 18px', borderTop: border ? ROW_BORDER : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)', margin: 0 }}>{ph.phrase}</p>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#C08040', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {ph.phraseType === 'phrasalVerb' ? 'PHRASAL' : ph.phraseType === 'idiom' ? 'IDIOM' : ph.phraseType.toUpperCase()}
        </span>
      </div>
      <p style={{ fontSize: 10, color: '#B0B0B8', margin: 0, letterSpacing: '0.04em' }}>{src}</p>
    </button>
  )
}

function SearchPatternRow({ storyId, storyTitle, pattern, border, onPress }: {
  storyId: number; storyTitle: string; pattern: MagazinePattern; border: boolean; onPress: () => void
}) {
  const meaning = useItemTranslation('pattern', pattern.pattern, undefined, pattern.meaningKo)
  return (
    <button type="button" onClick={onPress} style={{
      display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none',
      padding: '13px 18px', borderTop: border ? ROW_BORDER : 'none', cursor: 'pointer',
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)', margin: '0 0 2px' }}>{pattern.pattern}</p>
      {meaning && <p style={{ fontSize: 11, color: '#8E8E93', margin: '0 0 3px' }}>{meaning}</p>}
      <p style={{ fontSize: 10, color: '#B0B0B8', margin: 0, letterSpacing: '0.04em' }}>
        Story {String(storyId).padStart(2, '0')} · {storyTitle}
      </p>
    </button>
  )
}

function SearchStoryRow({ story, border, onPress }: { story: { id: number; title: string }; border: boolean; onPress: () => void }) {
  return (
    <button type="button" onClick={onPress} style={{
      display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none',
      padding: '13px 18px', borderTop: border ? ROW_BORDER : 'none', cursor: 'pointer',
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#8E8E93', margin: '0 0 2px', letterSpacing: '0.06em' }}>
        STORY {String(story.id).padStart(2, '0')}
      </p>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)', margin: 0 }}>{story.title}</p>
    </button>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div style={{ ...glassCard, padding: '28px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        {icon}
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)', margin: 0, letterSpacing: '-0.01em' }}>{title}</p>
      </div>
      <p style={{ fontSize: 12, color: '#8E8E93', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{body}</p>
    </div>
  )
}

// ── SecLabel ──────────────────────────────────────────────────────────────────

function SecLabel({ label, count, unit, onViewAll }: { label: string; count?: number; unit?: string; onViewAll?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#6E6E73', textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {count != null && unit != null && (
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--pm)' }}>{count} {unit}</span>
        )}
        {onViewAll && (
          <button type="button" onClick={onViewAll} style={{
            display: 'flex', alignItems: 'center', gap: 2,
            fontSize: 11, fontWeight: 600, color: '#8E8E93',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            See all <ChevronRight style={{ width: 10, height: 10 }} strokeWidth={2.2} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Essay Card ────────────────────────────────────────────────────────────────

function EssayCard({ essay, onClick, isDark }: { essay: Essay; onClick: () => void; isDark: boolean }) {
  const isReviewed = Boolean(essay.review)
  return (
    <div
      role="button" tabIndex={0} onClick={onClick} onKeyDown={e => e.key === 'Enter' && onClick()}
      style={{ ...cardBase(isDark), padding: '11px 14px', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(40,40,60,0.09)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(40,40,60,0.06)' }}
    >
      <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--pt)', margin: '0 0 7px', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
        {essay.title || 'Untitled'}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {isReviewed ? (
          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#4A7A6A', background: 'rgba(100,180,155,0.10)', borderRadius: 6, padding: '2px 7px', border: '1px solid rgba(100,180,155,0.22)', display: 'inline-flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            <Sparkles style={{ width: 7, height: 7 }} strokeWidth={2} /> AI Reviewed
          </span>
        ) : (
          <span style={{ fontSize: 9.5, fontWeight: 600, color: '#A0A0A8', background: 'rgba(140,140,150,0.08)', borderRadius: 6, padding: '2px 7px', border: '1px solid rgba(140,140,150,0.16)', flexShrink: 0 }}>
            Draft
          </span>
        )}
        <span style={{ fontSize: 11, color: 'var(--pm)', fontWeight: 400, marginLeft: 'auto' }}>{fmtDate(essay.createdAt)}</span>
        <ChevronRight style={{ width: 10, height: 10, color: '#C0C0C5', flexShrink: 0 }} strokeWidth={2.2} />
      </div>
    </div>
  )
}

// ── Internal Section Tab Bar ──────────────────────────────────────────────────

const SECTION_TABS: { id: LibSection; label: string; icon: React.ReactNode }[] = [
  { id: 'writing-studio',  label: 'Writing Studio', icon: <PenLine style={{ width: 13, height: 13 }} strokeWidth={2} /> },
  { id: 'saved-words',     label: 'Saved Words',    icon: <BookOpen style={{ width: 13, height: 13 }} strokeWidth={2} /> },
  { id: 'saved-patterns',  label: 'Saved Patterns', icon: <BookMarked style={{ width: 13, height: 13 }} strokeWidth={2} /> },
  { id: 'my-sentences',    label: 'My Sentences',   icon: <MessageSquare style={{ width: 13, height: 13 }} strokeWidth={2} /> },
]

function SectionTabBar({ active, onChange }: { active: LibSection; onChange: (s: LibSection) => void }) {
  return (
    <div style={{
      display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2,
      scrollbarWidth: 'none',
      marginBottom: 20,
    }}>
      {SECTION_TABS.map(tab => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
              padding: '7px 13px',
              borderRadius: 999,
              fontSize: 12, fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--pa)' : '#8E8E93',
              background: isActive ? 'var(--pal)' : 'var(--pglass)',
              border: isActive ? '1px solid var(--pacb)' : '1px solid var(--pglass-border)',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.18s ease',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Writing Studio Section ────────────────────────────────────────────────────

function WritingStudioSection() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const isDesktop = useIsDesktop()
  const t = useT()
  const trainer = useTrainerSafe()

  const [essays, setEssays]     = useState<Essay[]>([])
  const [plan, setPlan]         = useState<'free' | 'premium'>('free')
  const [remaining, setRemaining] = useState(0)
  const [showAll, setShowAll]   = useState(false)
  const [activePanel, setActivePanel] = useState<'composer' | 'detail' | null>(null)
  const [selectedEssayId, setSelectedEssayId] = useState<string | null>(null)

  useEffect(() => {
    setEssays(getEssays())
    setPlan(getPlan())
    setRemaining(getReviewsRemaining())
  }, [])

  useEffect(() => {
    if (activePanel === 'composer') trainer?.setSilent(true)
    else trainer?.setSilent(false)
  }, [activePanel]) // eslint-disable-line react-hooks/exhaustive-deps

  function refreshEssays() {
    setEssays(getEssays())
    setRemaining(getReviewsRemaining())
  }

  function openComposer() {
    if (isDesktop) { setActivePanel('composer'); setSelectedEssayId(null) }
    else router.push('/patto/essays/new')
  }

  function openDetail(id: string) {
    if (isDesktop) { setActivePanel('detail'); setSelectedEssayId(id) }
    else router.push(`/patto/essays/${id}`)
  }

  function closePanel() { setActivePanel(null); setSelectedEssayId(null) }

  const INITIAL_SHOW = 6
  const maxReviews = plan === 'premium' ? PREMIUM_REVIEW_DAILY : FREE_REVIEW_LIFETIME
  const displayed = showAll ? essays : essays.slice(0, INITIAL_SHOW)
  const hasMore = essays.length > INITIAL_SHOW

  return (
    <div>
      {/* New Essay button */}
      <button
        type="button"
        onClick={openComposer}
        style={{
          ...cardBase(isDark),
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '13px 0', marginBottom: 10, cursor: 'pointer',
          transition: 'transform 0.18s, box-shadow 0.18s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(40,40,80,0.09)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(40,40,60,0.06)' }}
      >
        <Plus style={{ width: 14, height: 14, color: '#8E8E93' }} strokeWidth={2.5} />
        <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.8)' : 'var(--pm)', letterSpacing: '-0.01em' }}>
          {t('essays_new')}
        </span>
      </button>

      {/* AI Reviews remaining */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#6E6E73', textTransform: 'uppercase' }}>
          AI Reviews
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: remaining === 0 ? '#B0B0B8' : '#4A7A6A' }}>
          {remaining} / {maxReviews}{plan === 'premium' ? ' Today' : ' Lifetime'}
        </span>
      </div>

      {/* Desktop: composer/detail panel */}
      {isDesktop && activePanel === 'composer' && (
        <EssayComposerPanel
          onClose={closePanel}
          onSaved={(essay) => {
            refreshEssays()
            setActivePanel('detail')
            setSelectedEssayId(essay.id)
          }}
          onReviewed={(id) => {
            refreshEssays()
            setActivePanel('detail')
            setSelectedEssayId(id)
            trainer?.setSilent(false)
            setTimeout(() => trainer?.showMessage('Ready for feedback?', 3000), 400)
          }}
        />
      )}
      {isDesktop && activePanel === 'detail' && selectedEssayId && (
        <EssayDetailPanel id={selectedEssayId} onClose={closePanel} onDeleted={refreshEssays} />
      )}

      {/* Essay list */}
      {essays.length > 0 ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#6E6E73', margin: 0, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              My Essays
            </p>
            <span style={{ fontSize: 12, color: 'var(--pm)', fontWeight: 500 }}>{essays.length} Essays</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {displayed.map(essay => (
              <SwipeDeleteRow
                key={essay.id}
                onDeleteRequest={() => { deleteEssay(essay.id); setEssays(prev => prev.filter(e => e.id !== essay.id)) }}
                containerStyle={{ borderRadius: 16 }}
                contentBg="transparent"
              >
                <EssayCard essay={essay} onClick={() => openDetail(essay.id)} isDark={isDark} />
              </SwipeDeleteRow>
            ))}
          </div>
          {hasMore && (
            <button type="button" onClick={() => setShowAll(v => !v)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, width: '100%', marginTop: 12, padding: '11px 0',
              background: 'var(--pglass)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--pglass-border)', borderRadius: 14, cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: '#8E8E93', transition: 'opacity 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.75' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              {showAll ? t('essays_collapse') : t('essays_show_more', { n: essays.length - INITIAL_SHOW })}
            </button>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 24,
            background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.45)',
            backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.7)',
            boxShadow: '0 6px 20px rgba(40,40,60,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px',
          }}>
            <PenLine size={32} strokeWidth={1.5} color="var(--pm)" />
          </div>
          <p style={{ fontSize: 14, color: '#8E8E93', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>
            {t('essays_empty')}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Saved Words Section ───────────────────────────────────────────────────────

function SavedWordsSection({
  words, phrases, onRemoveWord, onRemovePhrase,
}: {
  words: SavedWord[]; phrases: SavedPhrase[];
  onRemoveWord: (id: string) => void; onRemovePhrase: (id: string) => void;
}) {
  const t = useT()
  const [showAllWords, setShowAllWords]     = useState(false)
  const [showAllPhrases, setShowAllPhrases] = useState(false)

  return (
    <div>
      <section style={{ marginBottom: 28 }}>
        <SecLabel label="Saved Words" count={words.length} unit="Words" />
        {words.length === 0 ? (
          <EmptyState icon={<BookOpen style={{ width: 24, height: 24, color: '#3A7A4A' }} strokeWidth={1.6} />} title="No saved words yet." body={t('sec_saved_words')} />
        ) : (
          <>
            <div style={glassCard}>
              {(showAllWords ? words : words.slice(0, PREVIEW_WORDS)).map((w, i) => (
                <WordListRow key={w.id} w={w} first={i === 0} onRemove={() => onRemoveWord(w.id)} />
              ))}
            </div>
            {words.length > PREVIEW_WORDS && (
              <button type="button" onClick={() => setShowAllWords(v => !v)} style={{
                display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, padding: 0,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, color: '#8E8E93', fontFamily: 'inherit',
              }}>
                {showAllWords ? 'Show less' : `Show all ${words.length} Words`}
                {!showAllWords && <ChevronRight style={{ width: 11, height: 11 }} strokeWidth={2.2} />}
              </button>
            )}
          </>
        )}
      </section>

      <section style={{ marginBottom: 28 }}>
        <SecLabel label="Saved Phrases" count={phrases.length} unit="Phrases" />
        {phrases.length === 0 ? (
          <EmptyState icon={<Layers style={{ width: 24, height: 24, color: '#C08040' }} strokeWidth={1.6} />} title="No saved phrases yet." body={t('sec_saved_words')} />
        ) : (
          <>
            <div style={glassCard}>
              {(showAllPhrases ? phrases : phrases.slice(0, PREVIEW_PHRASES)).map((ph, i) => (
                <PhraseListRow key={ph.id} ph={ph} first={i === 0} onRemove={() => onRemovePhrase(ph.id)} />
              ))}
            </div>
            {phrases.length > PREVIEW_PHRASES && (
              <button type="button" onClick={() => setShowAllPhrases(v => !v)} style={{
                display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, padding: 0,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, color: '#8E8E93', fontFamily: 'inherit',
              }}>
                {showAllPhrases ? 'Show less' : `Show all ${phrases.length} Phrases`}
                {!showAllPhrases && <ChevronRight style={{ width: 11, height: 11 }} strokeWidth={2.2} />}
              </button>
            )}
          </>
        )}
      </section>
    </div>
  )
}

// ── Saved Patterns Section ────────────────────────────────────────────────────

function SavedPatternsSection({
  bookmarks, bookmarksByStory, onPress, onRemove,
}: {
  bookmarks: BookmarkedPattern[];
  bookmarksByStory: [number, BookmarkedPattern[]][];
  onPress: (bm: BookmarkedPattern) => void;
  onRemove: (patternId: string) => void;
}) {
  const [showAll, setShowAll] = useState(false)

  return (
    <section style={{ marginBottom: 28 }}>
      <SecLabel label="Saved Patterns" count={bookmarks.length} unit="Patterns" />
      {bookmarks.length === 0 ? (
        <EmptyState icon={<BookMarked style={{ width: 24, height: 24, color: 'var(--pa)' }} strokeWidth={1.6} />} title="No saved patterns yet." body="패턴 카드의 북마크 버튼을 눌러 패턴을 저장해보세요." />
      ) : showAll ? (
        <>
          {bookmarksByStory.map(([storyId, storyBms]) => {
            const story = magazineStories.find(s => s.id === storyId)
            return (
              <PatternAccordion key={storyId} storyId={storyId}
                storyTitle={story ? story.title : `Story ${String(storyId).padStart(2, '0')}`}
                patterns={storyBms} onPress={onPress} onRemove={onRemove} />
            )
          })}
          <button type="button" onClick={() => setShowAll(false)} style={{
            display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, padding: 0,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, color: '#8E8E93', fontFamily: 'inherit',
          }}>Show less</button>
        </>
      ) : (
        <>
          <div style={glassCard}>
            {bookmarks.slice(0, PREVIEW_PATTERNS).map((bm, i) => (
              <BookmarkedPatternRow key={bm.patternId} bm={bm} first={i === 0}
                onPress={() => onPress(bm)} onRemove={() => onRemove(bm.patternId)} />
            ))}
          </div>
          {bookmarks.length > PREVIEW_PATTERNS && (
            <button type="button" onClick={() => setShowAll(true)} style={{
              display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, padding: 0,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: '#8E8E93', fontFamily: 'inherit',
            }}>
              {`Show all ${bookmarks.length} Patterns`}
              <ChevronRight style={{ width: 11, height: 11 }} strokeWidth={2.2} />
            </button>
          )}
        </>
      )}
    </section>
  )
}

// ── My Sentences Section ──────────────────────────────────────────────────────

function MySentencesSection() {
  return (
    <section style={{ marginBottom: 28 }}>
      <SecLabel label="My Sentences" />
      <EmptyState
        icon={<FileText style={{ width: 24, height: 24, color: 'var(--pa)' }} strokeWidth={1.6} />}
        title="아직 문장이 없어요."
        body={'챌린지에서 직접 쓴 문장과\nWriting Studio의 글이 여기에 모여요.'}
      />
    </section>
  )
}

// ── Inner page (uses useSearchParams) ────────────────────────────────────────

function LibraryPageInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const inputRef     = useRef<HTMLInputElement>(null)

  const [section, setSection]     = useState<LibSection>('writing-studio')
  const [query, setQuery]         = useState('')
  const [bookmarks, setBookmarks] = useState<BookmarkedPattern[]>([])
  const [words, setWords]         = useState<SavedWord[]>([])
  const [phrases, setPhrases]     = useState<SavedPhrase[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [focused, setFocused]     = useState(false)
  const trainer = useTrainerSafe()

  useEffect(() => { trainer?.setPage('library') }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const tab = searchParams.get('tab') as LibSection | null
    if (tab && ['writing-studio', 'saved-words', 'saved-patterns', 'my-sentences'].includes(tab)) {
      setSection(tab)
    }
  }, [searchParams])

  useEffect(() => {
    setBookmarks(getBookmarks())
    setWords(getSavedWords())
    setPhrases(getSavedPhrases())
    setRecentSearches(readRecentSearches())
  }, [])

  const patternIndex = useMemo(() => buildPatternIndex(), [])

  const bookmarksByStory = useMemo(() => {
    const map = new Map<number, BookmarkedPattern[]>()
    for (const bm of bookmarks) {
      if (!map.has(bm.storyId)) map.set(bm.storyId, [])
      map.get(bm.storyId)!.push(bm)
    }
    return [...map.entries()].sort(([a], [b]) => a - b)
  }, [bookmarks])

  const isSearching = query.trim().length > 0
  const nq = normalize(query)
  const showRecent = focused && !isSearching && recentSearches.length > 0
  const showSearchBar = section === 'saved-words' || section === 'saved-patterns'

  const searchResults = useMemo(() => {
    if (!nq) return { words: [], phrases: [], patterns: [], stories: [] }
    const match = (s: string) => normalize(s).includes(nq)
    return {
      words: words.filter(w => match(w.word) || match(w.meaning ?? '') || match(w.originalSentence)),
      phrases: phrases.filter(ph => match(ph.phrase) || match(ph.originalSentence)),
      patterns: patternIndex.filter(({ pattern }) =>
        match(pattern.pattern) || match(pattern.meaningKo) || match(pattern.explanation ?? '') || match(pattern.storySentence) || match(pattern.variationSentence)
      ).slice(0, 20),
      stories: magazineStories.filter(s =>
        match(s.title) || normalize(`story ${s.id}`).includes(nq) || normalize(`s${String(s.id).padStart(2, '0')}`).includes(nq)
      ).slice(0, 10),
    }
  }, [patternIndex, words, phrases, nq])

  const hasResults = searchResults.words.length > 0 || searchResults.phrases.length > 0
    || searchResults.patterns.length > 0 || searchResults.stories.length > 0

  function submitSearch(q: string) {
    if (!q.trim()) return
    saveRecentSearch(q.trim())
    setRecentSearches(readRecentSearches())
  }

  function handleRemoveBookmark(patternId: string) {
    removeBookmark(patternId)
    setBookmarks(prev => prev.filter(b => b.patternId !== patternId))
    trainer?.showMessage('Removed.', 1800)
  }

  function handleRemoveWord(id: string) {
    removeSavedWord(id)
    setWords(prev => prev.filter(w => w.id !== id))
    trainer?.showMessage('Removed.', 1800)
  }

  function handleRemovePhrase(id: string) {
    removeSavedPhrase(id)
    setPhrases(prev => prev.filter(p => p.id !== id))
    trainer?.showMessage('Removed.', 1800)
  }

  const colPad: React.CSSProperties = {
    paddingTop: 7, paddingLeft: 20, paddingRight: 20,
    paddingBottom: TAB_BAR_HEIGHT + 32, boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100dvh', overflowY: 'auto' }}>
      <TopNav />
      <div className="desktop-max">
        <div style={colPad}>

          {/* Search bar (only on saved-words / saved-patterns tabs) */}
          {showSearchBar && (
            <div style={{ marginBottom: isSearching || showRecent ? 0 : 16 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--pglass)', backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderRadius: 16, padding: '14px 14px 14px 18px',
                border: focused ? '1px solid var(--pacb)' : '1px solid var(--pglass-border)',
                boxShadow: focused ? '0 4px 20px rgba(109,141,255,0.10)' : '0 4px 16px rgba(40,50,80,0.07)',
                transition: 'border 0.2s, box-shadow 0.2s',
              }}>
                <Search style={{ width: 16, height: 16, color: '#8E8E93', flexShrink: 0 }} strokeWidth={2} />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 150)}
                  onKeyDown={e => { if (e.key === 'Enter') submitSearch(query) }}
                  placeholder="words, phrases, patterns, stories..."
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--pt)', fontWeight: 400, caretColor: 'var(--pa)' }}
                />
                {query && (
                  <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus() }}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
                    <X style={{ width: 14, height: 14, color: '#8E8E93' }} strokeWidth={2} />
                  </button>
                )}
              </div>

              {showRecent && (
                <div style={{ padding: '12px 4px 16px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.10em', color: '#B0B0B8', textTransform: 'uppercase', alignSelf: 'center', marginRight: 2 }}>Recent</span>
                  {recentSearches.map(s => (
                    <button key={s} type="button"
                      onClick={() => { setQuery(s); submitSearch(s); inputRef.current?.focus() }}
                      style={{ fontSize: 12, fontWeight: 500, color: 'var(--pa)', background: 'var(--pal)', border: '1px solid var(--pacb)', borderRadius: 999, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {isSearching && (
                <div style={{ marginTop: 12, marginBottom: 24 }}>
                  {!hasResults ? (
                    <div style={{ ...glassCard, padding: '30px 22px', textAlign: 'center' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)', margin: '0 0 8px' }}>No matching results found.</p>
                      <p style={{ fontSize: 12, color: '#8E8E93', margin: 0, lineHeight: 1.7 }}>Try a different keyword</p>
                    </div>
                  ) : (
                    <>
                      {searchResults.words.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <p style={SECTION_LABEL}>Words · {searchResults.words.length}</p>
                          <div style={glassCard}>
                            {searchResults.words.map((w, i) => <SearchWordRow key={w.id} w={w} border={i > 0} onPress={() => { if (w.storyId) router.push(`/patto/stories/${w.storyId}`) }} />)}
                          </div>
                        </div>
                      )}
                      {searchResults.phrases.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <p style={SECTION_LABEL}>Phrases · {searchResults.phrases.length}</p>
                          <div style={glassCard}>
                            {searchResults.phrases.map((ph, i) => <SearchPhraseRow key={ph.id} ph={ph} border={i > 0} onPress={() => { if (ph.storyId && ph.patternId) router.push(`/patto/stories/${ph.storyId}?v=p`); else if (ph.storyId) router.push(`/patto/stories/${ph.storyId}`) }} />)}
                          </div>
                        </div>
                      )}
                      {searchResults.patterns.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <p style={SECTION_LABEL}>Patterns · {searchResults.patterns.length}</p>
                          <div style={glassCard}>
                            {searchResults.patterns.map((r, i) => <SearchPatternRow key={r.pattern.id} storyId={r.storyId} storyTitle={r.storyTitle} pattern={r.pattern} border={i > 0} onPress={() => router.push(`/patto/stories/${r.storyId}?v=p`)} />)}
                          </div>
                        </div>
                      )}
                      {searchResults.stories.length > 0 && (
                        <div>
                          <p style={SECTION_LABEL}>Stories · {searchResults.stories.length}</p>
                          <div style={glassCard}>
                            {searchResults.stories.map((s, i) => <SearchStoryRow key={s.id} story={s} border={i > 0} onPress={() => router.push(`/patto/stories/${s.id}`)} />)}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Internal section tabs */}
          <SectionTabBar active={section} onChange={s => { setSection(s); setQuery('') }} />

          {/* Section content */}
          {section === 'writing-studio' && <WritingStudioSection />}

          {section === 'saved-words' && !isSearching && (
            <SavedWordsSection
              words={words} phrases={phrases}
              onRemoveWord={handleRemoveWord} onRemovePhrase={handleRemovePhrase}
            />
          )}

          {section === 'saved-patterns' && !isSearching && (
            <SavedPatternsSection
              bookmarks={bookmarks} bookmarksByStory={bookmarksByStory}
              onPress={bm => router.push(`/patto/stories/${bm.storyId}?v=p`)}
              onRemove={handleRemoveBookmark}
            />
          )}

          {section === 'my-sentences' && <MySentencesSection />}

        </div>
      </div>
    </div>
  )
}

// ── Page export (Suspense boundary for useSearchParams) ───────────────────────

export default function LibraryPage() {
  return (
    <Suspense fallback={null}>
      <LibraryPageInner />
    </Suspense>
  )
}
