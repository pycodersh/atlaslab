import { notFound } from 'next/navigation'

import { MagazineEngine } from '@/components/MagazineEngine'
import { magazineStories } from '@/data/magazine-stories'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ v?: string }>
}

export function generateStaticParams() {
  return magazineStories.map((s) => ({ id: String(s.id) }))
}

export default async function StoryDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { v } = await searchParams
  const storyId = Number(id)
  const story = magazineStories.find((s) => s.id === storyId)

  if (!story) notFound()

  return (
    <MagazineEngine
      story={story}
      allStories={magazineStories}
      initialView={v === 'p' ? 'patterns' : 'story'}
    />
  )
}
