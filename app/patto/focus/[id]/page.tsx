import { notFound } from 'next/navigation'
import { magazineStories } from '@/data/magazine-stories'
import { FocusMode } from '@/components/FocusMode'

type Props = {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return magazineStories.map((s) => ({ id: String(s.id) }))
}

export default async function FocusPage({ params }: Props) {
  const { id } = await params
  const story = magazineStories.find((s) => s.id === Number(id))

  if (!story) notFound()

  return <FocusMode story={story} />
}
