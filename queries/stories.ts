import { createClient } from '@/lib/supabase/server'
import type { Difficulty, PatternWithExamples, PatternExample } from '@/types/pattern'
import type { StoryWithPatterns } from '@/types/story'

const UI_LANG = 'ko'

export async function getStoryByOrder(orderIndex: number): Promise<StoryWithPatterns | null> {
  const supabase = await createClient()

  // 1. 스토리 기본 정보
  const { data: storyRow, error: storyError } = await supabase
    .from('stories')
    .select(`
      id, level, order_index,
      story_translations!inner(title, description),
      story_patterns(
        order_index,
        pattern_id
      )
    `)
    .eq('is_published', true)
    .eq('order_index', orderIndex)
    .eq('story_translations.ui_lang', UI_LANG)
    .single()

  if (storyError || !storyRow) return null

  const storyTranslation = (storyRow.story_translations as { title: string; description: string | null }[])[0]
  const storyPatterns = (storyRow.story_patterns as { order_index: number; pattern_id: string }[])
    .sort((a, b) => a.order_index - b.order_index)

  const patternIds = storyPatterns.map((sp) => sp.pattern_id)

  // 2. 패턴 + 번역 + 이미지
  const { data: patternRows, error: patternError } = await supabase
    .from('patterns')
    .select(`
      id, level, order_index,
      pattern_translations!inner(pattern_text, meaning),
      pattern_images(storage_key)
    `)
    .in('id', patternIds)
    .eq('pattern_translations.ui_lang', UI_LANG)

  if (patternError || !patternRows) return null

  // 3. 예문 + 번역
  const { data: exampleRows, error: exampleError } = await supabase
    .from('examples')
    .select(`
      id, pattern_id, difficulty, order_index, sentence, audio_url,
      example_translations!inner(translation)
    `)
    .in('pattern_id', patternIds)
    .order('order_index')

  if (exampleError || !exampleRows) return null

  // 4. 조립
  const examplesByPattern = new Map<string, PatternExample[]>()
  for (const ex of exampleRows) {
    const translation = (ex.example_translations as { translation: string }[] | null)?.[0]?.translation ?? null
    const item: PatternExample = {
      id: ex.id,
      pattern_id: ex.pattern_id,
      difficulty: ex.difficulty as Difficulty,
      order_index: ex.order_index,
      sentence: ex.sentence,
      translation,
      audio_url: ex.audio_url ?? null,
    }
    if (!examplesByPattern.has(ex.pattern_id)) {
      examplesByPattern.set(ex.pattern_id, [])
    }
    examplesByPattern.get(ex.pattern_id)!.push(item)
  }

  const patternMap = new Map(patternRows.map((p) => [p.id, p]))

  const patterns: PatternWithExamples[] = storyPatterns.map((sp) => {
    const p = patternMap.get(sp.pattern_id)!
    const trans = (p.pattern_translations as { pattern_text: string; meaning: string }[])[0]
    const image = (p.pattern_images as { storage_key: string }[] | null)?.[0] ?? null
    const allExamples = examplesByPattern.get(p.id) ?? []

    const grouped: Record<Difficulty, PatternExample[]> = {
      normal:   allExamples.filter((e) => e.difficulty === 'normal'),
      advanced: allExamples.filter((e) => e.difficulty === 'advanced'),
      native:   allExamples.filter((e) => e.difficulty === 'native'),
    }

    return {
      id: p.id,
      level: p.level as 1 | 2 | 3,
      order_index: p.order_index,
      pattern_text: trans.pattern_text,
      meaning: trans.meaning,
      image_url: image ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/patto-assets/${image.storage_key}` : null,
      examples: grouped,
    }
  })

  return {
    id: storyRow.id,
    level: storyRow.level as 1 | 2 | 3,
    order_index: storyRow.order_index,
    title: storyTranslation.title,
    description: storyTranslation.description,
    mini_story: buildMiniStory(patterns),
    patterns,
  }
}

export async function getTotalStoryCount(): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)
  return count ?? 0
}

// 패턴 5개의 normal 예문 1번씩 연결해서 미니스토리 생성
function buildMiniStory(patterns: PatternWithExamples[]): string {
  return patterns
    .map((p) => p.examples.normal[0]?.sentence ?? '')
    .filter(Boolean)
    .join(' ')
}
