import { notFound } from 'next/navigation'

import { AppShell } from '@/components/app-shell'
import { SlideBottomNav } from '@/components/SlideBottomNav'
import { StoryCardEngine } from '@/components/StoryCardEngine'
import { getAllStories, getStoryByOrder, getTotalStoryCount } from '@/queries/stories'

type LearnStoryPageProps = {
  params: Promise<{ order: string }>
}

export default async function LearnStoryPage({ params }: LearnStoryPageProps) {
  const { order } = await params
  const orderIndex = Number(order)

  if (!Number.isInteger(orderIndex) || orderIndex < 1) {
    notFound()
  }

  const [story, totalStories, allStories] = await Promise.all([
    getStoryByOrder(orderIndex),
    getTotalStoryCount(),
    getAllStories(),
  ])

  if (!story) notFound()

  return (
    <>
      <AppShell hideNav>
        <StoryCardEngine
          allStories={allStories}
          story={story}
          totalStories={totalStories}
        />
      </AppShell>
      <SlideBottomNav />
    </>
  )
}
