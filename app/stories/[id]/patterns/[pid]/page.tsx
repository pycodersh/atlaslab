import { notFound } from 'next/navigation'

import { PatternDetail } from '@/components/PatternDetail'
import { magazineStories } from '@/data/magazine-stories'
import { getPatternExamples } from '@/data/pattern-examples'

type Props = {
  params: Promise<{ id: string; pid: string }>
}

export function generateStaticParams() {
  return magazineStories.flatMap((s) =>
    s.patterns.map((p) => ({ id: String(s.id), pid: p.id })),
  )
}

export default async function PatternDetailPage({ params }: Props) {
  const { id, pid } = await params
  const story = magazineStories.find((s) => s.id === Number(id))
  const pattern = story?.patterns.find((p) => p.id === pid)

  if (!story || !pattern) notFound()

  // 예문 5개 — pattern-examples 우선, 없으면 storySentence/variationSentence로 폴백
  const fromData = getPatternExamples(pid)
  const examples =
    fromData.length > 0
      ? fromData
      : [
          { en: pattern.storySentence, ko: pattern.storySentenceKo },
          { en: pattern.variationSentence, ko: pattern.variationSentenceKo },
        ]

  return (
    <PatternDetail
      storyId={story.id}
      storyTitle={story.title}
      narratorVoice={story.narratorVoice}
      pattern={pattern}
      examples={examples}
    />
  )
}
