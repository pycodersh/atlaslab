import { notFound } from 'next/navigation'

import { StoryPageClient } from '@/components/StoryPageClient'
import { magazineStories } from '@/data/magazine-stories'
import { storyTranslations, type Lang } from '@/data/story-translations'
import { patternMeaningNoteTranslations, type PatternLang } from '@/data/pattern-meaning-note-translations'
import { patternExampleTranslationsBatch1 } from '@/data/pattern-example-translations-batch1'
import { patternExampleTranslationsBatch2 } from '@/data/pattern-example-translations-batch2'
import { patternExampleTranslationsBatch3 } from '@/data/pattern-example-translations-batch3'
import { getPatternExamples, type PracticeExample } from '@/data/pattern-examples'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ v?: string }>
}

export function generateStaticParams() {
  return magazineStories.map((s) => ({ id: String(s.id) }))
}

// All example translations merged into one lookup (computed once at module level)
const allExTrans = [
  ...patternExampleTranslationsBatch1,
  ...patternExampleTranslationsBatch2,
  ...patternExampleTranslationsBatch3,
]
const exTransByPatternId = Object.fromEntries(allExTrans.map(t => [t.patternId, t]))

// Normalize translation keys: zh-CN → zh-cn, zh-TW → zh-tw
function normalizeRecord(record: Partial<Record<string, string>>): Partial<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(record).map(([k, v]) => {
      const key = k === 'zh-CN' ? 'zh-cn' : k === 'zh-TW' ? 'zh-tw' : k
      return [key, v]
    })
  )
}

// 'zh-CN' → 'zh-cn', 'zh-TW' → 'zh-tw', others unchanged
function normalLang(lang: Lang): string {
  if (lang === 'zh-CN') return 'zh-cn'
  if (lang === 'zh-TW') return 'zh-tw'
  return lang
}

export default async function StoryDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { v }  = await searchParams
  const storyId = Number(id)
  const story   = magazineStories.find((s) => s.id === storyId)

  if (!story) notFound()

  // ── Story-level translations ─────────────────────────────────────────────
  const rawTrans = storyTranslations.find(t => t.storyId === storyId)

  // ── Pattern meaning translations ─────────────────────────────────────────
  const enrichedPatterns = story.patterns.map(p => {
    const meaningEntry = patternMeaningNoteTranslations.find(t => t.patternId === p.id)
    return {
      ...p,
      meaningTranslations: {
        ...p.meaningTranslations,
        ...normalizeRecord(meaningEntry?.meaningTranslations as Partial<Record<PatternLang, string>> ?? {}),
      },
    }
  })

  // ── Pattern example translations ──────────────────────────────────────────
  const patternExamples: Record<string, PracticeExample[]> = {}
  for (const p of story.patterns) {
    const fromData = getPatternExamples(p.id)
    const rawExamples: PracticeExample[] = fromData.length > 0
      ? fromData
      : [
          { en: p.storySentence, ko: p.storySentenceKo },
          { en: p.variationSentence, ko: p.variationSentenceKo },
        ]
    const exEntry = exTransByPatternId[p.id]
    patternExamples[p.id] = rawExamples.map((ex, i) => ({
      ...ex,
      translations: {
        ...ex.translations,
        ...normalizeRecord(exEntry?.examples[i]?.translations ?? {}),
      },
    }))
  }

  const enrichedStory = rawTrans ? {
    ...story,
    patterns: enrichedPatterns,
    subtitleTranslations: Object.fromEntries(
      (Object.entries(rawTrans.translations) as [Lang, { subtitle: string }][])
        .map(([lang, d]) => [normalLang(lang), d.subtitle])
    ),
    storyNoteTranslations: Object.fromEntries(
      (Object.entries(rawTrans.translations) as [Lang, { storyNote: string }][])
        .map(([lang, d]) => [normalLang(lang), d.storyNote])
    ),
    paragraphs: story.paragraphs.map(p => ({
      ...p,
      translations: {
        ...p.translations,
        ...Object.fromEntries(
          (Object.entries(rawTrans.translations) as [Lang, { paragraphs: { id: string; translation: string }[] }][])
            .flatMap(([lang, d]) => {
              const found = d.paragraphs.find(pt => pt.id === p.id)
              return found ? [[normalLang(lang), found.translation]] : []
            })
        ),
      },
    })),
  } : { ...story, patterns: enrichedPatterns }

  return (
    <StoryPageClient
      story={enrichedStory}
      allStories={magazineStories}
      initialView={v === 'p' ? 'patterns' : 'story'}
      patternExamples={patternExamples}
    />
  )
}
