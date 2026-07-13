import { notFound } from 'next/navigation'
import { magazineStories } from '@/data/magazine-stories'
import { SlideSession } from '@/components/SlideSession'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ guided?: string }>
}

export function generateStaticParams() {
  return magazineStories.map((s) => ({ id: String(s.id) }))
}

export default async function SessionPage({ params, searchParams }: Props) {
  const { id }     = await params
  const { guided } = await searchParams
  const storyId = Number(id)
  const story   = magazineStories.find((s) => s.id === storyId)

  if (!story) notFound()

  return (
    <SlideSession
      story={story}
      isGuided={guided === 'true'}
    />
  )
}
