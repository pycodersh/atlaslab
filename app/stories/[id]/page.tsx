import { notFound } from 'next/navigation'

import { StoryPageClient } from '@/components/StoryPageClient'
import { magazineStories } from '@/data/magazine-stories'
import { storyTranslations, type Lang } from '@/data/story-translations'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ v?: string }>
}

export function generateStaticParams() {
  return magazineStories.map((s) => ({ id: String(s.id) }))
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

  const rawTrans = storyTranslations.find(t => t.storyId === storyId)
  const enrichedStory = rawTrans ? {
    ...story,
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
  } : story

  return (
    <StoryPageClient
      story={enrichedStory}
      allStories={magazineStories}
      initialView={v === 'p' ? 'patterns' : 'story'}
    />
  )
}
