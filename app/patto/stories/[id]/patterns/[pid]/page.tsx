import { notFound } from 'next/navigation'

import { PatternDetail } from '@/components/PatternDetail'
import { magazineStories } from '@/data/magazine-stories'
import { getPatternExamples } from '@/data/pattern-examples'
import { patternMeaningNoteTranslations, type PatternLang } from '@/data/pattern-meaning-note-translations'
import { patternExampleTranslationsBatch1 } from '@/data/pattern-example-translations-batch1'
import { patternExampleTranslationsBatch2 } from '@/data/pattern-example-translations-batch2'
import { patternExampleTranslationsBatch3 } from '@/data/pattern-example-translations-batch3'

type Props = {
  params: Promise<{ id: string; pid: string }>
}

// All example translations merged into one lookup
const allExTrans = [
  ...patternExampleTranslationsBatch1,
  ...patternExampleTranslationsBatch2,
  ...patternExampleTranslationsBatch3,
]
const exTransByPatternId = Object.fromEntries(allExTrans.map(t => [t.patternId, t]))

// PatternLang (zh-CN/zh-TW) → prefs language code (zh-cn/zh-tw)
function normalizeRecord(record: Partial<Record<string, string>>): Partial<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(record).map(([k, v]) => {
      const key = k === 'zh-CN' ? 'zh-cn' : k === 'zh-TW' ? 'zh-tw' : k
      return [key, v]
    })
  )
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

  // 학습 흐름: 현재 Pattern 위치 + 이전/다음 Pattern
  const patternIndex = story.patterns.findIndex((p) => p.id === pid)
  const total = story.patterns.length
  const prevPid = patternIndex > 0 ? story.patterns[patternIndex - 1].id : null
  const nextPid = patternIndex < total - 1 ? story.patterns[patternIndex + 1].id : null

  // 예문 5개 — pattern-examples 우선, 없으면 storySentence/variationSentence로 폴백
  const fromData = getPatternExamples(pid)
  const rawExamples =
    fromData.length > 0
      ? fromData
      : [
          { en: pattern.storySentence, ko: pattern.storySentenceKo },
          { en: pattern.variationSentence, ko: pattern.variationSentenceKo },
        ]

  // ── Inject meaning translations ──────────────────────────────────────────
  const meaningEntry = patternMeaningNoteTranslations.find(t => t.patternId === pid)
  const enrichedPattern = {
    ...pattern,
    meaningTranslations: {
      ...pattern.meaningTranslations,
      ...normalizeRecord(meaningEntry?.meaningTranslations as Partial<Record<PatternLang, string>> ?? {}),
    },
  }

  // ── Inject example translations ──────────────────────────────────────────
  const exEntry = exTransByPatternId[pid]
  const examples = rawExamples.map((ex, i) => ({
    ...ex,
    translations: {
      ...ex.translations,
      ...normalizeRecord(exEntry?.examples[i]?.translations ?? {}),
    },
  }))

  return (
    <PatternDetail
      storyId={story.id}
      storyTitle={story.title}
      narratorVoice={story.narratorVoice}
      pattern={enrichedPattern}
      examples={examples}
      patternIndex={patternIndex + 1}
      patternTotal={total}
      prevPid={prevPid}
      nextPid={nextPid}
    />
  )
}
